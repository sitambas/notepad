#!/bin/bash

# Notepad Application PM2 Stop Script
# This script stops all PM2 services for the notepad application

set -e

echo "🛑 Stopping Notepad Application PM2 Services..."

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

# Stop PM2 processes
print_status "Stopping PM2 processes..."
pm2 stop ecosystem.config.js 2>/dev/null || print_warning "No processes found to stop"

# Delete PM2 processes
print_status "Deleting PM2 processes..."
pm2 delete ecosystem.config.js 2>/dev/null || print_warning "No processes found to delete"

# Show final status
print_status "Current PM2 status:"
pm2 status

print_success "All Notepad Application services stopped successfully!"
echo ""
echo "To start services again, run: ./start-pm2.sh"
echo ""
