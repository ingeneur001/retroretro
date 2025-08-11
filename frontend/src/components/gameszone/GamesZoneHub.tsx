import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useModeDetection, useGameZoneFeatures } from '../../hooks/useModeDetection';
import { getZoneAvailability, ZONE_CONFIGS } from '../../config/gameszone.config';

// Animations für Retro-Design
const neonPulseGreen = keyframes`
  0% {
    text-shadow: 
      0 0 10px #00ff00,
      0 0 20px #00ff00,
      0 0 30px #00ff00;
  }
  100% {
    text-shadow: 
      0 0 5px #00ff00,
      0 0 10px #00ff00,
      0 0 15px #00ff00;
  }
`;

const neonPulseGames = keyframes`
  0% {
    text-shadow: 
      0 0 15px #00ff88,
      0 0 30px #00ff88,
      0 0 45px #00ff88,
      0 0 60px #00ff88;
  }
  100% {
    text-shadow: 
      0 0 8px #00ff88,
      0 0 15px #00ff88,
      0 0 25px #00ff88,
      0 0 35px #00ff88;
  }
`;

const boxColorChange = keyframes`
  0% {
    border-color: #00ffff;
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(0, 255, 255, 0.5);
  }
  25% {
    border-color: #00ff88;
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.8),
      0 0 40px rgba(0, 255, 136, 0.5);
  }
  50% {
    border-color: #ff00ff;
    box-shadow: 
      0 0 20px rgba(255, 0, 255, 0.8),
      0 0 40px rgba(255, 0, 255, 0.5);
  }
  75% {
    border-color: #ffff00;
    box-shadow: 
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(255, 255, 0, 0.5);
  }
  100% {
    border-color: #00ffff;
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(0, 255, 255, 0.5);
  }
`;

const neonPulseYellow = keyframes`
  0% {
    text-shadow: 
      0 0 5px #ffff00,
      0 0 10px #ffff00,
      0 0 15px #ffff00;
  }
  100% {
    text-shadow: 
      0 0 3px #ffff00,
      0 0 6px #ffff00,
      0 0 9px #ffff00;
  }
`;

// Styled Components
const Container = styled.div`
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
`;

const OnlineStatus = styled.div`
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 2px solid #00ff00;
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
  text-shadow: 
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 30px #00ff00;
  animation: ${neonPulseGreen} 2s infinite alternate;
`;

const MainTitle = styled.div`
  text-align: center;
  margin: 3rem 0;

  h1 {
    font-size: 6rem;
    font-weight: bold;
    color: #00ff88;
    text-shadow: 
      0 0 15px #00ff88,
      0 0 30px #00ff88,
      0 0 45px #00ff88,
      0 0 60px #00ff88;
    letter-spacing: 0.3rem;
    animation: ${neonPulseGames} 2s infinite alternate;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 3.5rem;
    }
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 3rem 0;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

const NavButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
})<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(0, 255, 255, 0.2)' : 'transparent'};
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  min-width: 100px;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 8px #00ffff;
  box-shadow: ${props => props.active ? 
    '0 0 20px rgba(0, 255, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.3)' :
    '0 0 8px rgba(0, 255, 255, 0.3), inset 0 0 8px rgba(0, 255, 255, 0.1)'
  };
  white-space: nowrap;

  &:hover {
    background: rgba(0, 255, 255, 0.1);
    text-shadow: 
      0 0 8px #00ffff,
      0 0 15px #00ffff,
      0 0 25px #00ffff;
    box-shadow: 
      0 0 15px rgba(0, 255, 255, 0.6),
      inset 0 0 15px rgba(0, 255, 255, 0.2);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    min-width: 80px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const ZoneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1.5rem;
  }
`;

const ZoneCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['enabled', 'zoneColor'].includes(prop),
})<{ enabled: boolean; zoneColor: string }>`
  background: rgba(0, 20, 40, 0.8);
  border: 3px solid ${props => props.enabled ? props.zoneColor : '#666'};
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: ${props => props.enabled ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  opacity: ${props => props.enabled ? 1 : 0.6};
  position: relative;
  overflow: hidden;

  ${props => props.enabled && css`
    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 30px ${props.zoneColor}66;
      border-color: ${props.zoneColor};
    }
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${props => props.zoneColor}22, transparent);
    transition: left 0.6s ease;
  }

  ${props => props.enabled && css`
    &:hover::before {
      left: 100%;
    }
  `}
`;

const ZoneIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: ${props => 'none'};
`;

