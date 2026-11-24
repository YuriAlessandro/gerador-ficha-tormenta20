import CharacterSheet from '../interfaces/CharacterSheet';
import { SkillsWithArmorPenalty } from '../interfaces/Skills';
import { hasOverloadedCondition, isOverloaded } from './encumbrance';
import { getActiveArmorPenalty } from './proficiencies';

/** Penalidade de armadura imposta pela sobrecarga (JDA, cap. 3). */
export const OVERLOAD_ARMOR_PENALTY = 5;

/**
 * Parcela da sobrecarga. Raças com `ignoreEncumbrance` NÃO são isentas: a
 * habilidade delas só impede a redução de deslocamento.
 */
export function getOverloadArmorPenalty(sheet: CharacterSheet): number {
  return isOverloaded(sheet) && !hasOverloadedCondition(sheet)
    ? OVERLOAD_ARMOR_PENALTY
    : 0;
}

/**
 * Penalidade de armadura TOTAL: armadura/escudo ativos + bônus `ArmorPenalty`
 * + sobrecarga + ajuste manual. Positiva (quem usa subtrai), nunca negativa.
 *
 * Ponto único para exibição, PDF e qualquer teste que sofra a penalidade.
 */
export function getTotalArmorPenalty(sheet: CharacterSheet): number {
  return Math.max(
    0,
    getActiveArmorPenalty(sheet) +
      (sheet.extraArmorPenalty ?? 0) +
      (sheet.bonusArmorPenalty ?? 0) +
      getOverloadArmorPenalty(sheet)
  );
}

/**
 * Soma às perícias a parte da penalidade que não vem de armadura/escudo. A
 * parcela dos itens já está em `others`; esta só fica conhecida depois que os
 * bônus da ficha definem `extraArmorPenalty` e `maxSpaces`.
 */
export function applyExtraArmorPenaltyToSkills(
  sheet: CharacterSheet
): CharacterSheet {
  const extra = getTotalArmorPenalty(sheet) - getActiveArmorPenalty(sheet);
  if (extra === 0 || !sheet.completeSkills) return sheet;

  return {
    ...sheet,
    completeSkills: sheet.completeSkills.map((skill) =>
      SkillsWithArmorPenalty.includes(skill.name)
        ? { ...skill, others: (skill.others ?? 0) - extra }
        : skill
    ),
  };
}
