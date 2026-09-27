import CharacterSheet from '@/interfaces/CharacterSheet';
import Skill, { CompleteSkill, isTrainedOnlySkill } from '@/interfaces/Skills';
import { getEffectiveAttributeModifier } from '../effectiveAttributes';

/**
 * Modificador de tamanho que a perícia recebe. Hoje só Furtividade
 * (`size.modifiers.stealth`) — o mesmo que a tabela de perícias soma.
 */
export const getSkillSizeModifier = (
  sheet: CharacterSheet,
  skill: CompleteSkill
): number =>
  skill.name === Skill.FURTIVIDADE ? sheet.size?.modifiers?.stealth ?? 0 : 0;

/**
 * Bônus total de uma perícia: meio nível + atributo EFETIVO + outros + treino
 * + tamanho. Ponto único da fórmula — a tabela de perícias, o snapshot do
 * encontro e os pedidos de teste da mesa leem daqui.
 */
export const getSkillTotal = (
  sheet: CharacterSheet,
  skill: CompleteSkill
): number => {
  const attrValue = skill.modAttr
    ? getEffectiveAttributeModifier(sheet, skill.modAttr)
    : 0;
  return (
    (skill.halfLevel ?? 0) +
    (attrValue ?? 0) +
    (skill.others ?? 0) +
    (skill.training ?? 0) +
    getSkillSizeModifier(sheet, skill)
  );
};

export interface SkillTotalInfo {
  total: number;
  trained: boolean;
  /** Perícia "somente treinada" sem treino: o teste não pode ser feito. */
  blocked: boolean;
}

export const getSkillTotalByName = (
  sheet: CharacterSheet,
  name: string
): SkillTotalInfo | undefined => {
  const skill = sheet.completeSkills?.find((s) => s.name === name);
  if (!skill) return undefined;
  const trained = (skill.training ?? 0) > 0;
  return {
    total: getSkillTotal(sheet, skill),
    trained,
    blocked: !trained && isTrainedOnlySkill(skill.name),
  };
};
