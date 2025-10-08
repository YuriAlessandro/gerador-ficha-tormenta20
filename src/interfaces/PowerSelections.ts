import { GeneralPower } from './Poderes';
import { Spell } from './Spells';

/**
 * Represents the different types of selections a user can make
 */
export interface SelectionOptions {
  skills?: string[];
  proficiencies?: string[];
  powers?: GeneralPower[];
  spells?: Spell[];
  attributes?: string[]; // Atributo names like 'Força', 'Destreza', etc.
  weapons?: string[]; // Weapon names for specialization
  familiars?: string[]; // Familiar names for selection
  animalTotems?: string[]; // Animal totem names for selection
  classAbilities?: Array<{ className: string; abilityName: string }>; // Class ability selections
}

/**
 * A single power's manual selections
 */
export interface PowerSelection {
  powerName: string;
  selections: SelectionOptions;
}

/**
 * Collection of all manual power selections
 * For repeatable powers, selections are combined into a single SelectionOptions
 * For non-repeatable powers, stores a single selection
 */
export interface ManualPowerSelections {
  [powerName: string]: SelectionOptions;
}

/**
 * Requirements for a power that needs manual selection
 */
export interface PowerSelectionRequirement {
  type:
    | 'learnSkill'
    | 'addProficiency'
    | 'getGeneralPower'
    | 'learnSpell'
    | 'learnAnySpellFromHighestCircle'
    | 'increaseAttribute'
    | 'selectWeaponSpecialization'
    | 'selectFamiliar'
    | 'selectAnimalTotem'
    | 'buildGolpePessoal'
    | 'learnClassAbility';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableOptions: any[];
  pick: number;
  label: string; // Human-readable label like "Selecione 2 perícias"
  // Additional metadata for special cases
  metadata?: {
    allowedType?: 'Arcane' | 'Divine' | 'Both';
    schools?: string[];
  };
}

/**
 * All selection requirements for a power
 */
export interface PowerSelectionRequirements {
  powerName: string;
  requirements: PowerSelectionRequirement[];
}
