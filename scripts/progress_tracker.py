#!/usr/bin/env python3
"""
RetroRetro Progress Tracker - SMART ENHANCED EDITION
TAG Updates | Status | Verzeichnis Checking | Kritische Aufgaben | JSON/MD Fortschreibung
+ Smart Priority Management | Auto-Completion Detection | Enhanced UX
"""

import json
import os
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List
from enum import Enum

class Priority(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ProgressTracker:
    def __init__(self):
        # Verzeichnisstruktur - automatische Root-Erkennung
        current_dir = Path.cwd()
        
        # Wenn wir in scripts/ sind, gehe zur Root
        if current_dir.name == "scripts":
            self.project_root = current_dir.parent
            print(f"Erkannt: scripts/ - verwende Root: {self.project_root.absolute()}")
        else:
            self.project_root = current_dir
            print(f"Verwende aktuelles Verzeichnis: {self.project_root.absolute()}")
        
        # Docs-Verzeichnisse (immer relativ zur Root)
        self.docs_dir = self.project_root / "docs"
        self.docs_database = self.docs_dir / "database"
        self.docs_development = self.docs_dir / "development"
        self.docs_api = self.docs_dir / "api"
        
        # JSON-Dateien
        self.progress_json = self.docs_development / "progress.json"
        self.structure_json = self.project_root / "project_structure_check.json"
        
        # Markdown-Dateien
        self.status_md = self.docs_dir / "status.md"
        self.progress_md = self.docs_development / "progress-tracker.md"
        self.critical_tasks_md = self.docs_development / "critical-tasks.md"
        
        # Verzeichnisse erstellen
        self._ensure_directories()
        
        # Daten laden oder initialisieren
        self.progress_data = self._load_or_init_progress_data()
        
    def _ensure_directories(self):
        """Stellt sicher dass alle docs-Verzeichnisse existieren"""
        for dir_path in [self.docs_dir, self.docs_database, self.docs_development, self.docs_api]:
            dir_path.mkdir(exist_ok=True)
            
    def _load_or_init_progress_data(self):
        """Lädt oder initialisiert Progress-Daten"""
        if self.progress_json.exists():
            try:
                with open(self.progress_json, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Initialize smart features if not present
                    if "smart_features" not in data:
                        data["smart_features"] = {
                            "enabled": True,
                            "auto_completion": True,
                            "smart_priority_cleanup": True,
                            "completion_keywords": [
                                "completed", "finished", "done", "fixed", "behoben", 
                                "erledigt", "abgeschlossen", "fertig", "solved", "resolved"
                            ]
                        }
                    return data
            except (json.JSONDecodeError, KeyError) as e:
                print(f"WARNUNG: Fehlerhafte JSON-Datei gefunden: {e}")
                print("Erstelle Backup und initialisiere neue Daten...")
                
                # Backup der fehlerhaften Datei
                backup_path = self.progress_json.with_suffix('.json.backup')
                if self.progress_json.exists():
                    import shutil
                    shutil.copy2(self.progress_json, backup_path)
                    print(f"Backup erstellt: {backup_path}")
        
        # Initialisierung mit vollständiger TAG-Planung + Smart Features
        return {
            "project_start": "2025-08-01",
            "total_hours": 66,
            "current_tag": "TAG_5",
            "smart_features": {
                "enabled": True,
                "auto_completion": True,
                "smart_priority_cleanup": True,
                "completion_keywords": [
                    "completed", "finished", "done", "fixed", "behoben", 
                    "erledigt", "abgeschlossen", "fertig", "solved", "resolved"
                ]
            },
            "tags": {
                "TAG_1_BASIC_SETUP": {
                    "status": "completed",
                    "completion_date": "2025-08-01",
                    "description": "Project structure and basic server",
                    "hours": 8,
                    "tasks_completed": ["Server setup", "Basic routing", "Project structure"]
                },
                "TAG_2_DUAL_SERVER": {
                    "status": "completed", 
                    "completion_date": "2025-08-01",
                    "description": "Frontend + Backend integration",
                    "hours": 12,
                    "tasks_completed": ["WebSocket integration", "Frontend connection", "Dual server setup"]
                },
                "TAG_3_DATABASE": {
                    "status": "completed",
                    "completion_date": "2025-08-02", 
                    "description": "Full database integration",
                    "hours": 16,
                    "tasks_completed": ["PostgreSQL setup", "Redis integration", "User models"]
                },
                "TAG_4_FEATURES": {
                    "status": "completed",
                    "completion_date": "2025-08-04",
                    "description": "Advanced gaming features",
                    "hours": 30,
                    "tasks_completed": ["Game engines", "Leaderboard", "Score system", "User profiles"]
                },
                "TAG_5_USER_EXPERIENCE": {
                    "status": "completed",
                    "completion_date": "2025-08-11",
                    "description": "User Experience & Interface Polish + Professional Styling System",
                    "hours": 15.0,
                    "planned_hours": 20,
                    "tasks_completed": [
                        "Fix styled-components warnings",
                        "Professional Theme Architecture ohne any-Hacks",
                        "TypeScript Theme Declaration Merging implementiert",
                        "Vollständiges darkArcadeTheme mit 60+ Properties",
                        "Gaming-spezifische Farb-Palette",
                        "Neon-Glow-Effekte und Retro-Animationen",
                        "Type-safe Styled Components",
                        "Responsive Design mit Gaming-Breakpoints",
                        "Accessibility-Features",
                        "Gaming-UI Komponenten",
                        "Alle TypeScript-Errors behoben",
                        "Hot Reload Performance optimiert",
                        "Component Architecture professionalisiert"
                    ],
                    "target_date": "2025-08-08",
                    "dependencies_for": [
                        "TAG_6_INTERNATIONALIZATION"
                    ],
                    "technical_achievements": {
                        "typescript_coverage": "100%",
                        "component_count": "25+ Gaming-spezifische Komponenten",
                        "theme_properties": "60+ Type-safe Theme Properties",
                        "performance": "Hot Reload <1s, Build Time ~30s",
                        "accessibility_score": "95/100"
                    },
                    "business_impact": "Professional UI/UX Foundation für globale Markteinführung"
                },
                "TAG_6_BETA_TESTING": {
                    "status": "planned",
                    "completion_date": None,
                    "description": "Beta Testing & User Feedback",
                    "hours": 0,
                    "planned_hours": 15,
                    "planned_tasks": [
                        "Beta user recruitment",
                        "Feedback collection system",
                        "Bug tracking setup",
                        "Performance monitoring",
                        "User analytics implementation"
                    ],
                    "target_date": "2025-08-15"
                },
                "TAG_7_PRODUCTION": {
                    "status": "planned",
                    "completion_date": None,
                    "description": "Production Deployment & Launch",
                    "hours": 0,
                    "planned_hours": 25,
                    "planned_tasks": [
                        "Production server setup",
                        "Domain & SSL configuration",
                        "Database migration scripts",
                        "Monitoring & logging",
                        "Backup strategies",
                        "Launch preparation"
                    ],
                    "target_date": "2025-08-20"
                }
            },
            "daily_logs": [],
            "next_actions": {
                "today": [
                    "Test platform comprehensive analysis",
                    "Fix critical styled-components warnings",
                    "Plan beta testing strategy"
                ],
                "this_week": [
                    "Complete TAG 5 user experience improvements",
                    "Setup beta user recruitment process",
                    "Performance optimization round"
                ],
                "next_week": [
                    "Launch limited beta testing",
                    "Collect user feedback",
                    "Production deployment planning"
                ]
            },
            "current_priorities": [
                {
                    "task": "Fix styled-components warnings",
                    "priority": "high",
                    "estimated_hours": 4,
                    "deadline": "2025-08-06",
                    "reason": "Blocking clean production build",
                    "status": "active"
                },
                {
                    "task": "Beta user recruitment plan",
                    "priority": "high", 
                    "estimated_hours": 3,
                    "deadline": "2025-08-07",
                    "reason": "Need early feedback for TAG 6",
                    "status": "active"
                },
                {
                    "task": "Performance testing analysis",
                    "priority": "medium",
                    "estimated_hours": 2,
                    "deadline": "2025-08-08",
                    "reason": "Validate production readiness",
                    "status": "active"
                }
            ],
            "archived_priorities": [],
            "last_update": datetime.now().isoformat()
        }
    
    def _save_progress_data(self):
        """Speichert Progress-Daten"""
        self.progress_data["last_update"] = datetime.now().isoformat()
        with open(self.progress_json, 'w', encoding='utf-8') as f:
            json.dump(self.progress_data, f, indent=2, ensure_ascii=False)
    
    def complete_priority(self, task_identifier):
        """Complete priority task mit Smart Matching"""
        if "current_priorities" not in self.progress_data:
            self.progress_data["current_priorities"] = []
        
        priorities = self.progress_data["current_priorities"]
        completed_task = None
        
        # Smart matching: exakt, partial, keywords
        for priority in priorities:
            if priority.get("status", "active") == "completed":
                continue
                
            task_title = priority["task"].lower()
            identifier = task_identifier.lower()
            
            # Exakte Übereinstimmung oder enthält Keywords
            if (identifier == task_title or 
                identifier in task_title or
                any(word in task_title for word in identifier.split())):
                
                # Markiere als completed
                priority["status"] = "completed"
                priority["completion_date"] = datetime.now().strftime("%Y-%m-%d")
                priority["completion_time"] = datetime.now().strftime("%H:%M")
                completed_task = priority
                break
        
        if completed_task:
            # Daily log hinzufügen
            self.progress_data["daily_logs"].append({
                "date": datetime.now().isoformat(),
                "action": "priority_completed",
                "task": completed_task["task"],
                "method": "manual_complete",
                "identifier_used": task_identifier
            })
            
            self._save_progress_data()
            print(f"Priority completed: {completed_task['task']}")
            
            # Auto-cleanup if enabled
            if self.progress_data.get("smart_features", {}).get("smart_priority_cleanup", True):
                self._auto_cleanup_completed()
            
            return True
        
        print(f"Priority not found: {task_identifier}")
        print("Available active priorities:")
        active_priorities = [p for p in priorities if p.get("status", "active") != "completed"]
        for p in active_priorities[:5]:
            print(f"   - {p['task']}")
        return False
    
    def remove_priority(self, task_identifier):
        """Remove priority task completely"""
        if "current_priorities" not in self.progress_data:
            return False
        
        priorities = self.progress_data["current_priorities"]
        removed_tasks = []
        
        # Filter out matching priorities and track what was removed
        remaining_priorities = []
        for priority in priorities:
            if task_identifier.lower() in priority["task"].lower():
                removed_tasks.append(priority["task"])
                # Archive removed task
                if "archived_priorities" not in self.progress_data:
                    self.progress_data["archived_priorities"] = []
                priority["removal_date"] = datetime.now().strftime("%Y-%m-%d")
                priority["removal_reason"] = "manual_removal"
                self.progress_data["archived_priorities"].append(priority)
            else:
                remaining_priorities.append(priority)
        
        self.progress_data["current_priorities"] = remaining_priorities
        
        if removed_tasks:
            self.progress_data["daily_logs"].append({
                "date": datetime.now().isoformat(),
                "action": "priorities_removed",
                "tasks": removed_tasks,
                "count": len(removed_tasks),
                "identifier": task_identifier
            })
            
            self._save_progress_data()
            print(f"{len(removed_tasks)} priority(ies) removed:")
            for task in removed_tasks:
                print(f"   - {task}")
            return True
        
        print(f"No priorities found matching: {task_identifier}")
        return False
    
    def cleanup_completed_priorities(self):
        """Remove all completed priorities from display"""
        if "current_priorities" not in self.progress_data:
            return 0
        
        active_priorities = []
        completed_priorities = []
        
        for priority in self.progress_data["current_priorities"]:
            if priority.get("status", "active") == "completed":
                completed_priorities.append(priority)
                # Archive completed priority
                if "archived_priorities" not in self.progress_data:
                    self.progress_data["archived_priorities"] = []
                priority["archived_date"] = datetime.now().strftime("%Y-%m-%d")
                self.progress_data["archived_priorities"].append(priority)
            else:
                active_priorities.append(priority)
        
        self.progress_data["current_priorities"] = active_priorities
        
        if completed_priorities:
            self.progress_data["daily_logs"].append({
                "date": datetime.now().isoformat(),
                "action": "completed_priorities_archived",
                "count": len(completed_priorities),
                "tasks": [p["task"] for p in completed_priorities]
            })
            
            self._save_progress_data()
            print(f"{len(completed_priorities)} completed priorities archived")
            for priority in completed_priorities:
                print(f"   - {priority['task']}")
        else:
            print("No completed priorities to clean up")
        
        return len(completed_priorities)
    
    def _auto_cleanup_completed(self):
        """Auto-cleanup completed priorities (silent)"""
        if not self.progress_data.get("smart_features", {}).get("smart_priority_cleanup", True):
            return
        
        count = self.cleanup_completed_priorities()
        if count > 0:
            print(f"Auto-archived {count} completed priority(ies)")
    
    def add_hours(self, tag_name, hours, notes=""):
        """Enhanced mit Smart Completion Detection"""
        tag_key = tag_name.upper().replace(" ", "_")
        
        if tag_key not in self.progress_data["tags"]:
            print(f"TAG '{tag_name}' nicht gefunden!")
            available_tags = [key for key in self.progress_data["tags"].keys() if "_" in key]
            print("Verfügbare TAGs:")
            for tag in available_tags[:5]:
                print(f"   - {tag}")
            return False
        
        # Original functionality
        old_hours = self.progress_data["tags"][tag_key]["hours"]
        self.progress_data["tags"][tag_key]["hours"] += hours
        
        # Smart Completion Detection
        completion_detected = self._detect_completion_in_notes(notes)
        auto_completed_tasks = []
        
        if completion_detected and self.progress_data.get("smart_features", {}).get("auto_completion", True):
            print(f"Completion detected: '{completion_detected}'")
            
            # Auto-complete matching priorities
            auto_completed_tasks = self._auto_complete_matching_priorities(completion_detected, tag_name)
            if auto_completed_tasks:
                print(f"Auto-completed {len(auto_completed_tasks)} related priority(ies):")
                for task in auto_completed_tasks:
                    print(f"   - {task}")
        
        # Enhanced daily log
        log_entry = {
            "date": datetime.now().isoformat(),
            "action": "hours_added",
            "tag": tag_key,
            "hours": hours,
            "old_total": old_hours,
            "new_total": old_hours + hours,
            "notes": notes
        }
        
        if completion_detected:
            log_entry["completion_detected"] = completion_detected
            log_entry["smart_action"] = True
            log_entry["auto_completed_tasks"] = auto_completed_tasks
        
        self.progress_data["daily_logs"].append(log_entry)
        self._save_progress_data()
        
        print(f"{hours}h zu {tag_name} hinzugefügt (Total: {old_hours + hours}h)")
        
        # Auto-cleanup if enabled and completions were detected
        if auto_completed_tasks and self.progress_data.get("smart_features", {}).get("smart_priority_cleanup", True):
            self._auto_cleanup_completed()
        
        return True
    
    def _detect_completion_in_notes(self, notes):
        """Detect completion keywords in notes"""
        if not notes:
            return None
            
        completion_keywords = self.progress_data.get("smart_features", {}).get(
            "completion_keywords", 
            ["completed", "finished", "done", "fixed", "behoben", "erledigt", "abgeschlossen", "fertig"]
        )
        
        notes_lower = notes.lower()
        
        for keyword in completion_keywords:
            if keyword in notes_lower:
                # Extract context around keyword (3 words before and after)
                words = notes.split()
                try:
                    # Find keyword in original (non-lowercased) text
                    for i, word in enumerate(words):
                        if keyword in word.lower():
                            start = max(0, i - 2)
                            end = min(len(words), i + 3)
                            context = " ".join(words[start:end])
                            return context
                except:
                    return keyword
        
        return None
    
    def _auto_complete_matching_priorities(self, completion_context, tag_name):
        """Auto-complete priorities that match completion context"""
        if "current_priorities" not in self.progress_data:
            return []
        
        auto_completed = []
        context_words = set(word.lower() for word in completion_context.split() if len(word) > 2)
        
        for priority in self.progress_data["current_priorities"]:
            if priority.get("status", "active") == "completed":
                continue
                
            task_words = set(word.lower() for word in priority["task"].split() if len(word) > 2)
            
            # Check if 2+ significant words from context match task words
            matches = len(context_words.intersection(task_words))
            
            if matches >= 2:  # Threshold für Auto-Completion
                priority["status"] = "completed"
                priority["completion_date"] = datetime.now().strftime("%Y-%m-%d")
                priority["completion_time"] = datetime.now().strftime("%H:%M")
                priority["auto_completed"] = True
                priority["completion_context"] = completion_context
                priority["completed_via_tag"] = tag_name
                auto_completed.append(priority["task"])
        
        return auto_completed
    
    def show_smart_priorities(self):
        """Zeigt nur aktive Prioritäten (completed ausgeblendet)"""
        if "current_priorities" not in self.progress_data:
            print("Keine Prioritäten definiert")
            return
        
        all_priorities = self.progress_data["current_priorities"]
        active_priorities = [
            p for p in all_priorities 
            if p.get("status", "active") != "completed"
        ]
        
        if not active_priorities:
            print("Alle Prioritäten erledigt!")
            
            # Zeige kürzlich erledigte (heute)
            today = datetime.now().strftime("%Y-%m-%d")
            completed_today = [
                p for p in all_priorities
                if p.get("status") == "completed" and 
                   p.get("completion_date", "") == today
            ]
            
            if completed_today:
                print(f"\nHeute erledigt ({len(completed_today)} tasks):")
                for task in completed_today:
                    completion_time = task.get("completion_time", "")
                    auto_flag = " (auto)" if task.get("auto_completed") else ""
                    print(f"   - {task['task']}{auto_flag} ({completion_time})")
            
            # Zeige Statistiken
            total_completed = len([p for p in all_priorities if p.get("status") == "completed"])
            total_priorities = len(all_priorities)
            if total_priorities > 0:
                completion_rate = (total_completed / total_priorities) * 100
                print(f"\nCompletion Rate: {total_completed}/{total_priorities} ({completion_rate:.1f}%)")
            
            return
        
        print("AKTIVE PRIORITÄTEN:")
        print("-" * 50)
        
        # Sortiere nach Priorität und Deadline
        priority_order = {"critical": 1, "high": 2, "medium": 3, "low": 4}
        active_priorities.sort(key=lambda x: (
            priority_order.get(x.get("priority", "medium"), 5),
            x.get("deadline", "9999-12-31")
        ))
        
        for i, priority in enumerate(active_priorities, 1):
            priority_icon = {
                "critical": "[CRITICAL]", "high": "[HIGH]", "medium": "[MEDIUM]", "low": "[LOW]"
            }.get(priority.get("priority", "medium"), "[NORMAL]")
            
            deadline = priority.get("deadline", "TBD")
            hours = priority.get("estimated_hours", "?")
            
            # Check if overdue
            overdue_flag = ""
            if deadline != "TBD":
                try:
                    deadline_date = datetime.strptime(deadline, "%Y-%m-%d")
                    if deadline_date < datetime.now():
                        overdue_flag = " OVERDUE"
                except:
                    pass
            
            print(f"   {i}. {priority_icon} {priority['task']} ({hours}h, bis {deadline}){overdue_flag}")
            
            # Show reason if available
            if priority.get("reason"):
                print(f"      Grund: {priority['reason']}")
    
    def show_timeline_overview(self):
        """Enhanced Timeline mit Smart Features"""
        print("\n\n")
        print("=" * 80)
        print("RETRORETRO - SMART TIMELINE OVERVIEW")
        print("=" * 80)
        
        # Projekt-Überblick
        total_hours = sum(tag["hours"] for tag in self.progress_data["tags"].values())
        completed_tags = len([tag for tag in self.progress_data["tags"].values() if tag["status"] == "completed"])
        in_progress_tags = len([tag for tag in self.progress_data["tags"].values() if tag["status"] == "in_progress"])
        planned_tags = len([tag for tag in self.progress_data["tags"].values() if tag["status"] == "planned"])
        
        print(f"\nPROJEKT-ÜBERBLICK:")
        print(f"   Start: {self.progress_data['project_start']}")
        print(f"   Aktuelle TAG: {self.progress_data['current_tag']}")
        print(f"   Geleistete Stunden: {total_hours}")
        print(f"   Status: {completed_tags} COMPLETED | {in_progress_tags} IN_PROGRESS | {planned_tags} PLANNED")
        
        # Smart Features Status
        smart_enabled = self.progress_data.get("smart_features", {}).get("enabled", False)
        print(f"   Smart Features: {'ENABLED' if smart_enabled else 'DISABLED'}")
        
        # TAGs Übersicht (kompakt)
        print(f"\nTAG-STATUS:")
        print("-" * 60)
        
        for tag_key, tag_data in self.progress_data["tags"].items():
            status_icon = "[COMPLETED]" if tag_data["status"] == "completed" else ("[IN_PROGRESS]" if tag_data["status"] == "in_progress" else "[PLANNED]")
            hours_info = f"{tag_data['hours']}"
            if tag_data.get('planned_hours'):
                hours_info += f"/{tag_data['planned_hours']}"
            hours_info += "h"
            
            target_date = tag_data.get('target_date', 'TBD')
            completion_date = tag_data.get('completion_date', '')
            date_info = completion_date if completion_date else f"-> {target_date}"
            
            print(f"   {status_icon} {tag_key:<25} {hours_info:<10} ({date_info})")
        
        # Smart Priority Status
        self._show_smart_priority_summary()
        
        # Nächste Aktionen
        if "next_actions" in self.progress_data:
            actions = self.progress_data["next_actions"]
            print(f"\nNÄCHSTE AKTIONEN:")
            print("-" * 40)
            
            if actions.get("today"):
                print("   HEUTE:")
                for action in actions["today"][:3]:
                    print(f"      • {action}")
            
            if actions.get("this_week"):
                print("   DIESE WOCHE:")
                for action in actions["this_week"][:3]:
                    print(f"      • {action}")
        
        # Quick Commands
        print(f"\nSMART COMMANDS:")
        print("-" * 40)
        print("   python progress_tracker.py work TAG_5 2 'Task COMPLETED'  # Smart work logging")
        print("   python progress_tracker.py complete-priority 'task name'   # Complete priority")
        print("   python progress_tracker.py smart-priorities               # Show active only")
        print("   python progress_tracker.py cleanup-priorities             # Archive completed")
        
        print("\n" + "=" * 80)
        print("Smart Features: Auto-completion, Priority management, Enhanced UX")
        print("=" * 80)
        print("\n\n")
    
    def _show_smart_priority_summary(self):
        """Zeigt Smart Priority Summary"""
        if "current_priorities" not in self.progress_data:
            return
        
        all_priorities = self.progress_data["current_priorities"]
        active_priorities = [p for p in all_priorities if p.get("status", "active") != "completed"]
        completed_priorities = [p for p in all_priorities if p.get("status") == "completed"]
        
        print(f"\nSMART PRIORITY STATUS:")
        print("-" * 40)
        
        if not all_priorities:
            print("   No priorities defined")
            return
        
        total = len(all_priorities)
        active = len(active_priorities)
        completed = len(completed_priorities)
        
        if total > 0:
            completion_rate = (completed / total) * 100
            print(f"   Priorities: {completed}/{total} completed ({completion_rate:.1f}%)")
            print(f"   Active: {active} | Completed: {completed}")
            
            # Show top 3 active priorities
            if active_priorities:
                print(f"   Top Active:")
                for i, priority in enumerate(active_priorities[:3], 1):
                    icon = {"critical": "[CRITICAL]", "high": "[HIGH]", "medium": "[MEDIUM]"}.get(priority.get("priority", "medium"), "[NORMAL]")
                    print(f"      {i}. {icon} {priority['task']}")
            
            if completed == total:
                print(f"   All priorities completed! Ready for next phase!")
    
    def check_directory_structure(self):
        """Original method - unchanged"""
        print("Überprüfe Projektstruktur...")
        
        # Original implementation...
        critical_structure = [
            ("backend/src/app.js", "Main Express application entry point"),
            ("backend/src/database/", "Database connection and models"),
            ("backend/config/", "Configuration management"),
            ("backend/src/auth/", "Authentication system"),
            ("backend/src/models/User.js", "User data model"),
            ("backend/src/routes/auth.js", "Authentication routes"),
            ("backend/src/game/", "Game engine core"),
            ("backend/src/socket/", "Socket.io handlers"),
            ("frontend/src/i18n/", "Frontend internationalization"),
            ("backend/src/payment/", "Payment processing system")
        ]
        
        high_priority_structure = [
            ("backend/src/routes/users.js", "User management routes"),
            ("backend/src/services/userService.js", "User business logic"),
            ("backend/src/middleware/roles.js", "Role-based access control"),
            ("backend/src/models/Game.js", "Game data model"),
            ("backend/src/services/gameService.js", "Game business logic"),
            ("frontend/src/hooks/useSocket.js", "Socket.io React hook")
        ]
        
        existing = []
        missing_critical = []
        missing_high = []
        
        for path, desc in critical_structure:
            if (self.project_root / path).exists():
                existing.append({"path": path, "description": desc, "priority": "CRITICAL"})
            else:
                missing_critical.append({"path": path, "description": desc, "priority": "CRITICAL"})
        
        for path, desc in high_priority_structure:
            if (self.project_root / path).exists():
                existing.append({"path": path, "description": desc, "priority": "HIGH"})
            else:
                missing_high.append({"path": path, "description": desc, "priority": "HIGH"})
        
        total_items = len(critical_structure) + len(high_priority_structure)
        existing_count = len(existing)
        completion = round((existing_count / total_items) * 100, 1)
        
        structure_data = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_items": total_items,
                "existing_count": existing_count,
                "missing_count": total_items - existing_count,
                "completion_percentage": completion
            },
            "existing": existing,
            "missing_critical": missing_critical,
            "missing_high": missing_high
        }
        
        # Speichere Struktur-JSON
        with open(self.structure_json, 'w', encoding='utf-8') as f:
            json.dump(structure_data, f, indent=2, ensure_ascii=False)
        
        print(f"Struktur-Check: {completion}% vollständig ({existing_count}/{total_items})")
        return structure_data
    
    def handle_smart_commands(self, action, args):
        """Handle neue Smart Commands"""
        
        if action == 'complete-priority':
            if not args or (isinstance(args, list) and not args):
                print("Usage: python progress_tracker.py complete-priority \"task name\"")
                return False
            task_identifier = " ".join(args) if isinstance(args, list) else str(args)
            return self.complete_priority(task_identifier)
            
        elif action == 'remove-priority':
            if not args or (isinstance(args, list) and not args):
                print("Usage: python progress_tracker.py remove-priority \"task name\"")
                return False
            task_identifier = " ".join(args) if isinstance(args, list) else str(args)
            return self.remove_priority(task_identifier)
            
        elif action == 'cleanup-priorities':
            count = self.cleanup_completed_priorities()
            return True
            
        elif action == 'smart-priorities':
            self.show_smart_priorities()
            return True
            
        elif action == 'work':
            if not isinstance(args, list) or len(args) < 3:
                print("Usage: python progress_tracker.py work TAG_NAME HOURS \"description\"")
                return False
            
            tag_name = args[0]
            try:
                hours = float(args[1])
            except ValueError:
                print("Hours must be a number")
                return False
            
            notes = " ".join(args[2:])
            return self.add_hours(tag_name, hours, notes)
            
        elif action == 'smart-status':
            self.show_timeline_overview()
            return True
            
        elif action == 'toggle-smart':
            current = self.progress_data.get("smart_features", {}).get("enabled", True)
            self.progress_data.setdefault("smart_features", {})["enabled"] = not current
            self._save_progress_data()
            status = "ENABLED" if not current else "DISABLED"
            print(f"Smart Features {status}")
            return True
            
        else:
            return False

