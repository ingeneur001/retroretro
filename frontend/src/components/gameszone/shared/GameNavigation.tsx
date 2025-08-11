import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components - konsistent mit existierendem Design
const Navigation = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1rem 0 2rem 0;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

const NavButton = styled.button<{ variant?: 'primary' | 'secondary' | 'home' }>`
  background: linear-gradient(45deg, #00ffff, #0099cc);
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-family: 'Orbitron', monospace;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 140px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 255, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    min-width: 120px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

// Navigation Context Types
type NavigationLevel = 'game' | 'zone' | 'hub' | 'home';

interface GameNavigationProps {
  currentLevel: NavigationLevel;
  zoneName?: string;          // z.B. "Singleplayer Zone"
  zonePath?: string;          // z.B. "/games/singleplayer"
  gameName?: string;          // z.B. "Snake Game"
  showHome?: boolean;         // Home-Button anzeigen?
  onlyZoneBack?: boolean;     // Nur Zone-Back Button
  customButtons?: Array<{    // Zusätzliche Custom-Buttons
    label: string;
    path: string;
    variant?: 'primary' | 'secondary' | 'home';
  }>;
}

export const GameNavigation: React.FC<GameNavigationProps> = ({
  currentLevel,
  zoneName = "Game Zone",
  zonePath = "/games",
  gameName,
  showHome = true,
  onlyZoneBack = false,
  customButtons = []
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string, label: string) => {
    console.log(`🧭 GameNavigation: ${label} → ${path}`);
    navigate(path);
  };

  const renderNavigationButtons = () => {
    const buttons = [];

    // Level-basierte Navigation
    switch (currentLevel) {
      case 'game':
        // Von Game zu Zone (immer verfügbar)
        if (zonePath && zoneName) {
          buttons.push(
            <NavButton
              key="back-to-zone"
              variant="primary"
              onClick={() => handleNavigation(zonePath, `Back to ${zoneName}`)}
            >
              ← {zoneName}
            </NavButton>
          );
        }
        
        // Von Game zu Hub (nur wenn nicht onlyZoneBack)
        if (!onlyZoneBack) {
          buttons.push(
            <NavButton
              key="back-to-hub"
              variant="secondary"
              onClick={() => handleNavigation('/games', 'Back to Games Hub')}
            >
              ← Games Hub
            </NavButton>
          );
        }
        break;

      case 'zone':
        // Von Zone zu Hub
        buttons.push(
          <NavButton
            key="back-to-hub"
            variant="primary"
            onClick={() => handleNavigation('/games', 'Back to Games Hub')}
          >
            ← Games Hub
          </NavButton>
        );
        break;

      case 'hub':
        // Vom Hub nach Home (nur wenn showHome=true)
        break;

      case 'home':
        // Bereits auf Home - keine Navigation nötig
        break;
    }

    // Home-Button (falls gewünscht)
    if (showHome && currentLevel !== 'home') {
      buttons.push(
        <NavButton
          key="home"
          variant="home"
          onClick={() => handleNavigation('/', 'Home')}
        >
          🏠 Home
        </NavButton>
      );
    }

    // Custom Buttons
    customButtons.forEach((button, index) => {
      buttons.push(
        <NavButton
          key={`custom-${index}`}
          variant={button.variant || 'secondary'}
          onClick={() => handleNavigation(button.path, button.label)}
        >
          {button.label}
        </NavButton>
      );
    });

    return buttons;
  };

  return <Navigation>{renderNavigationButtons()}</Navigation>;
};

// Convenience Components für häufige Use Cases
export const BackToZoneButton: React.FC<{
  zoneName: string;
  zonePath: string;
}> = ({ zoneName, zonePath }) => {
  const navigate = useNavigate();

  return (
    <NavButton
      variant="primary"
      onClick={() => navigate(zonePath)}
    >
      ← {zoneName}
    </NavButton>
  );
};

export const BackToHubButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <NavButton
      variant="secondary"
      onClick={() => navigate('/games')}
    >
      ← Games Hub
    </NavButton>
  );
};

export const HomeButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <NavButton
      variant="home"
      onClick={() => navigate('/')}
    >
      🏠 Home
    </NavButton>
  );
};

// Preset Navigation Configurations
export const GameNavigationPresets = {
  // Für Singleplayer Games - nur Back to Zone
  singleplayerGame: (gameName: string) => ({
    currentLevel: 'game' as const,
    zoneName: 'Singleplayer Zone',
    zonePath: '/games/singleplayer',
    gameName,
    showHome: false,  // Kein Home-Button
    onlyZoneBack: true  // Nur Zone-Back
  }),

  // Für Multiplayer Games  
  multiplayerGame: (gameName: string) => ({
    currentLevel: 'game' as const,
    zoneName: 'Multiplayer Zone',
    zonePath: '/games/multiplayer',
    gameName,
    showHome: true
  }),

  // Für Arcade Games
  arcadeGame: (gameName: string) => ({
    currentLevel: 'game' as const,
    zoneName: 'Arcade Zone',
    zonePath: '/games/arcade',
    gameName,
    showHome: true
  }),

  // Für Zone-Pages
  gameZone: (zoneName: string) => ({
    currentLevel: 'zone' as const,
    zoneName,
    showHome: true
  }),

  // Für Games Hub
  gamesHub: () => ({
    currentLevel: 'hub' as const,
    showHome: true
  })
};

export default GameNavigation;