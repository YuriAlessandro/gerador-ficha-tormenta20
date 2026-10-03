import { describe, it, expect } from 'vitest';
import {
  applyRemote,
  buildSyncPayload,
  claimForUser,
  hasPendingChanges,
  isPristineDefault,
  markSynced,
  trackChanges,
} from '../sync';
import { createAnonymousSync, createInitialState } from '../state';
import {
  DEFAULT_GRIMOIRE_ID,
  PocketGrimoire,
  PocketGrimoireState,
  PocketGrimoireSyncState,
} from '../../../interfaces/PocketGrimoire';

const NOW = '2026-10-02T12:00:00.000Z';
const T1 = '2026-10-02T12:01:00.000Z';
const T2 = '2026-10-02T12:02:00.000Z';

const g = (
  id: string,
  overrides: Partial<PocketGrimoire> = {}
): PocketGrimoire => ({
  id,
  name: id,
  itemIds: [],
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const owned = (
  grimoires: PocketGrimoire[],
  sync: Partial<PocketGrimoireSyncState> = {}
): PocketGrimoireState => ({
  grimoires,
  activeId: grimoires[0].id,
  sync: { ...createAnonymousSync(), ownerId: 'u1', ...sync },
});

describe('isPristineDefault', () => {
  it('só o "Padrão" vazio e com o nome original', () => {
    const [padrao] = createInitialState(NOW).grimoires;
    expect(isPristineDefault(padrao)).toBe(true);
    expect(isPristineDefault({ ...padrao, itemIds: ['spell:A'] })).toBe(false);
    expect(isPristineDefault({ ...padrao, name: 'Meu' })).toBe(false);
    expect(isPristineDefault(g('outro'))).toBe(false);
  });
});

describe('hasPendingChanges', () => {
  it('dirty, exclusões ou merge pendente', () => {
    const base = createAnonymousSync();
    expect(hasPendingChanges(base)).toBe(false);
    expect(hasPendingChanges({ ...base, dirty: { a: NOW } })).toBe(true);
    expect(hasPendingChanges({ ...base, deletedIds: ['a'] })).toBe(true);
    expect(hasPendingChanges({ ...base, pendingMerge: true })).toBe(true);
  });
});

describe('trackChanges', () => {
  const { sync } = owned([g('a')]);

  it('marca o grimório com referência nova', () => {
    const a = g('a');
    const editado = { ...a, updatedAt: T1 };
    expect(trackChanges(sync, [a], [editado]).dirty).toEqual({ a: T1 });
  });

  it('marca o grimório novo', () => {
    const a = g('a');
    expect(trackChanges(sync, [a], [a, g('b')]).dirty).toEqual({ b: NOW });
  });

  it('exclusão sai de dirty e entra em deletedIds', () => {
    const a = g('a');
    const b = g('b');
    const result = trackChanges({ ...sync, dirty: { b: NOW } }, [a, b], [a]);
    expect(result.dirty).toEqual({});
    expect(result.deletedIds).toEqual(['b']);
  });

  it('id que volta sai de deletedIds', () => {
    const a = g('a');
    const result = trackChanges(
      { ...sync, deletedIds: ['b'] },
      [a],
      [a, g('b')]
    );
    expect(result.deletedIds).toEqual([]);
    expect(result.dirty).toEqual({ b: NOW });
  });

  it('sem mudança devolve o mesmo objeto', () => {
    const list = [g('a')];
    expect(trackChanges(sync, list, list)).toBe(sync);
    expect(trackChanges(sync, list, [...list])).toBe(sync);
  });
});

describe('claimForUser', () => {
  it('marca tudo menos o "Padrão" intocado e liga o merge', () => {
    const state = createInitialState(NOW);
    state.grimoires.push(g('b', { updatedAt: T1 }));
    expect(claimForUser(state, 'u1').sync).toEqual({
      ownerId: 'u1',
      dirty: { b: T1 },
      deletedIds: [],
      pendingMerge: true,
      rejectedIds: [],
    });
  });

  it('"Padrão" com itens também sobe', () => {
    const state = createInitialState(NOW);
    state.grimoires[0].itemIds = ['spell:A'];
    expect(claimForUser(state, 'u1').sync.dirty).toEqual({
      [DEFAULT_GRIMOIRE_ID]: NOW,
    });
  });
});

describe('buildSyncPayload', () => {
  it('envia só os pendentes, as exclusões e o merge', () => {
    const state = owned([g('a'), g('b')], {
      dirty: { b: NOW },
      deletedIds: ['x'],
      pendingMerge: true,
    });
    expect(buildSyncPayload(state)).toEqual({
      upserts: [g('b')],
      deletes: ['x'],
      merge: true,
    });
  });
});

describe('markSynced', () => {
  it('confirma só a versão enviada', () => {
    const { sync } = owned([g('a'), g('b')], {
      dirty: { a: T1, b: T2 },
      deletedIds: ['x', 'y'],
      pendingMerge: true,
    });
    // `b` foi editado de novo (T2) enquanto a versão T1 estava em voo.
    const result = markSynced(sync, { a: T1, b: T1 }, ['x']);
    expect(result.dirty).toEqual({ b: T2 });
    expect(result.deletedIds).toEqual(['y']);
    expect(result.pendingMerge).toBe(false);
  });

  it('guarda os recusados por limite da resposta (a lista inteira)', () => {
    const { sync } = owned([g('a'), g('b')], { rejectedIds: ['a'] });
    expect(markSynced(sync, {}, [], ['b']).rejectedIds).toEqual(['b']);
    expect(markSynced(sync, {}, []).rejectedIds).toEqual([]);
  });
});

describe('applyRemote', () => {
  it('adota a lista do servidor', () => {
    const state = owned([g('a', { name: 'Velho' })]);
    const result = applyRemote(state, [g('a', { name: 'Novo' }), g('b')], NOW);
    expect(result.grimoires.map((x) => x.name)).toEqual(['Novo', 'b']);
  });

  it('mantém a versão local dos pendentes', () => {
    const local = g('a', { name: 'Local', updatedAt: T2 });
    const state = owned([local], { dirty: { a: T2 } });
    const result = applyRemote(state, [g('a', { name: 'Servidor' })], NOW);
    expect(result.grimoires).toEqual([local]);
    expect(result.sync.dirty).toEqual({ a: T2 });
  });

  it('mantém pendentes que o servidor ainda não conhece', () => {
    const state = owned([g('a'), g('novo')], { dirty: { novo: NOW } });
    const result = applyRemote(state, [g('a')], NOW);
    expect(result.grimoires.map((x) => x.id)).toEqual(['a', 'novo']);
  });

  it('remove o que foi excluído em outro dispositivo', () => {
    const state = owned([g('a'), g('b')]);
    expect(
      applyRemote(state, [g('a')], NOW).grimoires.map((x) => x.id)
    ).toEqual(['a']);
  });

  it('não ressuscita exclusões ainda não enviadas', () => {
    const state = owned([g('a')], { deletedIds: ['b'] });
    const result = applyRemote(state, [g('a'), g('b')], NOW);
    expect(result.grimoires.map((x) => x.id)).toEqual(['a']);
    expect(result.sync.deletedIds).toEqual(['b']);
  });

  it('ativo excluído remotamente: o ativo cai para um que existe', () => {
    const state = { ...owned([g('a'), g('b')]), activeId: 'b' };
    expect(applyRemote(state, [g('a')], NOW).activeId).toBe('a');
  });

  it('lista vazia: nasce um "Padrão" que não fica pendente', () => {
    const result = applyRemote(owned([g('a')]), [], NOW);
    expect(result.grimoires).toEqual(createInitialState(NOW).grimoires);
    expect(result.sync.dirty).toEqual({});
    expect(result.sync.ownerId).toBe('u1');
  });
});
