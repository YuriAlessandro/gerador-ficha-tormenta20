import {
  getRandomItemFromArray,
  pickFromArray,
} from '../functions/randomUtils';
import { ClassDescription } from '../interfaces/Class';
import Skill from '../interfaces/Skills';

export function getNotUsedSkillsFromAllowed(
  usedSkills: Skill[],
  allowedSkills?: Skill[]
): Skill[] {
  return (allowedSkills || Object.values(Skill)).filter(
    (element) => usedSkills.indexOf(element) < 0
  );
}

export function getNotRepeatedRandomSkill(
  usedSkills: Skill[],
  allowedSkills?: Skill[]
): Skill {
  const notRepeatedSkills = allowedSkills
    ? getNotUsedSkillsFromAllowed(usedSkills)
    : getNotUsedSkillsFromAllowed(usedSkills, allowedSkills);

  return getRandomItemFromArray(notRepeatedSkills);
}

export function getNotRepeatedSkillsByQtd(
  usedSkills: Skill[],
  qtd: number,
  allowedSkills?: Skill[]
): Skill[] {
  const notUsed = getNotUsedSkillsFromAllowed(usedSkills, allowedSkills);
  return pickFromArray(notUsed, qtd);
}

const baseSkillsStrategies: Record<
  string,
  (baseSkills: Skill[], skills: Skill[]) => Skill[]
> = {
  and(baseSkills: Skill[], skills: Skill[]) {
    return [...skills, ...baseSkills];
  },
  or(baseSkills: Skill[], skills: Skill[]) {
    const newSkill = getNotRepeatedRandomSkill(skills, baseSkills);
    return [...skills, newSkill];
  },
};

export function getClassBaseSkills(classe: ClassDescription): Skill[] {
  return classe.periciasbasicas.reduce<Skill[]>(
    (skills, baseSkill) =>
      baseSkillsStrategies[baseSkill.type](baseSkill.list, skills),
    []
  );
}

export function getRemainingSkills(
  usedSkills: Skill[],
  classe: ClassDescription
): Skill[] {
  return getNotRepeatedSkillsByQtd(
    usedSkills,
    classe.periciasrestantes.qtd,
    classe.periciasrestantes.list
  );
}
