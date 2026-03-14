import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';
import {
  CompanionSheet,
  CompanionSize,
  CompanionType,
  CompanionNaturalWeapon,
  CompanionTrick,
  NaturalWeaponDamageType,
  SpiritEnergyType,
} from '../../../../../interfaces/Companion';
import {
  getCompanionTypeDefinition,
  CompanionTypeDefinition,
} from './companionTypes';
import COMPANION_TRICKS, {
  getAvailableTricks,
  getCompanionTrickDefinition,
} from './companionTricks';

export { COMPANION_TRICKS, getAvailableTricks, getCompanionTrickDefinition };
export { COMPANION_TYPES, getCompanionTypeDefinition } from './companionTypes';

/** Perícias disponíveis para o parceiro escolher */
export const COMPANION_AVAILABLE_SKILLS: Skill[] = [
  Skill.ACROBACIA,
  Skill.ATLETISMO,
  Skill.FORTITUDE,
  Skill.FURTIVIDADE,
  Skill.LUTA,
  Skill.PERCEPCAO,
  Skill.PONTARIA,
  Skill.REFLEXOS,
  Skill.SOBREVIVENCIA,
  Skill.VONTADE,
];

/** Tamanhos disponíveis na criação */
export const COMPANION_SIZES: CompanionSize[] = ['Pequeno', 'Médio', 'Grande'];

/** Tipos de dano disponíveis para arma natural */
export const COMPANION_WEAPON_DAMAGE_TYPES: NaturalWeaponDamageType[] = [
  'Corte',
  'Impacto',
  'Perfuração',
];

// --- Atributos base do parceiro ---
const BASE_ATTRIBUTES: Record<Atributo, number> = {
  [Atributo.FORCA]: 1,
  [Atributo.DESTREZA]: 1,
  [Atributo.CONSTITUICAO]: 1,
  [Atributo.INTELIGENCIA]: -4,
  [Atributo.SABEDORIA]: 1,
  [Atributo.CARISMA]: 0,
};

function computeAttributes(
  typeDef: CompanionTypeDefinition,
  tricks: CompanionTrick[]
): Record<Atributo, number> {
  const attrs = { ...BASE_ATTRIBUTES };

  // Bônus do tipo
  if (typeDef.attributeBonuses) {
    Object.entries(typeDef.attributeBonuses).forEach(([attr, bonus]) => {
      attrs[attr as Atributo] += bonus;
    });
  }

  // Anatomia Humanoide: Int -2 ao invés de -4
  if (tricks.some((t) => t.name === 'Anatomia Humanoide')) {
    attrs[Atributo.INTELIGENCIA] = -2;
  }

  // Amigão: +1 For
  if (tricks.some((t) => t.name === 'Amigão')) {
    attrs[Atributo.FORCA] += 1;
  }

  // Condicionamento Especial: +2 em um atributo, +1 em outro
  tricks
    .filter((t) => t.name === 'Condicionamento Especial')
    .forEach((t) => {
      if (t.choices) {
        const primary = t.choices.primary as Atributo | undefined;
        const secondary = t.choices.secondary as Atributo | undefined;
        if (primary) attrs[primary] += 2;
        if (secondary) attrs[secondary] += 1;
      }
    });

  return attrs;
}

function computeNaturalWeapons(
  baseDamageType: NaturalWeaponDamageType,
  typeDef: CompanionTypeDefinition,
  tricks: CompanionTrick[]
): CompanionNaturalWeapon[] {
  const hasAnatomiaHumanoide = tricks.some(
    (t) => t.name === 'Anatomia Humanoide'
  );

  // Anatomia Humanoide remove a arma natural inicial
  if (hasAnatomiaHumanoide) return [];

  const baseThreatMargin = 20 - (typeDef.extraThreatMargin || 0);
  let baseDamageDice = '1d8';

  // Amigo Feroz: dano +1 passo e +2 margem de ameaça
  const hasAmigoFeroz = tricks.some((t) => t.name === 'Amigo Feroz');
  // Amigão: dano +1 passo
  const hasAmigao = tricks.some((t) => t.name === 'Amigão');

  if (hasAmigoFeroz && hasAmigao) {
    baseDamageDice = '2d8';
  } else if (hasAmigoFeroz || hasAmigao) {
    baseDamageDice = '2d6';
  }

  const ferozThreatBonus = hasAmigoFeroz ? 2 : 0;

  const weapons: CompanionNaturalWeapon[] = [
    {
      damageType: baseDamageType,
      damageDice: baseDamageDice,
      criticalMultiplier: 2,
      threatMargin: baseThreatMargin - ferozThreatBonus,
    },
  ];

  // Monstro ganha segunda arma natural
  if (typeDef.extraNaturalWeapon) {
    weapons.push({
      damageType: baseDamageType,
      damageDice: baseDamageDice,
      criticalMultiplier: 2,
      threatMargin: baseThreatMargin - ferozThreatBonus,
    });
  }

  // Arma Natural Adicional (truque)
  const extraWeaponCount = tricks.filter(
    (t) => t.name === 'Arma Natural Adicional'
  ).length;
  for (let i = 0; i < extraWeaponCount; i += 1) {
    weapons.push({
      damageType: baseDamageType,
      damageDice: baseDamageDice,
      criticalMultiplier: 2,
      threatMargin: baseThreatMargin - ferozThreatBonus,
    });
  }

  return weapons;
}

