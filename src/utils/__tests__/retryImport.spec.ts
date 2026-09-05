import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import retryImport from '../retryImport';

const chunkError = () =>
  new Error(
    'Failed to fetch dynamically imported module: https://fichasdenimb.com.br/assets/MainScreen-6e620ac8.js'
  );

describe('retryImport', () => {
  const reload = vi.fn();
  const cacheDelete = vi.fn().mockResolvedValue(true);
  const unregister = vi.fn().mockResolvedValue(true);
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });

  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    reload.mockClear();
    cacheDelete.mockClear();
    unregister.mockClear();
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    });
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: {
        keys: () => Promise.resolve(['fdn-v4.31.0-static', 'workbox-precache']),
        delete: cacheDelete,
      },
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistrations: () => Promise.resolve([{ unregister }]),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('não repete quando a primeira tentativa dá certo', async () => {
    const factory = vi.fn().mockResolvedValue({ default: 'Tela' });

    await expect(retryImport(factory)()).resolves.toEqual({ default: 'Tela' });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(unregister).not.toHaveBeenCalled();
  });

  it('repete e resolve quando a falha é transitória', async () => {
    const factory = vi
      .fn()
      .mockRejectedValueOnce(chunkError())
      .mockResolvedValue({ default: 'Tela' });

    const promise = retryImport(factory)();
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ default: 'Tela' });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(reload).not.toHaveBeenCalled();
  });

  it('recarrega a página depois de esgotar as tentativas', async () => {
    const factory = vi.fn().mockRejectedValue(chunkError());

    const promise = retryImport(factory)();
    let settled = false;
    promise.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      }
    );
    await vi.runAllTimersAsync();

    expect(factory).toHaveBeenCalledTimes(3);
    expect(reload).toHaveBeenCalledTimes(1);
    // A entrada envenenada mora no dispositivo, em duas camadas. Esvaziar o
    // Cache Storage tira o SW do caminho...
    expect(cacheDelete).toHaveBeenCalledTimes(2);
    // ...e só então o GET com `cache: 'reload'` consegue reescrever a entrada
    // do cache HTTP, que o `immutable` de 1 ano prenderia.
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fichasdenimb.com.br/assets/MainScreen-6e620ac8.js',
      { cache: 'reload', credentials: 'same-origin' }
    );
    expect(unregister).toHaveBeenCalledTimes(1);
    // A promise fica pendente de propósito: a página está sendo recarregada e
    // o Suspense deve continuar no fallback em vez de piscar o ErrorBoundary.
    expect(settled).toBe(false);
  });

  it('não recarrega duas vezes dentro da janela de proteção', async () => {
    const factory = vi.fn().mockRejectedValue(chunkError());

    // Primeira falha: recarrega e a promise fica pendente.
    retryImport(factory)();
    await vi.runAllTimersAsync();
    expect(reload).toHaveBeenCalledTimes(1);

    // Segunda: a janela de proteção ainda vale, então o erro sobe em vez de
    // recarregar de novo. A asserção precisa ser registrada antes de rodar os
    // timers, senão a rejeição fica sem tratador no meio do caminho.
    const second = retryImport(factory)();
    const rejected = expect(second).rejects.toThrow(
      'Failed to fetch dynamically imported module'
    );
    await vi.runAllTimersAsync();
    await rejected;
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('recupera mesmo quando a mensagem não traz a URL do módulo', async () => {
    const factory = vi
      .fn()
      .mockRejectedValue(
        new Error('error loading dynamically imported module')
      );

    retryImport(factory)();
    await vi.runAllTimersAsync();

    // Sem URL não há o que reparar no cache HTTP, mas o resto da recuperação
    // precisa acontecer assim mesmo.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cacheDelete).toHaveBeenCalledTimes(2);
    expect(unregister).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('deixa passar erro que não é de carga de chunk, sem repetir', async () => {
    const factory = vi.fn().mockRejectedValue(new Error('boom no módulo'));

    await expect(retryImport(factory)()).rejects.toThrow('boom no módulo');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
    expect(unregister).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
