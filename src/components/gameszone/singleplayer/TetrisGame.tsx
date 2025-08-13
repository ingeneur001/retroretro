import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameIntegration } from '../../interfaces/user/UserManager';

// Interfaces & Types
type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
  color: string;
}

interface GameStats {
  score: number;
  level: number;
  lines: number;
  pieces: number;
}

interface TetrisGameState {
  grid: (string | null)[][];
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  gameRunning: boolean;
  stats: GameStats;
  dropTime: number;
  lastDrop: number;
}

// Konstanten
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 30;
const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE + 2;
const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE + 2;

// Tetromino-Definitionen
const TETROMINOES: Record<TetrominoType, { shape: number[][], color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00ffff'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffff00'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#ff00ff'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00ff00'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#ff0000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000ff'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#ffa500'
  }
};

// TetrisGame Component
const TetrisGame: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  // User System Integration
  const { recordGameResult, isLoggedIn, currentUser } = useGameIntegration();
  
  // Game States
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [lastKeyTime, setLastKeyTime] = useState<Record<string, number>>({});
  const [showHighScore, setShowHighScore] = useState(false);
  
  const [tetrisState, setTetrisState] = useState<TetrisGameState>({
    grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)),
    currentPiece: null,
    nextPiece: null,
    gameRunning: false,
    stats: { score: 0, level: 1, lines: 0, pieces: 0 },
    dropTime: 1000,
    lastDrop: 0
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextPieceCanvasRef = useRef<HTMLCanvasElement>(null);
  // const gameLoopRef = useRef<number | undefined>(undefined); // ← Entfernt - wird nicht verwendet

  // Debug-Log hinzufügen
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
    console.log(`🧩 ${timestamp}: ${message}`);
  };

  // Zufälliges Tetromino erstellen
  const createRandomTetromino = useCallback((): Tetromino => {
    const types = Object.keys(TETROMINOES) as TetrominoType[];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const tetromino = TETROMINOES[randomType];
    
    return {
      type: randomType,
      shape: tetromino.shape,
      position: { x: Math.floor(GRID_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
      color: tetromino.color
    };
  }, []);

  // Tetromino rotieren
  const rotateTetromino = useCallback((shape: number[][]): number[][] => {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        rotated[col][rows - 1 - row] = shape[row][col];
      }
    }
    
    return rotated;
  }, []);

  // Kollisionsprüfung
  const checkCollision = useCallback((piece: Tetromino, grid: (string | null)[][], dx = 0, dy = 0, newShape?: number[][]): boolean => {
    const shape = newShape || piece.shape;
    const newX = piece.position.x + dx;
    const newY = piece.position.y + dy;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const x = newX + col;
          const y = newY + row;
          
          if (x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) {
            return true;
          }
          
          if (y >= 0 && grid[y][x]) {
            return true;
          }
        }
      }
    }
    
    return false;
  }, []);

  // Piece auf Grid platzieren
  const placePiece = useCallback((piece: Tetromino, grid: (string | null)[][]): (string | null)[][] => {
    const newGrid = grid.map(row => [...row]);
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const x = piece.position.x + col;
          const y = piece.position.y + row;
          
          if (y >= 0) {
            newGrid[y][x] = piece.color;
          }
        }
      }
    }
    
    return newGrid;
  }, []);

  // REPARIERT: Vollständige Linien prüfen und entfernen
  const clearLines = useCallback((grid: (string | null)[][]): { newGrid: (string | null)[][], linesCleared: number } => {
    const newGrid: (string | null)[][] = [];
    let linesCleared = 0;
    
    // Durchlaufe das Grid von unten nach oben
    for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
      const isFullLine = grid[row].every(cell => cell !== null);
      
      if (isFullLine) {
        linesCleared++;
        // Überspringe diese Zeile (wird gelöscht)
      } else {
        // Füge die Zeile zum neuen Grid hinzu
        newGrid.unshift(grid[row]);
      }
    }
    
    // Fülle mit leeren Zeilen auf
    while (newGrid.length < GRID_HEIGHT) {
      newGrid.unshift(Array(GRID_WIDTH).fill(null));
    }
    
    if (linesCleared > 0) {
      addDebugLog(`🎉 Cleared ${linesCleared} line(s)!`);
    }
    
    return { newGrid, linesCleared };
  }, []);

  // Score berechnen
  const calculateScore = useCallback((linesCleared: number, level: number): number => {
    const basePoints = [0, 100, 300, 500, 800];
    return basePoints[linesCleared] * level;
  }, []);

  // Game Over Handler
  const handleGameOver = useCallback(() => {
    setGameStatus('gameover');
    
    if (isLoggedIn) {
      const finalScore = tetrisState.stats.score;
      const { newHighScore } = recordGameResult('tetris', finalScore);
      if (newHighScore) {
        setShowHighScore(true);
        addDebugLog(`🏆 NEW HIGH SCORE: ${finalScore}!`);
      }
    }
    
    addDebugLog('💀 Game Over!');
  }, [isLoggedIn, recordGameResult, tetrisState.stats.score]);

  // REPARIERT: Game Update-Logic mit korrektem Timer
  const updateGame = useCallback(() => {
    if (!tetrisState.gameRunning || !tetrisState.currentPiece) return;
    
    const currentTime = Date.now();
    
    setTetrisState(prev => {
      let newState = { ...prev };
      
      // Bewegungssteuerung
      if (keys['arrowleft'] && !checkCollision(prev.currentPiece!, prev.grid, -1, 0)) {
        newState.currentPiece = {
          ...prev.currentPiece!,
          position: { ...prev.currentPiece!.position, x: prev.currentPiece!.position.x - 1 }
        };
      }
      
      if (keys['arrowright'] && !checkCollision(prev.currentPiece!, prev.grid, 1, 0)) {
        newState.currentPiece = {
          ...prev.currentPiece!,
          position: { ...prev.currentPiece!.position, x: prev.currentPiece!.position.x + 1 }
        };
      }
      
      if (keys['arrowdown'] && !checkCollision(prev.currentPiece!, prev.grid, 0, 1)) {
        newState.currentPiece = {
          ...prev.currentPiece!,
          position: { ...prev.currentPiece!.position, y: prev.currentPiece!.position.y + 1 }
        };
        newState.stats = { ...prev.stats, score: prev.stats.score + 1 };
      }
      
      // REPARIERT: Automatisches Fallen mit korrekter Zeitprüfung
      if (currentTime - prev.lastDrop >= prev.dropTime) {
        if (!checkCollision(prev.currentPiece!, prev.grid, 0, 1)) {
          // Stein kann fallen
          newState.currentPiece = {
            ...prev.currentPiece!,
            position: { ...prev.currentPiece!.position, y: prev.currentPiece!.position.y + 1 }
          };
        } else {
          // Stein kann nicht weiter fallen - platzieren
          const newGrid = placePiece(prev.currentPiece!, prev.grid);
          const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);
          
          const lineScore = calculateScore(linesCleared, prev.stats.level);
          const newLines = prev.stats.lines + linesCleared;
          const newLevel = Math.floor(newLines / 10) + 1;
          const newDropTime = Math.max(50, 1000 - (newLevel - 1) * 50);
          
          const nextCurrentPiece = prev.nextPiece || createRandomTetromino();
          const newNextPiece = createRandomTetromino();
          
          // Game Over prüfen
          if (checkCollision(nextCurrentPiece, clearedGrid)) {
            setTimeout(() => handleGameOver(), 100);
            return { ...prev, gameRunning: false };
          }
          
          newState = {
            ...newState,
            grid: clearedGrid,
            currentPiece: nextCurrentPiece,
            nextPiece: newNextPiece,
            stats: {
              score: prev.stats.score + lineScore,
              level: newLevel,
              lines: newLines,
              pieces: prev.stats.pieces + 1
            },
            dropTime: newDropTime
          };
          
          if (linesCleared > 0) {
            addDebugLog(`📈 Score: +${lineScore}, Level: ${newLevel}`);
          }
        }
        
        newState.lastDrop = currentTime;
      }
      
      return newState;
    });
  }, [keys, checkCollision, placePiece, clearLines, calculateScore, createRandomTetromino, tetrisState.gameRunning, tetrisState.currentPiece, handleGameOver]);

  // Keyboard-Handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const now = Date.now();
      
      if (!['arrowup', ' '].includes(key)) {
        if (lastKeyTime[key] && now - lastKeyTime[key] < 150) {
          return;
        }
      }
      
      setKeys(prev => ({ ...prev, [key]: true }));
      setLastKeyTime(prev => ({ ...prev, [key]: now }));
      
      // Sofortige Aktionen
      if (gameStatus === 'playing' && tetrisState.currentPiece) {
        if (key === 'arrowup') {
          // Rotation
          const rotatedShape = rotateTetromino(tetrisState.currentPiece.shape);
          if (!checkCollision(tetrisState.currentPiece, tetrisState.grid, 0, 0, rotatedShape)) {
            setTetrisState(prev => ({
              ...prev,
              currentPiece: prev.currentPiece ? { ...prev.currentPiece, shape: rotatedShape } : null
            }));
            addDebugLog('🔄 Piece rotated');
          }
        } else if (key === ' ') {
          // Hard Drop
          let dropDistance = 0;
          while (!checkCollision(tetrisState.currentPiece, tetrisState.grid, 0, dropDistance + 1)) {
            dropDistance++;
          }
          
          if (dropDistance > 0) {
            setTetrisState(prev => ({
              ...prev,
              currentPiece: prev.currentPiece ? {
                ...prev.currentPiece,
                position: { ...prev.currentPiece.position, y: prev.currentPiece.position.y + dropDistance }
              } : null,
              stats: { ...prev.stats, score: prev.stats.score + dropDistance * 2 }
            }));
            addDebugLog('⬇️ Hard drop');
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [event.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus, tetrisState.currentPiece, tetrisState.grid, lastKeyTime, rotateTetromino, checkCollision]);

  // REPARIERT: Game-Loop mit setInterval statt requestAnimationFrame
  useEffect(() => {
    if (gameStatus === 'playing' && tetrisState.gameRunning) {
      const interval = setInterval(() => {
        updateGame();
      }, 50); // 20 FPS für smooth gameplay
      
      return () => clearInterval(interval);
    }
  }, [gameStatus, tetrisState.gameRunning, updateGame]);

  // Hauptspielfeld zeichnen
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas leeren
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Grid-Linien zeichnen
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE + 1, 1);
      ctx.lineTo(x * CELL_SIZE + 1, CANVAS_HEIGHT - 1);
      ctx.stroke();
    }
    
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(1, y * CELL_SIZE + 1);
      ctx.lineTo(CANVAS_WIDTH - 1, y * CELL_SIZE + 1);
      ctx.stroke();
    }
    
    // Platzierte Blöcke zeichnen
    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        const cell = tetrisState.grid[row][col];
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(col * CELL_SIZE + 2, row * CELL_SIZE + 2, CELL_SIZE - 2, CELL_SIZE - 2);
          
          // Highlight-Effekt
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(col * CELL_SIZE + 2, row * CELL_SIZE + 2, CELL_SIZE - 2, 4);
        }
      }
    }
    
    // Aktuelles Piece zeichnen
    if (tetrisState.currentPiece) {
      ctx.fillStyle = tetrisState.currentPiece.color;
      
      for (let row = 0; row < tetrisState.currentPiece.shape.length; row++) {
        for (let col = 0; col < tetrisState.currentPiece.shape[row].length; col++) {
          if (tetrisState.currentPiece.shape[row][col]) {
            const x = tetrisState.currentPiece.position.x + col;
            const y = tetrisState.currentPiece.position.y + row;
            
            if (y >= 0) {
              ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 2, CELL_SIZE - 2);
              
              // Highlight-Effekt
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 2, 4);
              ctx.fillStyle = tetrisState.currentPiece.color;
            }
          }
        }
      }
    }
  }, [tetrisState.grid, tetrisState.currentPiece]);

  // Next Piece zeichnen
  const drawNextPiece = useCallback(() => {
    const canvas = nextPieceCanvasRef.current;
    if (!canvas || !tetrisState.nextPiece) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const shape = tetrisState.nextPiece.shape;
    const pieceWidth = shape[0].length * 20;
    const pieceHeight = shape.length * 20;
    const startX = (canvas.width - pieceWidth) / 2;
    const startY = (canvas.height - pieceHeight) / 2;
    
    ctx.fillStyle = tetrisState.nextPiece.color;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          ctx.fillRect(startX + col * 20, startY + row * 20, 18, 18);
          
          // Highlight-Effekt
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(startX + col * 20, startY + row * 20, 18, 3);
          ctx.fillStyle = tetrisState.nextPiece.color;
        }
      }
    }
  }, [tetrisState.nextPiece]);

  // Zeichnen wenn sich State ändert
  useEffect(() => {
    if (gameStatus !== 'idle') {
      drawGame();
      drawNextPiece();
    }
  }, [tetrisState, gameStatus, drawGame, drawNextPiece]);

  // Neues Spiel starten
  const startNewGame = () => {
    const firstPiece = createRandomTetromino();
    const nextPiece = createRandomTetromino();
    
    setGameStatus('playing');
    setTetrisState({
      grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)),
      currentPiece: firstPiece,
      nextPiece: nextPiece,
      gameRunning: true,
      stats: { score: 0, level: 1, lines: 0, pieces: 0 },
      dropTime: 1000,
      lastDrop: Date.now()
    });
    setShowHighScore(false);
    
    addDebugLog('🚀 New Tetris game started');
  };

  // Spiel pausieren/fortsetzen
  const toggleGame = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      setTetrisState(prev => ({ ...prev, gameRunning: false }));
      addDebugLog('⏸️ Game paused');
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
      setTetrisState(prev => ({ ...prev, gameRunning: true, lastDrop: Date.now() }));
      addDebugLog('▶️ Game resumed');
    }
  };

  // Spiel zurücksetzen
  const resetGame = () => {
    setGameStatus('idle');
    setTetrisState({
      grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)),
      currentPiece: null,
      nextPiece: null,
      gameRunning: false,
      stats: { score: 0, level: 1, lines: 0, pieces: 0 },
      dropTime: 1000,
      lastDrop: 0
    });
    setShowHighScore(false);
    addDebugLog('🔄 Game reset');
  };

  // Level-basierte Drop-Zeit berechnen
  const getDropTimeDisplay = () => {
    return `${(tetrisState.dropTime / 1000).toFixed(1)}s`;
  };

  // Game Content Renderer - REPARIERT: Korrekte JSX-Struktur
  const renderGameContent = () => {
    switch (gameStatus) {
      case 'idle':
        return (
          <div style={{
            color: '#00ffff',
            textAlign: 'center',
            fontSize: '1.2rem',
            padding: '20px'
          }}>
            <h3 style={{ color: '#ffff00', marginBottom: '15px', fontSize: '1.5rem' }}>🧩 Tetris Game</h3>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>Classic block-stacking puzzle!</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>🎯 Clear lines by filling rows completely</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>⚡ Speed increases every 10 lines</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>🎮 Use arrow keys to control pieces</p>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>Press START GAME to begin!</p>
          </div>
        );
        
      case 'paused':
        return (
          <div style={{
            color: '#00ffff',
            textAlign: 'center',
            fontSize: '1.2rem',
            padding: '20px'
          }}>
            <h3>⏸️ GAME PAUSED</h3>
            <p>Score: {tetrisState.stats.score.toLocaleString()}</p>
            <p>Level: {tetrisState.stats.level}</p>
            <p>Lines: {tetrisState.stats.lines}</p>
            <p>Press RESUME to continue</p>
          </div>
        );
        
      case 'gameover':
        return (
          <div style={{
            color: '#00ffff',
            textAlign: 'center',
            fontSize: '1.2rem',
            padding: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '2px solid #ff0000',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#ff0000', marginBottom: '15px', fontSize: '1.8rem' }}>🎮 GAME OVER!</h3>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Final Score: {tetrisState.stats.score.toLocaleString()}</p>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Level Reached: {tetrisState.stats.level}</p>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Lines Cleared: {tetrisState.stats.lines}</p>
              <p style={{ color: '#00ffff', margin: '10px 0', fontSize: '1.2rem' }}>Pieces Placed: {tetrisState.stats.pieces}</p>
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
        🧩 Retro Tetris Game v2.0 - FIXED
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
        Game Status: {gameStatus}<br/>
        Current Piece: {tetrisState.currentPiece?.type || 'None'}<br/>
        Next Piece: {tetrisState.nextPiece?.type || 'None'}<br/>
        Drop Time: {getDropTimeDisplay()}<br/>
        Keys: {Object.entries(keys).filter(([_, pressed]) => pressed).map(([key]) => key).join(', ')}<br/>
        User: {isLoggedIn ? currentUser?.username : 'Not logged in'}<br/>
        <strong>Recent Logs:</strong><br/>
        {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
      
      {/* Game Layout */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '20px 0' }}>
        {/* Main Game Screen */}
        <div style={{
          width: '320px',
          height: '640px',
          background: gameStatus === 'playing' ? '#000' : '#111',
          border: '3px solid #00ffff',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {gameStatus === 'playing' || gameStatus === 'paused' ? (
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                width: '100%',
                height: '100%',
                background: '#000',
                borderRadius: '5px'
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
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{tetrisState.stats.score.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Level:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{tetrisState.stats.level}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Lines:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{tetrisState.stats.lines}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Pieces:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{tetrisState.stats.pieces}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#fff' }}>
              <span style={{ color: '#00ffff' }}>Speed:</span>
              <span style={{ color: '#ffff00', fontWeight: 'bold' }}>{getDropTimeDisplay()}</span>
            </div>
          </div>
          
          {/* Next Piece */}
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
            }}>🔮 Next Piece</h3>
            <canvas
              ref={nextPieceCanvasRef}
              width={160}
              height={80}
              style={{
                width: '100%',
                height: '80px',
                background: '#000',
                border: '1px solid #ff6b9d',
                borderRadius: '5px'
              }}
            />
          </div>
          
          {/* Controls */}
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
            }}>🎮 Controls</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '0.9rem' }}>
              <span style={{ color: '#00ff00', fontWeight: 'bold' }}>←/→</span>
              <span style={{ color: '#fff' }}>Move</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '0.9rem' }}>
              <span style={{ color: '#00ff00', fontWeight: 'bold' }}>↓</span>
              <span style={{ color: '#fff' }}>Soft Drop</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '0.9rem' }}>
              <span style={{ color: '#00ff00', fontWeight: 'bold' }}>↑</span>
              <span style={{ color: '#fff' }}>Rotate</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '0.9rem' }}>
              <span style={{ color: '#00ff00', fontWeight: 'bold' }}>Space</span>
              <span style={{ color: '#fff' }}>Hard Drop</span>
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
          disabled={gameStatus === 'playing'}
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
            opacity: gameStatus === 'playing' ? 0.5 : 1
          }}
        >
          🚀 {gameStatus === 'idle' ? 'Start Game' : 'New Game'}
        </button>
        
        <button
          onClick={toggleGame}
          disabled={gameStatus === 'idle' || gameStatus === 'gameover'}
          style={{
            background: 'linear-gradient(45deg, #00ffff, #0099cc)',
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
            opacity: (gameStatus === 'idle' || gameStatus === 'gameover') ? 0.5 : 1
          }}
        >
          {gameStatus === 'playing' ? '⏸️ Pause' : '▶️ Resume'}
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
        <p>🧩 <strong>Goal:</strong> Clear lines by filling rows completely</p>
        <p>🎮 <strong>Controls:</strong> Arrow keys to move, ↑ to rotate, Space for hard drop</p>
        <p>⚡ <strong>Strategy:</strong> Plan ahead using the next piece preview</p>
        <p>🏆 <strong>Scoring:</strong> More lines at once = higher score bonus!</p>
      </div>
    </div>
  );
};

export default TetrisGame;