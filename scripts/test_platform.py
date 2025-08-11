#!/usr/bin/env python3
"""
🎮 RetroRetro Gaming Platform - Comprehensive Test Suite
Ausbaubare Test-Platform mit Integration in Progress Tracker
Maximum-Output für Beta-Testing Readiness
"""

import requests
import json
import time
import asyncio
import websockets
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import threading
import queue

class RetroRetroTester:
    def __init__(self):
        # URLs
        self.backend_url = "http://localhost:3001"
        self.frontend_url = "http://localhost:3000"
        self.ws_url = "ws://localhost:3001"
        
        # Test Data
        self.test_users = []
        self.test_sessions = []
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "backend_health": {},
            "database": {},
            "authentication": {},
            "api_endpoints": {},
            "websocket": {},
            "games": {},
            "multiplayer": {},
            "performance": {},
            "summary": {}
        }
        
        # Integration mit Progress Tracker
        self.docs_dir = Path("../docs") if Path.cwd().name == "scripts" else Path("docs")
        self.test_reports_dir = self.docs_dir / "testing"
        self.test_reports_dir.mkdir(exist_ok=True)
        
        # Session für persistente Verbindungen
        self.session = requests.Session()
        self.session.timeout = 10
        
    # =========================================
    # 🏥 BACKEND HEALTH & CONNECTIVITY TESTS
    # =========================================
    
    def test_backend_health(self):
        """Testet Backend-Verfügbarkeit und Grundfunktionen"""
        print("\n🏥 BACKEND HEALTH CHECK")
        print("-" * 40)
        
        health_tests = {
            "basic_connection": f"{self.backend_url}",
            "health_endpoint": f"{self.backend_url}/health",
            "api_status": f"{self.backend_url}/api/status", 
            "database_health": f"{self.backend_url}/health-db"
        }
        
        for test_name, url in health_tests.items():
            try:
                response = self.session.get(url)
                success = response.status_code == 200
                
                self.test_results["backend_health"][test_name] = {
                    "status": "PASS" if success else "FAIL",
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                    "data": response.json() if success else None
                }
                
                status_icon = "✅" if success else "❌"
                print(f"  {status_icon} {test_name}: {response.status_code} ({response.elapsed.total_seconds():.3f}s)")
                
                if success and response.json():
                    data = response.json()
                    if "connectedUsers" in data:
                        print(f"    📊 Connected Users: {data['connectedUsers']}")
                    if "uptime" in data:
                        print(f"    ⏱️ Uptime: {data['uptime']}s")
                
            except Exception as e:
                self.test_results["backend_health"][test_name] = {
                    "status": "FAIL",
                    "error": str(e)
                }
                print(f"  ❌ {test_name}: FAIL - {e}")
    
    # =========================================
    # 🗄️ DATABASE & API ENDPOINT TESTS  
    # =========================================
    
    def test_api_endpoints(self):
        """Testet alle verfügbaren API-Endpunkte"""
        print("\n🔗 API ENDPOINT TESTS")
        print("-" * 40)
        
        endpoints = {
            # Core APIs
            "games_list": "/api/games",
            "leaderboard": "/api/leaderboard", 
            "sessions": "/api/sessions",
            "user_stats": "/api/user-stats",
            
            # Game-specific
            "snake_scores": "/api/games/snake/scores",
            "memory_scores": "/api/games/memory/scores",
            "pong_scores": "/api/games/pong/scores",
            
            # Authentication (will fail without auth, but tests endpoint existence)
            "profile": "/api/profile",
            "logout": "/api/logout"
        }
        
        for endpoint_name, path in endpoints.items():
            try:
                url = f"{self.backend_url}{path}"
                response = self.session.get(url)
                
                # 200 = success, 401 = auth required (endpoint exists), 404 = not implemented
                success = response.status_code in [200, 401]
                
                self.test_results["api_endpoints"][endpoint_name] = {
                    "status": "PASS" if success else "FAIL",
                    "status_code": response.status_code,
                    "path": path,
                    "response_time": response.elapsed.total_seconds()
                }
                
                status_icon = "✅" if success else "❌"
                auth_note = " (needs auth)" if response.status_code == 401 else ""
                print(f"  {status_icon} {endpoint_name}: {response.status_code}{auth_note}")
                
                # Zeige Daten bei erfolgreichen Requests
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if isinstance(data, dict):
                            if "availableGames" in data:
                                print(f"    🎮 Available Games: {len(data['availableGames'])}")
                            elif "leaderboard" in data:
                                print(f"    🏆 Leaderboard Entries: {len(data['leaderboard'])}")
                            elif "sessions" in data:
                                print(f"    🎯 Active Sessions: {len(data['sessions'])}")
                    except:
                        pass
                        
            except Exception as e:
                self.test_results["api_endpoints"][endpoint_name] = {
                    "status": "FAIL",
                    "error": str(e)
                }
                print(f"  ❌ {endpoint_name}: FAIL - {e}")
    
    # =========================================
    # 👤 AUTHENTICATION & USER TESTS
    # =========================================
    
    def test_authentication_flow(self):
        """Testet User Registration und Login"""
        print("\n👤 AUTHENTICATION FLOW TESTS")
        print("-" * 40)
        
        # Test User Data
        test_user = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "TestPass123!",
            "displayName": "Automated Test User"
        }
        
        # 1. Registration Test
        try:
            print("  🔐 Testing Registration...")
            reg_response = self.session.post(
                f"{self.backend_url}/api/register",
                json=test_user
            )
            
            reg_success = reg_response.status_code in [200, 201]
            
            self.test_results["authentication"]["registration"] = {
                "status": "PASS" if reg_success else "FAIL",
                "status_code": reg_response.status_code,
                "test_user": test_user["username"]
            }
            
            if reg_success:
                print(f"    ✅ Registration: PASS ({test_user['username']})")
                self.test_users.append(test_user)
                
                # 2. Login Test
                print("  🔑 Testing Login...")
                login_response = self.session.post(
                    f"{self.backend_url}/api/login",
                    json={
                        "username": test_user["username"],
                        "password": test_user["password"]
                    }
                )
                
                login_success = login_response.status_code == 200
                
                self.test_results["authentication"]["login"] = {
                    "status": "PASS" if login_success else "FAIL",
                    "status_code": login_response.status_code
                }
                
                if login_success:
                    print("    ✅ Login: PASS")
                    
                    # 3. Protected Route Test
                    try:
                        profile_response = self.session.get(f"{self.backend_url}/api/profile")
                        profile_success = profile_response.status_code == 200
                        
                        self.test_results["authentication"]["protected_routes"] = {
                            "status": "PASS" if profile_success else "FAIL",
                            "status_code": profile_response.status_code
                        }
                        
                        print(f"    ✅ Protected Routes: {'PASS' if profile_success else 'FAIL'}")
                        
                    except Exception as e:
                        print(f"    ⚠️ Protected Routes: Could not test - {e}")
                        
                else:
                    print(f"    ❌ Login: FAIL ({login_response.status_code})")
            else:
                print(f"    ❌ Registration: FAIL ({reg_response.status_code})")
                
        except Exception as e:
            print(f"  ❌ Authentication Tests: FAIL - {e}")
            self.test_results["authentication"]["error"] = str(e)
    
    # =========================================
    # 🔌 WEBSOCKET & REAL-TIME TESTS
    # =========================================
    
    def test_websocket_connectivity(self):
        """Testet WebSocket-Verbindungen und Events"""
        print("\n🔌 WEBSOCKET CONNECTIVITY TESTS")
        print("-" * 40)
        
        try:
            import socketio
            
            # Socket.IO Client Setup
            sio = socketio.SimpleClient()
            
            print("  🔗 Connecting to Socket.IO server...")
            connect_success = False
            
            try:
                sio.connect(self.backend_url, timeout=5)
                connect_success = True
                print("    ✅ Socket.IO Connection: PASS")
                
                # Test Events
                events_tested = []
                
                # Ping Test
                try:
                    sio.emit('ping', {'timestamp': time.time()})
                    # Warte kurz auf Antwort
                    time.sleep(1)
                    events_tested.append({"event": "ping", "status": "SENT"})
                    print("    📡 Ping Event: SENT")
                except Exception as e:
                    events_tested.append({"event": "ping", "status": "FAIL", "error": str(e)})
                
                # Player Count Request
                try:
                    sio.emit('get-player-count')
                    events_tested.append({"event": "get-player-count", "status": "SENT"})
                    print("    👥 Player Count Request: SENT")
                except Exception as e:
                    events_tested.append({"event": "get-player-count", "status": "FAIL", "error": str(e)})
                
                # Game Join Test (ohne echte Teilnahme)
                try:
                    sio.emit('join-game', {'gameId': 'snake'})
                    events_tested.append({"event": "join-game", "status": "SENT"})
                    print("    🎮 Game Join Event: SENT")
                except Exception as e:
                    events_tested.append({"event": "join-game", "status": "FAIL", "error": str(e)})
                
                self.test_results["websocket"] = {
                    "connection": "PASS",
                    "events_tested": events_tested,
                    "socket_id": getattr(sio, 'sid', 'unknown')
                }
                
                # Disconnect
                sio.disconnect()
                print("    🔌 Disconnect: PASS")
                
            except Exception as e:
                print(f"    ❌ Socket.IO Connection: FAIL - {e}")
                self.test_results["websocket"] = {
                    "connection": "FAIL",
                    "error": str(e)
                }
                
        except ImportError:
            print("  ⚠️ python-socketio not installed - WebSocket tests skipped")
            print("  💡 Install with: pip install python-socketio")
            self.test_results["websocket"] = {
                "status": "SKIPPED",
                "reason": "python-socketio not installed"
            }
    
    # =========================================
    # 🎮 GAME & FEATURE TESTS
    # =========================================
    
    def test_game_features(self):
        """Testet Game-spezifische Features"""
        print("\n🎮 GAME FEATURES TESTS")
        print("-" * 40)
        
        games = ["snake", "memory", "pong", "tetris"]
        
        for game in games:
            print(f"  🎯 Testing {game.upper()}...")
            
            game_tests = {}
            
            # High Scores API
            try:
                scores_response = self.session.get(f"{self.backend_url}/api/games/{game}/scores")
                game_tests["scores_api"] = {
                    "status": "PASS" if scores_response.status_code == 200 else "FAIL",
                    "status_code": scores_response.status_code
                }
                
                if scores_response.status_code == 200:
                    scores = scores_response.json()
                    print(f"    ✅ Scores API: {len(scores.get('scores', []))} entries")
                else:
                    print(f"    ❌ Scores API: FAIL ({scores_response.status_code})")
                    
            except Exception as e:
                game_tests["scores_api"] = {"status": "FAIL", "error": str(e)}
                print(f"    ❌ Scores API: FAIL - {e}")
            
            # Game Config API
            try:
                config_response = self.session.get(f"{self.backend_url}/api/games/{game}/config")
                game_tests["config_api"] = {
                    "status": "PASS" if config_response.status_code == 200 else "FAIL",
                    "status_code": config_response.status_code
                }
                
                if config_response.status_code == 200:
                    print(f"    ✅ Config API: PASS")
                else:
                    print(f"    ⚠️ Config API: {config_response.status_code}")
                    
            except Exception as e:
                game_tests["config_api"] = {"status": "FAIL", "error": str(e)}
                print(f"    ⚠️ Config API: Not implemented")
            
            self.test_results["games"][game] = game_tests
    
    # =========================================
    # 📊 PERFORMANCE & LOAD TESTS
    # =========================================
    
    def test_performance(self):
        """Testet Performance und Load-Capacity"""
        print("\n📊 PERFORMANCE TESTS")
        print("-" * 40)
        
        # Concurrent Request Test
        print("  ⚡ Testing concurrent requests...")
        
        def make_request():
            try:
                start_time = time.time()
                response = requests.get(f"{self.backend_url}/api/games", timeout=5)
                end_time = time.time()
                return {
                    "success": response.status_code == 200,
                    "response_time": end_time - start_time,
                    "status_code": response.status_code
                }
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        # 10 parallele Requests
        import concurrent.futures
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            start_time = time.time()
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
            total_time = time.time() - start_time
        
        successful_requests = [r for r in results if r.get("success")]
        avg_response_time = sum(r["response_time"] for r in successful_requests) / len(successful_requests) if successful_requests else 0
        
        self.test_results["performance"] = {
            "concurrent_requests": {
                "total_requests": 10,
                "successful_requests": len(successful_requests),
                "success_rate": len(successful_requests) / 10 * 100,
                "total_time": total_time,
                "avg_response_time": avg_response_time
            }
        }
        
        print(f"    📈 Success Rate: {len(successful_requests)}/10 ({len(successful_requests)/10*100:.1f}%)")
        print(f"    ⏱️ Average Response Time: {avg_response_time:.3f}s")
        print(f"    🕐 Total Test Time: {total_time:.3f}s")
    
    # =========================================
    # 🧪 COMPREHENSIVE TEST RUNNER
    # =========================================
    
    def run_quick_tests(self):
        """Schnelle Tests für tägliche Überprüfung"""
        print("\n\n🚀 QUICK TEST SUITE - Essential Checks")
        print("=" * 60)
        
        self.test_backend_health()
        self.test_api_endpoints()
        
        return self.generate_quick_summary()
    
    def run_full_tests(self):
        """Vollständige Test-Suite für Beta-Testing Validation"""
        print("\n\n🎯 FULL TEST SUITE - Comprehensive Analysis")
        print("=" * 60)
        
        self.test_backend_health()
        self.test_api_endpoints()
        self.test_authentication_flow()
        self.test_websocket_connectivity()
        self.test_game_features()
        self.test_performance()
        
        return self.generate_full_report()
    
    def run_beta_readiness_check(self):
        """Spezielle Tests für Beta-Testing Readiness"""
        print("\n\n🧪 BETA-TESTING READINESS CHECK")
        print("=" * 60)
        
        # Kritische Beta-Features
        beta_requirements = {
            "user_registration": self.test_user_registration_flow,
            "game_availability": self.test_game_availability,
            "leaderboard_function": self.test_leaderboard_functionality,
            "session_management": self.test_session_management,
            "error_handling": self.test_error_handling
        }
        
        beta_results = {}
        
        for requirement_name, test_function in beta_requirements.items():
            try:
                print(f"\n  🎯 Testing {requirement_name.replace('_', ' ').title()}...")
                result = test_function()
                beta_results[requirement_name] = result
                status_icon = "✅" if result.get("status") == "PASS" else "❌"
                print(f"    {status_icon} {requirement_name}: {result.get('status', 'UNKNOWN')}")
            except Exception as e:
                beta_results[requirement_name] = {"status": "FAIL", "error": str(e)}
                print(f"    ❌ {requirement_name}: FAIL - {e}")
        
        self.test_results["beta_readiness"] = beta_results
        return self.generate_beta_report()
    
    # =========================================
    # 📋 SPECIFIC BETA TEST FUNCTIONS
    # =========================================
    
    def test_user_registration_flow(self):
        """Testet kompletten User Registration Flow"""
        unique_id = int(time.time())
        test_user = {
            "username": f"betatest_{unique_id}",
            "email": f"beta_{unique_id}@test.com", 
            "password": "BetaTest123!"
        }
        
        try:
            # Registration
            reg_response = self.session.post(f"{self.backend_url}/api/register", json=test_user)
            if reg_response.status_code not in [200, 201]:
                return {"status": "FAIL", "step": "registration", "code": reg_response.status_code}
            
            # Login
            login_response = self.session.post(f"{self.backend_url}/api/login", json=test_user)
            if login_response.status_code != 200:
                return {"status": "FAIL", "step": "login", "code": login_response.status_code}
            
            self.test_users.append(test_user)
            return {"status": "PASS", "user": test_user["username"]}
            
        except Exception as e:
            return {"status": "FAIL", "error": str(e)}
    
    def test_game_availability(self):
        """Testet ob Games verfügbar und spielbar sind"""
        try:
            response = self.session.get(f"{self.backend_url}/api/games")
            if response.status_code != 200:
                return {"status": "FAIL", "code": response.status_code}
            
            games_data = response.json()
            available_games = games_data.get("availableGames", [])
            
            return {
                "status": "PASS" if len(available_games) > 0 else "FAIL",
                "games_count": len(available_games),
                "games": [g.get("slug", g) for g in available_games]
            }
            
        except Exception as e:
            return {"status": "FAIL", "error": str(e)}
    
    def test_leaderboard_functionality(self):
        """Testet Leaderboard-Features"""
        try:
            response = self.session.get(f"{self.backend_url}/api/leaderboard")
            if response.status_code != 200:
                return {"status": "FAIL", "code": response.status_code}
            
            leaderboard_data = response.json()
            entries = leaderboard_data.get("leaderboard", [])
            
            return {
                "status": "PASS",
                "entries_count": len(entries),
                "has_scores": len(entries) > 0
            }
            
        except Exception as e:
            return {"status": "FAIL", "error": str(e)}
    
    def test_session_management(self):
        """Testet Session-Management"""
        try:
            response = self.session.get(f"{self.backend_url}/api/sessions")
            return {
                "status": "PASS" if response.status_code in [200, 401] else "FAIL",
                "endpoint_exists": response.status_code != 404
            }
        except Exception as e:
            return {"status": "FAIL", "error": str(e)}
    
    def test_error_handling(self):
        """Testet Error-Handling"""
        try:
            # Invalid endpoint test
            response = self.session.get(f"{self.backend_url}/api/nonexistent")
            return {
                "status": "PASS" if response.status_code == 404 else "FAIL",
                "handles_404": response.status_code == 404
            }
        except Exception as e:
            return {"status": "FAIL", "error": str(e)}
    
    # =========================================
    # 📊 REPORTING & DOCUMENTATION
    # =========================================
    
    def generate_quick_summary(self):
        """Generiert schnelle Zusammenfassung"""
        backend_health = self.test_results["backend_health"]
        api_endpoints = self.test_results["api_endpoints"]
        
        healthy_backends = sum(1 for test in backend_health.values() if test.get("status") == "PASS")
        working_apis = sum(1 for test in api_endpoints.values() if test.get("status") == "PASS")
        
        total_backend_tests = len(backend_health)
        total_api_tests = len(api_endpoints)
        
        backend_score = (healthy_backends / total_backend_tests * 100) if total_backend_tests > 0 else 0
        api_score = (working_apis / total_api_tests * 100) if total_api_tests > 0 else 0
        
        overall_score = (backend_score + api_score) / 2
        
        print("\n" + "=" * 60)
        print("📊 QUICK TEST SUMMARY")
        print("=" * 60)
        print(f"🏥 Backend Health: {backend_score:.1f}% ({healthy_backends}/{total_backend_tests})")
        print(f"🔗 API Endpoints: {api_score:.1f}% ({working_apis}/{total_api_tests})")
        print(f"📈 Overall Score: {overall_score:.1f}%")
        
        if overall_score >= 90:
            print("🎉 EXCELLENT! Production-ready!")
        elif overall_score >= 75:
            print("✅ GOOD! Minor issues to fix")
        elif overall_score >= 50:
            print("⚠️ NEEDS WORK! Important fixes required")
        else:
            print("❌ CRITICAL! Major issues need addressing")
        
        return {
            "overall_score": overall_score,
            "backend_score": backend_score,
            "api_score": api_score,
            "status": "EXCELLENT" if overall_score >= 90 else "GOOD" if overall_score >= 75 else "NEEDS_WORK"
        }
    
    def generate_full_report(self):
        """Generiert vollständigen Test-Report als Markdown"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        # Berechne Scores für alle Kategorien
        scores = self.calculate_category_scores()
        overall_score = sum(scores.values()) / len(scores) if scores else 0
        
        report_content = f"""# 🎮 RetroRetro Gaming Platform - Test Report

