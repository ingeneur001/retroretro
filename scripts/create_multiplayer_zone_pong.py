#!/usr/bin/env python3
"""
Create Multiplayer Zone for Pong - FIXED VERSION
Erstellt die komplette Multiplayer-Zone mit Fokus auf Pong 2-Player
"""

import os
import sys

def create_multiplayer_zone(project_path):
    """Erstellt MultiplayerZone.tsx Hauptkomponente"""
    print("🎮 Creating MultiplayerZone.tsx...")
    
    frontend_path = os.path.join(project_path, "frontend", "src")
    multiplayer_dir = os.path.join(frontend_path, "components", "gameszone", "multiplayer")
    
    # Verzeichnis erstellen falls nicht vorhanden
    os.makedirs(multiplayer_dir, exist_ok=True)
    
    multiplayer_zone_tsx = """import React, { useState, useEffect } from 'react';
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
"""
    
    multiplayer_zone_path = os.path.join(multiplayer_dir, "MultiplayerZone.tsx")
    with open(multiplayer_zone_path, 'w', encoding='utf-8') as f:
        f.write(multiplayer_zone_tsx)
    
    print(f"  ✅ Created: {multiplayer_zone_path}")
    return True

def create_pong_multiplayer_game(project_path):
    """Erstellt PongMultiplayer.tsx Spielkomponente"""
    print("\n🏓 Creating PongMultiplayer.tsx...")
    
    frontend_path = os.path.join(project_path, "frontend", "src")
    multiplayer_dir = os.path.join(frontend_path, "components", "gameszone", "multiplayer")
    
    pong_multiplayer_tsx = """import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0d1117 100%);
  color: white;
  display: flex;
  flex-direction: column;
  font-family: 'Orbitron', monospace;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 2px solid #ff6b6b;
`;

const GameTitle = styled.h1`
  color: #ff6b6b;
  font-size: 2rem;
  margin: 0;
`;

const BackButton = styled.button`
  background: linear-gradient(45deg, #666, #444);
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-family: 'Orbitron', monospace;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(45deg, #777, #555);
    transform: translateY(-2px);
  }
`;

const GameArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const PongCanvas = styled.canvas`
  border: 3px solid #ff6b6b;
  border-radius: 10px;
  background: #000;
  box-shadow: 0 0 30px rgba(255, 107, 107, 0.5);
`;

interface PongMultiplayerProps {}

const PongMultiplayer: React.FC<PongMultiplayerProps> = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Basic Pong state
  const [gameState, setGameState] = useState({
    ball: { x: 400, y: 200, vx: 5, vy: 3 },
    player1: { y: 150, score: 0 },
    player2: { y: 150, score: 0 }
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PADDLE_HEIGHT = 80;
  const PADDLE_WIDTH = 10;
  const BALL_SIZE = 10;

  // Basic game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const newBall = {
          x: prev.ball.x + prev.ball.vx,
          y: prev.ball.y + prev.ball.vy,
          vx: prev.ball.vx,
          vy: prev.ball.vy
        };

        // Bounce off top/bottom
        if (newBall.y <= BALL_SIZE || newBall.y >= CANVAS_HEIGHT - BALL_SIZE) {
          newBall.vy = -newBall.vy;
        }

        // Reset if ball goes off sides
        if (newBall.x <= 0 || newBall.x >= CANVAS_WIDTH) {
          newBall.x = CANVAS_WIDTH / 2;
          newBall.y = CANVAS_HEIGHT / 2;
          newBall.vx = -newBall.vx;
        }

        return {
          ...prev,
          ball: newBall
        };
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, []);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = '#333';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(20, gameState.player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 30, gameState.player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
  }, [gameState]);

  const handleBackToZone = () => {
    navigate('/games/multiplayer');
  };

  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>🏓 Pong Battle</GameTitle>
        <BackButton onClick={handleBackToZone}>
          ← Back to Multiplayer
        </BackButton>
      </GameHeader>

      <GameArea>
        <div style={{ position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            gap: '3rem', 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#ff6b6b' 
          }}>
            <div>Player 1: {gameState.player1.score}</div>
            <div>Player 2: {gameState.player2.score}</div>
          </div>
          
          <PongCanvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
          
          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            fontSize: '0.9rem', 
            color: '#888',
            textAlign: 'center'
          }}>
            Multiplayer version coming soon! This is a preview of the game.
          </div>
        </div>
      </GameArea>
    </GameContainer>
  );
};

export default PongMultiplayer;
"""
    
    pong_multiplayer_path = os.path.join(multiplayer_dir, "PongMultiplayer.tsx")
    with open(pong_multiplayer_path, 'w', encoding='utf-8') as f:
        f.write(pong_multiplayer_tsx)
    
    print(f"  ✅ Created: {pong_multiplayer_path}")
    return True

