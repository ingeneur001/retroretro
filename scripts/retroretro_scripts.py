#!/usr/bin/env python3
"""
🎮 RetroRetro Scripts Menu - Extended with Test Platform
Zentrales Menü für alle Development & Testing Scripts
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime

# Import der Test Platform (falls im gleichen Verzeichnis)
try:
    from test_platform import RetroRetroTester
    TEST_PLATFORM_AVAILABLE = True
except ImportError:
    TEST_PLATFORM_AVAILABLE = False

class RetroRetroScripts:
    def __init__(self):
        self.scripts_dir = Path(__file__).parent
        self.project_root = self.scripts_dir.parent
        
        # Verfügbare Scripts
        self.available_scripts = {
            # Bestehende Scripts
            "progress_tracker.py": "Progress Tracking & Documentation",
            "retroretro_start.py": "Start Development Servers",
            
            # Test Platform Integration
            "test_platform.py": "Comprehensive Testing Suite" if TEST_PLATFORM_AVAILABLE else "Testing Suite (install required)"
        }
        
    def show_main_menu(self):
        """Zeigt das Hauptmenü"""
        print("\n" + "=" * 60)
        print("🎮 RETRORETRO DEVELOPMENT SCRIPTS MENU")
        print("=" * 60)
        print(f"📁 Project: {self.project_root.name}")
        print(f"🕐 Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        print("\n📋 AVAILABLE SCRIPTS:")
        print("1. 📊 Progress Tracker & Documentation")
        print("2. 🚀 Development Server Management")
        print("3. 🧪 Testing & Quality Assurance")
        print("4. 🔧 Database Management")
        print("5. 📁 Project Structure Tools")
        print("6. 🎯 Beta-Testing Preparation")
        print("7. 📄 Documentation Generation")
        print("8. ❌ Exit")
        
        choice = input("\n🎯 Select option (1-8): ").strip()
        return choice
    
    def progress_tracker_menu(self):
        """Progress Tracker Untermenü"""
        print("\n📊 PROGRESS TRACKER & DOCUMENTATION")
        print("-" * 40)
        print("1. 📈 Show current status")
        print("2. 🏷️ Update TAG status")
        print("3. ⏱️ Add hours to TAG")
        print("4. ✅ Mark critical task as done")
        print("5. 📄 Generate full documentation")
        print("6. 🔍 Check project structure")
        print("7. ⬅️ Back to main menu")
        
        choice = input("\n🎯 Select option (1-7): ").strip()
        
        if choice == "1":
            self.run_command("python progress_tracker.py status")
        elif choice == "2":
            tag_name = input("TAG name (e.g., TAG_4_FEATURES): ").strip()
            status = input("Status (completed/in_progress/planned): ").strip()
            hours = input("Hours (optional): ").strip()
            hours_arg = f" --hours {hours}" if hours else ""
            self.run_command(f"python progress_tracker.py update-tag {tag_name} {status}{hours_arg}")
        elif choice == "3":
            tag_name = input("TAG name: ").strip()
            hours = input("Hours to add: ").strip()
            notes = input("Notes (optional): ").strip()
            notes_arg = f' --notes "{notes}"' if notes else ""
            self.run_command(f"python progress_tracker.py add-hours {tag_name} {hours}{notes_arg}")
        elif choice == "4":
            path = input("Path of completed task: ").strip()
            self.run_command(f'python progress_tracker.py mark-done "{path}"')
        elif choice == "5":
            self.run_command("python progress_tracker.py status")
        elif choice == "6":
            self.run_command("python progress_tracker.py check-structure")
        elif choice == "7":
            return
        else:
            print("❌ Invalid option")
            
        input("\n⏸️ Press Enter to continue...")
        self.progress_tracker_menu()
    
    def testing_menu(self):
        """Testing & QA Untermenü"""
        print("\n🧪 TESTING & QUALITY ASSURANCE")
        print("-" * 40)
        
        if not TEST_PLATFORM_AVAILABLE:
            print("⚠️ Test Platform not fully available")
            print("💡 Some features may require additional dependencies")
            print()
        
        print("1. ⚡ Quick System Check")
        print("2. 🎯 Full Test Suite")
        print("3. 🧪 Beta-Readiness Assessment")
        print("4. 📊 Performance Testing")
        print("5. 👤 Authentication Testing")
        print("6. 🎮 Game Features Testing")
        print("7. 🔗 API Endpoint Validation")
        print("8. 📄 Generate Test Report")
        print("9. 🧹 Cleanup Test Data")
        print("10. 🔗 Test + Update Progress Tracker")
        print("11. ⬅️ Back to main menu")
        
        choice = input("\n🎯 Select option (1-11): ").strip()
        
        if choice == "1":
            self.run_test_command("python test_platform.py")
        elif choice == "2":
            self.run_test_command("python test_platform.py --full")
        elif choice == "3":
            self.run_test_command("python test_platform.py --beta")
        elif choice == "4":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_performance()
            else:
                print("⚠️ Performance testing requires test_platform.py")
        elif choice == "5":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_authentication_flow()
            else:
                print("⚠️ Authentication testing requires test_platform.py")
        elif choice == "6":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_game_features()
            else:
                print("⚠️ Game testing requires test_platform.py")
        elif choice == "7":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_api_endpoints()
            else:
                print("⚠️ API testing requires test_platform.py")
        elif choice == "8":
            self.run_test_command("python test_platform.py --full --report")
        elif choice == "9":
            self.run_test_command("python test_platform.py --cleanup")
        elif choice == "10":
            self.run_test_command("python test_platform.py --integration")
        elif choice == "11":
            return
        else:
            print("❌ Invalid option")
            
        input("\n⏸️ Press Enter to continue...")
        self.testing_menu()
    
    def server_management_menu(self):
        """Server Management Untermenü"""
        print("\n🚀 DEVELOPMENT SERVER MANAGEMENT")
        print("-" * 40)
        print("1. 🎮 Start Gaming Servers (retroretro_start.py)")
        print("2. 🔍 Check Server Status")
        print("3. ⏹️ Stop All Servers")
        print("4. 🔄 Restart Servers")
        print("5. 📊 Server Health Check")
        print("6. ⬅️ Back to main menu")
        
        choice = input("\n🎯 Select option (1-6): ").strip()
        
        if choice == "1":
            self.run_command("python retroretro_start.py")
        elif choice == "2":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_backend_health()
            else:
                print("⚠️ Server status check requires test_platform.py")
        elif choice == "3":
            print("⚠️ Stop functionality not implemented yet")
            print("💡 Use Ctrl+C in server windows or Task Manager")
        elif choice == "4":
            print("🔄 Restart servers...")
            # Hier könntest du restart logic implementieren
        elif choice == "5":
            self.run_test_command("python test_platform.py --quick")
        elif choice == "6":
            return
        else:
            print("❌ Invalid option")
            
        input("\n⏸️ Press Enter to continue...")
        self.server_management_menu()
    
    def beta_testing_menu(self):
        """Beta-Testing Preparation Untermenü"""
        print("\n🎯 BETA-TESTING PREPARATION")
        print("-" * 40)
        print("1. 🧪 Complete Beta-Readiness Check")
        print("2. 👤 Test User Registration Flow")
        print("3. 🎮 Validate All Game Features") 
        print("4. 📊 Performance Stress Test")
        print("5. 🔐 Security & Authentication Audit")
        print("6. 📋 Generate Beta-Testing Report")
        print("7. 🚀 Full Production-Readiness Check")
        print("8. ⬅️ Back to main menu")
        
        choice = input("\n🎯 Select option (1-8): ").strip()
        
        if choice == "1":
            self.run_test_command("python test_platform.py --beta --report")
        elif choice == "2":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_authentication_flow()
            else:
                print("⚠️ User testing requires test_platform.py")
        elif choice == "3":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_game_features()
            else:
                print("⚠️ Game validation requires test_platform.py")
        elif choice == "4":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_performance()
            else:
                print("⚠️ Performance testing requires test_platform.py")
        elif choice == "5":
            print("🔐 Security audit features coming soon...")
            print("💡 Currently: Basic authentication testing available")
        elif choice == "6":
            self.run_test_command("python test_platform.py --beta --report")
        elif choice == "7":
            self.run_test_command("python test_platform.py --full --report")
            self.run_command("python progress_tracker.py status")
        elif choice == "8":
            return
        else:
            print("❌ Invalid option")
            
        input("\n⏸️ Press Enter to continue...")
        self.beta_testing_menu()
    
    def project_structure_menu(self):
        """Project Structure Tools Untermenü"""
        print("\n📁 PROJECT STRUCTURE TOOLS")
        print("-" * 40)
        print("1. 🔍 Analyze current structure")
        print("2. ✅ Mark components as completed")
        print("3. 📊 Structure completion report")
        print("4. 🔧 Fix structure issues")
        print("5. 📋 List missing components")
        print("6. ⬅️ Back to main menu")
        
        choice = input("\n🎯 Select option (1-6): ").strip()
        
        if choice == "1":
            self.run_command("python progress_tracker.py check-structure")
        elif choice == "2":
            path = input("Path to mark as completed: ").strip()
            self.run_command(f'python progress_tracker.py mark-done "{path}"')
        elif choice == "3":
            self.run_command("python progress_tracker.py status")
        elif choice == "4":
            print("🔧 Structure fix suggestions:")
            print("   - Run structure analysis first")
            print("   - Check current_status.txt for missing components")
        elif choice == "5":
            self.run_command("python progress_tracker.py check-structure")
        elif choice == "6":
            return
        else:
            print("❌ Invalid option")
            
        input("\n⏸️ Press Enter to continue...")
        self.project_structure_menu()
    
    def documentation_menu(self):
        """Documentation Generation Untermenü"""
        print("\n📄 DOCUMENTATION GENERATION")
        print("-" * 40)
        print("1. 📊 Update all documentation")
        print("2. 🧪 Generate test reports")
        print("3. 📈 Create progress report")
        print("4. 🎯 Beta-testing documentation")
        print("5. 📁 View generated files")
        print("6. ⬅️ Back to main menu")
        
        choice = input("\n🎯 Select option (1-6): ").strip()
        
        if choice == "1":
            self.run_command("python progress_tracker.py status")
            if TEST_PLATFORM_AVAILABLE:
                self.run_test_command("python test_platform.py --integration")
        elif choice == "2":
            self.run_test_command("python test_platform.py --full --report")
        elif choice == "3":
            self.run_command("python progress_tracker.py status")
        elif choice == "4":
            self.run_test_command("python test_platform.py --beta --report")
        elif choice == "5":
            self.show_generated_files()
        elif choice == "6":
            return
        else:
            print("❌ Invalid option")
            
        input("\n⏸️ Press Enter to continue...")
        self.documentation_menu()
    
    def database_menu(self):
        """Database Management Untermenü"""
        print("\n🗄️ DATABASE MANAGEMENT")
        print("-" * 40)
        print("1. 🔍 Database health check")
        print("2. 🧪 Test database connections")
        print("3. 👤 Test user operations")
        print("4. 🎮 Test game data operations")
        print("5. 📊 Database performance test")
        print("6. 🧹 Cleanup test data")
        print("7. ⬅️ Back to main menu")
        
        choice = input("\n🎯 Select option (1-7): ").strip()
        
        if choice == "1":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_backend_health()
            else:
                print("⚠️ Database health check requires test_platform.py")
        elif choice == "2":
            print("🔗 Testing database connections...")
            # Hier könntest du spezifische DB-Tests implementieren
        elif choice == "3":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_authentication_flow()
            else:
                print("⚠️ User testing requires test_platform.py")
        elif choice == "4":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_game_features()
            else:
                print("⚠️ Game data testing requires test_platform.py")
        elif choice == "5":
            if TEST_PLATFORM_AVAILABLE:
                tester = RetroRetroTester()
                tester.test_performance()
            else:
                print("⚠️ Performance testing requires test_platform.py")
        elif choice == "6":
            self.run_test_command("python test_platform.py --cleanup")
        elif choice == "7":
            return
        else:
            print("❌ Invalid option")
            
        input("\n⏸️ Press Enter to continue...")
        self.database_menu()
    
    def run_command(self, command):
        """Führt Command aus und zeigt Output"""
        print(f"\n🚀 Executing: {command}")
        print("-" * 40)
        try:
            result = subprocess.run(command.split(), 
                                  capture_output=False, 
                                  text=True, 
                                  cwd=self.scripts_dir)
            return result.returncode == 0
        except Exception as e:
            print(f"❌ Error executing command: {e}")
            return False
    
    def run_test_command(self, command):
        """Führt Test-Command aus mit besserer Fehlerbehandlung"""
        if not TEST_PLATFORM_AVAILABLE:
            print("⚠️ Test Platform not available")
            print("💡 Ensure test_platform.py is in the scripts directory")
            print("💡 Install dependencies: pip install requests python-socketio")
            return False
            
        return self.run_command(command)
    
    def show_generated_files(self):
        """Zeigt generierte Dateien"""
        print("\n📁 GENERATED FILES")
        print("-" * 40)
        
        docs_dir = self.project_root / "docs"
        files_to_show = [
            (docs_dir / "status.md", "📊 Project Status"),
            (docs_dir / "development" / "progress-tracker.md", "📈 Progress Tracker"),
            (docs_dir / "development" / "critical-tasks.md", "🔴 Critical Tasks"),
            (docs_dir / "testing", "🧪 Test Reports Directory"),
            (self.project_root / "current_status.txt", "📋 Current Status (Copy-Paste)"),
            (self.project_root / "project_structure_check.json", "🔍 Structure Analysis")
        ]
        
        for file_path, description in files_to_show:
            if file_path.exists():
                if file_path.is_file():
                    size = file_path.stat().st_size
                    modified = datetime.fromtimestamp(file_path.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
                    print(f"✅ {description}")
                    print(f"   📁 {file_path}")
                    print(f"   📏 {size} bytes, modified: {modified}")
                else:
                    # Directory
                    files_count = len(list(file_path.glob("*")))
                    print(f"✅ {description}")
                    print(f"   📁 {file_path}")
                    print(f"   📋 {files_count} files")
            else:
                print(f"❌ {description}")
                print(f"   📁 {file_path} (not found)")
            print()
    
    def show_system_status(self):
        """Zeigt aktuellen System-Status"""
        print("\n📊 SYSTEM STATUS OVERVIEW")
        print("-" * 40)
        
        # Check if servers are running
        server_status = self.check_server_status()
        
        print(f"🖥️ Backend Server: {'🟢 RUNNING' if server_status['backend'] else '🔴 STOPPED'}")
        print(f"🌐 Frontend Server: {'🟢 RUNNING' if server_status['frontend'] else '🔴 STOPPED'}")
        
        # Progress Status
        try:
            with open(self.project_root / "project_structure_check.json", 'r') as f:
                structure_data = json.load(f)
                completion = structure_data.get("summary", {}).get("completion_percentage", 0)
                print(f"📈 Project Completion: {completion}%")
        except:
            print("📈 Project Completion: Unknown (run progress tracker)")
        
        # Recent activity
        progress_file = self.project_root / "docs" / "development" / "progress.json"
        if progress_file.exists():
            try:
                with open(progress_file, 'r') as f:
                    progress_data = json.load(f)
                    last_update = progress_data.get("last_update", "Unknown")
                    current_tag = progress_data.get("current_tag", "Unknown")
                    print(f"🏷️ Current TAG: {current_tag}")
                    print(f"🕐 Last Update: {last_update}")
            except:
                print("🏷️ Current TAG: Unknown")
    
    def check_server_status(self):
        """Prüft ob Server laufen"""
        status = {"backend": False, "frontend": False}
        
        try:
            import requests
            # Quick backend check
            response = requests.get("http://localhost:3001", timeout=2)
            status["backend"] = response.status_code == 200
        except:
            pass
            
        try:
            # Quick frontend check
            response = requests.get("http://localhost:3000", timeout=2)
            status["frontend"] = response.status_code == 200
        except:
            pass
            
        return status
    
    def run_menu(self):
        """Hauptmenü-Loop"""
        while True:
            try:
                choice = self.show_main_menu()
                
                if choice == "1":
                    self.progress_tracker_menu()
                elif choice == "2":
                    self.server_management_menu()
                elif choice == "3":
                    self.testing_menu()
                elif choice == "4":
                    self.database_menu()
                elif choice == "5":
                    self.project_structure_menu()
                elif choice == "6":
                    self.beta_testing_menu()
                elif choice == "7":
                    self.documentation_menu()
                elif choice == "8":
                    print("\n👋 Goodbye! Happy coding!")
                    break
                else:
                    print("❌ Invalid option. Please select 1-8.")
                    input("\n⏸️ Press Enter to continue...")
                    
            except KeyboardInterrupt:
                print("\n\n👋 Exiting...")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                input("\n⏸️ Press Enter to continue...")

def main():
    """Hauptfunktion"""
    print("\n🎮 RetroRetro Development Scripts")
    
    # System Status anzeigen
    scripts = RetroRetroScripts()
    scripts.show_system_status()
    
    # Hauptmenü starten
    scripts.run_menu()

if __name__ == "__main__":
    main()