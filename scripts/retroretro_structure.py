#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RetroRetro Legal Gaming Service - Smart Project Structure Analyzer
Analyzes project structure with file criticality and purpose identification
"""

import os
import json
import datetime
from pathlib import Path
import argparse
from typing import Dict, List, Tuple, Optional

class SmartStructureAnalyzer:
    def __init__(self, root_path: str = "."):
        self.root_path = Path(root_path).resolve()
        self.exclude_dirs = {
            'node_modules', '.git', '__pycache__', '.next', 
            'dist', 'build', 'coverage', '.pytest_cache', 'venv'
        }
        self.exclude_files = {'.DS_Store', 'Thumbs.db', '.env.local'}
        
        # Generate filename with short date format
        current_date = datetime.datetime.now()
        date_suffix = current_date.strftime("%d%m%y")  # e.g., 070825 for 07.08.2025
        filename = f"retroretro_structure_{date_suffix}.txt"
        self.output_path = self.root_path / "docs" / "database" / filename
        
        # Define file criticality and purposes
        self.file_criticality = self._init_file_criticality()
        self.directory_purposes = self._init_directory_purposes()
        
    def _init_file_criticality(self) -> Dict[str, Dict]:
        """Initialize file criticality database"""
        return {
            # CRITICAL - Essential files
            "package.json": {
                "criticality": "🔴 CRITICAL",
                "purpose": "Project dependencies & metadata",
                "reason": "Required for npm install & project info",
                "category": "dependency_management"
            },
            "app.js": {
                "criticality": "🔴 CRITICAL", 
                "purpose": "Main application entry point",
                "reason": "Core server bootstrap",
                "category": "core_application"
            },
            "index.js": {
                "criticality": "🔴 CRITICAL",
                "purpose": "Application entry point", 
                "reason": "Main execution file",
                "category": "core_application"
            },
            "server.js": {
                "criticality": "🔴 CRITICAL",
                "purpose": "Server configuration & startup",
                "reason": "Backend server initialization", 
                "category": "core_application"
            },
            ".env": {
                "criticality": "🔴 CRITICAL",
                "purpose": "Environment configuration",
                "reason": "Database & API credentials",
                "category": "configuration"
            },
            "database.js": {
                "criticality": "🔴 CRITICAL",
                "purpose": "Database connection setup",
                "reason": "Data persistence layer",
                "category": "database"
            },
            
            # HIGH PRIORITY - Important functionality
            "auth.js": {
                "criticality": "🟠 HIGH",
                "purpose": "Authentication system",
                "reason": "User login & JWT handling",
                "category": "security"
            },
            "routes.js": {
                "criticality": "🟠 HIGH", 
                "purpose": "API route definitions",
                "reason": "Backend API endpoints",
                "category": "api"
            },
            "User.js": {
                "criticality": "🟠 HIGH",
                "purpose": "User data model",
                "reason": "User schema & methods",
                "category": "models"
            },
            "socket.js": {
                "criticality": "🟠 HIGH",
                "purpose": "WebSocket handling",
                "reason": "Real-time multiplayer features",
                "category": "real_time"
            },
            "gameEngine.js": {
                "criticality": "🟠 HIGH",
                "purpose": "Game logic core",
                "reason": "Gaming functionality",
                "category": "game_logic"
            },
            
            # MEDIUM - Supporting files  
            "middleware.js": {
                "criticality": "🟡 MEDIUM",
                "purpose": "Express middleware",
                "reason": "Request processing pipeline",
                "category": "middleware"
            },
            "utils.js": {
                "criticality": "🟡 MEDIUM",
                "purpose": "Utility functions",
                "reason": "Helper functions & tools",
                "category": "utilities"
            },
            "config.js": {
                "criticality": "🟡 MEDIUM",
                "purpose": "Application configuration",
                "reason": "Settings & constants",
                "category": "configuration"
            },
            "README.md": {
                "criticality": "🟡 MEDIUM",
                "purpose": "Project documentation",
                "reason": "Setup & usage instructions",
                "category": "documentation"
            },
            
            # LOW - Optional/Generated files
            "package-lock.json": {
                "criticality": "🟢 LOW",
                "purpose": "Dependency lock file",
                "reason": "Ensures consistent installs",
                "category": "dependency_management"
            },
            ".gitignore": {
                "criticality": "🟢 LOW",
                "purpose": "Git ignore patterns", 
                "reason": "Version control exclusions",
                "category": "version_control"
            },
            
            # UNCLEAR - Need analysis
            "temp.js": {
                "criticality": "❓ UNCLEAR",
                "purpose": "Unknown purpose",
                "reason": "Requires investigation",
                "category": "unknown"
            },
            "test.js": {
                "criticality": "❓ UNCLEAR", 
                "purpose": "Could be testing or temporary",
                "reason": "Name suggests test file",
                "category": "testing_or_temp"
            }
        }
    
    def _init_directory_purposes(self) -> Dict[str, Dict]:
        """Initialize directory purpose database"""
        return {
            "src": {
                "purpose": "🏗️ Source code (core application)",
                "criticality": "🔴 CRITICAL",
                "category": "core"
            },
            "backend": {
                "purpose": "🔧 Backend server & API",
                "criticality": "🔴 CRITICAL", 
                "category": "core"
            },
            "frontend": {
                "purpose": "🖥️ Frontend React application",
                "criticality": "🔴 CRITICAL",
                "category": "core"
            },
            "routes": {
                "purpose": "🛤️ API route definitions",
                "criticality": "🟠 HIGH",
                "category": "api"
            },
            "models": {
                "purpose": "🗄️ Database models & schemas", 
                "criticality": "🟠 HIGH",
                "category": "database"
            },
            "controllers": {
                "purpose": "🎮 Request handlers & business logic",
                "criticality": "🟠 HIGH", 
                "category": "logic"
            },
            "middleware": {
                "purpose": "⚙️ Express middleware functions",
                "criticality": "🟡 MEDIUM",
                "category": "middleware"
            },
            "utils": {
                "purpose": "🔧 Utility functions & helpers",
                "criticality": "🟡 MEDIUM",
                "category": "utilities"
            },
            "config": {
                "purpose": "⚙️ Configuration files",
                "criticality": "🟡 MEDIUM",
                "category": "configuration"
            },
            "public": {
                "purpose": "🌐 Static assets (CSS, images)",
                "criticality": "🟡 MEDIUM",
                "category": "assets"
            },
            "tests": {
                "purpose": "🧪 Test files & test suites", 
                "criticality": "🟢 LOW",
                "category": "testing"
            },
            "docs": {
                "purpose": "📚 Documentation files",
                "criticality": "🟢 LOW",
                "category": "documentation"
            },
            "scripts": {
                "purpose": "📜 Utility scripts & automation",
                "criticality": "🟢 LOW", 
                "category": "automation"
            },
            "temp": {
                "purpose": "❓ Temporary files (unclear purpose)",
                "criticality": "❓ UNCLEAR",
                "category": "unknown"
            }
        }
    
    def analyze_file(self, file_path: Path) -> Dict[str, str]:
        """Analyze individual file for criticality and purpose"""
        file_name = file_path.name.lower()
        file_stem = file_path.stem.lower()
        file_ext = file_path.suffix.lower()
        
        # Check exact filename match first
        if file_name in self.file_criticality:
            return self.file_criticality[file_name]
        
        # Check stem (name without extension)
        if file_stem in self.file_criticality:
            return self.file_criticality[file_stem]
        
        # Pattern-based analysis
        analysis = self._analyze_by_patterns(file_path, file_name, file_stem, file_ext)
        
        return analysis
    
    def _analyze_by_patterns(self, file_path: Path, file_name: str, file_stem: str, file_ext: str) -> Dict[str, str]:
        """Analyze file based on naming patterns and context"""
        
        # Configuration files
        if any(pattern in file_name for pattern in ['.env', 'config', 'settings']):
            return {
                "criticality": "🟡 MEDIUM",
                "purpose": "Configuration file",
                "reason": "Application settings",
                "category": "configuration"
            }
        
        # Model files
        if 'model' in file_name or file_path.parent.name.lower() == 'models':
            return {
                "criticality": "🟠 HIGH", 
                "purpose": "Database model",
                "reason": "Data schema definition",
                "category": "models"
            }
        
        # Route files  
        if 'route' in file_name or file_path.parent.name.lower() == 'routes':
            return {
                "criticality": "🟠 HIGH",
                "purpose": "API route handler", 
                "reason": "Endpoint definitions",
                "category": "api"
            }
        
        # Controller files
        if 'controller' in file_name or file_path.parent.name.lower() == 'controllers':
            return {
                "criticality": "🟠 HIGH",
                "purpose": "Request controller",
                "reason": "Business logic handler", 
                "category": "logic"
            }
        
        # Service files
        if 'service' in file_name or file_path.parent.name.lower() == 'services':
            return {
                "criticality": "🟠 HIGH",
                "purpose": "Service layer logic",
                "reason": "Business logic abstraction",
                "category": "services"
            }
        
        # Authentication/Security
        if any(pattern in file_name for pattern in ['auth', 'security', 'jwt', 'passport']):
            return {
                "criticality": "🔴 CRITICAL",
                "purpose": "Authentication system",
                "reason": "Security & user management", 
                "category": "security"
            }
        
        # Database related
        if any(pattern in file_name for pattern in ['database', 'db', 'connection', 'migration']):
            return {
                "criticality": "🔴 CRITICAL", 
                "purpose": "Database functionality",
                "reason": "Data persistence layer",
                "category": "database"
            }
        
        # Game related
        if any(pattern in file_name for pattern in ['game', 'player', 'score', 'leaderboard']):
            return {
                "criticality": "🟠 HIGH",
                "purpose": "Game functionality", 
                "reason": "Core gaming features",
                "category": "game_logic"
            }
        
        # Socket/Real-time
        if any(pattern in file_name for pattern in ['socket', 'websocket', 'realtime', 'io']):
            return {
                "criticality": "🟠 HIGH",
                "purpose": "Real-time communication",
                "reason": "WebSocket/Socket.IO features",
                "category": "real_time"
            }
        
        # Test files
        if any(pattern in file_name for pattern in ['test', 'spec', '.test.', '.spec.']):
            return {
                "criticality": "🟢 LOW",
                "purpose": "Test file",
                "reason": "Testing & quality assurance",
                "category": "testing"
            }
        
        # Temporary/unclear files
        if any(pattern in file_name for pattern in ['temp', 'tmp', 'backup', 'old', 'copy']):
            return {
                "criticality": "❓ UNCLEAR",
                "purpose": "Temporary/backup file",
                "reason": "May be safe to remove",
                "category": "temporary"
            }
        
        # Documentation
        if file_ext in ['.md', '.txt', '.doc'] or 'readme' in file_name:
            return {
                "criticality": "🟢 LOW",
                "purpose": "Documentation",
                "reason": "Project documentation",
                "category": "documentation"
            }
        
        # Script files
        if file_ext in ['.sh', '.bat', '.ps1'] or 'script' in file_name:
            return {
                "criticality": "🟡 MEDIUM",
                "purpose": "Automation script",
                "reason": "Build/deployment automation",
                "category": "automation"
            }
        
        # Unknown files - need investigation
        return {
            "criticality": "❓ UNCLEAR",
            "purpose": "Unknown purpose - needs analysis",
            "reason": f"File pattern not recognized: {file_name}",
            "category": "unknown"
        }
    
    def format_size(self, size: int) -> str:
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} TB"
    
    def should_exclude(self, path: Path) -> bool:
        """Check if path should be excluded"""
        if path.is_dir():
            return path.name in self.exclude_dirs
        return path.name in self.exclude_files
    
    def generate_smart_structure(self, path: Path = None, depth: int = 0, max_depth: int = 5, indent: str = "") -> List[str]:
        """Generate smart project structure with criticality analysis"""
        if path is None:
            path = self.root_path
            
        if depth >= max_depth:
            return []
        
        lines = []
        try:
            items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
            
            for item in items:
                if self.should_exclude(item):
                    continue
                    
                if item.is_dir():
                    # Analyze directory
                    dir_info = self.directory_purposes.get(item.name.lower(), {
                        "purpose": "❓ Directory purpose unclear",
                        "criticality": "❓ UNCLEAR",
                        "category": "unknown"
                    })
                    
                    # Structured directory output
                    name_part = f"{indent}📁 {item.name}/"
                    lines.append(f"{name_part:<50} │ {dir_info['criticality']:<15} │ {dir_info['purpose']}")
                    
                    lines.extend(self.generate_smart_structure(
                        item, depth + 1, max_depth, indent + "  "
                    ))
                else:
                    # Analyze file
                    try:
                        size = item.stat().st_size
                        size_str = self.format_size(size)
                        analysis = self.analyze_file(item)
                        
                        # Structured file output
                        name_size_part = f"{indent}📄 {item.name} ({size_str})"
                        lines.append(f"{name_size_part:<50} │ {analysis['criticality']:<15} │ {analysis['purpose']}")
                        
                        # Add detailed reason for unclear files
                        if analysis['criticality'] == "❓ UNCLEAR":
                            reason_part = f"{indent}   💡 {analysis['reason']}"
                            lines.append(f"{reason_part:<50} │ {'':15} │ Investigation needed")
                            
                    except:
                        name_part = f"{indent}📄 {item.name}"
                        lines.append(f"{name_part:<50} │ {'❓ UNCLEAR':<15} │ Cannot analyze file")
                        
        except PermissionError:
            error_part = f"{indent}❌ [Permission Denied]"
            lines.append(f"{error_part:<50} │ {'':15} │ Access restricted")
            
        return lines

    def display_console_summary(self, summary: Dict[str, List]):
        """Display structured summary in console with table format"""
        print("\n" + "═" * 100)
        print("🧠 SMART ANALYSIS SUMMARY - STRUCTURED VIEW")
        print("═" * 100)
        
        # Quick stats table
        print(f"┌{'─' * 20}┬{'─' * 15}┬{'─' * 60}┐")
        print(f"│ {'CRITICALITY LEVEL':<20} │ {'COUNT':<15} │ {'DESCRIPTION':<60} │")
        print(f"├{'─' * 20}┼{'─' * 15}┼{'─' * 60}┤")
        
        descriptions = {
            "🔴 CRITICAL": "Essential files - never delete",
            "🟠 HIGH": "Important functionality - review before changes", 
            "🟡 MEDIUM": "Supporting files - safe to modify with care",
            "🟢 LOW": "Optional files - documentation, generated, etc",
            "❓ UNCLEAR": "Need investigation - unknown purpose"
        }
        
        for criticality, items in summary.items():
            count = len(items)
            desc = descriptions.get(criticality, "Unknown category")
            print(f"│ {criticality:<20} │ {count:<15} │ {desc:<60} │")
        
        print(f"└{'─' * 20}┴{'─' * 15}┴{'─' * 60}┘")
        
        # Highlight critical findings
        unclear_count = len(summary.get("❓ UNCLEAR", []))
        critical_count = len(summary.get("🔴 CRITICAL", []))
        
        if unclear_count > 0:
            print(f"\n⚠️  WARNING: {unclear_count} files need investigation!")
            print("📋 Unclear files found:")
            for i, item in enumerate(summary.get("❓ UNCLEAR", [])[:5]):
                print(f"   {i+1}. {item['path']} - {item['reason']}")
            if unclear_count > 5:
                print(f"   ... and {unclear_count - 5} more")
        
        print(f"\n✅ Protected: {critical_count} critical files identified")
        print("📊 See detailed report for complete structured analysis")
        
        # Action items table
        print(f"\n┌{'─' * 25}┬{'─' * 70}┐")
        print(f"│ {'RECOMMENDED ACTIONS':<25} │ {'DETAILS':<70} │")
        print(f"├{'─' * 25}┼{'─' * 70}┤")
        print(f"│ {'🔍 Investigation':<25} │ {'Review unclear files before making changes':<70} │")
        print(f"│ {'🛡️  Protection':<25} │ {'Backup critical files before any major changes':<70} │")
        print(f"│ {'🧹 Cleanup':<25} │ {'Consider archiving temporary and backup files':<70} │")
        print(f"│ {'📋 Documentation':<25} │ {'Update README with current structure':<70} │")
        print(f"└{'─' * 25}┴{'─' * 70}┘")
    
    def get_criticality_summary(self) -> Dict[str, List[str]]:
        """Generate summary by criticality levels"""
        summary = {
            "🔴 CRITICAL": [],
            "🟠 HIGH": [],
            "🟡 MEDIUM": [], 
            "🟢 LOW": [],
            "❓ UNCLEAR": []
        }
        
        for root, dirs, files in os.walk(self.root_path):
            # Exclude certain directories
            dirs[:] = [d for d in dirs if d not in self.exclude_dirs]
            
            for file in files:
                if file in self.exclude_files:
                    continue
                
                file_path = Path(root) / file
                relative_path = file_path.relative_to(self.root_path)
                analysis = self.analyze_file(file_path)
                
                criticality = analysis['criticality']
                summary[criticality].append({
                    'path': str(relative_path),
                    'purpose': analysis['purpose'],
                    'reason': analysis['reason']
                })
        
        return summary
    
    def generate_smart_report(self, max_depth: int = 5):
        """Generate comprehensive smart analysis report"""
        # Ensure output directory exists
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.output_path, 'w', encoding='utf-8') as f:
            # Header
            f.write("=" * 100 + "\n")
            f.write("RETRO GAMING SERVICE - SMART PROJECT STRUCTURE ANALYSIS\n")
            f.write(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Root Path: {self.root_path}\n")
            f.write("🧠 Smart Analysis: File Criticality & Purpose Identification\n")
            f.write("=" * 100 + "\n\n")
            
            # Legend
            f.write("CRITICALITY LEGEND:\n")
            f.write("-" * 50 + "\n")
            f.write("🔴 CRITICAL  - Essential for application functionality\n")
            f.write("🟠 HIGH      - Important features & core logic\n") 
            f.write("🟡 MEDIUM    - Supporting functionality\n")
            f.write("🟢 LOW       - Optional, documentation, generated files\n")
            f.write("❓ UNCLEAR   - Purpose unclear, needs investigation\n\n")
            
            # Smart Project Structure with Table Format
            f.write("SMART PROJECT STRUCTURE (TABLE FORMAT):\n")
            f.write("-" * 130 + "\n")
            f.write(f"{'FILE/DIRECTORY':<50} │ {'CRITICALITY':<15} │ {'PURPOSE':<60}\n")
            f.write("─" * 50 + "┼" + "─" * 15 + "┼" + "─" * 60 + "\n")
            
            structure = self.generate_smart_structure(max_depth=max_depth)
            for line in structure:
                f.write(line + "\n")
            
            # Alternative: Tree-style structure  
            f.write("\n" + "=" * 100 + "\n")
            f.write("TREE-STYLE STRUCTURE (Alternative View):\n")
            f.write("=" * 100 + "\n")
            tree_structure = self.generate_tree_structure(max_depth=max_depth)
            for line in tree_structure:
                f.write(line + "\n")
            
            # Structured Criticality Summary Table
            f.write("\n" + "=" * 130 + "\n")
            f.write("CRITICALITY SUMMARY - STRUCTURED TABLE\n")
            f.write("=" * 130 + "\n\n")
            
            summary = self.get_criticality_summary()
            
            # Generate structured table
            table_lines = self.generate_structured_summary_table(summary)
            for line in table_lines:
                f.write(line + "\n")
            
            # Cleanup Recommendations
            f.write("🧹 CLEANUP RECOMMENDATIONS:\n")
            f.write("-" * 60 + "\n")
            
            unclear_files = summary.get("❓ UNCLEAR", [])
            if unclear_files:
                f.write(f"1. INVESTIGATE {len(unclear_files)} unclear files:\n")
                for item in unclear_files[:10]:
                    f.write(f"   - {item['path']}: {item['reason']}\n")
                f.write("\n")
            
            f.write("2. SAFE TO ARCHIVE (after backup):\n")
            f.write("   - Files marked as 'temporary' or 'backup'\n")
            f.write("   - Old documentation files\n")
            f.write("   - Unused test files\n\n")
            
            f.write("3. CRITICAL FILES TO BACKUP:\n") 
            critical_files = summary.get("🔴 CRITICAL", [])
            for item in critical_files[:10]:
                f.write(f"   - {item['path']}\n")
            f.write("\n")
            
        current_date = datetime.datetime.now()
        date_suffix = current_date.strftime("%d%m%y")
        filename = f"retroretro_structure_{date_suffix}.txt"
        print(f"✅ Smart Analysis saved to: {filename}")
        print(f"📊 File size: {self.format_size(self.output_path.stat().st_size)}")
        
        # Console summary
        self.display_console_summary(summary)
    
    def generate_structured_summary_table(self, summary: Dict[str, List]) -> List[str]:
        """Generate structured table for criticality summary"""
        table_lines = []
        
        # Table header
        table_lines.append("┌" + "─" * 60 + "┬" + "─" * 15 + "┬" + "─" * 50 + "┐")
        table_lines.append(f"│ {'FILE/DIRECTORY':<60} │ {'CRITICALITY':<15} │ {'PURPOSE':<50} │")
        table_lines.append("├" + "─" * 60 + "┼" + "─" * 15 + "┼" + "─" * 50 + "┤")
        
        for criticality, items in summary.items():
            if not items:
                continue
                
            # Add criticality header
            header = f"= {criticality} LEVEL ="
            table_lines.append(f"│ {header:<60} │ {'':15} │ {'':50} │")
            table_lines.append("├" + "─" * 60 + "┼" + "─" * 15 + "┼" + "─" * 50 + "┤")
            
            # Add items (limit for readability)
            for item in items[:15]:  # Show first 15 items per category
                path_truncated = item['path'][:58] + ".." if len(item['path']) > 60 else item['path']
                purpose_truncated = item['purpose'][:48] + ".." if len(item['purpose']) > 50 else item['purpose']
                
                table_lines.append(f"│ {path_truncated:<60} │ {criticality:<15} │ {purpose_truncated:<50} │")
            
            if len(items) > 15:
                more_info = f"... and {len(items) - 15} more files"
                table_lines.append(f"│ {more_info:<60} │ {'':15} │ {'':50} │")
            
            table_lines.append("├" + "─" * 60 + "┼" + "─" * 15 + "┼" + "─" * 50 + "┤")
        
        # Table footer
        table_lines[-1] = "└" + "─" * 60 + "┴" + "─" * 15 + "┴" + "─" * 50 + "┘"
        
        return table_lines

    def generate_tree_structure(self, path: Path = None, depth: int = 0, max_depth: int = 5, indent: str = "") -> List[str]:
        """Generate traditional tree-style structure as alternative"""
        if path is None:
            path = self.root_path
            
        if depth >= max_depth:
            return []
        
        lines = []
        try:
            items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
            
            for item in items:
                if self.should_exclude(item):
                    continue
                    
                if item.is_dir():
                    dir_info = self.directory_purposes.get(item.name.lower(), {
                        "criticality": "❓ UNCLEAR"
                    })
                    lines.append(f"{indent}├── {item.name}/ [{dir_info['criticality']}]")
                    lines.extend(self.generate_tree_structure(
                        item, depth + 1, max_depth, indent + "│   "
                    ))
                else:
                    try:
                        size = item.stat().st_size
                        size_str = self.format_size(size)
                        analysis = self.analyze_file(item)
                        lines.append(f"{indent}├── {item.name} ({size_str}) [{analysis['criticality']}]")
                    except:
                        lines.append(f"{indent}├── {item.name} [❓ UNCLEAR]")
                        
        except PermissionError:
            lines.append(f"{indent}├── [Permission Denied]")
            
        return lines
        """Display quick summary in console"""
        print("\n" + "=" * 80)
        print("🧠 SMART ANALYSIS SUMMARY")
        print("=" * 80)
        
        for criticality, items in summary.items():
            if items:
                print(f"{criticality}: {len(items)} files")
        
        unclear_count = len(summary.get("❓ UNCLEAR", []))
        critical_count = len(summary.get("🔴 CRITICAL", []))
        
        if unclear_count > 0:
            print(f"\n⚠️  WARNING: {unclear_count} files need investigation!")
            print("📋 Review the detailed report for cleanup recommendations")
        
        print(f"\n✅ {critical_count} critical files identified and protected")
        print("💡 See full report for detailed analysis and recommendations")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Smart Project Structure Analysis for RetroRetro Gaming Service')
    parser.add_argument('--path', default="D:\\Claude_Scripte\\RetroRetro\\legal-retro-gaming-service",
                       help='Root path of the project')
    parser.add_argument('--depth', type=int, default=4,
                       help='Maximum depth for structure generation')
    parser.add_argument('--quick', action='store_true',
                       help='Quick analysis without full report')
    
    args = parser.parse_args()
    
    # Change to scripts directory if it exists
    scripts_dir = Path(args.path) / "scripts"
    if scripts_dir.exists():
        os.chdir(scripts_dir)
    else:
        os.chdir(args.path)
    
    analyzer = SmartStructureAnalyzer(args.path)
    
    print("🧠 Starting Smart Project Structure Analysis...")
    
    if args.quick:
        # Quick console summary
        summary = analyzer.get_criticality_summary()
        analyzer.display_console_summary(summary)
    else:
        # Full detailed report
        analyzer.generate_smart_report(max_depth=args.depth)
    
    print("\n🎯 Analysis complete!")

if __name__ == "__main__":
    main()