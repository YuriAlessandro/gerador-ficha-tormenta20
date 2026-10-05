/**
 * Etiqueta (Cavaleiro): "+2 em Diplomacia ou Nobreza". A perícia escolhida
 * precisa sobreviver aos recálculos sem seleção manual (antes o +2 sumia) e
 * aparecer no tooltip do "Outros".
 */
import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CAVALEIRO from '../../data/systems/tormenta20/classes/cavaleiro';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { getSkillOthersBreakdown } from '../skills/skillBonusBreakdown';

const ETIQUETA = CAVALEIRO.powers.find(
  (p) => p.name === 'Etiqueta'
) as ClassPower;

const othersOf = (sheet: CharacterSheet, skill: Skill) =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

describe('Etiqueta (Cavaleiro)', () => {
  it('a perícia escolhida sobrevive aos recálculos e aparece no tooltip', () => {
    const base = createMockCharacterSheet();
    const baseline = othersOf(recalculateSheet(base), Skill.NOBREZA);

    const leveled = recalculateSheet(
      { ...base, classPowers: [ETIQUETA] },
      undefined,
      { [ETIQUETA.name]: { skills: [Skill.NOBREZA] } }
    );
    expect(othersOf(leveled, Skill.NOBREZA)).toBe(baseline + 2);

    const again = recalculateSheet(leveled, leveled);
    expect(othersOf(again, Skill.NOBREZA)).toBe(baseline + 2);

    const nobreza = again.completeSkills?.find((s) => s.name === Skill.NOBREZA);
    expect(getSkillOthersBreakdown(again, nobreza!)).toContainEqual({
      label: 'Etiqueta',
      value: 2,
    });
  });
});
