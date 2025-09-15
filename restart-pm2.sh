#!/bin/bash

# Notepad Application PM2 Restart Script
# This script restarts all PM2 services for the notepad application

set -e

echo "🔄 Restarting Notepad Application PM2 Services..."

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
    print_error "PM2 is not installed."
    exit 1
fi

# Restart PM2 processes
print_status "Restarting PM2 processes..."
pm2 restart ecosystem.config.js

# Wait a moment for services to restart
sleep 3

# Check if services are running
print_status "Checking service status..."
pm2 status

print_success "All Notepad Application services restarted successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3010"
echo "   Backend API: http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/api/health"
echo ""
