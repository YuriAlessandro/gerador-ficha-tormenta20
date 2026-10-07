import { useState } from 'react';

export type GrimoireViewMode = 'list' | 'cards';

const STORAGE_KEY = 'fdn-grimoire-view';

const read = (): GrimoireViewMode => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'cards'
      ? 'cards'
      : 'list';
  } catch {
    return 'list';
  }
};

/**
 * Lista ou cartas. É conveniência de quem está vendo (não dado do grimório),
 * então fica no localStorage deste navegador — e a página funciona igual se
 * ele estiver indisponível.
 */
export function useGrimoireViewMode(): [
  GrimoireViewMode,
  (mode: GrimoireViewMode) => void
] {
  const [mode, setMode] = useState<GrimoireViewMode>(read);
  const update = (next: GrimoireViewMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sem storage (aba anônima, bloqueio): a escolha vale só nesta visita.
    }
  };
  return [mode, update];
}
