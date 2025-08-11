const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');

// Express App erstellen
const app = express();
const server = http.createServer(app);

// Socket.IO konfigurieren
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  allowEIO3: true
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Server-Variablen
const PORT = process.env.PORT || 3001;
let connectedUsers = 0;
let serverStartTime = Date.now();
let activeConnections = new Map();

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
  
  res.json({
    status: 'OK',
    uptime: uptime,
    version: '1.0.0-minimal',
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers,
    port: PORT,
    mode: 'minimal-stable'
  });
});

// ===== API ROUTES =====
app.get('/api/status', (req, res) => {
  res.json({
    server: 'Legal Retro Gaming Service - Minimal',
    status: 'running',
    users: connectedUsers,
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    features: ['multiplayer', 'stable-operation']
  });
});

app.get('/api/games', (req, res) => {
  res.json({
    source: 'minimal-config',
    availableGames: [
      {
        id: 'snake',
        name: 'Snake Game',
        description: 'Classic Snake game built in React',
        status: 'available',
        maxPlayers: 4,
        isMultiplayer: true
      },
      {
        id: 'memory',
        name: 'Memory Game', 
        description: 'Test your memory with cards',
        status: 'available',
        maxPlayers: 1,
        isMultiplayer: false
      },
      {
        id: 'pong',
        name: 'Pong Demo',
        description: 'Simple Pong game simulation',
        status: 'available',
        maxPlayers: 2,
        isMultiplayer: true
      },
      {
        id: 'tetris',
        name: 'Tetris Demo',
        description: 'Tetris-style block game',
        status: 'available',
        maxPlayers: 2,
        isMultiplayer: true
      }
    ]
  });
});

// ===== SOCKET.IO EVENTS =====
io.on('connection', (socket) => {
  connectedUsers++;
  console.log(`👤 User connected: ${socket.id} (Total: ${connectedUsers})`);
  
  // Track connection
  activeConnections.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    currentGame: null
  });
  
  // Welcome message
  socket.emit('welcome', {
    message: 'Welcome to Legal Retro Gaming Service - Minimal Mode!',
    serverId: socket.id,
    timestamp: new Date().toISOString(),
    mode: 'stable-minimal'
  });
  
  // Update player count
  io.emit('player-count', connectedUsers);
  
  // Ping-Pong
  socket.on('ping', (timestamp) => {
    socket.emit('pong', {
      timestamp,
      serverTime: Date.now(),
      mode: 'minimal'
    });
  });
  
  // Game Events
  socket.on('join-game', (gameData) => {
    console.log(`🎮 User ${socket.id} joined game: ${gameData.gameId}`);
    
    const connection = activeConnections.get(socket.id);
    connection.currentGame = gameData.gameId;
    
    socket.join(`game-${gameData.gameId}`);
    
    socket.to(`game-${gameData.gameId}`).emit('player-joined', {
      playerId: socket.id,
      gameId: gameData.gameId,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('leave-game', (gameData) => {
    console.log(`🎮 User ${socket.id} left game: ${gameData.gameId}`);
    
    const connection = activeConnections.get(socket.id);
    connection.currentGame = null;
    
    socket.leave(`game-${gameData.gameId}`);
    
    socket.to(`game-${gameData.gameId}`).emit('player-left', {
      playerId: socket.id,
      gameId: gameData.gameId,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('game-input', (inputData) => {
    socket.to(`game-${inputData.gameId}`).emit('player-input', {
      playerId: socket.id,
      input: inputData.input,
      timestamp: new Date().toISOString()
    });
  });
  
  // Disconnect
  socket.on('disconnect', (reason) => {
    connectedUsers--;
    console.log(`👤 User disconnected: ${socket.id} (${reason}) (Total: ${connectedUsers})`);
    
    activeConnections.delete(socket.id);
    io.emit('player-count', connectedUsers);
  });
  
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// ===== ERROR HANDLERS =====
app.use((err, req, res, next) => {
  console.error('❌ Express Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ===== SERVER START =====
server.listen(PORT, () => {
  console.log('🎮 Legal Retro Gaming Service (Minimal) running on port ' + PORT);
  console.log('✅ NO DATABASE DEPENDENCIES - STABLE OPERATION');
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('📊 Games API: http://localhost:' + PORT + '/api/games');
  console.log('📡 Socket.IO ready for multiplayer connections');
  console.log('💡 This version should run stable without timeouts!');
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };