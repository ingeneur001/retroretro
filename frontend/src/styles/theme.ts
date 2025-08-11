// styles/theme.ts - Professionelle Theme-Definition
import { createGlobalStyle } from 'styled-components';

export interface Theme {
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fonts: {
    primary: string;
    arcade: string;
    monospace: string;
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      title: string;
      display: string;
    };
    weights: {
      light: number;
      normal: number;
      medium: number;
      bold: string; // String für CSS-Kompatibilität
    };
  };
  colors: {
    // Base Colors
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceHover: string;
    surfaceActive: string;
    
    // Text Colors
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // Brand Colors
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    
    // Status Colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Gaming-specific Colors
    score: string;
    scoreHighlight: string;
    settings: string;
    settingsActive: string;
    leaderboard: string;
    achievement: string;
    
    // Neon Colors
    neon: {
      pink: string;
      blue: string;
      green: string;
      yellow: string;
      orange: string;
      purple: string;
      cyan: string;
    };
    
    // Border Colors
    border: string;
    borderHover: string;
    borderActive: string;
    
    // Game-specific
    game: {
      player: string;
      enemy: string;
      powerup: string;
      ui: string;
      background: string;
    };
    
    // Payment Colors
    payment: {
      success: string;
      pending: string;
      failed: string;
    };
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
  effects: {
    neonGlow: string;
    buttonHover: string;
    cardShadow: string;
    glow: string;
    scoreGlow: string;
    settingsGlow: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    tooltip: number;
    overlay: number;
    notification: number;
  };
}

// Dark Retro Arcade Theme - VOLLSTÄNDIG
export const darkArcadeTheme: Theme = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  fonts: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    arcade: '"Press Start 2P", "Courier New", monospace',
    monospace: '"Fira Code", "Monaco", "Consolas", monospace',
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
      title: '2rem',    // 32px
      display: '3rem',  // 48px
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: '700', // String für CSS
    },
  },
  
  colors: {
    // Base Colors
    background: '#0a0a0f',
    backgroundSecondary: '#1a1a2e',
    surface: '#16213e',
    surfaceHover: '#1e2a4a',
    surfaceActive: '#233456',
    
    // Text Colors
    text: '#ffffff',
    textSecondary: '#e0e0e0',
    textMuted: '#a0a0a0',
    textInverse: '#000000',
    
    // Brand Colors
    primary: '#ff006e',
    primaryHover: '#e6005e',
    secondary: '#8338ec',
    secondaryHover: '#7028dc',
    accent: '#3a86ff',
    
    // Status Colors
    success: '#06ffa5',
    warning: '#ffbe0b',
    error: '#ff006e',
    info: '#3a86ff',
    
    // Gaming-specific Colors
    score: '#ffff00',          // Neon Gelb für Scores
    scoreHighlight: '#ffd700', // Gold für High Scores
    settings: '#00ffff',       // Cyan für Settings
    settingsActive: '#ff00ff', // Magenta für aktive Settings
    leaderboard: '#ff6b35',    // Orange für Leaderboard
    achievement: '#32cd32',    // Lime Green für Achievements
    
    // Neon Colors
    neon: {
      pink: '#ff10f0',
      blue: '#10f0ff',
      green: '#39ff14',
      yellow: '#ffff10',
      orange: '#ff8c10',
      purple: '#bf00ff',
      cyan: '#00ffff',
    },
    
    // Border Colors
    border: '#333354',
    borderHover: '#404060',
    borderActive: '#505070',
    
    // Game-specific
    game: {
      player: '#39ff14',
      enemy: '#ff10f0',
      powerup: '#ffff10',
      ui: '#10f0ff',
      background: '#0f0f23',
    },
    
    // Payment Colors
    payment: {
      success: '#06ffa5',
      pending: '#ffbe0b',
      failed: '#ff006e',
    },
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  
  animations: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '400ms ease-in-out',
  },
  
  effects: {
    neonGlow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
    buttonHover: 'transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255, 16, 240, 0.3);',
    cardShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(255, 16, 240, 0.5)',
    scoreGlow: '0 0 15px #ffff00, 0 0 25px #ffff00',
    settingsGlow: '0 0 15px #00ffff, 0 0 25px #00ffff',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  
  zIndex: {
    dropdown: 100,
    modal: 200,
    tooltip: 300,
    overlay: 400,
    notification: 500,
  },
};

// Light Theme (optional)
export const lightArcadeTheme: Theme = {
  ...darkArcadeTheme,
  colors: {
    ...darkArcadeTheme.colors,
    background: '#f8f9fa',
    backgroundSecondary: '#e9ecef',
    surface: '#ffffff',
    surfaceHover: '#f1f3f4',
    surfaceActive: '#e8eaed',
    
    text: '#212529',
    textSecondary: '#495057',
    textMuted: '#6c757d',
    textInverse: '#ffffff',
    
    border: '#dee2e6',
    borderHover: '#ced4da',
    borderActive: '#adb5bd',
  },
};

// Global Styles
export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@300;400;500;700&family=Fira+Code:wght@400;500&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: ${props => props.theme.fonts.primary};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
  
  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Styled Components Theme Declaration
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

export default darkArcadeTheme;