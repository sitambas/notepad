#!/bin/bash

# Notepad Application Update Script
# Usage: ./update.sh

set -e

# Configuration
SSH_USER="tr"
SSH_HOST="160.25.100.3"
SSH_PASS="wxyz@1234"
APP_DIR="/home/tr/notepad"

echo "🔄 Starting Notepad Application Update..."

# Function to run commands on remote server
run_remote() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$1"
}

echo "📥 Pulling latest changes from Git..."
run_remote "cd $APP_DIR && git pull origin main"

echo "📦 Updating dependencies..."
run_remote "cd $APP_DIR && npm run install:all"

echo "🏗️ Rebuilding frontend..."
run_remote "cd $APP_DIR/frontend && npm run build"

echo "🔄 Restarting applications with PM2..."
run_remote "cd $APP_DIR && pm2 restart ecosystem.config.js"

echo "✅ Update completed successfully!"
echo ""
echo "🔍 Checking application status..."
run_remote "pm2 status"

echo "📊 Recent logs:"
run_remote "pm2 logs --lines 10"
