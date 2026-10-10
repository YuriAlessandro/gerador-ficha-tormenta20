import { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const STORAGE_PREFIX = 'scroll-restoration:';

const storageKey = (location: { pathname: string; search: string }) =>
  `${STORAGE_PREFIX}${location.pathname}${location.search}`;

const readSaved = (key: string): number | null => {
  try {
    const value = Number(sessionStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
};

const writeSaved = (key: string, value: number) => {
  try {
    sessionStorage.setItem(key, String(Math.round(value)));
  } catch {
    // Sem sessionStorage (aba anônima restrita): só não restaura.
  }
};

/**
 * Restaura a rolagem da janela ao voltar para uma listagem.
 *
 * O navegador já tenta restaurar sozinho em navegações POP (o `ScrollToTop`
 * não interfere nelas), mas falha quando a lista vem de uma requisição: no
 * momento do "voltar" a página ainda está curta. Aqui a posição fica salva por
 * URL (caminho + query, que já carrega os filtros) e é reaplicada quando a tela
 * avisa que o conteúdo chegou (`ready`).
 *
 * Em listas com rolagem infinita só dá para voltar até onde a primeira página
 * alcança, então o hook é usado apenas nas listas paginadas ou locais.
 */
export function useScrollRestoration(ready: boolean): void {
  const history = useHistory();
  const location = useLocation();
  const key = storageKey(location);

  // Decidido uma vez, na montagem: só restaura quando se chega por voltar/
  // avançar (ou recarregar), nunca por um link.
  const pendingRef = useRef<number | null | undefined>(undefined);
  if (pendingRef.current === undefined) {
    pendingRef.current = history.action === 'POP' ? readSaved(key) : null;
  }

  useEffect(() => {
    if (!ready || pendingRef.current === null) return;
    window.scrollTo(0, pendingRef.current ?? 0);
    pendingRef.current = null;
  }, [ready]);

  useEffect(() => {
    const save = () => {
      // Antes de restaurar, a posição atual é a da página curta: não salva.
      if (pendingRef.current !== null) return;
      // Depois de sair da tela, eventos de rolagem já são da página seguinte.
      if (storageKey(history.location) !== key) return;
      writeSaved(key, window.scrollY);
    };

    // A URL mudou (ex.: filtro novo) sem rolar: a posição atual vale para ela.
    save();

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        save();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [history, key]);
}

export default useScrollRestoration;
