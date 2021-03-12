import {
  getRandomItemFromArray,
  pickFromArray,
} from '../functions/randomUtils';
import { ClassDescription } from '../interfaces/Class';
import { skill } from '../interfaces/Skills';

const PERICIAS: Record<skill, string> = {
  ACROBACIA: 'Acrobacia',
  ADESTRAMENTO: 'Adestramento',
  ATLETISMO: 'Atletismo',
  ATUACAO: 'Atuação',
  CAVALGAR: 'Cavalgar',
  CONHECIMENTO: 'Conhecimento',
  CURA: 'Cura',
  DIPLOMACIA: 'Diplomacia',
  ENGANACAO: 'Enganação',
  FORTITUDE: 'Fortitude',
  FURTIVIDADE: 'Furtividade',
  GUERRA: 'Guerra',
  INICIATIVA: 'Iniciativa',
  INTIMIDACAO: 'Intimidação',
  INTUICAO: 'Intuição',
  INVESTIGACAO: 'Investigação',
  JOGATINA: 'Jogatina',
  LADINAGEM: 'Ladinagem',
  LUTA: 'Luta',
  MISTICISMO: 'Misticismo',
  NOBREZA: 'Nobreza',
  OFICIO: 'Ofício',
  OFICIO_ALQUIMIA: 'Ofício (Alquímia)',
  OFICIO_ARMEIRO: 'Ofício (Armeiro)',
  OFICIO_ARTESANATO: 'Ofício (Artesanato)',
  OFICIO_ALFAIATE: 'Ofício (Alfaiate)',
  OFICIO_CULINARIA: 'Ofício (Culinária)',
  PERCEPCAO: 'Percepção',
  PILOTAGEM: 'Pilotagem',
  PONTARIA: 'Pontaria',
  REFLEXOS: 'Reflexos',
  RELIGIAO: 'Religião',
  SOBREVIVENCIA: 'Sobrevivência',
  VONTADE: 'Vontade',
};

export default PERICIAS;

export function getNotUsedSkillsFromAllowed(
  usedSkills: string[],
  allowedSkills?: string[]
): string[] {
  return (allowedSkills || Object.values(PERICIAS)).filter(
    (element) => usedSkills.indexOf(element) < 0
  );
}

export function getNotRepeatedRandomSkill(
  usedSkills: string[],
  allowedSkills?: string[]
): string {
  const notRepeatedSkills = allowedSkills
    ? getNotUsedSkillsFromAllowed(usedSkills)
    : getNotUsedSkillsFromAllowed(usedSkills, allowedSkills);

  return getRandomItemFromArray(notRepeatedSkills);
}

export function getNotRepeatedSkillsByQtd(
  usedSkills: string[],
  qtd: number,
  allowedSkills?: string[]
): string[] {
  const notUsed = getNotUsedSkillsFromAllowed(usedSkills, allowedSkills);
  return pickFromArray(notUsed, qtd);
}

const baseSkillsStrategies: Record<
  string,
  (baseSkills: string[], skills: string[]) => string[]
> = {
  and(baseSkills, skills) {
    return [...skills, ...baseSkills];
  },
  or(baseSkills, skills) {
    const newSkill = getNotRepeatedRandomSkill(skills, baseSkills);
    return [...skills, newSkill];
  },
};

export function getClassBaseSkills(classe: ClassDescription): string[] {
  return classe.periciasbasicas.reduce<string[]>(
    (skills, baseSkill) =>
      baseSkillsStrategies[baseSkill.type](baseSkill.list, skills),
    []
  );
}

export function getRemainingSkills(
  usedSkills: string[],
  classe: ClassDescription
): string[] {
  return getNotRepeatedSkillsByQtd(
    usedSkills,
    classe.periciasrestantes.qtd,
    classe.periciasrestantes.list
  );
}
