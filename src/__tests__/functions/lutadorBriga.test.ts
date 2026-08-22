/**
 * Tests for Briga (Lutador) unarmed damage scaling with class level.
 * Official table: 1º-4º 1d6, 5º-8º 1d8, 9º-12º 1d10, 13º-16º 1d12,
 * 17º-19º 2d8, 20º 2d10 (Dono da Rua).
 */
import { describe, it, expect } from 'vitest';
import {
  getBrigaDice,
  updateBrigaRolls,
} from '../../functions/powers/lutador-special';
import { recalculateSheet } from '../../functions/recalculateSheet';
import generateRandomSheet from '../../functions/general';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import {
  computeUnarmedDamage,
  getUnarmedDamageDice,
} from '../../functions/unarmedDamage';

const createLutadorSheet = (nivel: number): CharacterSheet => {
  const coreClasses = dataRegistry.getClassesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const coreRaces = dataRegistry.getRacesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);

  const lutadorClass = coreClasses.find((c) => c.name === 'Lutador');
  const elfoRace = coreRaces.find((r) => r.name === 'Elfo');

  if (!lutadorClass || !elfoRace) {
    throw new Error('Lutador class or Elfo race not found in registry');
  }

  const attributes: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 3 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 1 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };

  return {
    id: `test-lutador-${nivel}`,
    nome: 'Test Lutador',
    sexo: 'Masculino',
    nivel,
    atributos: attributes,
    raca: elfoRace,
    classe: lutadorClass,
    skills: [],
    pv: 20,
    pm: 3,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag: new Bag(),
    devoto: undefined,
    origin: undefined,
    spells: [],
    displacement: 9,
    size: elfoRace.size!,
    maxSpaces: 10,
    generalPowers: [],
    classPowers: [],
    steps: [],
  };
};

const getBrigaRollDice = (sheet: CharacterSheet): string | undefined => {
  const briga = sheet.classe.abilities.find((a) => a.name === 'Briga');
  return briga?.rolls?.[0]?.dice;
};

describe('getBrigaDice — official damage table', () => {
  it('returns 1d6 from level 1 to 4', () => {
    expect(getBrigaDice(1)).toBe('1d6');
    expect(getBrigaDice(4)).toBe('1d6');
  });

  it('returns 1d8 from level 5 to 8', () => {
    expect(getBrigaDice(5)).toBe('1d8');
    expect(getBrigaDice(8)).toBe('1d8');
  });

  it('returns 1d10 from level 9 to 12', () => {
    expect(getBrigaDice(9)).toBe('1d10');
    expect(getBrigaDice(12)).toBe('1d10');
  });

  it('returns 1d12 from level 13 to 16', () => {
    expect(getBrigaDice(13)).toBe('1d12');
    expect(getBrigaDice(16)).toBe('1d12');
  });

  it('returns 2d8 from level 17 to 19', () => {
    expect(getBrigaDice(17)).toBe('2d8');
    expect(getBrigaDice(19)).toBe('2d8');
  });

  it('returns 2d10 at level 20 (Dono da Rua)', () => {
    expect(getBrigaDice(20)).toBe('2d10');
  });
});

describe('updateBrigaRolls', () => {
  it('updates the Briga roll dice according to class level', () => {
    const sheet = createLutadorSheet(9);
    // Simulate abilities already materialized on the sheet
    sheet.classe = {
      ...sheet.classe,
      abilities: sheet.classe.abilities.filter((a) => a.nivel <= 9),
    };

    const newDice = updateBrigaRolls(sheet);

    expect(newDice).toBe('1d10');
    expect(getBrigaRollDice(sheet)).toBe('1d10');
  });

  it('returns null when the dice does not change', () => {
    const sheet = createLutadorSheet(3);
    sheet.classe = {
      ...sheet.classe,
      abilities: sheet.classe.abilities.filter((a) => a.nivel <= 3),
    };

    expect(updateBrigaRolls(sheet)).toBeNull();
    expect(getBrigaRollDice(sheet)).toBe('1d6');
  });

  it('does not mutate originalAbilities', () => {
    const sheet = createLutadorSheet(13);
    sheet.classe = {
      ...sheet.classe,
      abilities: sheet.classe.abilities.filter((a) => a.nivel <= 13),
    };
    sheet.classe.originalAbilities = [...sheet.classe.abilities];

    updateBrigaRolls(sheet);

    const originalBriga = sheet.classe.originalAbilities.find(
      (a) => a.name === 'Briga'
    );
    expect(originalBriga?.rolls?.[0]?.dice).toBe('1d6');
    expect(getBrigaRollDice(sheet)).toBe('1d12');
  });

  it('uses the class level, not the character level, for multiclass', () => {
    const sheet = createLutadorSheet(6);
    sheet.classe = {
      ...sheet.classe,
      abilities: sheet.classe.abilities.filter((a) => a.nivel <= 4),
    };
    sheet.classLevels = [
      { className: 'Lutador', level: 1 },
      { className: 'Lutador', level: 2 },
      { className: 'Lutador', level: 3 },
      { className: 'Lutador', level: 4 },
      { className: 'Guerreiro', level: 5 },
      { className: 'Guerreiro', level: 6 },
    ];

    expect(updateBrigaRolls(sheet)).toBeNull();
    expect(getBrigaRollDice(sheet)).toBe('1d6');
  });
});

/**
 * `Elfo`, e não `Humano`: o `Versátil` do Humano sorteia um poder geral de
 * QUALQUER tipo a cada geração — inclusive da Tormenta. Desde que Corpo
 * Aberrante passou a aumentar o dano desarmado, isso deixaria o dado da Briga
 * dependente do sorteio.
 *
 * Mesmo assim a asserção do dado FINAL é relacional (o motor aleatório também
 * pode sortear Corpo Aberrante no level-up); o que se fixa é a tabela da Briga,
 * que é o objeto deste teste.
 */
describe('generateRandomSheet — Briga scaling integration', () => {
  it('scales Briga dice on a randomly generated level 10 Lutador', () => {
    const sheet = generateRandomSheet({
      nivel: 10,
      raca: 'Elfo',
      classe: 'Lutador',
      origin: '',
      devocao: { label: '', value: '' },
      supplements: [SupplementId.TORMENTA20_CORE],
    });

    expect(computeUnarmedDamage(sheet).base).toBe('1d10');
    expect(getBrigaRollDice(sheet)).toBe(getUnarmedDamageDice(sheet));
  });
});

describe('recalculateSheet — Briga scaling integration', () => {
  it('scales Briga dice on a level 9 Lutador', () => {
    const sheet = createLutadorSheet(9);
    const recalculated = recalculateSheet(sheet);

    expect(getBrigaRollDice(recalculated)).toBe('1d10');
  });

  it('keeps 1d6 on a level 1 Lutador', () => {
    const sheet = createLutadorSheet(1);
    const recalculated = recalculateSheet(sheet);

    expect(getBrigaRollDice(recalculated)).toBe('1d6');
  });

  it('reaches 2d10 at level 20', () => {
    const sheet = createLutadorSheet(20);
    const recalculated = recalculateSheet(sheet);

    expect(getBrigaRollDice(recalculated)).toBe('2d10');
  });
});
