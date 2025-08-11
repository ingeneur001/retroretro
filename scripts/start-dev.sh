#!/bin/bash
# ===================================================================
# RetroRetro Multiplayer Development Startup Script
# ===================================================================

echo "🚀 Starting RetroRetro Multiplayer Development Environment..."

# Start Redis (if not running)
echo "📡 Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "🔄 Starting Redis server..."
    redis-server --daemonize yes
    sleep 2
fi

# Backend Directory
BACKEND_DIR="D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service\backend"
FRONTEND_DIR="D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service\frontend"

# Start Backend
echo "🖥️ Starting Backend Server..."
cd "$BACKEND_DIR"
npm run dev &
BACKEND_PID=$!

# Wait a moment
sleep 3

# Start Frontend
echo "🌐 Starting Frontend Development Server..."
cd "$FRONTEND_DIR"
npm start &
FRONTEND_PID=$!

echo "✅ RetroRetro Multiplayer started!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for interrupt
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
