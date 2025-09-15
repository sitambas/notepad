#!/bin/bash

# Notepad Application PM2 Startup Script
# This script starts both frontend and backend services using PM2

set -e

echo "🚀 Starting Notepad Application with PM2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        print_error "Failed to install PM2. Please install it manually: npm install -g pm2"
        exit 1
    fi
    print_success "PM2 installed successfully"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Version 14+ is recommended."
fi

print_status "Node.js version: $(node -v)"

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found. Please run this script from the project root."
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    print_success "Backend dependencies installed"
else
    print_status "Backend dependencies already installed"
fi

# Initialize database
print_status "Initializing database..."
npm run init-db
if [ $? -ne 0 ]; then
    print_error "Failed to initialize database"
    exit 1
fi
print_success "Database initialized"

cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    print_success "Frontend dependencies installed"
else
    print_status "Frontend dependencies already installed"
fi

# Build frontend
print_status "Building frontend..."
npm run build:compatible || npm run build:legacy || npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build frontend"
    exit 1
fi
print_success "Frontend built successfully"

cd ..

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js

# Wait a moment for services to start
sleep 3

# Check if services are running
print_status "Checking service status..."
pm2 status

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Set up PM2 startup (run this command manually if needed)
print_status "Setting up PM2 startup..."
pm2 startup 2>/dev/null || print_warning "PM2 startup command needs to be run manually. Run: pm2 startup"

print_success "Notepad Application started successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3010"
echo "   Backend API: http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/api/health"
echo ""
echo "🔧 PM2 Management Commands:"
echo "   pm2 status          - Check service status"
echo "   pm2 logs            - View logs"
echo "   pm2 logs notepad-backend - View backend logs"
echo "   pm2 logs notepad-frontend - View frontend logs"
echo "   pm2 restart all     - Restart all services"
echo "   pm2 stop all        - Stop all services"
echo "   pm2 delete all      - Delete all services"
echo "   pm2 monit           - Monitor services"
echo ""
echo "📁 Log files are located in: ./logs/"
echo ""
