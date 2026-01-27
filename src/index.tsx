import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/index.css';
import { BrowserRouter as HashRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import reportWebVitals from './reportWebVitals';
import * as ReactGAConfig from './reactGA.config';

// PWA Service Worker Registration

ReactGAConfig.setup();

// Store the updateSW function globally so the PWAUpdatePrompt component can use it
let globalUpdateSW: ((reloadPage?: boolean) => void) | null = null;

// Register PWA Service Worker
const updateSW = registerSW({
  immediate: true, // Check for updates immediately on load
  onNeedRefresh() {
    // Dispatch a custom event that the PWAUpdatePrompt component listens for
    // eslint-disable-next-line no-console
    console.log('[PWA] Nova versão disponível - mostrando notificação');
    sessionStorage.setItem('pwa-has-pending-update', 'true');
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onOfflineReady() {
    // eslint-disable-next-line no-console
    console.log('[PWA] App pronto para uso offline!');
  },
  onRegisteredSW(swUrl, registration) {
    // eslint-disable-next-line no-console
    console.log('[PWA] Service Worker registrado:', swUrl);
    // Check for updates every 2 minutes (more frequent for faster updates)
    if (registration) {
      setInterval(() => {
        // eslint-disable-next-line no-console
        console.log('[PWA] Verificando atualizações...');
        registration.update();
      }, 2 * 60 * 1000);
    }
  },
});

globalUpdateSW = updateSW;

// Function to handle the update from the PWAUpdatePrompt component
const handlePWAUpdate = (reloadPage?: boolean) => {
  if (globalUpdateSW) {
    sessionStorage.removeItem('pwa-has-pending-update');
    globalUpdateSW(reloadPage);
  }
};

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <PWAUpdatePrompt onUpdate={handlePWAUpdate} />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
