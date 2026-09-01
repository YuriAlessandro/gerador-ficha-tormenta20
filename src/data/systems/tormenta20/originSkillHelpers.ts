import { OriginSkillChoice } from '../../../interfaces/Origin';
import Skill from '../../../interfaces/Skills';

/**
 * Declara uma perícia de origem que o jogador escolhe entre várias opções
 * ("Ofício qualquer" -> qual Ofício específico).
 */
export function skillChoice(
  key: string,
  label: string,
  options: Skill[]
): OriginSkillChoice {
  return { key, label, options };
}

export default skillChoice;
