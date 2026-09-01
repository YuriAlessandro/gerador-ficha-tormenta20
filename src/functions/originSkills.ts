import { OriginSkillChoice } from '../interfaces/Origin';
import Skill, { isOficioSkill } from '../interfaces/Skills';
import { getRandomItemFromArray } from './randomUtils';

/**
 * Escolhas de perícia da origem: `choice.key` -> nome da perícia escolhida.
 * Guardamos o nome (e não o enum) para manter a seleção serializável, igual a
 * `OriginItemChoices` (`src/functions/originItems.ts`).
 */
export type OriginSkillChoices = Record<string, string>;

/**
 * Substitui a perícia genérica pela escolha do jogador. Sem escolha (ou fora
 * do pool, exceto Ofícios customizados), sorteia — o mesmo fallback usado
 * pelos itens de origem em `itemChoice`.
 */
export function resolveOriginSkillChoices(
  skillChoices: OriginSkillChoice[] | undefined,
  choices?: OriginSkillChoices
): Skill[] {
  if (!skillChoices || skillChoices.length === 0) return [];

  return skillChoices.map((choice) => {
    const chosen = choices?.[choice.key];
    if (
      chosen &&
      (choice.options.includes(chosen as Skill) || isOficioSkill(chosen))
    ) {
      return chosen as Skill;
    }
    return getRandomItemFromArray(choice.options);
  });
}

/** true quando os benefícios da origem incluem alguma escolha de perícia. */
export function originHasSkillChoices(
  skillChoices: OriginSkillChoice[] | undefined
): boolean {
  return !!skillChoices && skillChoices.length > 0;
}
