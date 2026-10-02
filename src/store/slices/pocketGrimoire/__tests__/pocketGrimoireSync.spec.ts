import { describe, it, expect } from 'vitest';
import reducer, {
  addItem,
  applyRemote,
  claimForUser,
  createGrimoire,
  deleteGrimoire,
  markSynced,
  resetToAnonymous,
  selectHasPendingGrimoireChanges,
} from '../pocketGrimoireSlice';
import { createInitialState } from '../../../../functions/pocketGrimoire/state';
import { DEFAULT_GRIMOIRE_ID } from '../../../../interfaces/PocketGrimoire';

const NOW = '2026-01-01T00:00:00.000Z';
const anon = () => createInitialState(NOW);
const ownedBy = (userId: string) => {
  const claimed = reducer(anon(), claimForUser(userId));
  return reducer(claimed, markSynced({ sent: {}, deletedIds: [] }));
};

describe('rastreamento', () => {
  it('anônimo: editar não gera pendência', () => {
    const state = reducer(anon(), addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    expect(state.sync.dirty).toEqual({});
  });

  it('cópia da conta: editar marca o grimório', () => {
    const state = reducer(
      ownedBy('u1'),
      addItem(DEFAULT_GRIMOIRE_ID, 'spell:A')
    );
    expect(state.sync.dirty).toEqual({
      [DEFAULT_GRIMOIRE_ID]: state.grimoires[0].updatedAt,
    });
    expect(selectHasPendingGrimoireChanges({ pocketGrimoire: state })).toBe(
      true
    );
  });

  it('cópia da conta: excluir vira exclusão pendente', () => {
    const action = createGrimoire('Outro');
    let state = reducer(ownedBy('u1'), action);
    state = reducer(
      state,
      markSynced({ sent: { ...state.sync.dirty }, deletedIds: [] })
    );
    state = reducer(state, deleteGrimoire(action.payload.id));
    expect(state.sync.deletedIds).toEqual([action.payload.id]);
  });

  it('ações do sync não geram pendência', () => {
    const state = reducer(ownedBy('u1'), applyRemote([]));
    expect(state.sync.dirty).toEqual({});
  });

  it('edição durante o merge do login continua pendente', () => {
    let state = reducer(anon(), createGrimoire('Local'));
    state = reducer(state, claimForUser('u1'));
    const sent = { ...state.sync.dirty };
    // Enquanto o merge está em voo, a pessoa cria outro grimório.
    const novo = createGrimoire('Durante');
    state = reducer(state, novo);
    // Chega a resposta: o servidor só conhece o "Local".
    state = reducer(state, markSynced({ sent, deletedIds: [] }));
    const local = state.grimoires.find((g) => g.name === 'Local')!;
    state = reducer(state, applyRemote([local]));
    expect(state.grimoires.map((g) => g.name)).toContain('Durante');
    expect(Object.keys(state.sync.dirty)).toEqual([novo.payload.id]);
  });
});

describe('resetToAnonymous', () => {
  it('volta ao estado inicial anônimo', () => {
    let state = reducer(ownedBy('u1'), addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    state = reducer(state, resetToAnonymous());
    expect(state.grimoires).toHaveLength(1);
    expect(state.grimoires[0].itemIds).toEqual([]);
    expect(state.sync).toEqual({
      ownerId: null,
      dirty: {},
      deletedIds: [],
      pendingMerge: false,
    });
  });
});
