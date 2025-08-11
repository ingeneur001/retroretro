#!/usr/bin/env python3
"""
Gaming Platform Live Monitor
============================
Separates Python-basiertes Monitoring-Tool für die Retro Gaming Platform.
Läuft unabhängig von der Hauptanwendung und bietet Real-time Überwachung.

Features:
- Real-time Socket.IO Monitoring
- Server Health Tracking
- Database Status Überwachung  
- Performance Metrics
- Live Activity Log
- Stress Testing
- Web Dashboard (optional)

Usage:
    python monitor.py [--mode=terminal|web] [--interval=5]
"""

import asyncio
import aiohttp
import socketio
import time
import json
import threading
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from collections import deque
import argparse
import sys
import os

# Rich für schöne Terminal-Ausgabe
try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.live import Live
    from rich.text import Text
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich import box
    RICH_AVAILABLE = True
except ImportError:
    print("⚠️  Rich nicht installiert. Installiere mit: pip install rich")
    RICH_AVAILABLE = False

# Flask für Web-Dashboard (optional)
try:
    from flask import Flask, render_template_string, jsonify
    from flask_socketio import SocketIO as FlaskSocketIO
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False

# Datenklassen für Struktur
@dataclass
class ServerHealth:
    status: str
    uptime: int
    version: str
    connected_users: int
    timestamp: str
    response_time: float = 0.0

@dataclass
class DatabaseStatus:
    postgresql: str
    redis: str
    user_management: bool
    session_management: bool
    score_tracking: bool
    timestamp: str

@dataclass
class PerformanceMetrics:
    latency: float
    player_count: int
    socket_connections: int
    timestamp: str
    memory_usage: float = 0.0
    cpu_usage: float = 0.0

@dataclass
class GameSession:
    game_id: str
    name: str
    player_count: int
    active: bool
    timestamp: str

@dataclass
class LogEntry:
    timestamp: str
    level: str
    message: str
    source: str = "monitor"

