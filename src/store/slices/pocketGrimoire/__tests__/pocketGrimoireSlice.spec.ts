import { describe, it, expect } from 'vitest';
import reducer, {
  addItem,
  createGrimoire,
  deleteGrimoire,
  duplicateGrimoire,
  importGrimoire,
  migratePocketGrimoire,
  removeItem,
  renameGrimoire,
  selectActiveGrimoire,
  selectGrimoireById,
  setActive,
} from '../pocketGrimoireSlice';
import { createInitialState } from '../../../../functions/pocketGrimoire/state';
import {
  DEFAULT_GRIMOIRE_ID,
  PocketGrimoireState,
} from '../../../../interfaces/PocketGrimoire';

const initial = (): PocketGrimoireState =>
  createInitialState('2026-01-01T00:00:00.000Z');

const withGrimoire = (name: string) => {
  const action = createGrimoire(name);
  return { state: reducer(initial(), action), id: action.payload.id };
};

const nameOf = (state: PocketGrimoireState, id: string) =>
  selectGrimoireById(id)({ pocketGrimoire: state })?.name;

describe('itens', () => {
  it('adiciona sem duplicar e atualiza updatedAt', () => {
    let state = reducer(initial(), addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    state = reducer(state, addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    expect(state.grimoires[0].itemIds).toEqual(['spell:A']);
    expect(state.grimoires[0].updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
  });

  it('remove', () => {
    let state = reducer(initial(), addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    state = reducer(state, removeItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    expect(state.grimoires[0].itemIds).toEqual([]);
  });

  it('ignora grimório inexistente', () => {
    const state = reducer(initial(), addItem('fantasma', 'spell:A'));
    expect(state).toEqual(initial());
  });
});

describe('criar, renomear, duplicar', () => {
  it('cria com id do prepare, sem virar ativo', () => {
    const { state, id } = withGrimoire('Mago da one-shot');
    expect(state.grimoires[1]).toMatchObject({ id, name: 'Mago da one-shot' });
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('cria com nome padrão e sem colisão', () => {
    let state = reducer(initial(), createGrimoire());
    state = reducer(state, createGrimoire('   '));
    expect(state.grimoires.map((g) => g.name)).toEqual([
      'Padrão',
      'Novo grimório',
      'Novo grimório (2)',
    ]);
  });

  it('renomeia, ignora nome vazio e evita colisão com outro', () => {
    const { state: s1, id } = withGrimoire('Mago');
    let state = reducer(s1, renameGrimoire(id, '  Arcanista  '));
    expect(nameOf(state, id)).toBe('Arcanista');
    state = reducer(state, renameGrimoire(id, '   '));
    expect(nameOf(state, id)).toBe('Arcanista');
    state = reducer(state, renameGrimoire(id, 'padrão'));
    expect(nameOf(state, id)).toBe('padrão (2)');
  });

  it('renomear para o próprio nome não gera sufixo', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const state = reducer(s1, renameGrimoire(id, 'Mago'));
    expect(nameOf(state, id)).toBe('Mago');
  });

  it('duplica com os mesmos itens e nome de cópia', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const s2 = reducer(s1, addItem(id, 'spell:A'));
    const dup = duplicateGrimoire(id);
    const state = reducer(s2, dup);
    const copy = selectGrimoireById(dup.payload.id)({ pocketGrimoire: state });
    expect(copy).toMatchObject({ name: 'Mago (cópia)', itemIds: ['spell:A'] });
  });

  it('a cópia não compartilha a lista de itens com o original', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const dup = duplicateGrimoire(id);
    let state = reducer(s1, dup);
    state = reducer(state, addItem(dup.payload.id, 'spell:B'));
    expect(selectGrimoireById(id)({ pocketGrimoire: state })?.itemIds).toEqual(
      []
    );
  });
});

describe('excluir e ativar', () => {
  it('não exclui o Padrão', () => {
    const state = reducer(initial(), deleteGrimoire(DEFAULT_GRIMOIRE_ID));
    expect(state.grimoires).toHaveLength(1);
  });

  it('excluir o ativo volta o ativo para o Padrão', () => {
    const { state: s1, id } = withGrimoire('Mago');
    let state = reducer(s1, setActive(id));
    expect(state.activeId).toBe(id);
    state = reducer(state, deleteGrimoire(id));
    expect(state.grimoires).toHaveLength(1);
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('setActive ignora id inexistente', () => {
    const state = reducer(initial(), setActive('fantasma'));
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('selectActiveGrimoire devolve o ativo', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const state = reducer(s1, setActive(id));
    expect(selectActiveGrimoire({ pocketGrimoire: state }).id).toBe(id);
  });
});

describe('importar', () => {
  it('cria grimório novo, sem duplicatas e com nome único', () => {
    const { state: s1 } = withGrimoire('Mago');
    const action = importGrimoire('Mago', ['spell:A', 'spell:A', 'spell:B']);
    const state = reducer(s1, action);
    const imported = selectGrimoireById(action.payload.id)({
      pocketGrimoire: state,
    });
    expect(imported).toMatchObject({
      name: 'Mago (2)',
      itemIds: ['spell:A', 'spell:B'],
    });
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('nome vazio vira "Grimório importado"', () => {
    const action = importGrimoire('', []);
    const state = reducer(initial(), action);
    expect(nameOf(state, action.payload.id)).toBe('Grimório importado');
  });
});

describe('migratePocketGrimoire', () => {
  it('mantém undefined (primeira execução)', async () => {
    await expect(migratePocketGrimoire(undefined)).resolves.toBeUndefined();
  });

  it('conserta estado corrompido e preserva a chave de controle do persist', async () => {
    const persisted = {
      grimoires: 'lixo',
      activeId: 'x',
      _persist: { version: -1, rehydrated: false },
    };
    const result = (await migratePocketGrimoire(
      persisted as unknown as Parameters<typeof migratePocketGrimoire>[0]
    )) as unknown as Record<string, unknown>;
    expect(result.activeId).toBe(DEFAULT_GRIMOIRE_ID);
    expect(result).toHaveProperty('_persist');
    expect((result.grimoires as unknown[]).length).toBe(1);
  });
});
