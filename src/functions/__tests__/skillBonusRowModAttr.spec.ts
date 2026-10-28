/**
 * Bônus numa perícia que ainda não tem linha em `completeSkills` (ex.: o
 * Vanguardista do Kliren escolhe um Ofício não treinado) criava a linha só com
 * `others`, sem `modAttr` — e `getSkillTotal` soma 0 de atributo quando falta
 * `modAttr`, então a Inteligência sumia do Ofício mesmo depois de treinado.
 */
import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash';
import { addOtherBonusToSkill } from '../skills/general';
import { recalculateSheet } from '../recalculateSheet';
import { applyStatModifiers } from '../general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import KLIREN from '../../data/systems/tormenta20/races/kliren';

const row = (sheet: CharacterSheet, skill: Skill) =>
  sheet.completeSkills?.find((s) => s.name === skill);

describe('linha de perícia criada por bônus', () => {
  it('addOtherBonusToSkill cria a linha com o atributo-chave', () => {
    const sheet = createMockCharacterSheet();
    sheet.completeSkills = (sheet.completeSkills ?? []).filter(
      (s) => s.name !== Skill.OFICIO_ESCRIBA
    );

    addOtherBonusToSkill(sheet, Skill.OFICIO_ESCRIBA, 2);

    expect(row(sheet, Skill.OFICIO_ESCRIBA)).toMatchObject({
      others: 2,
      modAttr: Atributo.INTELIGENCIA,
    });
  });

  it('Vanguardista num Ofício não treinado: a linha nasce com Inteligência', () => {
    const vanguardista = KLIREN.abilities.find(
      (a) => a.name === 'Vanguardista'
    );
    if (!vanguardista) throw new Error('Vanguardista não encontrada');

    const sheet = createMockCharacterSheet();
    sheet.sheetBonuses = [...(vanguardista.sheetBonuses ?? [])];
    sheet.raca = KLIREN;
    sheet.optionChoices = {
      'kliren-vanguardista-oficio': [Skill.OFICIO_ESCRIBA],
    };
    sheet.completeSkills = (sheet.completeSkills ?? []).filter(
      (s) => s.name !== Skill.OFICIO_ESCRIBA
    );

    const result = applyStatModifiers(sheet);
    expect(row(result, Skill.OFICIO_ESCRIBA)).toMatchObject({
      others: 2,
      modAttr: Atributo.INTELIGENCIA,
    });
  });

  it('o recálculo cura a linha salva sem modAttr', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [...sheet.skills, Skill.OFICIO_ESCRIBA];
    sheet.completeSkills = [
      ...(sheet.completeSkills ?? []).filter(
        (s) => s.name !== Skill.OFICIO_ESCRIBA
      ),
      { name: Skill.OFICIO_ESCRIBA, others: 2 },
    ];

    const result = recalculateSheet(cloneDeep(sheet));
    expect(row(result, Skill.OFICIO_ESCRIBA)?.modAttr).toBe(
      Atributo.INTELIGENCIA
    );
  });
});