const ZoneTitle = styled.h3.withConfig({
  shouldForwardProp: (prop) => !['enabled', 'zoneColor'].includes(prop),
})<{ enabled: boolean; zoneColor: string }>`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: ${props => props.enabled ? props.zoneColor : '#666'};
  text-shadow: ${props => props.enabled ? `0 0 10px ${props.zoneColor}` : 'none'};
  text-transform: uppercase;
  letter-spacing: 0.1rem;
`;

const ZoneDescription = styled.p.withConfig({
  shouldForwardProp: (prop) => !['enabled'].includes(prop),
})<{ enabled: boolean }>`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: ${props => props.enabled ? '#fff' : '#999'};
  line-height: 1.4;
`;

const ZoneStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => !['enabled', 'isDemo'].includes(prop),
})<{ enabled: boolean; isDemo: boolean }>`
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  background: ${props => {
    if (!props.enabled) return 'rgba(255, 0, 0, 0.2)';
    if (props.isDemo) return 'rgba(255, 255, 0, 0.2)';
    return 'rgba(0, 255, 0, 0.2)';
  }};
  color: ${props => {
    if (!props.enabled) return '#ff6666';
    if (props.isDemo) return '#ffff66';
    return '#66ff66';
  }};
  border: 1px solid ${props => {
    if (!props.enabled) return '#ff6666';
    if (props.isDemo) return '#ffff66';
    return '#66ff66';
  }};
  font-weight: bold;
  text-transform: uppercase;
`;

const EnterButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['enabled', 'zoneColor'].includes(prop),
})<{ enabled: boolean; zoneColor: string }>`
  background: ${props => props.enabled ? 
    `linear-gradient(45deg, ${props.zoneColor}, ${props.zoneColor}cc)` : 
    'linear-gradient(45deg, #333, #666)'
  };
  color: ${props => props.enabled ? '#000' : '#999'};
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: ${props => props.enabled ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;

  ${props => props.enabled && css`
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px ${props.zoneColor}66;
    }

    &:active {
      transform: scale(0.95);
    }
  `}
`;

const ContentArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ServerStatus = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #00ffff;
  border-radius: 15px;
  padding: 2rem;
  min-width: 400px;
  animation: ${boxColorChange} 3s infinite;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
    max-width: 500px;
  }
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  padding: 0.5rem 0;
`;

const StatusLabel = styled.span`
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff;
  font-weight: bold;
`;

const StatusValue = styled.span.withConfig({
  shouldForwardProp: (prop) => !['type'].includes(prop),
})<{ type: 'players' | 'uptime' | 'version' }>`
  font-weight: bold;
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor;
  
  ${props => props.type === 'players' && css`
    color: #ffff00;
    text-shadow: 
      0 0 5px #ffff00,
      0 0 10px #ffff00,
      0 0 15px #ffff00;
    animation: ${neonPulseYellow} 2s infinite alternate;
  `}
  
  ${props => (props.type === 'uptime' || props.type === 'version') && css`
    color: #00ff00;
    text-shadow: 
      0 0 5px #00ff00,
      0 0 10px #00ff00;
  `}
