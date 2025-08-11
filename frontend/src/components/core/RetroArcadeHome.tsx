import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useModeDetection } from '../../hooks/useModeDetection';

// Animations basierend auf der HTML-Version
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

const neonPulse = keyframes`
  0% {
    text-shadow: 
      0 0 15px #00ffff,
      0 0 30px #00ffff,
      0 0 45px #00ffff,
      0 0 60px #00ffff;
  }
  100% {
    text-shadow: 
      0 0 8px #00ffff,
      0 0 15px #00ffff,
      0 0 25px #00ffff,
      0 0 35px #00ffff;
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

// Development Mode Animation für Dashboard Button
const neonPulseOrange = keyframes`
  0% {
    text-shadow: 
      0 0 5px #ff8800,
      0 0 10px #ff8800,
      0 0 15px #ff8800;
    border-color: #ff8800;
    box-shadow: 
      0 0 8px rgba(255, 136, 0, 0.5),
      inset 0 0 8px rgba(255, 136, 0, 0.2);
  }
  100% {
    text-shadow: 
      0 0 8px #ff8800,
      0 0 15px #ff8800,
      0 0 25px #ff8800;
    border-color: #ff8800;
    box-shadow: 
      0 0 15px rgba(255, 136, 0, 0.8),
      inset 0 0 15px rgba(255, 136, 0, 0.3);
  }
`;

// Styled Components - exakt wie HTML
const Container = styled.div`
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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
    color: #00ffff;
    text-shadow: 
      0 0 15px #00ffff,
      0 0 30px #00ffff,
      0 0 45px #00ffff,
      0 0 60px #00ffff;
    letter-spacing: 0.3rem;
    animation: ${neonPulse} 2s infinite alternate;
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
  shouldForwardProp: (prop) => !['active', 'isDevelopment'].includes(prop),
})<{ active?: boolean; isDevelopment?: boolean }>`
  background: ${props => props.active ? 'rgba(0, 255, 255, 0.2)' : 'transparent'};
  border: 2px solid ${props => props.isDevelopment ? '#ff8800' : '#00ffff'};
  color: ${props => props.isDevelopment ? '#ff8800' : '#00ffff'};
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  min-width: 100px;
  text-shadow: ${props => props.isDevelopment ? 
    '0 0 5px #ff8800, 0 0 8px #ff8800' :
    '0 0 5px #00ffff, 0 0 8px #00ffff'
  };
  box-shadow: ${props => {
    if (props.isDevelopment) {
      return props.active ? 
        '0 0 20px rgba(255, 136, 0, 0.8), inset 0 0 20px rgba(255, 136, 0, 0.3)' :
        '0 0 8px rgba(255, 136, 0, 0.3), inset 0 0 8px rgba(255, 136, 0, 0.1)';
    }
    return props.active ? 
      '0 0 20px rgba(0, 255, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.3)' :
      '0 0 8px rgba(0, 255, 255, 0.3), inset 0 0 8px rgba(0, 255, 255, 0.1)';
  }};
  white-space: nowrap;
  animation: ${props => props.isDevelopment ? css`${neonPulseOrange} 2s infinite alternate` : 'none'};

  &:hover {
    background: ${props => props.isDevelopment ? 'rgba(255, 136, 0, 0.1)' : 'rgba(0, 255, 255, 0.1)'};
    text-shadow: ${props => props.isDevelopment ? 
      '0 0 8px #ff8800, 0 0 15px #ff8800, 0 0 25px #ff8800' :
      '0 0 8px #00ffff, 0 0 15px #00ffff, 0 0 25px #00ffff'
    };
    box-shadow: ${props => props.isDevelopment ? 
      '0 0 15px rgba(255, 136, 0, 0.6), inset 0 0 15px rgba(255, 136, 0, 0.2)' :
      '0 0 15px rgba(0, 255, 255, 0.6), inset 0 0 15px rgba(0, 255, 255, 0.2)'
    };
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    min-width: 80px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
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
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.5),
    0 0 40px rgba(0, 255, 255, 0.3);
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

const StatusValue = styled.span<{ type: 'players' | 'uptime' | 'version' | 'mode' }>`
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

  ${props => props.type === 'mode' && css`
    color: #ff8800;
    text-shadow: 
      0 0 5px #ff8800,
      0 0 10px #ff8800;
    text-transform: uppercase;
  `}
