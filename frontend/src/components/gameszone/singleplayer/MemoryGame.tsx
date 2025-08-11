import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameIntegration } from '../../interfaces/user/UserManager';

// Types & Interfaces
interface Card {
  id: number;
  symbol: string;
  x: number;
  y: number;
  width: number;
  height: number;
  flipped: boolean;
  matched: boolean;
  color: string;
}

interface GameStats {
  moves: number;
  matches: number;
  timeElapsed: number;
  score: number;
}

interface MemoryGameState {
  gameStatus: 'idle' | 'playing' | 'paused' | 'completed';
  cards: Card[];
  flippedCards: Card[];
  stats: GameStats;
  gameStartTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Game constants
const DIFFICULTIES = {
  easy: { pairs: 6, cols: 3, rows: 4 },
  medium: { pairs: 8, cols: 4, rows: 4 },
  hard: { pairs: 12, cols: 4, rows: 6 }
};

const SYMBOLS = ['🎮', '🕹️', '🎯', '🎲', '🃏', '🎪', '🎨', '🎭', '🎪', '🎺', '🎸', '🎤'];
const CARD_COLORS = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

const MemoryGame: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  // Game Integration
  const { recordGameResult, isLoggedIn, currentUser } = useGameIntegration();
  
  // Game State
  const [memoryState, setMemoryState] = useState<MemoryGameState>({
    gameStatus: 'idle',
    cards: [],
    flippedCards: [],
    stats: { moves: 0, matches: 0, timeElapsed: 0, score: 0 },
    gameStartTime: 0,
    difficulty: 'medium'
  });
  
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showHighScore, setShowHighScore] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIXED: TypeScript error - useRef needs proper type for number or null
  const gameLoopRef = useRef<number | null>(null);

  // Debug logging
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
    console.log(`🧠 ${timestamp}: ${message}`);
  };

  // Create shuffled deck of cards
  const createCards = useCallback((difficulty: 'easy' | 'medium' | 'hard'): Card[] => {
    const { pairs, cols } = DIFFICULTIES[difficulty];
    const selectedSymbols = SYMBOLS.slice(0, pairs);
    const allSymbols = [...selectedSymbols, ...selectedSymbols]; // Create pairs
    
    // Shuffle array
    for (let i = allSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSymbols[i], allSymbols[j]] = [allSymbols[j], allSymbols[i]];
    }
    
    const cardWidth = 80;
    const cardHeight = 100;
    const padding = 10;
    
    return allSymbols.map((symbol, index) => ({
      id: index,
      symbol,
      x: (index % cols) * (cardWidth + padding) + padding,
      y: Math.floor(index / cols) * (cardHeight + padding) + padding,
      width: cardWidth,
      height: cardHeight,
      flipped: false,
      matched: false,
      color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)]
    }));
  }, []);

  // Flip card function - REPARIERT: useCallback mit dependencies
  const flipCard = useCallback((card: Card) => {
    setMemoryState(prev => {
      if (prev.flippedCards.length >= 2 || card.flipped || card.matched) {
        return prev;
      }
      
      const newCards = prev.cards.map(c => 
        c.id === card.id ? { ...c, flipped: true } : c
      );
      
      const newFlippedCards = [...prev.flippedCards, card];
      
      addDebugLog(`🃏 Flipped card with symbol: ${card.symbol}`);
      
      return {
        ...prev,
        cards: newCards,
        flippedCards: newFlippedCards
      };
    });
  }, []);

  // Canvas click handler - REPARIERT: korrekte dependencies
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (memoryState.gameStatus !== 'playing' || memoryState.flippedCards.length >= 2) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickedCard = memoryState.cards.find(card => 
      x >= card.x && x <= card.x + card.width &&
      y >= card.y && y <= card.y + card.height &&
      !card.flipped && !card.matched
    );
    
    if (clickedCard) {
      flipCard(clickedCard);
    }
  }, [memoryState.gameStatus, memoryState.flippedCards, memoryState.cards, flipCard]);

  // Check for matches
  useEffect(() => {
    if (memoryState.flippedCards.length === 2) {
      const [first, second] = memoryState.flippedCards;
      
      setTimeout(() => {
        setMemoryState(prev => {
          const isMatch = first.symbol === second.symbol;
          
          const newCards = prev.cards.map(card => {
            if (card.id === first.id || card.id === second.id) {
              return isMatch 
                ? { ...card, matched: true }
                : { ...card, flipped: false };
            }
            return card;
          });
          
          const newStats = {
            ...prev.stats,
            moves: prev.stats.moves + 1,
            matches: isMatch ? prev.stats.matches + 1 : prev.stats.matches
          };
          
          if (isMatch) {
            addDebugLog(`✅ Match found: ${first.symbol}`);
          } else {
            addDebugLog(`❌ No match: ${first.symbol} ≠ ${second.symbol}`);
          }
          
          return {
            ...prev,
            cards: newCards,
            flippedCards: [],
            stats: newStats
          };
        });
      }, 1000);
    }
  }, [memoryState.flippedCards]);

  // Check for game completion
  useEffect(() => {
    if (memoryState.gameStatus === 'playing' && memoryState.cards.length > 0) {
      const allMatched = memoryState.cards.every(card => card.matched);
      
      if (allMatched) {
        const finalTime = Date.now() - memoryState.gameStartTime;
        const finalScore = Math.max(1000 - (memoryState.stats.moves * 10) - Math.floor(finalTime / 1000), 100);
        
        setMemoryState(prev => ({
          ...prev,
          gameStatus: 'completed',
          stats: { ...prev.stats, timeElapsed: finalTime, score: finalScore }
        }));
        
        if (isLoggedIn) {
          const { newHighScore } = recordGameResult('memory', finalScore);
          if (newHighScore) {
            setShowHighScore(true);
          }
        }
        
        addDebugLog(`🎉 Game completed! Score: ${finalScore}`);
      }
    }
  }, [memoryState.cards, memoryState.gameStatus, memoryState.gameStartTime, memoryState.stats.moves, isLoggedIn, recordGameResult]);

  // Game timer - FIXED: Proper cleanup for interval
  useEffect(() => {
    if (memoryState.gameStatus === 'playing') {
      gameLoopRef.current = window.setInterval(() => {
        setMemoryState(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            timeElapsed: Date.now() - prev.gameStartTime
          }
        }));
      }, 100);
      
      return () => {
        if (gameLoopRef.current !== null) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      };
    }
  }, [memoryState.gameStatus, memoryState.gameStartTime]);

  // Draw game
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw cards
    memoryState.cards.forEach(card => {
      // Card background
      ctx.fillStyle = card.matched ? '#4caf50' : (card.flipped ? card.color : '#333');
      ctx.fillRect(card.x, card.y, card.width, card.height);
      
      // Card border
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(card.x, card.y, card.width, card.height);
      
      // Card content
      if (card.flipped || card.matched) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          card.symbol,
          card.x + card.width / 2,
          card.y + card.height / 2
        );
      } else {
        // Back of card
        ctx.fillStyle = '#00ffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          '?',
          card.x + card.width / 2,
          card.y + card.height / 2
        );
      }
      
      // Highlight effect for matched cards
      if (card.matched) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(card.x, card.y, card.width, card.height);
      }
    });
  }, [memoryState.cards]);

  // Draw when state changes
  useEffect(() => {
    if (memoryState.gameStatus !== 'idle') {
      drawGame();
    }
  }, [memoryState, drawGame]);

  // Start new game
  const startNewGame = () => {
    const newCards = createCards(memoryState.difficulty);
    setMemoryState(prev => ({
      ...prev,
      gameStatus: 'playing',
      cards: newCards,
      flippedCards: [],
      stats: { moves: 0, matches: 0, timeElapsed: 0, score: 0 },
      gameStartTime: Date.now()
    }));
    setShowHighScore(false);
    addDebugLog('🚀 New Memory game started');
  };

  // Reset game
  const resetGame = () => {
    // Clean up any running timer
    if (gameLoopRef.current !== null) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setMemoryState(prev => ({
      ...prev,
      gameStatus: 'idle',
      cards: [],
      flippedCards: [],
      stats: { moves: 0, matches: 0, timeElapsed: 0, score: 0 },
      gameStartTime: 0
    }));
    addDebugLog('🔄 Game reset');
  };

  // Change difficulty
  const changeDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setMemoryState(prev => ({
      ...prev,
      difficulty,
      gameStatus: 'idle',
      cards: [],
      flippedCards: [],
      stats: { moves: 0, matches: 0, timeElapsed: 0, score: 0 }
    }));
    addDebugLog(`🎯 Difficulty changed to: ${difficulty}`);
  };

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Render game content based on status
  const renderGameContent = () => {
    switch (memoryState.gameStatus) {
      case 'idle':
        return (
          <div style={{
            color: '#00ffff',
            textAlign: 'center',
            fontSize: '1.2rem',
            padding: '20px'
          }}>
            <h3 style={{ color: '#ffff00', marginBottom: '15px', fontSize: '1.5rem' }}>🧠 Memory Game</h3>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>Find matching pairs of cards!</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>🎯 Flip two cards to find matches</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>🏆 Complete in fewer moves for higher score</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>🎮 Click cards to flip them</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>Choose difficulty and press START!</p>
          </div>
        );
        
      case 'completed':
        return (
          <div style={{
            color: '#00ffff',
            textAlign: 'center',
            fontSize: '1.2rem',
            padding: '20px'
          }}>
            <div style={{
              background: 'rgba(0, 255, 0, 0.1)',
              border: '2px solid #00ff00',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#00ff00', marginBottom: '15px', fontSize: '1.8rem' }}>🎉 CONGRATULATIONS!</h3>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Final Score: {memoryState.stats.score.toLocaleString()}</p>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Moves: {memoryState.stats.moves}</p>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Time: {formatTime(memoryState.stats.timeElapsed)}</p>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Difficulty: {memoryState.difficulty}</p>
              {showHighScore && (
                <div style={{
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid #ffd700',
                  borderRadius: '5px',
                  padding: '10px',
                  margin: '10px 0',
                  color: '#ffd700',
                  fontWeight: 'bold'
                }}>
                  🏆 NEW HIGH SCORE! 🏆
                </div>
              )}
              {!isLoggedIn && (
                <p style={{ color: '#ff6b9d', fontSize: '0.9rem' }}>
                  💡 Login to save your high scores!
                </p>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '900px',
      margin: '2rem auto',
      padding: '20px',
      background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
      border: '2px solid #00ffff',
      borderRadius: '15px',
      color: 'white'
    }}>
      <h2 style={{
        color: '#00ffff',
        marginBottom: '15px',
        fontSize: '1.8rem',
        textAlign: 'center',
        fontWeight: '700'
      }}>
        🧠 Retro Memory Game v2.1 - TYPESCRIPT FIXED
      </h2>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 0, 0, 0.8)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          ×
        </button>
      )}
      
      {/* Debug Panel */}
      <div style={{
        background: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid #ff0000',
        borderRadius: '5px',
        padding: '10px',
        margin: '10px 0',
        color: '#ff0000',
        fontFamily: 'Courier New, monospace',
        fontSize: '0.8rem',
        width: '100%'
      }}>
        <strong>🐛 DEBUG INFO:</strong><br/>
        Game Status: {memoryState.gameStatus}<br/>
        Flipped Cards: {memoryState.flippedCards.length}<br/>
        Moves: {memoryState.stats.moves}<br/>
        Matches: {memoryState.stats.matches}/{DIFFICULTIES[memoryState.difficulty].pairs}<br/>
        Time: {formatTime(memoryState.stats.timeElapsed)}<br/>
        User: {isLoggedIn ? currentUser?.username : 'Not logged in'}<br/>
        <strong>Recent Logs:</strong><br/>
        {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
      
      {/* Game Layout */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '20px 0' }}>
        {/* Main Game Screen */}
        <div style={{
          width: '400px',
          height: '500px',
          background: memoryState.gameStatus === 'playing' ? '#000' : '#111',
          border: '3px solid #00ffff',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {memoryState.gameStatus === 'playing' ? (
            <canvas
              ref={canvasRef}
              width={380}
              height={480}
              onClick={handleCanvasClick}
              style={{
                width: '100%',
                height: '100%',
                background: '#000',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            />
          ) : (
            renderGameContent()
          )}
        </div>
        
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '200px' }}>
          {/* Statistics */}
          <div style={{
            background: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid #00ffff',
            borderRadius: '10px',
            padding: '15px'
          }}>
            <h3 style={{
              color: '#00ffff',
              margin: '0 0 15px 0',
              fontSize: '1.2rem',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>📊 Statistics</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Score:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{memoryState.stats.score.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Moves:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{memoryState.stats.moves}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Matches:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{memoryState.stats.matches}/{DIFFICULTIES[memoryState.difficulty].pairs}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Time:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{formatTime(memoryState.stats.timeElapsed)}</span>
            </div>
          </div>
          
          {/* Difficulty */}
          <div style={{
            background: 'rgba(255, 107, 157, 0.1)',
            border: '2px solid #ff6b9d',
            borderRadius: '10px',
            padding: '15px'
          }}>
            <h3 style={{
              color: '#ff6b9d',
              margin: '0 0 15px 0',
              fontSize: '1.1rem',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>🎯 Difficulty</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => changeDifficulty(diff)}
                  disabled={memoryState.gameStatus === 'playing'}
                  style={{
                    background: memoryState.difficulty === diff ? 
                      'linear-gradient(45deg, #ff6b9d, #ff8e8e)' : 
                      'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${memoryState.difficulty === diff ? '#ff6b9d' : '#666'}`,
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    cursor: memoryState.gameStatus === 'playing' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: memoryState.gameStatus === 'playing' ? 0.5 : 1
                  }}
                >
                  {diff.toUpperCase()} ({DIFFICULTIES[diff].pairs} pairs)
                </button>
              ))}
            </div>
          </div>
          
          {/* Controls Help */}
          <div style={{
            background: 'rgba(0, 255, 0, 0.1)',
            border: '2px solid #00ff00',
            borderRadius: '10px',
            padding: '15px'
          }}>
            <h3 style={{
              color: '#00ff00',
              margin: '0 0 15px 0',
              fontSize: '1.1rem',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>🎮 How to Play</h3>
            <div style={{ fontSize: '0.9rem', color: '#fff' }}>
              <p style={{ margin: '5px 0' }}>• Click cards to flip them</p>
              <p style={{ margin: '5px 0' }}>• Find matching pairs</p>
              <p style={{ margin: '5px 0' }}>• Complete in fewer moves</p>
              <p style={{ margin: '5px 0' }}>• Faster time = bonus points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        <button
          onClick={startNewGame}
          disabled={memoryState.gameStatus === 'playing'}
          style={{
            background: 'linear-gradient(45deg, #00ff00, #00cc00)',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontFamily: 'Orbitron, monospace',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: memoryState.gameStatus === 'playing' ? 0.5 : 1
          }}
        >
          🚀 {memoryState.gameStatus === 'idle' ? 'Start Game' : 'New Game'}
        </button>
        
        <button
          onClick={resetGame}
          style={{
            background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontFamily: 'Orbitron, monospace',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Instructions */}
      <div style={{ color: '#00ffff', textAlign: 'center', fontSize: '0.9rem' }}>
        <p>🧠 <strong>Goal:</strong> Find all matching pairs of cards</p>
        <p>🎮 <strong>Controls:</strong> Click on cards to flip them over</p>
        <p>⚡ <strong>Strategy:</strong> Remember card positions for better scores</p>
        <p>🏆 <strong>Scoring:</strong> Fewer moves and faster completion = higher score!</p>
      </div>
    </div>
  );
};

export default MemoryGame;