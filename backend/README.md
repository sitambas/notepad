# Notepad Backend API

A Node.js backend API for the notepad application, similar to notepad.pw functionality.

## Features

- ✅ Save notes with optional password protection
- ✅ Load notes by ID with password verification
- ✅ Delete notes with password verification
- ✅ SQLite database for data persistence
- ✅ Rate limiting and security headers
- ✅ CORS support for frontend integration
- ✅ Input validation and error handling

## API Endpoints

### Save Note
```bash
POST /api/save
Content-Type: application/x-www-form-urlencoded

key=qqrt3g62f&pad=Your note content&pw=password&url=sitambas&monospace=0&caret=0
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

## Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize database:
```bash
npm run init-db
```

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS=http://localhost:3010,http://localhost:8080
```

## Database Schema

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

## Security Features

- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation
- SQL injection prevention
- Security headers with Helmet

## Development

The backend runs on `http://localhost:3001` by default.

API endpoints are available at `http://localhost:3001/api/`
