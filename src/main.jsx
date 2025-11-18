// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

//Registrar Service Worker corretamente no Vite
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.log('❌ Erro ao registrar o Service Worker:', error);
      });
  });
}
