import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  ensureValidState,
  normalizeGrimoireName,
  uniqueGrimoireName,
} from '../state';
import { DEFAULT_GRIMOIRE_ID } from '../../../interfaces/PocketGrimoire';

const NOW = '2026-09-18T12:00:00.000Z';

describe('createInitialState', () => {
  it('começa só com o Padrão, ativo e vazio', () => {
    expect(createInitialState(NOW)).toEqual({
      grimoires: [
        {
          id: DEFAULT_GRIMOIRE_ID,
          name: 'Padrão',
          itemIds: [],
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      activeId: DEFAULT_GRIMOIRE_ID,
    });
  });
});

describe('normalizeGrimoireName', () => {
  it('apara e colapsa espaços', () => {
    expect(normalizeGrimoireName('  Mago   da  one-shot ')).toBe(
      'Mago da one-shot'
    );
  });
  it('devolve null para nome vazio', () => {
    expect(normalizeGrimoireName('   ')).toBeNull();
  });
  it('corta em 60 caracteres', () => {
    expect(normalizeGrimoireName('a'.repeat(80))).toHaveLength(60);
  });
});

describe('uniqueGrimoireName', () => {
  it('mantém nome livre', () => {
    expect(uniqueGrimoireName('Clériga', ['Padrão'])).toBe('Clériga');
  });
  it('adiciona sufixo ignorando maiúsculas', () => {
    expect(uniqueGrimoireName('Mago', ['mago', 'Mago (2)'])).toBe('Mago (3)');
  });
  it('não passa de 60 caracteres com o sufixo', () => {
    const base = 'b'.repeat(60);
    const result = uniqueGrimoireName(base, [base]);
    expect(result).toHaveLength(60);
    expect(result.endsWith(' (2)')).toBe(true);
  });
});

describe('ensureValidState', () => {
  it('estado ausente vira o inicial', () => {
    expect(ensureValidState(undefined, NOW)).toEqual(createInitialState(NOW));
  });

  it('lixo vira o inicial', () => {
    expect(ensureValidState('lixo', NOW)).toEqual(createInitialState(NOW));
    expect(ensureValidState({ grimoires: 3 }, NOW)).toEqual(
      createInitialState(NOW)
    );
  });

  it('recria o Padrão quando falta, no início da lista', () => {
    const result = ensureValidState(
      {
        grimoires: [
          { id: 'x', name: 'X', itemIds: [], createdAt: NOW, updatedAt: NOW },
        ],
        activeId: 'x',
      },
      NOW
    );
    expect(result.grimoires.map((g) => g.id)).toEqual([
      DEFAULT_GRIMOIRE_ID,
      'x',
    ]);
    expect(result.activeId).toBe('x');
  });

  it('remove ids repetidos e não-strings dos itens', () => {
    const result = ensureValidState(
      {
        grimoires: [
          {
            id: DEFAULT_GRIMOIRE_ID,
            name: 'Padrão',
            itemIds: ['spell:A', 'spell:A', 42, '', 'spell:B'],
          },
        ],
        activeId: DEFAULT_GRIMOIRE_ID,
      },
      NOW
    );
    expect(result.grimoires[0].itemIds).toEqual(['spell:A', 'spell:B']);
  });

  it('descarta grimórios sem id e ids duplicados de grimório', () => {
    const result = ensureValidState(
      {
        grimoires: [
          { name: 'sem id' },
          { id: 'x', name: 'Primeiro', itemIds: [] },
          { id: 'x', name: 'Duplicado', itemIds: [] },
        ],
        activeId: 'x',
      },
      NOW
    );
    expect(result.grimoires.map((g) => g.name)).toEqual(['Padrão', 'Primeiro']);
  });

  it('activeId inexistente volta para o Padrão', () => {
    const result = ensureValidState(
      { grimoires: [], activeId: 'fantasma' },
      NOW
    );
    expect(result.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('nome vazio ganha nome padrão', () => {
    const result = ensureValidState(
      { grimoires: [{ id: 'x', name: '  ', itemIds: [] }], activeId: 'x' },
      NOW
    );
    expect(result.grimoires[1].name).toBe('Grimório sem nome');
  });
});
