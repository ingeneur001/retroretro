import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModeDetection } from '../../../hooks/useModeDetection';
import { GameNavigation, GameNavigationPresets } from '../shared/GameNavigation';
import { useSocket } from '../../../hooks/useSocket';
import { ConnectionState } from '../../../types/multiplayer';
import styled, { css } from 'styled-components';

// Styled Components
const ZoneContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  padding: 2rem;
  font-family: 'Orbitron', monospace;
`;

const ZoneHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const ZoneTitle = styled.h1`
  font-size: 3rem;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ZoneSubtitle = styled.p`
  font-size: 1.2rem;
  color: #b0b0b0;
  max-width: 600px;
  margin: 0 auto;
`;

const ConnectionStatus = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem auto;
  padding: 1rem 2rem;
  border-radius: 25px;
  max-width: 400px;
  background: ${props => 
    props.status === 'connected' ? 'rgba(76, 175, 80, 0.2)' :
    props.status === 'connecting' ? 'rgba(255, 193, 7, 0.2)' :
    'rgba(244, 67, 54, 0.2)'
  };
  border: 1px solid ${props => 
    props.status === 'connected' ? '#4CAF50' :
    props.status === 'connecting' ? '#FFC107' :
    '#F44336'
  };
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1.5rem;
  }
`;

// ✅ GEÄNDERT: Minimale Game Card mit roten Neon-Effekten für Multiplayer
const GameCard = styled.div<{ enabled: boolean }>`
  background: rgba(40, 0, 0, 0.8);
  border: 3px solid ${props => props.enabled ? '#ff4757' : '#666'};
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: ${props => props.enabled ? 'pointer' : 'not-allowed'};
  transition: all 0.4s ease;
  opacity: ${props => props.enabled ? 1 : 0.6};
  position: relative;
  overflow: hidden;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 0 15px ${props => props.enabled ? 'rgba(255, 71, 87, 0.2)' : 'rgba(102, 102, 102, 0.2)'};

  ${props => props.enabled && css`
    &:hover {
      background: rgba(40, 0, 0, 0.95);
      transform: translateY(-8px) scale(1.02);
      border-color: #ff4757;
      box-shadow: 
        0 0 30px rgba(255, 71, 87, 0.7),
        0 0 60px rgba(255, 71, 87, 0.5),
        0 0 100px rgba(255, 71, 87, 0.3),
        0 15px 35px rgba(0, 0, 0, 0.3);
      
      &::before {
        opacity: 1;
      }
      
      &::after {
        opacity: 0.8;
      }
      
      /* Icon Neon-Effekt */
      ${GameIcon} {
        filter: drop-shadow(0 0 15px #ff4757) 
                drop-shadow(0 0 25px rgba(255, 71, 87, 0.7));
        transform: scale(1.1);
      }
      
      /* Title Neon-Effekt */
      ${GameTitle} {
        color: #ff4757;
        text-shadow: 
          0 0 15px #ff4757,
          0 0 30px rgba(255, 71, 87, 0.7),
          0 0 45px rgba(255, 71, 87, 0.5);
        transform: scale(1.05);
      }
    }
  `}

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      rgba(255, 71, 87, 0.5), 
      transparent, 
      rgba(255, 71, 87, 0.5), 
      transparent, 
      rgba(255, 71, 87, 0.5)
    );
    border-radius: 15px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, 
      rgba(255, 71, 87, 0.1) 0%, 
      transparent 70%
    );
    border-radius: 15px;
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
`;

const GameIcon = styled.div`
  font-size: 4rem;
  margin: 0;
  filter: none;
  transition: all 0.4s ease;
`;

const GameTitle = styled.h3<{ enabled: boolean }>`
  font-size: 1.8rem;
  margin: 0;
  color: ${props => props.enabled ? '#ff4757' : '#666'};
  text-shadow: ${props => props.enabled ? '0 0 10px rgba(255, 71, 87, 0.3)' : 'none'};
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  transition: all 0.4s ease;
`;

const ComingSoonSection = styled.div`
  margin-top: 4rem;
`;

const ComingSoonHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h2 {
    color: #ff9800;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #ffcc80;
    font-size: 1rem;
    margin: 0;
  }
`;

// ✅ GEÄNDERT: Coming Soon Cards mit orangem Neon-Effekt
const ComingSoonTitle = styled.h3`
  font-size: 1.8rem;
  margin: 0;
  color: #ff9800;
  text-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  transition: all 0.4s ease;
`;

