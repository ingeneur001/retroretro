// ========================================
// MULTIPLAYER HOOK - JAVASCRIPT VERSION
// File: frontend/src/hooks/useMultiplayerSocket.js
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useMultiplayerSocket = (serverUrl = 'http://localhost:3001') => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionPlayers, setSessionPlayers] = useState([]);
  const [sessionSpectators, setSessionSpectators] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [availableSessions, setAvailableSessions] = useState([]);

  useEffect(() => {
    const newSocket = io(serverUrl);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Connected to multiplayer server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Disconnected from multiplayer server');
    });

    // Session events
    newSocket.on('session_created', (data) => {
      if (data.success) {
        setCurrentSession(data.session);
        console.log('🎮 Session created:', data.session.id);
      } else {
        console.error('❌ Failed to create session:', data.error);
      }
    });

    newSocket.on('session_joined', (data) => {
      if (data.success) {
        setCurrentSession(data.session);
        console.log('👤 Joined session:', data.session.id);
      } else {
        console.error('❌ Failed to join session:', data.error);
      }
    });

    newSocket.on('player_joined', (data) => {
      setSessionPlayers(data.sessionPlayers || []);
      setSessionSpectators(data.sessionSpectators || []);
      console.log('👤 Player joined:', data.user.username);
    });

    newSocket.on('player_left', (data) => {
      setSessionPlayers(data.sessionPlayers || []);
      setSessionSpectators(data.sessionSpectators || []);
      console.log('👋 Player left:', data.user.username);
    });

    // Game events
    newSocket.on('game_state_updated', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('game_action', (data) => {
      // Custom game action handling
      console.log('🎮 Game action received:', data);
    });

    // Chat events
    newSocket.on('chat_message', (message) => {
      setChatMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
    });

    // Session listing
    newSocket.on('sessions_list', (data) => {
      if (data.success) {
        setAvailableSessions(data.sessions);
      }
    });

    // Quick match result
    newSocket.on('quick_match_result', (data) => {
      if (data.success) {
        if (data.action === 'join') {
          // Join existing session
          console.log('🔍 Quick match found session:', data.sessionId);
        } else if (data.action === 'create') {
          // Create new session
          console.log('🔍 Quick match creating new session');
        }
      } else {
        console.error('❌ Quick match failed:', data.error);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  // Socket methods
  const createSession = useCallback((gameId, settings, user) => {
    if (socket) {
      socket.emit('create_session', { gameId, settings, user });
    }
  }, [socket]);

  const joinSession = useCallback((sessionId, user, asSpectator = false) => {
    if (socket) {
      socket.emit('join_session', { sessionId, user, asSpectator });
    }
  }, [socket]);

  const leaveSession = useCallback(() => {
    if (socket) {
      socket.emit('leave_session');
    }
    setCurrentSession(null);
    setSessionPlayers([]);
    setSessionSpectators([]);
    setChatMessages([]);
    setGameState(null);
  }, [socket]);

  const updateGameState = useCallback((gameState) => {
    if (socket) {
      socket.emit('game_state_update', { 
        gameState, 
        timestamp: new Date().toISOString() 
      });
    }
  }, [socket]);

  const sendGameAction = useCallback((action) => {
    if (socket) {
      socket.emit('game_action', {
        ...action,
        timestamp: new Date().toISOString()
      });
    }
  }, [socket]);

  const sendChatMessage = useCallback((message, user) => {
    if (socket && message.trim()) {
      socket.emit('chat_message', { message: message.trim(), user });
    }
  }, [socket]);

  const quickMatch = useCallback((gameSlug, user) => {
    if (socket) {
      socket.emit('quick_match', { gameSlug, user });
    }
  }, [socket]);

  const listSessions = useCallback((gameSlug) => {
    if (socket) {
      socket.emit('list_sessions', { gameSlug });
    }
  }, [socket]);

  return {
    socket,
    connected,
    currentSession,
    sessionPlayers,
    sessionSpectators,
    chatMessages,
    gameState,
    availableSessions,
    createSession,
    joinSession,
    leaveSession,
    updateGameState,
    sendGameAction,
    sendChatMessage,
    quickMatch,
    listSessions
  };
};

// ========================================
// SIMPLE TEST COMPONENT - frontend/src/components/MultiplayerTest.js
// ========================================

import React, { useState, useEffect } from 'react';
import { useMultiplayerSocket } from '../hooks/useMultiplayerSocket';

const MultiplayerTest = () => {
  const {
    connected,
    currentSession,
    sessionPlayers,
    chatMessages,
    createSession,
    joinSession,
    sendChatMessage,
    listSessions,
    availableSessions
  } = useMultiplayerSocket();

  const [chatInput, setChatInput] = useState('');

  // Mock user for testing
  const testUser = {
    id: '1',
    username: 'TestUser',
    displayName: 'Test User'
  };

  useEffect(() => {
    if (connected) {
      listSessions('snake');
    }
  }, [connected, listSessions]);

  const handleCreateSession = () => {
    createSession('1', { gameType: 'snake' }, testUser);
  };

  const handleJoinSession = (sessionId) => {
    joinSession(sessionId, testUser);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput, testUser);
      setChatInput('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 Multiplayer Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Connection Status:</strong> {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {!currentSession ? (
        <div>
          <h2>Join or Create Session</h2>
          
          <button 
            onClick={handleCreateSession}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginRight: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Create Test Session
          </button>

          <h3>Available Sessions:</h3>
          {availableSessions.length === 0 ? (
            <p>No sessions available</p>
          ) : (
            <ul>
              {availableSessions.map(session => (
                <li key={session.id} style={{ marginBottom: '10px' }}>
                  {session.game_title} - {session.current_players}/{session.max_players} players
                  <button 
                    onClick={() => handleJoinSession(session.id)}
                    style={{ 
                      marginLeft: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <h2>In Session: {currentSession.id}</h2>
          
          <h3>Players ({sessionPlayers.length}):</h3>
          <ul>
            {sessionPlayers.map(player => (
              <li key={player.id}>
                {player.displayName} {player.isHost ? '👑' : ''}
              </li>
            ))}
          </ul>

          <h3>Chat:</h3>
          <div style={{ 
            height: '200px', 
            overflowY: 'auto', 
            border: '1px solid #ccc', 
            padding: '10px',
            marginBottom: '10px'
          }}>
            {chatMessages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.user.displayName}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              style={{ 
                width: '300px', 
                padding: '8px',
                marginRight: '10px'
              }}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MultiplayerTest;