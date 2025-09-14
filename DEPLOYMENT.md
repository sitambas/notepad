# Notepad Application Deployment Guide

This guide will help you deploy the Notepad application to your SSH server using PM2 for process management and Nginx as a reverse proxy.

## Prerequisites

- SSH access to your server (160.25.100.3)
- Git repository access
- Basic knowledge of Linux commands

## Server Information

- **SSH Host**: 160.25.100.3
- **SSH User**: tr
- **SSH Password**: wxyz@1234
- **Git Repository**: https://github.com/sitambas/notepad.git

## Quick Deployment

### 1. Make Scripts Executable

```bash
chmod +x deploy.sh update.sh
```

### 2. Install Required Tools (Local Machine)

```bash
# Install sshpass for password-based SSH
# Ubuntu/Debian:
sudo apt install sshpass

# macOS:
brew install sshpass

# Or install via npm:
npm install -g sshpass
```

### 3. Run Deployment Script

```bash
./deploy.sh
```

This script will:
- Install Node.js, npm, Nginx, and PM2 on the server
- Clone the repository
- Install all dependencies
- Build the frontend
- Configure Nginx as a reverse proxy
- Start both frontend and backend with PM2
- Set up PM2 to start on boot

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Connect to Server

```bash
ssh tr@160.25.100.3
# Password: wxyz@1234
```

### 2. Install Required Packages

```bash
sudo apt update
sudo apt install -y nodejs npm nginx git
sudo npm install -g pm2
```

### 3. Clone and Setup Application

```bash
cd /home/tr
git clone https://github.com/sitambas/notepad.git
cd notepad
npm run install:all
```

### 4. Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### 5. Configure PM2

```bash
# Copy the ecosystem.config.js to the server
# Then start the applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure Nginx

```bash
# Copy nginx.conf to /etc/nginx/sites-available/notepad
sudo cp nginx.conf /etc/nginx/sites-available/notepad
sudo ln -s /etc/nginx/sites-available/notepad /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Application URLs

After successful deployment:

- **Frontend**: http://160.25.100.3
- **Backend API**: http://160.25.100.3/api
- **Health Check**: http://160.25.100.3/api/health

## PM2 Management Commands

### Check Status
```bash
pm2 status
```

### View Logs
```bash
# All applications
pm2 logs

# Specific application
pm2 logs notepad-backend
pm2 logs notepad-frontend

# Follow logs in real-time
pm2 logs --follow
```

### Restart Applications
```bash
# Restart all
pm2 restart all

# Restart specific app
pm2 restart notepad-backend
pm2 restart notepad-frontend
```

### Stop Applications
```bash
# Stop all
pm2 stop all

# Stop specific app
pm2 stop notepad-backend
pm2 stop notepad-frontend
```

### Delete Applications
```bash
pm2 delete all
```

## Updating the Application

### Automatic Update
```bash
./update.sh
```

### Manual Update
```bash
# Connect to server
ssh tr@160.25.100.3

# Navigate to app directory
cd /home/tr/notepad

# Pull latest changes
git pull origin main

# Update dependencies
npm run install:all

# Rebuild frontend
cd frontend && npm run build && cd ..

# Restart applications
pm2 restart ecosystem.config.js
```

## Monitoring and Maintenance

### Check Application Health
```bash
# Check if applications are running
pm2 status

# Check logs for errors
pm2 logs --err

# Monitor resource usage
pm2 monit
```

### Nginx Status
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Server Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep -E "(node|nginx)"
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   sudo lsof -i :3001
   sudo lsof -i :3010
   
   # Kill process
   sudo kill -9 <PID>
   ```

2. **Permission Denied**
   ```bash
   # Fix file permissions
   sudo chown -R tr:tr /home/tr/notepad
   chmod +x /home/tr/notepad/ecosystem.config.js
   ```

3. **Nginx Configuration Error**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **PM2 Not Starting on Boot**
   ```bash
   # Re-run startup command
   pm2 startup
   pm2 save
   ```

### Log Files

- **PM2 Logs**: `/home/tr/notepad/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `/var/log/syslog`

## Security Considerations

1. **Firewall**: Ensure ports 80 and 443 are open
2. **SSL**: Consider adding SSL certificates for HTTPS
3. **Updates**: Regularly update the system and dependencies
4. **Backups**: Set up regular backups of the database and uploaded files

## File Structure on Server

```
/home/tr/notepad/
├── frontend/
│   ├── dist/           # Built frontend files
│   └── package.json
├── backend/
│   ├── database/       # SQLite database
│   ├── uploads/        # Uploaded files
│   └── server.js
├── logs/               # PM2 logs
├── ecosystem.config.js # PM2 configuration
└── package.json
```

## Support

For issues and questions:
1. Check the logs: `pm2 logs`
2. Verify Nginx configuration: `sudo nginx -t`
3. Check application status: `pm2 status`
4. Review this deployment guide

## Environment Variables

Create `.env` files if needed:

**Backend** (`/home/tr/notepad/backend/.env`):
```
NODE_ENV=production
PORT=3001
```

**Frontend** (`/home/tr/notepad/frontend/.env`):
```
VITE_API_URL=http://160.25.100.3/api
```
