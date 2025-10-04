import {
  getRandomItemFromArray,
  pickFromArray,
} from '../functions/randomUtils';
import { ClassDescription } from '../interfaces/Class';
import Skill from '../interfaces/Skills';

// Skills without "Ofício (Qualquer)" - used for random/manual selections
// This avoids the generic "Ofício (Qualquer)" appearing in skill picks,
// as it gets automatically replaced by specific crafts during sheet generation
export const SKILLS_WITHOUT_OFICIO_QUALQUER: Skill[] = Object.values(
  Skill
).filter((skill) => skill !== Skill.OFICIO);

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
    ? getNotUsedSkillsFromAllowed(usedSkills, allowedSkills)
    : getNotUsedSkillsFromAllowed(usedSkills);

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
  (baseSkills: Skill[], usedSkills: Skill[]) => Skill[]
> = {
  and(baseSkills: Skill[], usedSkills: Skill[]) {
    const notUsed = getNotUsedSkillsFromAllowed(usedSkills, baseSkills);
    return [...usedSkills, ...notUsed];
  },
  or(baseSkills: Skill[], usedSkills: Skill[]) {
    const newSkill = getNotRepeatedRandomSkill(usedSkills, baseSkills);
    return [...usedSkills, newSkill];
  },
};

export function getClassBaseSkills(classe: ClassDescription): Skill[] {
  return classe.periciasbasicas.reduce<Skill[]>(
    (usedSkills, baseSkill) =>
      baseSkillsStrategies[baseSkill.type](baseSkill.list, usedSkills),
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
