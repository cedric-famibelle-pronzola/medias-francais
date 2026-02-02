// Version avec react-router-dom
// Pour l'utiliser, remplace main.tsx par ce fichier

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './AppWithRouter';
import { SEOProvider } from '@/components/SEOProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SEOProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SEOProvider>
  </StrictMode>,
);
