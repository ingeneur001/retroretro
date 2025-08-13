import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModeDetection } from '../../hooks/useModeDetection';
import { GameNavigation, GameNavigationPresets } from '../gameszone/shared/GameNavigation';
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
  background: linear-gradient(45deg, #f1f2f6, #ffffff, #e1e2e6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(241, 242, 246, 0.5);

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

const DashboardGrid = styled.div`
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

// Dashboard Card mit weißem Neon-Effekt
const DashboardCard = styled.div<{ enabled: boolean }>`
  background: rgba(20, 20, 40, 0.8);
  border: 3px solid ${props => props.enabled ? '#f1f2f6' : '#666'};
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
  box-shadow: 0 0 15px ${props => props.enabled ? 'rgba(241, 242, 246, 0.2)' : 'rgba(102, 102, 102, 0.2)'};

  ${props => props.enabled && css`
    &:hover {
      background: rgba(20, 20, 40, 0.95);
      transform: translateY(-8px) scale(1.02);
      border-color: #f1f2f6;
      box-shadow: 
        0 0 30px rgba(241, 242, 246, 0.8),
        0 0 60px rgba(241, 242, 246, 0.6),
        0 0 100px rgba(241, 242, 246, 0.4),
        0 15px 35px rgba(0, 0, 0, 0.3);
      
      &::before {
        opacity: 1;
      }
      
      &::after {
        opacity: 0.8;
      }
      
      /* Icon Neon-Effekt */
      ${ToolIcon} {
        filter: drop-shadow(0 0 15px #f1f2f6) 
                drop-shadow(0 0 25px rgba(241, 242, 246, 0.8));
        transform: scale(1.1);
      }
      
      /* Title Neon-Effekt */
      ${ToolTitle} {
        color: #f1f2f6;
        text-shadow: 
          0 0 15px #f1f2f6,
          0 0 30px rgba(241, 242, 246, 0.8),
          0 0 45px rgba(241, 242, 246, 0.6);
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
      rgba(241, 242, 246, 0.6), 
      transparent, 
      rgba(241, 242, 246, 0.6), 
      transparent, 
      rgba(241, 242, 246, 0.6)
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
      rgba(241, 242, 246, 0.15) 0%, 
      transparent 70%
    );
    border-radius: 15px;
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
`;

const ToolIcon = styled.div`
  font-size: 4rem;
  margin: 0;
  filter: none;
  transition: all 0.4s ease;
`;

const ToolTitle = styled.h3<{ enabled: boolean }>`
  font-size: 1.8rem;
  margin: 0;
  color: ${props => props.enabled ? '#f1f2f6' : '#666'};
  text-shadow: ${props => props.enabled ? '0 0 10px rgba(241, 242, 246, 0.4)' : 'none'};
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  transition: all 0.4s ease;
`;

const StatusIndicator = styled.div<{ status: 'online' | 'warning' | 'error' | 'maintenance' }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  
  ${props => props.status === 'online' && css`
    background: #2ed573;
    box-shadow: 0 0 10px #2ed573;
  `}
  
  ${props => props.status === 'warning' && css`
    background: #ff9800;
    box-shadow: 0 0 10px #ff9800;
  `}
  
  ${props => props.status === 'error' && css`
    background: #ff4757;
    box-shadow: 0 0 10px #ff4757;
  `}
  
  ${props => props.status === 'maintenance' && css`
    background: #666;
    box-shadow: 0 0 10px #666;
  `}
`;

const SystemStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 3rem auto;
  max-width: 1200px;
`;

const StatCard = styled.div`
  background: rgba(20, 20, 40, 0.6);
  border: 1px solid rgba(241, 242, 246, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(241, 242, 246, 0.6);
    box-shadow: 0 5px 15px rgba(241, 242, 246, 0.1);
  }
`;

const StatValue = styled.div<{ status?: 'good' | 'warning' | 'critical' }>`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px currentColor;
  
  ${props => !props.status && css`
    color: #f1f2f6;
  `}
  
  ${props => props.status === 'good' && css`
    color: #2ed573;
  `}
  
  ${props => props.status === 'warning' && css`
    color: #ff9800;
  `}
  
  ${props => props.status === 'critical' && css`
    color: #ff4757;
  `}
`;

const StatLabel = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
`;

const ActivityLog = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(241, 242, 246, 0.2);
  border-radius: 10px;
  margin: 2rem auto;
  max-width: 1200px;
  padding: 1.5rem;
`;

const LogHeader = styled.h3`
  color: #f1f2f6;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(241, 242, 246, 0.3);
`;

const LogEntry = styled.div<{ type: 'info' | 'warning' | 'error' | 'success' }>`
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 5px;
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  
  ${props => props.type === 'info' && css`
    background: rgba(69, 183, 209, 0.1);
    border-left: 3px solid #45b7d1;
    color: #45b7d1;
  `}
  
  ${props => props.type === 'warning' && css`
    background: rgba(255, 152, 0, 0.1);
    border-left: 3px solid #ff9800;
    color: #ff9800;
  `}
  
  ${props => props.type === 'error' && css`
    background: rgba(255, 71, 87, 0.1);
    border-left: 3px solid #ff4757;
    color: #ff4757;
  `}
  
  ${props => props.type === 'success' && css`
    background: rgba(46, 213, 115, 0.1);
    border-left: 3px solid #2ed573;
    color: #2ed573;
  `}
`;

// Dashboard Tool Interface
interface DashboardTool {
  id: string;
  title: string;
  icon: string;
  description: string;
  path: string;
  enabled: boolean;
  status: 'online' | 'warning' | 'error' | 'maintenance';
  requiresProduction?: boolean;
}

interface SystemStat {
  label: string;
  value: string;
  status?: 'good' | 'warning' | 'critical';
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

const DashboardZone: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useModeDetection();

  // Dashboard Tools Configuration
  const dashboardTools: DashboardTool[] = [
    {
      id: 'system-tests',
      title: 'System Tests',
      icon: '🧪',
      description: 'Run comprehensive system tests and diagnostics.',
      path: '/dashboard/tests',
      enabled: true,
      status: 'online'
    },
    {
      id: 'performance-monitor',
      title: 'Performance Monitor',
      icon: '📊',
      description: 'Real-time performance monitoring and analytics.',
      path: '/dashboard/monitoring',
      enabled: true,
      status: 'online'
    },
    {
      id: 'error-tracking',
      title: 'Error Tracking',
      icon: '🚨',
      description: 'Track and analyze system errors and exceptions.',
      path: '/dashboard/errors',
      enabled: mode === 'production',
      status: 'warning',
      requiresProduction: true
    },
    {
      id: 'database-admin',
      title: 'Database Admin',
      icon: '🗄️',
      description: 'Database administration and query tools.',
      path: '/dashboard/database',
      enabled: mode === 'production',
      status: 'online',
      requiresProduction: true
    }
  ];

  // System Statistics
  const systemStats: SystemStat[] = [
    { label: 'CPU Usage', value: '23%', status: 'good' },
    { label: 'Memory Usage', value: '67%', status: 'warning' },
    { label: 'Active Users', value: '47', status: 'good' },
    { label: 'Response Time', value: '89ms', status: 'good' },
    { label: 'Error Rate', value: '0.2%', status: 'good' },
    { label: 'Uptime', value: '99.8%', status: 'good' }
  ];

  // Activity Log
  const [activityLog] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      message: 'System health check completed successfully'
    },
    {
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      type: 'info',
      message: 'User authentication service restarted'
    },
    {
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      type: 'warning',
      message: 'High memory usage detected on server-2'
    },
    {
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
      type: 'info',
      message: 'Database backup completed'
    },
    {
      timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
      type: 'success',
      message: 'Performance optimization applied'
    }
  ]);

  const handleToolClick = (tool: DashboardTool) => {
    if (tool.enabled) {
      console.log(`📊 Opening ${tool.title}`);
      navigate(tool.path);
    } else {
      console.log(`🚫 ${tool.title} not available in ${mode} mode`);
      alert(`${tool.title} is only available in Production Mode!\n\nUpgrade for advanced monitoring tools.`);
    }
  };

  return (
    <ZoneContainer>
      {/* Zone Header */}
      <ZoneHeader>
        <ZoneTitle>📊 DASHBOARD</ZoneTitle>
        <ZoneSubtitle>
          System monitoring, testing tools, and performance analytics. Keep your retro gaming platform running smoothly.
        </ZoneSubtitle>
      </ZoneHeader>

      {/* System Statistics */}
      <SystemStatsGrid>
        {systemStats.map((stat, index) => (
          <StatCard key={index}>
            <StatValue status={stat.status}>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </SystemStatsGrid>

      {/* Dashboard Tools */}
      <DashboardGrid>
        {dashboardTools.map(tool => (
          <DashboardCard
            key={tool.id}
            enabled={tool.enabled}
            onClick={() => handleToolClick(tool)}
          >
            <StatusIndicator status={tool.status} />
            <ToolIcon>{tool.icon}</ToolIcon>
            <ToolTitle enabled={tool.enabled}>{tool.title}</ToolTitle>
          </DashboardCard>
        ))}
      </DashboardGrid>

      {/* Activity Log */}
      <ActivityLog>
        <LogHeader>🔍 System Activity Log</LogHeader>
        {activityLog.map((entry, index) => (
          <LogEntry key={index} type={entry.type}>
            [{entry.timestamp}] {entry.message}
          </LogEntry>
        ))}
      </ActivityLog>

      {/* Navigation */}
      <GameNavigation {...GameNavigationPresets.singleplayerGame('Dashboard')} />
    </ZoneContainer>
  );
};

export default DashboardZone;