import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export interface UseUrlFiltersOptions<T> {
  /** Lê os filtros da query string; valores desconhecidos devem cair no padrão. */
  parse: (search: string) => T;
  /** Query string (sem o `?`) dos filtros, omitindo o que está no padrão. */
  serialize: (filters: T) => string;
  /** Espera antes de escrever na URL e aplicar os filtros. Padrão: 300ms. */
  debounceMs?: number;
}

export interface SetUrlFiltersOptions {
  /** Escreve na hora, sem debounce (ex.: troca de página). */
  immediate?: boolean;
  /** Cria uma entrada nova no histórico em vez de substituir a atual (ex.:
   *  entrar numa pasta, que o "voltar" deve desfazer). Implica `immediate`. */
  push?: boolean;
}

export type SetUrlFilters<T> = (
  update: T | ((prev: T) => T),
  options?: SetUrlFiltersOptions
) => void;

/**
 * `[filtros, setFiltros, aplicados]`:
 * - `filtros` muda na hora (é o que os campos exibem);
 * - `aplicados` só muda junto com a URL, depois do debounce. É o que deve
 *   disparar a busca, para não haver uma requisição por tecla.
 */
export type UseUrlFiltersResult<T> = [T, SetUrlFilters<T>, T];

const stripQuestionMark = (search: string) => search.replace(/^\?/, '');

/**
 * Espelha os filtros de uma listagem na query string, para que sobrevivam a
 * abrir um item e voltar, e para que a URL filtrada seja compartilhável.
 *
 * Cada tela fornece o seu par `parse`/`serialize` (funções puras, testáveis à
 * parte). Navegações externas (voltar/avançar, links para a mesma tela com
 * outra query) são relidas da URL e cancelam a escrita pendente.
 */
export function useUrlFilters<T>({
  parse,
  serialize,
  debounceMs = 300,
}: UseUrlFiltersOptions<T>): UseUrlFiltersResult<T> {
  const history = useHistory();
  const location = useLocation();

  const [filters, setFiltersState] = useState<T>(() => parse(location.search));
  const [applied, setApplied] = useState<T>(filters);

  // Refs para os callbacks continuarem estáveis mesmo que a tela passe
  // `parse`/`serialize` recriados a cada render.
  const parseRef = useRef(parse);
  parseRef.current = parse;
  const serializeRef = useRef(serialize);
  serializeRef.current = serialize;

  const filtersRef = useRef(filters);
  const appliedRef = useRef(applied);
  // Última query que este hook escreveu (ou leu): distingue a nossa própria
  // escrita de uma navegação externa.
  const lastQueryRef = useRef(stripQuestionMark(location.search));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Só troca a referência dos aplicados quando a query muda de fato, para não
  // refazer a busca à toa (ex.: digitar e apagar dentro do debounce).
  const apply = useCallback((next: T) => {
    const query = serializeRef.current(next);
    if (query !== serializeRef.current(appliedRef.current)) {
      appliedRef.current = next;
      setApplied(next);
    }
  }, []);

  const commit = useCallback(
    (next: T, push: boolean) => {
      timerRef.current = null;
      const query = serializeRef.current(next);
      const current = history.location;
      if (query !== stripQuestionMark(current.search)) {
        lastQueryRef.current = query;
        const target = {
          pathname: current.pathname,
          search: query ? `?${query}` : '',
          hash: current.hash,
        };
        if (push) {
          history.push(target);
        } else {
          history.replace({ ...target, state: current.state });
        }
      }
      apply(next);
    },
    [history, apply]
  );

  const setFilters = useCallback<SetUrlFilters<T>>(
    (update, options = {}) => {
      const next =
        update instanceof Function ? update(filtersRef.current) : update;
      filtersRef.current = next;
      setFiltersState(next);
      cancelPending();
      if (options.push || options.immediate) {
        commit(next, Boolean(options.push));
      } else {
        timerRef.current = setTimeout(() => commit(next, false), debounceMs);
      }
    },
    [cancelPending, commit, debounceMs]
  );

  // Navegação externa: relê a URL.
  useEffect(() => {
    const query = stripQuestionMark(location.search);
    if (query === lastQueryRef.current) return;
    lastQueryRef.current = query;
    cancelPending();
    const next = parseRef.current(location.search);
    filtersRef.current = next;
    setFiltersState(next);
    apply(next);
  }, [location.search, cancelPending, apply]);

  useEffect(() => cancelPending, [cancelPending]);

  return [filters, setFilters, applied];
}

export default useUrlFilters;
