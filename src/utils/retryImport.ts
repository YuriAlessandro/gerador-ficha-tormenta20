/**
 * Repetição e auto-cura para os `import()` dinâmicos das telas lazy.
 *
 * `React.lazy(() => import('./Tela'))` só tem uma chance: se o GET do chunk
 * falhar, o erro sobe direto para o ErrorBoundary com "Failed to fetch
 * dynamically imported module". O módulo em si está íntegro no servidor — o que
 * quebra é a cópia local.
 *
 * De onde vem a cópia podre: o `_redirects` do Cloudflare Pages termina em
 * `/* /index.html 200` e o Pages não aceita 404 ali, então um asset que falte
 * por um instante (janela de propagação de um deploy) devolve 200 com o HTML do
 * SPA. Esse HTML é guardado sob a URL do `.js` em duas camadas, as duas de
 * longa duração:
 *
 * - o Cache Storage do service worker (regra `StaleWhileRevalidate`, 7 dias);
 * - o cache HTTP do navegador, onde o `_headers` carimba `/assets/*` como
 *   `immutable` por um ano — e `immutable` significa que o navegador não
 *   revalida nem em reload normal.
 *
 * A segunda é a que faz o problema durar: enquanto ela existir, até a
 * revalidação do próprio service worker busca e reencontra o HTML. Por isso um
 * reload simples não resolve, e por isso a ordem dos passos abaixo importa.
 *
 * Escalada:
 *
 * 1. Até 3 tentativas com backoff, só para erro de carga de chunk. Resolve o
 *    caso transitório sem que o usuário perceba.
 * 2. Esvazia o Cache Storage — tira a camada do service worker do caminho.
 * 3. Refaz o GET do módulo com `cache: 'reload'`. Com o Cache Storage vazio o
 *    SW repassa a requisição, e o modo `reload` atravessa o `immutable` e
 *    **reescreve** a entrada do cache HTTP com a resposta boa. É o único passo
 *    que desfaz o envenenamento de verdade.
 * 4. Desregistra o service worker e recarrega.
 *
 * Acontece no máximo uma vez por minuto (marca em `sessionStorage`) para não
 * virar laço de recarga quando o problema for de verdade — na segunda vez o
 * erro sobe para o ErrorBoundary.
 *
 * Erro que não seja de carga de chunk (um `throw` no topo do módulo, por
 * exemplo) passa direto, sem repetir nem recarregar.
 */

const MAX_RETRIES = 2; // 1 tentativa inicial + 2 repetições
const BASE_DELAY_MS = 350;
const RELOAD_STAMP_KEY = 'fdn:chunkReloadAt';
const RELOAD_COOLDOWN_MS = 60 * 1000;

/**
 * O texto varia por navegador e nenhum deles expõe um tipo de erro próprio:
 * Chrome/Edge dizem "Failed to fetch dynamically imported module", Firefox
 * "error loading dynamically imported module", Safari "Importing a module
 * script failed". O caso de MIME errado (fallback do SPA servido no lugar do
 * .js) aparece como "Expected a JavaScript module script...".
 */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|module script failed|JavaScript module script|Loading chunk|ChunkLoadError/i.test(
    message
  );
}

/**
 * Os navegadores põem a URL do módulo na própria mensagem — é a única forma de
 * saber qual arquivo reparar, já que o factory do `import()` não a expõe.
 */
function extractModuleUrl(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/https?:\/\/[^\s'"]+\.(?:m?js|css)\b/);
  return match ? match[0] : null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Marca o reload e diz se ele pode acontecer agora. */
function claimReload(): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_STAMP_KEY)) || 0;
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    window.sessionStorage.setItem(RELOAD_STAMP_KEY, String(Date.now()));
    return true;
  } catch {
    // sessionStorage bloqueado (modo privado, cookies de terceiros): sem onde
    // guardar a marca, recarregar arriscaria um laço. Melhor mostrar o erro.
    return false;
  }
}

/**
 * Último recurso. Best-effort do começo ao fim: qualquer passo que falhe não
 * impede o reload, porque a alternativa é a tela de erro.
 */
async function recoverAndReload(moduleUrl: string | null): Promise<void> {
  try {
    if ('caches' in window) {
      const names = await window.caches.keys();
      await Promise.all(names.map((name) => window.caches.delete(name)));
    }

    if (moduleUrl) {
      await fetch(moduleUrl, { cache: 'reload', credentials: 'same-origin' });
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
  } catch {
    // Storage/SW/rede indisponível: segue para o reload mesmo assim.
  }

  window.location.reload();
}

function attempt<T>(
  factory: () => Promise<T>,
  retriesLeft: number,
  delay: number
): Promise<T> {
  return factory().catch((error: unknown) => {
    if (!isChunkLoadError(error)) throw error;

    if (retriesLeft > 0) {
      return wait(delay).then(() =>
        attempt(factory, retriesLeft - 1, delay * 2)
      );
    }

    if (claimReload()) {
      recoverAndReload(extractModuleUrl(error));
      // A página está indo embora: uma promise que nunca resolve mantém o
      // Suspense no fallback em vez de piscar a tela de erro antes do reload.
      return new Promise<T>(() => undefined);
    }

    throw error;
  });
}

/**
 * Envolve o factory de um `import()` dinâmico. Uso:
 * `React.lazy(retryImport(() => import('./Tela')))`.
 */
export default function retryImport<T>(
  factory: () => Promise<T>
): () => Promise<T> {
  return () => attempt(factory, MAX_RETRIES, BASE_DELAY_MS);
}
