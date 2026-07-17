/**
 * Truques do Melhor Amigo (Treinador — Heróis de Arton).
 *
 * Cobre a disponibilidade com motivos (getTrickAvailability), incluindo o
 * bloqueio de repetição para truques sem bloco de requirements, e o dedup de
 * truques não-repetíveis feito pelo normalizeSheet em fichas já afetadas pelo
 * bug histórico do LevelUpWizard.
 */
import { describe, it, expect } from 'vitest';
import {
  CompanionTrickDefinition,
  getCompanionTrickDefinition,
  getTrickAvailability,
  getTricksWithAvailability,
} from '../../data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import { countNaturalWeapons } from '../../data/systems/tormenta20/herois-de-arton/companion';
import { normalizeSheet } from '../../functions/sheetNormalizer';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CompanionSheet, CompanionTrick } from '../../interfaces/Companion';

const trick = (name: string): CompanionTrickDefinition => {
  const def = getCompanionTrickDefinition(name);
  if (!def) throw new Error(`Truque não encontrado: ${name}`);
  return def;
};

describe('getTrickAvailability', () => {
  it('bloqueia Amigão para melhor amigo Médio e nível baixo, com motivos', () => {
    const { available, unmetReasons } = getTrickAvailability(
      trick('Amigão'),
      5,
      'Animal',
      'Médio',
      [],
      1,
      false
    );
    expect(available).toBe(false);
    expect(unmetReasons).toContain('Requer Treinador nível 7');
    expect(unmetReasons).toContain('Requer melhor amigo Grande');
  });

  it('libera Amigão para melhor amigo Grande no nível 7', () => {
    const { available, unmetReasons } = getTrickAvailability(
      trick('Amigão'),
      7,
      'Animal',
      'Grande',
      [],
      1,
      false
    );
    expect(available).toBe(true);
    expect(unmetReasons).toEqual([]);
  });

  it('bloqueia Alado sem o truque Asas', () => {
    const result = getTrickAvailability(
      trick('Alado'),
      5,
      'Animal',
      'Médio',
      [],
      1,
      false
    );
    expect(result.available).toBe(false);
    expect(result.unmetReasons).toContain('Requer o truque: Asas');
  });

  it('bloqueia repetição de truque sem requirements (Amigo Feroz)', () => {
    const result = getTrickAvailability(
      trick('Amigo Feroz'),
      5,
      'Animal',
      'Médio',
      [{ name: 'Amigo Feroz' }],
      1,
      false
    );
    expect(result.available).toBe(false);
    expect(result.unmetReasons).toContain('Já aprendido (não pode repetir)');
  });

  it('permite repetir Condicionamento Especial (canRepeat)', () => {
    const result = getTrickAvailability(
      trick('Condicionamento Especial'),
      5,
      'Animal',
      'Médio',
      [{ name: 'Condicionamento Especial' }],
      1,
      false
    );
    expect(result.available).toBe(true);
  });

  it('bloqueia Anatomia Humanoide fora da criação', () => {
    const result = getTrickAvailability(
      trick('Anatomia Humanoide'),
      5,
      'Construto',
      'Médio',
      [],
      1,
      false
    );
    expect(result.available).toBe(false);
    expect(result.unmetReasons).toContain(
      'Disponível apenas na criação do melhor amigo'
    );
  });

  it('getTricksWithAvailability retorna a lista completa de truques', () => {
    const all = getTricksWithAvailability(1, 'Animal', 'Médio', [], 1, true);
    expect(all.map((t) => t.trick.name)).toContain('Amigão');
    const amigao = all.find((t) => t.trick.name === 'Amigão');
    expect(amigao?.available).toBe(false);
  });
});

describe('countNaturalWeapons', () => {
  it('conta 1 para Animal, 2 para Monstro e soma Arma Natural Adicional', () => {
    expect(countNaturalWeapons('Animal', [])).toBe(1);
    expect(countNaturalWeapons('Monstro', [])).toBe(2);
    expect(
      countNaturalWeapons('Animal', [{ name: 'Arma Natural Adicional' }])
    ).toBe(2);
  });

  it('retorna 0 com Anatomia Humanoide', () => {
    expect(
      countNaturalWeapons('Construto', [{ name: 'Anatomia Humanoide' }])
    ).toBe(0);
  });
});

describe('normalizeSheet — dedup de truques duplicados', () => {
  const buildSheetWithTricks = (tricks: CompanionTrick[]): CharacterSheet => {
    const companion = { tricks } as unknown as CompanionSheet;
    return { companions: [companion] } as unknown as CharacterSheet;
  };

  it('remove duplicatas de truques não-repetíveis mantendo a 1ª ocorrência', () => {
    const sheet = buildSheetWithTricks([
      { name: 'Amigo Feroz' },
      { name: 'Veloz' },
      { name: 'Amigo Feroz' },
    ]);
    normalizeSheet(sheet);
    expect(sheet.companions?.[0].tricks.map((t) => t.name)).toEqual([
      'Amigo Feroz',
      'Veloz',
    ]);
  });

  it('preserva as choices da 1ª ocorrência ao remover duplicata', () => {
    const sheet = buildSheetWithTricks([
      { name: 'Manobra Ensaiada', choices: { maneuver: 'Derrubar' } },
      { name: 'Manobra Ensaiada', choices: { maneuver: 'Agarrar' } },
    ]);
    normalizeSheet(sheet);
    expect(sheet.companions?.[0].tricks).toEqual([
      { name: 'Manobra Ensaiada', choices: { maneuver: 'Derrubar' } },
    ]);
  });

  it('mantém múltiplas ocorrências de truques repetíveis', () => {
    const sheet = buildSheetWithTricks([
      { name: 'Condicionamento Especial', choices: { primary: 'Força' } },
      { name: 'Condicionamento Especial', choices: { primary: 'Destreza' } },
      { name: 'Deslocamento Especial', choices: { type: 'Escalada' } },
      { name: 'Deslocamento Especial', choices: { type: 'Natação' } },
    ]);
    normalizeSheet(sheet);
    expect(sheet.companions?.[0].tricks).toHaveLength(4);
  });
});