class GamingPlatformMonitor:
    """Haupt-Monitor-Klasse für die Gaming Platform"""
    
    def __init__(self, backend_url: str = "http://localhost:3001", 
                 update_interval: int = 5):
        self.backend_url = backend_url
        self.frontend_url = "http://localhost:3000"
        self.update_interval = update_interval
        
        # Data Storage
        self.server_health: Optional[ServerHealth] = None
        self.database_status: Optional[DatabaseStatus] = None
        self.performance_metrics: deque = deque(maxlen=100)
        self.game_sessions: Dict[str, GameSession] = {}
        self.activity_log: deque = deque(maxlen=500)
        self.connected_users: List[str] = []
        
        # Socket.IO Client
        self.sio = socketio.AsyncClient()
        self.is_connected = False
        self.connection_attempts = 0
        
        # Monitoring State
        self.running = False
        self.web_server = None
        
        # Rich Console (falls verfügbar)
        if RICH_AVAILABLE:
            self.console = Console()
        
        # Setup Logging
        self.setup_logging()
        self.setup_socketio_events()
    
    def setup_logging(self):
        """Logging-Konfiguration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('gaming_monitor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_socketio_events(self):
        """Socket.IO Event-Handler einrichten"""
        
        @self.sio.event
        async def connect():
            self.is_connected = True
            self.connection_attempts = 0
            await self.log_event("success", f"Connected to gaming server! Socket ID: {self.sio.sid}")
        
        @self.sio.event
        async def disconnect():
            self.is_connected = False
            await self.log_event("error", "Disconnected from gaming server")
        
        @self.sio.event
        async def connect_error(data):
            self.connection_attempts += 1
            await self.log_event("error", f"Connection error (attempt {self.connection_attempts}): {data}")
        
        @self.sio.event
        async def player_count(count):
            await self.log_event("info", f"Player count updated: {count}")
            # Update metrics
            metrics = PerformanceMetrics(
                latency=0,
                player_count=count,
                socket_connections=count,
                timestamp=datetime.now().isoformat()
            )
            self.performance_metrics.append(metrics)
        
        @self.sio.event
        async def player_joined(data):
            await self.log_event("success", f"Player joined {data.get('gameId', 'unknown')}: {data.get('playerId', 'unknown')}")
            self.update_game_session(data.get('gameId'), 1)
        
        @self.sio.event
        async def player_left(data):
            await self.log_event("warning", f"Player left {data.get('gameId', 'unknown')}: {data.get('playerId', 'unknown')}")
            self.update_game_session(data.get('gameId'), -1)
        
        @self.sio.event
        async def welcome(data):
            await self.log_event("success", f"Server welcome: {data.get('message', 'No message')}")
        
        @self.sio.event
        async def pong(data):
            if 'timestamp' in data:
                latency = time.time() * 1000 - data['timestamp']
                await self.log_event("info", f"Ping: {latency:.1f}ms")
                
                # Update metrics
                metrics = PerformanceMetrics(
                    latency=latency,
                    player_count=len(self.connected_users),
                    socket_connections=len(self.connected_users),
                    timestamp=datetime.now().isoformat()
                )
                self.performance_metrics.append(metrics)
    
    async def log_event(self, level: str, message: str, source: str = "monitor"):
        """Event zum Activity Log hinzufügen"""
        entry = LogEntry(
            timestamp=datetime.now().strftime("%H:%M:%S"),
            level=level,
            message=message,
            source=source
        )
        self.activity_log.append(entry)
        
        # Auch ins normale Log
        if level == "error":
            self.logger.error(message)
        elif level == "warning":
            self.logger.warning(message)
        else:
            self.logger.info(message)
    
    def update_game_session(self, game_id: str, player_change: int):
        """Game Session Update"""
        if game_id in self.game_sessions:
            session = self.game_sessions[game_id]
            session.player_count = max(0, session.player_count + player_change)
            session.timestamp = datetime.now().isoformat()
        else:
            # Neue Session erstellen
            game_names = {
                'snake': '🐍 Snake Game',
                'memory': '🧠 Memory Game', 
                'pong': '🏓 Pong',
                'tetris': '🟦 Tetris'
            }
            self.game_sessions[game_id] = GameSession(
                game_id=game_id,
                name=game_names.get(game_id, f"🎮 {game_id.title()}"),
                player_count=max(0, player_change),
                active=True,
                timestamp=datetime.now().isoformat()
            )
    
    async def fetch_server_health(self) -> bool:
        """Server Health von Backend abrufen"""
        try:
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.backend_url}/health", timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        response_time = (time.time() - start_time) * 1000
                        
                        self.server_health = ServerHealth(
                            status=data.get('status', 'Unknown'),
                            uptime=data.get('uptime', 0),
                            version=data.get('version', 'Unknown'),
                            connected_users=data.get('connectedUsers', 0),
                            timestamp=datetime.now().isoformat(),
                            response_time=response_time
                        )
                        return True
            return False
        except Exception as e:
            await self.log_event("error", f"Failed to fetch server health: {e}")
            return False
    
    async def fetch_database_status(self) -> bool:
        """Database Status abrufen"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.backend_url}/health-db", timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        databases = data.get('databases', {})
                        features = data.get('features', {})
                        
                        self.database_status = DatabaseStatus(
                            postgresql=databases.get('postgresql', 'unknown'),
                            redis=databases.get('redis', 'unknown'),
                            user_management=features.get('userManagement', False),
                            session_management=features.get('sessionManagement', False),
                            score_tracking=features.get('scoreTracking', False),
                            timestamp=datetime.now().isoformat()
                        )
                        return True
            return False
        except Exception as e:
            await self.log_event("error", f"Failed to fetch database status: {e}")
            return False
    
    async def connect_socketio(self):
        """Socket.IO Verbindung herstellen"""
        try:
            await self.sio.connect(self.backend_url)
            return True
        except Exception as e:
            await self.log_event("error", f"Socket.IO connection failed: {e}")
            return False
    
    async def send_ping(self):
        """Ping zum Server senden"""
        if self.is_connected:
            try:
                await self.sio.emit('ping', time.time() * 1000)
            except Exception as e:
                await self.log_event("error", f"Ping failed: {e}")
    
    async def run_stress_test(self, num_connections: int = 10):
        """Stress Test mit mehreren Verbindungen"""
        await self.log_event("warning", f"Starting stress test with {num_connections} connections...")
        
        test_clients = []
        for i in range(num_connections):
            try:
                client = socketio.AsyncClient()
                await client.connect(self.backend_url)
                test_clients.append(client)
                await self.log_event("success", f"Stress test client {i+1} connected")
                await asyncio.sleep(0.2)  # Kleine Pause zwischen Verbindungen
            except Exception as e:
                await self.log_event("error", f"Stress test client {i+1} failed: {e}")
        
        # 10 Sekunden warten
        await asyncio.sleep(10)
        
        # Alle Test-Clients disconnecten
        for i, client in enumerate(test_clients):
            try:
                await client.disconnect()
                await self.log_event("warning", f"Stress test client {i+1} disconnected")
            except Exception as e:
                await self.log_event("error", f"Failed to disconnect test client {i+1}: {e}")
        
        await self.log_event("info", "Stress test completed")
    
    async def run_api_tests(self):
        """API Endpunkte testen"""
        await self.log_event("warning", "Running API tests...")
        
        endpoints = [
            ("/api/games", "Games API"),
            ("/api/leaderboard", "Leaderboard API"),
            ("/api/sessions", "Sessions API"),
            ("/api/status", "Status API")
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint, name in endpoints:
                try:
                    async with session.get(f"{self.backend_url}{endpoint}", timeout=5) as response:
                        if response.status == 200:
                            data = await response.json()
                            if 'availableGames' in data:
                                count = len(data['availableGames'])
                                await self.log_event("success", f"{name}: {count} games found")
                            elif 'leaderboard' in data:
                                count = len(data['leaderboard'])
                                await self.log_event("success", f"{name}: {count} entries")
                            elif 'sessions' in data:
                                count = len(data['sessions'])
                                await self.log_event("success", f"{name}: {count} active sessions")
                            else:
                                await self.log_event("success", f"{name}: OK")
                        else:
                            await self.log_event("error", f"{name}: HTTP {response.status}")
                except Exception as e:
                    await self.log_event("error", f"{name}: {e}")
        
        await self.log_event("info", "API tests completed")
    
    def create_terminal_display(self) -> Layout:
        """Rich Terminal Layout erstellen"""
        if not RICH_AVAILABLE:
            return None
        
        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="main"),
            Layout(name="footer", size=3)
        )
        
        layout["main"].split_row(
            Layout(name="left"),
            Layout(name="right")
        )
        
        layout["left"].split_column(
            Layout(name="server", size=8),
            Layout(name="database", size=8),
            Layout(name="performance", size=8)
        )
        
        layout["right"].split_column(
            Layout(name="games", size=12),
            Layout(name="logs")
        )
        
        return layout
    
    def update_terminal_display(self, layout: Layout):
        """Terminal Display aktualisieren"""
        if not RICH_AVAILABLE or not layout:
            return
        
        # Header
        connection_status = "🟢 CONNECTED" if self.is_connected else "🔴 DISCONNECTED"
        header_text = f"🎮 Gaming Platform Monitor - {connection_status} - Updates every {self.update_interval}s"
        layout["header"].update(Panel(header_text, style="bold green"))
        
        # Server Status
        if self.server_health:
            server_table = Table(title="🖥️ Server Status", box=box.ROUNDED)
            server_table.add_column("Metric", style="cyan")
            server_table.add_column("Value", style="green")
            
            uptime_str = f"{self.server_health.uptime//3600}h {(self.server_health.uptime%3600)//60}m {self.server_health.uptime%60}s"
            
            server_table.add_row("Status", self.server_health.status)
            server_table.add_row("Uptime", uptime_str)
            server_table.add_row("Version", self.server_health.version)
            server_table.add_row("Users", str(self.server_health.connected_users))
            server_table.add_row("Response", f"{self.server_health.response_time:.1f}ms")
            
            layout["server"].update(server_table)
        
        # Database Status
        if self.database_status:
            db_table = Table(title="🗄️ Database Status", box=box.ROUNDED)
            db_table.add_column("Component", style="cyan")
            db_table.add_column("Status", style="green")
            
            pg_style = "green" if self.database_status.postgresql == "connected" else "red"
            redis_style = "green" if self.database_status.redis == "connected" else "red"
            
            db_table.add_row("PostgreSQL", f"[{pg_style}]{self.database_status.postgresql}[/{pg_style}]")
            db_table.add_row("Redis", f"[{redis_style}]{self.database_status.redis}[/{redis_style}]")
            db_table.add_row("User Mgmt", "✅" if self.database_status.user_management else "❌")
            db_table.add_row("Sessions", "✅" if self.database_status.session_management else "❌")
            db_table.add_row("Scores", "✅" if self.database_status.score_tracking else "❌")
            
            layout["database"].update(db_table)
        
        # Performance Metrics
        if self.performance_metrics:
            latest = self.performance_metrics[-1]
            perf_table = Table(title="⚡ Performance", box=box.ROUNDED)
            perf_table.add_column("Metric", style="cyan")
            perf_table.add_column("Value", style="yellow")
            
            perf_table.add_row("Players", str(latest.player_count))
            perf_table.add_row("Connections", str(latest.socket_connections))
            perf_table.add_row("Latency", f"{latest.latency:.1f}ms")
            
            layout["performance"].update(perf_table)
        
        # Game Sessions
        games_table = Table(title="🎮 Game Sessions", box=box.ROUNDED)
        games_table.add_column("Game", style="cyan")
        games_table.add_column("Players", style="green")
        games_table.add_column("Status", style="yellow")
        
        if self.game_sessions:
            for session in self.game_sessions.values():
                status = "🟢 Active" if session.active and session.player_count > 0 else "⚪ Idle"
                games_table.add_row(session.name, str(session.player_count), status)
        else:
            games_table.add_row("No active sessions", "0", "⚪ Idle")
        
        layout["games"].update(games_table)
        
        # Activity Log
        log_text = "\n".join([
            f"[{entry.timestamp}] {entry.level.upper()}: {entry.message}"
            for entry in list(self.activity_log)[-15:]  # Last 15 entries
        ])
        
        layout["logs"].update(Panel(log_text, title="📝 Activity Log", box=box.ROUNDED))
        
        # Footer
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        footer_text = f"Last update: {now} | Press Ctrl+C to exit | 's' for stress test | 'a' for API test"
        layout["footer"].update(Panel(footer_text, style="dim"))
    
    def print_simple_status(self):
        """Einfache Status-Ausgabe ohne Rich"""
        print("\n" + "="*60)
        print(f"🎮 Gaming Platform Monitor - {datetime.now().strftime('%H:%M:%S')}")
        print("="*60)
        
        # Connection Status
        status = "CONNECTED" if self.is_connected else "DISCONNECTED"
        print(f"Connection: {status}")
        
        # Server Health
        if self.server_health:
            uptime = f"{self.server_health.uptime//3600}h {(self.server_health.uptime%3600)//60}m"
            print(f"Server: {self.server_health.status} | Uptime: {uptime} | Users: {self.server_health.connected_users}")
        
        # Database
        if self.database_status:
            print(f"Database: PG:{self.database_status.postgresql} | Redis:{self.database_status.redis}")
        
        # Performance
        if self.performance_metrics:
            latest = self.performance_metrics[-1]
            print(f"Performance: {latest.player_count} players | {latest.latency:.1f}ms latency")
        
        # Recent logs
        print("\nRecent Activity:")
        for entry in list(self.activity_log)[-5:]:
            print(f"  [{entry.timestamp}] {entry.message}")
        
        print("\nPress 's' for stress test, 'a' for API test, 'q' to quit")
    
    async def monitoring_loop(self):
        """Haupt-Monitoring-Loop"""
        self.running = True
        await self.log_event("info", "Starting monitoring loop...")
        
        # Socket.IO Connection versuchen
        await self.connect_socketio()
        
        while self.running:
            try:
                # Data Updates
                await self.fetch_server_health()
                await self.fetch_database_status()
                
                # Ping senden
                await self.send_ping()
                
                # Kurz warten
                await asyncio.sleep(self.update_interval)
                
            except KeyboardInterrupt:
                await self.log_event("info", "Monitoring stopped by user")
                break
            except Exception as e:
                await self.log_event("error", f"Monitoring loop error: {e}")
                await asyncio.sleep(5)  # Längere Pause bei Fehlern
        
        # Cleanup
        if self.is_connected:
            await self.sio.disconnect()
        
        await self.log_event("info", "Monitoring stopped")
    
    async def start_terminal_mode(self):
        """Terminal-basiertes Monitoring starten"""
        if RICH_AVAILABLE:
            layout = self.create_terminal_display()
            
            async def update_display():
                while self.running:
                    self.update_terminal_display(layout)
                    await asyncio.sleep(1)
            
            with Live(layout, refresh_per_second=1, screen=True):
                # Starte beide Tasks parallel
                await asyncio.gather(
                    self.monitoring_loop(),
                    update_display()
                )
        else:
            # Fallback ohne Rich
            async def simple_display():
                while self.running:
                    self.print_simple_status()
                    await asyncio.sleep(self.update_interval)
            
            await asyncio.gather(
                self.monitoring_loop(),
                simple_display()
            )
    
    def start_web_mode(self, port: int = 5000):
        """Web-basiertes Dashboard starten"""
        if not FLASK_AVAILABLE:
            print("❌ Flask nicht installiert. Installiere mit: pip install flask flask-socketio")
            return
        
        app = Flask(__name__)
        app.config['SECRET_KEY'] = 'gaming-monitor-secret'
        socketio_web = FlaskSocketIO(app, cors_allowed_origins="*")
        
        @app.route('/')
        def dashboard():
            return render_template_string(WEB_DASHBOARD_HTML)
        
        @app.route('/api/status')
        def api_status():
            return jsonify({
                'server_health': asdict(self.server_health) if self.server_health else None,
                'database_status': asdict(self.database_status) if self.database_status else None,
                'performance_metrics': [asdict(m) for m in list(self.performance_metrics)[-10:]],
                'game_sessions': {k: asdict(v) for k, v in self.game_sessions.items()},
                'activity_log': [asdict(entry) for entry in list(self.activity_log)[-20:]],
                'is_connected': self.is_connected
            })
        
        @socketio_web.on('stress_test')
        def handle_stress_test():
            asyncio.create_task(self.run_stress_test())
        
        @socketio_web.on('api_test')
        def handle_api_test():
            asyncio.create_task(self.run_api_tests())
        
        print(f"🌐 Web Dashboard starting on http://localhost:{port}")
        
        # Monitoring in separatem Thread
        def run_monitoring():
            asyncio.run(self.monitoring_loop())
        
        monitor_thread = threading.Thread(target=run_monitoring)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        # Web Server starten
        socketio_web.run(app, host='0.0.0.0', port=port, debug=False)

