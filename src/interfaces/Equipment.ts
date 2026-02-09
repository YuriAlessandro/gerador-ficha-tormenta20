import { SheetBonus } from './CharacterSheet';
import { DiceRoll } from './DiceRoll';
import Skill from './Skills';

export type equipGroup =
  | 'Arma'
  | 'Armadura'
  | 'Escudo'
  | 'Item Geral'
  | 'Alquimía'
  | 'Esotérico'
  | 'Vestuário'
  | 'Hospedagem'
  | 'Alimentação'
  | 'Animal'
  | 'Veículo'
  | 'Serviço';

/**
 * Equipment bonus condition - determines when a bonus applies
 */
export interface EquipmentBonusCondition {
  type: 'hasClassAbility' | 'isClass';
  value: string; // e.g., 'Caminho do Arcanista' or 'Bardo'
}

/**
 * Equipment with selectable bonus - used when the item's bonus
 * depends on a choice made when acquiring it
 */
export interface EquipmentSelectableBonus {
  availableSkills: Skill[]; // Skills to choose from
  bonusValue: number; // Bonus value (+1, +2, etc.)
  pick: number; // Number of skills to select (usually 1)
}

export default interface Equipment {
  id?: string; // UUID for unique identification (used for custom items)
  nome: string;
  dano?: string;
  critico?: string;
  spaces?: number;
  tipo?: string;
  alcance?: string;
  group: equipGroup;
  atkBonus?: number;
  weaponTags?: string[];
  preco?: number;

  // Base values for weapons (original stats before any modifications)
  baseDano?: string;
  baseAtkBonus?: number;
  baseCritico?: string;

  // Flag to indicate if this weapon has manual user edits
  // When true, recalculateSheet will preserve user edits instead of resetting
  hasManualEdits?: boolean;

  // Equipment bonuses (automatic bonuses to skills, stats, etc.)
  sheetBonuses?: SheetBonus[];

  // Conditional bonuses (only apply if condition is met)
  conditionalBonuses?: {
    condition: EquipmentBonusCondition;
    bonuses: SheetBonus[];
  }[];

  // Selectable bonus (e.g., Coleção de Livros - choose which skill gets +1)
  selectableBonus?: EquipmentSelectableBonus;
  // The selected skill (filled in when item is added to inventory)
  selectedBonusSkill?: Skill;

  // Custom dice rolls (e.g., Água Benta damage roll)
  rolls?: DiceRoll[];

  // Flag to identify user-created custom items
  isCustom?: boolean;

  // Can be used as weapon (e.g., Tocha)
  canBeUsedAsWeapon?: boolean;
  weaponStats?: {
    dano: string;
    critico: string;
    tipo: string;
  };

  // Supplement information (for items from supplements)
  supplementId?: string;
  supplementName?: string;
}

export type defenseEquipGroup = 'Armadura' | 'Escudo';

export interface DefenseEquipment extends Equipment {
  defenseBonus: number;
  armorPenalty: number;
  group: defenseEquipGroup;
  // Base values for defense equipment (original stats before modifications)
  baseDefenseBonus?: number;
  baseArmorPenalty?: number;
  // Flag to indicate if this is a heavy armor (affects defense calculation)
  isHeavyArmor?: boolean;
}

interface Modification {
  name: string;
  description: string;
}

export interface SuperiorEquipment extends Equipment {
  modifications: Modification[];
}

export interface CombatItems {
  armasSimples: Equipment[];
  armasMarciais: Equipment[];
  armadurasLeves: DefenseEquipment[];
  armaduraPesada: DefenseEquipment[];
  escudos: DefenseEquipment[];
  armasExoticas: Equipment[];
  armasDeFogo: Equipment[];
}

export interface BagEquipments {
  Arma: Equipment[];
  Armadura: DefenseEquipment[];
  Escudo: DefenseEquipment[];
  'Item Geral': Equipment[];
  Alquimía: Equipment[];
  Esotérico: Equipment[];
  Vestuário: Equipment[];
  Hospedagem: Equipment[];
  Alimentação: Equipment[];
  Animal: Equipment[];
  Veículo: Equipment[];
  Serviço: Equipment[];
}
