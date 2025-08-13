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
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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

// ✅ GEÄNDERT: Minimale Card mit Neon-Effekt
const ZoneCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['enabled', 'zoneColor'].includes(prop),
})<{ enabled: boolean; zoneColor: string }>`
  background: rgba(0, 20, 40, 0.8);
  border: 3px solid ${props => props.enabled ? props.zoneColor : '#666'};
  border-radius: 15px;
  padding: 1.5rem;               /* ✅ REDUZIERT: war 2rem */
  text-align: center;
  cursor: ${props => props.enabled ? 'pointer' : 'not-allowed'};
  transition: all 0.4s ease;
  opacity: ${props => props.enabled ? 1 : 0.6};
  position: relative;
  overflow: hidden;
  height: 160px;                 /* ✅ REDUZIERT: war 200px */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;                     /* ✅ REDUZIERT: war 1.5rem */
  box-shadow: 0 0 15px ${props => props.enabled ? `${props.zoneColor}33` : 'rgba(102, 102, 102, 0.2)'};
  ${props => props.enabled && css`
    &:hover {
      background: rgba(0, 20, 40, 0.95);
      transform: translateY(-8px) scale(1.02);
      border-color: ${props.zoneColor};
      box-shadow: 
        0 0 30px ${props.zoneColor}aa,
        0 0 60px ${props.zoneColor}77,
        0 0 100px ${props.zoneColor}44,
        0 15px 35px rgba(0, 0, 0, 0.3);
      
      &::before {
        opacity: 1;
      }
      
      &::after {
        opacity: 0.8;
      }
      
      /* Icon Neon-Effekt */
      ${ZoneIcon} {
        filter: drop-shadow(0 0 15px ${props.zoneColor}) 
                drop-shadow(0 0 25px ${props.zoneColor}aa);
        transform: scale(1.1);
      }
      
      /* Title Neon-Effekt */
      ${ZoneTitle} {
        color: ${props.zoneColor};
        text-shadow: 
          0 0 15px ${props.zoneColor},
          0 0 30px ${props.zoneColor}aa,
          0 0 45px ${props.zoneColor}77;
        transform: scale(1.05);
      }
    }
  `}
`;

const ZoneTitle = styled.h3.withConfig({
  shouldForwardProp: (prop) => !['enabled', 'zoneColor'].includes(prop),
})<{ enabled: boolean; zoneColor: string }>`
  font-size: 1.3rem;  // ✅ NUR DIESE ZEILE GEÄNDERT
  margin: 0;
  color: ${props => props.enabled ? props.zoneColor : '#666'};
  text-shadow: ${props => props.enabled ? `0 0 10px ${props.zoneColor}55` : 'none'};
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  transition: all 0.4s ease;
`;

// Nach der ZoneTitle Komponente hinzufügen:
const ZoneIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['enabled', 'zoneColor'].includes(prop),
})<{ enabled: boolean; zoneColor: string }>`
  font-size: 3rem;               /* ✅ Kleiner: war vermutlich 4rem */
  margin: 0;
  filter: ${props => 'none'};
  transition: all 0.4s ease;
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

// In GamesZoneHub.tsx - ServerStatus Breite anpassen:
const ServerStatus = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #00ff00;  // oder welche Farbe auch immer
  border-radius: 15px;
  padding: 2rem;
  width: 100%;                    
  max-width: 700px;              // ✅ Gleiche Breite wie andere Zonen
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.5),
    0 0 40px rgba(0, 255, 0, 0.3);
  // ... rest der Styles

  @media (max-width: 768px) {
    width: 90%;                   
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

      {/* ✅ GEÄNDERT: Minimale 3-Zonen Grid - nur Icon + Titel mit Neon-Effekt */}
      <ZoneGrid>
        {gameZones.map((zone) => (
          <ZoneCard
            key={zone.id}
            enabled={zone.enabled}
            zoneColor={zone.color}
            onClick={() => handleZoneClick(zone)}
          >
            <ZoneIcon enabled={zone.enabled} zoneColor={zone.color}>
              {zone.icon}
            </ZoneIcon>
            <ZoneTitle enabled={zone.enabled} zoneColor={zone.color}>
              {zone.title}
            </ZoneTitle>
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