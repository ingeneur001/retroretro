import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameRoom as GameRoom, GameUser } from '../../../types/multiplayer';

// Styled Components
const LobbyContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2rem;
  margin: 0;
`;

const CreateGameButton = styled.button`
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GameSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const GameTypeButton = styled.button<{ $selected: boolean }>`
  background: ${props => props.$selected ? '#00ff88' : '#333'};
  color: ${props => props.$selected ? '#000' : '#fff'};
  border: 2px solid ${props => props.$selected ? '#00ff88' : '#555'};
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => props.$selected ? 'bold' : 'normal'};
  transition: all 0.2s ease;

  &:hover {
    border-color: #00ff88;
    background: ${props => props.$selected ? '#00ff88' : '#444'};
  }
`;

const SessionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const SessionItem = styled.div`
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 255, 136, 0.15);
  }
`;

const SessionInfo = styled.div`
  margin-bottom: 15px;
`;

const SessionTitle = styled.h3`
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
`;

const PlayerCount = styled.div`
  color: #00ff88;
  font-weight: bold;
  margin-bottom: 5px;
`;

const SessionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #aaa;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 60px 20px;
  background: #1a1a1a;
  border-radius: 12px;
  border: 2px dashed #333;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #00ff88;
  font-size: 1.1rem;
`;

// Game types configuration
const gameTypes = [
  { slug: 'tetris', title: 'Tetris' },
  { slug: 'snake', title: 'Snake' },
  { slug: 'pong', title: 'Pong' },
  { slug: 'memory', title: 'Memory Game' }
];

interface GameLobbyProps {
  socket: any;
  currentUser: GameUser;
  onJoinSession: (sessionId: string, gameType: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ socket, currentUser, onJoinSession }) => {
  const [availableSessions, setAvailableSessions] = useState<GameRoom[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<string>('tetris');
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleSessionsList = (sessions: GameRoom[]) => {
      setAvailableSessions(sessions);
      setLoading(false);
    };

    const handleSessionCreated = (session: GameRoom) => {
      setAvailableSessions(prev => [...prev, session]);
      setCreating(false);
    };

    const handleSessionUpdated = (session: GameRoom) => {
      setAvailableSessions(prev => 
        prev.map(s => s.id === session.id ? session : s)
      );
    };

    const handleSessionRemoved = (sessionId: string) => {
      setAvailableSessions(prev => 
        prev.filter(s => s.id !== sessionId)
      );
    };

    socket.on('sessions-list', handleSessionsList);
    socket.on('session-created', handleSessionCreated);
    socket.on('session-updated', handleSessionUpdated);
    socket.on('session-removed', handleSessionRemoved);

    // Request initial sessions list
    setLoading(true);
    socket.emit('get-sessions');

    return () => {
      socket.off('sessions-list', handleSessionsList);
      socket.off('session-created', handleSessionCreated);
      socket.off('session-updated', handleSessionUpdated);
      socket.off('session-removed', handleSessionRemoved);
    };
  }, [socket]);

  const handleCreateSession = () => {
    if (!socket || creating) return;

    setCreating(true);
    socket.emit('create-session', {
      gameType: selectedGameType,
      maxPlayers: 4,
      config: {
        difficulty: 'normal'
      }
    });
  };

  const handleJoinSession = (sessionId: string, gameType: string) => {
    if (!socket) return;
    onJoinSession(sessionId, gameType);
  };

  const filteredSessions = availableSessions.filter(session => 
    session.status === 'waiting' && session.players.length < session.maxPlayers
  );

  return (
    <LobbyContainer>
      <Header>
        <Title>Game Lobby</Title>
        <div>
          <span style={{ color: '#666', marginRight: '10px' }}>
            Welcome, {currentUser.displayName}
          </span>
        </div>
      </Header>

      <GameSelector>
        {gameTypes.map(game => (
          <GameTypeButton
            key={game.slug}
            $selected={selectedGameType === game.slug}
            onClick={() => setSelectedGameType(game.slug)}
          >
            {game.title}
          </GameTypeButton>
        ))}
        <CreateGameButton
          onClick={handleCreateSession}
          disabled={creating || !socket}
        >
          {creating ? 'Creating...' : `Create ${gameTypes.find(g => g.slug === selectedGameType)?.title} Game`}
        </CreateGameButton>
      </GameSelector>

      {loading ? (
        <LoadingSpinner>Loading available games...</LoadingSpinner>
      ) : filteredSessions.length === 0 ? (
        <EmptyState>
          <h3>No games available</h3>
          <p>Be the first to create a game!</p>
        </EmptyState>
      ) : (
        <SessionsList>
          {filteredSessions.map(session => (
            <SessionItem
              key={session.id}
              onClick={() => handleJoinSession(session.id, session.gameType)}
            >
              <SessionInfo>
                <SessionTitle>
                  {gameTypes.find(g => g.slug === session.gameType)?.title || session.gameType}
                </SessionTitle>
                <PlayerCount>
                  {session.players.length}/{session.maxPlayers} players
                </PlayerCount>
              </SessionInfo>
              <SessionMeta>
                <span>Host: {session.host.displayName}</span>
                <span>{session.status === 'waiting' ? '⏳ Waiting' : '🎮 Playing'}</span>
              </SessionMeta>
            </SessionItem>
          ))}
        </SessionsList>
      )}
    </LobbyContainer>
  );
};

export default GameLobby;
