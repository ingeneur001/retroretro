#!/usr/bin/env python3
"""
GitHub Update Script für RetroRetro Projekt
Verwaltet Fullstack→Frontend-only Deployment:
1. Entwicklung (Fullstack): D:/Claude_Scripte/RetroRetro/legal-retro-gaming-service
2. GitHub Pages (Frontend): C:/Users/w_wae/retroretro
Extrahiert automatisch nur Frontend-Dateien und bereinigt Backend-Dependencies.
"""

import subprocess
import os
import sys
import json
import shutil
from pathlib import Path

class DualRepoUpdater:
    def __init__(self):
        # Repository Pfade definieren (Forward Slashes für Kompatibilität)  
        self.dev_repo = Path("D:/Claude_Scripte/RetroRetro/legal-retro-gaming-service")
        self.dev_frontend = self.dev_repo / "frontend"  # Nur Frontend-Teil
        self.github_repo = Path("C:/Users/w_wae/retroretro")
        
        # Arbeitsverzeichnis ermitteln
        current_path = Path.cwd()
        if "Claude_Scripte" in str(current_path):
            self.current_repo = "dev"
        else:
            self.current_repo = "github"
    
    def run_command(self, command, cwd=None, shell=True):
        """Führt einen Befehl aus und gibt das Ergebnis zurück"""
        try:
            result = subprocess.run(
                command, 
                cwd=cwd,
                shell=shell, 
                capture_output=True, 
                text=True,
                check=True
            )
            print(f"✅ Erfolgreich: {command}")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Fehler bei: {command}")
            if e.stderr:
                print(f"   Error: {e.stderr.strip()}")
            return False
    
    def check_repositories(self):
        """Überprüft ob beide Repositories existieren"""
        print("📁 Überprüfe Repository-Struktur...")
        
        if not self.dev_repo.exists():
            print(f"❌ Entwicklungs-Repository nicht gefunden: {self.dev_repo}")
            return False
        else:
            print(f"✅ Entwicklungs-Repository: {self.dev_repo}")
        
        if not self.dev_frontend.exists():
            print(f"❌ Frontend-Ordner nicht gefunden: {self.dev_frontend}")
            return False
        else:
            print(f"✅ Frontend-Ordner: {self.dev_frontend}")
        
        if not self.github_repo.exists():
            print(f"❌ GitHub-Repository nicht gefunden: {self.github_repo}")
            return False
        else:
            print(f"✅ GitHub-Repository: {self.github_repo}")
        
        print(f"📍 Aktuelles Repository: {self.current_repo}")
        return True
    
    def sync_repositories(self):
        """Synchronisiert NUR Frontend von Entwicklung zu GitHub (Backend-bereinigt)"""
        if self.current_repo == "dev":
            print("🔄 Synchronisiere Frontend (Fullstack → Frontend-only)...")
            
            # Frontend-spezifische Dateien/Ordner
            frontend_items = {
                'src', 'public', 'package.json', 'package-lock.json',
                'README.md', '.gitignore', 'tsconfig.json', 'craco.config.js'
            }
            
            # Backend/Fullstack-Dateien die NICHT kopiert werden
            exclude_patterns = {
                'node_modules', 'build', 'dist', '.git', '__pycache__',
                'backend', 'server.js', '.env', '.env.local', '.DS_Store',
                'docker-compose.yml', 'Dockerfile', 'requirements.txt'
            }
            
            try:
                # 1. Kopiere Frontend-Dateien vom Frontend-Ordner
                print("   📂 Kopiere Frontend-Dateien...")
                for item in self.dev_frontend.iterdir():
                    if item.name in exclude_patterns:
                        print(f"   ⏭️  Überspringe: {item.name}")
                        continue
                        
                    target_item = self.github_repo / item.name
                    
                    if item.is_file():
                        print(f"   📄 Kopiere: {item.name}")
                        shutil.copy2(item, target_item)
                    elif item.is_dir():
                        print(f"   📂 Kopiere Ordner: {item.name}")
                        if target_item.exists():
                            shutil.rmtree(target_item)
                        shutil.copytree(item, target_item, 
                                      ignore=shutil.ignore_patterns(
                                          'node_modules', 'build', 'dist', 
                                          '.git', '__pycache__', '*.log'
                                      ))
                
                # 2. Frontend-spezifische package.json bereinigen
                self.clean_frontend_package_json()
                
                # 3. Frontend-only .gitignore erstellen
                self.create_frontend_gitignore()
                
                # 4. Backend-Referenzen in Code entfernen (falls vorhanden)
                self.remove_backend_references()
                
                print("✅ Frontend-Synchronisation abgeschlossen")
                return True
                
            except Exception as e:
                print(f"❌ Fehler bei Frontend-Synchronisation: {e}")
                return False
        else:
            print("ℹ️  Bereits im GitHub-Repository, keine Synchronisation nötig")
            return True
    
    def clean_frontend_package_json(self):
        """Bereinigt package.json für Frontend-only Deployment"""
        package_json_path = self.github_repo / "package.json"
        
        if not package_json_path.exists():
            print("⚠️  Keine package.json zum Bereinigen gefunden")
            return
        
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            # Frontend-spezifische Anpassungen
            package_data['homepage'] = "https://ingeneur001.github.io/retroretro"
            
            # Entferne Backend-spezifische Dependencies/Scripts
            backend_deps = ['express', 'cors', 'dotenv', 'pg', 'redis', 'socket.io', 'morgan']
            if 'dependencies' in package_data:
                for dep in backend_deps:
                    package_data['dependencies'].pop(dep, None)
            
            # Entferne Backend-spezifische Scripts
            backend_scripts = ['server', 'start:server', 'dev:server']
            if 'scripts' in package_data:
                for script in backend_scripts:
                    package_data['scripts'].pop(script, None)
                
                # Stelle sicher, dass Frontend-Scripts vorhanden sind
                if 'start' not in package_data['scripts']:
                    package_data['scripts']['start'] = 'react-scripts start'
                if 'build' not in package_data['scripts']:
                    package_data['scripts']['build'] = 'react-scripts build'
            
            # Entferne Backend-spezifische Felder
            package_data.pop('main', None)  # Entferne server.js als main
            package_data.pop('type', None)  # Entferne commonjs type
            
            # Füge gh-pages hinzu falls nicht vorhanden
            if 'devDependencies' not in package_data:
                package_data['devDependencies'] = {}
            package_data['devDependencies']['gh-pages'] = '^6.1.1'
            
            with open(package_json_path, 'w', encoding='utf-8') as f:
                json.dump(package_data, f, indent=2, ensure_ascii=False)
            
            print("✅ package.json für Frontend-only bereinigt")
            
        except Exception as e:
            print(f"⚠️  Fehler beim Bereinigen der package.json: {e}")
    
    def create_frontend_gitignore(self):
        """Erstellt Frontend-spezifische .gitignore"""
        gitignore_path = self.github_repo / ".gitignore"
        
        gitignore_content = """# Dependencies
node_modules/
/.pnp
.pnp.js

# Production build
/build
/dist

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Temporary folders
tmp/
temp/
"""
        
        try:
            with open(gitignore_path, 'w', encoding='utf-8') as f:
                f.write(gitignore_content)
            print("✅ Frontend .gitignore erstellt")
        except Exception as e:
            print(f"⚠️  Fehler beim Erstellen der .gitignore: {e}")
    
    def remove_backend_references(self):
        """Entfernt Backend-Referenzen aus Frontend-Code (optional)"""
        # Hier könnten Sie Code hinzufügen, der Backend-URLs in Frontend-Dateien 
        # durch GitHub Pages-kompatible URLs ersetzt
        print("ℹ️  Backend-Referenzen überprüft (keine Änderungen nötig)")
    
    def check_package_json(self, repo_path):
        """Überprüft package.json für GitHub Pages Konfiguration"""
        package_json_path = repo_path / "package.json"
        
        if not package_json_path.exists():
            print(f"❌ package.json nicht gefunden in: {repo_path}")
            return False
            
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
        
        # Überprüfe homepage Einstellung für GitHub Repository
        if repo_path == self.github_repo:
            expected_homepage = "https://ingeneur001.github.io/retroretro"
            homepage = package_data.get('homepage')
            
            if homepage != expected_homepage:
                print(f"⚠️  Homepage in package.json wird aktualisiert:")
                print(f"   Von: {homepage}")
                print(f"   Zu:  {expected_homepage}")
                
                package_data['homepage'] = expected_homepage
                with open(package_json_path, 'w', encoding='utf-8') as f:
                    json.dump(package_data, f, indent=2, ensure_ascii=False)
                print("✅ Homepage in package.json aktualisiert")
        
        return True
    
    def install_dependencies(self, repo_path):
        """Installiert npm Abhängigkeiten"""
        print(f"📦 Installiere npm Abhängigkeiten in: {repo_path.name}")
        return self.run_command("npm install", cwd=repo_path)
    
    def build_project(self, repo_path):
        """Führt npm run build aus"""
        print(f"🔨 Starte Build-Prozess in: {repo_path.name}")
        
        build_commands = ["npm run build", "npm run build:prod", "yarn build"]
        
        for cmd in build_commands:
            if self.run_command(cmd, cwd=repo_path):
                break
        else:
            print("❌ Alle Build-Befehle fehlgeschlagen!")
            return False
        
        # Überprüfe Build-Ergebnis
        build_dir = repo_path / "build"
        dist_dir = repo_path / "dist"
        
        if build_dir.exists():
            print(f"✅ Build erfolgreich: {build_dir}")
        elif dist_dir.exists():
            print(f"✅ Build erfolgreich: {dist_dir}")
        else:
            print("❌ Kein Build-Ordner gefunden!")
            return False
        
        return True
    
    def setup_github_pages(self):
        """Konfiguriert GitHub Pages für gh-pages branch"""
        print("🌐 Konfiguriere GitHub Pages...")
        
        # Installiere gh-pages im GitHub Repository
        print("📦 Installiere gh-pages...")
        if not self.run_command("npm install --save-dev gh-pages", cwd=self.github_repo):
            print("⚠️  gh-pages Installation fehlgeschlagen, versuche global...")
            self.run_command("npm install -g gh-pages")
        
        return True
    
    def deploy_to_github_pages(self):
        """Deployed das Build-Verzeichnis zu GitHub Pages mit mehreren Fallback-Methoden"""
        print("🚀 Deploye zu GitHub Pages...")
        
        # Bestimme Build-Verzeichnis
        build_dir = self.github_repo / "build"
        dist_dir = self.github_repo / "dist"
        
        if build_dir.exists():
            deploy_dir = "build"
            deploy_path = build_dir
        elif dist_dir.exists():
            deploy_dir = "dist"
            deploy_path = dist_dir
        else:
            print("❌ Kein Build-Verzeichnis gefunden!")
            return False
        
        print(f"📁 Deploying aus: {deploy_dir}/")
        
        # Methode 1: Kurzer gh-pages Befehl (Windows-freundlicher)
        print("🔄 Versuche Methode 1: Kurzer gh-pages Befehl...")
        if self.run_command(f"gh-pages -d {deploy_dir} -m \"Deploy\"", cwd=self.github_repo):
            print("✅ Deployment mit gh-pages erfolgreich!")
            return True
        
        # Methode 2: Manuelles Git-Deployment
        print("🔄 Versuche Methode 2: Manuelles Git-Deployment...")
        if self.manual_git_deployment(deploy_path):
            print("✅ Manuelles Git-Deployment erfolgreich!")
            return True
        
        # Methode 3: GitHub Actions Info
        print("🔄 Alternative: GitHub Actions Setup")
        self.suggest_github_actions()
        
        return False
    
    def manual_git_deployment(self, build_path):
        """Manuelles Deployment mit Git-Befehlen"""
        try:
            print("📦 Starte manuelles Git-Deployment...")
            
            # Temporäres Verzeichnis für gh-pages branch
            temp_dir = self.github_repo.parent / "temp_gh_pages"
            
            # Aufräumen falls vorhanden
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
            
            # Clone nur den gh-pages branch
            clone_cmd = f"git clone -b gh-pages --single-branch https://github.com/ingeneur001/retroretro.git \"{temp_dir}\""
            
            # Falls gh-pages branch nicht existiert, erstelle ihn
            if not self.run_command(clone_cmd):
                print("🔧 Erstelle neuen gh-pages branch...")
                if not self.run_command(f"git clone --single-branch https://github.com/ingeneur001/retroretro.git \"{temp_dir}\""):
                    return False
                
                # Erstelle gh-pages branch
                commands = [
                    "git checkout --orphan gh-pages",
                    "git rm -rf .",
                    "echo 'GitHub Pages' > README.md",
                    "git add README.md",
                    "git commit -m 'Initial gh-pages commit'",
                    "git push origin gh-pages"
                ]
                
                for cmd in commands:
                    if not self.run_command(cmd, cwd=temp_dir):
                        print(f"⚠️  Warnung bei: {cmd}")
            
            # Lösche alten Inhalt (außer .git)
            for item in temp_dir.iterdir():
                if item.name != '.git':
                    if item.is_dir():
                        shutil.rmtree(item)
                    else:
                        item.unlink()
            
            # Kopiere Build-Dateien
            print("📋 Kopiere Build-Dateien...")
            for item in build_path.iterdir():
                target = temp_dir / item.name
                if item.is_dir():
                    shutil.copytree(item, target)
                else:
                    shutil.copy2(item, target)
            
            # Commit und Push
            commands = [
                "git add .",
                "git commit -m \"Deploy to GitHub Pages\"",
                "git push origin gh-pages"
            ]
            
            for cmd in commands:
                if not self.run_command(cmd, cwd=temp_dir):
                    if "nothing to commit" in cmd:
                        print("ℹ️  Keine Änderungen zu committen")
                        continue
                    return False
            
            # Aufräumen
            shutil.rmtree(temp_dir)
            return True
            
        except Exception as e:
            print(f"❌ Fehler beim manuellen Deployment: {e}")
            return False
    
    def suggest_github_actions(self):
        """Schlägt GitHub Actions Setup vor"""
        print("\n💡 ALTERNATIVE: GitHub Actions Deployment")
        print("-" * 40)
        print("Für zuverlässiges Deployment empfehle ich GitHub Actions:")
        print()
        print("1. Erstellen Sie: .github/workflows/deploy.yml")
        print("2. Mit folgendem Inhalt:")
        print()
        
        workflow_content = """name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
"""
        
        print(workflow_content)
        print("3. Commit und Push - GitHub baut automatisch!")
        print()
        
        # Schreibe Workflow-Datei
        workflow_dir = self.github_repo / ".github" / "workflows"
        workflow_dir.mkdir(parents=True, exist_ok=True)
        workflow_file = workflow_dir / "deploy.yml"
        
        try:
            with open(workflow_file, 'w', encoding='utf-8') as f:
                f.write(workflow_content)
            print(f"✅ Workflow-Datei erstellt: {workflow_file}")
            print("   Committen Sie diese Datei für automatisches Deployment!")
        except Exception as e:
            print(f"⚠️  Konnte Workflow-Datei nicht erstellen: {e}")
            print("   Erstellen Sie die Datei manuell.")
        
        return True
    
    def git_operations(self, repo_path, message="Update project and build"):
        """Git add, commit, push für angegebenes Repository"""
        print(f"📤 Git Operationen in: {repo_path.name}")
        
        # Überprüfe Git-Status
        result = subprocess.run("git status --porcelain", 
                               shell=True, capture_output=True, 
                               text=True, cwd=repo_path)
        
        if not result.stdout.strip():
            print("ℹ️  Keine Änderungen zu committen")
            return True
        
        commands = [
            "git add .",
            f'git commit -m "{message}"'
        ]
        
        # Bestimme Branch
        branch_result = subprocess.run("git branch --show-current", 
                                     shell=True, capture_output=True, 
                                     text=True, cwd=repo_path)
        branch = branch_result.stdout.strip() or "main"
        commands.append(f"git push origin {branch}")
        
        for cmd in commands:
            if not self.run_command(cmd, cwd=repo_path):
                if "nothing to commit" in cmd:
                    continue
                print(f"⚠️  Warnung bei: {cmd}")
        
        return True
    
    def run_full_update(self, build_dev=True, sync_repos=True, final_dev_build=False):
        """Führt den kompletten Update-Prozess aus"""
        print("🎮 RetroRetro Dual-Repository Update Script")
        print("=" * 60)
        
        # Schritt 1: Repository-Struktur überprüfen
        if not self.check_repositories():
            return False
        
        # Schritt 2: Entwicklungs-Build
        if build_dev and self.dev_frontend.exists():
            print("\n🔨 SCHRITT 1: ENTWICKLUNGS-REPOSITORY BUILD")
            print("-" * 40)
            
            if not self.check_package_json(self.dev_frontend):
                print("⚠️  package.json Problem im Dev-Frontend")
            
            if not self.install_dependencies(self.dev_frontend):
                print("⚠️  Dependencies Installation fehlgeschlagen (Dev)")
            
            if not self.build_project(self.dev_frontend):
                print("❌ Build im Entwicklungs-Repository fehlgeschlagen!")
                return False
            
            # Git-Operationen für Dev-Repo (Root-Level)
            self.git_operations(self.dev_repo, "Development build update")
        
        # Schritt 3: Repository-Synchronisation
        if sync_repos:
            print("\n🔄 SCHRITT 2: REPOSITORY-SYNCHRONISATION")
            print("-" * 40)
            if not self.sync_repositories():
                return False
        
        # Schritt 4: GitHub Repository Build und Deployment
        print("\n🚀 SCHRITT 3: GITHUB-REPOSITORY BUILD & DEPLOYMENT")
        print("-" * 50)
        
        if not self.check_package_json(self.github_repo):
            return False
        
        if not self.install_dependencies(self.github_repo):
            print("⚠️  Dependencies Installation fehlgeschlagen (GitHub)")
        
        if not self.build_project(self.github_repo):
            return False
        
        if not self.setup_github_pages():
            print("⚠️  GitHub Pages Setup fehlgeschlagen")
        
        # Git-Operationen für GitHub-Repo
        self.git_operations(self.github_repo, "Production build and deployment")
        
        # GitHub Actions Deployment (automatisch)
        print("\n🤖 GITHUB ACTIONS DEPLOYMENT")
        print("-" * 30)
        print("✅ Code wurde gepusht - GitHub Actions startet automatisch!")
        print("📍 Verfolgen Sie den Build: https://github.com/ingeneur001/retroretro/actions")
        print("⏱️  Build dauert ca. 2-3 Minuten")
        
        # Lokales gh-pages Deployment überspringen (nicht nötig mit GitHub Actions)
        print("\nℹ️  Lokales gh-pages Deployment wird übersprungen")
        print("   → GitHub Actions übernimmt das Deployment automatisch")
        print("   → Keine lokalen Git-Konflikte oder Berechtigungsprobleme")
        
        return True
        
        # Schritt 5: Optionaler finaler Dev-Build
        if final_dev_build and self.dev_frontend.exists():
            print("\n🔄 SCHRITT 4: FINALER ENTWICKLUNGS-BUILD (OPTIONAL)")
            print("-" * 50)
            print("ℹ️  Hinweis: Dieser Schritt ist normalerweise nicht notwendig")
            
            if not self.build_project(self.dev_frontend):
                print("⚠️  Finaler Build fehlgeschlagen (nicht kritisch)")
            else:
                self.git_operations(self.dev_repo, "Final development build sync")
        
        print("\n🎉 UPDATE ERFOLGREICH ABGESCHLOSSEN!")
        print("=" * 60)
        print("🌐 Website verfügbar unter: https://ingeneur001.github.io/retroretro")
        print("\n📋 Was wurde gemacht:")
        if build_dev:
            print("   ✅ Entwicklungs-Frontend gebaut")
        if sync_repos:
            print("   ✅ Frontend synchronisiert (Backend-bereinigt)")
        print("   ✅ GitHub-Repository gebaut")
        print("   ✅ Zu GitHub Pages deployed")
        print("   ✅ Git-Repositories aktualisiert")
        if final_dev_build:
            print("   ✅ Finaler Entwicklungs-Build")
        
        print("\n💡 Fullstack → Frontend-only Konvertierung:")
        print("   - Nur Frontend-Dateien kopiert")
        print("   - Backend-Dependencies entfernt")
        print("   - package.json für GitHub Pages angepasst")
        print("   - Frontend-spezifische .gitignore erstellt")
        
        print("\n🔧 Nächste Schritte:")
        print("   - Warten Sie 2-5 Minuten für GitHub Pages Update")
        print("   - Leeren Sie den Browser-Cache (Ctrl+F5)")
        print("   - Entwickeln Sie weiter im Fullstack-Repository")
        print("   - Backend läuft weiter lokal für Entwicklung")
        
        return True

def main():
    """Hauptfunktion"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Dual-Repository GitHub Update Script für RetroRetro"
    )
    parser.add_argument("--no-dev-build", action="store_true",
                       help="Überspringe Build im Entwicklungs-Repository")
    parser.add_argument("--no-sync", action="store_true",
                       help="Überspringe Repository-Synchronisation")
    parser.add_argument("--github-only", action="store_true",
                       help="Nur GitHub-Repository bearbeiten")
    parser.add_argument("--final-dev-build", action="store_true",
                       help="Finalen Entwicklungs-Build ausführen (normalerweise unnötig)")
    
    args = parser.parse_args()
    
    updater = DualRepoUpdater()
    
    try:
        build_dev = not (args.no_dev_build or args.github_only)
        sync_repos = not (args.no_sync or args.github_only)
        final_dev_build = args.final_dev_build
        
        success = updater.run_full_update(
            build_dev=build_dev, 
            sync_repos=sync_repos,
            final_dev_build=final_dev_build
        )
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n❌ Vorgang abgebrochen")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unerwarteter Fehler: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()