import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import generateRandomSheet, {
  applyManualLevelUp,
  applyPower,
  generateEmptySheet,
} from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { findClassDescription } from '../multiclass';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassAbility } from '../../interfaces/Class';
import SelectOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';

/**
 * "Treinado em X ou Y" (`trainSkillOrBonus`) era sempre sorteado: o assistente
 * nem perguntava. Valete (Diplomacia ou Nobreza) e Jovem Pajem (Adestramento ou
 * Ofício (armeiro)) são os casos do livro.
 */
const ability = (name: string): ClassAbility => {
  const found = findClassDescription('Vassalo')?.abilities.find(
    (a) => a.name === name
  );
  if (!found) throw new Error(`Habilidade não encontrada: ${name}`);
  return found;
};

const supplements = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const options = {
  nivel: 1,
  raca: 'Anão',
  classe: 'Vassalo',
  origin: 'Aleatório',
  devocao: { label: '--', value: '--' },
  supplements,
};

const VALETE = [Skill.DIPLOMACIA, Skill.NOBREZA];

const vassalo = (trained: Skill[]): CharacterSheet => {
  const base = recalculateSheet(generateRandomSheet(options));
  const edited = _.cloneDeep(base);
  edited.skills = edited.skills.filter((s) => !VALETE.includes(s));
  edited.skills.push(...trained);
  return recalculateSheet(edited, base);
};

const levelUp = (sheet: CharacterSheet, skill: Skill) =>
  recalculateSheet(
    applyManualLevelUp(sheet, {
      level: 2,
      powerChoice: 'class',
      selectedClassPower: findClassDescription('Cavaleiro')!.powers.find(
        (p) => p.name === 'Desprezar os Covardes'
      ),
      abilityEffectSelections: { Valete: { skills: [skill] } },
    })
  );

describe('Vassalo: escolha de "treinado em X ou Y"', () => {
  it.each([
    ['Valete', VALETE],
    ['Jovem Pajem', [Skill.ADESTRAMENTO, Skill.OFICIO_ARMEIRO]],
  ])('%s pede a escolha de uma perícia', (name, skills) => {
    const reqs = getPowerSelectionRequirements(ability(name))?.requirements;
    expect(reqs).toHaveLength(1);
    expect(reqs?.[0]).toMatchObject({
      type: 'learnSkill',
      pick: 1,
      availableOptions: skills,
    });
  });

  it('não pergunta quando só há uma perícia', () => {
    expect(
      getPowerSelectionRequirements(ability('Guarda do Castelo'))
    ).toBeNull();
  });

  it('perícia já treinada continua elegível (dá +2)', () => {
    const [req] = getPowerSelectionRequirements(
      ability('Valete')
    )!.requirements;
    expect(
      getFilteredAvailableOptions(req, vassalo([Skill.DIPLOMACIA]))
    ).toEqual(VALETE);
  });

  it.each(VALETE)('subir para o 2º nível treina a escolhida: %s', (skill) => {
    const other = VALETE.find((s) => s !== skill) as Skill;
    const base = vassalo([]);
    // Repete para o sorteio não passar por acaso
    _.times(5, () => {
      const result = levelUp(base, skill);
      expect(result.skills).toContain(skill);
      expect(result.skills).not.toContain(other);
    });
  });

  it('escolher a já treinada dá +2, que sobrevive ao recálculo', () => {
    const base = vassalo([Skill.NOBREZA]);
    const others = (sheet: CharacterSheet) =>
      sheet.completeSkills?.find((s) => s.name === Skill.NOBREZA)?.others ?? 0;

    const result = levelUp(base, Skill.NOBREZA);
    expect(others(result)).toBe(others(base) + 2);
    expect(others(recalculateSheet(result))).toBe(others(base) + 2);
    expect(result.skills).not.toContain(Skill.DIPLOMACIA);
  });

  it('sem escolha (ficha aleatória), sorteia uma das opções', () => {
    const [result] = applyPower(vassalo([]), ability('Valete'));
    expect(result.skills.filter((s) => VALETE.includes(s))).toHaveLength(1);
  });

  it.each([Skill.ADESTRAMENTO, Skill.OFICIO_ARMEIRO])(
    'a criação aplica a escolha do Jovem Pajem: %s',
    (skill) => {
      _.times(5, () => {
        const sheet = generateEmptySheet(
          { ...options, origin: '' } as unknown as SelectOptions,
          {
            powerEffectSelections: { 'Jovem Pajem': { skills: [skill] } },
          } as unknown as WizardSelections
        );
        const change = sheet.sheetActionHistory
          .filter((entry) => entry.powerName === 'Jovem Pajem')
          .flatMap((entry) => entry.changes)[0];
        expect(change).toMatchObject({ skill });
        expect(sheet.skills).toContain(skill);
      });
    }
  );
});
