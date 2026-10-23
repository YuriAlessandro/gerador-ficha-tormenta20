import { Atributo } from '@/data/systems/tormenta20/atributos';
import { SKILLS_WITHOUT_OFICIO_QUALQUER } from '@/data/systems/tormenta20/pericias';
import {
  PowerSelectionRequirement,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import Skill from '@/interfaces/Skills';

/**
 * Perícias treinadas ganhas por um aumento permanente de Inteligência.
 *
 * JdA, "Escolhendo Perícias": o personagem tem perícias treinadas igual à sua
 * Inteligência, e ganha novas "aumentando sua Inteligência (exceto aumentos
 * temporários)". Só a parte positiva do valor conta: subir de -1 para 0 não
 * concede nada; de 0 para 1, uma perícia.
 */
export function getIntelligenceIncreaseSkillCount(
  intelligenceBefore: number,
  increase: number
): number {
  return (
    Math.max(0, intelligenceBefore + increase) - Math.max(0, intelligenceBefore)
  );
}

/**
 * Quantas perícias por Inteligência a escolha atual de um requisito
 * `increaseAttribute` concede. Zero para qualquer outro requisito ou quando o
 * atributo escolhido não é Inteligência.
 */
export function getIntelligenceSkillsPick(
  requirement: PowerSelectionRequirement,
  selections: SelectionOptions | undefined,
  intelligence: number
): number {
  if (requirement.type !== 'increaseAttribute') return 0;
  if (!selections?.attributes?.includes(Atributo.INTELIGENCIA)) return 0;
  return getIntelligenceIncreaseSkillCount(
    intelligence,
    requirement.metadata?.increaseValue ?? 1
  );
}

/** Perícias que ainda podem ser treinadas pelo aumento de Inteligência. */
export function getIntelligenceSkillOptions(trainedSkills: Skill[]): Skill[] {
  return SKILLS_WITHOUT_OFICIO_QUALQUER.filter(
    (skill) => !trainedSkills.includes(skill)
  );
}