# Web Dashboard HTML Template
WEB_DASHBOARD_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Gaming Platform Monitor</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
    <style>
        body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #00ff88; margin: 0; padding: 20px; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: #1a1a2e; border: 2px solid #00ff88; border-radius: 10px; padding: 20px; }
        .card h3 { color: #00ff88; margin-top: 0; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .status-good { color: #00ff88; }
        .status-warning { color: #ffaa00; }
        .status-error { color: #ff4444; }
        .log { height: 200px; overflow-y: auto; background: #0a0a0a; padding: 10px; border-radius: 5px; }
        button { background: #00ff88; color: #000; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #00cc66; }
    </style>
</head>
<body>
    <h1>🎮 Gaming Platform Live Monitor</h1>
    <div class="dashboard">
        <div class="card">
            <h3>🖥️ Server Status</h3>
            <div id="server-status"></div>
        </div>
        <div class="card">
            <h3>🗄️ Database Status</h3>
            <div id="database-status"></div>
        </div>
        <div class="card">
            <h3>⚡ Performance</h3>
            <div id="performance"></div>
        </div>
        <div class="card">
            <h3>🎮 Game Sessions</h3>
            <div id="game-sessions"></div>
        </div>
        <div class="card" style="grid-column: span 2;">
            <h3>📝 Activity Log</h3>
            <div class="log" id="activity-log"></div>
            <button onclick="runStressTest()">Stress Test</button>
            <button onclick="runAPITest()">API Test</button>
        </div>
    </div>

    <script>
        const socket = io();
        
        function updateDashboard() {
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    updateServerStatus(data.server_health);
                    updateDatabaseStatus(data.database_status);
                    updatePerformance(data.performance_metrics);
                    updateGameSessions(data.game_sessions);
                    updateActivityLog(data.activity_log);
                });
        }
        
        function updateServerStatus(health) {
            const container = document.getElementById('server-status');
            if (health) {
                const uptime = Math.floor(health.uptime / 3600) + 'h ' + Math.floor((health.uptime % 3600) / 60) + 'm';
                container.innerHTML = `
                    <div class="metric"><span>Status:</span><span class="status-good">${health.status}</span></div>
                    <div class="metric"><span>Uptime:</span><span>${uptime}</span></div>
                    <div class="metric"><span>Version:</span><span>${health.version}</span></div>
                    <div class="metric"><span>Users:</span><span>${health.connected_users}</span></div>
                    <div class="metric"><span>Response:</span><span>${health.response_time.toFixed(1)}ms</span></div>
                `;
            } else {
                container.innerHTML = '<div class="status-error">No data available</div>';
            }
        }
        
        function updateDatabaseStatus(db) {
            const container = document.getElementById('database-status');
            if (db) {
                const pgClass = db.postgresql === 'connected' ? 'status-good' : 'status-error';
                const redisClass = db.redis === 'connected' ? 'status-good' : 'status-error';
                container.innerHTML = `
                    <div class="metric"><span>PostgreSQL:</span><span class="${pgClass}">${db.postgresql}</span></div>
                    <div class="metric"><span>Redis:</span><span class="${redisClass}">${db.redis}</span></div>
                    <div class="metric"><span>User Mgmt:</span><span>${db.user_management ? '✅' : '❌'}</span></div>
                    <div class="metric"><span>Sessions:</span><span>${db.session_management ? '✅' : '❌'}</span></div>
                    <div class="metric"><span>Scores:</span><span>${db.score_tracking ? '✅' : '❌'}</span></div>
                `;
            } else {
                container.innerHTML = '<div class="status-error">No data available</div>';
            }
        }
        
        function updatePerformance(metrics) {
            const container = document.getElementById('performance');
            if (metrics && metrics.length > 0) {
                const latest = metrics[metrics.length - 1];
                const latencyClass = latest.latency < 50 ? 'status-good' : latest.latency < 100 ? 'status-warning' : 'status-error';
                container.innerHTML = `
                    <div class="metric"><span>Players:</span><span class="status-good">${latest.player_count}</span></div>
                    <div class="metric"><span>Connections:</span><span class="status-good">${latest.socket_connections}</span></div>
                    <div class="metric"><span>Latency:</span><span class="${latencyClass}">${latest.latency.toFixed(1)}ms</span></div>
                `;
            } else {
                container.innerHTML = '<div class="status-error">No performance data</div>';
            }
        }
        
        function updateGameSessions(sessions) {
            const container = document.getElementById('game-sessions');
            let html = '';
            for (const [gameId, session] of Object.entries(sessions)) {
                const statusClass = session.player_count > 0 ? 'status-good' : 'status-warning';
                html += `<div class="metric"><span>${session.name}:</span><span class="${statusClass}">${session.player_count} players</span></div>`;
            }
            container.innerHTML = html || '<div class="status-warning">No active sessions</div>';
        }
        
        function updateActivityLog(logs) {
            const container = document.getElementById('activity-log');
            let html = '';
            logs.forEach(entry => {
                const levelClass = entry.level === 'error' ? 'status-error' : 
                                 entry.level === 'warning' ? 'status-warning' : 'status-good';
                html += `<div class="${levelClass}">[${entry.timestamp}] ${entry.message}</div>`;
            });
            container.innerHTML = html;
            container.scrollTop = container.scrollHeight;
        }
        
        function runStressTest() {
            socket.emit('stress_test');
        }
        
        function runAPITest() {
            socket.emit('api_test');
        }
        
        // Auto-update every 5 seconds
        setInterval(updateDashboard, 5000);
        updateDashboard(); // Initial load
    </script>
</body>
</html>
"""

def main():
    """Haupt-Funktion mit Argument-Parsing"""
    parser = argparse.ArgumentParser(description='Gaming Platform Monitor')
    parser.add_argument('--mode', choices=['terminal', 'web'], default='terminal',
                       help='Monitor mode: terminal or web dashboard')
    parser.add_argument('--interval', type=int, default=5,
                       help='Update interval in seconds (default: 5)')
    parser.add_argument('--backend', default='http://localhost:3001',
                       help='Backend URL (default: http://localhost:3001)')
    parser.add_argument('--port', type=int, default=5000,
                       help='Web dashboard port (default: 5000)')
    
    args = parser.parse_args()
    
    # Banner anzeigen
    print("="*60)
    print("🎮 Gaming Platform Monitor v1.0")
    print("="*60)
    print(f"Mode: {args.mode}")
    print(f"Backend: {args.backend}")
    print(f"Update Interval: {args.interval}s")
    if args.mode == 'web':
        print(f"Web Dashboard: http://localhost:{args.port}")
    print("="*60)
    
    # Dependencies prüfen
    missing_deps = []
    if args.mode == 'terminal' and not RICH_AVAILABLE:
        missing_deps.append("rich")
    if args.mode == 'web' and not FLASK_AVAILABLE:
        missing_deps.extend(["flask", "flask-socketio"])
    
    if missing_deps:
        print(f"❌ Missing dependencies: {', '.join(missing_deps)}")
        print(f"Install with: pip install {' '.join(missing_deps)}")
        return 1
    
    # Monitor erstellen und starten
    monitor = GamingPlatformMonitor(
        backend_url=args.backend,
        update_interval=args.interval
    )
    
    try:
        if args.mode == 'terminal':
            # Terminal Mode mit Rich oder Fallback
            asyncio.run(monitor.start_terminal_mode())
        else:
            # Web Mode
            monitor.start_web_mode(args.port)
    except KeyboardInterrupt:
        print("\n🛑 Monitor stopped by user")
        return 0
    except Exception as e:
        print(f"❌ Monitor error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())