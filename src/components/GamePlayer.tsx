// 1. React & Libraries
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// 2. Game Components
import SnakeGame from './gameszone/singleplayer/SnakeGame';
import MemoryGame from './gameszone/singleplayer/MemoryGame';
import PongGame from './gameszone/singleplayer/PongGame';
import TetrisGame from './gameszone/singleplayer/TetrisGame';

// 3. User System
import { UserManager } from './interfaces/user/UserManager';

// Animationen
const gameGlow = keyframes`
  0%, 100% { box-shadow: 0 0 10px #00ffff; }
  50% { box-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const GamePlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 2rem auto;
  padding: 20px;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #00ffff;
  border-radius: 15px;
  animation: ${gameGlow} 3s ease-in-out infinite;
`;

const GameTitle = styled.h2`
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.8rem;
  text-align: center;
  font-weight: 700;
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  background: ${props => 
    props.active 
      ? 'linear-gradient(45deg, #ff6b9d, #ff8e8e)' 
      : 'linear-gradient(45deg, #00ffff, #0099cc)'};
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-family: 'Orbitron', monospace;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 157, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const GameSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const GameCard = styled.div<{ selected: boolean }>`
  background: ${props => props.selected ? 
    'linear-gradient(145deg, #00ffff20, #ff00ff20)' : 
    'linear-gradient(145deg, #1a1a2e, #16213e)'};
  border: 2px solid ${props => props.selected ? '#00ffff' : '#666'};
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
  }

  h4 {
    color: #00ffff;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }

  p {
    color: #ccc;
    font-size: 0.9rem;
    margin: 0;
  }

  .game-status {
    margin-top: 8px;
    font-size: 0.8rem;
    color: #00ff00;
    font-weight: bold;
  }
`;

const GameContainer = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
`;

const WelcomeScreen = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  border-radius: 15px;
  animation: ${fadeIn} 0.5s ease-out;
  
  h3 {
    color: #00ffff;
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  p {
    color: #ffffff;
    font-size: 1.1rem;
    margin: 15px 0;
    line-height: 1.6;
  }
  
  .feature-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin: 30px 0;
    
    .feature {
      background: rgba(255, 107, 157, 0.1);
      border: 1px solid #ff6b9d;
      border-radius: 10px;
      padding: 15px;
      
      h4 {
        color: #ff6b9d;
        margin-bottom: 8px;
      }
      
      p {
        font-size: 0.9rem;
        margin: 0;
      }
    }
  }
`;

// Game-Daten
interface GameData {
  id: string;
  name: string;
  description: string;
  type: 'arcade' | 'puzzle';
  component: React.ComponentType;
}

const availableGames: GameData[] = [
  {
    id: 'snake',
    name: '🐍 Snake Game',
    description: 'Classic snake with modern graphics!',
    type: 'arcade',
    component: SnakeGame
  },
  {
    id: 'memory',
    name: '🧠 Memory Game',
    description: 'Test your memory with cards',
    type: 'puzzle',
    component: MemoryGame
  },
  {
    id: 'pong',
    name: '🏓 Pong Game',
    description: 'Classic arcade tennis simulation',
    type: 'arcade',
    component: PongGame
  },
  {
    id: 'tetris',
    name: '🧩 Tetris Game',
    description: 'Ultimate block-stacking puzzle',
    type: 'puzzle',
    component: TetrisGame
  }
];

// Views
type ViewType = 'welcome' | 'games' | 'profile';

// GamePlayer Component
const GamePlayer: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('welcome');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const selectGame = (gameId: string) => {
    setSelectedGame(gameId);
    console.log(`🎮 Selected game: ${gameId}`);
  };

  const renderWelcomeScreen = () => (
    <WelcomeScreen>
      <h3>🎮 Welcome to Retro Gaming Experience!</h3>
      <p>Your ultimate destination for classic arcade and puzzle games!</p>
      
      <div className="feature-list">
        <div className="feature">
          <h4>🎯 4 Complete Games</h4>
          <p>Snake, Memory, Pong, and Tetris - all with modern graphics and smooth gameplay</p>
        </div>
        
        <div className="feature">
          <h4>👤 User Profiles</h4>
          <p>Create your profile, track high scores, and unlock achievements</p>
        </div>
        
        <div className="feature">
          <h4>🏆 Leaderboards</h4>
          <p>Compete with other players and climb the rankings</p>
        </div>
        
        <div className="feature">
          <h4>🎨 Retro Design</h4>
          <p>Beautiful neon aesthetics with smooth animations and effects</p>
        </div>
      </div>
      
      <p>Choose <strong>Games</strong> to start playing or <strong>Profile</strong> to manage your account!</p>
    </WelcomeScreen>
  );

  const renderGameSelector = () => (
    <>
      <GameSelector>
        {availableGames.map((game) => (
          <GameCard
            key={game.id}
            selected={selectedGame === game.id}
            onClick={() => selectGame(game.id)}
          >
            <h4>{game.name}</h4>
            <p>{game.description}</p>
            <div className="game-status">
              {game.type === 'arcade' ? '⚡ Arcade' : '🧩 Puzzle'}
            </div>
          </GameCard>
        ))}
      </GameSelector>
      
      {selectedGame && (
        <GameContainer>
          {(() => {
            const game = availableGames.find(g => g.id === selectedGame);
            if (!game) return null;
            
            const GameComponent = game.component;
            return <GameComponent />;
          })()}
        </GameContainer>
      )}
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'welcome':
        return renderWelcomeScreen();
      case 'games':
        return renderGameSelector();
      case 'profile':
        return <UserManager />;
      default:
        return renderWelcomeScreen();
    }
  };

  return (
    <GamePlayerContainer>
      <GameTitle>🕹️ Retro Gaming Experience v3.0</GameTitle>
      
      {/* Navigation */}
      <NavigationTabs>
        <TabButton
          active={currentView === 'welcome'}
          onClick={() => setCurrentView('welcome')}
        >
          🏠 Home
        </TabButton>
        <TabButton
          active={currentView === 'games'}
          onClick={() => setCurrentView('games')}
        >
          🎮 Games
        </TabButton>
        <TabButton
          active={currentView === 'profile'}
          onClick={() => setCurrentView('profile')}
        >
          👤 Profile
        </TabButton>
      </NavigationTabs>

      {/* Content */}
      {renderContent()}

      {/* Footer */}
      <div style={{ 
        color: '#00ffff', 
        textAlign: 'center', 
        fontSize: '0.9rem', 
        marginTop: '30px',
        opacity: 0.7 
      }}>
        <p>🎯 <strong>Retro Gaming Experience</strong> - Where classic meets modern</p>
        <p>🎮 4 Games | 👤 User Profiles | 🏆 Leaderboards | 🎨 Retro Design</p>
      </div>
    </GamePlayerContainer>
  );
};

export default GamePlayer;
