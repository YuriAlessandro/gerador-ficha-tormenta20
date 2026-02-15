import { Atributo } from '../data/systems/tormenta20/atributos';

enum Skill {
  ACROBACIA = 'Acrobacia',
  ADESTRAMENTO = 'Adestramento',
  ATLETISMO = 'Atletismo',
  ATUACAO = 'Atuação',
  CAVALGAR = 'Cavalgar',
  CONHECIMENTO = 'Conhecimento',
  CURA = 'Cura',
  DIPLOMACIA = 'Diplomacia',
  ENGANACAO = 'Enganação',
  FORTITUDE = 'Fortitude',
  FURTIVIDADE = 'Furtividade',
  GUERRA = 'Guerra',
  INICIATIVA = 'Iniciativa',
  INTIMIDACAO = 'Intimidação',
  INTUICAO = 'Intuição',
  INVESTIGACAO = 'Investigação',
  JOGATINA = 'Jogatina',
  LADINAGEM = 'Ladinagem',
  LUTA = 'Luta',
  MISTICISMO = 'Misticismo',
  NOBREZA = 'Nobreza',
  OFICIO = 'Ofício (Qualquer)',
  OFICIO_ARMEIRO = 'Ofício (Armeiro)',
  OFICIO_ARTESANATO = 'Ofício (Artesanato)',
  OFICIO_ALQUIMIA = 'Ofício (Alquímia)',
  OFICIO_CULINARIA = 'Ofício (Culinária)',
  OFICIO_ALFAIATE = 'Ofício (Alfaiate)',
  OFICIO_ALVENARIA = 'Ofício (Alvenaria)',
  OFICIO_CARPINTEIRO = 'Ofício (Carpinteiro)',
  OFICIO_JOALHEIRO = 'Ofício (Joalheiro)',
  OFICIO_FAZENDEIRO = 'Ofício (Fazendeiro)',
  OFICIO_PESCADOR = 'Ofício (Pescador)',
  OFICIO_ESTALAJADEIRO = 'Ofício (Estalajadeiro)',
  OFICIO_ESCRIBA = 'Ofício (Escriba)',
  OFICIO_ESCULTOR = 'Ofício (Escultor)',
  OFICIO_EGENHOQUEIRO = 'Ofício (Engenhoqueiro)',
  OFICIO_PINTOR = 'Ofício (Pintor)',
  OFICIO_MINERADOR = 'Ofício (Minerador)',
  PERCEPCAO = 'Percepção',
  PILOTAGEM = 'Pilotagem',
  PONTARIA = 'Pontaria',
  REFLEXOS = 'Reflexos',
  RELIGIAO = 'Religião',
  SOBREVIVENCIA = 'Sobrevivência',
  VONTADE = 'Vontade',
}

export enum SkillsAttrs {
  Acrobacia = Atributo.DESTREZA,
  Adestramento = Atributo.CARISMA,
  Atletismo = Atributo.FORCA,
  Atuação = Atributo.CARISMA,
  Cavalgar = Atributo.DESTREZA,
  Conhecimento = Atributo.INTELIGENCIA,
  Cura = Atributo.SABEDORIA,
  Diplomacia = Atributo.CARISMA,
  Enganação = Atributo.CARISMA,
  Fortitude = Atributo.CONSTITUICAO,
  Furtividade = Atributo.DESTREZA,
  Guerra = Atributo.INTELIGENCIA,
  Iniciativa = Atributo.DESTREZA,
  Intimidação = Atributo.CARISMA,
  Intuição = Atributo.SABEDORIA,
  Investigação = Atributo.INTELIGENCIA,
  Jogatina = Atributo.CARISMA,
  Ladinagem = Atributo.DESTREZA,
  Luta = Atributo.FORCA,
  Misticismo = Atributo.INTELIGENCIA,
  Nobreza = Atributo.INTELIGENCIA,
  'Ofício (Qualquer)' = Atributo.INTELIGENCIA,
  'Ofício (Armeiro)' = Atributo.INTELIGENCIA,
  'Ofício (Artesanato)' = Atributo.INTELIGENCIA,
  'Ofício (Alquímia)' = Atributo.INTELIGENCIA,
  'Ofício (Culinária)' = Atributo.INTELIGENCIA,
  'Ofício (Alfaiate)' = Atributo.INTELIGENCIA,
  'Ofício (Alvenaria)' = Atributo.INTELIGENCIA,
  'Ofício (Carpinteiro)' = Atributo.INTELIGENCIA,
  'Ofício (Joalheiro)' = Atributo.INTELIGENCIA,
  'Ofício (Fazendeiro)' = Atributo.INTELIGENCIA,
  'Ofício (Pescador)' = Atributo.INTELIGENCIA,
  'Ofício (Estalajadeiro)' = Atributo.INTELIGENCIA,
  'Ofício (Escriba)' = Atributo.INTELIGENCIA,
  'Ofício (Escultor)' = Atributo.INTELIGENCIA,
  'Ofício (Engenhoqueiro)' = Atributo.INTELIGENCIA,
  'Ofício (Pintor)' = Atributo.INTELIGENCIA,
  'Ofício (Minerador)' = Atributo.INTELIGENCIA,
  Percepção = Atributo.SABEDORIA,
  Pilotagem = Atributo.DESTREZA,
  Pontaria = Atributo.DESTREZA,
  Reflexos = Atributo.DESTREZA,
  Religião = Atributo.SABEDORIA,
  Sobrevivência = Atributo.SABEDORIA,
  Vontade = Atributo.SABEDORIA,
}

