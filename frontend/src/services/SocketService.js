// ===================================================================
// ENHANCED SOCKET.IO CLIENT für Retro Gaming Frontend
// frontend/src/services/SocketService.js
// Integriert mit JWT Authentication und erweiterten Features
// ===================================================================

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.user = null;
    this.eventListeners = new Map();
    
    // Connection states
    this.connectionStates = {
      DISCONNECTED: 'disconnected',
      CONNECTING: 'connecting', 
      CONNECTED: 'connected',
      AUTHENTICATED: 'authenticated',
      ERROR: 'error'
    };
    
    this.currentState = this.connectionStates.DISCONNECTED;
  }

  // ===================================================================
  // CONNECTION MANAGEMENT
  // ===================================================================
  
  async connect(userToken, serverUrl = 'http://localhost:3001') {
    if (this.socket && this.isConnected) {
      console.log('🔌 Already connected to server');
      return this.socket;
    }

    try {
      console.log('🔌 Connecting to retro gaming server...');
      this.currentState = this.connectionStates.CONNECTING;

      // Enhanced Socket.IO client configuration
      this.socket = io(serverUrl, {
        // JWT Authentication
        auth: {
          token: userToken
        },
        query: {
          token: userToken // Fallback
        },
        
        // Connection options
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: true,
        
        // Reconnection settings
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        
        // Performance settings
        timeout: 10000,
        forceNew: false
      });

      // Set up core event listeners
      this.setupCoreEventListeners();
      
      // Wait for connection or timeout
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 15000);

        this.socket.once('welcome', (data) => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.user = data.user;
          this.currentState = this.connectionStates.AUTHENTICATED;
          
          console.log('🎉 Connected and authenticated as:', data.user.displayName);
          console.log('🚀 Available features:', data.features);
          
          resolve(this.socket);
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Connection failed:', error.message);
          this.currentState = this.connectionStates.ERROR;
          reject(error);
        });
      });

    } catch (error) {
      console.error('❌ Socket connection error:', error);
      this.currentState = this.connectionStates.ERROR;
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from server...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.user = null;
      this.currentState = this.connectionStates.DISCONNECTED;
    }
  }

  // ===================================================================
  // CORE EVENT LISTENERS
  // ===================================================================
  
  setupCoreEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
      this.currentState = this.connectionStates.CONNECTED;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
      this.currentState = this.connectionStates.DISCONNECTED;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after max attempts');
      this.currentState = this.connectionStates.ERROR;
    });

    // Server communication
    this.socket.on('pong', (data) => {
      // Connection health check response
      console.log('💓 Server pong:', data.serverTime - data.timestamp + 'ms');
    });

    // User events
    this.socket.on('user-online', (data) => {
      console.log(`👤 User came online: ${data.displayName}`);
      this.emit('userOnline', data);
    });

    this.socket.on('user-offline', (data) => {
      console.log(`👤 User went offline: ${data.displayName}`);
      this.emit('userOffline', data);
    });

    // Player count updates
    this.socket.on('player-count', (count) => {
      this.emit('playerCount', count);
    });
  }

  // ===================================================================
  // GAME FUNCTIONALITY
  // ===================================================================
  
  async joinGame(gameId, gameOptions = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    console.log(`🎮 Joining game: ${gameId}`);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Join game timeout'));
      }, 10000);

      this.socket.emit('join-game', { 
        gameId, 
        ...gameOptions,
        userId: this.user?.id,
        username: this.user?.username
      });

      // Listen for game session created
      const handleSessionCreated = (data) => {
        clearTimeout(timeout);
        this.socket.off('game-session-created', handleSessionCreated);
        console.log('✅ Game session created:', data);
        resolve(data);
      };

      this.socket.on('game-session-created', handleSessionCreated);
    });
  }

  leaveGame(gameId) {
    if (!this.isConnected) return;

    console.log(`🎮 Leaving game: ${gameId}`);
    this.socket.emit('leave-game', { 
      gameId,
      userId: this.user?.id 
    });
  }

  // ===================================================================
  // MESSAGING FUNCTIONALITY  
  // ===================================================================
  
  sendPrivateMessage(targetUserId, message) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    console.log(`💬 Sending private message to user ${targetUserId}`);
    this.socket.emit('private-message', {
      targetUserId,
      message
    });
  }

  sendGameInvitation(targetUserId, gameType, roomId = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    console.log(`🎮 Sending game invitation to user ${targetUserId}`);
    this.socket.emit('invite-to-game', {
      targetUserId,
      gameType,
      roomId: roomId || `game-${Date.now()}`
    });
  }

  // ===================================================================
  // SCORE & LEADERBOARD
  // ===================================================================
  
  submitScore(scoreData) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    console.log('🏆 Submitting score:', scoreData);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Score submission timeout'));
      }, 10000);

      // Listen for score response
      const handleScoreSaved = (data) => {
        clearTimeout(timeout);
        this.socket.off('score-saved', handleScoreSaved);
        this.socket.off('score-save-error', handleScoreError);
        resolve(data);
      };

      const handleScoreError = (error) => {
        clearTimeout(timeout);
        this.socket.off('score-saved', handleScoreSaved);
        this.socket.off('score-save-error', handleScoreError);
        reject(new Error(error));
      };

      this.socket.on('score-saved', handleScoreSaved);
      this.socket.on('score-save-error', handleScoreError);

      this.socket.emit('submit-score', {
        gameType: scoreData.gameType,
        score: scoreData.score,
        level: scoreData.level || 1,
        timeSeconds: scoreData.duration || 0,
        completed: scoreData.completed || false
      });
    });
  }

  // ===================================================================
  // USER & SOCIAL FUNCTIONALITY
  // ===================================================================
  
  getOnlineUsers() {
    if (!this.isConnected) return Promise.reject('Not connected');

    return new Promise((resolve) => {
      const handleOnlineUsers = (users) => {
        this.socket.off('online-users', handleOnlineUsers);
        resolve(users);
      };

      this.socket.on('online-users', handleOnlineUsers);
      this.socket.emit('get-online-users');
    });
  }

  // ===================================================================
  // UTILITY FUNCTIONS
  // ===================================================================
  
  ping() {
    if (this.isConnected) {
      this.socket.emit('ping', Date.now());
    }
  }

  getConnectionState() {
    return this.currentState;
  }

  getUser() {
    return this.user;
  }

  isUserOnline() {
    return this.isConnected && this.currentState === this.connectionStates.AUTHENTICATED;
  }

  // ===================================================================
  // EVENT SYSTEM für React Components
  // ===================================================================
  
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);

    // Also listen on socket if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    // Emit to local event listeners
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ===================================================================
  // GAME-SPECIFIC EVENT HANDLERS
  // ===================================================================
  
  setupGameEventListeners() {
    if (!this.socket) return;

    // Game events
    this.socket.on('player-joined', (data) => {
      console.log(`🎮 Player joined: ${data.user.displayName}`);
      this.emit('playerJoined', data);
    });

    this.socket.on('player-left', (data) => {
      console.log(`🎮 Player left: ${data.user.displayName}`);
      this.emit('playerLeft', data);
    });

    // Message events
    this.socket.on('private-message', (data) => {
      console.log(`💬 Private message from ${data.fromDisplayName}: ${data.message}`);
      this.emit('privateMessage', data);
    });

    this.socket.on('message-sent', (data) => {
      console.log('✅ Message sent successfully');
      this.emit('messageSent', data);
    });

    this.socket.on('message-error', (error) => {
      console.error('❌ Message error:', error);
      this.emit('messageError', error);
    });

    // Game invitation events
    this.socket.on('game-invitation', (data) => {
      console.log(`🎮 Game invitation from ${data.fromDisplayName}: ${data.gameType}`);
      this.emit('gameInvitation', data);
    });

    this.socket.on('invitation-sent', (data) => {
      console.log('✅ Game invitation sent');
      this.emit('invitationSent', data);
    });

    this.socket.on('invitation-error', (error) => {
      console.error('❌ Invitation error:', error);
      this.emit('invitationError', error);
    });

    // Score events
    this.socket.on('friend-high-score', (data) => {
      console.log(`🏆 ${data.displayName} achieved a high score in ${data.gameType}: ${data.score}`);
      this.emit('friendHighScore', data);
    });
  }
}

// ===================================================================
// SINGLETON EXPORT
// ===================================================================
const socketService = new SocketService();
export default socketService;

// Named exports for specific functionality
export {
  socketService,
  SocketService
};