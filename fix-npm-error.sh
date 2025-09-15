#!/bin/bash

# Fix npm ENOTEMPTY error script
# This script cleans up npm cache and node_modules to resolve installation issues

set -e

echo "🔧 Fixing npm ENOTEMPTY error..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Current directory: $(pwd)"

# Stop any running PM2 processes
print_status "Stopping PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Kill any processes that might be using node_modules
print_status "Killing processes using node_modules..."
pkill -f "node.*notepad" 2>/dev/null || true
pkill -f "npm.*notepad" 2>/dev/null || true

# Wait a moment
sleep 2

# Clean npm cache
print_status "Cleaning npm cache..."
npm cache clean --force

# Remove node_modules directories
print_status "Removing node_modules directories..."
if [ -d "node_modules" ]; then
    print_status "Removing root node_modules..."
    rm -rf node_modules
fi

if [ -d "backend/node_modules" ]; then
    print_status "Removing backend node_modules..."
    rm -rf backend/node_modules
fi

if [ -d "frontend/node_modules" ]; then
    print_status "Removing frontend node_modules..."
    rm -rf frontend/node_modules
fi

# Remove package-lock files
print_status "Removing package-lock files..."
rm -f package-lock.json
rm -f backend/package-lock.json
rm -f frontend/package-lock.json

# Remove any .npm directories
print_status "Cleaning .npm directories..."
rm -rf .npm
rm -rf backend/.npm
rm -rf frontend/.npm

# Clear npm cache again
print_status "Clearing npm cache again..."
npm cache clean --force

# Update npm to latest version
print_status "Updating npm to latest version..."
npm install -g npm@latest

# Install dependencies step by step
print_status "Installing root dependencies..."
npm install

print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

print_success "All dependencies installed successfully!"

# Test the installation
print_status "Testing installation..."

# Test backend
print_status "Testing backend..."
cd backend
if npm run init-db; then
    print_success "Backend database initialized successfully"
else
    print_warning "Backend database initialization had issues, but continuing..."
fi
cd ..

# Test frontend build
print_status "Testing frontend build..."
cd frontend
if npm run build:compatible || npm run build:legacy || npm run build; then
    print_success "Frontend built successfully"
else
    print_warning "Frontend build had issues, but continuing..."
fi
cd ..

print_success "npm ENOTEMPTY error should be fixed!"
echo ""
echo "You can now run:"
echo "  ./start-pm2.sh  - to start all services"
echo "  pm2 status      - to check service status"
echo ""
