import React, { useState, useEffect, useRef } from 'react';
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

  // Keyboard state
  const [keys, setKeys] = useState({
    w: false, s: false, // Player 1
    ArrowUp: false, ArrowDown: false // Player 2
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PADDLE_HEIGHT = 80;
  const PADDLE_WIDTH = 10;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 7;

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('🎯 Key pressed:', e.key);
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update paddle positions based on keyboard input
  useEffect(() => {
    const updatePaddles = () => {
      setGameState(prev => {
        let newPlayer1Y = prev.player1.y;
        let newPlayer2Y = prev.player2.y;

        // Player 1 controls (W/S)
        if (keys.w && newPlayer1Y > 0) {
          newPlayer1Y -= PADDLE_SPEED;
        }
        if (keys.s && newPlayer1Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
          newPlayer1Y += PADDLE_SPEED;
        }

        // Player 2 controls (Arrow Up/Down)
        if (keys.ArrowUp && newPlayer2Y > 0) {
          newPlayer2Y -= PADDLE_SPEED;
        }
        if (keys.ArrowDown && newPlayer2Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
          newPlayer2Y += PADDLE_SPEED;
        }

        return {
          ...prev,
          player1: { ...prev.player1, y: newPlayer1Y },
          player2: { ...prev.player2, y: newPlayer2Y }
        };
      });
    };

    const interval = setInterval(updatePaddles, 16); // ~60fps
    return () => clearInterval(interval);
  }, [keys]);

  // Enhanced game loop with collision detection and scoring
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        let newBall = {
          x: prev.ball.x + prev.ball.vx,
          y: prev.ball.y + prev.ball.vy,
          vx: prev.ball.vx,
          vy: prev.ball.vy
        };

        let newPlayer1Score = prev.player1.score;
        let newPlayer2Score = prev.player2.score;

        // Bounce off top/bottom
        if (newBall.y <= BALL_SIZE || newBall.y >= CANVAS_HEIGHT - BALL_SIZE) {
          newBall.vy = -newBall.vy;
        }

        // Paddle collision detection
        // Left paddle (Player 1)
        if (newBall.x - BALL_SIZE <= 30 && 
            newBall.y >= prev.player1.y && 
            newBall.y <= prev.player1.y + PADDLE_HEIGHT &&
            newBall.vx < 0) {
          newBall.vx = -newBall.vx;
          newBall.x = 30 + BALL_SIZE; // Prevent sticking
        }

        // Right paddle (Player 2)
        if (newBall.x + BALL_SIZE >= CANVAS_WIDTH - 30 && 
            newBall.y >= prev.player2.y && 
            newBall.y <= prev.player2.y + PADDLE_HEIGHT &&
            newBall.vx > 0) {
          newBall.vx = -newBall.vx;
          newBall.x = CANVAS_WIDTH - 30 - BALL_SIZE; // Prevent sticking
        }

        // Scoring
        if (newBall.x <= 0) {
          // Player 2 scores
          newPlayer2Score++;
          newBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 5, vy: 3 };
        } else if (newBall.x >= CANVAS_WIDTH) {
          // Player 1 scores
          newPlayer1Score++;
          newBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: -5, vy: 3 };
        }

        return {
          ball: newBall,
          player1: { ...prev.player1, score: newPlayer1Score },
          player2: { ...prev.player2, score: newPlayer2Score }
        };
      });
    }, 16); // ~60fps

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
            Player 1: W/S keys | Player 2: ↑/↓ Arrow keys
          </div>
        </div>
      </GameArea>
    </GameContainer>
  );
};

export default PongMultiplayer;