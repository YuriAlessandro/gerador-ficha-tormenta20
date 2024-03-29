import Skill from '../interfaces/Skills';

type FoundrySkillAttribute = 'for' | 'des' | 'con' | 'int' | 'sab' | 'car';

export interface FoundryCharSkill {
  label: string;
  value: number;
  atributo: FoundrySkillAttribute;
  st: boolean;
  pda: boolean;
  treino: number;
  treinado: number;
  outros: number;
  notes: string;
  mod: number;
  temp: number;
  bonus: number;
  penalidade: number;
  mais?: {
    [key: string]: {
      treinado: number;
      label: string;
      treino: number;
      atributo: FoundryCharSkill;
      outros: number;
    };
  };
}

export interface FoundryItem {
  name: string;
  type: string;
  flags: {
    core: {
      sourceId: string;
    };
  };
}

export const FOUNDRY_SKILLS = {
  [Skill.ACROBACIA]: 'acr',
  [Skill.ADESTRAMENTO]: 'ade',
  [Skill.ATLETISMO]: 'atl',
  [Skill.ATUACAO]: 'atu',
  [Skill.CAVALGAR]: 'cav',
  [Skill.CONHECIMENTO]: 'con',
  [Skill.CURA]: 'cur',
  [Skill.DIPLOMACIA]: 'dip',
  [Skill.ENGANACAO]: 'eng',
  [Skill.FORTITUDE]: 'for',
  [Skill.FURTIVIDADE]: 'fur',
  [Skill.GUERRA]: 'gue',
  [Skill.INICIATIVA]: 'ini',
  [Skill.INTIMIDACAO]: 'int',
  [Skill.INTUICAO]: 'intu',
  [Skill.INVESTIGACAO]: 'inv',
  [Skill.JOGATINA]: 'jog',
  [Skill.OFICIO]: 'ofi',
  [Skill.OFICIO_ALFAIATE]: 'ofi',
  [Skill.OFICIO_ALQUIMIA]: 'ofi',
  [Skill.OFICIO_ALVENARIA]: 'ofi',
  [Skill.OFICIO_ARMEIRO]: 'ofi',
  [Skill.OFICIO_ARTESANATO]: 'ofi',
  [Skill.OFICIO_CARPINTEIRO]: 'ofi',
  [Skill.OFICIO_CULINARIA]: 'ofi',
  [Skill.OFICIO_EGENHOQUEIRO]: 'ofi',
  [Skill.OFICIO_ESCRITA]: 'ofi',
  [Skill.OFICIO_ESCULTOR]: 'ofi',
  [Skill.OFICIO_ESTALAJADEIRO]: 'ofi',
  [Skill.OFICIO_FAZENDEIRO]: 'ofi',
  [Skill.OFICIO_JOALHEIRO]: 'ofi',
  [Skill.OFICIO_PINTOR]: 'ofi',
  [Skill.OFICIO_PESCADOR]: 'ofi',
  [Skill.OFICIO_MINERADOR]: 'ofi',
  [Skill.LADINAGEM]: 'lad',
  [Skill.LUTA]: 'lut',
  [Skill.MISTICISMO]: 'mis',
  [Skill.NOBREZA]: 'nob',
  [Skill.PERCEPCAO]: 'per',
  [Skill.PILOTAGEM]: 'pil',
  [Skill.PONTARIA]: 'pon',
  [Skill.REFLEXOS]: 'ref',
  [Skill.RELIGIAO]: 'rel',
  [Skill.SOBREVIVENCIA]: 'sob',
  [Skill.VONTADE]: 'von',
};

export const DEFAULT_SKILLS: Record<string, FoundryCharSkill> = {
  acr: {
    label: 'Acrobacia',
    value: 0,
    atributo: 'des',
    st: false,
    pda: true,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  ade: {
    label: 'Adestramento',
    value: 0,
    atributo: 'car',
    st: true,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  atl: {
    label: 'Atletismo',
    value: 0,
    atributo: 'for',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  atu: {
    label: 'Atuação',
    value: 0,
    atributo: 'car',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  cav: {
    label: 'Cavalgar',
    value: 0,
    atributo: 'des',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  con: {
    label: 'Conhecimento',
    value: 0,
    atributo: 'int',
    st: true,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  cur: {
    label: 'Cura',
    value: 0,
    atributo: 'sab',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  dip: {
    label: 'Diplomacia',
    value: 0,
    atributo: 'car',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  eng: {
    label: 'Enganação',
    value: 0,
    atributo: 'car',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  for: {
    label: 'Fortitude',
    value: 0,
    atributo: 'con',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  fur: {
    label: 'Furtividade',
    value: 0,
    atributo: 'des',
    st: false,
    pda: true,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  gue: {
    label: 'Guerra',
    value: 0,
    atributo: 'int',
    st: true,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  ini: {
    label: 'Iniciativa',
    value: 0,
    atributo: 'des',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  int: {
    label: 'Intimidação',
    value: 0,
    atributo: 'car',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  intu: {
    label: 'Intuição',
    value: 0,
    atributo: 'sab',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  inv: {
    label: 'Investigação',
    value: 0,
    atributo: 'int',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  jog: {
    label: 'Jogatina',
    value: 0,
    atributo: 'car',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  lad: {
    label: 'Ladinagem',
    value: 0,
    atributo: 'des',
    st: true,
    pda: true,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  lut: {
    label: 'Luta',
    value: 0,
    atributo: 'for',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  mis: {
    label: 'Misticismo',
    value: 0,
    atributo: 'int',
    st: true,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  nob: {
    label: 'Nobreza',
    value: 0,
    atributo: 'int',
    st: true,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  ofi: {
    label: 'Oficios',
    value: 0,
    atributo: 'int',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  per: {
    label: 'Percepção',
    value: 0,
    atributo: 'sab',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  pil: {
    label: 'Pilotagem',
    value: 0,
    atributo: 'des',
    st: true,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  pon: {
    label: 'Pontaria',
    value: 0,
    atributo: 'des',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  ref: {
    label: 'Reflexos',
    value: 0,
    atributo: 'des',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  rel: {
    label: 'Religião',
    value: 0,
    atributo: 'sab',
    st: true,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  sob: {
    label: 'Sobrevivência',
    value: 0,
    atributo: 'sab',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
  von: {
    label: 'Vontade',
    value: 0,
    atributo: 'sab',
    st: false,
    pda: false,
    treinado: 0,
    treino: 0,
    outros: 0,
    notes: '',
    mod: 0,
    temp: 0,
    bonus: 0,
    penalidade: 0,
  },
};
