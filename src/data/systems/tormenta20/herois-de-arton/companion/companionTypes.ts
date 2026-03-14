import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';
import { CompanionType } from '../../../../../interfaces/Companion';

export interface CompanionTypeDefinition {
  name: CompanionType;
  description: string;
  attributeBonuses: Partial<Record<Atributo, number>>;
  senses?: string[];
  immunities?: string[];
  trainedSkills?: Skill[];
  extraThreatMargin?: number;
  extraNaturalWeapon?: boolean;
  specialAbilities?: string[];
}

export const COMPANION_TYPE_ANIMAL: CompanionTypeDefinition = {
  name: 'Animal',
  description:
    '+1 em Força, Destreza e Sabedoria, faro, visão na penumbra, treinamento em Percepção e Sobrevivência e +1 na margem de ameaça com suas armas naturais.',
  attributeBonuses: {
    [Atributo.FORCA]: 1,
    [Atributo.DESTREZA]: 1,
    [Atributo.SABEDORIA]: 1,
  },
  senses: ['Faro', 'Visão na penumbra'],
  trainedSkills: [Skill.PERCEPCAO, Skill.SOBREVIVENCIA],
  extraThreatMargin: 1,
};

export const COMPANION_TYPE_CONSTRUTO: CompanionTypeDefinition = {
  name: 'Construto',
  description:
    '+2 em Constituição, visão no escuro e imunidade a efeitos de cansaço, metabólicos e de veneno. Não respira, alimenta-se ou dorme.',
  attributeBonuses: {
    [Atributo.CONSTITUICAO]: 2,
  },
  senses: ['Visão no escuro'],
  immunities: ['Cansaço', 'Metabólicos', 'Veneno'],
  specialAbilities: [
    'Não respira, alimenta-se ou dorme',
    'Não é afetado por condições de descanso',
    'Não se beneficia de cura mundana',
    'Ofício (artesão) substitui Cura',
  ],
};

export const COMPANION_TYPE_ESPIRITO: CompanionTypeDefinition = {
  name: 'Espírito',
  description:
    '+1 em Sabedoria e Carisma. Pode assumir forma incorpórea Minúscula com deslocamento de voo 9m.',
  attributeBonuses: {
    [Atributo.SABEDORIA]: 1,
    [Atributo.CARISMA]: 1,
  },
  specialAbilities: [
    'Pode assumir forma incorpórea Minúscula (ação de movimento)',
    'Forma incorpórea: voo 9m, não pode atacar ou usar habilidades',
  ],
};

export const COMPANION_TYPE_MONSTRO: CompanionTypeDefinition = {
  name: 'Monstro',
  description:
    '+1 em Força e Destreza, visão no escuro e uma segunda arma natural.',
  attributeBonuses: {
    [Atributo.FORCA]: 1,
    [Atributo.DESTREZA]: 1,
  },
  senses: ['Visão no escuro'],
  extraNaturalWeapon: true,
};

export const COMPANION_TYPE_MORTO_VIVO: CompanionTypeDefinition = {
  name: 'Morto-Vivo',
  description:
    '+2 em Constituição, visão no escuro e imunidade a efeitos de cansaço, metabólicos, de trevas e de veneno.',
  attributeBonuses: {
    [Atributo.CONSTITUICAO]: 2,
  },
  senses: ['Visão no escuro'],
  immunities: ['Cansaço', 'Metabólicos', 'Trevas', 'Veneno'],
  specialAbilities: [
    'Não respira, alimenta-se ou dorme',
    'Não é afetado por condições de descanso',
    'Sofre dano por efeitos mágicos de cura de luz',
    'Recupera PV com dano de trevas',
  ],
};

export const COMPANION_TYPES: CompanionTypeDefinition[] = [
  COMPANION_TYPE_ANIMAL,
  COMPANION_TYPE_CONSTRUTO,
  COMPANION_TYPE_ESPIRITO,
  COMPANION_TYPE_MONSTRO,
  COMPANION_TYPE_MORTO_VIVO,
];

export function getCompanionTypeDefinition(
  type: CompanionType
): CompanionTypeDefinition {
  const def = COMPANION_TYPES.find((t) => t.name === type);
  if (!def) {
    throw new Error(`Tipo de parceiro desconhecido: ${type}`);
  }
  return def;
}