`;

// Interface für Server Status
interface ServerStatus {
  playersOnline: number;
  uptime: string;
  version: string;
}

// Haupt-Komponente - mit Dashboard Button
const RetroArcadeHome: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useModeDetection();
  const [activeNav, setActiveNav] = useState('HOME');
  
  // Server Status (kann später durch echte API ersetzt werden)
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    playersOnline: 0,
    uptime: '--',
    version: '--'
  });

  // Simuliere Server Status Updates
  useEffect(() => {
    // Initialer Status
    setServerStatus({
      playersOnline: Math.floor(Math.random() * 10),
      uptime: '2h 15m',
      version: '1.0.0'
    });

    // Update alle 30 Sekunden
    const interval = setInterval(() => {
      setServerStatus(prev => ({
        ...prev,
        playersOnline: Math.floor(Math.random() * 15),
        uptime: `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 60)}m`
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Navigation Handler
  const handleNavClick = (navItem: string, path?: string) => {
    console.log(`🧭 RetroArcade Navigation: ${navItem}`);
    setActiveNav(navItem);
    
    switch (navItem) {
      case 'HOME':
        console.log('Already on HOME - no navigation');
        break;
      case 'GAMES':
        console.log('Navigating to GAMES ZONE');
        navigate('/games');
        break;
      case 'PROFILE':
        console.log('Navigating to PROFILE');
        navigate('/profile');
        break;
      case 'SCORES':
        console.log('Navigating to SCORES');
        navigate('/score');
        break;
      case 'SETTINGS':
        console.log('Navigating to SETTINGS');
        navigate('/settings');
        break;
      case 'DASHBOARD':
        console.log('Navigating to DASHBOARD (Development Mode)');
        navigate('/dashboard');
        break;
      default:
        console.log(`Unknown navigation: ${navItem}`);
    }
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
        <h1>RETRO ARCADE</h1>
      </MainTitle>

      {/* Navigation - mit Development Dashboard Button */}
      <Navigation>
        <NavButton 
          active={activeNav === 'HOME'}
          onClick={() => handleNavClick('HOME')}
        >
          HOME
        </NavButton>
        <NavButton 
          active={activeNav === 'GAMES'}
          onClick={() => handleNavClick('GAMES')}
        >
          GAMES
        </NavButton>
        <NavButton 
          active={activeNav === 'PROFILE'}
          onClick={() => handleNavClick('PROFILE')}
        >
          PROFILE
        </NavButton>
        <NavButton 
          active={activeNav === 'SCORES'}
          onClick={() => handleNavClick('SCORES')}
        >
          SCORES
        </NavButton>
        <NavButton 
          active={activeNav === 'SETTINGS'}
          onClick={() => handleNavClick('SETTINGS')}
        >
          SETTINGS
        </NavButton>
        
        {/* Dashboard Button - nur im Development Mode */}
        {mode === 'development' && (
          <NavButton 
            active={activeNav === 'DASHBOARD'}
            onClick={() => handleNavClick('DASHBOARD')}
            isDevelopment={true}
          >
            DASHBOARD
          </NavButton>
        )}
      </Navigation>

      {/* Server Status Box - mit Mode-Anzeige */}
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

          <StatusRow>
            <StatusLabel>Mode:</StatusLabel>
            <StatusValue type="mode">{mode}</StatusValue>
          </StatusRow>
        </ServerStatus>
      </ContentArea>
    </Container>
  );
};

export default RetroArcadeHome;