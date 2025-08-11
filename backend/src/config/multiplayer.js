// ===================================================================
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
