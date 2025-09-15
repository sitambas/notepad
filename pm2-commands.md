# PM2 Management Commands for Notepad Application

This document provides all the PM2 commands you need to manage your Notepad application services.

## Quick Start Scripts

### Start All Services
```bash
./start-pm2.sh
```
This script will:
- Install dependencies if needed
- Build the frontend
- Start both backend and frontend with PM2
- Set up logging and monitoring

### Stop All Services
```bash
./stop-pm2.sh
```

### Restart All Services
```bash
./restart-pm2.sh
```

## Manual PM2 Commands

### Basic Service Management

#### Check Status
```bash
pm2 status
```

#### Start Services
```bash
# Start all services from ecosystem.config.js
pm2 start ecosystem.config.js

# Start individual services
pm2 start notepad-backend
pm2 start notepad-frontend
```

#### Stop Services
```bash
# Stop all services
pm2 stop all

# Stop individual services
pm2 stop notepad-backend
pm2 stop notepad-frontend

# Stop by ecosystem config
pm2 stop ecosystem.config.js
```

#### Restart Services
```bash
# Restart all services
pm2 restart all

# Restart individual services
pm2 restart notepad-backend
pm2 restart notepad-frontend

# Restart by ecosystem config
pm2 restart ecosystem.config.js
```

#### Delete Services
```bash
# Delete all services
pm2 delete all

# Delete individual services
pm2 delete notepad-backend
pm2 delete notepad-frontend

# Delete by ecosystem config
pm2 delete ecosystem.config.js
```

### Monitoring and Logs

#### View Logs
```bash
# View all logs
pm2 logs

# View logs for specific service
pm2 logs notepad-backend
pm2 logs notepad-frontend

# Follow logs in real-time
pm2 logs --follow

# View only error logs
pm2 logs --err

# View only output logs
pm2 logs --out
```

#### Monitor Services
```bash
# Open PM2 monitoring dashboard
pm2 monit

# Show detailed information
pm2 show notepad-backend
pm2 show notepad-frontend
```

### Configuration Management

#### Save Current Configuration
```bash
pm2 save
```

#### Reload Configuration
```bash
pm2 reload ecosystem.config.js
```

#### Set Up Auto-Start
```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

### Advanced Commands

#### Scale Services
```bash
# Scale backend to 2 instances
pm2 scale notepad-backend 2

# Scale all services
pm2 scale ecosystem.config.js 2
```

#### Reset Restart Count
```bash
pm2 reset notepad-backend
pm2 reset notepad-frontend
```

#### Flush Logs
```bash
pm2 flush
```

#### Kill PM2 Daemon
```bash
pm2 kill
```

## Service Information

### Backend Service
- **Name**: notepad-backend
- **Port**: 3001
- **Script**: server.js
- **Directory**: ./backend
- **Logs**: ./logs/backend-*.log

### Frontend Service
- **Name**: notepad-frontend
- **Port**: 3010
- **Script**: npm run preview
- **Directory**: ./frontend
- **Logs**: ./logs/frontend-*.log

## Troubleshooting

### Service Won't Start
```bash
# Check logs for errors
pm2 logs notepad-backend --err
pm2 logs notepad-frontend --err

# Check if ports are available
netstat -tulpn | grep :3001
netstat -tulpn | grep :3010

# Kill processes using ports
sudo lsof -ti:3001 | xargs kill -9
sudo lsof -ti:3010 | xargs kill -9
```

### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart service if needed
pm2 restart notepad-backend
```

### Service Keeps Restarting
```bash
# Check restart count
pm2 status

# View error logs
pm2 logs notepad-backend --err

# Reset restart count
pm2 reset notepad-backend
```

## Environment Variables

You can modify environment variables in `ecosystem.config.js`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001,
  JWT_SECRET: 'your-jwt-secret-key'
}
```

## Log Files Location

All log files are stored in the `./logs/` directory:
- `backend-error.log` - Backend error logs
- `backend-out.log` - Backend output logs
- `backend-combined.log` - Backend combined logs
- `frontend-error.log` - Frontend error logs
- `frontend-out.log` - Frontend output logs
- `frontend-combined.log` - Frontend combined logs

## Health Checks

### Backend Health Check
```bash
curl http://localhost:3001/api/health
```

### Frontend Health Check
```bash
curl http://localhost:3010
```

## Production Deployment

For production deployment, make sure to:

1. Set proper environment variables
2. Configure JWT secret
3. Set up proper logging
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates
6. Configure firewall rules
7. Set up monitoring and alerting

## Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
alias pm2-start='./start-pm2.sh'
alias pm2-stop='./stop-pm2.sh'
alias pm2-restart='./restart-pm2.sh'
alias pm2-status='pm2 status'
alias pm2-logs='pm2 logs --follow'
```
