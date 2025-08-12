
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModeProvider } from './hooks/useModeDetection';
import { UserProvider } from './components/interfaces/user/UserManager';  
import RetroArcadeHome from './components/core/RetroArcadeHome';
// Import Theme Provider
import { RetroThemeProvider } from './styles/ThemeProvider';
import GamesZoneHub from './components/gameszone/GamesZoneHub';
import SingleplayerZone from './components/gameszone/singleplayer/SingleplayerZone';
// Import individual games
import SnakeGame from './components/gameszone/singleplayer/SnakeGame';
import TetrisGame from './components/gameszone/singleplayer/TetrisGame';
import MemoryGame from './components/gameszone/singleplayer/MemoryGame';
import PongGame from './components/gameszone/singleplayer/PongGame';
import MultiplayerZone from './components/gameszone/multiplayer/MultiplayerZone';
import PongMultiplayer from './components/gameszone/multiplayer/PongMultiplayer';
// Import Profile components
import { UserManager } from './components/interfaces/user/UserManager';
import './index.css';

// Debug Wrapper Komponenten
const GamesZoneWrapper = () => {
  console.log('🎮 Route: /games matched');
  return <GamesZoneHub />;
};

const SingleplayerWrapper = () => {
  console.log('🎲 Route: /games/singleplayer matched');
  return <SingleplayerZone />;
};

// Game Wrapper Komponenten
const SnakeWrapper = () => {
  console.log('🐍 Route: /games/singleplayer/snake matched');
  return <SnakeGame />;
};

const TetrisWrapper = () => {
  console.log('🧩 Route: /games/singleplayer/tetris matched');
  return <TetrisGame />;
};

const MemoryWrapper = () => {
  console.log('🧠 Route: /games/singleplayer/memory matched');
  return <MemoryGame />;
};

const PongWrapper = () => {
  console.log('🏓 Route: /games/singleplayer/pong matched');
  return <PongGame />;
};

// Multiplayer Wrapper Komponenten
const MultiplayerZoneWrapper = () => {
  console.log('👥 Route: /games/multiplayer matched');
  return <MultiplayerZone />;
};

const PongMultiplayerWrapper = () => {
  console.log('🏓 Route: /games/multiplayer/pong matched');
  return <PongMultiplayer />;
};

// Profile Wrapper - NEU HINZUGEFÜGT
const ProfileWrapper = () => {
  console.log('👤 Route: /profile matched');
  return <UserManager />;
};

function App() {
  console.log('🚀 App.tsx: Rendering with Router');
  
  return (
    <RetroThemeProvider>
      <ModeProvider>
        <UserProvider> 
          <Router>
            <div className="App">
              <Routes>
                {/* Main Routes */}
                <Route path="/" element={<RetroArcadeHome />} />
                <Route path="/games" element={<GamesZoneWrapper />} />
                
                {/* Profile Route - NEU HINZUGEFÜGT */}
                <Route path="/profile" element={<ProfileWrapper />} />
                
                {/* Singleplayer Routes */}
                <Route path="/games/singleplayer" element={<SingleplayerWrapper />} />
                <Route path="/games/singleplayer/snake" element={<SnakeWrapper />} />
                <Route path="/games/singleplayer/tetris" element={<TetrisWrapper />} />
                <Route path="/games/singleplayer/memory" element={<MemoryWrapper />} />
                <Route path="/games/singleplayer/pong" element={<PongWrapper />} />
                
                {/* Multiplayer Routes */}
                <Route path="/games/multiplayer" element={<MultiplayerZoneWrapper />} />
                <Route path="/games/multiplayer/pong" element={<PongMultiplayerWrapper />} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </ModeProvider>
    </RetroThemeProvider>
  );
}

export default App;