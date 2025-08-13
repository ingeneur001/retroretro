import { useState, useEffect, useContext, createContext } from 'react';

// Mode-Typen basierend auf der abgestimmten Struktur
export type RetroRetroMode = 'development' | 'demo' | 'production';

// Mode-Konfiguration Interface
export interface ModeConfig {
  // Development Exklusiv
  allowModeSwitch: boolean;
  showAnalytics: boolean;
  showGameZoneAnalytics: boolean;
  showPerformanceMonitor: boolean;
  showGameDashboard: boolean;
  
  // GamesZone Features
  gamesZoneEnabled: boolean;
  allGameZones: boolean;
  gameZoneDebug: boolean;
  limitedMultiplayer?: boolean;
  
  // Standard Features
  enableAllFeatures: boolean;
  languages: string[];
  maxUsers: number;
  enablePayment: boolean;
  enableSaveSystem: boolean;
  enableGDPR: boolean;
  
  // Demo-spezifisch
  sessionLimit?: number;
  demoNotices?: boolean;
  
  // Production-spezifisch
  premiumGameFeatures?: boolean;
  enableMultiLanguage?: boolean;
}

// Mode-Konfigurationen (entspricht der abgestimmten Struktur)
const MODE_CONFIGS: Record<RetroRetroMode, ModeConfig> = {
  development: {
    // DEVELOPMENT EXKLUSIV
    allowModeSwitch: true,        // Nur hier Mode-Switching
    showAnalytics: true,          // Analytics nur hier
    showGameZoneAnalytics: true,  // Game Zone Analytics nur hier
    showPerformanceMonitor: true, // Performance-Tools nur hier
    showGameDashboard: true,      // GameDashboard nur hier
    
    // GamesZone Features
    gamesZoneEnabled: true,       // 3-teilige GamesZone
    allGameZones: true,           // Alle 3 Zonen verfügbar
    gameZoneDebug: true,          // Debug Info für Game Zones
    
    // Standard Features
    enableAllFeatures: true,
    languages: ['en'],            // Nur Englisch
    maxUsers: 999,
    enablePayment: false,         // Kein Payment
    enableSaveSystem: false,      // Kein Save System
    enableGDPR: false            // Keine GDPR
  },
  
  demo: {
    // DEMO BESCHRÄNKUNGEN
    allowModeSwitch: false,       // Kein Mode-Switching
    showAnalytics: false,         // Keine Analytics
    showGameZoneAnalytics: false, // Keine Game Zone Analytics
    showPerformanceMonitor: false,// Keine Performance-Tools
    showGameDashboard: false,     // Kein GameDashboard
    
    // GamesZone Features (begrenzt)
    gamesZoneEnabled: true,       // GamesZone verfügbar
    allGameZones: false,          // Nicht alle Zonen
    gameZoneDebug: false,         // Kein Debug
    limitedMultiplayer: true,     // Eingeschränkter Multiplayer
    
    // Basis Features
    enableAllFeatures: false,
    languages: ['en'],            // Nur Englisch
    maxUsers: 10,                 // Begrenzt
    enablePayment: false,         // Kein Payment
    enableSaveSystem: false,      // Kein Save System
    enableGDPR: false,           // Keine GDPR
    sessionLimit: 2,
    demoNotices: true
  },
  
  production: {
    // PRODUCTION EXKLUSIV
    allowModeSwitch: false,       // Kein Mode-Switching
    showAnalytics: false,         // Keine Analytics
    showGameZoneAnalytics: false, // Keine Game Zone Analytics
    showPerformanceMonitor: false,// Keine Performance-Tools
    showGameDashboard: false,     // Kein GameDashboard
    
    // GamesZone Features (Vollumfang)
    gamesZoneEnabled: true,       // GamesZone verfügbar
    allGameZones: true,           // Alle 3 Zonen verfügbar
    gameZoneDebug: false,         // Kein Debug
    premiumGameFeatures: true,    // Premium Features für Game Zones
    
    // VOLLUMFANG
    enableAllFeatures: true,
    languages: ['en', 'de', 'fr', 'es'], // Multi-Language
    maxUsers: 999,
    enablePayment: true,          // Payment System
    enableSaveSystem: true,       // Save System (alle Zonen)
    enableGDPR: true,            // GDPR/Privacy
    enableMultiLanguage: true
  }
};

