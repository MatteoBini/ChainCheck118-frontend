import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/data-grid.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root mancante in index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
