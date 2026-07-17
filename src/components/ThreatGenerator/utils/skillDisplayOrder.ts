import { ThreatSkill } from '../../../interfaces/ThreatSheet';

/**
 * Perícias destacadas no topo da tabela, na ordem fixa de exibição.
 * Iniciativa e Percepção são as mais consultadas em combate; as três
 * resistências (Fortitude/Reflexos/Vontade) vêm logo em seguida.
 */
export const PRIORITY_SKILL_ORDER = [
  'Iniciativa',
  'Percepção',
  'Fortitude',
  'Reflexos',
  'Vontade',
];

interface SplitSkills {
  priority: ThreatSkill[];
  rest: ThreatSkill[];
}

/**
 * Reorganiza APENAS a exibição das perícias: retorna as perícias prioritárias
 * (na ordem de PRIORITY_SKILL_ORDER) e o restante. Não altera a ordem dos
 * dados de origem (calculateAllSkills já devolve em ordem alfabética, da qual
 * outros pontos do código dependem).
 */
export function splitSkillsForDisplay(skills: ThreatSkill[]): SplitSkills {
  const priority = PRIORITY_SKILL_ORDER.map((name) =>
    skills.find((skill) => skill.name === name)
  ).filter((skill): skill is ThreatSkill => skill !== undefined);

  const rest = skills.filter(
    (skill) => !PRIORITY_SKILL_ORDER.includes(skill.name)
  );

  return { priority, rest };
}