function computeSkills(
  chosenSkills: Skill[],
  typeDef: CompanionTypeDefinition
): Skill[] {
  const skills = [...chosenSkills];
  if (typeDef.trainedSkills) {
    typeDef.trainedSkills.forEach((s) => {
      if (!skills.includes(s)) {
        skills.push(s);
      }
    });
  }
  // Veloz treina Atletismo
  // (verificado na chamada via tricks, mas skills aqui é base)
  return skills;
}

function computeSenses(
  typeDef: CompanionTypeDefinition,
  _tricks: CompanionTrick[]
): string[] {
  return typeDef.senses ? [...typeDef.senses] : [];
}

function computeImmunities(typeDef: CompanionTypeDefinition): string[] {
  return typeDef.immunities ? [...typeDef.immunities] : [];
}

function computeSize(
  baseSize: CompanionSize,
  tricks: CompanionTrick[]
): CompanionSize {
  if (tricks.some((t) => t.name === 'Amigão')) return 'Enorme';
  return baseSize;
}

function computeDisplacement(tricks: CompanionTrick[]): number {
  let displacement = 12;
  if (tricks.some((t) => t.name === 'Veloz')) {
    displacement += 3;
  }
  return displacement;
}

function computeMovementTypes(
  tricks: CompanionTrick[]
): { voo?: number; escalada?: number; natacao?: number } | undefined {
  const movementTypes: { voo?: number; escalada?: number; natacao?: number } =
    {};
  let hasMovement = false;

  // Asas: pairar 12m (voo com custo de PM)
  if (tricks.some((t) => t.name === 'Asas')) {
    movementTypes.voo = 12;
    hasMovement = true;
  }

  // Alado: voo 15m (sobrescreve Asas)
  if (tricks.some((t) => t.name === 'Alado')) {
    movementTypes.voo = 15;
    hasMovement = true;
  }

  // Deslocamento Especial
  tricks
    .filter((t) => t.name === 'Deslocamento Especial')
    .forEach((t) => {
      if (t.choices?.type === 'Escalada') {
        movementTypes.escalada = 12;
        hasMovement = true;
      }
      if (t.choices?.type === 'Natação') {
        movementTypes.natacao = 12;
        hasMovement = true;
      }
    });

  return hasMovement ? movementTypes : undefined;
}

function computeRd(tricks: CompanionTrick[]): number | undefined {
  let rd = 0;
  if (tricks.some((t) => t.name === 'Redução de Dano')) {
    rd += 5;
  }
  return rd > 0 ? rd : undefined;
}

function computeProficiencies(tricks: CompanionTrick[]): string[] | undefined {
  const hasAnatomia = tricks.some((t) => t.name === 'Anatomia Humanoide');
  const hasMarcial = tricks.some((t) => t.name === 'Treinamento Marcial');

  if (!hasAnatomia) return undefined;

  const profs = ['Armas simples', 'Armaduras leves'];
  if (hasMarcial) {
    profs.push('Armas marciais', 'Armaduras pesadas', 'Escudos');
  }
  return profs;
}

/** Calcula PV do parceiro */
export function calculateCompanionPV(
  trainerLevel: number,
  conMod: number
): number {
  // PV = 16 + Con + (nível × (4 + Con))
  // Nível 1: 16 + Con + (1 × (4 + Con)) = 20 + 2×Con
  return 16 + conMod + trainerLevel * (4 + conMod);
}

/** Calcula Defesa do parceiro */
export function calculateCompanionDefense(
  desMod: number,
  trainerCharisma: number,
  trainerLevel: number,
  hasFullLevelDefense: boolean
): number {
  const levelBonus = hasFullLevelDefense
    ? trainerLevel
    : Math.floor(trainerLevel / 2);
  const defense = 10 + desMod + trainerCharisma + levelBonus;

  return defense;
}

/** Calcula quantidade de truques por nível do treinador */
export function getTrickCount(trainerLevel: number): number {
  // Começa com 2, +1 a cada 3 níveis (4, 7, 10, 13, 16, 19)
  let count = 2;
  for (let level = 4; level <= trainerLevel; level += 3) {
    count += 1;
  }
  return count;
}

