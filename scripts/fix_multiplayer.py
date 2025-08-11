#!/usr/bin/env python3
"""
Fix Multiplayer Issues Script
Behebt alle kritischen Multiplayer-Probleme und erstellt fehlende Config-Dateien
"""

import os
import json
import shutil
from datetime import datetime
import sys

def fix_multiplayer_issues(project_path):
    """Behebt alle Multiplayer-Probleme"""
    
    print("🔧 Fixing Multiplayer Issues...")
    
    frontend_path = os.path.join(project_path, "frontend", "src")
    backend_path = os.path.join(project_path, "backend")
    
    # 1. Leere Backup-Dateien entfernen
    print("\n🗑️ REMOVING EMPTY BACKUP FILES")
    empty_backups = [
        "components/multiplayer/GameLobby.tsx.bak",
        "components/multiplayer/GameRoom.tsx.bak", 
        "hooks/useMultiplayerSocket.js.bak"
    ]
    
    for backup in empty_backups:
        full_path = os.path.join(frontend_path, backup.replace('/', os.sep))
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
            if file_size == 0:
                print(f"  🗑️ Removing empty backup: {backup}")
                os.remove(full_path)
    
    # 2. Redis Config erstellen
    print("\n⚙️ CREATING REDIS CONFIG")
    redis_config_path = os.path.join(backend_path, "config", "redis.js")
    
    # Ordner erstellen falls nicht vorhanden
    os.makedirs(os.path.dirname(redis_config_path), exist_ok=True)
    
    redis_config = '''// ===================================================================
// REDIS CONFIGURATION für Multiplayer Sessions
// backend/config/redis.js
// ===================================================================

const redis = require('redis');

const redisConfig = {
  // Development Settings
  development: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  },
  
  // Production Settings
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  }
};

// Create Redis Client
const createRedisClient = () => {
  const env = process.env.NODE_ENV || 'development';
  const config = redisConfig[env];
  
  const client = redis.createClient(config);
  
  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
  });
  
  client.on('connect', () => {
    console.log('✅ Redis Client Connected');
  });
  
  client.on('ready', () => {
    console.log('🚀 Redis Client Ready');
  });
  
  return client;
};

// Session Management
const sessionManager = {
  // Game Room Sessions
  async setGameRoom(roomId, roomData, ttl = 3600) {
    const client = createRedisClient();
    await client.setex(`room:${roomId}`, ttl, JSON.stringify(roomData));
    await client.quit();
  },
  
  async getGameRoom(roomId) {
    const client = createRedisClient();
    const data = await client.get(`room:${roomId}`);
    await client.quit();
    return data ? JSON.parse(data) : null;
  },
  
  async deleteGameRoom(roomId) {
    const client = createRedisClient();
    await client.del(`room:${roomId}`);
    await client.quit();
  },
  
  // Player Sessions
  async setPlayerSession(playerId, sessionData, ttl = 7200) {
    const client = createRedisClient();
    await client.setex(`player:${playerId}`, ttl, JSON.stringify(sessionData));
    await client.quit();
  },
  
  async getPlayerSession(playerId) {
    const client = createRedisClient();
    const data = await client.get(`player:${playerId}`);
    await client.quit();
    return data ? JSON.parse(data) : null;
  }
};

module.exports = {
  redisConfig,
  createRedisClient,
  sessionManager
};
'''
    
    with open(redis_config_path, 'w', encoding='utf-8') as f:
        f.write(redis_config)
    print(f"  ✅ Created: {redis_config_path}")
    
    # 3. Multiplayer Backend Config erstellen
    print("\n⚙️ CREATING MULTIPLAYER BACKEND CONFIG")
    multiplayer_config_path = os.path.join(backend_path, "src", "config", "multiplayer.js")
    
    # Ordner erstellen falls nicht vorhanden
    os.makedirs(os.path.dirname(multiplayer_config_path), exist_ok=True)
    
    multiplayer_config = '''// ===================================================================
// MULTIPLAYER CONFIGURATION
// backend/src/config/multiplayer.js
// ===================================================================

const multiplayerConfig = {
  // Room Settings
  rooms: {
    maxRooms: 100,
    maxPlayersPerRoom: 8,
    roomIdLength: 6,
    roomTimeout: 3600000, // 1 hour in ms
    cleanupInterval: 300000, // 5 minutes in ms
  },
  
  // Game Settings
  games: {
    allowedGames: ['snake', 'tetris', 'memory', 'pong'],
    defaultGame: 'snake',
    gameTimeout: 1800000, // 30 minutes in ms
    maxSpectators: 10,
  },
  
  // Socket Settings
  socket: {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  },
  
  // Authentication
  auth: {
    required: true,
    tokenExpiry: 7200, // 2 hours
    guestMode: process.env.NODE_ENV === 'development',
  },
  
  // Rate Limiting
  rateLimit: {
    createRoom: { points: 5, duration: 60 }, // 5 rooms per minute
    joinRoom: { points: 10, duration: 60 },  // 10 joins per minute
    sendMessage: { points: 30, duration: 60 }, // 30 messages per minute
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  multiplayerConfig.rooms.maxRooms = 500;
  multiplayerConfig.auth.guestMode = false;
}

module.exports = multiplayerConfig;
'''
    
    with open(multiplayer_config_path, 'w', encoding='utf-8') as f:
        f.write(multiplayer_config)
    print(f"  ✅ Created: {multiplayer_config_path}")
    
    # 4. Frontend Socket Config erstellen
    print("\n⚙️ CREATING FRONTEND SOCKET CONFIG")
    frontend_config_dir = os.path.join(frontend_path, "config")
    os.makedirs(frontend_config_dir, exist_ok=True)
    
    socket_config_path = os.path.join(frontend_config_dir, "socket.js")
    socket_config = '''// ===================================================================
// SOCKET CLIENT CONFIGURATION
// frontend/src/config/socket.js
// ===================================================================

export const socketConfig = {
  // Server URLs
  server: {
    development: 'http://localhost:3001',
    production: process.env.REACT_APP_SOCKET_URL || 'ws://localhost:3001',
  },
  
  // Socket.IO Options
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false,
  },
  
  // Authentication
  auth: {
    autoAuth: true,
    tokenHeader: 'Authorization',
    tokenPrefix: 'Bearer ',
  },
  
  // Event Names (Frontend & Backend müssen übereinstimmen!)
  events: {
    // Connection Events
    connect: 'connect',
    disconnect: 'disconnect',
    error: 'connect_error',
    
    // Authentication Events  
    authenticate: 'authenticate',
    authenticated: 'authenticated',
    authError: 'auth_error',
    
    // Room Events
    createRoom: 'room:create',
    joinRoom: 'room:join',
    leaveRoom: 'room:leave',
    roomCreated: 'room:created',
    roomJoined: 'room:joined',
    roomLeft: 'room:left',
    roomUpdate: 'room:update',
    roomError: 'room:error',
    
    // Game Events
    gameStart: 'game:start',
    gameEnd: 'game:end',
    gameUpdate: 'game:update',
    gameAction: 'game:action',
    
    // Player Events
    playerJoined: 'player:joined',
    playerLeft: 'player:left',
    playerUpdate: 'player:update',
    
    // Chat Events
    chatMessage: 'chat:message',
    chatReceived: 'chat:received',
  },
  
  // Retry Configuration
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
  }
};

// Get server URL based on environment
export const getServerUrl = () => {
  const env = process.env.NODE_ENV || 'development';
  return socketConfig.server[env];
};

// Get socket options with auth token
export const getSocketOptions = (token) => {
  const options = { ...socketConfig.options };
  
  if (token && socketConfig.auth.autoAuth) {
    options.auth = {
      token: token
    };
  }
  
  return options;
};

export default socketConfig;
'''
    
    with open(socket_config_path, 'w', encoding='utf-8') as f:
        f.write(socket_config)
    print(f"  ✅ Created: {socket_config_path}")
    
    # 5. Multiplayer Types verbessern
    print("\n📝 UPDATING MULTIPLAYER TYPES")
    multiplayer_types_path = os.path.join(frontend_path, "types", "multiplayer.ts")
    
    # Backup der aktuellen Version erstellen
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f"{multiplayer_types_path}.backup-{timestamp}"
    if os.path.exists(multiplayer_types_path):
        shutil.copy2(multiplayer_types_path, backup_path)
        print(f"  📋 Backup created: {backup_path}")
    
    # Ordner erstellen falls nicht vorhanden
    os.makedirs(os.path.dirname(multiplayer_types_path), exist_ok=True)
    
    improved_types = '''// ===================================================================
// MULTIPLAYER TYPES - Enhanced Version
// frontend/src/types/multiplayer.ts
// ===================================================================

// User Interfaces
export interface GameUser {
  id: string;
  displayName: string;
  username: string;
  email?: string;
  isOnline: boolean;
  avatar?: string;
  // Multiplayer-specific fields
  socketId?: string;
  playerNumber?: number;
  isHost?: boolean;
  isReady?: boolean;
  score?: number;
  wins?: number;
  losses?: number;
}

export interface Player extends GameUser {
  position: { x: number; y: number };
  color: string;
  isActive: boolean;
  lastActivity: Date;
}

// Room Interfaces
export interface GameRoom {
  id: string;
  name: string;
  gameType: string;
  isPrivate: boolean;
  password?: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Player[];
  host: GameUser;
  status: 'waiting' | 'starting' | 'playing' | 'paused' | 'finished';
  settings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSettings {
  gameType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'competitive' | 'cooperative' | 'practice';
  timeLimit?: number;
  scoreLimit?: number;
  allowSpectators: boolean;
  autoStart: boolean;
  [key: string]: any; // Game-specific settings
}

// Game State Interfaces
export interface GameState {
  roomId: string;
  status: 'waiting' | 'starting' | 'playing' | 'paused' | 'finished';
  currentPlayer?: string;
  turn: number;
  score: { [playerId: string]: number };
  gameData: any; // Game-specific data
  startTime?: Date;
  endTime?: Date;
}

export interface GameAction {
  type: string;
  playerId: string;
  data: any;
  timestamp: Date;
}

// Message Interfaces
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'emoji';
}

export interface SystemMessage {
  type: 'player_joined' | 'player_left' | 'game_started' | 'game_ended' | 'error';
  message: string;
  timestamp: Date;
  data?: any;
}

// Socket Event Interfaces
export interface SocketError {
  code: string;
  message: string;
  details?: any;
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error?: SocketError;
  reconnectAttempts: number;
  lastConnected?: Date;
}

// Hook Interfaces
export interface UseMultiplayerSocket {
  // Connection
  connectionState: ConnectionState;
  connect: () => void;
  disconnect: () => void;
  
  // Room Management
  currentRoom: GameRoom | null;
  createRoom: (settings: Partial<GameSettings>) => Promise<GameRoom>;
  joinRoom: (roomId: string, password?: string) => Promise<boolean>;
  leaveRoom: () => void;
  
  // Game Actions
  gameState: GameState | null;
  sendGameAction: (action: Omit<GameAction, 'playerId' | 'timestamp'>) => void;
  
  // Chat
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  
  // Player Management
  updatePlayerReady: (ready: boolean) => void;
  kickPlayer: (playerId: string) => void; // Host only
}

// API Response Interfaces
export interface RoomListResponse {
  rooms: GameRoom[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRoomRequest {
  name: string;
  gameType: string;
  isPrivate: boolean;
  password?: string;
  maxPlayers: number;
  settings: Partial<GameSettings>;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
}

// Type Guards
export const isGameUser = (obj: any): obj is GameUser => {
  return obj && typeof obj.id === 'string' && typeof obj.displayName === 'string';
};

export const isGameRoom = (obj: any): obj is GameRoom => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

// Enums
export enum GameType {
  SNAKE = 'snake',
  TETRIS = 'tetris', 
  MEMORY = 'memory',
  PONG = 'pong'
}

export enum RoomStatus {
  WAITING = 'waiting',
  STARTING = 'starting', 
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished'
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}
'''
    
    with open(multiplayer_types_path, 'w', encoding='utf-8') as f:
        f.write(improved_types)
    print(f"  ✅ Updated: {multiplayer_types_path}")
    
    # 6. Package.json Dependencies prüfen
    print("\n📦 CHECKING BACKEND DEPENDENCIES")
    backend_package_json = os.path.join(backend_path, "package.json")
    
    if os.path.exists(backend_package_json):
        with open(backend_package_json, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
        
        dependencies = package_data.get('dependencies', {})
        required_deps = ['redis', 'socket.io']
        missing_deps = []
        
        for dep in required_deps:
            if dep not in dependencies:
                missing_deps.append(dep)
        
        if missing_deps:
            print(f"  ⚠️ Missing dependencies: {', '.join(missing_deps)}")
            print(f"  📝 Run: npm install {' '.join(missing_deps)}")
        else:
            print("  ✅ All required dependencies present")
    else:
        print("  ❌ Backend package.json not found")
    
    # 7. Zusammenfassung
    print("\n🎉 MULTIPLAYER FIXES COMPLETED!")
    print("\n📋 Summary:")
    print("  ✅ Removed empty backup files")
    print("  ✅ Created Redis configuration") 
    print("  ✅ Created Multiplayer backend config")
    print("  ✅ Created Frontend socket config")
    print("  ✅ Enhanced Multiplayer types")
    print("  ✅ Checked backend dependencies")
    
    print("\n🚀 Next Steps:")
    print("  1. Review the created config files")
    print("  2. Install missing dependencies (if any)")
    print("  3. Update backend to use new configs")
    print("  4. Update frontend hooks to use new types")
    print("  5. Test socket connections")
    
    return True

def main():
    """Hauptfunktion"""
    project_path = sys.argv[1] if len(sys.argv) > 1 else r"D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service"
    
    if not os.path.exists(project_path):
        print(f"❌ Project path not found: {project_path}")
        sys.exit(1)
    
    success = fix_multiplayer_issues(project_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()