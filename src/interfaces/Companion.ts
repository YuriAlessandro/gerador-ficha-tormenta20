import Skill from './Skills';
import { Spell } from './Spells';
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
  spells?: Spell[];

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

  /**
   * Snapshot of the auto-computed companion state (before manual overrides are
   * applied). Refreshed automatically by `calculateCompanionStats` on every
   * recalc, so it always reflects what the companion would be if all manual
   * overrides were cleared. Source of truth for "revert to original values".
   */
  originalAutoState?: CompanionAutoSnapshot;
  /**
   * Per-field manual overrides for derived stats. Applied on top of the
   * auto-calculated values in `calculateCompanionStats`. Cleared by the "revert"
   * button. Base inputs (companionType, size, tricks, etc.) are NOT overrides —
   * they're direct fields on the companion.
   */
  manualOverrides?: CompanionManualOverrides;
}

/** Campos do snapshot: tudo exceto metadados e session state. */
export type CompanionAutoSnapshot = Omit<
  CompanionSheet,
  | 'originalAutoState'
  | 'manualOverrides'
  | 'currentPV'
  | 'tempPV'
  | 'pvIncrement'
>;

/** Overrides manuais cobrem apenas valores derivados (não base inputs). */
export type CompanionManualOverrides = Partial<
  Pick<
    CompanionSheet,
    | 'attributes'
    | 'pv'
    | 'defesa'
    | 'displacement'
    | 'reducaoDeDano'
    | 'attackBonus'
    | 'damageBonus'
    | 'movementTypes'
    | 'senses'
    | 'immunities'
    | 'proficiencies'
    | 'naturalWeapons'
    | 'skills'
    | 'hasAnatomiaHumanoide'
  >
>;
