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
        PORT: 3001,
        JWT_SECRET: 'your-jwt-secret-key-change-in-production'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
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
      time: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};