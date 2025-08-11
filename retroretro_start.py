#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎮 RETRORETRO START - ENHANCED UNIFIED LAUNCHER
===============================================
Professional launcher with port management and enhanced monitoring
Includes frontend status validation and automatic port cleanup

Version: 2.1 - Enhanced & Port-Managed
Features: Backend-first startup, Frontend status monitoring, Port cleanup
"""

import subprocess
import os
import sys
import time
import signal
import requests
import webbrowser
import platform
from pathlib import Path
from datetime import datetime
from threading import Thread, Event


class PortManager:
    """Windows-kompatibles Port-Management"""
    
    def __init__(self):
        self.is_windows = platform.system() == 'Windows'
        self.common_ports = [3000, 3001, 5000, 8000]
    
    def clear_port(self, port):
        """Räume spezifischen Port auf"""
        print(f"🔧 Clearing port {port}...")
        
        if self.is_windows:
            return self._clear_port_windows(port)
        else:
            return self._clear_port_unix(port)
    
    def _clear_port_windows(self, port):
        """Windows Port Cleanup"""
        try:
            # Finde Prozess auf Port
            result = subprocess.run(
                ['netstat', '-ano'],
                capture_output=True, text=True, shell=True
            )
            
            if result.stdout:
                for line in result.stdout.split('\n'):
                    if f':{port}' in line and 'LISTENING' in line:
                        parts = line.split()
                        if len(parts) > 4:
                            pid = parts[-1]
                            print(f"  Found process PID {pid} on port {port}")
                            
                            # Töte Prozess
                            kill_result = subprocess.run(
                                ['taskkill', '/F', '/PID', pid],
                                capture_output=True, text=True
                            )
                            
                            if kill_result.returncode == 0:
                                print(f"  Process {pid} terminated")
                                return True
                            else:
                                print(f"  Failed to terminate process {pid}")
                
                print(f"  Port {port} is already free")
                return True
                
        except Exception as e:
            print(f"  Error clearing port {port}: {e}")
            return False
    
    def _clear_port_unix(self, port):
        """Unix/Linux/Mac Port Cleanup"""
        try:
            result = subprocess.run(
                ['lsof', '-ti', f':{port}'],
                capture_output=True, text=True
            )
            
            if result.stdout:
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    if pid:
                        print(f"  Found process PID {pid} on port {port}")
                        subprocess.run(['kill', '-9', pid])
                        print(f"  Process {pid} terminated")
                return True
            else:
                print(f"  Port {port} is already free")
                return True
                
        except Exception as e:
            print(f"  Error clearing port {port}: {e}")
            return False
    
    def clear_development_ports(self):
        """Räume alle Development-Ports auf"""
        print("🧹 CLEARING DEVELOPMENT PORTS")
        print("-" * 40)
        
        for port in self.common_ports:
            self.clear_port(port)
        
        print("Port cleanup completed")


class FrontendStatusMonitor:
    """Monitor für Frontend Online-Status"""
    
    def __init__(self, frontend_url):
        self.frontend_url = frontend_url
        self.status_check_url = f"{frontend_url}/api/status"  # Falls Frontend Status-API hat
        self.is_monitoring = False
        self.status_thread = None
        self.stop_event = Event()
    
    def check_frontend_status(self):
        """Prüfe Frontend Online-Status"""
        try:
            # Versuche Frontend-Seite zu erreichen
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                # Zusätzlich: Prüfe ob Backend-Verbindung im Frontend funktioniert
                # Das würde bedeuten, dass der "Online-Status" grün ist
                return self._check_backend_connectivity_from_frontend()
            return False
        except Exception:
            return False
    
    def _check_backend_connectivity_from_frontend(self):
        """Simuliere Check ob Frontend-Backend Verbindung steht (grüner Status)"""
        try:
            # Prüfe ob Backend von Frontend aus erreichbar ist
            # In der Realität würde das Frontend eine API-Anfrage machen
            response = requests.get("http://localhost:3001/health", timeout=3)
            return response.status_code == 200
        except Exception:
            return False
    
    def start_monitoring(self):
        """Starte kontinuierliches Status-Monitoring"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        self.stop_event.clear()
        self.status_thread = Thread(target=self._monitor_loop, daemon=True)
        self.status_thread.start()
        print("🔍 Frontend status monitoring started")
    
    def _monitor_loop(self):
        """Monitor-Loop für Frontend-Status"""
        last_status = None
        
        while not self.stop_event.is_set():
            current_status = self.check_frontend_status()
            
            # Nur bei Statuswechsel ausgeben
            if current_status != last_status:
                timestamp = datetime.now().strftime('%H:%M:%S')
                if current_status:
                    print(f"🟢 [{timestamp}] Frontend Online-Status: GREEN (Backend connection active)")
                else:
                    print(f"🟡 [{timestamp}] Frontend Online-Status: YELLOW (Checking...)")
                last_status = current_status
            
            # Warte 10 Sekunden bis zum nächsten Check
            self.stop_event.wait(10)
    
    def stop_monitoring(self):
        """Stoppe Status-Monitoring"""
        if self.is_monitoring:
            self.stop_event.set()
            self.is_monitoring = False
            if self.status_thread:
                self.status_thread.join(timeout=2)
            print("🔍 Frontend status monitoring stopped")


