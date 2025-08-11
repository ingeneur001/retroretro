// ===================================================================
// GameDashboard.js - Hauptkomponente für Multiplayer Gaming
// ===================================================================

import React, { useEffect, useState } from 'react';
import { useSocket, useSocketEvent, useGameSocket } from '../hooks/useSocket';

const GameDashboard = ({ userToken }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Main socket connection
  const {
    isConnected,
    connectionState,
    user,
    onlineUsers,
    playerCount,
    joinGame,
    leaveGame,
    submitScore,
    sendPrivateMessage,
    sendGameInvitation,
    error,
    clearError
  } = useSocket(userToken);

  // Game-specific socket functionality
  const { 
    messages, 
    invitations, 
    clearMessages, 
    clearInvitations 
  } = useGameSocket(selectedGame);

  // ===================================================================
  // SOCKET EVENT LISTENERS
  // ===================================================================

  // Listen for game invitations
  useSocketEvent('gameInvitation', (invitation) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'invitation',
      message: `${invitation.fromDisplayName} invited you to play ${invitation.gameType}`,
      data: invitation
    }]);
  });

  // Listen for private messages
  useSocketEvent('privateMessage', (message) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'message',
      message: `${message.fromDisplayName}: ${message.message}`,
      data: message
    }]);
  });

  // Listen for friend high scores
  useSocketEvent('friendHighScore', (scoreData) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'highscore',
      message: `${scoreData.displayName} scored ${scoreData.score} in ${scoreData.gameType}!`,
      data: scoreData
    }]);
  });

  // ===================================================================
  // GAME FUNCTIONS
  // ===================================================================

  const handleJoinGame = async (gameId) => {
    try {
      const session = await joinGame(gameId, {
        playerPreferences: {
          difficulty: 'normal',
          notifications: true
        }
      });
      
      setSelectedGame(gameId);
      console.log('✅ Joined game:', session);
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Successfully joined ${gameId}!`
      }]);

    } catch (err) {
      console.error('❌ Failed to join game:', err);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to join ${gameId}: ${err.message}`
      }]);
    }
  };

  const handleLeaveGame = () => {
    if (selectedGame) {
      leaveGame(selectedGame);
      setSelectedGame(null);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `Left game`
      }]);
    }
  };

  const handleSubmitScore = async (gameType, score, level = 1) => {
    try {
      const result = await submitScore({
        gameType,
        score,
        level,
        completed: true,
        duration: 120 // Example: 2 minutes
      });

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Score submitted: ${score} points! ${result.newRank ? `New rank: ${result.newRank}` : ''}`
      }]);

    } catch (err) {
      console.error('❌ Score submission failed:', err);
    }
  };

  // ===================================================================
  // SOCIAL FUNCTIONS
  // ===================================================================

  const handleSendMessage = (targetUserId, message) => {
    if (message.trim()) {
      sendPrivateMessage(targetUserId, message);
      setChatMessage('');
    }
  };

  const handleSendInvitation = (targetUserId, gameType) => {
    sendGameInvitation(targetUserId, gameType);
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'info',
      message: `Game invitation sent!`
    }]);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // ===================================================================
  // AVAILABLE GAMES
  // ===================================================================

  const availableGames = [
    { id: 'snake', name: 'Snake Game', description: 'Classic snake with multiplayer' },
    { id: 'pong', name: 'Pong', description: '2-player paddle game' },
    { id: 'tetris', name: 'Tetris', description: 'Block puzzle game' },
    { id: 'memory', name: 'Memory Game', description: 'Card matching game' }
  ];

  // ===================================================================
  // RENDER
  // ===================================================================

  if (!userToken) {
    return (
      <div className="game-dashboard">
        <h2>Please log in to access multiplayer features</h2>
      </div>
    );
  }

  return (
    <div className="game-dashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1>🎮 Retro Gaming Dashboard</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            Status: <span style={{ 
              color: isConnected ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {connectionState}
            </span>
            {user && <span> | Welcome, {user.displayName}!</span>}
          </div>
          <div>
            👥 Players online: {playerCount}
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          Error: {error}
          <button onClick={clearError} style={{ marginLeft: '10px' }}>✕</button>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>🔔 Notifications</h3>
          {notifications.slice(-5).map(notification => (
            <div 
              key={notification.id}
              style={{ 
                background: notification.type === 'error' ? '#ffebee' : 
                           notification.type === 'success' ? '#e8f5e8' : '#f0f0f0',
                color: notification.type === 'error' ? '#c62828' : 
                       notification.type === 'success' ? '#2e7d32' : '#333',
                padding: '8px 12px',
                margin: '5px 0',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{notification.message}</span>
              <button onClick={() => dismissNotification(notification.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      {isConnected ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          
          {/* Games Section */}
          <div>
            <h2>🎮 Available Games</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {availableGames.map(game => (
                <div 
                  key={game.id}
                  style={{ 
                    border: selectedGame === game.id ? '3px solid #4caf50' : '1px solid #ddd',
                    borderRadius: '10px',
                    padding: '15px',
                    background: selectedGame === game.id ? '#f0fff0' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <h3>{game.name}</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>{game.description}</p>
                  <div style={{ marginTop: '10px' }}>
                    {selectedGame === game.id ? (
                      <div>
                        <button 
                          onClick={handleLeaveGame}
                          style={{ 
                            background: '#f44336', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '5px',
                            marginRight: '10px'
                          }}
                        >
                          Leave Game
                        </button>
                        <button 
                          onClick={() => handleSubmitScore(game.id, Math.floor(Math.random() * 1000))}
                          style={{ 
                            background: '#4caf50', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '5px'
                          }}
                        >
                          Test Score
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleJoinGame(game.id)}
                        style={{ 
                          background: '#2196f3', 
                          color: 'white', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '5px'
                        }}
                      >
                        Join Game
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Game Messages */}
            {messages.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3>💬 Game Messages</h3>
                <div style={{ 
                  background: '#f5f5f5', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px', 
                  padding: '10px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {messages.slice(-10).map(msg => (
                    <div key={msg.id} style={{ margin: '5px 0' }}>
                      <strong>{msg.from}:</strong> {msg.message}
                    </div>
                  ))}
                </div>
                <button onClick={clearMessages} style={{ marginTop: '10px' }}>
                  Clear Messages
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Online Users */}
          <div>
            <h3>👥 Online Users ({onlineUsers.length})</h3>
            <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '15px' }}>
              {onlineUsers.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No other users online</p>
              ) : (
                onlineUsers.map(onlineUser => (
                  <div 
                    key={onlineUser.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px',
                      margin: '5px 0',
                      background: 'white',
                      borderRadius: '5px',
                      border: '1px solid #eee'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{onlineUser.displayName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>@{onlineUser.username}</div>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleSendMessage(onlineUser.id, 'Hello!')}
                        style={{ 
                          background: '#4caf50', 
                          color: 'white', 
                          border: 'none', 
                          padding: '4px 8px', 
                          borderRadius: '3px',
                          fontSize: '12px',
                          marginRight: '5px'
                        }}
                        title="Send Message"
                      >
                        💬
                      </button>
                      <button 
                        onClick={() => handleSendInvitation(onlineUser.id, selectedGame || 'snake')}
                        style={{ 
                          background: '#2196f3', 
                          color: 'white', 
                          border: 'none', 
                          padding: '4px 8px', 
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                        title="Send Game Invitation"
                      >
                        🎮
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Chat */}
            {showChat && (
              <div style={{ marginTop: '20px' }}>
                <h4>💬 Quick Chat</h4>
                <div style={{ display: 'flex', marginTop: '10px' }}>
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      border: '1px solid #ddd', 
                      borderRadius: '3px' 
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && onlineUsers.length > 0) {
                        handleSendMessage(onlineUsers[0].id, chatMessage);
                      }
                    }}
                  />
                  <button 
                    onClick={() => onlineUsers.length > 0 && handleSendMessage(onlineUsers[0].id, chatMessage)}
                    disabled={!chatMessage.trim() || onlineUsers.length === 0}
                    style={{ 
                      background: '#4caf50', 
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 12px', 
                      borderRadius: '3px',
                      marginLeft: '5px'
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowChat(!showChat)}
              style={{ 
                marginTop: '10px',
                background: '#666', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '5px'
              }}
            >
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Connecting to server...</h2>
          <p>Connection state: {connectionState}</p>
          {connectionState === 'error' && (
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                background: '#4caf50', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '5px'
              }}
            >
              Retry Connection
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameDashboard;