import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModeProvider } from './hooks/useModeDetection';
import RetroArcadeHome from './components/core/RetroArcadeHome';
import { RetroThemeProvider } from './styles/ThemeProvider';

// Import Zone Components
import GamesZoneHub from './components/gameszone/GamesZoneHub';
import SingleplayerZone from './components/gameszone/singleplayer/SingleplayerZone';
import MultiplayerZone from './components/gameszone/multiplayer/MultiplayerZone';
import ArcadeZone from './components/gameszone/arcade/ArcadeZone';

// Import Profile & Authentication Components
import ProfileZone from './components/profilezone/ProfileZone';
// TODO: Erst aktivieren wenn Dateien erstellt sind!
// import LoginPage from './components/login/LoginPage';           
// import RegisterPage from './components/register/RegisterPage';     
// import SettingsPage from './components/settings/SettingsPage'; 
// import PaymentPage from './components/payment/PaymentPage';

// Import Score & Dashboard
import ScoreView from './components/scoresview/ScoreView';
import DashboardZone from './components/dashboardzone/DashboardZone';

// Import Individual Games
import SnakeGame from './components/gameszone/singleplayer/SnakeGame';
import TetrisGame from './components/gameszone/singleplayer/TetrisGame';
import MemoryGame from './components/gameszone/singleplayer/MemoryGame';
import PongGame from './components/gameszone/singleplayer/PongGame';
import PongMultiplayer from './components/gameszone/multiplayer/PongMultiplayer';

import './index.css';

function App() {
  console.log('🚀 App.tsx: Rendering with Router');
  
  return (
    <RetroThemeProvider>
      <ModeProvider>
        <Router>
          <div className="App">
              <Routes>
                {/* Main Routes */}
                <Route path="/" element={<RetroArcadeHome />} />
                <Route path="/games" element={<GamesZoneHub />} />
                
                {/* Authentication Routes - TODO: Erst aktivieren wenn Dateien existieren */}
                {/* <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} /> */}
                
                {/* Profile Routes */}  
                <Route path="/profile" element={<ProfileZone />} />
                {/* TODO: Erst aktivieren wenn Dateien existieren */}
                {/* <Route path="/profile/settings" element={<SettingsPage />} />
                <Route path="/profile/payment" element={<PaymentPage />} /> */}
                
                {/* Singleplayer Routes */}
                <Route path="/games/singleplayer" element={<SingleplayerZone />} />
                <Route path="/games/singleplayer/snake" element={<SnakeGame />} />
                <Route path="/games/singleplayer/tetris" element={<TetrisGame />} />
                <Route path="/games/singleplayer/memory" element={<MemoryGame />} />
                <Route path="/games/singleplayer/pong" element={<PongGame />} />
                
                {/* Multiplayer Routes */}
                <Route path="/games/multiplayer" element={<MultiplayerZone />} />
                <Route path="/games/multiplayer/pong" element={<PongMultiplayer />} />
                
                {/* Arcade Routes */}
                <Route path="/games/arcade" element={<ArcadeZone />} />
                
                {/* Score Routes */}
                <Route path="/scores" element={<ScoreView />} />
                
                {/* Dashboard Routes */}  
                <Route path="/dashboard" element={<DashboardZone />} />
              </Routes>
            </div>
          </Router>
      </ModeProvider>
    </RetroThemeProvider>
  );
}

export default App;