# ===================================================================
# RetroRetro Development Startup Script (PowerShell)
# Startet Backend und Frontend für Development
# ===================================================================

param(
    [string]$ProjectPath = "D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service"
)

Write-Host "🚀 Starting RetroRetro Development Environment..." -ForegroundColor Green

# Check Redis
Write-Host "📡 Checking Redis..." -ForegroundColor Yellow
try {
    $redisTest = redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "  ✅ Redis is running" -ForegroundColor Green
    } else {
        Write-Host "  🔄 Starting Redis..." -ForegroundColor Yellow
        Start-Process "redis-server" -WindowStyle Hidden
        Start-Sleep 2
    }
} catch {
    Write-Host "  ⚠️ Please start Redis manually: redis-server" -ForegroundColor Red
    Write-Host "  📍 Redis path: C:\Program Files\Redis\redis-server.exe" -ForegroundColor Cyan
    Read-Host "Press Enter to continue"
}

# Backend Setup
$BackendPath = Join-Path $ProjectPath "backend"
$FrontendPath = Join-Path $ProjectPath "frontend"

Write-Host "🖥️ Starting Backend Server..." -ForegroundColor Yellow
Write-Host "  📁 Backend: $BackendPath" -ForegroundColor Gray

if (Test-Path $BackendPath) {
    Set-Location $BackendPath
    Write-Host "  🔧 Starting: npm run dev" -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; npm run dev; Write-Host 'Backend stopped' -ForegroundColor Red" -WindowStyle Normal
} else {
    Write-Host "  ❌ Backend directory not found: $BackendPath" -ForegroundColor Red
    exit 1
}

# Wait for backend
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep 5

# Frontend Setup  
Write-Host "🌐 Starting Frontend Development Server..." -ForegroundColor Yellow
Write-Host "  📁 Frontend: $FrontendPath" -ForegroundColor Gray

if (Test-Path $FrontendPath) {
    Set-Location $FrontendPath
    Write-Host "  🔧 Starting: npm start" -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm start; Write-Host 'Frontend stopped' -ForegroundColor Red" -WindowStyle Normal
} else {
    Write-Host "  ❌ Frontend directory not found: $FrontendPath" -ForegroundColor Red
    exit 1
}

# Success message
Write-Host "`n🎉 RetroRetro Development Environment Started!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "🏥 Health:   http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "🔌 Socket:   ws://localhost:3001/socket.io/" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n💡 Development Tips:" -ForegroundColor Yellow
Write-Host "  • Both servers run in separate windows" -ForegroundColor White
Write-Host "  • Backend auto-restarts on file changes (nodemon)" -ForegroundColor White
Write-Host "  • Frontend auto-reloads on changes" -ForegroundColor White
Write-Host "  • Close server windows to stop services" -ForegroundColor White

Write-Host "`n🧪 Quick Tests:" -ForegroundColor Yellow
Write-Host "  python test_multiplayer_connections.py" -ForegroundColor Cyan

# Return to project root
Set-Location $ProjectPath

Read-Host "`nPress Enter to exit (servers will continue running)"