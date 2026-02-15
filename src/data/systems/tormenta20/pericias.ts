import {
  getRandomItemFromArray,
  pickFromArray,
} from '../../../functions/randomUtils';
import { ClassDescription, BasicExpertise } from '../../../interfaces/Class';
import Skill, { ALL_SPECIFIC_OFICIOS } from '../../../interfaces/Skills';

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

export function expandOficioInBasicas(
  basicas: BasicExpertise[]
): BasicExpertise[] {
  return basicas.flatMap((group) => {
    if (!group.list.includes(Skill.OFICIO)) {
      return [group];
    }

    if (group.type === 'and') {
      const remaining = group.list.filter((s) => s !== Skill.OFICIO);
      const result: BasicExpertise[] = [];
      if (remaining.length > 0) {
        result.push({ type: 'and', list: remaining });
      }
      result.push({ type: 'or', list: [...ALL_SPECIFIC_OFICIOS] });
      return result;
    }

    if (group.type === 'or') {
      const expanded = group.list.flatMap((s) =>
        s === Skill.OFICIO ? ALL_SPECIFIC_OFICIOS : [s]
      );
      return [{ type: 'or', list: expanded }];
    }

    return [group];
  });
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

export function getClassBaseSkillsWithChoices(
  classe: ClassDescription,
  orChoices: Skill[],
  expandedBasicas?: BasicExpertise[]
): Skill[] {
  let orIndex = 0;
  const basicas = expandedBasicas || classe.periciasbasicas;

  return basicas.reduce<Skill[]>((result, basicExpertise) => {
    if (basicExpertise.type === 'and') {
      return [...result, ...basicExpertise.list];
    }
    if (basicExpertise.type === 'or') {
      const choice = orChoices[orIndex];
      orIndex += 1;
      if (choice && basicExpertise.list.includes(choice)) {
        return [...result, choice];
      }
    }
    return result;
  }, []);
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
