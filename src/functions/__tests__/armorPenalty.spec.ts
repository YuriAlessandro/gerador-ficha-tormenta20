import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { applyRaceAbilities } from '../general';
import { getTotalArmorPenalty } from '../armorPenalty';
import { getUsurparCheckModifier } from '../spells/usurpar';
import { inventor } from '../../__mocks__/classes/inventor';
import ANAO from '../../data/systems/tormenta20/races/anao';
import GOLEM from '../../data/systems/tormenta20/races/golem';
import HUMANO from '../../data/systems/tormenta20/races/humano';
import Race from '../../interfaces/Race';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill, { SkillsWithArmorPenalty } from '../../interfaces/Skills';
import { CONDITION_TEMPLATES } from '../../premium/data/conditions';

// Sem o Versátil, que treina perícias sorteadas a cada ficha.
const HUMANO_SEM_VERSATIL: Race = { ...HUMANO, abilities: [] };

const overloaded = (race: Race = HUMANO_SEM_VERSATIL): CharacterSheet => {
  const sheet = _.cloneDeep(inventor(race));
  sheet.customMaxSpaces = 2;
  sheet.dinheiro = 5000;
  return sheet;
};

const others = (sheet: CharacterSheet, name: Skill) =>
  sheet.completeSkills?.find((skill) => skill.name === name)?.others ?? 0;

const expectSkillPenalty = (
  sheet: CharacterSheet,
  baseline: CharacterSheet,
  penalty: number
) => {
  SkillsWithArmorPenalty.forEach((name) => {
    expect(others(sheet, name)).toBe(others(baseline, name) - penalty);
  });
};

describe('penalidade de armadura total', () => {
  const baseline = recalculateSheet(_.cloneDeep(inventor(HUMANO_SEM_VERSATIL)));

  it('sobrecarga aplica −5 às perícias, sem acumular entre recálculos', () => {
    const once = recalculateSheet(overloaded());
    expect(getTotalArmorPenalty(once)).toBe(5);
    expectSkillPenalty(once, baseline, 5);
    expect(others(once, Skill.LUTA)).toBe(others(baseline, Skill.LUTA));

    const twice = recalculateSheet(once);
    expect(getTotalArmorPenalty(twice)).toBe(5);
    expectSkillPenalty(twice, baseline, 5);

    twice.dinheiro = 0;
    const relieved = recalculateSheet(twice);
    expect(getTotalArmorPenalty(relieved)).toBe(0);
    expectSkillPenalty(relieved, baseline, 0);
    expect(relieved.displacement).toBe(baseline.displacement);
  });

  it('carga exatamente no limite não sobrecarrega', () => {
    const sheet = _.cloneDeep(inventor(HUMANO_SEM_VERSATIL));
    sheet.customMaxSpaces = sheet.bag.getSpaces();
    expect(getTotalArmorPenalty(recalculateSheet(sheet))).toBe(0);
  });

  it('anão sofre a penalidade, mas não perde deslocamento', () => {
    const sheet = recalculateSheet(overloaded(ANAO));
    const normal = recalculateSheet(_.cloneDeep(inventor(ANAO)));
    expect(getTotalArmorPenalty(sheet)).toBe(5);
    expect(sheet.displacement).toBe(normal.displacement);
  });

  it('Chassi do Golem chega às perícias', () => {
    const golem = recalculateSheet(
      applyRaceAbilities(_.cloneDeep(inventor(GOLEM)))
    );
    expect(getTotalArmorPenalty(golem)).toBe(2);
    expect(others(golem, Skill.FURTIVIDADE)).toBe(
      others(baseline, Skill.FURTIVIDADE) - 2
    );
  });

  it('ajuste manual aumenta ou reduz, sem virar bônus', () => {
    const sheet = overloaded();
    sheet.bonusArmorPenalty = -3;
    const reduced = recalculateSheet(sheet);
    expect(getTotalArmorPenalty(reduced)).toBe(2);
    expectSkillPenalty(reduced, baseline, 2);

    sheet.bonusArmorPenalty = -20;
    const floored = recalculateSheet(sheet);
    expect(getTotalArmorPenalty(floored)).toBe(0);
    expectSkillPenalty(floored, baseline, 0);
  });

  it('entra no teste de Enganação do Usurpar', () => {
    const sheet = recalculateSheet(overloaded());
    expect(getUsurparCheckModifier(sheet)).toBe(
      getUsurparCheckModifier(baseline) - 5
    );
  });

  it('condição Sobrecarregado aplica −5/−3m e não acumula com a mochila', () => {
    // No build público o catálogo de condições é stub.
    if (!CONDITION_TEMPLATES?.sobrecarregado?.generateBonuses) return;

    const condition = [
      { id: 'sobrecarregado' },
    ] as unknown as CharacterSheet['activeConditions'];
    [_.cloneDeep(inventor(HUMANO_SEM_VERSATIL)), overloaded()].forEach(
      (base) => {
        const sheet = recalculateSheet({
          ...base,
          activeConditions: condition,
        });
        expect(getTotalArmorPenalty(sheet)).toBe(5);
        expectSkillPenalty(sheet, baseline, 5);
        expect(sheet.displacement).toBe(baseline.displacement - 3);
      }
    );
  });
});
