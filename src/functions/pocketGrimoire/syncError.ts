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