**Test Run:** {timestamp}  
**Overall Score:** {overall_score:.1f}%  
**Status:** {self.get_status_emoji(overall_score)}

## 📊 Category Scores

| Category | Score | Status |
|----------|-------|--------|
"""
        
        for category, score in scores.items():
            status = "✅ PASS" if score >= 80 else "⚠️ WARN" if score >= 60 else "❌ FAIL"
            report_content += f"| {category.replace('_', ' ').title()} | {score:.1f}% | {status} |\n"
        
        report_content += f"""

## 🎯 Detailed Results

### Backend Health
"""
        
        for test_name, result in self.test_results["backend_health"].items():
            status_icon = "✅" if result.get("status") == "PASS" else "❌"
            report_content += f"- {status_icon} **{test_name}**: {result.get('status', 'UNKNOWN')}\n"
        
        report_content += """
### API Endpoints
"""
        
        for endpoint_name, result in self.test_results["api_endpoints"].items():
            status_icon = "✅" if result.get("status") == "PASS" else "❌"
            report_content += f"- {status_icon} **{endpoint_name}**: {result.get('status_code', 'N/A')}\n"
        
        # Beta-Readiness Assessment
        if "beta_readiness" in self.test_results:
            report_content += """
## 🧪 Beta-Testing Readiness
"""
            for requirement, result in self.test_results["beta_readiness"].items():
                status_icon = "✅" if result.get("status") == "PASS" else "❌"
                report_content += f"- {status_icon} **{requirement.replace('_', ' ').title()}**: {result.get('status', 'UNKNOWN')}\n"
        
        report_content += f"""

