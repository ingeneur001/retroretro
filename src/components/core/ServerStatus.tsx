import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animationen
const neonBorder = keyframes`
  0%, 100% { border-color: #00ffff; box-shadow: 0 0 10px #00ffff; }
  25% { border-color: #ff00ff; box-shadow: 0 0 10px #ff00ff; }
  50% { border-color: #ffff00; box-shadow: 0 0 10px #ffff00; }
  75% { border-color: #ff0080; box-shadow: 0 0 10px #ff0080; }
`;

// Styled Components
const StatusPanel = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00ffff;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 2rem;
  animation: ${neonBorder} 4s linear infinite;
  min-width: 300px;
  text-align: center;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  color: #ffffff;
  font-size: 1.1rem;
`;

const StatusLabel = styled.span`
  color: #00ffff;
  font-weight: 700;
`;

const StatusValue = styled.span<{ status?: 'online' | 'offline' | 'loading' }>`
  color: ${props => 
    props.status === 'online' ? '#00ff00' : 
    props.status === 'offline' ? '#ff0000' : 
    '#ffff00'};
  font-weight: 700;
`;

// Interface für Server-Status
interface ServerStatusData {
  status: string;
  uptime: number;
  version: string;
  timestamp: string;
}

interface ServerStatusProps {
  serverStatus: ServerStatusData | null;
  playerCount: number;
  loading: boolean;
}

// ServerStatus Component
const ServerStatus: React.FC<ServerStatusProps> = ({ 
  serverStatus, 
  playerCount, 
  loading 
}) => {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getServerStatusType = (): 'online' | 'offline' | 'loading' => {
    if (loading) return 'loading';
    return serverStatus?.status === 'OK' ? 'online' : 'offline';
  };

  return (
    <StatusPanel>
      <StatusItem>
        <StatusLabel>Server Status:</StatusLabel>
        <StatusValue status={getServerStatusType()}>
          {loading ? 'LOADING...' : serverStatus?.status || 'OFFLINE'}
        </StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>Players Online:</StatusLabel>
        <StatusValue>{playerCount}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>Server Uptime:</StatusLabel>
        <StatusValue>
          {serverStatus ? formatUptime(serverStatus.uptime) : '--'}
        </StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>Version:</StatusLabel>
        <StatusValue>{serverStatus?.version || '--'}</StatusValue>
      </StatusItem>
    </StatusPanel>
  );
};

export default ServerStatus;