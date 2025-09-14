#!/bin/bash

# Notepad Development Startup Script
echo "🚀 Starting Notepad Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "✅ Backend dependencies already installed"
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

# Check if backend port is available
if ! check_port 3001; then
    echo "🔄 Stopping existing backend process..."
    pkill -f "node.*server.js" || true
    sleep 2
fi

# Start backend server
echo "🔧 Starting backend server on port 3001..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! check_port 3001; then
    echo "✅ Backend server started successfully"
else
    echo "❌ Failed to start backend server"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Go back to root directory
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
else
    echo "✅ Frontend dependencies already installed"
fi

# Check if frontend port is available
if ! check_port 3010; then
    echo "🔄 Stopping existing frontend process..."
    pkill -f "vite" || true
    sleep 2
fi

# Start frontend server
echo "🎨 Starting frontend server on port 3010..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 3

# Check if frontend is running
if ! check_port 3010; then
    echo "✅ Frontend server started successfully"
else
    echo "❌ Failed to start frontend server"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Development environment started successfully!"
echo ""
echo "📱 Frontend: http://localhost:3010"
echo "🔧 Backend API: http://localhost:3001/api"
echo "🔍 Health Check: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
