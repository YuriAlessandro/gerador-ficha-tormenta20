import React from 'react';
import { act, render } from '@testing-library/react';
import { MemoryRouter, useHistory } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUrlFilters, UseUrlFiltersResult } from '../useUrlFilters';

interface Filters {
  search: string;
  page: number;
}

const parse = (search: string): Filters => {
  const params = new URLSearchParams(search);
  const page = Number(params.get('pagina'));
  return {
    search: params.get('busca') ?? '',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
};

const serialize = (filters: Filters): string => {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('busca', filters.search.trim());
  if (filters.page > 1) params.set('pagina', String(filters.page));
  return params.toString();
};

/**
 * Sonda em vez de `renderHook`: o @testing-library/react do React 17 não
 * exporta o helper. Guarda também o `history` do MemoryRouter.
 */
const setup = (initialUrl = '/lista') => {
  const result = {
    current: undefined as unknown as UseUrlFiltersResult<Filters>,
    history: undefined as unknown as ReturnType<typeof useHistory>,
  };

  const Probe: React.FC = () => {
    result.current = useUrlFilters({ parse, serialize });
    result.history = useHistory();
    return null;
  };

  const view = render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <Probe />
    </MemoryRouter>
  );
  return { result, unmount: view.unmount };
};

describe('useUrlFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lê o estado inicial da URL', () => {
    const { result } = setup('/lista?busca=lobo&pagina=3');
    const [filters, , applied] = result.current;
    expect(filters).toEqual({ search: 'lobo', page: 3 });
    expect(applied).toEqual({ search: 'lobo', page: 3 });
  });

  it('atualiza os filtros na hora e a URL/aplicados só após o debounce', () => {
    const { result } = setup();

    act(() => {
      result.current[1]((prev) => ({ ...prev, search: 'orc' }));
    });
    expect(result.current[0].search).toBe('orc');
    expect(result.current[2].search).toBe('');
    expect(result.history.location.search).toBe('');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current[2].search).toBe('orc');
    expect(result.history.location.search).toBe('?busca=orc');
    expect(result.history.action).toBe('REPLACE');
  });

  it('agrupa mudanças rápidas numa escrita só, sem empilhar histórico', () => {
    const { result } = setup();
    const lengthBefore = result.history.length;

    act(() => {
      result.current[1]({ search: 'o', page: 1 });
      vi.advanceTimersByTime(100);
      result.current[1]({ search: 'or', page: 1 });
      vi.advanceTimersByTime(100);
      result.current[1]({ search: 'orc', page: 1 });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.history.location.search).toBe('?busca=orc');
    expect(result.history.length).toBe(lengthBefore);
  });

  it('`immediate` escreve sem esperar o debounce', () => {
    const { result } = setup();

    act(() => {
      result.current[1]({ search: '', page: 2 }, { immediate: true });
    });

    expect(result.history.location.search).toBe('?pagina=2');
    expect(result.current[2].page).toBe(2);
  });

  it('`push` cria uma entrada nova no histórico', () => {
    const { result } = setup();
    const lengthBefore = result.history.length;

    act(() => {
      result.current[1]({ search: '', page: 2 }, { push: true });
    });

    expect(result.history.action).toBe('PUSH');
    expect(result.history.length).toBe(lengthBefore + 1);
    expect(result.current[2].page).toBe(2);
  });

  it('uma escrita imediata descarta a escrita pendente', () => {
    const { result } = setup();

    act(() => {
      result.current[1]({ search: 'orc', page: 1 });
      result.current[1]({ search: 'orc', page: 2 }, { immediate: true });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.history.location.search).toBe('?busca=orc&pagina=2');
  });

  it('reage a navegação externa (voltar/avançar, links)', () => {
    const { result } = setup('/lista?busca=lobo');

    act(() => {
      result.current[1]({ search: 'lobo', page: 2 }, { push: true });
    });
    act(() => {
      result.history.goBack();
    });

    expect(result.current[0]).toEqual({ search: 'lobo', page: 1 });
    expect(result.current[2]).toEqual({ search: 'lobo', page: 1 });

    act(() => {
      result.history.push('/lista?busca=orc');
    });
    expect(result.current[0]).toEqual({ search: 'orc', page: 1 });
  });

  it('navegação externa cancela a escrita pendente', () => {
    const { result } = setup();

    act(() => {
      result.current[1]({ search: 'digitando', page: 1 });
    });
    act(() => {
      result.history.push('/lista?busca=orc');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.history.location.search).toBe('?busca=orc');
    expect(result.current[0].search).toBe('orc');
  });

  it('não escreve na URL depois de desmontar', () => {
    const { result, unmount } = setup();
    const { history } = result;

    act(() => {
      result.current[1]({ search: 'orc', page: 1 });
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(history.location.search).toBe('');
  });

  it('mantém a identidade dos aplicados quando a URL não muda', () => {
    const { result } = setup('/lista?busca=orc');
    const appliedBefore = result.current[2];

    act(() => {
      result.current[1]({ search: 'orc ', page: 1 });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current[0].search).toBe('orc ');
    expect(result.current[2]).toBe(appliedBefore);
  });

  it('preserva o caminho e o hash ao reescrever a query', () => {
    const { result } = setup('/lista#topo');

    act(() => {
      result.current[1]({ search: 'orc', page: 1 }, { immediate: true });
    });

    expect(result.history.location.pathname).toBe('/lista');
    expect(result.history.location.hash).toBe('#topo');
  });
});
