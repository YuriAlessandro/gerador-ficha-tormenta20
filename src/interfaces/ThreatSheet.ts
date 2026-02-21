import { Atributo } from '../data/systems/tormenta20/atributos';

export enum ThreatType {
  ANIMAL = 'Animal',
  CONSTRUTO = 'Construto',
  ESPIRITO = 'Espírito',
  HUMANOIDE = 'Humanoide',
  MONSTRO = 'Monstro',
  MORTO_VIVO = 'Morto-vivo',
}

export enum ThreatSize {
  MINUSCULO = 'Minúsculo',
  PEQUENO = 'Pequeno',
  MEDIO = 'Médio',
  GRANDE = 'Grande',
  ENORME = 'Enorme',
  COLOSSAL = 'Colossal',
}

export enum ThreatRole {
  SOLO = 'Solo',
  LACAIO = 'Lacaio',
  ESPECIAL = 'Especial',
}

export enum ChallengeLevel {
  QUARTER = '1/4',
  THIRD = '1/3',
  HALF = '1/2',
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  ELEVEN = '11',
  TWELVE = '12',
  THIRTEEN = '13',
  FOURTEEN = '14',
  FIFTEEN = '15',
  SIXTEEN = '16',
  SEVENTEEN = '17',
  EIGHTEEN = '18',
  NINETEEN = '19',
  TWENTY = '20',
  S = 'S',
  S_PLUS = 'S+',
}

export enum TreasureLevel {
  NONE = 'Nenhum',
  STANDARD = 'Padrão',
  HALF = 'Metade',
  DOUBLE = 'Dobro',
}

export enum ChallengeTier {
  INICIANTE = 'Iniciante',
  VETERANO = 'Veterano',
  CAMPEAO = 'Campeão',
  LENDA = 'Lenda',
  L_PLUS = 'L+',
}

export type ThreatActionType =
  | 'Padrão'
  | 'Movimento'
  | 'Completa'
  | 'Livre'
  | 'Reação';

export interface ThreatAttack {
  id: string;
  name: string;
  attackBonus: number;
  damageDice: string; // Ex: "1d8", "2d6", "3d10"
  bonusDamage: number;
  averageDamage?: number; // Calculado automaticamente
  criticalThreshold?: number; // Margem de ameaça (padrão: 20)
  criticalMultiplier?: number; // Multiplicador de crítico (padrão: 2)
}

export interface AbilityRoll {
  id: string;
  name: string;
  dice: string; // Ex: "1d8", "2d6", "3d10"
  bonus: number;
}

export interface ThreatAbility {
  id: string;
  name: string;
  description: string;
  category?: string;
  rolls?: AbilityRoll[];
  pmCost?: number;
  actionType?: ThreatActionType;
}

// Magias usam a mesma estrutura que habilidades
export type ThreatSpell = ThreatAbility;

export interface ThreatAttributes {
  [Atributo.FORCA]: number | '-';
  [Atributo.DESTREZA]: number | '-';
  [Atributo.CONSTITUICAO]: number | '-';
  [Atributo.INTELIGENCIA]: number | '-';
  [Atributo.SABEDORIA]: number | '-';
  [Atributo.CARISMA]: number | '-';
}

export interface ThreatSkill {
  name: string;
  attribute: Atributo;
  trained: boolean;
  customBonus: number;
  total: number; // Calculado automaticamente
  overrideTotal?: number; // Sobrescrita manual (substitui total se definido)
}

export enum ResistanceType {
  STRONG = 'strong',
  MEDIUM = 'medium',
  WEAK = 'weak',
}

export interface ResistanceAssignments {
  Fortitude: ResistanceType;
  Reflexos: ResistanceType;
  Vontade: ResistanceType;
}

export const DEFAULT_RESISTANCE_ASSIGNMENTS: ResistanceAssignments = {
  Fortitude: ResistanceType.STRONG,
  Reflexos: ResistanceType.MEDIUM,
  Vontade: ResistanceType.WEAK,
};

export interface ThreatCombatStats {
  attackValue: number;
  averageDamage: number;
  defense: number;
  strongSave: number; // Resistência Forte (80%)
  mediumSave: number; // Resistência Média (50%)
  weakSave: number; // Resistência Fraca (20%)
  hitPoints: number;
  standardEffectDC: number;
  manaPoints?: number; // Opcional
}

export interface AbilityRecommendation {
  min: number;
  max: number;
  tier: ChallengeTier;
}

export interface ThreatSheet {
  id: string;
  name: string;
  type: ThreatType;
  size: ThreatSize;
  role: ThreatRole;
  challengeLevel: ChallengeLevel;
  displacement: string;

  // Estatísticas de combate (auto-calculadas)
  combatStats: ThreatCombatStats;
  hasManaPoints: boolean;

  // Ataques definidos pelo usuário
  attacks: ThreatAttack[];

  // Habilidades selecionadas
  abilities: ThreatAbility[];

  // Magias
  spells: ThreatSpell[];

  // Atributos e perícias
  attributes: ThreatAttributes;
  skills: ThreatSkill[];
  resistanceAssignments: ResistanceAssignments;

  // Qualidades especiais (visão, RD, imunidades, etc.)
  specialQualities: string;

  // Equipamentos e tesouro
  equipment: string;
  treasureLevel: TreasureLevel;

  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/** Ensures old threat data has resistanceAssignments populated. */
export function normalizeThreatSheet(threat: ThreatSheet): ThreatSheet {
  if (!threat.resistanceAssignments) {
    return { ...threat, resistanceAssignments: DEFAULT_RESISTANCE_ASSIGNMENTS };
  }
  return threat;
}

// Tipos auxiliares para o builder
export interface ThreatBuilderState {
  currentThreat: Partial<ThreatSheet>;
  currentStep: number;
  isGenerating: boolean;
  generatedThreats: ThreatSheet[];
  selectedThreatId: string | null;
}
