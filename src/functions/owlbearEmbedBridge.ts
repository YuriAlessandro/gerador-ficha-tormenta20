/**
 * Bridge da ficha embutida no Owlbear Rodeo (lado app principal).
 *
 * A ficha real roda num iframe aninhado dentro da extensão. Como o contexto é
 * particionado (sem sessão Firebase), o token de auth é recebido da extensão
 * (iframe pai) via postMessage. Este módulo:
 *  - anuncia "ready" ao pai e recebe/renova o token;
 *  - expõe `getEmbedToken()` para o api client usar como Bearer;
 *  - encaminha rolagens (`forwardRoll`) para a extensão fazer broadcast no Owlbear;
 *  - encaminha os vitais (`forwardVitals`) para a extensão espelhar o PV na
 *    barra de vida do token.
 *
 * Protocolo (espelhado em extensions/owlbear/src/components/EmbeddedSheet.tsx):
 *  - embed → pai:  { type: 'fdn-embed:ready' }
 *  - pai  → embed: { type: 'fdn-embed:token', token, expiresAt }
 *  - embed → pai:  { type: 'fdn-embed:refresh' }
 *  - embed → pai:  { type: 'fdn-embed:roll', payload }
 *  - embed → pai:  { type: 'fdn-embed:vitals', payload }
 */

export const EMBED_MSG = {
  ready: 'fdn-embed:ready',
  token: 'fdn-embed:token',
  refresh: 'fdn-embed:refresh',
  roll: 'fdn-embed:roll',
  vitals: 'fdn-embed:vitals',
} as const;

/**
 * PV/Defesa da ficha aberta, para a extensão espelhar na barra de vida do token.
 * Ameaça não tem PV atual na ficha (só o máximo), então `currentPv` fica de fora
 * nesse caso — quem controla o dano do monstro é o mestre, na própria barra.
 */
export interface OwlbearVitalsPayload {
  kind: 'player' | 'threat';
  maxPv: number;
  currentPv?: number;
  tempPv?: number;
  defense?: number;
}

let currentToken: string | null = null;
let expiresAt = 0;
let parentOrigin = '*';
let started = false;
const tokenWaiters: Array<(token: string | null) => void> = [];

/** True quando rodando dentro de um iframe (provável embed do Owlbear). */
export function isOwlbearEmbedded(): boolean {
  return typeof window !== 'undefined' && window.parent !== window;
}

function tokenValid(): boolean {
  // Margem de 60s para evitar usar token prestes a expirar.
  return (
    Boolean(currentToken) &&
    (expiresAt === 0 || expiresAt - 60_000 > Date.now())
  );
}

function resolveWaiters(): void {
  const waiters = tokenWaiters.splice(0);
  waiters.forEach((w) => w(currentToken));
}

function onMessage(event: MessageEvent): void {
  const data = event.data as {
    type?: string;
    token?: string;
    expiresAt?: number;
  } | null;
  if (!data || data.type !== EMBED_MSG.token) return;
  if (typeof data.token !== 'string') return;
  currentToken = data.token;
  expiresAt = typeof data.expiresAt === 'number' ? data.expiresAt : 0;
  parentOrigin = event.origin || '*';
  resolveWaiters();
}

/** Inicia o bridge: escuta mensagens do pai e anuncia "ready". */
export function startEmbedBridge(): void {
  if (started || !isOwlbearEmbedded()) return;
  started = true;
  window.addEventListener('message', onMessage);
  window.parent.postMessage({ type: EMBED_MSG.ready }, '*');
}

/** Aguarda o primeiro token válido (ou timeout → o que houver). */
export function waitForToken(timeoutMs = 15000): Promise<string | null> {
  if (tokenValid()) return Promise.resolve(currentToken);
  return new Promise((resolve) => {
    let done = false;
    const settle = (token: string | null) => {
      if (done) return;
      done = true;
      resolve(token);
    };
    tokenWaiters.push(settle);
    setTimeout(() => settle(currentToken), timeoutMs);
  });
}

/** Provider para o api client: retorna um Bearer válido, pedindo refresh se preciso. */
export async function getEmbedToken(): Promise<string | null> {
  if (tokenValid()) return currentToken;
  if (isOwlbearEmbedded()) {
    window.parent.postMessage({ type: EMBED_MSG.refresh }, parentOrigin);
  }
  return waitForToken(10000);
}

/** Encaminha uma rolagem para a extensão (que faz broadcast/notification no Owlbear). */
export function forwardRoll(payload: unknown): void {
  if (!isOwlbearEmbedded()) return;
  window.parent.postMessage({ type: EMBED_MSG.roll, payload }, parentOrigin);
}

/**
 * Encaminha os vitais da ficha para a extensão, que os espelha na barra de vida
 * do token. Chamado a cada mudança da ficha: quem decide o que fazer com isso
 * (e se deve fazer algo) é a extensão.
 */
export function forwardVitals(payload: OwlbearVitalsPayload): void {
  if (!isOwlbearEmbedded()) return;
  window.parent.postMessage({ type: EMBED_MSG.vitals, payload }, parentOrigin);
}
