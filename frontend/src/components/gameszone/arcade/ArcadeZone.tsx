import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModeDetection } from '../../../hooks/useModeDetection';
import { GameNavigation, GameNavigationPresets } from '../shared/GameNavigation';
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
  background: linear-gradient(45deg, #2ed573, #00ff88, #1dd1a1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(46, 213, 115, 0.5);

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

// ✅ Minimale Game Card mit grünen Neon-Effekten für Arcade
const GameCard = styled.div<{ enabled: boolean }>`
  background: rgba(0, 40, 20, 0.8);
  border: 3px solid ${props => props.enabled ? '#2ed573' : '#666'};
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
  box-shadow: 0 0 15px ${props => props.enabled ? 'rgba(46, 213, 115, 0.2)' : 'rgba(102, 102, 102, 0.2)'};

  ${props => props.enabled && css`
    &:hover {
      background: rgba(0, 40, 20, 0.95);
      transform: translateY(-8px) scale(1.02);
      border-color: #2ed573;
      box-shadow: 
        0 0 30px rgba(46, 213, 115, 0.7),
        0 0 60px rgba(46, 213, 115, 0.5),
        0 0 100px rgba(46, 213, 115, 0.3),
        0 15px 35px rgba(0, 0, 0, 0.3);
      
      &::before {
        opacity: 1;
      }
      
      &::after {
        opacity: 0.8;
      }
      
      /* Icon Neon-Effekt */
      ${GameIcon} {
        filter: drop-shadow(0 0 15px #2ed573) 
                drop-shadow(0 0 25px rgba(46, 213, 115, 0.7));
        transform: scale(1.1);
      }
      
      /* Title Neon-Effekt */
      ${GameTitle} {
        color: #2ed573;
        text-shadow: 
          0 0 15px #2ed573,
          0 0 30px rgba(46, 213, 115, 0.7),
          0 0 45px rgba(46, 213, 115, 0.5);
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
      rgba(46, 213, 115, 0.5), 
      transparent, 
      rgba(46, 213, 115, 0.5), 
      transparent, 
      rgba(46, 213, 115, 0.5)
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
      rgba(46, 213, 115, 0.1) 0%, 
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
  color: ${props => props.enabled ? '#2ed573' : '#666'};
  text-shadow: ${props => props.enabled ? '0 0 10px rgba(46, 213, 115, 0.3)' : 'none'};
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  transition: all 0.4s ease;
`;

const PremiumSection = styled.div`
  margin-top: 4rem;
`;

const PremiumHeader = styled.div`
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

// Premium Cards mit orangem Neon-Effekt
const PremiumTitle = styled.h3`
  font-size: 1.8rem;
  margin: 0;
  color: #ff9800;
  text-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  transition: all 0.4s ease;
`;

const PremiumGameCard = styled.div`
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
    
    ${PremiumTitle} {
      color: #ff9800;
      text-shadow: 
        0 0 15px #ff9800,
        0 0 30px rgba(255, 152, 0, 0.7),
        0 0 45px rgba(255, 152, 0, 0.5);
      transform: scale(1.05);
    }
  }
`;

const DemoNotice = styled.div`
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid #ff9800;
  border-radius: 10px;
  padding: 1rem;
  margin: 2rem auto;
  text-align: center;
  max-width: 600px;
  
  h3 {
    color: #ff9800;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0;
    color: #ffcc80;
  }
`;

// Game Data Interface
interface ArcadeGame {
  id: string;
  title: string;
  icon: string;
  description: string;
  path: string;
  enabled: boolean;
  requiresProduction?: boolean;
}

const ArcadeZone: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useModeDetection();

  // Arcade Games Configuration
  const arcadeGames: ArcadeGame[] = [
    {
      id: 'breakout',
      title: 'Breakout',
      icon: '🧱',
      description: 'Classic brick-breaking action! Destroy all blocks with your paddle and ball.',
      path: '/games/arcade/breakout',
      enabled: true
    },
    {
      id: 'space-invaders',
      title: 'Space Invaders',
      icon: '👾',
      description: 'Defend Earth from alien invasion in this legendary shoot-em-up.',
      path: '/games/arcade/space-invaders',
      enabled: true
    },
    {
      id: 'asteroids',
      title: 'Asteroids',
      icon: '☄️',
      description: 'Navigate through asteroid fields and blast them to pieces.',
      path: '/games/arcade/asteroids',
      enabled: true
    },
    {
      id: 'pac-man',
      title: 'Pac-Man',
      icon: '🟡',
      description: 'Chomp dots and avoid ghosts in the ultimate maze game.',
      path: '/games/arcade/pac-man',
      enabled: mode === 'production',
      requiresProduction: true
    },
    {
      id: 'frogger',
      title: 'Frogger',
      icon: '🐸',
      description: 'Help the frog cross busy roads and rivers safely.',
      path: '/games/arcade/frogger',
      enabled: mode === 'production',
      requiresProduction: true
    },
    {
      id: 'centipede',
      title: 'Centipede',
      icon: '🐛',
      description: 'Shoot the centipede as it winds through the mushroom field.',
      path: '/games/arcade/centipede',
      enabled: mode === 'production',
      requiresProduction: true
    },
    {
      id: 'galaga',
      title: 'Galaga',
      icon: '🚀',
      description: 'Advanced space shooter with formation-flying enemies.',
      path: '/games/arcade/galaga',
      enabled: mode === 'production',
      requiresProduction: true
    },
    {
      id: 'donkey-kong',
      title: 'Donkey Kong',
      icon: '🦍',
      description: 'Climb ladders and jump barrels to rescue the princess.',
      path: '/games/arcade/donkey-kong',
      enabled: mode === 'production',
      requiresProduction: true
    }
  ];

  const handleGameClick = (game: ArcadeGame) => {
    if (game.enabled) {
      console.log(`🕹️ Starting ${game.title}`);
      navigate(game.path);
    } else {
      console.log(`🚫 ${game.title} not available in ${mode} mode`);
    }
  };

  const availableGames = arcadeGames.filter(game => 
    mode === 'production' || !game.requiresProduction
  );

  const premiumGames = arcadeGames.filter(game => 
    mode !== 'production' && game.requiresProduction
  );

  return (
    <ZoneContainer>
      {/* Zone Header */}
      <ZoneHeader>
        <ZoneTitle>🕹️ ARCADE ZONE</ZoneTitle>
        <ZoneSubtitle>
          Step into the golden age of gaming! Experience the classics that defined arcade culture.
        </ZoneSubtitle>
      </ZoneHeader>

      {/* Available Games */}
      <GamesGrid>
        {availableGames.map(game => (
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

      {/* Premium Games (Production Only) */}
      {premiumGames.length > 0 && (
        <PremiumSection>
          <PremiumHeader>
            <h2>🔒 Premium Arcade Classics</h2>
            <p>Legendary games available in Production Mode</p>
          </PremiumHeader>
          
          <GamesGrid>
            {premiumGames.map(game => (
              <PremiumGameCard key={game.id}>
                <GameIcon>{game.icon}</GameIcon>
                <PremiumTitle>{game.title}</PremiumTitle>
              </PremiumGameCard>
            ))}
          </GamesGrid>
        </PremiumSection>
      )}

      {/* Demo Mode Notice */}
      {mode === 'demo' && (
        <DemoNotice>
          <h3>🚫 Demo Mode Limitations</h3>
          <p>
            Classic arcade games like Pac-Man, Frogger, and Galaga are available in Production Mode. 
            Upgrade to unlock the full arcade experience!
          </p>
        </DemoNotice>
      )}

      {/* Navigation */}
      <GameNavigation {...GameNavigationPresets.gameZone('Arcade Zone')} />
    </ZoneContainer>
  );
};

export default ArcadeZone;