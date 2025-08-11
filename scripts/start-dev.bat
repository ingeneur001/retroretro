@echo off
REM ===================================================================
REM RetroRetro Multiplayer Development Startup Script (Windows)
REM ===================================================================

echo 🚀 Starting RetroRetro Multiplayer Development Environment...

REM Check Redis
echo 📡 Checking Redis...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo 🔄 Please start Redis server manually
    echo    redis-server
    pause
)

REM Start Backend
echo 🖥️ Starting Backend Server...
cd /d "D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service\backend"
start cmd /k "npm run dev"

REM Wait
timeout /t 3 /nobreak >nul

REM Start Frontend  
echo 🌐 Starting Frontend Development Server...
cd /d "D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service\frontend"
start cmd /k "npm start"

echo ✅ RetroRetro Multiplayer started!
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend: http://localhost:3001
pause
