#!/usr/bin/env python3
"""
Setup Multiplayer Environment Script
Automatisiert die komplette Multiplayer-Environment-Installation
"""

import os
import sys
import subprocess
import shutil
import json
from pathlib import Path

def run_command(command, cwd=None, capture_output=True):
    """Führt einen Shell-Command aus"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, 
                              capture_output=capture_output, text=True, check=True)
        return True, result.stdout if capture_output else "Success"
    except subprocess.CalledProcessError as e:
        return False, e.stderr if capture_output else str(e)

def check_prerequisites():
    """Prüft ob alle Prerequisites vorhanden sind"""
    print("🔍 Checking Prerequisites...")
    
    prerequisites = {
        'node': 'node --version',
        'npm': 'npm --version', 
        'redis-server': 'redis-server --version'
    }
    
    missing = []
    
    for tool, command in prerequisites.items():
        success, output = run_command(command)
        if success:
            version = output.strip().split('\n')[0]
            print(f"  ✅ {tool}: {version}")
        else:
            print(f"  ❌ {tool}: Not found")
            missing.append(tool)
    
    if missing:
        print(f"\n⚠️ Missing prerequisites: {', '.join(missing)}")
        print("Please install:")
        if 'node' in missing or 'npm' in missing:
            print("  - Node.js: https://nodejs.org/")
        if 'redis-server' in missing:
            print("  - Redis: https://redis.io/download")
        return False
    
    return True

def setup_backend_environment(project_path):
    """Setup Backend Environment"""
    print("\n📦 Setting up Backend Environment...")
    
    backend_path = os.path.join(project_path, "backend")
    
    if not os.path.exists(backend_path):
        print(f"  ❌ Backend directory not found: {backend_path}")
        return False
    
    # 1. Install NPM Dependencies
    print("  📥 Installing NPM dependencies...")
    success, output = run_command("npm install", cwd=backend_path, capture_output=False)
    
    if not success:
        print(f"  ❌ Failed to install dependencies: {output}")
        return False
    else:
        print("  ✅ NPM dependencies installed")
    
    # 2. Environment File Setup
    print("  ⚙️ Setting up environment file...")
    
    env_template_path = os.path.join(backend_path, ".env.multiplayer.template")
    env_path = os.path.join(backend_path, ".env")
    
    if os.path.exists(env_template_path):
        if not os.path.exists(env_path):
            shutil.copy2(env_template_path, env_path)
            print(f"  ✅ Created .env from template")
            
            # Customize .env with sensible defaults
            with open(env_path, 'r') as f:
                env_content = f.read()
            
            # Generate a simple JWT secret
            import secrets
            jwt_secret = secrets.token_urlsafe(32)
            env_content = env_content.replace('your-super-secret-jwt-key', jwt_secret)
            
            with open(env_path, 'w') as f:
                f.write(env_content)
            
            print(f"  ✅ Generated JWT secret")
        else:
            print(f"  ℹ️ .env already exists")
    else:
        print(f"  ⚠️ Template not found: {env_template_path}")
    
    return True

def setup_frontend_environment(project_path):
    """Setup Frontend Environment"""
    print("\n🖥️ Setting up Frontend Environment...")
    
    frontend_path = os.path.join(project_path, "frontend")
    
    if not os.path.exists(frontend_path):
        print(f"  ❌ Frontend directory not found: {frontend_path}")
        return False
    
    # Install NPM Dependencies
    print("  📥 Installing NPM dependencies...")
    success, output = run_command("npm install", cwd=frontend_path, capture_output=False)
    
    if not success:
        print(f"  ❌ Failed to install dependencies: {output}")
        return False
    else:
        print("  ✅ NPM dependencies installed")
    
    # Check for React App Environment
    env_path = os.path.join(frontend_path, ".env")
    if not os.path.exists(env_path):
        env_content = """# Frontend Environment Variables
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
"""
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("  ✅ Created frontend .env file")
    
    return True

def setup_redis():
    """Setup Redis Server"""
    print("\n🔄 Setting up Redis Server...")
    
    # Check if Redis is running
    success, _ = run_command("redis-cli ping")
    
    if success:
        print("  ✅ Redis server is already running")
        return True
    else:
        print("  📡 Starting Redis server...")
        
        # Try to start Redis (different methods for different OS)
        redis_commands = [
            "redis-server --daemonize yes",  # Linux/Mac
            "redis-server",  # Direct start
            "sudo systemctl start redis",  # Systemd
            "brew services start redis",  # macOS with Homebrew
        ]
        
        for cmd in redis_commands:
            print(f"    Trying: {cmd}")
            success, output = run_command(cmd)
            if success:
                # Wait a moment and test connection
                import time
                time.sleep(2)
                test_success, _ = run_command("redis-cli ping")
                if test_success:
                    print("  ✅ Redis server started successfully")
                    return True
        
        print("  ⚠️ Could not start Redis automatically")
        print("  Please start Redis manually:")
        print("    - Windows: Start Redis from installation directory")
        print("    - Linux/Mac: redis-server")
        print("    - macOS (Homebrew): brew services start redis")
        return False

def verify_setup(project_path):
    """Verifiziert das komplette Setup"""
    print("\n🔍 Verifying Setup...")
    
    checks = []
    
    # Backend Dependencies
    backend_path = os.path.join(project_path, "backend")
    package_json_path = os.path.join(backend_path, "package.json")
    
    if os.path.exists(package_json_path):
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        required_deps = ['redis', 'socket.io', 'cors', 'helmet']
        backend_deps_ok = all(dep in package_data.get('dependencies', {}) for dep in required_deps)
        checks.append(("Backend Dependencies", backend_deps_ok))
    else:
        checks.append(("Backend Dependencies", False))
    
    # Frontend Dependencies
    frontend_path = os.path.join(project_path, "frontend")
    frontend_package_path = os.path.join(frontend_path, "package.json")
    
    if os.path.exists(frontend_package_path):
        with open(frontend_package_path, 'r') as f:
            package_data = json.load(f)
        
        frontend_deps_ok = 'socket.io-client' in package_data.get('dependencies', {})
        checks.append(("Frontend Socket Dependency", frontend_deps_ok))
    else:
        checks.append(("Frontend Dependencies", False))
    
    # Environment Files
    backend_env = os.path.exists(os.path.join(backend_path, ".env"))
    frontend_env = os.path.exists(os.path.join(frontend_path, ".env"))
    checks.append(("Backend .env", backend_env))
    checks.append(("Frontend .env", frontend_env))
    
    # Redis Connection
    redis_success, _ = run_command("redis-cli ping")
    checks.append(("Redis Server", redis_success))
    
    # Config Files
    config_files = [
        os.path.join(backend_path, "config", "redis.js"),
        os.path.join(backend_path, "src", "config", "multiplayer.js"),
        os.path.join(frontend_path, "src", "config", "socket.js"),
        os.path.join(frontend_path, "src", "types", "multiplayer.ts")
    ]
    
    for config_file in config_files:
        file_name = os.path.basename(config_file)
        exists = os.path.exists(config_file)
        checks.append((f"Config: {file_name}", exists))
    
    # Print Results
    all_good = True
    for check_name, result in checks:
        status = "✅" if result else "❌"
        print(f"  {status} {check_name}")
        if not result:
            all_good = False
    
    return all_good

def create_startup_scripts(project_path):
    """Erstellt Startup-Scripts für Development"""
    print("\n📜 Creating Startup Scripts...")
    
    scripts_dir = os.path.join(project_path, "scripts")
    os.makedirs(scripts_dir, exist_ok=True)
    
    # Development Startup Script
    startup_script = f'''#!/bin/bash
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
BACKEND_DIR="{os.path.join(project_path, 'backend')}"
FRONTEND_DIR="{os.path.join(project_path, 'frontend')}"

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
'''
    
    startup_script_path = os.path.join(scripts_dir, "start-dev.sh")
    with open(startup_script_path, 'w', encoding='utf-8') as f:
        f.write(startup_script)
    
    # Make executable on Unix systems
    try:
        os.chmod(startup_script_path, 0o755)
    except:
        pass
    
    print(f"  ✅ Created development startup script: {startup_script_path}")
    
    # Windows Batch Version
    windows_script = f'''@echo off
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
cd /d "{os.path.join(project_path, 'backend')}"
start cmd /k "npm run dev"

REM Wait
timeout /t 3 /nobreak >nul

REM Start Frontend  
echo 🌐 Starting Frontend Development Server...
cd /d "{os.path.join(project_path, 'frontend')}"
start cmd /k "npm start"

echo ✅ RetroRetro Multiplayer started!
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend: http://localhost:3001
pause
'''
    
    windows_script_path = os.path.join(scripts_dir, "start-dev.bat")
    with open(windows_script_path, 'w', encoding='utf-8') as f:
        f.write(windows_script)
    
    print(f"  ✅ Created Windows startup script: {windows_script_path}")

def main():
    """Hauptfunktion"""
    project_path = sys.argv[1] if len(sys.argv) > 1 else r"D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service"
    
    print("🎮 RetroRetro Multiplayer Environment Setup")
    print("=" * 60)
    
    if not os.path.exists(project_path):
        print(f"❌ Project path not found: {project_path}")
        sys.exit(1)
    
    # Prerequisites
    if not check_prerequisites():
        sys.exit(1)
    
    # Setup Backend
    if not setup_backend_environment(project_path):
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup Frontend  
    if not setup_frontend_environment(project_path):
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    # Setup Redis
    setup_redis()
    
    # Create Startup Scripts
    create_startup_scripts(project_path)
    
    # Verify Everything
    if verify_setup(project_path):
        print("\n🎉 MULTIPLAYER ENVIRONMENT SETUP COMPLETED!")
        print("\n📋 Summary:")
        print("  ✅ Backend dependencies installed")
        print("  ✅ Frontend dependencies installed") 
        print("  ✅ Environment files configured")
        print("  ✅ Redis server setup")
        print("  ✅ Development scripts created")
        
        print("\n🚀 Next Steps:")
        print("  1. Test socket connections: python test_socket_connections.py")
        print("  2. Start development: ./scripts/start-dev.sh (or start-dev.bat)")
        print("  3. Open browser: http://localhost:3000")
        
        print("\n💡 Manual Redis Start (if needed):")
        print("  - Linux/Mac: redis-server")
        print("  - Windows: Start Redis from installation directory")
        
    else:
        print("\n⚠️ Setup completed with some issues")
        print("Please check the failed items above")
    
    return True

if __name__ == "__main__":
    main()