import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animationen
const glow = keyframes`
  0%, 100% { text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff; }
  50% { text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff; }
`;

// Styled Components
const HeaderContainer = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  color: #00ffff;
  text-align: center;
  margin-bottom: 1rem;
  animation: ${glow} 2s ease-in-out infinite;
  letter-spacing: 0.1em;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #ff00ff;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 400;
  letter-spacing: 0.05em;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 20px;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
`;

const NavButton = styled.button`
  background: linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Orbitron', monospace;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    background: linear-gradient(45deg, rgba(0, 255, 255, 0.4), rgba(255, 0, 255, 0.4));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &.active {
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    color: #000000;
    font-weight: 700;
  }
`;

// Interface für Header Props
interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
  activeNavItem?: string;
  onNavClick?: (item: string) => void;
}

// Navigation Items
const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'games', label: 'Games' },
  { id: 'profile', label: 'Profile' },
  { id: 'leaderboard', label: 'Scores' },
  { id: 'settings', label: 'Settings' }
];

// Header Component
const Header: React.FC<HeaderProps> = ({ 
  title = 'RETRO ARCADE',
  subtitle = 'Legal Gaming Experience',
  showNavigation = false,
  activeNavItem = 'home',
  onNavClick
}) => {
  const handleNavClick = (item: string) => {
    if (onNavClick) {
      onNavClick(item);
    } else {
      console.log(`Navigation to: ${item}`);
    }
  };

  return (
    <HeaderContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
      
      {showNavigation && (
        <Navigation>
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              className={activeNavItem === item.id ? 'active' : ''}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </NavButton>
          ))}
        </Navigation>
      )}
    </HeaderContainer>
  );
};

export default Header;