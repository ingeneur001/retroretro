import React from 'react';
import styled from 'styled-components';
import GameCard from './GameCard';

// Styled Components
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 2rem;
  max-width: 800px;
  width: 100%;
`;

// Interface für Game-Daten
interface GameData {
  id: string;
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onPlay: () => void;
}

interface GameGridProps {
  games: GameData[];
}

// Vordefinierte Game-Daten
const defaultGames: GameData[] = [
  {
    id: 'classic-arcade',
    icon: '🕹️',
    title: 'Classic Arcade',
    description: 'Play legendary arcade games from the golden age. Pac-Man, Space Invaders, and more classic titles.',
    buttonText: 'PLAY NOW',
    onPlay: () => alert('🎮 Classic Arcade coming soon!')
  },
  {
    id: 'retro-console',
    icon: '🎯',
    title: 'Retro Console',
    description: 'Experience classic console games from NES, SNES, and Genesis. All legally available titles.',
    buttonText: 'PLAY NOW',
    onPlay: () => alert('🎯 Retro Console coming soon!')
  },
  {
    id: 'multiplayer-zone',
    icon: '👥',
    title: 'Multiplayer Zone',
    description: 'Join friends in real-time multiplayer sessions. Compete and have fun together!',
    buttonText: 'JOIN GAME',
    onPlay: () => alert('👥 Multiplayer Zone coming soon!')
  },
  {
    id: 'my-saves',
    icon: '💾',
    title: 'My Saves',
    description: 'Access your saved games and continue your adventures. Cloud saves keep your progress safe.',
    buttonText: 'VIEW SAVES',
    onPlay: () => alert('💾 Save System coming soon!')
  }
];

// GameGrid Component
const GameGrid: React.FC<GameGridProps> = ({ games = defaultGames }) => {
  return (
    <GridContainer>
      {games.map((game) => (
        <GameCard
          key={game.id}
          icon={game.icon}
          title={game.title}
          description={game.description}
          buttonText={game.buttonText}
          onPlay={game.onPlay}
        />
      ))}
    </GridContainer>
  );
};

export default GameGrid;