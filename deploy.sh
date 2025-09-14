#!/bin/bash

# Notepad Application Deployment Script
# Usage: ./deploy.sh

set -e

# Configuration
SSH_USER="tr"
SSH_HOST="160.25.100.3"
SSH_PASS="wxyz@1234"
GIT_URL="https://github.com/sitambas/notepad.git"
APP_DIR="/home/tr/notepad"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo "🚀 Starting Notepad Application Deployment..."

# Function to run commands on remote server
run_remote() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$1"
}

# Function to copy files to remote server
copy_to_remote() {
    sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no -r "$1" "$SSH_USER@$SSH_HOST:$2"
}

echo "📦 Installing required packages on server..."
run_remote "sudo apt update && sudo apt install -y nodejs npm nginx git sshpass"

echo "🔧 Installing PM2 globally..."
run_remote "sudo npm install -g pm2"

echo "📁 Setting up application directory..."
run_remote "mkdir -p $APP_DIR"

echo "📥 Cloning repository..."
run_remote "cd $APP_DIR && git clone $GIT_URL . || (cd $APP_DIR && git pull)"

echo "📦 Installing dependencies..."
run_remote "cd $APP_DIR && npm run install:all"

echo "🏗️ Building frontend..."
run_remote "cd $APP_DIR/frontend && npm run build"

echo "📋 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'notepad-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'notepad-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run preview',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3010
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

echo "📤 Uploading PM2 configuration..."
copy_to_remote "ecosystem.config.js" "$APP_DIR/"

echo "📋 Creating Nginx configuration..."
cat > notepad.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "📤 Uploading Nginx configuration..."
copy_to_remote "notepad.conf" "/tmp/"

echo "🔧 Configuring Nginx..."
run_remote "sudo cp /tmp/notepad.conf $NGINX_SITES/notepad"
run_remote "sudo ln -sf $NGINX_SITES/notepad $NGINX_ENABLED/"
run_remote "sudo rm -f $NGINX_ENABLED/default"
run_remote "sudo nginx -t && sudo systemctl reload nginx"

echo "📁 Creating logs directory..."
run_remote "mkdir -p $APP_DIR/logs"

echo "🚀 Starting applications with PM2..."
run_remote "cd $APP_DIR && pm2 start ecosystem.config.js"

echo "💾 Saving PM2 configuration..."
run_remote "pm2 save"

echo "🔄 Setting up PM2 startup script..."
run_remote "pm2 startup"

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://160.25.100.3"
echo "   Backend API: http://160.25.100.3/api"
echo "   Health Check: http://160.25.100.3/api/health"
echo ""
echo "🔧 Management Commands:"
echo "   PM2 Status: pm2 status"
echo "   PM2 Logs: pm2 logs"
echo "   PM2 Restart: pm2 restart all"
echo "   PM2 Stop: pm2 stop all"
echo ""

# Cleanup local files
rm -f ecosystem.config.js notepad.conf

echo "🎉 Deployment script completed!"
