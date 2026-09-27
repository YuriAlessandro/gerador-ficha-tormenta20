import { SupplementId } from '../types/supplement.types';

/**
 * Suplementos extras para desenvolvimento, lidos de `VITE_DEV_SUPPLEMENTS`
 * (lista separada por vírgula; ex.: `tormenta20-herois-de-arton`).
 *
 * Fora do build com login não há como ativar suplemento pela UI: a lista
 * vem de `dbUser.enabledSupplements` (backend). Em `npm start`, o `.env.local`
 * (gitignored) permite testar conteúdo de suplemento sem subir backend.
 *
 * Só age em modo development: em `vite build` o Vite substitui MODE por
 * `'production'` e elimina o bloco; em testes MODE é `'test'`, então um
 * `VITE_DEV_SUPPLEMENTS` no `.env.local` não contamina a suíte.
 */
export function getDevSupplements(): SupplementId[] {
  if (import.meta.env.MODE !== 'development') return [];

  const raw = import.meta.env.VITE_DEV_SUPPLEMENTS as string | undefined;
  if (!raw) return [];

  const valid = new Set<string>(Object.values(SupplementId));
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => valid.has(s));

  return [...new Set(ids)] as SupplementId[];
}
