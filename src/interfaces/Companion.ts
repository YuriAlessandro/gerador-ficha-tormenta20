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
  defesa: number;
  displacement: number;
  movementTypes?: { voo?: number; escalada?: number; natacao?: number };
  senses?: string[];
  immunities?: string[];
  reducaoDeDano?: number;
  proficiencies?: string[];
  hasAnatomiaHumanoide?: boolean;
}
