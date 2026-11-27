import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import { DefenseEquipment } from '../../interfaces/Equipment';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  Armaduras,
  capDefenseAttribute,
  defenseAttributeCap,
} from '../../data/systems/tormenta20/equipamentos';

/**
 * Mitral (JdA): "Armaduras pesadas de mitral permitem que você aplique até
 * dois pontos de sua Destreza na Defesa."
 */
const brunea = (mitral: boolean): DefenseEquipment => ({
  ...(Armaduras.BRUNEA as DefenseEquipment),
  id: 'brunea',
  modifications: mitral
    ? [{ mod: 'Material especial', specialMaterial: 'mitral' }]
    : undefined,
});

const sheetWith = (des: number, armor?: DefenseEquipment): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.atributos[Atributo.DESTREZA].value = des;
  sheet.generalPowers = [];
  sheet.classPowers = [];
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  sheet.bag = new Bag(armor ? { Armadura: [armor] } : {});
  sheet.wornArmorId = armor?.id;
  return sheet;
};

const defesa = (des: number, armor?: DefenseEquipment) =>
  recalculateSheet(sheetWith(des, armor)).defesa;

describe('armadura pesada de mitral', () => {
  it('limite: leve/sem armadura não limita; pesada zera; pesada de mitral, 2', () => {
    expect(defenseAttributeCap(undefined)).toBe(Infinity);
    expect(defenseAttributeCap(Armaduras.COURO as DefenseEquipment)).toBe(
      Infinity
    );
    expect(defenseAttributeCap(brunea(false))).toBe(0);
    expect(defenseAttributeCap(brunea(true))).toBe(2);
  });

  it('só pontos positivos entram, até o limite', () => {
    expect(capDefenseAttribute(4, 2)).toBe(2);
    expect(capDefenseAttribute(1, 2)).toBe(1);
    expect(capDefenseAttribute(-1, 2)).toBe(0);
    expect(capDefenseAttribute(-1, Infinity)).toBe(-1);
  });

  it('Brunea comum ignora a Destreza', () => {
    expect(defesa(4, brunea(false))).toBe(defesa(0, brunea(false)));
  });

  it('Brunea de mitral soma até 2 de Destreza', () => {
    const semDes = defesa(0, brunea(true));
    expect(defesa(4, brunea(true))).toBe(semDes + 2);
    expect(defesa(1, brunea(true))).toBe(semDes + 1);
    expect(defesa(-1, brunea(true))).toBe(semDes);
  });

  it('continua pesada para o deslocamento', () => {
    const comMitral = recalculateSheet(sheetWith(4, brunea(true)));
    const comum = recalculateSheet(sheetWith(4, brunea(false)));
    expect(comMitral.displacement).toBe(comum.displacement);
  });
});