class RetroRetroLauncher:
    """Enhanced launcher with port management and status monitoring"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_port = 3001
        self.frontend_port = 3000
        self.backend_url = f"http://localhost:{self.backend_port}"
        self.frontend_url = f"http://localhost:{self.frontend_port}"
        self.backend_process = None
        self.frontend_process = None
        self.running = False
        
        # Neue Komponenten
        self.port_manager = PortManager()
        self.frontend_monitor = FrontendStatusMonitor(self.frontend_url)
        
        # Health check endpoints
        self.health_endpoints = [
            f"{self.backend_url}/health",
            f"{self.backend_url}/health-db", 
            f"{self.backend_url}/api/status",
            f"{self.backend_url}/api/games"
        ]
        
    def print_banner(self):
        """Enhanced startup banner"""
        print("=" * 80)
        print("🎮 RETRORETRO START - ENHANCED UNIFIED LAUNCHER")
        print("=" * 80)
        print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📁 Project Root: {self.project_root}")
        print(f"🎯 Backend Port: {self.backend_port}")
        print(f"🎯 Frontend Port: {self.frontend_port}")
        print("🔧 Features: Port cleanup, Backend-first startup, Frontend monitoring")
        print("-" * 80)
    
    def check_prerequisites(self):
        """Check if all required files exist"""
        print("🔍 Checking prerequisites...")
        
        backend_path = self.project_root / "backend"
        frontend_path = self.project_root / "frontend"
        
        # Flexible Backend-Check (backend/ oder server.js im Root)
        server_js_backend = backend_path / "server.js"
        server_js_root = self.project_root / "server.js"
        
        if not (server_js_backend.exists() or server_js_root.exists()):
            print("Backend server.js not found in backend/ or root directory")
            return False
        
        if not frontend_path.exists():
            print(f"Frontend directory not found: {frontend_path}")
            return False
        
        frontend_package = frontend_path / "package.json"
        if not frontend_package.exists():
            print("Frontend package.json not found")
            return False
        
        print("Prerequisites check passed!")
        return True
    
    def clear_ports_before_start(self):
        """Räume Ports vor dem Start auf"""
        print("🧹 PRE-START PORT CLEANUP")
        print("-" * 40)
        
        # Räume beide Haupt-Ports auf
        self.port_manager.clear_port(self.backend_port)
        self.port_manager.clear_port(self.frontend_port)
        
        print("Pre-start port cleanup completed")
    
    def start_backend(self):
        """Start backend with visible console output"""
        print(f"🚀 Starting Backend on Port {self.backend_port}...")
        
        try:
            # Environment variable method
            env = os.environ.copy()
            env['PORT'] = str(self.backend_port)
            
            # Bestimme Backend-Pfad
            backend_path = self.project_root / "backend"
            if not backend_path.exists():
                # Fallback: server.js im Root
                backend_path = self.project_root
            
            # Starte Backend mit sichtbarer Konsole
            self.backend_process = subprocess.Popen(
                ['node', 'server.js'],
                cwd=backend_path,
                env=env,
                # Backend-Ausgabe bleibt sichtbar (kein capture_output)
                shell=True
            )
            
            print(f"Backend process started (PID: {self.backend_process.pid})")
            print("Backend console output is visible in this window")
            
            # Warte auf Backend-Startup
            print("⏳ Waiting for backend to be ready...")
            for i in range(30):
                try:
                    response = requests.get(f"{self.backend_url}/health", timeout=3)
                    if response.status_code == 200:
                        print(f"Backend is ready on port {self.backend_port}!")
                        return True
                except requests.exceptions.ConnectionError:
                    pass
                except Exception as e:
                    if i > 25:
                        print(f"Backend check issue: {e}")
                
                if i % 5 == 0:
                    print(f"   Still starting... ({i}/30s)")
                    
                time.sleep(1)
                
            print("Backend startup timeout - but continuing...")
            return True  # Continue even if health check fails
            
        except Exception as e:
            print(f"Backend startup error: {e}")
            return False
    
    def start_frontend(self):
        """Start frontend in separate process"""
        print("🚀 Starting Frontend...")
        
        try:
            frontend_path = self.project_root / "frontend"
            
            # Environment ohne Auto-Browser
            env = os.environ.copy()
            env['BROWSER'] = 'none'
            
            # Starte Frontend in separatem Prozess
            self.frontend_process = subprocess.Popen(
                ['npm', 'start'],
                cwd=frontend_path,
                env=env,
                shell=True
            )
            
            print(f"Frontend process started (PID: {self.frontend_process.pid})")
            
            # Warte auf Frontend-Compilation
            print("⏳ Waiting for frontend compilation...")
            for i in range(60):  # 1 minute for initial compilation
                try:
                    response = requests.get(self.frontend_url, timeout=3)
                    if response.status_code == 200:
                        print("Frontend compilation completed!")
                        return True
                except requests.exceptions.ConnectionError:
                    pass
                except Exception:
                    pass
                
                if i % 10 == 0 and i > 0:
                    print(f"   Still compiling... ({i}/60s)")
                    
                time.sleep(1)
            
            # Continue anyway - React dev server can be slow
            print("Frontend taking longer to compile, but continuing...")
            return True
            
        except Exception as e:
            print(f"Frontend startup error: {e}")
            return False
    
    def run_health_checks(self):
        """Enhanced health checks"""
        print("\n🏥 Running comprehensive health checks...")
        
        health_results = {}
        
        for endpoint in self.health_endpoints:
            endpoint_name = endpoint.split('/')[-1] or 'root'
            try:
                response = requests.get(endpoint, timeout=10)
                if response.status_code == 200:
                    print(f"  {endpoint_name}: OK")
                    health_results[endpoint_name] = "OK"
                else:
                    print(f"  {endpoint_name}: HTTP {response.status_code}")
                    health_results[endpoint_name] = f"HTTP {response.status_code}"
            except requests.exceptions.ConnectionError:
                print(f"  {endpoint_name}: Connection refused")
                health_results[endpoint_name] = "Connection refused"
            except Exception as e:
                print(f"  {endpoint_name}: Error - {str(e)[:30]}...")
                health_results[endpoint_name] = "Error"
        
        working_endpoints = sum(1 for status in health_results.values() if status == "OK")
        total_endpoints = len(health_results)
        
        print(f"\nHealth Check Summary: {working_endpoints}/{total_endpoints} endpoints working")
        
        return working_endpoints >= 1  # At least one endpoint working
    
    def open_browser_and_check_status(self):
        """Öffne Browser und starte Frontend-Status-Monitoring"""
        print(f"🌐 Opening application: {self.frontend_url}")
        
        try:
            webbrowser.open(self.frontend_url)
            print("Browser opened successfully")
            
            # Kurz warten, dann Frontend-Status-Monitoring starten
            time.sleep(3)
            print("🔍 Starting frontend status monitoring...")
            print("💡 Monitoring if frontend shows green online status...")
            
            self.frontend_monitor.start_monitoring()
            
        except Exception as e:
            print(f"Auto-browser failed: {e}")
            print(f"Please manually open: {self.frontend_url}")
    
    def monitor_system_with_status(self):
        """Enhanced system monitoring mit Frontend-Status"""
        print("\n🔍 Starting enhanced system monitoring...")
        print("💡 Monitoring backend health and frontend online status")
        print("💡 Backend console output continues below")
        print("💡 Press Ctrl+C to stop both servers")
        print("-" * 60)
        
        consecutive_failures = 0
        max_failures = 3
        
        while self.running:
            # Backend Health Check alle 30 Sekunden
            time.sleep(30)
            
            try:
                response = requests.get(f"{self.backend_url}/health", timeout=10)
                if response.status_code == 200:
                    # Nur alle 5 Minuten eine OK-Meldung, sonst zu viel Output
                    if consecutive_failures > 0 or int(time.time()) % 300 == 0:
                        timestamp = datetime.now().strftime('%H:%M:%S')
                        print(f"\n🟢 [{timestamp}] System Status: HEALTHY")
                        consecutive_failures = 0
                else:
                    consecutive_failures += 1
                    timestamp = datetime.now().strftime('%H:%M:%S')
                    print(f"\n🟡 [{timestamp}] Backend health issue: HTTP {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                consecutive_failures += 1
                timestamp = datetime.now().strftime('%H:%M:%S')
                print(f"\n🔴 [{timestamp}] Backend connection lost!")
            except Exception as e:
                consecutive_failures += 1
                timestamp = datetime.now().strftime('%H:%M:%S')
                print(f"\n🟡 [{timestamp}] Monitor error: {e}")
            
            # Alert bei kritischen Problemen
            if consecutive_failures >= max_failures:
                print(f"\n🚨 [{datetime.now().strftime('%H:%M:%S')}] CRITICAL: Multiple health check failures!")
                print("💡 Consider manual restart if issues persist")
                consecutive_failures = 0
    
    def cleanup_with_ports(self):
        """Enhanced cleanup mit Port-Clearing"""
        print("\n🧹 ENHANCED CLEANUP PROCESS")
        print("-" * 40)
        
        # Stoppe Frontend-Monitoring
        if self.frontend_monitor:
            self.frontend_monitor.stop_monitoring()
        
        # Stoppe Prozesse
        if self.backend_process:
            try:
                print("Stopping backend server...")
                self.backend_process.terminate()
                self.backend_process.wait(timeout=10)
                print("Backend stopped")
            except subprocess.TimeoutExpired:
                print("Force killing backend...")
                self.backend_process.kill()
                print("Backend force killed")
            except Exception as e:
                print(f"Backend cleanup error: {e}")
        
        if self.frontend_process:
            try:
                print("Stopping frontend server...")
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=10)
                print("Frontend stopped")
            except subprocess.TimeoutExpired:
                print("Force killing frontend...")
                self.frontend_process.kill()
                print("Frontend force killed")
            except Exception as e:
                print(f"Frontend cleanup error: {e}")
        
        # Port-Cleanup nach dem Stoppen
        print("\n🧹 POST-SHUTDOWN PORT CLEANUP")
        self.port_manager.clear_development_ports()
        
        print("Enhanced cleanup completed")
    
    def run(self):
        """Enhanced main launcher function"""
        self.print_banner()
        
        # Enhanced signal handler
        def signal_handler(signum, frame):
            print(f"\n🛑 Shutdown signal received (Signal: {signum})")
            self.running = False
            self.cleanup_with_ports()
            print("👋 RetroRetro launcher stopped")
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        self.running = True
        
        # Step 0: Pre-cleanup
        self.clear_ports_before_start()
        
        # Step 1: Prerequisites
        if not self.check_prerequisites():
            print("Prerequisites failed - cannot start")
            return False
        
        # Step 2: Start Backend FIRST (with visible output)
        if not self.start_backend():
            print("Backend startup failed - cannot continue")
            return False
        
        # Step 3: Start Frontend (only after backend is ready)
        print("\n" + "-" * 60)
        print("🎯 Backend is running - now starting frontend...")
        print("-" * 60)
        
        if not self.start_frontend():
            print("Frontend startup issues, but continuing...")
        
        # Step 4: Health Checks
        time.sleep(3)
        system_healthy = self.run_health_checks()
        
        # Step 5: Open Browser and Start Monitoring
        time.sleep(2)
        self.open_browser_and_check_status()
        
        # Step 6: Show Status Dashboard
        self.show_running_status()
        
        # Step 7: Enhanced Monitoring
        try:
            self.monitor_system_with_status()
        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup_with_ports()
        
        return True
    
    def show_running_status(self):
        """Show comprehensive running status"""
        print("\n" + "="*80)
        print("🎉 RETRORETRO GAMING SERVICE IS RUNNING!")
        print("="*80)
        print(f"🌐 Frontend Application: {self.frontend_url}")
        print(f"🔗 Backend Health: {self.backend_url}/health")
        print(f"📊 Backend Status: {self.backend_url}/api/status")
        print(f"🎮 Games API: {self.backend_url}/api/games")
        print(f"🗄️  Database Health: {self.backend_url}/health-db")
        print("-" * 80)
        print("🎯 MONITORING ACTIVE:")
        print("  • Backend console output visible below")
        print("  • Frontend online status monitoring every 10s")
        print("  • System health checks every 30s")
        print("  • Automatic port cleanup on shutdown")
        print("-" * 80)
        print("💡 Ready for TAG 4: Frontend-Backend Integration testing!")
        print("💡 Check if frontend shows GREEN online status indicator")
        print("💡 Press Ctrl+C to stop all services and clear ports")
        print("="*80)


def main():
    """Enhanced entry point"""
    launcher = RetroRetroLauncher()
    
    try:
        success = launcher.run()
        if not success:
            print("Launcher failed to start system")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"💥 Unexpected error: {e}")
        launcher.cleanup_with_ports()
        sys.exit(1)
    finally:
        print("👋 RetroRetro launcher session ended")


if __name__ == "__main__":
    main()