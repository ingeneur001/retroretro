import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Animations - identical to GamesZone
const neonGlow = keyframes`
  0% {
    text-shadow: 
      0 0 20px #00ff00,
      0 0 40px #00ff00,
      0 0 60px #00ff00,
      0 0 80px #00ff00;
  }
  100% {
    text-shadow: 
      0 0 10px #00ff00,
      0 0 20px #00ff00,
      0 0 30px #00ff00,
      0 0 40px #00ff00;
  }
`;

const boxGlow = keyframes`
  0% {
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.5),
      0 0 40px rgba(0, 255, 255, 0.3);
  }
  100% {
    box-shadow: 
      0 0 30px rgba(0, 255, 255, 0.8),
      0 0 60px rgba(0, 255, 255, 0.4);
  }
`;

const cardHover = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
`;

// Styled Components - identical structure to GamesZone
const Container = styled.div`
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const MainTitle = styled.h1`
  font-size: 6rem;
  font-weight: bold;
  color: #00ff00;
  text-align: center;
  margin: 2rem 0 3rem 0;
  letter-spacing: 0.3rem;
  animation: ${neonGlow} 2s infinite alternate;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
`;

const HomeButton = styled.button`
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-shadow: 0 0 5px #00ffff, 0 0 8px #00ffff;
  margin-bottom: 3rem;
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff, 0 0 25px #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
    transform: scale(1.05);
  }
`;

const ZonesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  max-width: 1200px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ZoneCard = styled.div<{ borderColor: string; bgGlow: string }>`
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid ${props => props.borderColor};
  border-radius: 15px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &:hover {
    animation: ${cardHover} 0.2s ease-in-out forwards;
    box-shadow: 0 0 30px ${props => props.bgGlow};
    background: rgba(0, 0, 0, 0.9);
  }

  .icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.9;
  }

  h2 {
    font-size: 1.5rem;
    color: ${props => props.borderColor};
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    text-shadow: 0 0 10px ${props => props.borderColor};
    line-height: 1.2;
  }

  .description {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-top: 1rem;
    line-height: 1.4;
  }
`;

const ServerStatus = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #00ff00;
  border-radius: 15px;
  padding: 2rem;
  width: 100%;
  max-width: 700px; /* Realistische Breite für Titel-Text */
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.5),
    0 0 40px rgba(0, 255, 0, 0.3);
  animation: ${boxGlow} 3s infinite;

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

const StatusValue = styled.span<{ color: string }>`
  color: ${props => props.color};
  font-weight: bold;
  text-shadow: 
    0 0 5px ${props => props.color},
    0 0 10px ${props => props.color};
`;

// ProfileZone Component
const ProfileZone: React.FC = () => {
  const navigate = useNavigate();

  const handleZoneClick = (zone: string) => {
    console.log(`🧭 ProfileZone: Navigating to ${zone}`);
    
    switch (zone) {
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'settings':
        navigate('/profile/settings');
        break;
      case 'payment':
        navigate('/profile/payment');
        break;
      default:
        console.log(`Unknown zone: ${zone}`);
    }
  };

  const handleHomeClick = () => {
    console.log('🏠 ProfileZone: Navigating to home');
    navigate('/');
  };

  return (
    <Container>
      {/* Main Title */}
      <MainTitle>PROFILE ZONE</MainTitle>

      {/* Home Button */}
      <HomeButton onClick={handleHomeClick}>
        🏠 HOME
      </HomeButton>

      {/* Profile Zones */}
      <ZonesContainer>
        <ZoneCard
          borderColor="#00ffff"
          bgGlow="rgba(0, 255, 255, 0.4)"
          onClick={() => handleZoneClick('login')}
        >
          <div className="icon">🔐</div>
          <h2>LOGIN<br />ZONE</h2>
          <div className="description">
            Access your existing account and continue your gaming journey
          </div>
        </ZoneCard>

        <ZoneCard
          borderColor="#ff0099"
          bgGlow="rgba(255, 0, 153, 0.4)"
          onClick={() => handleZoneClick('register')}
        >
          <div className="icon">📝</div>
          <h2>REGISTER<br />ZONE</h2>
          <div className="description">
            Create a new account and join the retro arcade community
          </div>
        </ZoneCard>

        <ZoneCard
          borderColor="#ffff00"
          bgGlow="rgba(255, 255, 0, 0.4)"
          onClick={() => handleZoneClick('settings')}
        >
          <div className="icon">⚙️</div>
          <h2>SETTINGS<br />ZONE</h2>
          <div className="description">
            Customize your preferences and configure your gaming experience
          </div>
        </ZoneCard>

        <ZoneCard
          borderColor="#ff8800"
          bgGlow="rgba(255, 136, 0, 0.4)"
          onClick={() => handleZoneClick('payment')}
        >
          <div className="icon">💰</div>
          <h2>PAYMENT<br />ZONE</h2>
          <div className="description">
            Manage your credits and unlock premium gaming features
          </div>
        </ZoneCard>
      </ZonesContainer>

      {/* Account Status */}
      <ServerStatus>
        <StatusRow>
          <StatusLabel>Account Status:</StatusLabel>
          <StatusValue color="#ffff00">Guest</StatusValue>
        </StatusRow>
        
        <StatusRow>
          <StatusLabel>Security Level:</StatusLabel>
          <StatusValue color="#00ff00">Basic</StatusValue>
        </StatusRow>
        
        <StatusRow>
          <StatusLabel>Credit Balance:</StatusLabel>
          <StatusValue color="#ff0099">0</StatusValue>
        </StatusRow>

        <StatusRow>
          <StatusLabel>Member Since:</StatusLabel>
          <StatusValue color="#00ffff">12.8.2025</StatusValue>
        </StatusRow>
      </ServerStatus>
    </Container>
  );
};

export default ProfileZone;