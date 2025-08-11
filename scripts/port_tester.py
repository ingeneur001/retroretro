#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 Port Tester - System Manipulation Detection
===============================================
Läuft aus scripts/ Ordner und testet ../backend/server.js
auf verschiedenen Ports um System-Manipulation zu erkennen

Struktur:
root/
├── backend/server.js      ← wird getestet
├── frontend/              ← bleibt auf Port 3000
└── scripts/
    └── port_tester.py     ← dieses Script

Version: 2.0 für scripts/
"""

import subprocess
import os
import sys
import time
import signal
import requests
import socket
import json
from pathlib import Path
from datetime import datetime

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("💡 Tipp: 'pip install psutil' für bessere Prozess-Kontrolle")


class PortTester:
    """Testet verschiedene Ports auf System-Manipulation"""
    
    def __init__(self):
        self.scripts_root = Path(__file__).parent  # scripts/
        self.project_root = self.scripts_root.parent  # root/
        self.test_results = {}
        
        # Test verschiedene Port-Kombinationen für Backend
        self.port_configs = [
            {"backend": 3001, "name": "Standard-Port"},
            {"backend": 8080, "name": "HTTP-Alt"},
            {"backend": 8081, "name": "HTTP-Alt2"},
            {"backend": 3333, "name": "Dev-Port"},
            {"backend": 5000, "name": "Flask-Standard"},
            {"backend": 4000, "name": "Alt-Dev"},
            {"backend": 9000, "name": "High-Port"},
            {"backend": 7000, "name": "Extra-Port"},
            {"backend": 6000, "name": "Alt-Port"},
            {"backend": 8888, "name": "Alt-8888"},
        ]
        
    def print_banner(self):
        """Test-Banner ausgeben"""
        print("=" * 80)
        print("🔧 PORT TESTER - BACKEND SERVER STABILITÄT")
        print("=" * 80)
        print(f"⏰ {datetime.now().strftime('%H:%M:%S')}")
        print(f"📁 Scripts: {self.scripts_root}")
        print(f"📁 Projekt: {self.project_root}")
        print("🎯 Teste Backend-Server auf verschiedenen Ports")
        print("🔍 Ports: 3001, 8080, 8081, 3333, 5000, 4000, 9000, 7000, 6000, 8888")
        print("-" * 80)
    
    def check_project_structure(self):
        """Prüft Projekt-Struktur und Dateien"""
        backend_path = self.project_root / "backend"
        frontend_path = self.project_root / "frontend"
        server_path = backend_path / "server.js"
        
        print("🔍 Prüfe Projekt-Struktur...")
        
        # Backend-Ordner prüfen
        if not backend_path.exists():
            print(f"❌ Backend-Ordner nicht gefunden: {backend_path}")
            return False
        print(f"✅ Backend-Ordner: {backend_path}")
        
        # Frontend-Ordner prüfen
        if not frontend_path.exists():
            print(f"❌ Frontend-Ordner nicht gefunden: {frontend_path}")
            return False
        print(f"✅ Frontend-Ordner: {frontend_path}")
        
        # Backend server.js prüfen
        if not server_path.exists():
            print(f"❌ Backend server.js nicht gefunden: {server_path}")
            return False
        print(f"✅ Backend server.js: {server_path}")
        
        # server.js Inhalt prüfen
        try:
            with open(server_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'const PORT = process.env.PORT || 3001;' in content:
                print("✅ Backend server.js hat erwartete Port-Konfiguration")
                return True
            else:
                print("⚠️  Backend server.js hat unerwartete Port-Konfiguration")
                print("💡 Suche nach PORT-Definition:")
                lines = content.split('\\n')
                for i, line in enumerate(lines):
                    if 'PORT' in line.upper() and ('3001' in line or 'process.env' in line):
                        print(f"   Zeile {i+1}: {line.strip()}")
                return True  # Versuche trotzdem
                
        except Exception as e:
            print(f"❌ Fehler beim Lesen von server.js: {e}")
            return False
    
    def kill_processes_on_port(self, port):
        """Tötet Prozesse auf einem Port"""
        killed = False
        
        # Methode 1: psutil (falls verfügbar)
        if PSUTIL_AVAILABLE:
            try:
                for proc in psutil.process_iter(['pid', 'name']):
                    try:
                        for conn in proc.net_connections():
                            if hasattr(conn, 'laddr') and conn.laddr and conn.laddr.port == port:
                                print(f"🔨 Töte Prozess {proc.info['name']} (PID: {proc.info['pid']}) auf Port {port}")
                                proc.kill()
                                killed = True
                    except Exception:
                        continue
            except Exception:
                pass
        
        # Methode 2: Windows netstat + taskkill
        if not killed:
            try:
                result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True, shell=True)
                for line in result.stdout.split('\\n'):
                    if f':{port}' in line and 'LISTENING' in line:
                        parts = line.split()
                        if len(parts) >= 5 and parts[4].isdigit():
                            subprocess.run(['taskkill', '/F', '/PID', parts[4]], 
                                         capture_output=True, shell=True)
                            killed = True
            except Exception:
                pass
        
        if killed:
            time.sleep(2)  # Kurz warten nach dem Töten
        
        return killed
    
    def test_port_with_env_var(self, port, config_name):
        """Testet Backend-Port mit Umgebungsvariable"""
        print(f"\\n🧪 TESTE {config_name}: Backend-Port {port} (Umgebungsvariable)")
        print("-" * 60)
        
        result = {
            "config": config_name,
            "backend_port": port,
            "method": "environment_variable",
            "backend_started": False,
            "initial_health_check": False,
            "survived_30s": False,
            "survived_60s": False,
            "final_status": "unknown",
            "error_messages": []
        }
        
        backend_process = None
        
        try:
            # Port säubern
            print("🧹 Säubere Port...")
            self.kill_processes_on_port(port)
            
            # Backend mit Umgebungsvariable starten
            print(f"🚀 Starte Backend mit PORT={port} Umgebungsvariable...")
            
            env = os.environ.copy()
            env['PORT'] = str(port)
            
            backend_process = subprocess.Popen(
                ['node', '../backend/server.js'],  # Pfad angepasst für scripts/
                cwd=self.scripts_root,  # Aus scripts/ ausführen
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True,
                env=env
            )
            
            # Auf Backend-Start warten
            backend_url = f"http://localhost:{port}"
            backend_ready = False
            
            print("⏳ Warte auf Backend-Start...")
            for i in range(20):  # 20 Sekunden Timeout
                try:
                    response = requests.get(f"{backend_url}/health", timeout=3)
                    if response.status_code == 200:
                        print(f"✅ Backend erfolgreich gestartet auf Port {port}")
                        result["backend_started"] = True
                        result["initial_health_check"] = True
                        backend_ready = True
                        break
                except requests.exceptions.ConnectionError:
                    # Normal beim Startup
                    pass
                except Exception as e:
                    if i == 19:  # Letzter Versuch
                        result["error_messages"].append(f"Health-Check Fehler: {e}")
                time.sleep(1)
            
            if not backend_ready:
                # Prozess-Status prüfen
                if backend_process.poll() is not None:
                    exit_code = backend_process.poll()
                    try:
                        stdout, _ = backend_process.communicate(timeout=2)
                        result["error_messages"].append(f"Backend-Prozess beendet (Exit: {exit_code}): {stdout[-300:]}")
                    except:
                        result["error_messages"].append(f"Backend-Prozess beendet mit Exit-Code: {exit_code}")
                else:
                    result["error_messages"].append("Backend-Start Timeout - Prozess läuft noch aber antwortet nicht")
                result["final_status"] = "start_failed"
                return result
            
            # 30-Sekunden-Test
            print("⏳ Teste 30-Sekunden-Überleben...")
            time.sleep(30)
            
            try:
                response = requests.get(f"{backend_url}/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Backend hat 30 Sekunden überlebt!")
                    result["survived_30s"] = True
                else:
                    print(f"❌ Backend 30s-Test fehlgeschlagen: HTTP {response.status_code}")
                    result["error_messages"].append(f"30s-Test fehlgeschlagen: HTTP {response.status_code}")
            except requests.exceptions.ConnectionError:
                print("❌ Backend 30s-Test fehlgeschlagen: VERBINDUNG VERWEIGERT")
                result["error_messages"].append("30s-Test fehlgeschlagen: VERBINDUNG VERWEIGERT")
            except requests.exceptions.Timeout:
                print("❌ Backend 30s-Test fehlgeschlagen: TIMEOUT")
                result["error_messages"].append("30s-Test fehlgeschlagen: TIMEOUT")
            except Exception as e:
                print(f"❌ Backend 30s-Test fehlgeschlagen: {e}")
                result["error_messages"].append(f"30s-Test fehlgeschlagen: {e}")
            
            # 60-Sekunden-Test (falls 30s erfolgreich)
            if result["survived_30s"]:
                print("⏳ Teste 60-Sekunden-Überleben...")
                time.sleep(30)  # Weitere 30s
                
                try:
                    response = requests.get(f"{backend_url}/health", timeout=5)
                    if response.status_code == 200:
                        print("✅ Backend hat 60 Sekunden überlebt!")
                        result["survived_60s"] = True
                        result["final_status"] = "stable"
                    else:
                        result["error_messages"].append(f"60s-Test fehlgeschlagen: HTTP {response.status_code}")
                        result["final_status"] = "died_after_30s"
                except Exception as e:
                    result["error_messages"].append(f"60s-Test fehlgeschlagen: {e}")
                    result["final_status"] = "died_after_30s"
            else:
                result["final_status"] = "died_before_30s"
            
            # Prozess-Status final prüfen
            if backend_process and backend_process.poll() is not None:
                exit_code = backend_process.poll()
                result["error_messages"].append(f"Backend-Prozess starb mit Exit-Code: {exit_code}")
            
            return result
            
        except Exception as e:
            result["error_messages"].append(f"Test-Exception: {e}")
            result["final_status"] = "test_error"
            return result
            
        finally:
            # Aufräumen
            if backend_process:
                try:
                    backend_process.terminate()
                    backend_process.wait(timeout=5)
                except Exception:
                    try:
                        backend_process.kill()
                    except Exception:
                        pass
    
    def create_temp_server_js(self, port):
        """Erstellt temporäre server.js mit gewünschtem Port"""
        backend_path = self.project_root / "backend"
        original_server = backend_path / "server.js"
        temp_server = backend_path / f"server_port_{port}.js"
        
        try:
            # Original lesen
            with open(original_server, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Port ersetzen
            modified_content = content.replace(
                'const PORT = process.env.PORT || 3001;',
                f'const PORT = process.env.PORT || {port};'
            )
            
            # Falls nicht gefunden, andere Varianten versuchen
            if 'const PORT = process.env.PORT || 3001;' not in content:
                # Andere mögliche Varianten
                modified_content = content.replace(
                    'const port = process.env.PORT || 3001;',
                    f'const port = process.env.PORT || {port};'
                )
                modified_content = modified_content.replace(
                    'const PORT = 3001;',
                    f'const PORT = {port};'
                )
                modified_content = modified_content.replace(
                    'const port = 3001;',
                    f'const port = {port};'
                )
            
            # Temporäre Datei schreiben
            with open(temp_server, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            
            return temp_server
            
        except Exception as e:
            print(f"⚠️  Fehler beim Erstellen der temporären server.js: {e}")
            return None
    
    def test_port_with_temp_file(self, port, config_name):
        """Testet Backend-Port mit temporärer Datei"""
        print(f"\\n🧪 TESTE {config_name}: Backend-Port {port} (Temporäre Datei)")
        print("-" * 60)
        
        result = {
            "config": config_name,
            "backend_port": port,
            "method": "temporary_file",
            "backend_started": False,
            "initial_health_check": False,
            "survived_30s": False,
            "survived_60s": False,
            "final_status": "unknown",
            "error_messages": []
        }
        
        backend_process = None
        temp_server_path = None
        
        try:
            # Port säubern
            print("🧹 Säubere Port...")
            self.kill_processes_on_port(port)
            
            # Temporäre server.js erstellen
            temp_server_path = self.create_temp_server_js(port)
            if not temp_server_path:
                result["error_messages"].append("Konnte temporäre server.js nicht erstellen")
                result["final_status"] = "temp_file_failed"
                return result
            
            print(f"📁 Temporäre server.js erstellt: {temp_server_path.name}")
            
            # Backend mit temporärer Datei starten
            print(f"🚀 Starte Backend mit temporärer Datei...")
            
            # Relativer Pfad zur temporären Datei
            relative_temp_path = f"../backend/{temp_server_path.name}"
            
            backend_process = subprocess.Popen(
                ['node', relative_temp_path],
                cwd=self.scripts_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True
            )
            
            # Rest des Tests identisch zur env_var Methode
            backend_url = f"http://localhost:{port}"
            backend_ready = False
            
            print("⏳ Warte auf Backend-Start...")
            for i in range(20):
                try:
                    response = requests.get(f"{backend_url}/health", timeout=3)
                    if response.status_code == 200:
                        print(f"✅ Backend erfolgreich gestartet auf Port {port}")
                        result["backend_started"] = True
                        result["initial_health_check"] = True
                        backend_ready = True
                        break
                except requests.exceptions.ConnectionError:
                    pass
                except Exception as e:
                    if i == 19:
                        result["error_messages"].append(f"Health-Check Fehler: {e}")
                time.sleep(1)
            
            if not backend_ready:
                if backend_process.poll() is not None:
                    exit_code = backend_process.poll()
                    try:
                        stdout, _ = backend_process.communicate(timeout=2)
                        result["error_messages"].append(f"Backend-Prozess beendet (Exit: {exit_code}): {stdout[-300:]}")
                    except:
                        result["error_messages"].append(f"Backend-Prozess beendet mit Exit-Code: {exit_code}")
                else:
                    result["error_messages"].append("Backend-Start Timeout")
                result["final_status"] = "start_failed"
                return result
            
            # 30-Sekunden-Test
            print("⏳ Teste 30-Sekunden-Überleben...")
            time.sleep(30)
            
            try:
                response = requests.get(f"{backend_url}/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Backend hat 30 Sekunden überlebt!")
                    result["survived_30s"] = True
                else:
                    result["error_messages"].append(f"30s-Test fehlgeschlagen: HTTP {response.status_code}")
            except Exception as e:
                result["error_messages"].append(f"30s-Test fehlgeschlagen: {e}")
            
            # 60-Sekunden-Test
            if result["survived_30s"]:
                print("⏳ Teste 60-Sekunden-Überleben...")
                time.sleep(30)
                
                try:
                    response = requests.get(f"{backend_url}/health", timeout=5)
                    if response.status_code == 200:
                        print("✅ Backend hat 60 Sekunden überlebt!")
                        result["survived_60s"] = True
                        result["final_status"] = "stable"
                    else:
                        result["error_messages"].append(f"60s-Test fehlgeschlagen: HTTP {response.status_code}")
                        result["final_status"] = "died_after_30s"
                except Exception as e:
                    result["error_messages"].append(f"60s-Test fehlgeschlagen: {e}")
                    result["final_status"] = "died_after_30s"
            else:
                result["final_status"] = "died_before_30s"
            
            return result
            
        except Exception as e:
            result["error_messages"].append(f"Test-Exception: {e}")
            result["final_status"] = "test_error"
            return result
            
        finally:
            # Aufräumen
            if backend_process:
                try:
                    backend_process.terminate()
                    backend_process.wait(timeout=5)
                except Exception:
                    try:
                        backend_process.kill()
                    except Exception:
                        pass
            
            # Temporäre Datei löschen
            if temp_server_path and temp_server_path.exists():
                try:
                    temp_server_path.unlink()
                except Exception:
                    pass
    
    def cleanup_temp_files(self):
        """Räumt temporäre Dateien auf"""
        backend_path = self.project_root / "backend"
        
        try:
            for temp_file in backend_path.glob("server_port_*.js"):
                temp_file.unlink()
                print(f"🧹 Temporäre Datei gelöscht: {temp_file.name}")
        except Exception as e:
            print(f"⚠️  Cleanup-Fehler: {e}")
    
    def analyze_results(self):
        """Analysiert Test-Ergebnisse"""
        print("\\n" + "="*80)
        print("📊 ANALYSE DER ERGEBNISSE")
        print("="*80)
        
        stable_ports = []
        unstable_ports = []
        failed_ports = []
        
        for config_name, result in self.test_results.items():
            status = result["final_status"]
            backend_port = result["backend_port"]
            method = result.get("method", "unknown")
            
            if status == "stable":
                stable_ports.append({"port": backend_port, "method": method, "config": config_name})
                print(f"✅ {config_name} (Port {backend_port}, {method}): STABIL")
            elif status in ["died_before_30s", "died_after_30s"]:
                unstable_ports.append(backend_port)
                print(f"❌ {config_name} (Port {backend_port}): WIRD GETÖTET")
                print(f"   📝 Fehler: {', '.join(result['error_messages'][:2])}")  # Nur erste 2 Fehler
            else:
                failed_ports.append(backend_port)
                print(f"⚠️  {config_name} (Port {backend_port}): START FEHLGESCHLAGEN")
                print(f"   📝 Fehler: {', '.join(result['error_messages'][:2])}")
        
        print("\\n🎯 FAZIT:")
        if stable_ports:
            print(f"✅ STABILE PORTS GEFUNDEN:")
            for p in stable_ports:
                print(f"   🎯 Port {p['port']} (Methode: {p['method']})")
        
        if unstable_ports:
            print(f"❌ INSTABILE PORTS: {unstable_ports}")
            print("🚨 Diese Ports werden vom System automatisch getötet!")
        
        if failed_ports:
            print(f"⚠️  FEHLGESCHLAGENE PORTS: {failed_ports}")
        
        return stable_ports
    
    def save_test_results(self, stable_ports):
        """Speichert Test-Ergebnisse für späteren Zugriff"""
        results_file = self.scripts_root / "port_test_results.json"
        
        data = {
            "timestamp": datetime.now().isoformat(),
            "test_version": "2.0_scripts",
            "stable_ports": stable_ports,
            "project_structure": {
                "scripts_root": str(self.scripts_root),
                "project_root": str(self.project_root)
            },
            "full_results": self.test_results
        }
        
        try:
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"💾 Test-Ergebnisse gespeichert: {results_file}")
        except Exception as e:
            print(f"⚠️  Konnte Ergebnisse nicht speichern: {e}")
    
    def create_working_launcher(self, stable_port_info):
        """Erstellt working_launcher.py im scripts/ Ordner"""
        port = stable_port_info["port"]
        method = stable_port_info["method"]
        
        if method == "environment_variable":
            backend_start_code = '''
            # Backend mit Umgebungsvariable starten (getestete Methode)
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
            )'''
        else:  # temporary_file
            backend_start_code = '''
            # Backend mit temporärer server.js starten (getestete Methode)
            temp_server = self.create_temp_server_js()
            if not temp_server:
                return False
            
            relative_temp_path = f"../backend/{temp_server.name}"
            self.backend_process = subprocess.Popen(
                ['node', relative_temp_path],
                cwd=self.scripts_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True
            )'''
        
        launcher_content = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎮 WORKING LAUNCHER - Port {port}
===================================
Automatisch generiert vom Port Tester
Läuft aus scripts/ Ordner

Getestete Methode: {method}
Stabiler Backend-Port: {port}
Frontend-Port: 3000 (unverändert)

Generiert am: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

import subprocess
import os
import sys
import time
import signal
import requests
import webbrowser
from pathlib import Path
from datetime import datetime


class WorkingLauncher:
    """Launcher mit bestätigtem stabilen Backend-Port"""
    
    def __init__(self):
        self.scripts_root = Path(__file__).parent  # scripts/
        self.project_root = self.scripts_root.parent  # root/
        self.backend_port = {port}
        self.frontend_port = 3000
        self.backend_url = f"http://localhost:{{self.backend_port}}"
        self.frontend_url = f"http://localhost:{{self.frontend_port}}"
        self.backend_process = None
        self.frontend_process = None
        self.running = False
        self.temp_server_path = None
        
    def print_banner(self):
        """Start-Banner"""
        print("=" * 60)
        print(f"🎮 WORKING LAUNCHER - STABILER PORT {{self.backend_port}}")
        print("=" * 60)
        print(f"⏰ {{datetime.now().strftime('%H:%M:%S')}}")
        print(f"📁 Scripts: {{self.scripts_root}}")
        print(f"📁 Projekt: {{self.project_root}}")
        print("✅ Getestete Methode: {method}")
        print(f"🎯 Backend: Port {{self.backend_port}} (stabil getestet)")
        print(f"🎯 Frontend: Port {{self.frontend_port}} (Standard)")
        print("-" * 60)
    
    def create_temp_server_js(self):
        """Erstellt temporäre server.js mit richtigem Port (falls nötig)"""
        backend_path = self.project_root / "backend"
        original_server = backend_path / "server.js"
        temp_server = backend_path / f"server_working_{{self.backend_port}}.js"
        
        try:
            with open(original_server, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Port ersetzen
            modified_content = content.replace(
                'const PORT = process.env.PORT || 3001;',
                f'const PORT = process.env.PORT || {{self.backend_port}};'
            )
            
            # Alternative Varianten falls Standard nicht gefunden
            if 'const PORT = process.env.PORT || 3001;' not in content:
                modified_content = content.replace(
                    'const port = process.env.PORT || 3001;',
                    f'const port = process.env.PORT || {{self.backend_port}};'
                )
                modified_content = modified_content.replace(
                    'const PORT = 3001;',
                    f'const PORT = {{self.backend_port}};'
                )
            
            with open(temp_server, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            
            self.temp_server_path = temp_server
            return temp_server
            
        except Exception as e:
            print(f"⚠️  Fehler beim Erstellen der temporären server.js: {{e}}")
            return None
    
    def cleanup_temp_server(self):
        """Räumt temporäre server.js auf"""
        if self.temp_server_path and self.temp_server_path.exists():
            try:
                self.temp_server_path.unlink()
                print(f"🧹 Temporäre Datei gelöscht: {{self.temp_server_path.name}}")
            except Exception as e:
                print(f"⚠️  Cleanup-Fehler: {{e}}")
    
    def start_backend(self):
        """Backend auf stabilem Port starten"""
        print(f"🚀 Starte Backend auf STABILEM Port {{self.backend_port}} ({method})...")
        
        try:{backend_start_code}
            
            # Auf Backend-Start warten
            print("⏳ Warte auf Backend-Start...")
            for i in range(20):
                try:
                    response = requests.get(f"{{self.backend_url}}/health", timeout=3)
                    if response.status_code == 200:
                        print(f"✅ Backend bereit auf Port {{self.backend_port}}!")
                        return True
                except requests.exceptions.ConnectionError:
                    pass  # Normal beim Startup
                except Exception as e:
                    if i == 19:  # Letzter Versuch
                        print(f"⚠️  Backend-Start Problem: {{e}}")
                time.sleep(1)
                
            print("❌ Backend-Start timeout")
            return False
            
        except Exception as e:
            print(f"❌ Backend-Start Fehler: {{e}}")
            return False
    
    def start_frontend(self):
        """Frontend starten"""
        print("🚀 Starte Frontend...")
        
        try:
            frontend_path = self.project_root / "frontend"
            
            if not frontend_path.exists():
                print(f"❌ Frontend-Ordner nicht gefunden: {{frontend_path}}")
                return False
            
            # Frontend starten (aus scripts/ Ordner)
            self.frontend_process = subprocess.Popen(
                ['npm', 'start'],
                cwd=frontend_path,  # Direkt im frontend/ Ordner ausführen
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True,
                env={{**os.environ, 'BROWSER': 'none'}}  # Browser nicht automatisch öffnen
            )
            
            print("⏳ Warte auf Frontend-Compilation...")
            for i in range(60):  # Frontend braucht länger
                try:
                    response = requests.get(f"{{self.frontend_url}}", timeout=3)
                    if response.status_code == 200:
                        print("✅ Frontend bereit!")
                        return True
                except requests.exceptions.ConnectionError:
                    pass  # Normal beim Startup
                except Exception:
                    pass
                time.sleep(2)
                
            # Auch bei Timeout weitermachen - Frontend braucht manchmal sehr lange
            print("⏳ Frontend noch am Compilieren, mache trotzdem weiter...")
            return True
            
        except Exception as e:
            print(f"❌ Frontend-Start Fehler: {{e}}")
            return False
    
    def open_browser(self):
        """Browser zur App öffnen"""
        app_url = f"{{self.frontend_url}}/legal-retro-gaming-service"
        print(f"🌐 Öffne Browser: {{app_url}}")
        
        try:
            webbrowser.open(app_url)
        except Exception:
            print(f"💡 Bitte manuell öffnen: {{app_url}}")
    
    def monitor_health(self):
        """Überwacht die Gesundheit der Services"""
        print("\\n🔍 Starte Gesundheits-Überwachung...")
        print("💡 Alle 30 Sekunden wird Backend-Gesundheit geprüft")
        
        while self.running:
            time.sleep(30)
            
            try:
                response = requests.get(f"{{self.backend_url}}/health", timeout=10)
                if response.status_code == 200:
                    print(f"✅ Backend-Check OK ({{datetime.now().strftime('%H:%M:%S')}})")
                else:
                    print(f"⚠️  Backend antwortet mit Status {{response.status_code}}")
                    
            except requests.exceptions.ConnectionError:
                print("❌ Backend-Verbindung verloren!")
                print("🚨 SYSTEM HAT BACKEND WAHRSCHEINLICH GETÖTET!")
                print(f"💡 Port {{self.backend_port}} war als stabil getestet - das ist unerwartet!")
                break
            except requests.exceptions.Timeout:
                print("⚠️  Backend-Timeout (aber Prozess läuft noch)")
            except Exception as e:
                print(f"⚠️  Gesundheits-Check Fehler: {{e}}")
                break
    
    def run(self):
        """Hauptfunktion - startet alles"""
        self.print_banner()
        
        # Signal-Handler für sauberes Beenden
        def signal_handler(signum, frame):
            print("\\n🛑 Stoppe Services...")
            self.running = False
            if self.backend_process:
                self.backend_process.terminate()
            if self.frontend_process:
                self.frontend_process.terminate()
            self.cleanup_temp_server()
            sys.exit(0)
            
        signal.signal(signal.SIGINT, signal_handler)
        self.running = True
        
        # Backend starten
        if not self.start_backend():
            print("❌ Backend konnte nicht gestartet werden")
            self.cleanup_temp_server()
            return False
            
        # Frontend starten
        if not self.start_frontend():
            print("❌ Frontend konnte nicht gestartet werden")
            self.cleanup_temp_server()
            return False
        
        # Kurz warten dann Browser öffnen
        time.sleep(3)
        self.open_browser()
        
        # Status ausgeben
        print("\\n🎉 ALLE SERVICES LAUFEN!")
        print(f"🌐 Frontend: {{self.frontend_url}}/legal-retro-gaming-service")
        print(f"🔗 Backend:  {{self.backend_url}}/health")
        print(f"✅ Stabiler Backend-Port: {{self.backend_port}} (Methode: {method})")
        print("💡 Drücke Ctrl+C zum Stoppen")
        print("-" * 60)
        
        # Gesundheits-Überwachung starten
        try:
            self.monitor_health()
        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup_temp_server()


def main():
    """Hauptfunktion"""
    launcher = WorkingLauncher()
    
    try:
        success = launcher.run()
        if not success:
            print("❌ Launcher konnte nicht gestartet werden")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\\n🛑 Von Benutzer beendet")
    except Exception as e:
        print(f"💥 Unerwarteter Fehler: {{e}}")
        launcher.cleanup_temp_server()
    finally:
        print("👋 Working Launcher beendet")


if __name__ == "__main__":
    main()
'''
        
        # working_launcher.py im scripts/ Ordner erstellen
        working_launcher_path = self.scripts_root / "working_launcher.py"
        try:
            with open(working_launcher_path, 'w', encoding='utf-8') as f:
                f.write(launcher_content)
            
            print(f"\\n🎉 WORKING LAUNCHER ERSTELLT!")
            print(f"📁 Datei: {working_launcher_path}")
            print(f"🚀 Verwendung: cd scripts && python working_launcher.py")
            print(f"✅ Backend-Port: {port} (Methode: {method})")
            print(f"✅ Frontend-Port: 3000 (Standard)")
            
            return True
            
        except Exception as e:
            print(f"⚠️  Fehler beim Erstellen des Working Launchers: {e}")
            return False
    
    def run_comprehensive_test(self):
        """Führt umfassende Port-Tests durch"""
        self.print_banner()
        
        # Signal-Handler für sauberes Beenden
        def signal_handler(signum, frame):
            print("\\n🛑 Test unterbrochen!")
            self.cleanup_temp_files()
            sys.exit(0)
        signal.signal(signal.SIGINT, signal_handler)
        
        # Projekt-Struktur prüfen
        if not self.check_project_structure():
            print("❌ Projekt-Struktur-Problem - Test wird abgebrochen")
            return []
        
        print("\\n🏁 STARTE PORT-TESTS...")
        print("⏱️  Geschätzte Dauer: ~20 Minuten")
        print("🔍 Teste jeden Port mit 2 Methoden (ENV + TEMP)")
        
        # Jede Konfiguration mit beiden Methoden testen
        for i, config in enumerate(self.port_configs, 1):
            port = config["backend"]
            name = config["name"]
            
            print(f"\\n📋 TEST {i}/{len(self.port_configs)} - {name} (Port {port})")
            print("="*70)
            
            # Methode 1: Umgebungsvariable (bevorzugt)
            print("🧪 Teste Methode 1: Umgebungsvariable")
            result_env = self.test_port_with_env_var(port, f"{name}-ENV")
            self.test_results[f"{name}-ENV"] = result_env
            
            # Kurze Pause zwischen Methoden
            time.sleep(2)
            
            # Methode 2: Temporäre Datei (falls ENV nicht stabil)
            if result_env["final_status"] != "stable":
                print("🧪 Teste Methode 2: Temporäre Datei")
                result_temp = self.test_port_with_temp_file(port, f"{name}-TEMP")
                self.test_results[f"{name}-TEMP"] = result_temp
            else:
                print("✅ Umgebungsvariable war stabil - überspringe temporäre Datei")
            
            # Längere Pause zwischen Port-Tests
            if i < len(self.port_configs):
                print("\\n⏸️  Pause zwischen Port-Tests...")
                time.sleep(5)
        
        # Ergebnisse analysieren
        stable_ports = self.analyze_results()
        
        # Ergebnisse speichern
        self.save_test_results(stable_ports)
        
        # Working Launcher erstellen falls stabile Ports gefunden
        if stable_ports:
            self.create_working_launcher(stable_ports[0])
        
        # Temporäre Dateien aufräumen
        self.cleanup_temp_files()
        
        return stable_ports


def main():
    """Hauptfunktion"""
    print("🔧 Port Tester für scripts/ Ordner wird gestartet...")
    print("📁 Testet Backend-Server auf verschiedenen Ports")
    print("🎯 Findet stabile Ports die nicht vom System getötet werden")
    
    tester = PortTester()
    
    try:
        stable_ports = tester.run_comprehensive_test()
        
        print("\\n" + "="*80)
        print("📋 FINAL REPORT")
        print("="*80)
        
        if stable_ports:
            print("🎯 ERFOLG! Stabile Backend-Ports gefunden:")
            for port_info in stable_ports:
                print(f"   ✅ Port {port_info['port']} (Methode: {port_info['method']})")
            
            print("\\n🚀 NÄCHSTE SCHRITTE:")
            print("   1. cd scripts")
            print("   2. python working_launcher.py")
            print("\\n💡 Der Working Launcher:")
            print("   🎯 Startet Backend auf stabilem Port")
            print("   🎯 Startet Frontend auf Port 3000")
            print("   🎯 Öffnet automatisch den Browser")
            print("   🎯 Überwacht die Gesundheit der Services")
            
        else:
            print("❌ Keine stabilen Backend-Ports gefunden")
            print("🚨 Das System tötet wahrscheinlich alle Node.js Backend-Prozesse!")
            print("\\n💡 NÄCHSTE SCHRITTE:")
            print("   1. Als Administrator ausführen:")
            print("      - Rechtsklick auf cmd/PowerShell → 'Als Administrator'")
            print("      - cd scripts")
            print("      - python port_tester.py")
            print("\\n   2. Security-Software temporär deaktivieren:")
            print("      - Windows Defender Echtzeitschutz aus")
            print("      - Antivirus temporär deaktivieren")
            print("      - Test wiederholen")
            print("\\n   3. Firewall-Regeln hinzufügen:")
            print("      - Windows Firewall → Erweiterte Einstellungen")
            print("      - Eingehende Regel für Node.js erlauben")
            
    except KeyboardInterrupt:
        print("\\n🛑 Test wurde unterbrochen")
        tester.cleanup_temp_files()
    except Exception as e:
        print(f"💥 Test-Fehler: {e}")
        import traceback
        print(f"📋 Details: {traceback.format_exc()}")
        tester.cleanup_temp_files()
    finally:
        print("\\n👋 Port Tester beendet")


if __name__ == "__main__":
    main()