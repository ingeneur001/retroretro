#!/usr/bin/env python3
"""
🎮 Simple Port Clear - Retro Gaming Service
Einfaches Tool um Ports 3000 und 3001 freizumachen
"""

import subprocess
import sys
import time
import requests

def print_banner():
    print("=" * 50)
    print("🎮 SIMPLE PORT CLEAR - RETRO GAMING")
    print("=" * 50)

def run_command(cmd):
    """Führt Windows-Befehl aus"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout, result.stderr
    except Exception as e:
        return "", str(e)

def check_port(port):
    """Prüft ob Port belegt ist"""
    try:
        response = requests.get(f"http://localhost:{port}", timeout=2)
        return True, f"HTTP {response.status_code}"
    except:
        return False, "Nicht erreichbar"

def find_port_process(port):
    """Findet Prozess auf Port"""
    stdout, stderr = run_command(f'netstat -ano | findstr :{port}')
    
    listening_processes = []
    for line in stdout.split('\n'):
        if 'ABHÖREN' in line or 'LISTENING' in line:
            parts = line.split()
            if len(parts) >= 5:
                pid = parts[-1]
                listening_processes.append(pid)
    
    return listening_processes

def kill_process(pid):
    """Beendet Prozess"""
    stdout, stderr = run_command(f'taskkill /PID {pid} /F')
    return "SUCCESS" in stdout.upper() or "ERFOLG" in stdout.upper()

def clear_port(port):
    """Befreit einen Port"""
    service = "Frontend" if port == 3000 else "Backend"
    print(f"\n🔧 Port {port} ({service}) clearing...")
    
    # Finde Prozesse
    pids = find_port_process(port)
    
    if pids:
        for pid in pids:
            print(f"   📍 Gefunden: PID {pid}")
            if kill_process(pid):
                print(f"   ✅ PID {pid} beendet")
            else:
                print(f"   ❌ PID {pid} konnte nicht beendet werden")
    else:
        print(f"   ✅ Port {port} ist frei")

def test_connectivity():
    """Testet HTTP-Verbindungen"""
    print("\n🔗 CONNECTIVITY TEST:")
    print("-" * 30)
    
    # Frontend
    is_up, status = check_port(3000)
    icon = "✅" if is_up else "❌"
    print(f"{icon} Frontend (3000): {status}")
    
    # Backend Health
    try:
        response = requests.get("http://localhost:3001/health", timeout=3)
        data = response.json()
        print(f"✅ Backend Health (3001): OK - {data.get('status', 'Unknown')}")
    except Exception as e:
        print(f"❌ Backend Health (3001): {str(e)}")
    
    # Backend API
    try:
        response = requests.get("http://localhost:3001/api/status", timeout=3)
        data = response.json()
        print(f"✅ Backend API (3001): OK - {data.get('server', 'Unknown')}")
    except Exception as e:
        print(f"❌ Backend API (3001): {str(e)}")

def kill_all_node():
    """Beendet alle Node-Prozesse"""
    print("\n💀 ALLE NODE/NPM PROZESSE BEENDEN:")
    print("-" * 35)
    
    # Node-Prozesse
    stdout, stderr = run_command('taskkill /F /IM node.exe')
    if "SUCCESS" in stdout.upper() or "ERFOLG" in stdout.upper():
        print("✅ Node.exe Prozesse beendet")
    else:
        print("ℹ️  Keine Node.exe Prozesse gefunden")
    
    # NPM-Prozesse  
    stdout, stderr = run_command('taskkill /F /IM npm.cmd')
    if "SUCCESS" in stdout.upper() or "ERFOLG" in stdout.upper():
        print("✅ NPM Prozesse beendet")
    else:
        print("ℹ️  Keine NPM Prozesse gefunden")

def main():
    print_banner()
    
    command = sys.argv[1] if len(sys.argv) > 1 else "help"
    
    if command == "status":
        print("\n📊 PORT STATUS:")
        print("-" * 20)
        
        for port in [3000, 3001]:
            service = "Frontend" if port == 3000 else "Backend"
            pids = find_port_process(port)
            if pids:
                print(f"🔴 Port {port} ({service}): BELEGT (PIDs: {', '.join(pids)})")
            else:
                print(f"✅ Port {port} ({service}): FREI")
        
        test_connectivity()
        
    elif command == "clear":
        clear_port(3000)
        clear_port(3001)
        print("\n✅ Port clearing abgeschlossen!")
        
    elif command == "kill-all":
        kill_all_node()
        time.sleep(2)
        clear_port(3000)
        clear_port(3001)
        print("\n✅ Alle Prozesse beendet!")
        
    elif command == "test":
        test_connectivity()
        
    elif command == "help":
        print("\n🆘 VERFÜGBARE KOMMANDOS:")
        print("-" * 25)
        print("📊 python Simple_PortClear.py status    - Status anzeigen")
        print("🔧 python Simple_PortClear.py clear     - Ports freigeben")
        print("💀 python Simple_PortClear.py kill-all  - Alle Node-Prozesse beenden")
        print("🔗 python Simple_PortClear.py test      - Connectivity testen")
        print("🆘 python Simple_PortClear.py help      - Diese Hilfe")
        print()
        
    else:
        print(f"❌ Unbekanntes Kommando: {command}")
        print("💡 Verwende 'help' für verfügbare Kommandos")

if __name__ == "__main__":
    main()