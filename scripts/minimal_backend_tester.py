#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 Minimal Backend Tester
=========================
Startet das minimal_server.js (ohne Database-Dependencies)
Testet ob das Backend ohne Database-Code stabil läuft
"""

import subprocess
import os
import sys
import time
import signal
import requests
from pathlib import Path
from datetime import datetime


class MinimalBackendTester:
    """Testet den minimalen Backend-Server"""
    
    def __init__(self):
        self.scripts_root = Path(__file__).parent
        self.project_root = self.scripts_root.parent
        self.backend_port = 3001
        self.backend_url = f"http://localhost:{self.backend_port}"
        self.backend_process = None
        self.running = False
        
    def print_banner(self):
        """Banner"""
        print("=" * 60)
        print("🔍 MINIMAL BACKEND TESTER")
        print("=" * 60)
        print(f"⏰ {datetime.now().strftime('%H:%M:%S')}")
        print(f"🎯 Testet minimal_server.js auf Port {self.backend_port}")
        print("📋 KEINE Database-Dependencies - Pure Stability Test")
        print("❓ Frage: Läuft Backend ohne Database-Code stabil?")
        print("-" * 60)
    
    def check_minimal_server_exists(self):
        """Prüft ob minimal_server.js existiert"""
        minimal_server_path = self.project_root / "backend" / "minimal_server.js"
        
        if not minimal_server_path.exists():
            print(f"❌ minimal_server.js nicht gefunden: {minimal_server_path}")
            print("💡 Erstelle die Datei zuerst aus dem Artifact!")
            return False
        
        print(f"✅ minimal_server.js gefunden: {minimal_server_path}")
        return True
    
    def start_minimal_backend(self):
        """Startet minimal_server.js"""
        print(f"🚀 Starte Minimal Backend auf Port {self.backend_port}...")
        
        try:
            # Minimal Backend starten
            env = os.environ.copy()
            env['PORT'] = str(self.backend_port)
            
            self.backend_process = subprocess.Popen(
                ['node', '../backend/minimal_server.js'],
                cwd=self.scripts_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True,
                env=env
            )
            
            # Auf Start warten
            print("⏳ Warte auf Minimal Backend-Start...")
            for i in range(15):
                try:
                    response = requests.get(f"{self.backend_url}/health", timeout=3)
                    if response.status_code == 200:
                        print(f"✅ Minimal Backend bereit auf Port {self.backend_port}!")
                        
                        # Zeige Response-Details
                        data = response.json()
                        print(f"📊 Version: {data.get('version', 'unknown')}")
                        print(f"📊 Mode: {data.get('mode', 'unknown')}")
                        return True
                except requests.exceptions.ConnectionError:
                    pass
                except Exception as e:
                    if i == 14:
                        print(f"⚠️ Backend-Start Problem: {e}")
                time.sleep(1)
                
            print("❌ Minimal Backend-Start timeout")
            return False
            
        except Exception as e:
            print(f"❌ Minimal Backend-Start Fehler: {e}")
            return False
    
    def test_minimal_endpoints(self):
        """Teste Minimal Backend-Endpoints"""
        print("🔍 Teste Minimal Backend-Endpoints...")
        
        endpoints = [
            "/health",
            "/api/status", 
            "/api/games"
        ]
        
        for endpoint in endpoints:
            try:
                url = f"{self.backend_url}{endpoint}"
                response = requests.get(url, timeout=5)
                print(f"✅ {endpoint}: HTTP {response.status_code}")
                
                # Zusätzliche Details für /health
                if endpoint == "/health" and response.status_code == 200:
                    data = response.json()
                    print(f"   📊 Uptime: {data.get('uptime', 0)}s")
                    print(f"   📊 Connected Users: {data.get('connectedUsers', 0)}")
                    
            except requests.exceptions.ConnectionError:
                print(f"❌ {endpoint}: CONNECTION REFUSED")
            except requests.exceptions.Timeout:
                print(f"⚠️ {endpoint}: TIMEOUT")
            except Exception as e:
                print(f"❌ {endpoint}: {e}")
    
    def monitor_minimal_backend(self):
        """Überwacht Minimal Backend über längere Zeit"""
        print("\\n🔍 STARTE MINIMAL BACKEND MONITORING...")
        print("💡 Überwacht Minimal Backend alle 30 Sekunden")
        print("📊 Ziel: Testen ob Backend OHNE Database-Code stabil läuft")
        print("🎯 Erwartung: Sollte UNBEGRENZT stabil laufen!")
        
        start_time = datetime.now()
        check_count = 0
        
        while self.running:
            time.sleep(30)
            check_count += 1
            current_time = datetime.now()
            runtime = current_time - start_time
            
            try:
                # Health Check
                response = requests.get(f"{self.backend_url}/health", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    uptime = data.get('uptime', 0)
                    users = data.get('connectedUsers', 0)
                    
                    print(f"✅ Check #{check_count} OK ({current_time.strftime('%H:%M:%S')}) - "
                          f"Laufzeit: {runtime} - Uptime: {uptime}s - Users: {users}")
                else:
                    print(f"⚠️ Check #{check_count} HTTP {response.status_code} - Laufzeit: {runtime}")
                    
                # Milestone-Meldungen
                runtime_minutes = runtime.total_seconds() / 60
                if check_count == 10:  # 5 Minuten
                    print(f"🎉 MILESTONE: 5 Minuten stabil! (Das ist länger als der Original-Server)")
                elif check_count == 20:  # 10 Minuten
                    print(f"🎉 MILESTONE: 10 Minuten stabil! (Minimal Backend ist eindeutig stabiler)")
                elif check_count == 40:  # 20 Minuten  
                    print(f"🎉 MILESTONE: 20 Minuten stabil! (Problem liegt definitiv im Database-Code)")
                    
                # Erweiterte Tests alle 10 Checks
                if check_count % 10 == 0:
                    self.test_minimal_endpoints()
                    
            except requests.exceptions.ConnectionError:
                print(f"❌ Check #{check_count} CONNECTION REFUSED - Minimal Backend ist tot!")
                print(f"💀 Minimal Backend starb nach {runtime} Laufzeit")
                print("🚨 AUCH MINIMAL BACKEND STIRBT - Problem liegt woanders!")
                break
            except requests.exceptions.Timeout:
                print(f"⚠️ Check #{check_count} TIMEOUT - Minimal Backend hängt?")
                print(f"⏰ Laufzeit bis Timeout: {runtime}")
            except Exception as e:
                print(f"❌ Check #{check_count} Fehler: {e}")
                break
    
    def run(self):
        """Hauptfunktion"""
        self.print_banner()
        
        # Prüfe ob minimal_server.js existiert
        if not self.check_minimal_server_exists():
            return False
        
        # Signal-Handler
        def signal_handler(signum, frame):
            print("\\n🛑 Stoppe Minimal Backend-Test...")
            self.running = False
            if self.backend_process:
                self.backend_process.terminate()
            sys.exit(0)
            
        signal.signal(signal.SIGINT, signal_handler)
        self.running = True
        
        # Minimal Backend starten
        if not self.start_minimal_backend():
            print("❌ Minimal Backend konnte nicht gestartet werden")
            return False
        
        # Initial-Tests
        time.sleep(2)
        self.test_minimal_endpoints()
        
        print("\\n🎯 MINIMAL BACKEND LÄUFT - LANGZEIT-TEST GESTARTET")
        print(f"🌐 Minimal Backend: {self.backend_url}/health")
        print("📊 Teste ob Backend ohne Database-Dependencies stabil läuft")
        print("❓ Erwartung: Sollte UNBEGRENZT laufen (kein 2,5 Min Timeout)")
        print("💡 Drücke Ctrl+C zum Stoppen")
        print("-" * 60)
        
        # Langzeit-Monitoring
        try:
            self.monitor_minimal_backend()
        except KeyboardInterrupt:
            pass
        finally:
            if self.backend_process:
                self.backend_process.terminate()


def main():
    """Hauptfunktion"""
    tester = MinimalBackendTester()
    
    try:
        tester.run()
    except KeyboardInterrupt:
        print("\\n🛑 Von Benutzer beendet")
    except Exception as e:
        print(f"💥 Unerwarteter Fehler: {e}")
    finally:
        print("\\n👋 Minimal Backend Tester beendet")


if __name__ == "__main__":
    main()