## 🚀 Recommendations

"""
        
        if overall_score >= 90:
            report_content += "- 🎉 **Ready for Beta-Testing!** All critical systems operational\n"
            report_content += "- 🚀 Consider starting limited beta with trusted users\n"
        elif overall_score >= 75:
            report_content += "- ✅ **Nearly ready!** Fix minor issues before beta\n"
            report_content += "- 🔧 Focus on failed tests for quick wins\n"
        else:
            report_content += "- ⚠️ **Development needed** before beta testing\n"
            report_content += "- 🎯 Prioritize critical backend issues\n"
        
        report_content += f"""

---
*Automated test report generated at {timestamp}*  
*Run with: `python test_platform.py --full`*
"""
        
        # Speichere Report
        report_file = self.test_reports_dir / f"test_report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        print(f"\n📄 Full report saved: {report_file}")
        return report_content
    
    def generate_beta_report(self):
        """Spezieller Beta-Readiness Report"""
        beta_data = self.test_results.get("beta_readiness", {})
        passed_requirements = sum(1 for result in beta_data.values() if result.get("status") == "PASS")
        total_requirements = len(beta_data)
        
        beta_score = (passed_requirements / total_requirements * 100) if total_requirements > 0 else 0
        
        print("\n" + "=" * 60)
        print("🧪 BETA-TESTING READINESS REPORT")
        print("=" * 60)
        print(f"📊 Beta Score: {beta_score:.1f}% ({passed_requirements}/{total_requirements})")
        
        if beta_score >= 90:
            print("🎉 READY FOR BETA! All requirements met!")
            recommendation = "Start beta testing immediately"
        elif beta_score >= 75:
            print("🔧 ALMOST READY! Minor fixes needed")
            recommendation = "Fix remaining issues, then start beta"
        else:
            print("⚠️ NOT READY! Critical issues to resolve")
            recommendation = "Focus on failed requirements before beta"
        
        print(f"💡 Recommendation: {recommendation}")
        
        return {
            "beta_score": beta_score,
            "passed_requirements": passed_requirements,
            "total_requirements": total_requirements,
            "recommendation": recommendation,
            "ready_for_beta": beta_score >= 90
        }
    
    # =========================================
    # 🔧 UTILITY & HELPER FUNCTIONS
    # =========================================
    
    def calculate_category_scores(self):
        """Berechnet Scores für alle Test-Kategorien"""
        scores = {}
        
        for category_name, category_data in self.test_results.items():
            if category_name in ["timestamp", "summary"]:
                continue
                
            if isinstance(category_data, dict):
                passed_tests = 0
                total_tests = 0
                
                for test_result in category_data.values():
                    if isinstance(test_result, dict) and "status" in test_result:
                        total_tests += 1
                        if test_result["status"] == "PASS":
                            passed_tests += 1
                    elif isinstance(test_result, dict):
                        # Nested results
                        for nested_result in test_result.values():
                            if isinstance(nested_result, dict) and "status" in nested_result:
                                total_tests += 1
                                if nested_result["status"] == "PASS":
                                    passed_tests += 1
                
                scores[category_name] = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        return scores
    
    def get_status_emoji(self, score):
        """Konvertiert Score zu Status-Emoji"""
        if score >= 90:
            return "🎉 EXCELLENT"
        elif score >= 75:
            return "✅ GOOD"
        elif score >= 50:
            return "⚠️ NEEDS WORK"
        else:
            return "❌ CRITICAL"
    
    def cleanup_test_users(self):
        """Löscht erstellte Test-User (falls DELETE API verfügbar)"""
        print("\n🧹 CLEANING UP TEST DATA")
        print("-" * 40)
        
        deleted_count = 0
        for user in self.test_users:
            try:
                # Versuche User zu löschen (falls API existiert)
                delete_response = self.session.delete(
                    f"{self.backend_url}/api/users/{user['username']}"
                )
                
                if delete_response.status_code in [200, 204]:
                    deleted_count += 1
                    print(f"  ✅ Deleted: {user['username']}")
                else:
                    print(f"  ⚠️ Could not delete: {user['username']} (API may not exist)")
                    
            except Exception as e:
                print(f"  ⚠️ Cleanup failed for {user['username']}: {e}")
        
        if deleted_count > 0:
            print(f"✅ Cleaned up {deleted_count} test users")
        else:
            print("⚠️ Manual cleanup may be required for test users")
    
    def save_test_results(self):
        """Speichert Test-Ergebnisse als JSON"""
        results_file = self.test_reports_dir / f"test_results_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Test results saved: {results_file}")
        return results_file
    
    def integration_with_progress_tracker(self):
        """Integration mit Progress Tracker"""
        print("\n🔗 PROGRESS TRACKER INTEGRATION")
        print("-" * 40)
        
        # Berechne Overall Score
        scores = self.calculate_category_scores()
        overall_score = sum(scores.values()) / len(scores) if scores else 0
        
        # Erstelle Integration Data
        integration_data = {
            "test_timestamp": datetime.now().isoformat(),
            "overall_test_score": overall_score,
            "category_scores": scores,
            "beta_ready": overall_score >= 90,
            "critical_issues": self.identify_critical_issues(),
            "recommendations": self.generate_recommendations(overall_score)
        }
        
        # Speichere für Progress Tracker
        integration_file = self.test_reports_dir / "latest_test_integration.json"
        with open(integration_file, 'w', encoding='utf-8') as f:
            json.dump(integration_data, f, indent=2)
        
        print(f"✅ Integration data saved for Progress Tracker")
        print(f"📊 Overall Test Score: {overall_score:.1f}%")
        
        return integration_data
    
    def identify_critical_issues(self):
        """Identifiziert kritische Probleme"""
        issues = []
        
        # Backend Health Issues
        for test_name, result in self.test_results.get("backend_health", {}).items():
            if result.get("status") == "FAIL":
                issues.append(f"Backend {test_name} failing")
        
        # Critical API Issues
        critical_apis = ["games_list", "leaderboard", "sessions"]
        for api in critical_apis:
            if api in self.test_results.get("api_endpoints", {}):
                if self.test_results["api_endpoints"][api].get("status") == "FAIL":
                    issues.append(f"Critical API {api} not working")
        
        return issues
    
    def generate_recommendations(self, overall_score):
        """Generiert Empfehlungen basierend auf Test-Ergebnissen"""
        recommendations = []
        
        if overall_score >= 90:
            recommendations.extend([
                "Ready for beta testing with real users",
                "Consider performance optimization",
                "Set up monitoring for production"
            ])
        elif overall_score >= 75:
            recommendations.extend([
                "Fix failing tests before beta",
                "Implement missing API endpoints",
                "Add error handling improvements"
            ])
        else:
            recommendations.extend([
                "Focus on critical backend issues",
                "Implement core missing features",
                "Extensive testing before beta consideration"
            ])
        
        return recommendations

# =========================================
# 🚀 MAIN EXECUTION & CLI INTERFACE
# =========================================

def main():
    parser = argparse.ArgumentParser(
        description="🎮 RetroRetro Gaming Platform Test Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
EXAMPLES:
  python test_platform.py                    # Quick tests (daily check)
  python test_platform.py --full             # Complete test suite  
  python test_platform.py --beta             # Beta-readiness check
  python test_platform.py --quick --report   # Quick tests + report
  python test_platform.py --integration      # Integration mit Progress Tracker

FEATURES:
  ✅ Backend Health Monitoring
  ✅ API Endpoint Validation  
  ✅ Authentication Flow Testing
  ✅ WebSocket Connectivity
  ✅ Game Features Testing
  ✅ Performance Analysis
  ✅ Beta-Readiness Assessment
  ✅ Progress Tracker Integration
  ✅ Markdown Report Generation
        """
    )
    
    parser.add_argument('--quick', action='store_true', help='Run quick tests only')
    parser.add_argument('--full', action='store_true', help='Run complete test suite')
    parser.add_argument('--beta', action='store_true', help='Beta-readiness assessment')
    parser.add_argument('--report', action='store_true', help='Generate detailed report')
    parser.add_argument('--integration', action='store_true', help='Integration with Progress Tracker')
    parser.add_argument('--cleanup', action='store_true', help='Cleanup test data only')
    
    args = parser.parse_args()
    
    tester = RetroRetroTester()
    
    try:
        if args.cleanup:
            tester.cleanup_test_users()
            
        elif args.beta:
            summary = tester.run_beta_readiness_check()
            if args.report:
                tester.generate_beta_report()
                
        elif args.full:
            summary = tester.run_full_tests()
            if args.report:
                tester.generate_full_report()
                
        elif args.integration:
            # Quick tests + Integration
            tester.run_quick_tests()
            integration_data = tester.integration_with_progress_tracker()
            
            # Optional: Progress Tracker automatisch aufrufen
            try:
                import subprocess
                result = subprocess.run([
                    "python", "progress_tracker.py", "status"
                ], capture_output=True, text=True)
                print("\n🔗 Progress Tracker updated automatically")
            except:
                print("\n💡 Run 'python progress_tracker.py status' to update documentation")
                
        else:
            # Default: Quick tests
            summary = tester.run_quick_tests()
            
            if args.report:
                tester.generate_full_report()
        
        # Immer: Speichere Ergebnisse
        tester.save_test_results()
        
        # Integration Data für andere Scripts
        if not args.cleanup:
            tester.integration_with_progress_tracker()
        
    except KeyboardInterrupt:
        print("\n\n⏹️ Tests abgebrochen")
    except Exception as e:
        print(f"\n❌ Critical test error: {e}")
    finally:
        # Cleanup
        if hasattr(tester, 'session'):
            tester.session.close()

if __name__ == "__main__":
    main()