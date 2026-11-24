import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { getSkillOthersBreakdown } from '../skills/skillBonusBreakdown';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import destinyPowers from '../../data/systems/tormenta20/herois-de-arton/powers/destinyPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

/**
 * Herói dos Sete Instrumentos (Heróis de Arton): "+1 em testes de perícias nas
 * quais não é treinado. No 7º nível esse bônus aumenta para +2 e, no 15º
 * nível, aumenta para +3". Era texto puro — o bônus não somava na ficha.
 *
 * O mock treina Atletismo e Intimidação.
 */
const POWER_NAME = 'Herói dos Sete Instrumentos';

const others = (sheet: CharacterSheet, skill: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

const buildSheet = (withPower: boolean, nivel = 2): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.nivel = nivel;
  sheet.generalPowers = withPower
    ? [_.cloneDeep(destinyPowers.HEROI_DOS_SETE_INSTRUMENTOS)]
    : [];
  sheet.classPowers = [];
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  return recalculateSheet(sheet);
};

describe('Herói dos Sete Instrumentos', () => {
  it.each([
    [1, 1],
    [6, 1],
    [7, 2],
    [14, 2],
    [15, 3],
    [20, 3],
  ])('no nível %i soma +%i nas perícias não treinadas', (nivel, expected) => {
    const base = buildSheet(false, nivel);
    const heroi = buildSheet(true, nivel);

    [Skill.PERCEPCAO, Skill.DIPLOMACIA, Skill.FURTIVIDADE].forEach((skill) => {
      expect(others(heroi, skill) - others(base, skill)).toBe(expected);
    });
  });

  it('não soma nas perícias treinadas', () => {
    const base = buildSheet(false, 15);
    const heroi = buildSheet(true, 15);

    [Skill.ATLETISMO, Skill.INTIMIDACAO].forEach((skill) => {
      expect(others(heroi, skill)).toBe(others(base, skill));
    });
  });

  it('não acumula entre recálculos', () => {
    const once = buildSheet(true, 7);
    const twice = recalculateSheet(once);
    expect(others(twice, Skill.PERCEPCAO)).toBe(others(once, Skill.PERCEPCAO));
  });

  it('aparece no detalhamento do "Outros" só das não treinadas', () => {
    const sheet = buildSheet(true, 7);
    const skillRow = (skill: Skill) =>
      sheet.completeSkills?.find((s) => s.name === skill);

    const untrained = skillRow(Skill.PERCEPCAO);
    const trained = skillRow(Skill.ATLETISMO);
    expect(untrained).toBeDefined();
    expect(trained).toBeDefined();

    if (untrained && trained) {
      expect(getSkillOthersBreakdown(sheet, untrained)).toContainEqual({
        label: POWER_NAME,
        value: 2,
      });
      expect(
        getSkillOthersBreakdown(sheet, trained).map((entry) => entry.label)
      ).not.toContain(POWER_NAME);
    }
  });

  it('ficha salva com a cópia antiga (sem bônus) é refrescada', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      _.omit(destinyPowers.HEROI_DOS_SETE_INSTRUMENTOS, 'sheetBonuses'),
    ];

    normalizeSheet(sheet);
    const power = sheet.generalPowers.find((p) => p.name === POWER_NAME);
    expect(power?.sheetBonuses).toHaveLength(1);
    expect(power?.sheetBonuses?.[0].target).toEqual({
      type: 'UntrainedSkills',
    });
  });
});
