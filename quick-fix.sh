#!/bin/bash

# Quick fix for npm ENOTEMPTY error
echo "🔧 Quick fix for npm ENOTEMPTY error..."

# Stop any running processes
echo "Stopping processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pkill -f "node.*notepad" 2>/dev/null || true

# Clean everything
echo "Cleaning npm cache and node_modules..."
npm cache clean --force
rm -rf node_modules
rm -rf backend/node_modules  
rm -rf frontend/node_modules
rm -f package-lock.json
rm -f backend/package-lock.json
rm -f frontend/package-lock.json

# Reinstall
echo "Reinstalling dependencies..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "✅ Quick fix completed! Try running your command again."
