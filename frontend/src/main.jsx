import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AvisosProvider } from './components/Avisos.jsx';
import { ConfirmarProvider } from './components/Confirmar.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AvisosProvider>
      <ConfirmarProvider>
        <App />
      </ConfirmarProvider>
    </AvisosProvider>
  </StrictMode>,
);
