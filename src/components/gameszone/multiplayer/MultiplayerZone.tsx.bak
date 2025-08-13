import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModeDetection } from '../../../hooks/useModeDetection';
import { GameNavigation, GameNavigationPresets } from '../shared/GameNavigation';
import { useSocket } from '../../../hooks/useSocket';
import { ConnectionState } from '../../../types/multiplayer';
import styled from 'styled-components';

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

const PlayButton = styled.button<{ available: boolean }>`
  background: ${props => props.available 
    ? 'linear-gradient(45deg, #ff6b6b, #ff8e53)' 
    : 'linear-gradient(45deg, #666, #444)'};
  border: none;
  color: white;
  padding: 1.2rem 3rem;
  border-radius: 30px;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: ${props => props.available ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  min-width: 200px;

  &:hover {
    transform: ${props => props.available ? 'translateY(-3px) scale(1.05)' : 'none'};
    box-shadow: ${props => props.available ? '0 10px 25px rgba(255, 107, 107, 0.6)' : 'none'};
  }
`;

interface MultiplayerZoneProps {}

const MultiplayerZone: React.FC<MultiplayerZoneProps> = () => {
  const navigate = useNavigate();
  const { mode } = useModeDetection();
  
  const handlePongMultiplayer = () => {
    console.log('🏓 Starting Pong Multiplayer');
    navigate('/games/multiplayer/pong');
  };

  return (
    <ZoneContainer>
      <ZoneHeader>
        <ZoneTitle>👥 MULTIPLAYER ZONE</ZoneTitle>
        <ZoneSubtitle>
          Challenge friends in real-time battles! Experience the thrill of competitive retro gaming.
        </ZoneSubtitle>
      </ZoneHeader>

      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>🏓</div>
        <h2 style={{ color: '#ff6b6b', fontSize: '2.5rem', marginBottom: '1rem' }}>Pong Battle</h2>
        <p style={{ color: '#b0b0b0', fontSize: '1.1rem', marginBottom: '2rem' }}>
          The classic that started it all! Challenge a friend to an intense Pong duel.
        </p>
        
        <PlayButton available={true} onClick={handlePongMultiplayer}>
          Start Battle
        </PlayButton>
      </div>

      <GameNavigation {...GameNavigationPresets.gameZone('Multiplayer Zone')} />
    </ZoneContainer>
  );
};

export default MultiplayerZone;
