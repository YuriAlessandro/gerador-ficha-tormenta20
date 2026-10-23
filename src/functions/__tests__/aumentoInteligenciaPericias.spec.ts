import _ from 'lodash';
import generateRandomSheet, { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { findClassDescription } from '../multiclass';
import { revertLastLevel } from '../revertLevel';
import {
  getIntelligenceIncreaseSkillCount,
  getIntelligenceSkillOptions,
  getIntelligenceSkillsPick,
} from '../powers/intelligenceIncreaseSkills';
import { CAMINHO_GOVERNANTE } from '../../data/systems/tormenta20/herois-de-arton/variantClasses/vassalo';
import {
  countRequirementSelections,
  getPowerSelectionRequirements,
  validateSelections,
} from '../powers/manualPowerSelection';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';

/**
 * JdA, "Escolhendo Perícias": "Você pode ganhar novas perícias treinadas com o
 * poder Treinamento em Perícia ou aumentando sua Inteligência (exceto aumentos
 * temporários)." Issue #493.
 */

const levelUp = (sheet: CharacterSheet, sel: LevelUpSelections) =>
  recalculateSheet(applyManualLevelUp(sheet, sel));

// Anão: Humano sorteia um poder geral a cada recálculo e deixa o teste flaky.
const generate = (intelligence: number): CharacterSheet => {
  const sheet = recalculateSheet(
    generateRandomSheet({
      nivel: 1,
      raca: 'Anão',
      classe: 'Guerreiro',
      origin: 'Aleatório',
      devocao: { label: '--', value: '--' },
      supplements: [SupplementId.TORMENTA20_CORE],
    })
  );
  const adjusted = _.cloneDeep(sheet);
  adjusted.atributos[Atributo.INTELIGENCIA].value = intelligence;
  return adjusted;
};

const aumento = (): ClassPower => {
  const power = findClassDescription('Guerreiro')!.powers.find(
    (p) => p.name === 'Aumento de Atributo'
  );
  if (!power) throw new Error('Aumento de Atributo não encontrado');
  return power;
};

const untrained = (sheet: CharacterSheet): Skill[] =>
  [Skill.MISTICISMO, Skill.CONHECIMENTO, Skill.NOBREZA, Skill.CURA].filter(
    (skill) => !sheet.skills.includes(skill)
  );

const raiseIntelligence = (
  sheet: CharacterSheet,
  intelligenceSkills?: Skill[]
): CharacterSheet =>
  levelUp(sheet, {
    level: sheet.nivel + 1,
    powerChoice: 'class',
    selectedClassPower: aumento(),
    powerEffectSelections: {
      'Aumento de Atributo': {
        attributes: [Atributo.INTELIGENCIA],
        ...(intelligenceSkills ? { intelligenceSkills } : {}),
      },
    },
  });

describe('perícias por aumento de Inteligência', () => {
  test('só a parte positiva da Inteligência conta', () => {
    expect(getIntelligenceIncreaseSkillCount(0, 1)).toBe(1);
    expect(getIntelligenceIncreaseSkillCount(2, 1)).toBe(1);
    expect(getIntelligenceIncreaseSkillCount(-1, 1)).toBe(0);
    expect(getIntelligenceIncreaseSkillCount(-1, 2)).toBe(1);
  });

  test('Aumento de Atributo em Inteligência treina a perícia escolhida', () => {
    const base = generate(1);
    const [chosen] = untrained(base);

    const up = raiseIntelligence(base, [chosen]);

    expect(up.atributos[Atributo.INTELIGENCIA].value).toBe(2);
    expect(up.skills).toContain(chosen);
    expect(up.skills).toHaveLength(base.skills.length + 1);
    expect(
      up.completeSkills?.find((skill) => skill.name === chosen)?.training
    ).toBeGreaterThan(0);

    // Recalcular de novo não duplica nem perde a perícia.
    const again = recalculateSheet(up);
    expect(again.skills.filter((skill) => skill === chosen)).toHaveLength(1);
  });

  test('sem escolha manual, sorteia uma perícia ainda não treinada', () => {
    const base = generate(0);
    const up = raiseIntelligence(base);

    const added = up.skills.filter((skill) => !base.skills.includes(skill));
    expect(added).toHaveLength(1);
  });

  test('subir a Inteligência de -1 para 0 não concede perícia', () => {
    const base = generate(-1);
    const up = raiseIntelligence(base);

    expect(up.atributos[Atributo.INTELIGENCIA].value).toBe(0);
    expect([...up.skills].sort()).toEqual([...base.skills].sort());
  });

  test('aumentar outro atributo não concede perícia', () => {
    const base = generate(1);
    const up = levelUp(base, {
      level: 2,
      powerChoice: 'class',
      selectedClassPower: aumento(),
      powerEffectSelections: {
        'Aumento de Atributo': { attributes: [Atributo.FORCA] },
      },
    });
    expect([...up.skills].sort()).toEqual([...base.skills].sort());
  });

  test('desfazer o nível tira a perícia junto com o aumento', () => {
    const base = generate(1);
    const [chosen] = untrained(base);
    const up = raiseIntelligence(base, [chosen]);

    const reverted = revertLastLevel(up);
    expect(reverted.atributos[Atributo.INTELIGENCIA].value).toBe(1);
    expect(reverted.skills).not.toContain(chosen);
  });

  test('o requisito só fica completo com a perícia escolhida', () => {
    const base = generate(1);
    const requirement = getPowerSelectionRequirements(
      aumento()
    )!.requirements.find((req) => req.type === 'increaseAttribute')!;
    const [chosen] = untrained(base);
    const onlyAttribute = { attributes: [Atributo.INTELIGENCIA] };
    const withSkill = { ...onlyAttribute, intelligenceSkills: [chosen] };

    expect(getIntelligenceSkillsPick(requirement, onlyAttribute, 1)).toBe(1);
    expect(countRequirementSelections(requirement, onlyAttribute, 1)).toBe(0);
    expect(countRequirementSelections(requirement, withSkill, 1)).toBe(1);
    // Inteligência negativa: nada a escolher.
    expect(countRequirementSelections(requirement, onlyAttribute, -2)).toBe(1);

    const requirements = {
      powerName: 'Aumento de Atributo',
      requirements: [requirement],
    };
    expect(validateSelections(requirements, onlyAttribute, base).isValid).toBe(
      false
    );
    expect(validateSelections(requirements, withSkill, base).isValid).toBe(
      true
    );
  });

  test('Visconde do Governante (Vassalo 11) também treina a perícia', () => {
    const supplements = [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ];
    const isGovernante = (sheet: CharacterSheet) =>
      sheet.sheetActionHistory.some((entry) =>
        entry.changes.some(
          (change) =>
            change.type === 'OptionChosen' &&
            change.chosenName === CAMINHO_GOVERNANTE
        )
      );
    let base: CharacterSheet | undefined;
    for (let i = 0; i < 50 && !base; i += 1) {
      const candidate = recalculateSheet(
        generateRandomSheet({
          nivel: 10,
          raca: 'Anão',
          classe: 'Vassalo',
          origin: 'Aleatório',
          devocao: { label: '--', value: '--' },
          supplements,
        })
      );
      if (isGovernante(candidate)) base = candidate;
    }
    if (!base) throw new Error('Nenhum Vassalo do Governante gerado');

    base = _.cloneDeep(base);
    base.atributos[Atributo.INTELIGENCIA].value = 1;
    const chosen = getIntelligenceSkillOptions(base.skills)[0];
    const up = levelUp(base, {
      level: 11,
      // O Vassalo não ganha poder no 11º nível: nenhum poder selecionado.
      powerChoice: 'class',
      abilityEffectSelections: {
        Visconde: {
          attributes: [Atributo.INTELIGENCIA],
          intelligenceSkills: [chosen],
        },
      },
    });

    expect(up.atributos[Atributo.INTELIGENCIA].value).toBe(2);
    expect(up.skills).toContain(chosen);
    expect(up.skills).toHaveLength(base.skills.length + 1);
  });
});
