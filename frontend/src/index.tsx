// ========================================
// MINIMALER INDEX.TSX FIX
// Datei: frontend/src/index.tsx
// ========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import App from './App';
import './index.css';

// Minimale Props-Filterung - nur für deine spezifischen Warnings
const shouldForwardProp = (prop: string) => {
  // Filtere nur die Props die aktuell Warnings verursachen
  const problematicProps = ['connected', 'show', 'status'];
  return !problematicProps.includes(prop);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <App />
    </StyleSheetManager>
  </React.StrictMode>
);