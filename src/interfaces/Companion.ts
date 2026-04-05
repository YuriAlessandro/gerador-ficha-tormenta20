import Skill from './Skills';
import { Atributo } from '../data/systems/tormenta20/atributos';

export type CompanionSize = 'Pequeno' | 'Médio' | 'Grande' | 'Enorme';
export type CompanionType =
  | 'Animal'
  | 'Construto'
  | 'Espírito'
  | 'Monstro'
  | 'Morto-Vivo';
export type NaturalWeaponDamageType = 'Corte' | 'Impacto' | 'Perfuração';
export type SpiritEnergyType = 'Positiva' | 'Negativa';

export interface CompanionNaturalWeapon {
  damageType: NaturalWeaponDamageType;
  damageDice: string;
  criticalMultiplier: number;
  threatMargin: number;
}

export interface CompanionTrick {
  name: string;
  choices?: Record<string, string>;
}

export interface CompanionSheet {
  name?: string;
  size: CompanionSize;
  companionType: CompanionType;
  spiritEnergyType?: SpiritEnergyType;

  attributes: Record<Atributo, number>;
  skills: Skill[];
  naturalWeapons: CompanionNaturalWeapon[];
  tricks: CompanionTrick[];

  pv: number;
  currentPV?: number;
  pvIncrement?: number;
  tempPV?: number;
  defesa: number;
  displacement: number;
  movementTypes?: { voo?: number; escalada?: number; natacao?: number };
  senses?: string[];
  immunities?: string[];
  reducaoDeDano?: number;
  proficiencies?: string[];
  hasAnatomiaHumanoide?: boolean;

  /** Flag set when Treinador chooses "Treino Intensivo" at level 5 */
  treinoIntensivo?: boolean;
  /** Precomputed attack bonus from Treinamento Marcial trick */
  attackBonus?: number;
  /** Precomputed damage bonus from Treinamento Marcial trick */
  damageBonus?: number;
}
