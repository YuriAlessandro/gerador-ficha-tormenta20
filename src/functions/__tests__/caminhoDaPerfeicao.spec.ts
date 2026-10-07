/**
 * Maravilha Mecânica: Caminho da Perfeição (Golem Desperto, chassi Mashin):
 * "Escolha uma de suas perícias treinadas. Você recebe +2 nessa perícia."
 *
 * - Pega na subida de nível: a perícia escolhida no assistente sobrevive aos
 *   recálculos seguintes, que rodam sem a seleção (antes o +2 sumia).
 * - Pega na criação, pelo Chassi Mashin: a perícia vem no próprio campo do
 *   chassi e o assistente não avança sem ela.
 * - O card do poder mostra a perícia escolhida.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import MECHANICAL_MARVELS, {
  CAMINHO_DA_PERFEICAO_OPTION_KEY,
} from '../../data/systems/tormenta20/ameacas-de-arton/powers/mechanicalMarvels';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { GeneralPower } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { applyMashinChassi } from '../powers/special';
import { countRequirementSelections } from '../powers/manualPowerSelection';
import { getPowerAppliedBonuses } from '../sheetBonuses/appliedBonuses';
import {
  getSkillOthersBreakdown,
  hasSkillOthersDetail,
} from '../skills/skillBonusBreakdown';

const CAMINHO = MECHANICAL_MARVELS.find(
  (m) => m.name === 'Maravilha Mecânica: Caminho da Perfeição'
) as GeneralPower;
const ARMA_ACOPLADA = MECHANICAL_MARVELS.find(
  (m) => m.name === 'Maravilha Mecânica: Arma Acoplada'
) as GeneralPower;

const othersOf = (sheet: CharacterSheet, skill: Skill) =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

describe('Maravilha Mecânica: Caminho da Perfeição', () => {
  let base: CharacterSheet;

  beforeEach(() => {
    base = createMockCharacterSheet();
    base.skills = [...base.skills, Skill.LUTA];
  });

  it('a perícia escolhida na subida de nível sobrevive aos recálculos', () => {
    const baseline = othersOf(recalculateSheet(base), Skill.LUTA);

    const withPower = { ...base, generalPowers: [CAMINHO] };
    const leveled = recalculateSheet(withPower, undefined, {
      [CAMINHO.name]: { skills: [Skill.LUTA] },
    });
    expect(othersOf(leveled, Skill.LUTA)).toBe(baseline + 2);
    expect(leveled.optionChoices?.[CAMINHO_DA_PERFEICAO_OPTION_KEY]).toEqual([
      Skill.LUTA,
    ]);

    // Recálculo comum (editar a ficha, recarregar): sem seleção manual.
    const again = recalculateSheet(leveled, leveled);
    expect(othersOf(again, Skill.LUTA)).toBe(baseline + 2);
  });

  it('o card do poder mostra a perícia escolhida', () => {
    const leveled = recalculateSheet(
      { ...base, generalPowers: [CAMINHO] },
      undefined,
      { [CAMINHO.name]: { skills: [Skill.LUTA] } }
    );

    expect(getPowerAppliedBonuses(leveled, CAMINHO)).toEqual([
      { key: Skill.LUTA, label: Skill.LUTA, value: '+2' },
    ]);
  });

  it('o "Outros" da perícia atribui o +2 ao poder (tooltip)', () => {
    const leveled = recalculateSheet(
      { ...base, generalPowers: [CAMINHO] },
      undefined,
      { [CAMINHO.name]: { skills: [Skill.LUTA] } }
    );
    const luta = leveled.completeSkills?.find((s) => s.name === Skill.LUTA);
    const breakdown = getSkillOthersBreakdown(leveled, luta!);

    expect(breakdown).toContainEqual({ label: CAMINHO.name, value: 2 });
    expect(hasSkillOthersDetail(breakdown)).toBe(true);
  });

  it('na criação, grava a perícia escolhida no Chassi Mashin', () => {
    const sheet = createMockCharacterSheet();

    applyMashinChassi(sheet, {
      skills: [Skill.ATLETISMO],
      powers: [CAMINHO],
      marvelSkills: [Skill.ATLETISMO],
    });

    expect(sheet.generalPowers.map((p) => p.name)).toContain(CAMINHO.name);
    expect(sheet.optionChoices?.[CAMINHO_DA_PERFEICAO_OPTION_KEY]).toEqual([
      Skill.ATLETISMO,
    ]);
  });

  describe('assistente de criação (Chassi Mashin)', () => {
    const req = {
      type: 'mashinChassi' as const,
      availableOptions: [],
      pick: 2,
      label: 'Chassi Mashin',
    };

    it('não completa sem a perícia do bônus', () => {
      expect(
        countRequirementSelections(req, {
          skills: [Skill.LUTA],
          powers: [CAMINHO],
        })
      ).toBe(1);
      expect(
        countRequirementSelections(req, {
          skills: [Skill.LUTA],
          powers: [CAMINHO],
          marvelSkills: [Skill.LUTA],
        })
      ).toBe(2);
    });

    it('maravilha sem perícia de bônus completa como antes', () => {
      expect(
        countRequirementSelections(req, {
          skills: [Skill.LUTA],
          powers: [ARMA_ACOPLADA],
        })
      ).toBe(2);
    });
  });
});
