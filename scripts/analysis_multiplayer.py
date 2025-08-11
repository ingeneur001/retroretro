#!/usr/bin/env python3
"""
Multiplayer Structure Analysis Script
Analysiert die komplette Multiplayer-Struktur des RetroRetro Projekts
"""

import os
import glob
from datetime import datetime
import sys

def analyze_multiplayer_structure(project_path):
    """Analysiert die Multiplayer-Struktur"""
    
    print("🔍 Analyzing Multiplayer Structure...")
    print(f"📁 Project: {project_path}")
    
    frontend_path = os.path.join(project_path, "frontend", "src")
    
    # Multiplayer relevante Pfade
    multiplayer_paths = {
        "Types": os.path.join(frontend_path, "types"),
        "Components": os.path.join(frontend_path, "components", "multiplayer"),
        "Hooks": os.path.join(frontend_path, "hooks"),
        "Services": os.path.join(frontend_path, "services"),
        "Config": os.path.join(frontend_path, "config"),
        "Utils": os.path.join(frontend_path, "utils")
    }
    
    print("\n🎮 MULTIPLAYER STRUCTURE ANALYSIS")
    print("=" * 60)
    
    for category, path in multiplayer_paths.items():
        print(f"\n📂 {category}: {path}")
        
        if os.path.exists(path):
            # Multiplayer relevante Dateien finden
            patterns = ["*multiplayer*", "*socket*", "*room*", "*game*", "*player*"]
            files = []
            
            for pattern in patterns:
                found = glob.glob(os.path.join(path, "**", pattern), recursive=True)
                # Nur Dateien, keine Ordner
                files.extend([f for f in found if os.path.isfile(f)])
            
            # Duplikate entfernen und sortieren
            files = sorted(set(files))
            
            if files:
                for file_path in files:
                    file_name = os.path.basename(file_path)
                    file_size = os.path.getsize(file_path)
                    size_kb = file_size / 1024
                    last_modified = datetime.fromtimestamp(os.path.getmtime(file_path))
                    
                    print(f"  📄 {file_name} ({size_kb:.2f} KB) - {last_modified.strftime('%Y-%m-%d %H:%M')}")
                    
                    # Backup-Dateien markieren
                    if any(ext in file_name.lower() for ext in ['.bak', '.backup', '.old']):
                        print("     🔄 BACKUP FILE")
                    
                    # Dateigröße analysieren
                    if file_size == 0:
                        print("    ⚠️ EMPTY FILE")
                    elif file_size < 100:
                        print("     ⚠️ VERY SMALL FILE")
            else:
                print("  📭 No multiplayer files found")
        else:
            print("  ❌ Directory not found")
    
    # Spezielle Multiplayer-Dateien analysieren
    print("\n🔍 DETAILED FILE ANALYSIS")
    print("=" * 60)
    
    key_files = [
        "types/multiplayer.ts",
        "types/multiplayer.ts.bak", 
        "components/multiplayer",
        "hooks/useMultiplayerSocket.js",
        "hooks/useSocket.js",
        "services/SocketService.js",
        "config/socket.js",
        "config/multiplayer.js",
        "config/gameRoom.js",
        "utils/socketUtils.js"
    ]
    
    for file_rel_path in key_files:
        full_path = os.path.join(frontend_path, file_rel_path.replace('/', os.sep))
        print(f"\n📄 {file_rel_path}")
        
        if os.path.exists(full_path):
            if os.path.isdir(full_path):
                # Directory
                sub_files = [f for f in os.listdir(full_path) 
                           if os.path.isfile(os.path.join(full_path, f))]
                sub_files.sort()
                print(f"  📁 Directory with {len(sub_files)} files:")
                for sub_file in sub_files:
                    sub_path = os.path.join(full_path, sub_file)
                    size_kb = os.path.getsize(sub_path) / 1024
                    print(f"    📄 {sub_file} ({size_kb:.2f} KB)")
            else:
                # File
                file_size = os.path.getsize(full_path)
                size_kb = file_size / 1024
                last_modified = datetime.fromtimestamp(os.path.getmtime(full_path))
                print(f"  ✅ Found ({size_kb:.2f} KB) - Modified: {last_modified.strftime('%Y-%m-%d %H:%M')}")
                
                # Ersten paar Zeilen lesen
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = []
                        for i, line in enumerate(f):
                            if i >= 10:  # Nur erste 10 Zeilen
                                break
                            if line.strip():  # Nur nicht-leere Zeilen
                                lines.append(line.rstrip())
                        
                        if lines:
                            print("  📝 First few lines:")
                            for line in lines:
                                print(f"    {line}")
                except Exception as e:
                    print(f"  ⚠️ Could not read file content: {e}")
        else:
            print("  ❌ File not found")
    
    # Backend Multiplayer Dateien
    print("\n🖥️ BACKEND MULTIPLAYER FILES")
    print("=" * 60)
    
    backend_path = os.path.join(project_path, "backend")
    backend_multiplayer_files = [
        "src/socket/GameRoomManager.js",
        "src/socket/MultiplayerSocketHandler.js",
        "services/socketHandler.js",
        "config/socket.js",
        "config/redis.js",
        "src/config/multiplayer.js"
    ]
    
    for file_rel_path in backend_multiplayer_files:
        full_path = os.path.join(backend_path, file_rel_path.replace('/', os.sep))
        print(f"\n📄 {file_rel_path}")
        
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
            size_kb = file_size / 1024
            last_modified = datetime.fromtimestamp(os.path.getmtime(full_path))
            print(f"  ✅ Found ({size_kb:.2f} KB) - Modified: {last_modified.strftime('%Y-%m-%d %H:%M')}")
        else:
            print("  ❌ File not found")
    
    print("\n🎯 RECOMMENDATIONS")
    print("=" * 60)
    print("1. Compare multiplayer.ts with multiplayer.ts.bak to see changes")
    print("2. Check if empty files need implementation")
    print("3. Verify Frontend-Backend socket communication compatibility")
    print("4. Test multiplayer components in isolation")
    
    print("\n🚀 Next Steps:")
    print("   Run specific analysis on files that need attention")
    print("   Compare backup files with current versions")
    print("   Test socket connections between frontend and backend")

def main():
    project_path = sys.argv[1] if len(sys.argv) > 1 else r"D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service"
    
    if not os.path.exists(project_path):
        print(f"❌ Project path not found: {project_path}")
        sys.exit(1)
    
    analyze_multiplayer_structure(project_path)

if __name__ == "__main__":
    main()