// ===================================================================
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
