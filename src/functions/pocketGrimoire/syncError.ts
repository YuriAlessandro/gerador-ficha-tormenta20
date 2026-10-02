/** Código do 409 do backend quando a conta passaria de 100 grimórios. */
export const GRIMOIRE_LIMIT_CODE = 'GRIMOIRE_LIMIT';

/**
 * `network`: sem resposta (offline) — tenta de novo ao reconectar.
 * `server`: 5xx — tenta de novo na próxima oportunidade.
 * `rejected`: 4xx — o servidor recusou; não repete sozinho.
 */
export type GrimoireSyncErrorKind = 'network' | 'server' | 'rejected';

export class GrimoireSyncError extends Error {
  readonly kind: GrimoireSyncErrorKind;

  readonly code?: string;

  constructor(kind: GrimoireSyncErrorKind, message: string, code?: string) {
    super(message);
    this.name = 'GrimoireSyncError';
    this.kind = kind;
    this.code = code;
  }
}
