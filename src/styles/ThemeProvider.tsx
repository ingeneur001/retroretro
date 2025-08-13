// src/styles/ThemeProvider.tsx
import React from 'react';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { darkArcadeTheme } from './theme'; // ← GEÄNDERT: darkArcadeTheme statt retroTheme

// Global Styles basierend auf RetroArcadeHome
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    overflow-x: hidden;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
  
  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #e55555;
  }
  
  /* Focus styles */
  *:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  /* Disable text selection on UI elements */
  button, .no-select {
    user-select: none;
  }
  
  /* Smooth animations */
  * {
    transition: background-color ${({ theme }) => theme.animations.normal},
                border-color ${({ theme }) => theme.animations.normal},
                color ${({ theme }) => theme.animations.normal};
  }
`;

interface RetroThemeProviderProps {
  children: React.ReactNode;
}

export const RetroThemeProvider: React.FC<RetroThemeProviderProps> = ({ children }) => {
  return (
    <StyledThemeProvider theme={darkArcadeTheme}>  {/* ← GEÄNDERT: darkArcadeTheme statt retroTheme */}
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  );
};

export default RetroThemeProvider;