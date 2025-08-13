// modes.config.ts - Mode Configuration for RetroRetro
export const MODE_CONFIG = {
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

export type Mode = 'development' | 'demo' | 'production';

export const DEFAULT_MODE: Mode = 'development';

export const getModeConfig = (mode: Mode) => {
  return MODE_CONFIG[mode] || MODE_CONFIG.development;
};

export const isFeatureEnabled = (mode: Mode, feature: string): boolean => {
  const config = getModeConfig(mode);
  return config[feature as keyof typeof config] === true;
};