def main():
    """Enhanced main mit Smart Commands"""
    parser = argparse.ArgumentParser(
        description="RetroRetro Progress Tracker - Smart Enhanced Edition",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
SMART COMMANDS:
  python progress_tracker.py work TAG_5 2 "Task COMPLETED"     # Smart work logging
  python progress_tracker.py complete-priority "task name"     # Complete priority  
  python progress_tracker.py smart-priorities                  # Show active only
  python progress_tracker.py cleanup-priorities                # Archive completed

ORIGINAL COMMANDS (still work):
  python progress_tracker.py show                             # Smart timeline
        """
    )
    
    subparsers = parser.add_subparsers(dest='action', help='Verfügbare Aktionen')
    
    # Original commands
    show_parser = subparsers.add_parser('show', help='Smart Timeline-Übersicht anzeigen')
    
    # NEW Smart Commands
    work_parser = subparsers.add_parser('work', help='Smart work logging mit auto-completion')
    work_parser.add_argument('tag_name', help='TAG name')
    work_parser.add_argument('hours', type=float, help='Stunden gearbeitet')
    work_parser.add_argument('description', nargs='+', help='Arbeitsbeschreibung (keywords: COMPLETED, FINISHED, etc.)')
    
    complete_parser = subparsers.add_parser('complete-priority', help='Complete priority task (smart matching)')
    complete_parser.add_argument('task_name', nargs='+', help='Priority task name (partial match OK)')
    
    remove_parser = subparsers.add_parser('remove-priority', help='Remove priority task')
    remove_parser.add_argument('task_name', nargs='+', help='Priority task name to remove')
    
    cleanup_parser = subparsers.add_parser('cleanup-priorities', help='Archive completed priorities')
    
    smart_priorities_parser = subparsers.add_parser('smart-priorities', help='Show active priorities only')
    
    toggle_parser = subparsers.add_parser('toggle-smart', help='Toggle smart features on/off')
    
    help_parser = subparsers.add_parser('help', help='Detaillierte Hilfe anzeigen')
    
    args = parser.parse_args()
    
    tracker = ProgressTracker()
    
    # Handle smart commands first
    smart_args = None
    if hasattr(args, 'task_name'):
        smart_args = args.task_name
    elif hasattr(args, 'tag_name') and hasattr(args, 'description'):
        smart_args = [args.tag_name, str(args.hours)] + args.description
    elif hasattr(args, 'tag_name') and hasattr(args, 'hours'):
        smart_args = [args.tag_name, str(args.hours)]
    
    if tracker.handle_smart_commands(args.action, smart_args):
        return
    
    # Original commands
    if args.action == 'show' or args.action is None:
        tracker.show_timeline_overview()
        
    elif args.action == 'help':
        help_text = """
RETRORETRO PROGRESS TRACKER - SMART ENHANCED EDITION
""" + "=" * 60 + """

SMART COMMANDS (NEW):
  work [tag] [hours] [description]     - Smart work logging with auto-completion
  complete-priority [task_name]        - Complete priority (smart matching)
  remove-priority [task_name]          - Remove priority completely
  cleanup-priorities                   - Archive all completed priorities
  smart-priorities                     - Show only active priorities
  toggle-smart                         - Enable/disable smart features

ORIGINAL COMMANDS (enhanced):
  show                                 - Smart timeline overview

SMART WORKFLOW EXAMPLE:
  # Smart work logging with auto-completion:
  python progress_tracker.py work TAG_5 2 "Styled-components warnings COMPLETED"
  # Auto-detects completion, completes matching priorities, updates everything

FEATURES:
  - Auto-completion detection via keywords (COMPLETED, FINISHED, DONE, etc.)
  - Smart priority matching (partial names, keywords)
  - Auto-cleanup of completed priorities
  - Enhanced display (active priorities only)
  - Backward compatible (all old commands still work)
        """
        print(help_text)
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()