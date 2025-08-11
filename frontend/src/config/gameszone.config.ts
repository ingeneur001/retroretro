import { RetroRetroMode } from '../hooks/useModeDetection';

// Game Zone Types
export interface GameZoneConfig {
  enableSingleplayer: boolean;
  enableMultiplayer: boolean;
  enableArcade: boolean;
  showGameZoneAnalytics: boolean;
  enableGameRoomCreation: boolean;
  maxGameRooms: number;
  enableTournaments: boolean;
  enableSaveSystem: boolean;
  enablePaymentFeatures: boolean;
  debugMode: boolean;
}

// Individual Game Config
export interface GameConfig {
  id: string;
  name: string;
  category: 'singleplayer' | 'multiplayer' | 'arcade';
  enabled: boolean;
  premiumOnly: boolean;
  requirements: string[];
}

// Game Zone Configurations per Mode
export const GAMESZONE_CONFIG: Record<RetroRetroMode, GameZoneConfig> = {
  development: {
    // Alle Zonen verfügbar + Analytics
    enableSingleplayer: true,
    enableMultiplayer: true,
    enableArcade: true,
    showGameZoneAnalytics: true,      // Nur Development
    enableGameRoomCreation: true,
    maxGameRooms: 50,
    enableTournaments: true,
    enableSaveSystem: false,          // Development: kein Save
    enablePaymentFeatures: false,     // Development: kein Payment
    debugMode: true
  },
  
  demo: {
    // Begrenzte Game Zone Features
    enableSingleplayer: true,         // Basis verfügbar
    enableMultiplayer: false,         // Eingeschränkt
    enableArcade: true,               // Basis verfügbar
    showGameZoneAnalytics: false,     // Keine Analytics
    enableGameRoomCreation: false,    // Keine Room Creation
    maxGameRooms: 2,                  // Sehr begrenzt
    enableTournaments: false,         // Keine Tournaments
    enableSaveSystem: false,          // Kein Save System
    enablePaymentFeatures: false,     // Kein Payment
    debugMode: false
  },
  
  production: {
    // Vollumfang alle Zonen
    enableSingleplayer: true,
    enableMultiplayer: true,
    enableArcade: true,
    showGameZoneAnalytics: false,     // Keine Analytics
    enableGameRoomCreation: true,
    maxGameRooms: 999,
    enableTournaments: true,
    enableSaveSystem: true,           // Save System für alle Zonen
    enablePaymentFeatures: true,      // Premium Game Zone Features
    debugMode: false
  }
};

// Game Definitions (entspricht der 3-Zonen-Struktur)
export const GAME_DEFINITIONS: GameConfig[] = [
  // 🎲 SINGLEPLAYER ZONE
  {
    id: 'snake',
    name: 'Snake Game',
    category: 'singleplayer',
    enabled: true,
    premiumOnly: false,
    requirements: []
  },
  {
    id: 'tetris',
    name: 'Tetris',
    category: 'singleplayer',
    enabled: true,
    premiumOnly: false,
    requirements: []
  },
  {
    id: 'memory',
    name: 'Memory Game',
    category: 'singleplayer',
    enabled: true,
    premiumOnly: false,
    requirements: []
  },
  {
    id: 'pong-solo',
    name: 'Pong Solo',
    category: 'singleplayer',
    enabled: true,
    premiumOnly: false,
    requirements: []
  },
  {
    id: 'puzzle',
    name: 'Puzzle Games',
    category: 'singleplayer',
    enabled: true,
    premiumOnly: true,  // Production only
    requirements: ['production']
  },
  {
    id: 'quiz',
    name: 'Quiz Games',
    category: 'singleplayer',
    enabled: true,
    premiumOnly: true,  // Production only
    requirements: ['production']
  },
  
  // 👥 MULTIPLAYER ZONE
  {
    id: 'snake-multiplayer',
    name: 'Snake Multiplayer',
    category: 'multiplayer',
    enabled: true,
    premiumOnly: false,
    requirements: ['multiplayer']
  },
  {
    id: 'pong-multiplayer',
    name: 'Pong Multiplayer',
    category: 'multiplayer',
    enabled: true,
    premiumOnly: false,
    requirements: ['multiplayer']
  },
  {
    id: 'tournaments',
    name: 'Tournaments',
    category: 'multiplayer',
    enabled: true,
    premiumOnly: true,  // Production only
    requirements: ['multiplayer', 'production']
  },
  {
    id: 'game-rooms',
    name: 'Game Rooms',
    category: 'multiplayer',
    enabled: true,
    premiumOnly: false,
    requirements: ['multiplayer']
  },
  
  // 🕹️ ARCADE GAMES ZONE
  {
    id: 'classic-pong',
    name: 'Classic Pong',
    category: 'arcade',
    enabled: true,
    premiumOnly: false,
    requirements: []
  },
  {
    id: 'space-invaders',
    name: 'Space Invaders',
    category: 'arcade',
    enabled: true,
    premiumOnly: false,
    requirements: []
  },
  {
    id: 'breakout',
    name: 'Breakout Game',
    category: 'arcade',
    enabled: true,
    premiumOnly: true,  // Demo eingeschränkt
    requirements: ['not-demo']
  },
  {
    id: 'pacman',
    name: 'Pac-Man Style',
    category: 'arcade',
    enabled: true,
    premiumOnly: true,  // Production only
    requirements: ['production']
  },
  {
    id: 'asteroids',
    name: 'Asteroids',
    category: 'arcade',
    enabled: true,
    premiumOnly: true,  // Production only
    requirements: ['production']
  }
];

