/**
 * PV do Melhor Amigo (Treinador — Heróis de Arton): 16 + Con no 1º nível e
 * +4 + Con por nível seguinte. A fórmula antiga contava o 1º nível duas vezes,
 * dando ao amigo de um treinador de nível N os PV de nível N+1.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCompanionPV,
  createCompanion,
} from '../../data/systems/tormenta20/herois-de-arton/companion';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';

describe('calculateCompanionPV', () => {
  it('1º nível: 16 + Con', () => {
    expect(calculateCompanionPV(1, 1)).toBe(17);
    expect(calculateCompanionPV(1, 3)).toBe(19);
  });

  it('cada nível seguinte soma 4 + Con', () => {
    expect(calculateCompanionPV(2, 1)).toBe(22);
    expect(calculateCompanionPV(3, 1)).toBe(27);
    expect(calculateCompanionPV(10, 2)).toBe(18 + 9 * 6);
  });

  it('nível 2 não coincide mais com o nível 3', () => {
    expect(calculateCompanionPV(2, 2)).toBeLessThan(calculateCompanionPV(3, 2));
    expect(calculateCompanionPV(3, 2) - calculateCompanionPV(2, 2)).toBe(6);
  });
});

describe('createCompanion — PV', () => {
  it('usa a fórmula corrigida com a Con derivada do parceiro', () => {
    const companion = createCompanion({
      type: 'Animal',
      size: 'Médio',
      weaponDamageType: 'Corte',
      skills: [Skill.LUTA, Skill.PERCEPCAO, Skill.FURTIVIDADE],
      tricks: [{ name: 'Amigo Feroz' }, { name: 'Amigo Protetor' }],
      trainerLevel: 2,
      trainerCharisma: 2,
    });
    const con = companion.attributes[Atributo.CONSTITUICAO];
    expect(companion.pv).toBe(16 + con + (4 + con));
  });
});
