import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { GameRoom as GameRoom, GameUser, ChatMessage } from '../../../types/multiplayer';

// Styled Components
const RoomContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e);
`;

const GameArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #333;
`;

const RoomTitle = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 1.5rem;
`;

const LeaveButton = styled.button`
  background: #ff4444;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: #ff6666;
    transform: translateY(-1px);
  }
`;

const PlayersInfo = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const PlayerChip = styled.div<{ $isHost: boolean }>`
  background: ${props => props.$isHost ? 'linear-gradient(45deg, #ffd700, #ffed4e)' : '#333'};
  color: ${props => props.$isHost ? '#000' : '#fff'};
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: ${props => props.$isHost ? 'bold' : 'normal'};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const GameCanvas = styled.div`
  flex: 1;
  background: #1a1a1a;
  border-radius: 12px;
  border: 2px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 400px;
`;

const GameStatus = styled.div`
  text-align: center;
  color: #fff;
  font-size: 1.2rem;
`;

const Sidebar = styled.div`
  width: 350px;
  background: #16213e;
  border-left: 2px solid #333;
  display: flex;
  flex-direction: column;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const ChatTitle = styled.h3`
  color: #fff;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
  background: #0f0f23;
  margin-bottom: 15px;
  max-height: 300px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
`;

const ChatMessage = styled.div<{ $isSystem: boolean }>`
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 6px;
  background: ${props => props.$isSystem ? '#2a2a4a' : 'transparent'};
  font-size: 0.9rem;
  color: ${props => props.$isSystem ? '#00ff88' : '#fff'};
`;

const ChatUser = styled.span`
  color: #00ff88;
  font-weight: bold;
  margin-right: 5px;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  background: #333;
  border: 1px solid #555;
  border-radius: 6px;
  padding: 10px;
  color: #fff;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #00ff88;
  }

  &::placeholder {
    color: #888;
  }
`;

const SendButton = styled.button`
  background: #00ff88;
  border: none;
  border-radius: 6px;
  padding: 10px 15px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #00cc6a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StartGameButton = styled.button`
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 20px;
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

// Game types configuration
const games = [
  { slug: 'tetris', title: 'Tetris' },
  { slug: 'snake', title: 'Snake' },
  { slug: 'pong', title: 'Pong' },
  { slug: 'memory', title: 'Memory Game' }
];

interface GameRoomProps {
  socket: any;
  currentUser: GameUser;
  sessionId: string;
  onLeaveRoom: () => void;
}

const GameRoom: React.FC<GameRoomProps> = ({ socket, currentUser, sessionId, onLeaveRoom }) => {
  const [currentSession, setCurrentSession] = useState<GameRoom | null>(null);
  const [sessionPlayers, setSessionPlayers] = useState<GameUser[]>([]);
  const [sessionSpectators, setSessionSpectators] = useState<GameUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  const [isHost, setIsHost] = useState<boolean>(false);

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleSessionJoined = (session: GameRoom) => {
      setCurrentSession(session);
      setSessionPlayers(session.players);
      setIsHost(session.host.id === currentUser.id);
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        type: 'system',
        message: `Welcome to ${games.find(g => g.slug === session.gameType)?.title || session.gameType}!`,
        timestamp: new Date()
      };
      setChatMessages([systemMessage]);
    };

    const handlePlayerJoined = (player: GameUser, session: GameRoom) => {
      setCurrentSession(session);
      setSessionPlayers(session.players);
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        type: 'system',
        message: `${player.displayName} joined the game`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, systemMessage]);
    };

    const handlePlayerLeft = (playerId: string, session: GameRoom) => {
      setCurrentSession(session);
      setSessionPlayers(session.players);
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        type: 'system',
        message: `A player left the game`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, systemMessage]);
    };

    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    };

    const handleGameStateUpdate = (gameState: any) => {
      setGameStatus(gameState.status || 'playing');
    };

    const handleSessionUpdated = (session: GameRoom) => {
      setCurrentSession(session);
      setSessionPlayers(session.players);
      setGameStatus(session.status);
    };

    socket.on('session-joined', handleSessionJoined);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('chat-message', handleChatMessage);
    socket.on('game-state-update', handleGameStateUpdate);
    socket.on('session-updated', handleSessionUpdated);

    // Join the session
    socket.emit('join-session', sessionId);

    return () => {
      socket.off('session-joined', handleSessionJoined);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('chat-message', handleChatMessage);
      socket.off('game-state-update', handleGameStateUpdate);
      socket.off('session-updated', handleSessionUpdated);
    };
  }, [socket, sessionId, currentUser.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      type: 'text',
      message: newMessage,
      timestamp: new Date()
    
    };

    socket.emit('send-chat-message', newMessage);
    setNewMessage('');
  };

  const handleStartGame = () => {
    if (!socket || !isHost) return;
    socket.emit('start-game', sessionId);
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-session', sessionId);
    }
    onLeaveRoom();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!currentSession) {
    return (
      <RoomContainer>
        <GameArea>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ color: '#fff', fontSize: '1.2rem' }}>Loading room...</div>
          </div>
        </GameArea>
      </RoomContainer>
    );
  }

  return (
    <RoomContainer>
      <GameArea>
        <RoomHeader>
          <RoomTitle>
            {games.find(g => g.slug === currentSession.gameType)?.title || currentSession.gameType}
          </RoomTitle>
          <LeaveButton onClick={handleLeaveRoom}>
            Leave Room
          </LeaveButton>
        </RoomHeader>

        <PlayersInfo>
          {sessionPlayers.map(player => (
            <PlayerChip key={player.id} $isHost={player.id === currentSession?.host?.id}>
              {player.id === currentSession?.host?.id && '👑'}
              {player.displayName}
            </PlayerChip>
          ))}
          {sessionSpectators.length > 0 && (
            <PlayerChip $isHost={false}>
              👁️ {sessionSpectators.length} spectator(s)
            </PlayerChip>
          )}
        </PlayersInfo>

        <GameCanvas>
          {gameStatus === 'waiting' ? (
            <div>
              <GameStatus>
                <div>Game starting soon...</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '10px' }}>
                  Waiting for {sessionPlayers.length}/{currentSession?.maxPlayers || 2} players
                </div>
              </GameStatus>
              {isHost && sessionPlayers.length >= 2 && (
                <StartGameButton onClick={handleStartGame}>
                  Start Game
                </StartGameButton>
              )}
            </div>
          ) : (
            <GameStatus>
              Game in progress...
            </GameStatus>
          )}
        </GameCanvas>
      </GameArea>

      <Sidebar>
        <ChatContainer>
          <ChatTitle>Chat</ChatTitle>
          <ChatMessages ref={chatMessagesRef}>
            {chatMessages.map(message => (
              <ChatMessage key={message.id} $isSystem={message.type === 'system'}>
                {message.type === 'system' ? (
                  <span>{message.message}</span>
                ) : (
                  <span>
                    <ChatUser>{message.senderName}:</ChatUser> {message.message}
                  </span>
                )}
              </ChatMessage>
            ))}
          </ChatMessages>
          <ChatInput>
            <MessageInput
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={200}
            />
            <SendButton
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              Send
            </SendButton>
          </ChatInput>
        </ChatContainer>
      </Sidebar>
    </RoomContainer>
  );
};

export default GameRoom;