const ComingSoonCard = styled.div`
  background: rgba(40, 20, 0, 0.8);
  border: 3px solid #ff9800;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: not-allowed;
  transition: all 0.4s ease;
  opacity: 0.7;
  position: relative;
  overflow: hidden;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 0 15px rgba(255, 152, 0, 0.2);

  &:hover {
    background: rgba(40, 20, 0, 0.95);
    transform: translateY(-8px) scale(1.02);
    border-color: #ff9800;
    box-shadow: 
      0 0 30px rgba(255, 152, 0, 0.7),
      0 0 60px rgba(255, 152, 0, 0.5),
      0 0 100px rgba(255, 152, 0, 0.3),
      0 15px 35px rgba(0, 0, 0, 0.3);
    
    ${GameIcon} {
      filter: drop-shadow(0 0 15px #ff9800) 
              drop-shadow(0 0 25px rgba(255, 152, 0, 0.7));
      transform: scale(1.1);
    }
    
    ${ComingSoonTitle} {
      color: #ff9800;
      text-shadow: 
        0 0 15px #ff9800,
        0 0 30px rgba(255, 152, 0, 0.7),
        0 0 45px rgba(255, 152, 0, 0.5);
      transform: scale(1.05);
    }
  }
`;

// Game Data Interface
interface MultiplayerGame {
  id: string;
  title: string;
  icon: string;
  description: string;
  path: string;
  enabled: boolean;
  comingSoon?: boolean;
}

interface MultiplayerZoneProps {}

const MultiplayerZone: React.FC<MultiplayerZoneProps> = () => {
  const navigate = useNavigate();
  const { mode } = useModeDetection();
  
  // Multiplayer Games Configuration
  const multiplayerGames: MultiplayerGame[] = [
    {
      id: 'pong',
      title: 'Pong Battle',
      icon: '🏓',
      description: 'The classic that started it all! Challenge a friend to an intense Pong duel.',
      path: '/games/multiplayer/pong',
      enabled: true
    }
  ];

  // Coming Soon Games
  const comingSoonGames: MultiplayerGame[] = [
    {
      id: 'snake-battle',
      title: 'Snake Battle',
      icon: '🐍',
      description: 'Competitive snake battles with power-ups and obstacles.',
      path: '/games/multiplayer/snake',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'tetris-vs',
      title: 'Tetris Versus',
      icon: '🧩',
      description: 'Send garbage blocks to your opponent in this competitive Tetris variant.',
      path: '/games/multiplayer/tetris',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'space-wars',
      title: 'Space Wars',
      icon: '🚀',
      description: 'Real-time space combat with customizable ships and weapons.',
      path: '/games/multiplayer/space',
      enabled: false,
      comingSoon: true
    }
  ];

  const handleGameClick = (game: MultiplayerGame) => {
    if (game.enabled) {
      console.log(`🎮 Starting ${game.title}`);
      navigate(game.path);
    } else {
      console.log(`🚫 ${game.title} not available yet`);
    }
  };

  return (
    <ZoneContainer>
      <ZoneHeader>
        <ZoneTitle>👥 MULTIPLAYER ZONE</ZoneTitle>
        <ZoneSubtitle>
          Challenge friends in real-time battles! Experience the thrill of competitive retro gaming.
        </ZoneSubtitle>
      </ZoneHeader>

      {/* ✅ GEÄNDERT: Minimale Available Games - nur Icon + Titel mit roten Neon-Effekten */}
      <GamesGrid>
        {multiplayerGames.map(game => (
          <GameCard
            key={game.id}
            enabled={game.enabled}
            onClick={() => handleGameClick(game)}
          >
            <GameIcon>{game.icon}</GameIcon>
            <GameTitle enabled={game.enabled}>{game.title}</GameTitle>
          </GameCard>
        ))}
      </GamesGrid>

      {/* ✅ GEÄNDERT: Coming Soon Games - nur Icon + Titel mit orangem Neon */}
      {comingSoonGames.length > 0 && (
        <ComingSoonSection>
          <ComingSoonHeader>
            <h2>🚀 Coming Soon</h2>
            <p>Exciting multiplayer games in development</p>
          </ComingSoonHeader>
          
          <GamesGrid>
            {comingSoonGames.map(game => (
              <ComingSoonCard key={game.id}>
                <GameIcon>{game.icon}</GameIcon>
                <ComingSoonTitle>{game.title}</ComingSoonTitle>
              </ComingSoonCard>
            ))}
          </GamesGrid>
        </ComingSoonSection>
      )}

      {/* Navigation */}
      <GameNavigation {...GameNavigationPresets.gameZone('Multiplayer Zone')} />
    </ZoneContainer>
  );
};

export default MultiplayerZone;