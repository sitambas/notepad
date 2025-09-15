const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'notepad.db'));
    this.init();
  }

  init() {
    const createNotesTableQuery = `
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL DEFAULT '',
        password TEXT,
        isEncrypted BOOLEAN DEFAULT 0,
        monospace BOOLEAN DEFAULT 0,
        caret INTEGER DEFAULT 0,
        url TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createFilesTableQuery = `
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        noteId TEXT NOT NULL,
        originalName TEXT NOT NULL,
        fileName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (noteId) REFERENCES notes (id) ON DELETE CASCADE
      )
    `;

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        avatar TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createNotesTableQuery, (err) => {
      if (err) {
        console.error('Error creating notes table:', err);
      }
    });

    this.db.run(createFilesTableQuery, (err) => {
      if (err) {
        console.error('Error creating files table:', err);
      }
    });

    this.db.run(createUsersTableQuery, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('✅ Database initialized successfully');
      }
    });
  }

  saveNote(noteData) {
    return new Promise((resolve, reject) => {
      const { id, content, password, isEncrypted, monospace, caret, url, createdAt, updatedAt } = noteData;
      
      const query = `
        INSERT OR REPLACE INTO notes 
        (id, content, password, isEncrypted, monospace, caret, url, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        id, content, password, isEncrypted, monospace, caret, url, createdAt, updatedAt
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  getNote(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM notes WHERE id = ?';
      
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  deleteNote(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM notes WHERE id = ?';
      
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  getAllNotes(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM notes ORDER BY updatedAt DESC LIMIT ? OFFSET ?';
      
      this.db.all(query, [limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  searchNotes(searchTerm, limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM notes 
        WHERE content LIKE ? OR id LIKE ? OR url LIKE ?
        ORDER BY updatedAt DESC 
        LIMIT ?
      `;
      
      const searchPattern = `%${searchTerm}%`;
      
      this.db.all(query, [searchPattern, searchPattern, searchPattern, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  getStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as totalNotes,
          COUNT(CASE WHEN isEncrypted = 1 THEN 1 END) as encryptedNotes,
          COUNT(CASE WHEN isEncrypted = 0 THEN 1 END) as publicNotes,
          MAX(updatedAt) as lastUpdated
        FROM notes
      `;
      
      this.db.get(query, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || {});
        }
      });
    });
  }

  // File management methods
  saveFile(fileData) {
    return new Promise((resolve, reject) => {
      const { id, noteId, originalName, fileName, filePath, mimeType, size } = fileData;
      
      const query = `
        INSERT INTO files 
        (id, noteId, originalName, fileName, filePath, mimeType, size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        id, noteId, originalName, fileName, filePath, mimeType, size
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  getFiles(noteId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM files WHERE noteId = ? ORDER BY createdAt ASC';
      
      this.db.all(query, [noteId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  getFile(fileId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM files WHERE id = ?';
      
      this.db.get(query, [fileId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  deleteFile(fileId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM files WHERE id = ?';
      
      this.db.run(query, [fileId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  deleteFilesByNoteId(noteId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM files WHERE noteId = ?';
      
      this.db.run(query, [noteId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // User authentication methods
  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { id, email, username, password, firstName, lastName, avatar } = userData;
      const query = `
        INSERT INTO users (id, email, username, password, firstName, lastName, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [id, email, username, password, firstName, lastName, avatar], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ? AND isActive = 1';
      
      this.db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ? AND isActive = 1';
      
      this.db.get(query, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ? AND isActive = 1';
      
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  updateUser(id, userData) {
    return new Promise((resolve, reject) => {
      const { email, username, firstName, lastName, avatar } = userData;
      const query = `
        UPDATE users 
        SET email = ?, username = ?, firstName = ?, lastName = ?, avatar = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      this.db.run(query, [email, username, firstName, lastName, avatar, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  updateUserPassword(id, hashedPassword) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
      
      this.db.run(query, [hashedPassword, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  deleteUser(id) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
      
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        resolve();
      });
    });
  }
}

module.exports = Database;
