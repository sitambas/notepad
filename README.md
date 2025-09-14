# Notepad Application

A modern, full-stack notepad application with React frontend and Node.js backend, featuring real-time collaboration, file uploads, and secure note sharing.

## Project Structure

```
notepad/
├── frontend/          # React + Vite frontend
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── vite.config.ts
├── backend/          # Node.js + Express backend
│   ├── database/     # SQLite database files
│   ├── uploads/      # File uploads
│   ├── package.json  # Backend dependencies
│   └── server.js     # Main server file
├── package.json      # Root workspace configuration
└── start-dev.sh      # Development startup script
```

## Features

### Frontend (React + Vite)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Editing**: Auto-save functionality with visual feedback
- **File Management**: Upload and manage files (images, PDFs, documents)
- **Security**: Client-side encryption for sensitive notes
- **Accessibility**: Full keyboard navigation and screen reader support
- **Themes**: Light and dark mode support
- **Text Tools**: Spell check, monospace font, word/character count

### Backend (Node.js + Express)
- **RESTful API**: Clean API endpoints for all operations
- **Database**: SQLite for data persistence
- **File Storage**: Secure file upload and management
- **Security**: Rate limiting, CORS, input validation
- **Authentication**: Password protection for notes
- **Encryption**: Server-side data encryption

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notepad
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   Or use the convenience script:
   ```bash
   ./start-dev.sh
   ```

### Individual Project Commands

#### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev         # Start development server (port 3010)
npm run build       # Build for production
npm run preview     # Preview production build
```

#### Backend Development
```bash
cd backend
npm install          # Install dependencies
npm run dev         # Start development server (port 3001)
npm start           # Start production server
npm run init-db     # Initialize database
```

## API Endpoints

### Notes
- `GET /api/load/:id` - Load a note by ID
- `POST /api/save` - Save a note
- `DELETE /api/delete/:id` - Delete a note

### Files
- `POST /api/upload/:noteId` - Upload files for a note
- `GET /api/files/:noteId` - Get files for a note
- `GET /api/file/:fileId` - Download a file
- `DELETE /api/file/:fileId` - Delete a file

### Health
- `GET /api/health` - API health check

## Development

### Workspace Commands
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend
npm run build            # Build both projects
npm run install:all      # Install all dependencies
```

### File Structure Details

#### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for state management
- **Lucide React** for icons

#### Backend (`/backend`)
- **Express.js** web framework
- **SQLite3** database
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Configuration

### Environment Variables
Create `.env` files in the respective directories:

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3001/api
```

**Backend** (`backend/.env`):
```
PORT=3001
NODE_ENV=development
```

## Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend
```bash
cd backend
npm start
# Or use PM2 for production:
# pm2 start server.js --name notepad-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.