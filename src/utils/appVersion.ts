/**
 * Versão do app, vinda de `package.json` via `define` do Vite.
 *
 * O `typeof` é proposital: o Vite/esbuild substitui a expressão inteira em build
 * time, então o guard não custa nada no bundle — mas evita `ReferenceError` em
 * qualquer consumidor que rode fora do pipeline do Vite.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const APP_VERSION =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

/**
 * Sinais de build defasado. Com `registerType: 'prompt'` (+ `skipWaiting: false`),
 * quem dispensa o aviso de atualização continua rodando JS antigo por tempo
 * indeterminado — e reporta bugs já corrigidos. Sem esses dois campos não dá
 * para separar um bug real de um cache velho.
 */
export function getBuildDiagnostics(): {
  serviceWorker: string;
  pendingUpdate: string;
} {
  const hasSW =
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  let pendingUpdate = 'desconhecido';
  try {
    pendingUpdate =
      sessionStorage.getItem('pwa-has-pending-update') === 'true'
        ? 'sim'
        : 'não';
  } catch {
    // sessionStorage bloqueado (modo privado/embed) — mantém 'desconhecido'
  }

  return {
    serviceWorker: (() => {
      if (!hasSW) return 'indisponível';
      return navigator.serviceWorker.controller ? 'ativo' : 'inativo';
    })(),
    pendingUpdate,
  };
}

export default APP_VERSION;
