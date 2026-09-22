import { describe, expect, it } from 'vitest';
import {
  buildWeaponPurposeFields,
  getWeaponPurpose,
  getWeaponReach,
  normalizeReach,
  WeaponPurpose,
  WeaponReach,
} from '../weaponPurpose';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import {
  getWeaponSkill,
  isWeaponMelee,
  resolveDamageAttribute,
} from '../weaponSkill';
import { isFiringWeapon } from '../weaponTraits';
import Skill from '../../interfaces/Skills';

const PURPOSES: WeaponPurpose[] = ['melee', 'thrown', 'firing'];
const REACHES: WeaponReach[] = ['Curto', 'Médio', 'Longo'];

describe('weaponPurpose', () => {
  describe('round-trip escritor → leitor', () => {
    PURPOSES.forEach((purpose) => {
      REACHES.forEach((reach) => {
        it(`${purpose} + ${reach} volta como ${purpose}`, () => {
          const fields = buildWeaponPurposeFields(purpose, reach);
          expect(getWeaponPurpose(fields)).toBe(purpose);
        });
      });
    });
  });

  it('corpo a corpo grava alcance "-" explícito, não undefined', () => {
    // Campo ausente × campo '-' são coisas diferentes para o
    // refreshBagItemsFromCatalog: só o ausente pode ser curado pelo catálogo.
    const fields = buildWeaponPurposeFields('melee', 'Curto');
    expect(fields.alcance).toBe('-');
    expect(fields.arremesso).toBeUndefined();
    expect(fields.specialActions).toBeUndefined();
  });

  it('arremesso reproduz a convenção de specialActions da Adaga do catálogo', () => {
    const fields = buildWeaponPurposeFields('thrown', 'Curto');
    expect(fields.specialActions).toEqual(Armas.ADAGA.specialActions);
    expect(fields.arremesso).toBe(true);
  });

  it('arremesso aceita um damageAttribute próprio no modo arremessar', () => {
    const fields = buildWeaponPurposeFields('thrown', 'Curto', 'Destreza');
    const arremessar = fields.specialActions?.find(
      (a) => a.id === 'arremessar'
    );
    expect(arremessar?.damageAttribute).toBe('Destreza');
  });

  it('disparo não gera specialActions nem arremesso', () => {
    const fields = buildWeaponPurposeFields('firing', 'Médio');
    expect(fields).toEqual({
      alcance: 'Médio',
      arremesso: undefined,
      specialActions: undefined,
    });
  });

  describe('os predicados do motor concordam com o propósito escrito', () => {
    it('disparo → Pontaria, sem atributo no dano, isFiringWeapon', () => {
      const weapon = {
        ...buildWeaponPurposeFields('firing', 'Médio'),
        nome: 'Arco de teste',
        group: 'Arma' as const,
      };
      expect(getWeaponSkill(weapon)).toBe(Skill.PONTARIA);
      expect(resolveDamageAttribute(weapon)).toBe('Nenhum');
      expect(isWeaponMelee(weapon)).toBe(false);
      expect(isFiringWeapon(weapon)).toBe(true);
    });

    it('arremesso → conta como corpo a corpo e NÃO é arma de disparo', () => {
      const weapon = {
        ...buildWeaponPurposeFields('thrown', 'Curto'),
        nome: 'Azagaia de teste',
        group: 'Arma' as const,
      };
      expect(getWeaponSkill(weapon)).toBe(Skill.LUTA);
      expect(resolveDamageAttribute(weapon)).toBe('Força');
      expect(isWeaponMelee(weapon)).toBe(true);
      expect(isFiringWeapon(weapon)).toBe(false);
    });

    it('corpo a corpo → Luta e Força', () => {
      const weapon = {
        ...buildWeaponPurposeFields('melee', 'Curto'),
        nome: 'Clava de teste',
        group: 'Arma' as const,
      };
      expect(getWeaponSkill(weapon)).toBe(Skill.LUTA);
      expect(resolveDamageAttribute(weapon)).toBe('Força');
      expect(isFiringWeapon(weapon)).toBe(false);
    });
  });

  describe('normalizeReach', () => {
    it.each([
      ['Curto', 'Curto'],
      ['Médio', 'Médio'],
      ['médio', 'Médio'],
      ['MEDIO', 'Médio'],
      [' Curto (9m) ', 'Curto'],
      ['Longo (90m)', 'Longo'],
      ['30m', 'Médio'],
      ['-', '-'],
    ])('%s → %s', (raw, expected) => {
      expect(normalizeReach(raw)).toBe(expected);
    });

    it.each([[''], ['   '], [undefined], ['toque'], ['Curto/Médio']])(
      '%s não é reconhecido e devolve undefined',
      (raw) => {
        expect(normalizeReach(raw)).toBeUndefined();
      }
    );
  });

  describe('getWeaponReach', () => {
    it('lê o alcance do catálogo', () => {
      expect(getWeaponReach(Armas.BESTALEVE)).toBe('Médio');
    });

    it('cai em Curto para alcance ausente ou irreconhecível', () => {
      expect(getWeaponReach({})).toBe('Curto');
      expect(getWeaponReach({ alcance: '-' })).toBe('Curto');
      expect(getWeaponReach({ alcance: 'Curto/Médio' })).toBe('Curto');
    });
  });

  describe('getWeaponPurpose lendo o catálogo oficial', () => {
    it('Adaga (alcance Curto + arremesso) é arremesso, não disparo', () => {
      expect(getWeaponPurpose(Armas.ADAGA)).toBe('thrown');
    });

    it('Besta Leve é disparo', () => {
      expect(getWeaponPurpose(Armas.BESTALEVE)).toBe('firing');
    });

    it('Clava é corpo a corpo', () => {
      expect(getWeaponPurpose(Armas.CLAVA)).toBe('melee');
    });
  });
});