export const SkillsWithArmorPenalty: Skill[] = [
  Skill.ACROBACIA,
  Skill.FURTIVIDADE,
  Skill.LADINAGEM,
];

// Skills that can only be used if the character is trained in them
export const TrainedOnlySkills: Skill[] = [
  Skill.ADESTRAMENTO,
  Skill.CONHECIMENTO,
  Skill.GUERRA,
  Skill.JOGATINA,
  Skill.LADINAGEM,
  Skill.MISTICISMO,
  Skill.NOBREZA,
  Skill.OFICIO,
  Skill.OFICIO_ARMEIRO,
  Skill.OFICIO_ARTESANATO,
  Skill.OFICIO_ALQUIMIA,
  Skill.OFICIO_CULINARIA,
  Skill.OFICIO_ALFAIATE,
  Skill.OFICIO_ALVENARIA,
  Skill.OFICIO_CARPINTEIRO,
  Skill.OFICIO_JOALHEIRO,
  Skill.OFICIO_FAZENDEIRO,
  Skill.OFICIO_PESCADOR,
  Skill.OFICIO_ESTALAJADEIRO,
  Skill.OFICIO_ESCRIBA,
  Skill.OFICIO_ESCULTOR,
  Skill.OFICIO_EGENHOQUEIRO,
  Skill.OFICIO_PINTOR,
  Skill.OFICIO_MINERADOR,
  Skill.PILOTAGEM,
  Skill.RELIGIAO,
];

export const ALL_SPECIFIC_OFICIOS: Skill[] = [
  Skill.OFICIO_ALQUIMIA,
  Skill.OFICIO_ARMEIRO,
  Skill.OFICIO_ARTESANATO,
  Skill.OFICIO_CULINARIA,
  Skill.OFICIO_ALFAIATE,
  Skill.OFICIO_ALVENARIA,
  Skill.OFICIO_CARPINTEIRO,
  Skill.OFICIO_JOALHEIRO,
  Skill.OFICIO_FAZENDEIRO,
  Skill.OFICIO_PESCADOR,
  Skill.OFICIO_ESTALAJADEIRO,
  Skill.OFICIO_ESCRIBA,
  Skill.OFICIO_ESCULTOR,
  Skill.OFICIO_EGENHOQUEIRO,
  Skill.OFICIO_PINTOR,
  Skill.OFICIO_MINERADOR,
];

export function isGenericOficio(name?: string): boolean {
  return name === 'Ofício' || name === Skill.OFICIO;
}

export type CompleteSkill = {
  name: Skill;
  halfLevel?: number;
  modAttr?: Atributo;
  training?: number;
  others?: number;
  countAsTormentaPower?: boolean;
};

export type SkillsTotals = {
  [value in Skill]: number;
};

export default Skill;
