import { Atributo } from '../data/atributos';

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
  OFICIO_ESCRITA = 'Ofício (Escrita)',
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
  'Ofício (Escrita)' = Atributo.INTELIGENCIA,
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

export interface CompleteSkill {
  name: Skill;
  halfLevel?: number;
  modAttr?: number;
  training?: number;
  others?: number;
}

export type SkillsTotals = {
  [value in Skill]: number;
};

export default Skill;
