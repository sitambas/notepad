const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Database = require('./database/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3010', 'http://localhost:8080', 'https://notepad.pw'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize database
const db = new Database();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX files are allowed.'), false);
    }
  }
});

// Validation middleware
const validateNote = [
  body('key').isLength({ min: 1 }).withMessage('Key is required'),
  body('pad').optional().isString(),
  body('pw').optional().isString(),
  body('url').optional().isString(),
  body('monospace').optional().isIn(['0', '1']),
  body('caret').optional().isInt({ min: 0 })
];

// API Routes

// Save note endpoint
app.post('/api/save', validateNote, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { key, pad = '', pw = '', url = '', monospace = '0', caret = 0 } = req.body;
    
    // Generate note ID from key or URL
    const noteId = key || url || generateNoteId();
    
    // Hash password if provided
    const hashedPassword = pw ? await hashPassword(pw) : null;
    const isEncrypted = !!pw;

    // Save to database
    const result = await db.saveNote({
      id: noteId,
      content: pad,
      password: hashedPassword,
      isEncrypted: isEncrypted,
      monospace: monospace === '1',
      caret: parseInt(caret),
      url: url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      key: noteId,
      url: url,
      message: 'Note saved successfully'
    });

  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save note' 
    });
  }
});

// Load note endpoint
app.get('/api/load/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pw } = req.query;

    const note = await db.getNote(id);
    
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        error: 'Note not found' 
      });
    }

    // If note is encrypted, verify password
    if (note.isEncrypted) {
      if (!pw) {
        return res.json({
          success: true,
          key: id,
          pad: '',
          pw: '1', // Indicates password required
          url: note.url || '',
          monospace: note.monospace ? '1' : '0',
          caret: note.caret || 0
        });
      }

      const isValidPassword = await verifyPassword(pw, note.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid password' 
        });
      }
    }

    // Get files for this note
    const files = await db.getFiles(id);

    res.json({
      success: true,
      key: id,
      pad: note.content,
      pw: note.isEncrypted ? '1' : '0',
      url: note.url || '',
      monospace: note.monospace ? '1' : '0',
      caret: note.caret || 0,
      files: files
    });

  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load note' 
    });
  }
});

// Delete note endpoint
app.delete('/api/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pw } = req.query;

    const note = await db.getNote(id);
    
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        error: 'Note not found' 
      });
    }

    // If note is encrypted, verify password
    if (note.isEncrypted && pw) {
      const isValidPassword = await verifyPassword(pw, note.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid password' 
        });
      }
    }

    await db.deleteNote(id);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete note' 
    });
  }
});

// File upload endpoint
app.post('/api/upload/:noteId', upload.array('files', 10), async (req, res) => {
  try {
    const { noteId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Check if note exists
    const note = await db.getNote(noteId);
    if (!note) {
      // Clean up uploaded files if note doesn't exist
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    const savedFiles = [];
    
    for (const file of files) {
      const fileId = uuidv4();
      const fileData = {
        id: fileId,
        noteId: noteId,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size
      };

      await db.saveFile(fileData);
      savedFiles.push({
        id: fileId,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size
      });
    }

    res.json({
      success: true,
      files: savedFiles,
      message: `${savedFiles.length} file(s) uploaded successfully`
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up any uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
});

// Get files for a note
app.get('/api/files/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const files = await db.getFiles(noteId);
    
    res.json({
      success: true,
      files: files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get files'
    });
  }
});

// Download file
app.get('/api/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const file = await db.getFile(fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on disk'
      });
    }

    res.download(file.filePath, file.originalName);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

// Delete file
app.delete('/api/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const file = await db.getFile(fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Delete file record from database
    await db.deleteFile(fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Utility functions
function generateNoteId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hashedPassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hashedPassword);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
