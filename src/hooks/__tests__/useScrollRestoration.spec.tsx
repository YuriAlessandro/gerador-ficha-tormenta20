import React from 'react';
import { act, render } from '@testing-library/react';
import { MemoryRouter, Route, useHistory } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollRestoration } from '../useScrollRestoration';

const KEY = 'scroll-restoration:/lista?busca=orc';

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
  });
};

const setup = (ready: boolean, initialUrl = '/lista?busca=orc') => {
  const result = {
    history: undefined as unknown as ReturnType<typeof useHistory>,
  };

  const Probe: React.FC<{ isReady: boolean }> = ({ isReady }) => {
    useScrollRestoration(isReady);
    result.history = useHistory();
    return null;
  };

  const view = render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <Probe isReady={ready} />
    </MemoryRouter>
  );
  const rerender = (isReady: boolean) =>
    view.rerender(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Probe isReady={isReady} />
      </MemoryRouter>
    );
  return { result, rerender };
};

const scrollTo = vi.fn();

describe('useScrollRestoration', () => {
  beforeEach(() => {
    sessionStorage.clear();
    scrollTo.mockClear();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    setScrollY(0);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restaura a posição salva só quando o conteúdo fica pronto', () => {
    sessionStorage.setItem(KEY, '850');
    const { rerender } = setup(false);
    expect(scrollTo).not.toHaveBeenCalled();

    rerender(true);
    expect(scrollTo).toHaveBeenCalledWith(0, 850);
  });

  it('não sobrescreve a posição salva enquanto espera o conteúdo', () => {
    sessionStorage.setItem(KEY, '850');
    setup(false);

    setScrollY(120);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(sessionStorage.getItem(KEY)).toBe('850');
  });

  it('salva a posição ao rolar', () => {
    setup(true);

    setScrollY(640);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(sessionStorage.getItem(KEY)).toBe('640');
  });

  it('ignora rolagens depois de sair da tela', () => {
    const { result } = setup(true);

    act(() => {
      result.history.push('/item/1');
    });
    setScrollY(30);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(sessionStorage.getItem(KEY)).toBe('0');
  });

  it('não restaura ao chegar por um link (PUSH)', () => {
    sessionStorage.setItem(KEY, '850');
    const nav = {
      history: undefined as unknown as ReturnType<typeof useHistory>,
    };
    const Probe: React.FC = () => {
      useScrollRestoration(true);
      return null;
    };
    const Nav: React.FC = () => {
      nav.history = useHistory();
      return null;
    };
    render(
      <MemoryRouter initialEntries={['/inicio']}>
        <Nav />
        <Route path='/lista' component={Probe} />
      </MemoryRouter>
    );

    act(() => {
      nav.history.push('/lista?busca=orc');
    });

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
