import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/index.css';
import { BrowserRouter as HashRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import OwlbearAuthBridge from './components/OwlbearAuthBridge';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import reportWebVitals from './reportWebVitals';
import * as ReactGAConfig from './reactGA.config';

/**
 * Bootstrap do app principal.
 *
 * Tudo que só o app precisa vive DENTRO desta função — analytics, service
 * worker, providers — para que a rota do Portrait (abaixo) possa simplesmente
 * não chamá-la. Ver o comentário no branch, no fim do arquivo.
 */
function bootstrapApp() {
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
      try {
        sessionStorage.setItem('pwa-has-pending-update', 'true');
      } catch {
        // sessionStorage indisponível (ex.: embed com storage bloqueado).
      }
      window.dispatchEvent(new CustomEvent('pwa-update-available'));
    },
    onOfflineReady() {
      // eslint-disable-next-line no-console
      console.log('[PWA] App pronto para uso offline!');
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      // eslint-disable-next-line no-console
      console.log('[PWA] Service Worker registrado');
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

  // Página standalone de login das extensões (Owlbear Rodeo e Roll20). Renderiza
  // sem o chrome/providers do app principal — apenas o auth bridge. Os dois
  // caminhos servem o mesmo componente; a origem de quem pede o token é validada
  // dentro dele.
  if (
    window.location.pathname === '/owlbear-auth' ||
    window.location.pathname === '/roll20-auth'
  ) {
    ReactDOM.render(
      <React.StrictMode>
        <OwlbearAuthBridge />
      </React.StrictMode>,
      document.getElementById('root')
    );
  } else {
    ReactDOM.render(
      <React.StrictMode>
        <HashRouter>
          <App />
          <PWAUpdatePrompt onUpdate={handlePWAUpdate} />
        </HashRouter>
      </React.StrictMode>,
      document.getElementById('root')
    );
  }
}

/**
 * Portrait — overlay de stream (`/portrait/:token`), carregado como Browser
 * Source no OBS.
 *
 * O branch é o ponto todo: ele NÃO chama `bootstrapApp()`, e com isso a página
 * do overlay não monta nada do app. Isso é requisito, não otimização:
 *  - `ReactGAConfig.setup()` registraria um pageview de `/portrait/<token>`,
 *    mandando o TOKEN para o Google;
 *  - `registerSW()` faria o prompt de "nova versão disponível" renderizar por
 *    cima do overlay no meio de uma live;
 *  - `redux-persist` compartilharia `localStorage` com a aba do streamer (o OBS
 *    roda na MESMA origem) — risco real de escrita cruzada em `fdnHistoric`;
 *  - `AuthProvider` inicializaria Firebase Auth numa página sem sessão, e
 *    `Dice3DProvider` carregaria o wasm do `dice-box` sem ninguém para rolar.
 *
 * O branch de `/owlbear-auth` acima roda DEPOIS do GA e do service worker — é
 * dívida daquela página, não um padrão a copiar.
 */
if (window.location.pathname.startsWith('/portrait/')) {
  import('./portrait/mountPortrait').then((m) => m.default());
} else {
  bootstrapApp();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