// Mode Context
interface ModeContextType {
  mode: RetroRetroMode;
  config: ModeConfig;
  setMode: (mode: RetroRetroMode) => void;
  canSwitchMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

// Mode Provider Component
export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<RetroRetroMode>(() => {
    // Environment Variable Detection (vom Launcher gesetzt)
    const envMode = process.env.REACT_APP_MODE as RetroRetroMode;
    
    // Fallback chain
    if (envMode && MODE_CONFIGS[envMode]) {
      console.log(`🎯 Mode detected from environment: ${envMode.toUpperCase()}`);
      return envMode;
    }
    
    // Development als Fallback
    console.log('🎯 Mode fallback: DEVELOPMENT');
    return 'development';
  });
  
  const config = MODE_CONFIGS[mode];
  const canSwitchMode = config.allowModeSwitch;
  
  const setMode = (newMode: RetroRetroMode) => {
    if (canSwitchMode) {
      console.log(`🔄 Mode switching: ${mode.toUpperCase()} → ${newMode.toUpperCase()}`);
      setModeState(newMode);
      
      // Optional: Persist to localStorage (nur Development)
      if (mode === 'development') {
        localStorage.setItem('retroretro_mode', newMode);
      }
    } else {
      console.warn(`🚫 Mode switching disabled in ${mode.toUpperCase()} mode`);
    }
  };
  
  // Log mode changes
  useEffect(() => {
    console.log(`🎮 RetroRetro Mode: ${mode.toUpperCase()}`);
    console.log('📊 Mode Config:', config);
  }, [mode, config]);
  
  const contextValue: ModeContextType = {
    mode,
    config,
    setMode,
    canSwitchMode
  };
  
  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  );
};

// Main Hook
export const useModeDetection = () => {
  const context = useContext(ModeContext);
  
  if (context === undefined) {
    throw new Error('useModeDetection must be used within a ModeProvider');
  }
  
  return context;
};

// Convenience Hooks für spezifische Features
export const useGameZoneFeatures = () => {
  const { config } = useModeDetection();
  
  return {
    enabled: config.gamesZoneEnabled,
    allZones: config.allGameZones,
    debug: config.gameZoneDebug,
    limitedMultiplayer: config.limitedMultiplayer || false,
    premium: config.premiumGameFeatures || false
  };
};

export const useDevelopmentFeatures = () => {
  const { config } = useModeDetection();
  
  return {
    analytics: config.showAnalytics,
    gameZoneAnalytics: config.showGameZoneAnalytics,
    performanceMonitor: config.showPerformanceMonitor,
    gameDashboard: config.showGameDashboard,
    modeSwitch: config.allowModeSwitch
  };
};

export const useProductionFeatures = () => {
  const { config } = useModeDetection();
  
  return {
    saveSystem: config.enableSaveSystem,
    payment: config.enablePayment,
    gdpr: config.enableGDPR,
    multiLanguage: config.enableMultiLanguage || false,
    premium: config.premiumGameFeatures || false
  };
};

export const useDemoRestrictions = () => {
  const { mode, config } = useModeDetection();
  
  return {
    isDemo: mode === 'demo',
    maxUsers: config.maxUsers,
    sessionLimit: config.sessionLimit || 0,
    showNotices: config.demoNotices || false,
    limitedFeatures: !config.enableAllFeatures
  };
};

// Helper function für Feature Checks
export const checkFeature = (feature: keyof ModeConfig, mode?: RetroRetroMode): boolean => {
  const targetMode = mode || 'development'; // Fallback
  const config = MODE_CONFIGS[targetMode];
  return Boolean(config[feature]);
};

// Export Mode Configs für externe Verwendung
export { MODE_CONFIGS };

export default useModeDetection;