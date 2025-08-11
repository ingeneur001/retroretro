import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animationen
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const StatusContainer = styled.div<{ connected: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 15px;
  border-radius: 25px;
  border: 2px solid ${props => props.connected ? '#00ff00' : '#ff0000'};
  z-index: 1000;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    padding: 8px 12px;
  }
`;

const StatusDot = styled.div<{ connected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.connected ? '#00ff00' : '#ff0000'};
  animation: ${pulse} 1s infinite;
`;

const StatusText = styled.span`
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
  letter-spacing: 0.05em;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ConnectionInfo = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #00ffff;
  border-radius: 8px;
  padding: 10px;
  min-width: 200px;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  color: #ffffff;
  font-size: 0.8rem;
  margin: 5px 0;
  font-family: 'Orbitron', monospace;
`;

const InfoLabel = styled.span`
  color: #00ffff;
`;

const InfoValue = styled.span`
  color: #ffffff;
  font-weight: 600;
`;

// Interface für ConnectionStatus Props
interface ConnectionStatusProps {
  connected: boolean;
  showDetails?: boolean;
  serverUrl?: string;
  lastPing?: number;
  reconnectAttempts?: number;
}

// ConnectionStatus Component
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connected,
  showDetails = false,
  serverUrl = 'localhost:3001',
  lastPing = 0,
  reconnectAttempts = 0
}) => {
  const [showInfo, setShowInfo] = React.useState(false);

  const formatPing = (ms: number) => {
    if (ms === 0) return '--';
    return `${ms}ms`;
  };

  const getStatusText = () => {
    if (connected) return 'ONLINE';
    if (reconnectAttempts > 0) return 'RECONNECTING...';
    return 'OFFLINE';
  };

  return (
    <StatusContainer 
      connected={connected}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <StatusDot connected={connected} />
      <StatusText>{getStatusText()}</StatusText>
      
      {showDetails && (
        <ConnectionInfo show={showInfo}>
          <InfoItem>
            <InfoLabel>Server:</InfoLabel>
            <InfoValue>{serverUrl}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Ping:</InfoLabel>
            <InfoValue>{formatPing(lastPing)}</InfoValue>
          </InfoItem>
          {!connected && reconnectAttempts > 0 && (
            <InfoItem>
              <InfoLabel>Attempts:</InfoLabel>
              <InfoValue>{reconnectAttempts}</InfoValue>
            </InfoItem>
          )}
          <InfoItem>
            <InfoLabel>Status:</InfoLabel>
            <InfoValue>{connected ? 'Connected' : 'Disconnected'}</InfoValue>
          </InfoItem>
        </ConnectionInfo>
      )}
    </StatusContainer>
  );
};

export default ConnectionStatus;