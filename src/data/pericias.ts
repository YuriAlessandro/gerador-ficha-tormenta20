import { getRandomItemFromArray } from '../functions/randomUtils';
import { ClassDescription } from '../interfaces/Class';

const PERICIAS: Record<string, string> = {
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

export function getNotRepeatedRandomSkill(
  periciasUsadas: string[],
  allowedSkills?: string[]
): string {
  const notRepeatedSkills = (allowedSkills || Object.values(PERICIAS)).filter(
    (pericia) => !periciasUsadas.includes(PERICIAS[pericia])
  );
  return getRandomItemFromArray(notRepeatedSkills);
}

const getBaseSkill: Record<
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
    (skills, baseSkill) => getBaseSkill[baseSkill.type](baseSkill.list, skills),
    []
  );
}
