#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 Backend-Only Tester
======================
Startet nur das Backend für isolierte Tests
Überwacht Stabilität ohne Frontend-Einfluss
"""

import subprocess
import os
import sys
import time
import signal
import requests
from pathlib import Path
from datetime import datetime


class BackendOnlyTester:
    """Testet nur das Backend isoliert"""
    
    def __init__(self):
        self.scripts_root = Path(__file__).parent
        self.project_root = self.scripts_root.parent
        self.backend_port = 3001  # Verwende den "stabilen" Port
        self.backend_url = f"http://localhost:{self.backend_port}"
        self.backend_process = None
        self.running = False
        
    def print_banner(self):
        """Banner"""
        print("=" * 60)
        print("🔍 BACKEND-ONLY TESTER")
        print("=" * 60)
        print(f"⏰ {datetime.now().strftime('%H:%M:%S')}")
        print(f"🎯 Testet nur Backend auf Port {self.backend_port}")
        print("📋 KEIN Frontend - isolierter Backend-Test")
        print("-" * 60)
    
    def start_backend(self):
        """Backend starten"""
        print(f"🚀 Starte Backend auf Port {self.backend_port}...")
        
        try:
            # Backend mit Umgebungsvariable starten
            env = os.environ.copy()
            env['PORT'] = str(self.backend_port)
            
            self.backend_process = subprocess.Popen(
                ['node', '../backend/server.js'],
                cwd=self.scripts_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True,
                env=env
            )
            
            # Auf Start warten
            print("⏳ Warte auf Backend-Start...")
            for i in range(20):
                try:
                    response = requests.get(f"{self.backend_url}/health", timeout=3)
                    if response.status_code == 200:
                        print(f"✅ Backend bereit auf Port {self.backend_port}!")
                        return True
                except requests.exceptions.ConnectionError:
                    pass
                except Exception as e:
                    if i == 19:
                        print(f"⚠️ Backend-Start Problem: {e}")
                time.sleep(1)
                
            print("❌ Backend-Start timeout")
            return False
            
        except Exception as e:
            print(f"❌ Backend-Start Fehler: {e}")
            return False
    
    def test_backend_endpoints(self):
        """Teste verschiedene Backend-Endpoints"""
        print("🔍 Teste Backend-Endpoints...")
        
        endpoints = [
            "/health",
            "/",
            "/api/status"  # Falls vorhanden
        ]
        
        for endpoint in endpoints:
            try:
                url = f"{self.backend_url}{endpoint}"
                response = requests.get(url, timeout=5)
                print(f"✅ {endpoint}: HTTP {response.status_code}")
            except requests.exceptions.ConnectionError:
                print(f"❌ {endpoint}: CONNECTION REFUSED")
            except requests.exceptions.Timeout:
                print(f"⚠️ {endpoint}: TIMEOUT")
            except Exception as e:
                print(f"❌ {endpoint}: {e}")
    
    def monitor_backend_health(self):
        """Überwacht Backend-Gesundheit über längere Zeit"""
        print("\n🔍 STARTE LANGZEIT-MONITORING...")
        print("💡 Überwacht Backend alle 30 Sekunden")
        print("📊 Ziel: Herausfinden wann/warum Backend stirbt")
        print("⏰ Laufzeit wird gemessen...")
        
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
                    print(f"✅ Check #{check_count} OK ({current_time.strftime('%H:%M:%S')}) - Laufzeit: {runtime}")
                else:
                    print(f"⚠️ Check #{check_count} HTTP {response.status_code} - Laufzeit: {runtime}")
                    
                # Zusätzliche Tests alle 5 Checks
                if check_count % 5 == 0:
                    self.test_backend_endpoints()
                    
            except requests.exceptions.ConnectionError:
                print(f"❌ Check #{check_count} CONNECTION REFUSED - Backend ist tot!")
                print(f"💀 Backend starb nach {runtime} Laufzeit")
                print("🚨 BACKEND-TOD ERKANNT!")
                break
            except requests.exceptions.Timeout:
                print(f"⚠️ Check #{check_count} TIMEOUT - Backend hängt?")
                print(f"⏰ Laufzeit bis Timeout: {runtime}")
            except Exception as e:
                print(f"❌ Check #{check_count} Fehler: {e}")
                break
    
    def check_backend_process(self):
        """Prüft ob Backend-Prozess noch läuft"""
        if self.backend_process:
            if self.backend_process.poll() is None:
                print("✅ Backend-Prozess läuft noch")
                return True
            else:
                exit_code = self.backend_process.poll()
                print(f"❌ Backend-Prozess tot (Exit-Code: {exit_code})")
                try:
                    stdout, _ = self.backend_process.communicate(timeout=2)
                    print(f"📋 Prozess-Output: {stdout[-500:]}")
                except:
                    pass
                return False
        return False
    
    def run(self):
        """Hauptfunktion"""
        self.print_banner()
        
        # Signal-Handler
        def signal_handler(signum, frame):
            print("\n🛑 Stoppe Backend-Test...")
            self.running = False
            if self.backend_process:
                self.backend_process.terminate()
            sys.exit(0)
            
        signal.signal(signal.SIGINT, signal_handler)
        self.running = True
        
        # Backend starten
        if not self.start_backend():
            print("❌ Backend konnte nicht gestartet werden")
            return False
        
        # Initial-Tests
        time.sleep(2)
        self.test_backend_endpoints()
        
        print("\n🎯 BACKEND LÄUFT - MONITORING GESTARTET")
        print(f"🌐 Backend: {self.backend_url}/health")
        print("📊 Überwache Backend-Stabilität ohne Frontend")
        print("❓ Frage: Stirbt das Backend auch OHNE Frontend?")
        print("💡 Drücke Ctrl+C zum Stoppen")
        print("-" * 60)
        
        # Langzeit-Monitoring
        try:
            self.monitor_backend_health()
        except KeyboardInterrupt:
            pass
        finally:
            if self.backend_process:
                self.backend_process.terminate()


def main():
    """Hauptfunktion"""
    tester = BackendOnlyTester()
    
    try:
        tester.run()
    except KeyboardInterrupt:
        print("\n🛑 Von Benutzer beendet")
    except Exception as e:
        print(f"💥 Unerwarteter Fehler: {e}")
    finally:
        print("\n👋 Backend-Only Tester beendet")


if __name__ == "__main__":
    main()