import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animationen
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Card = styled.div`
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #00ffff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 25px rgba(0, 255, 255, 0.5);
    animation: ${pulse} 1s infinite;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: rotate(45deg);
    transition: all 0.5s;
    opacity: 0;
  }

  &:hover::before {
    animation: ${pulse} 1.5s infinite;
    opacity: 1;
  }
`;

const GameTitle = styled.h3`
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 1.2rem;
  font-weight: 700;
`;

const GameDescription = styled.p`
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
`;

const PlayButton = styled.button`
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    background: linear-gradient(45deg, #f7931e, #ff6b35);
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// Interface für GameCard Props
interface GameCardProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onPlay: () => void;
}

// GameCard Component
const GameCard: React.FC<GameCardProps> = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  onPlay 
}) => {
  return (
    <Card>
      <GameTitle>{icon} {title}</GameTitle>
      <GameDescription>{description}</GameDescription>
      <PlayButton onClick={onPlay}>
        {buttonText}
      </PlayButton>
    </Card>
  );
};

export default GameCard;