// Zone-spezifische Konfigurationen
export const ZONE_CONFIGS = {
  singleplayer: {
    title: 'Singleplayer Zone',
    icon: '🎲',
    description: 'Solo gaming experience with classic single-player games',
    color: '#00ffff',
    path: '/games/singleplayer'
  },
  multiplayer: {
    title: 'Multiplayer Zone',
    icon: '👥',
    description: 'Real-time multiplayer gaming with friends',
    color: '#ff6b6b',
    path: '/games/multiplayer'
  },
  arcade: {
    title: 'Arcade Games Zone',
    icon: '🕹️',
    description: 'Classic arcade games collection',
    color: '#00ff88',
    path: '/games/arcade'
  }
};

// Helper Functions
export const getGameZoneConfig = (mode: RetroRetroMode): GameZoneConfig => {
  return GAMESZONE_CONFIG[mode];
};

export const getAvailableGames = (mode: RetroRetroMode, category?: 'singleplayer' | 'multiplayer' | 'arcade'): GameConfig[] => {
  const config = getGameZoneConfig(mode);
  
  return GAME_DEFINITIONS.filter(game => {
    // Category filter
    if (category && game.category !== category) {
      return false;
    }
    
    // Zone availability check
    if (game.category === 'singleplayer' && !config.enableSingleplayer) {
      return false;
    }
    if (game.category === 'multiplayer' && !config.enableMultiplayer) {
      return false;
    }
    if (game.category === 'arcade' && !config.enableArcade) {
      return false;
    }
    
    // Premium/Requirements check
    if (game.premiumOnly || game.requirements.length > 0) {
      // Check specific requirements
      for (const requirement of game.requirements) {
        switch (requirement) {
          case 'production':
            if (mode !== 'production') return false;
            break;
          case 'not-demo':
            if (mode === 'demo') return false;
            break;
          case 'multiplayer':
            if (!config.enableMultiplayer) return false;
            break;
        }
      }
    }
    
    return game.enabled;
  });
};

export const getZoneAvailability = (mode: RetroRetroMode) => {
  const config = getGameZoneConfig(mode);
  
  return {
    singleplayer: {
      enabled: config.enableSingleplayer,
      games: getAvailableGames(mode, 'singleplayer').length
    },
    multiplayer: {
      enabled: config.enableMultiplayer,
      games: getAvailableGames(mode, 'multiplayer').length
    },
    arcade: {
      enabled: config.enableArcade,
      games: getAvailableGames(mode, 'arcade').length
    }
  };
};

export const canCreateGameRoom = (mode: RetroRetroMode): boolean => {
  const config = getGameZoneConfig(mode);
  return config.enableGameRoomCreation;
};

export const getMaxGameRooms = (mode: RetroRetroMode): number => {
  const config = getGameZoneConfig(mode);
  return config.maxGameRooms;
};

export const hasTournamentSupport = (mode: RetroRetroMode): boolean => {
  const config = getGameZoneConfig(mode);
  return config.enableTournaments;
};

export const isGameZoneDebugEnabled = (mode: RetroRetroMode): boolean => {
  const config = getGameZoneConfig(mode);
  return config.debugMode;
};

export default {
  GAMESZONE_CONFIG,
  GAME_DEFINITIONS,
  ZONE_CONFIGS,
  getGameZoneConfig,
  getAvailableGames,
  getZoneAvailability,
  canCreateGameRoom,
  getMaxGameRooms,
  hasTournamentSupport,
  isGameZoneDebugEnabled
};