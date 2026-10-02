import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  addItem,
  createGrimoire,
  deleteGrimoire,
} from '../pocketGrimoireSlice';
import {
  createSyncEngine,
  GrimoireSyncService,
  mergeMessage,
  REFRESH_INTERVAL_MS,
  REJECTED_MESSAGE,
  SYNC_DEBOUNCE_MS,
} from '../syncEngine';
import { createInitialState } from '../../../../functions/pocketGrimoire/state';
import {
  GrimoireSyncPayload,
  GrimoireSyncResult,
} from '../../../../functions/pocketGrimoire/sync';
import { GrimoireSyncError } from '../../../../functions/pocketGrimoire/syncError';
import { grimoireLimitMessage } from '../../../../functions/pocketGrimoire/limit';
import {
  DEFAULT_GRIMOIRE_ID,
  GrimoireSyncStatus,
  PocketGrimoire,
  PocketGrimoireState,
} from '../../../../interfaces/PocketGrimoire';

/** Deixa as promises pendentes andarem (setImmediate não é falsificado). */
const flush = () =>
  new Promise<void>((resolve) => {
    setImmediate(resolve);
  });

/** Servidor em memória com a regra mínima do backend (limite incluído). */
const createFakeServer = (
  initial: PocketGrimoire[] = [],
  maxGrimoires = 10
) => {
  let stored = [...initial];
  const service = {
    getAll: vi.fn(async () => [...stored]),
    sync: vi.fn(async ({ upserts, deletes, merge }: GrimoireSyncPayload) => {
      stored = stored.filter((g) => !deletes.includes(g.id));
      const rejectedIds: string[] = [];
      upserts.forEach((u) => {
        const exists = stored.some((g) => g.id === u.id);
        if (!exists && !merge && stored.length >= maxGrimoires) {
          rejectedIds.push(u.id);
          return;
        }
        stored = [...stored.filter((g) => g.id !== u.id), u];
      });
      return { grimoires: [...stored], rejectedIds, maxGrimoires };
    }),
  };
  return { service, stored: () => stored };
};

const setup = (
  state: PocketGrimoireState = createInitialState(),
  service: GrimoireSyncService = createFakeServer().service
) => {
  const store = configureStore({
    reducer: { pocketGrimoire: reducer },
    preloadedState: { pocketGrimoire: state },
  });
  const statuses: GrimoireSyncStatus[] = [];
  const notes: Array<[string, string]> = [];
  const engine = createSyncEngine({
    getState: () => store.getState().pocketGrimoire,
    dispatch: store.dispatch,
    service,
    setStatus: (status) => statuses.push(status),
    notify: (message, variant) => notes.push([message, variant]),
  });
  store.subscribe(() => engine.onStoreChange());
  const local = () => store.getState().pocketGrimoire;
  return { store, engine, statuses, notes, local };
};

const ownedState = (userId: string): PocketGrimoireState => {
  const state = createInitialState();
  return { ...state, sync: { ...state.sync, ownerId: userId } };
};