def update_app_routes(project_path):
    """Fügt Multiplayer-Routen zur App.tsx hinzu"""
    print("\n🛤️ Updating App.tsx routes...")
    
    frontend_path = os.path.join(project_path, "frontend", "src")
    app_tsx_path = os.path.join(frontend_path, "App.tsx")
    
    if not os.path.exists(app_tsx_path):
        print("  ❌ App.tsx not found")
        return False
    
    with open(app_tsx_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if multiplayer imports already exist
    if "MultiplayerZone" not in content:
        # Add imports after PongGame import
        multiplayer_imports = """import MultiplayerZone from './components/gameszone/multiplayer/MultiplayerZone';
import PongMultiplayer from './components/gameszone/multiplayer/PongMultiplayer';"""
        
        if "import PongGame" in content:
            content = content.replace(
                "import PongGame from './components/gameszone/singleplayer/PongGame';",
                "import PongGame from './components/gameszone/singleplayer/PongGame';\n" + multiplayer_imports
            )
            print("  ✅ Added multiplayer imports")
    
    # Add wrapper components
    if "MultiplayerZoneWrapper" not in content:
        multiplayer_wrappers = """
// Multiplayer Wrapper Komponenten
const MultiplayerZoneWrapper = () => {
  console.log('👥 Route: /games/multiplayer matched');
  return <MultiplayerZone />;
};

const PongMultiplayerWrapper = () => {
  console.log('🏓 Route: /games/multiplayer/pong matched');
  return <PongMultiplayer />;
};"""
        
        # Find PongWrapper and add after it
        pong_wrapper_pos = content.find("const PongWrapper = () => {")
        if pong_wrapper_pos != -1:
            end_pos = content.find("};", pong_wrapper_pos) + 2
            content = content[:end_pos] + multiplayer_wrappers + content[end_pos:]
            print("  ✅ Added multiplayer wrapper components")
    
    # Add routes
    if "/games/multiplayer" not in content:
        multiplayer_routes = """              <Route path="/games/multiplayer" element={<MultiplayerZoneWrapper />} />
              <Route path="/games/multiplayer/pong" element={<PongMultiplayerWrapper />} />"""
        
        pong_route_pos = content.find('<Route path="/games/singleplayer/pong"')
        if pong_route_pos != -1:
            end_pos = content.find('\n', pong_route_pos)
            content = content[:end_pos] + '\n' + multiplayer_routes + content[end_pos:]
            print("  ✅ Added multiplayer routes")
    
    # Save updated App.tsx
    with open(app_tsx_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("  ✅ Updated App.tsx")
    return True

def main():
    """Hauptfunktion"""
    project_path = sys.argv[1] if len(sys.argv) > 1 else r"D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service"
    
    print("🎮 Creating Multiplayer Zone for Pong")
    print("=" * 60)
    
    if not os.path.exists(project_path):
        print(f"❌ Project path not found: {project_path}")
        sys.exit(1)
    
    # Create components
    create_multiplayer_zone(project_path)
    create_pong_multiplayer_game(project_path)
    update_app_routes(project_path)
    
    print("\n🎉 MULTIPLAYER ZONE CREATED!")
    print("✅ MultiplayerZone.tsx - Main multiplayer hub")
    print("✅ PongMultiplayer.tsx - Pong game (preview)")
    print("✅ App.tsx routes updated")
    
    print("\n🚀 Test it:")
    print("  1. python retroretro_start.py")
    print("  2. http://localhost:3000/games/multiplayer")
    print("  3. Start Pong Battle!")

if __name__ == "__main__":
    main()