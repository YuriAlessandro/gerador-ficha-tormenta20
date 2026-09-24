/**
 * Melhor Amigo (Treinador): sub-escolhas de truque (Sopro, Manobra Ensaiada,
 * Condicionamento Especial…) e o poder Treinador Eclético, que troca o nível
 * de Treinador pelo de personagem em PV, Defesa e perícias.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCompanionPV,
  createCompanion,
  generateRandomCompanion,
  isTrickChoiceComplete,
} from '../../data/systems/tormenta20/herois-de-arton/companion';
import {
  COMPANION_MANEUVERS,
  SOPRO_ELEMENTS,
  formatTrickChoices,
  getCompanionTrickDefinition,
} from '../../data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import { getCompanionLevels } from '../../functions/companionLevels';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';

describe('isTrickChoiceComplete', () => {
  it('truque sem sub-escolha está sempre completo', () => {
    expect(isTrickChoiceComplete({ name: 'Veloz' })).toBe(true);
  });

  it('Sopro exige o tipo de energia', () => {
    expect(isTrickChoiceComplete({ name: 'Sopro' })).toBe(false);
    expect(
      isTrickChoiceComplete({ name: 'Sopro', choices: { element: 'Fogo' } })
    ).toBe(true);
  });

  it('Manobra Ensaiada exige a manobra', () => {
    expect(isTrickChoiceComplete({ name: 'Manobra Ensaiada' })).toBe(false);
    expect(
      isTrickChoiceComplete({
        name: 'Manobra Ensaiada',
        choices: { maneuver: 'Derrubar' },
      })
    ).toBe(true);
  });

  it('Condicionamento Especial exige os dois atributos', () => {
    expect(
      isTrickChoiceComplete({
        name: 'Condicionamento Especial',
        choices: { primary: Atributo.FORCA },
      })
    ).toBe(false);
    expect(
      isTrickChoiceComplete({
        name: 'Condicionamento Especial',
        choices: { primary: Atributo.FORCA, secondary: Atributo.DESTREZA },
      })
    ).toBe(true);
  });
});

describe('formatTrickChoices', () => {
  it('troca as chaves internas por rótulos legíveis', () => {
    expect(
      formatTrickChoices({
        name: 'Condicionamento Especial',
        choices: { primary: 'Força', secondary: 'Destreza' },
      })
    ).toBe('+2: Força, +1: Destreza');
    expect(
      formatTrickChoices({ name: 'Sopro', choices: { element: 'Frio' } })
    ).toBe('Energia: Frio');
  });
});

describe('generateRandomCompanion — sub-escolhas', () => {
  it('todo truque sorteado sai com a sub-escolha preenchida', () => {
    for (let i = 0; i < 200; i += 1) {
      const companion = generateRandomCompanion(20, 3);
      companion.tricks.forEach((trick) => {
        expect(isTrickChoiceComplete(trick)).toBe(true);
        const def = getCompanionTrickDefinition(trick.name);
        if (def?.subChoiceType === 'element')
          expect(SOPRO_ELEMENTS).toContain(trick.choices?.element);
        if (def?.subChoiceType === 'maneuver')
          expect(COMPANION_MANEUVERS).toContain(trick.choices?.maneuver);
      });
    }
  });
});

const makeSheet = (
  nivel: number,
  treinadorLevels: number,
  powers: string[] = []
): Pick<CharacterSheet, 'nivel' | 'classLevels' | 'classPowers'> => ({
  nivel,
  classLevels: Array.from({ length: nivel }, (_, i) => ({
    level: i + 1,
    className: i < treinadorLevels ? 'Treinador' : 'Guerreiro',
  })),
  classPowers: powers.map((name) => ({ name, text: '' } as ClassPower)),
});

describe('getCompanionLevels', () => {
  it('sem Treinador Eclético, tudo usa o nível de Treinador', () => {
    expect(getCompanionLevels(makeSheet(8, 6))).toEqual({
      trainerLevel: 6,
      statLevel: 6,
    });
  });

  it('com Treinador Eclético, PV/Defesa/perícias usam o nível de personagem', () => {
    expect(getCompanionLevels(makeSheet(8, 6, ['Treinador Eclético']))).toEqual(
      { trainerLevel: 6, statLevel: 8 }
    );
  });
});

describe('calculateCompanionStats — statLevel (Treinador Eclético)', () => {
  const base = {
    type: 'Animal' as const,
    size: 'Médio' as const,
    weaponDamageType: 'Corte' as const,
    skills: [Skill.LUTA, Skill.PERCEPCAO, Skill.FURTIVIDADE],
    tricks: [{ name: 'Amigo Feroz' }, { name: 'Amigo Protetor' }],
    trainerCharisma: 2,
  };

  it('PV e Defesa seguem o statLevel', () => {
    const treinador = createCompanion({ ...base, trainerLevel: 6 });
    const eclectic = createCompanion({
      ...base,
      trainerLevel: 6,
      statLevel: 10,
    });
    const con = eclectic.attributes[Atributo.CONSTITUICAO];
    expect(treinador.pv).toBe(calculateCompanionPV(6, con));
    expect(eclectic.pv).toBe(calculateCompanionPV(10, con));
    // Defesa soma metade do nível: 6 → +3, 10 → +5
    expect(eclectic.defesa - treinador.defesa).toBe(2);
  });
});