/** Recalcula todos os stats derivados do parceiro */
export function calculateCompanionStats(
  companion: CompanionSheet,
  trainerLevel: number,
  trainerCharisma: number
): CompanionSheet {
  const typeDef = getCompanionTypeDefinition(companion.companionType);
  const attrs = computeAttributes(typeDef, companion.tricks);
  const size = computeSize(companion.size, companion.tricks);
  const displacement = computeDisplacement(companion.tricks);
  const hasFullLevelDefense = companion.tricks.some(
    (t) => t.name === 'Treinamento Defensivo'
  );
  const hasVeloz = companion.tricks.some((t) => t.name === 'Veloz');

  let defesa = calculateCompanionDefense(
    attrs[Atributo.DESTREZA],
    trainerCharisma,
    trainerLevel,
    hasFullLevelDefense
  );

  // Veloz: +2 Defesa
  if (hasVeloz) {
    defesa += 2;
  }

  return {
    ...companion,
    attributes: attrs,
    size,
    pv: calculateCompanionPV(trainerLevel, attrs[Atributo.CONSTITUICAO]),
    defesa,
    displacement,
    naturalWeapons: computeNaturalWeapons(
      companion.naturalWeapons[0]?.damageType || 'Corte',
      typeDef,
      companion.tricks
    ),
    movementTypes: computeMovementTypes(companion.tricks),
    senses: computeSenses(typeDef, companion.tricks),
    immunities: computeImmunities(typeDef),
    reducaoDeDano: computeRd(companion.tricks),
    proficiencies: computeProficiencies(companion.tricks),
    hasAnatomiaHumanoide: companion.tricks.some(
      (t) => t.name === 'Anatomia Humanoide'
    ),
    skills: computeSkills(companion.skills, typeDef),
  };
}

export interface CreateCompanionOptions {
  name?: string;
  type: CompanionType;
  size: CompanionSize;
  weaponDamageType: NaturalWeaponDamageType;
  spiritEnergyType?: SpiritEnergyType;
  skills: Skill[];
  tricks: CompanionTrick[];
  trainerLevel: number;
  trainerCharisma: number;
}

/** Cria um parceiro a partir das seleções do wizard */
export function createCompanion(
  options: CreateCompanionOptions
): CompanionSheet {
  const typeDef = getCompanionTypeDefinition(options.type);

  const baseCompanion: CompanionSheet = {
    name: options.name,
    size: options.size,
    companionType: options.type,
    spiritEnergyType: options.spiritEnergyType,
    attributes: { ...BASE_ATTRIBUTES },
    skills: options.skills,
    naturalWeapons: [
      {
        damageType: options.weaponDamageType,
        damageDice: '1d8',
        criticalMultiplier: 2,
        threatMargin: 20 - (typeDef.extraThreatMargin || 0),
      },
    ],
    tricks: options.tricks,
    pv: 0,
    defesa: 0,
    displacement: 12,
  };

  return calculateCompanionStats(
    baseCompanion,
    options.trainerLevel,
    options.trainerCharisma
  );
}

/** Gera um parceiro aleatório */
export function generateRandomCompanion(
  trainerLevel: number,
  trainerCharisma: number
): CompanionSheet {
  // Tipo aleatório
  const types: CompanionType[] = [
    'Animal',
    'Construto',
    'Espírito',
    'Monstro',
    'Morto-Vivo',
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  // Tamanho aleatório
  const sizes: CompanionSize[] = ['Pequeno', 'Médio', 'Grande'];
  const size = sizes[Math.floor(Math.random() * sizes.length)];

  // Tipo de dano aleatório
  const damageTypes: NaturalWeaponDamageType[] = [
    'Corte',
    'Impacto',
    'Perfuração',
  ];
  const weaponDamageType =
    damageTypes[Math.floor(Math.random() * damageTypes.length)];

  // Energia espiritual aleatória (se Espírito)
  let spiritEnergyType: SpiritEnergyType | undefined;
  if (type === 'Espírito') {
    spiritEnergyType = Math.random() < 0.5 ? 'Positiva' : 'Negativa';
  }

  // 3 perícias aleatórias
  const availableSkills = [...COMPANION_AVAILABLE_SKILLS];
  const skills: Skill[] = [];
  for (let i = 0; i < 3; i += 1) {
    const idx = Math.floor(Math.random() * availableSkills.length);
    skills.push(availableSkills[idx]);
    availableSkills.splice(idx, 1);
  }

  // Truques: escolher de acordo com o nível
  const totalTricks = getTrickCount(trainerLevel);
  const tricks: CompanionTrick[] = [];

  // Contar armas naturais base para verificar pré-requisitos
  const typeDef = getCompanionTypeDefinition(type);
  let naturalWeaponCount = 1;
  if (typeDef.extraNaturalWeapon) naturalWeaponCount = 2;

  for (let i = 0; i < totalTricks; i += 1) {
    const isCreation = i < 2;
    const available = getAvailableTricks(
      trainerLevel,
      type,
      size,
      tricks,
      naturalWeaponCount,
      isCreation
    );

    if (available.length === 0) break;

    const trick = available[Math.floor(Math.random() * available.length)];
    tricks.push({ name: trick.name });

    // Atualizar contagem de armas naturais se ganhou nova
    if (trick.name === 'Arma Natural Adicional') {
      naturalWeaponCount += 1;
    }
  }

  return createCompanion({
    type,
    size,
    weaponDamageType,
    spiritEnergyType,
    skills,
    tricks,
    trainerLevel,
    trainerCharisma,
  });
}
