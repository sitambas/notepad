# Notepad Application

A modern, full-stack notepad application similar to notepad.pw with React frontend and Node.js backend.

## 🚀 Features

### Frontend (React + Vite)
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Real-time auto-save functionality
- ✅ Password protection with encryption
- ✅ Text-to-Speech and Speech-to-Text
- ✅ File upload support
- ✅ Monospace font toggle
- ✅ Spell check toggle
- ✅ Dark/Light theme support
- ✅ Share notes via URL
- ✅ HTML export functionality
- ✅ Dynamic URL routing (any text becomes a note ID)

### Backend (Node.js + Express)
- ✅ RESTful API endpoints
- ✅ SQLite database for persistence
- ✅ Password hashing with bcrypt
- ✅ Rate limiting and security headers
- ✅ CORS support
- ✅ Input validation
- ✅ Error handling

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Router** - Client-side routing
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite3** - Database
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **express-rate-limit** - Rate limiting

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Quick Start

1. **Clone and setup:**
```bash
git clone <repository-url>
cd notepad
```

2. **Start development environment:**
```bash
./start-dev.sh
```

This will:
- Install all dependencies
- Initialize the database
- Start backend server (port 3001)
- Start frontend server (port 3010)

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run init-db
npm run dev
```

#### Frontend Setup
```bash
npm install
npm run dev
```

## 🌐 API Endpoints

### Save Note
```bash
POST /api/save
Content-Type: application/x-www-form-urlencoded

key=noteId&pad=content&pw=password&url=url&monospace=0&caret=0
```

### Load Note
```bash
GET /api/load/:id?pw=password
```

### Delete Note
```bash
DELETE /api/delete/:id?pw=password
```

### Health Check
```bash
GET /api/health
```

## 🔧 Configuration

### Environment Variables

Create `backend/.env`:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS=http://localhost:3010,http://localhost:8080
```

### Database Schema

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  password TEXT,
  isEncrypted BOOLEAN DEFAULT 0,
  monospace BOOLEAN DEFAULT 0,
  caret INTEGER DEFAULT 0,
  url TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Usage

### Creating Notes
- Visit `http://localhost:3010/` for a new random note
- Visit `http://localhost:3010/your-note-name` for a custom note ID
- Any text in the URL becomes a valid note identifier

### Password Protection
- Click the lock icon to add password protection
- Notes are encrypted on the server
- Password is required to view/edit protected notes

### Sharing Notes
- Click the share icon to get a shareable URL
- URLs include the note ID in the path
- Protected notes require password to access

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Security Headers**: Helmet.js for security headers

## 📁 Project Structure

```
notepad/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Route pages
│   ├── utils/             # Utilities and API client
│   └── types/             # TypeScript types
├── backend/               # Backend source
│   ├── database/          # Database files
│   ├── scripts/           # Database scripts
│   └── server.js          # Main server file
├── public/                # Static assets
└── start-dev.sh          # Development startup script
```

## 🧪 Testing the API

### Using curl

**Save a note:**
```bash
curl -X POST http://localhost:3001/api/save \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=test123&pad=Hello World&url=test123&monospace=0&caret=0"
```

**Load a note:**
```bash
curl http://localhost:3001/api/load/test123
```

**Load encrypted note:**
```bash
curl "http://localhost:3001/api/load/test123?pw=mypassword"
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Install dependencies: `npm install --production`
3. Start server: `npm start`

### Frontend Deployment
1. Build: `npm run build`
2. Serve static files from `dist/` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill processes on ports 3001 and 3010
pkill -f "node.*server.js"
pkill -f "vite"
```

**Database issues:**
```bash
cd backend
rm database/notepad.db
npm run init-db
```

**Dependencies issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub