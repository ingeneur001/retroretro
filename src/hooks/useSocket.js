// ===================================================================
// useSocket - React Hook für Socket.IO Integration
// frontend/src/hooks/useSocket.js
// ===================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/SocketService';

export const useSocket = (userToken) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [error, setError] = useState(null);
  const [gameSession, setGameRoom] = useState(null);
  
  // Event listeners cleanup
  const listenersRef = useRef(new Set());

  // ===================================================================
  // CONNECTION MANAGEMENT
  // ===================================================================
  
  const connect = useCallback(async () => {
    if (!userToken) {
      setError('No user token provided');
      return false;
    }

    try {
      setError(null);
      setConnectionState('connecting');
      
      const socket = await socketService.connect(userToken);
      
      setConnectionState('authenticated');
      setUser(socketService.getUser());
      
      // Setup game event listeners
      socketService.setupGameEventListeners();
      
      return true;
    } catch (err) {
      setError(err.message);
      setConnectionState('error');
      return false;
    }
  }, [userToken]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setConnectionState('disconnected');
    setUser(null);
    setOnlineUsers([]);
    setPlayerCount(0);
    setGameRoom(null);
  }, []);

  // ===================================================================
  // EVENT LISTENERS SETUP
  // ===================================================================
  
  useEffect(() => {
    const setupEventListeners = () => {
      // Connection state updates
      const handleConnectionStateChange = () => {
        setConnectionState(socketService.getConnectionState());
      };

      // User events
      const handleUserOnline = (userData) => {
        setOnlineUsers(prev => {
          if (prev.find(u => u.id === userData.userId)) return prev;
          return [...prev, {
            id: userData.userId,
            username: userData.username,
            displayName: userData.displayName
          }];
        });
      };

      const handleUserOffline = (userData) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== userData.userId));
      };

      const handlePlayerCount = (count) => {
        setPlayerCount(count);
      };

      // Register listeners
      socketService.on('userOnline', handleUserOnline);
      socketService.on('userOffline', handleUserOffline);
      socketService.on('playerCount', handlePlayerCount);

      // Store listeners for cleanup
      listenersRef.current.add(['userOnline', handleUserOnline]);
      listenersRef.current.add(['userOffline', handleUserOffline]);
      listenersRef.current.add(['playerCount', handlePlayerCount]);
    };

    if (connectionState === 'authenticated') {
      setupEventListeners();
    }

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(([event, handler]) => {
        socketService.off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, [connectionState]);

  // Auto-connect if token is provided
  useEffect(() => {
    if (userToken && connectionState === 'disconnected') {
      connect();
    }
  }, [userToken, connectionState, connect]);

  // ===================================================================
  // GAME FUNCTIONS
  // ===================================================================
  
  const joinGame = useCallback(async (gameId, options = {}) => {
    try {
      const session = await socketService.joinGame(gameId, options);
      setGameRoom(session);
      return session;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const leaveGame = useCallback((gameId) => {
    socketService.leaveGame(gameId);
    setGameRoom(null);
  }, []);

  const submitScore = useCallback(async (scoreData) => {
    try {
      const result = await socketService.submitScore(scoreData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ===================================================================
  // MESSAGING FUNCTIONS
  // ===================================================================
  
  const sendPrivateMessage = useCallback((targetUserId, message) => {
    try {
      socketService.sendPrivateMessage(targetUserId, message);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const sendGameInvitation = useCallback((targetUserId, gameType, roomId) => {
    try {
      socketService.sendGameInvitation(targetUserId, gameType, roomId);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // ===================================================================
  // UTILITY FUNCTIONS
  // ===================================================================
  
  const refreshOnlineUsers = useCallback(async () => {
    try {
      const users = await socketService.getOnlineUsers();
      setOnlineUsers(users);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const ping = useCallback(() => {
    socketService.ping();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ===================================================================
  // RETURN HOOK VALUES
  // ===================================================================
  
  return {
    // Connection state
    connectionState,
    isConnected: connectionState === 'authenticated',
    isConnecting: connectionState === 'connecting',
    error,
    clearError,

    // User data
    user,
    onlineUsers,
    playerCount,

    // Connection functions
    connect,
    disconnect,
    ping,

    // Game functions
    gameSession,
    joinGame,
    leaveGame,
    submitScore,

    // Social functions
    sendPrivateMessage,
    sendGameInvitation,
    refreshOnlineUsers,

    // Socket service access
    socketService
  };
};

// ===================================================================
// ADDITIONAL HOOKS
// ===================================================================

// Hook for listening to specific socket events
export const useSocketEvent = (eventName, handler, dependencies = []) => {
  useEffect(() => {
    if (typeof handler === 'function') {
      socketService.on(eventName, handler);
    }

    return () => {
      if (typeof handler === 'function') {
        socketService.off(eventName, handler);
      }
    };
  }, [eventName, ...dependencies]);
};

// Hook for game-specific functionality
export const useGameSocket = (gameId) => {
  const [gameState, setGameState] = useState({
    players: [],
    isInGame: false,
    gameData: null
  });

  const [messages, setMessages] = useState([]);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    if (!gameId) return;

    const handlePlayerJoined = (data) => {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players.filter(p => p.id !== data.user.id), data.user]
      }));
    };

    const handlePlayerLeft = (data) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== data.user.id)
      }));
    };

    const handlePrivateMessage = (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: data.fromDisplayName,
        message: data.message,
        timestamp: data.timestamp
      }]);
    };

    const handleGameInvitation = (data) => {
      setInvitations(prev => [...prev, {
        id: Date.now(),
        from: data.fromDisplayName,
        gameType: data.gameType,
        timestamp: data.timestamp,
        data
      }]);
    };

    // Register listeners
    socketService.on('playerJoined', handlePlayerJoined);
    socketService.on('playerLeft', handlePlayerLeft);
    socketService.on('privateMessage', handlePrivateMessage);
    socketService.on('gameInvitation', handleGameInvitation);

    return () => {
      socketService.off('playerJoined', handlePlayerJoined);
      socketService.off('playerLeft', handlePlayerLeft);
      socketService.off('privateMessage', handlePrivateMessage);
      socketService.off('gameInvitation', handleGameInvitation);
    };
  }, [gameId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearInvitations = useCallback(() => {
    setInvitations([]);
  }, []);

  return {
    gameState,
    messages,
    invitations,
    clearMessages,
    clearInvitations
  };
};