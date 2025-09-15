#!/bin/bash

# Compatible build script for older Node.js versions
echo "🔧 Building frontend with compatibility settings..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "Node.js version: $NODE_VERSION"

if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build with TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc --noEmit

# Build with Vite
echo "🏗️ Building with Vite..."
npx vite build

echo "✅ Build completed successfully!"
echo "📁 Output directory: dist/"
