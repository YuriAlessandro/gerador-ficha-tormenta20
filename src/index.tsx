import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/index.css';
import { BrowserRouter as HashRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as ReactGAConfig from './reactGA.config';

// PWA Service Worker Registration

ReactGAConfig.setup();

// Register PWA Service Worker
const updateSW = registerSW({
  immediate: true, // Check for updates immediately on load
  onNeedRefresh() {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Nova versão disponível! Clique OK para atualizar.')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // eslint-disable-next-line no-console
    console.log('App pronto para uso offline!');
  },
  onRegistered(registration) {
    // Check for updates every 5 minutes
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);
    }
  },
});

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