const withItem = (state: PocketGrimoireState, itemId: string) => {
  state.grimoires[0].itemIds = [itemId];
  return state;
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('login', () => {
  it('envia os grimórios do navegador com merge e avisa', async () => {
    const server = createFakeServer();
    const { engine, notes, local } = setup(
      withItem(createInitialState(), 'spell:A'),
      server.service
    );

    engine.setUser('u1');
    await flush();

    expect(server.service.sync).toHaveBeenCalledTimes(1);
    expect(server.service.sync.mock.calls[0][0]).toMatchObject({
      merge: true,
    });
    expect(server.service.sync.mock.calls[0][0].upserts).toHaveLength(1);
    expect(local().sync).toEqual({
      ownerId: 'u1',
      dirty: {},
      deletedIds: [],
      pendingMerge: false,
    });
    expect(notes).toEqual([[mergeMessage(1), 'success']]);
  });

  it('só o "Padrão" intocado: nenhuma requisição até a demanda', async () => {
    const server = createFakeServer();
    const { engine, notes } = setup(createInitialState(), server.service);
    engine.setUser('u1');
    await flush();
    expect(server.service.sync).not.toHaveBeenCalled();
    expect(server.service.getAll).not.toHaveBeenCalled();

    engine.activate();
    await flush();
    expect(server.service.sync.mock.calls[0][0]).toEqual({
      upserts: [],
      deletes: [],
      merge: true,
    });
    expect(notes).toEqual([]);
  });

  it('cópia de outra conta é descartada ao entrar, sem requisição', async () => {
    const server = createFakeServer();
    const { engine, local } = setup(
      withItem(ownedState('u2'), 'spell:Segredo'),
      server.service
    );
    engine.setUser('u1');
    await flush();
    expect(server.service.sync).not.toHaveBeenCalled();
    expect(local().grimoires[0].itemIds).toEqual([]);
    expect(local().sync.ownerId).toBeNull();

    engine.activate();
    await flush();
    expect(server.service.sync.mock.calls[0][0].upserts).toEqual([]);
    expect(local().sync.ownerId).toBe('u1');
  });

  it('primeira edição feita logado ativa o sync, sem aviso de merge', async () => {
    const server = createFakeServer();
    const { engine, store, notes } = setup(
      createInitialState(),
      server.service
    );
    engine.setUser('u1');
    await flush();

    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    await flush();
    expect(server.service.sync).toHaveBeenCalledTimes(1);
    expect(server.service.sync.mock.calls[0][0].merge).toBe(true);
    expect(server.stored()[0].itemIds).toEqual(['spell:A']);
    expect(notes).toEqual([]);
  });
});

describe('limite do plano', () => {
  it('grimório novo além do limite: o resto sobe, ele fica pendente e o aviso sai uma vez', async () => {
    const server = createFakeServer([], 1);
    const { engine, store, local, notes, statuses } = setup(
      ownedState('u1'),
      server.service
    );
    engine.setUser('u1');
    await flush();

    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    const novo = createGrimoire('Excedente');
    store.dispatch(novo);
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();

    expect(server.stored().map((g) => g.id)).toEqual([DEFAULT_GRIMOIRE_ID]);
    expect(Object.keys(local().sync.dirty)).toEqual([novo.payload.id]);
    expect(local().grimoires.map((g) => g.name)).toContain('Excedente');
    expect(notes).toEqual([[grimoireLimitMessage(1), 'error']]);
    expect(statuses[statuses.length - 1]).toBe('error');

    // Não fica reenviando sozinho.
    await vi.advanceTimersByTimeAsync(10 * SYNC_DEBOUNCE_MS);
    expect(server.service.sync).toHaveBeenCalledTimes(1);
  });

  it('abrir vaga e editar de novo sobe o pendente', async () => {
    const server = createFakeServer([], 1);
    const { engine, store, local } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    store.dispatch(createGrimoire('Excedente'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();

    store.dispatch(deleteGrimoire(DEFAULT_GRIMOIRE_ID));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();
    expect(server.stored().map((g) => g.name)).toEqual(['Excedente']);
    expect(local().sync.dirty).toEqual({});
  });
});

describe('abertura logado', () => {
  it('sem pendências: busca a lista', async () => {
    const server = createFakeServer([
      { ...createInitialState().grimoires[0], name: 'Da conta' },
    ]);
    const { engine, local } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();
    expect(server.service.getAll).toHaveBeenCalledTimes(1);
    expect(server.service.sync).not.toHaveBeenCalled();
    expect(local().grimoires[0].name).toBe('Da conta');
  });

  it('com pendências: envia sem merge', async () => {
    const state = ownedState('u1');
    state.sync.dirty = { [DEFAULT_GRIMOIRE_ID]: state.grimoires[0].updatedAt };
    const server = createFakeServer();
    const { engine } = setup(state, server.service);
    engine.setUser('u1');
    await flush();
    expect(server.service.sync.mock.calls[0][0].merge).toBe(false);
  });

  it('inativo: reconectar ou voltar para a aba não chama a API', async () => {
    const server = createFakeServer();
    const { engine } = setup(createInitialState(), server.service);
    engine.setUser('u1');
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
    engine.onOnline();
    engine.onVisible();
    await flush();
    expect(server.service.getAll).not.toHaveBeenCalled();
    expect(server.service.sync).not.toHaveBeenCalled();
  });
});

describe('edições', () => {
  it('debounce junta várias edições numa requisição', async () => {
    const server = createFakeServer();
    const { engine, store } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();

    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:B'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS - 1);
    expect(server.service.sync).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await flush();
    expect(server.service.sync).toHaveBeenCalledTimes(1);
    expect(server.service.sync.mock.calls[0][0].upserts[0].itemIds).toEqual([
      'spell:A',
      'spell:B',
    ]);
  });

  it('uma requisição por vez; edição durante a requisição sobe depois', async () => {
    const server = createFakeServer();
    let release: () => void = () => undefined;
    const original = server.service.sync.getMockImplementation()!;
    server.service.sync.mockImplementationOnce(
      (payload: GrimoireSyncPayload) =>
        new Promise<GrimoireSyncResult>((resolve) => {
          release = () => resolve(original(payload));
        })
    );
    const { engine, store, local } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();

    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    expect(server.service.sync).toHaveBeenCalledTimes(1);

    // Edição enquanto a primeira está em voo.
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:B'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    expect(server.service.sync).toHaveBeenCalledTimes(1);

    release();
    await flush();
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();
    expect(server.service.sync).toHaveBeenCalledTimes(2);
    expect(local().grimoires[0].itemIds).toEqual(['spell:A', 'spell:B']);
    expect(local().sync.dirty).toEqual({});
  });

  it('rede falha: fica offline, guarda pendências e reenvia no online', async () => {
    const server = createFakeServer();
    const { engine, store, statuses, local } = setup(
      ownedState('u1'),
      server.service
    );
    engine.setUser('u1');
    await flush();

    server.service.sync.mockRejectedValueOnce(
      new GrimoireSyncError('network', 'offline')
    );
    store.dispatch(createGrimoire('Mesa'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();
    expect(statuses[statuses.length - 1]).toBe('offline');
    expect(Object.keys(local().sync.dirty)).toHaveLength(1);

    // Sem nova edição, nada é tentado sozinho.
    await vi.advanceTimersByTimeAsync(10 * SYNC_DEBOUNCE_MS);
    expect(server.service.sync).toHaveBeenCalledTimes(1);

    engine.onOnline();
    await flush();
    expect(server.service.sync).toHaveBeenCalledTimes(2);
    expect(local().sync.dirty).toEqual({});
    expect(statuses[statuses.length - 1]).toBe('idle');
  });

  it('4xx: avisa uma vez e não repete até a próxima edição', async () => {
    const server = createFakeServer();
    const { engine, store, notes } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();

    server.service.sync.mockRejectedValueOnce(
      new GrimoireSyncError('rejected', 'HTTP 400')
    );
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();
    await vi.advanceTimersByTimeAsync(10 * SYNC_DEBOUNCE_MS);
    expect(server.service.sync).toHaveBeenCalledTimes(1);
    expect(notes).toEqual([[REJECTED_MESSAGE, 'error']]);

    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:B'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();
    expect(server.service.sync).toHaveBeenCalledTimes(2);
  });
});

describe('saída e logout', () => {
  it('saída involuntária não apaga nada e as pendências sobem no próximo login', async () => {
    const server = createFakeServer();
    const { engine, store, local } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();

    engine.setUser(null); // ex.: app aberto offline, AuthContext fez signOut
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:Mesa'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    expect(server.service.sync).not.toHaveBeenCalled();
    expect(local().grimoires[0].itemIds).toEqual(['spell:Mesa']);
    expect(local().sync.ownerId).toBe('u1');

    engine.setUser('u1');
    await flush();
    expect(server.service.sync).toHaveBeenCalledTimes(1);
    expect(server.stored()[0].itemIds).toEqual(['spell:Mesa']);
  });

  it('logout explícito reseta o navegador', async () => {
    const { engine, store, local } = setup(ownedState('u1'));
    engine.setUser('u1');
    await flush();
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    engine.onLogout();
    expect(local()).toMatchObject({
      grimoires: [{ id: DEFAULT_GRIMOIRE_ID, itemIds: [] }],
      sync: { ownerId: null, dirty: {}, deletedIds: [], pendingMerge: false },
    });
  });

  it('logout durante uma requisição descarta a resposta', async () => {
    let release: (list: PocketGrimoire[]) => void = () => undefined;
    const service = {
      getAll: vi.fn(
        () =>
          new Promise<PocketGrimoire[]>((resolve) => {
            release = resolve;
          })
      ),
      sync: vi.fn(),
    };
    const { engine, local } = setup(ownedState('u1'), service);
    engine.setUser('u1');
    engine.onLogout();
    engine.setUser(null);
    release([
      { ...createInitialState().grimoires[0], itemIds: ['spell:DaConta'] },
    ]);
    await flush();
    expect(local().grimoires[0].itemIds).toEqual([]);
    expect(local().sync.ownerId).toBeNull();
  });

  it('anônimo: nenhuma chamada', async () => {
    const server = createFakeServer();
    const { engine, store } = setup(createInitialState(), server.service);
    engine.setUser(null);
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await flush();
    expect(server.service.getAll).not.toHaveBeenCalled();
    expect(server.service.sync).not.toHaveBeenCalled();
  });
});

describe('voltar para a aba', () => {
  it('atualiza no máximo uma vez por minuto', async () => {
    const server = createFakeServer();
    const { engine } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();
    expect(server.service.getAll).toHaveBeenCalledTimes(1);

    engine.onVisible();
    await flush();
    expect(server.service.getAll).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
    engine.onVisible();
    await flush();
    expect(server.service.getAll).toHaveBeenCalledTimes(2);
  });
});

describe('flush (antes do logout)', () => {
  it('envia as pendências na hora, sem esperar o debounce', async () => {
    const server = createFakeServer();
    const { engine, store, local } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();

    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    await expect(engine.flush()).resolves.toBe(true);
    expect(server.service.sync).toHaveBeenCalledTimes(1);
    expect(local().sync.dirty).toEqual({});
  });

  it('espera a requisição em voo e envia o que sobrou', async () => {
    const server = createFakeServer();
    let release: () => void = () => undefined;
    const original = server.service.sync.getMockImplementation()!;
    server.service.sync.mockImplementationOnce(
      (payload: GrimoireSyncPayload) =>
        new Promise<GrimoireSyncResult>((resolve) => {
          release = () => resolve(original(payload));
        })
    );
    const { engine, store, local } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    await vi.advanceTimersByTimeAsync(SYNC_DEBOUNCE_MS);
    await vi.advanceTimersByTimeAsync(1);
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:B'));

    const result = engine.flush();
    release();
    await expect(result).resolves.toBe(true);
    expect(server.stored()[0].itemIds).toEqual(['spell:A', 'spell:B']);
    expect(local().sync.dirty).toEqual({});
  });

  it('sem conexão: devolve false e mantém as pendências', async () => {
    const server = createFakeServer();
    const { engine, store, local } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();
    server.service.sync.mockRejectedValueOnce(
      new GrimoireSyncError('network', 'offline')
    );
    store.dispatch(addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    await expect(engine.flush()).resolves.toBe(false);
    expect(Object.keys(local().sync.dirty)).toHaveLength(1);
  });

  it('nada pendente: true sem chamar a API', async () => {
    const server = createFakeServer();
    const { engine } = setup(ownedState('u1'), server.service);
    engine.setUser('u1');
    await flush();
    server.service.getAll.mockClear();
    await expect(engine.flush()).resolves.toBe(true);
    expect(server.service.sync).not.toHaveBeenCalled();
    expect(server.service.getAll).not.toHaveBeenCalled();
  });
});