`;

// Game Zone Interface
interface GameZone {
  id: 'singleplayer' | 'multiplayer' | 'arcade';
  title: string;
  icon: string;
  description: string;
  color: string;
  path: string;
  enabled: boolean;
  status: string;
  gameCount: number;
}

// Server Status Interface
interface ServerStatusData {
  playersOnline: number;
  uptime: string;
  version: string;
}

// Main Component
const GamesZoneHub: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useModeDetection();
  const gameZoneFeatures = useGameZoneFeatures();
  
  // Get zone availability from config
  const zoneAvailability = getZoneAvailability(mode);
  
  // Server Status
  const [serverStatus] = useState<ServerStatusData>({
    playersOnline: 4,
    uptime: '2h 15m',
    version: '1.0.0'
  });

  // Game Zones basierend auf Mode und Config
  const getGameZones = (): GameZone[] => {
    return [
      {
        id: 'singleplayer',
        title: ZONE_CONFIGS.singleplayer.title,
        icon: ZONE_CONFIGS.singleplayer.icon,
        description: ZONE_CONFIGS.singleplayer.description,
        color: ZONE_CONFIGS.singleplayer.color,
        path: ZONE_CONFIGS.singleplayer.path,
        enabled: zoneAvailability.singleplayer.enabled,
        status: zoneAvailability.singleplayer.enabled ? 
          (mode === 'demo' ? 'Basic Access' : 'Available') : 'Disabled',
        gameCount: zoneAvailability.singleplayer.games
      },
      {
        id: 'multiplayer',
        title: ZONE_CONFIGS.multiplayer.title,
        icon: ZONE_CONFIGS.multiplayer.icon,
        description: ZONE_CONFIGS.multiplayer.description,
        color: ZONE_CONFIGS.multiplayer.color,
        path: ZONE_CONFIGS.multiplayer.path,
        enabled: zoneAvailability.multiplayer.enabled,
        status: zoneAvailability.multiplayer.enabled ? 
          (mode === 'production' ? 'Full Features' : 'Limited') : 
          (mode === 'demo' ? 'Demo Restricted' : 'Disabled'),
        gameCount: zoneAvailability.multiplayer.games
      },
      {
        id: 'arcade',
        title: ZONE_CONFIGS.arcade.title,
        icon: ZONE_CONFIGS.arcade.icon,
        description: ZONE_CONFIGS.arcade.description,
        color: ZONE_CONFIGS.arcade.color,
        path: ZONE_CONFIGS.arcade.path,
        enabled: zoneAvailability.arcade.enabled,
        status: zoneAvailability.arcade.enabled ? 
          (mode === 'demo' ? 'Basic Games' : 'Available') : 'Disabled',
        gameCount: zoneAvailability.arcade.games
      }
    ];
  };

  const gameZones = getGameZones();

  const handleZoneClick = (zone: GameZone) => {
    if (zone.enabled) {
      console.log(`🎯 Navigating to zone: ${zone.path}`);
      navigate(zone.path);
    } else {
      // Alert für gesperrte Features
      alert(`${zone.title} is not available in ${mode.toUpperCase()} mode!\n\nUpgrade to access this feature.`);
    }
  };

  const handleNavigation = (path: string) => {
    console.log(`🧭 Navigation button clicked: ${path}`);
    navigate(path);
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <div></div>
        <OnlineStatus>● ONLINE</OnlineStatus>
      </Header>

      {/* Main Title */}
      <MainTitle>
        <h1>GAMES ZONE</h1>
      </MainTitle>

      {/* Navigation - nur HOME Button */}
      <Navigation>
        <NavButton onClick={() => handleNavigation('/')}>
          HOME
        </NavButton>
      </Navigation>

      {/* 3-Zonen Grid */}
      <ZoneGrid>
        {gameZones.map((zone) => (
          <ZoneCard
            key={zone.id}
            enabled={zone.enabled}
            zoneColor={zone.color}
            onClick={() => handleZoneClick(zone)}
          >
            <ZoneIcon>{zone.icon}</ZoneIcon>
            <ZoneTitle enabled={zone.enabled} zoneColor={zone.color}>
              {zone.title}
            </ZoneTitle>
            <ZoneStatus enabled={zone.enabled} isDemo={mode === 'demo'}>
              {zone.status} • {zone.gameCount} Games
            </ZoneStatus>
            <ZoneDescription enabled={zone.enabled}>
              {zone.description}
            </ZoneDescription>

            <EnterButton
              enabled={zone.enabled}
              zoneColor={zone.color}
              onClick={(e) => {
                e.stopPropagation();
                handleZoneClick(zone);
              }}
            >
              {zone.enabled ? 'Enter Zone' : 'Restricted'}
            </EnterButton>
          </ZoneCard>
        ))}
      </ZoneGrid>

      {/* Server Status Box */}
      <ContentArea>
        <ServerStatus>
          <StatusRow>
            <StatusLabel>Players Online:</StatusLabel>
            <StatusValue type="players">{serverStatus.playersOnline}</StatusValue>
          </StatusRow>
          
          <StatusRow>
            <StatusLabel>Server Uptime:</StatusLabel>
            <StatusValue type="uptime">{serverStatus.uptime}</StatusValue>
          </StatusRow>
          
          <StatusRow>
            <StatusLabel>Version:</StatusLabel>
            <StatusValue type="version">{serverStatus.version}</StatusValue>
          </StatusRow>

          {gameZoneFeatures.debug && (
            <StatusRow>
              <StatusLabel>Mode:</StatusLabel>
              <StatusValue type="version">{mode.toUpperCase()}</StatusValue>
            </StatusRow>
          )}
        </ServerStatus>
      </ContentArea>
    </Container>
  );
};

export default GamesZoneHub;