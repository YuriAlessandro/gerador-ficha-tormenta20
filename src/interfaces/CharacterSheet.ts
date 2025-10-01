import { ClassDescription, ClassPower } from './Class';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { RaceSize } from './Race';
import Bag from './Bag';
import { Spell, SpellSchool } from './Spells';
import { CharacterAttributes, CharacterReligion } from './Character';
import Skill, { CompleteSkill } from './Skills';
import { Atributo } from '../data/atributos';
import { BagEquipments } from './Equipment';

export type SheetChangeSource =
  | {
      type: 'power';
      name: string;
    }
  | {
      type: 'levelUp';
      level: number;
    }
  | { type: 'origin'; originName: string }
  | { type: 'race'; raceName: string }
  | {
      type: 'class';
      className: string;
    }
  | {
      type: 'divinity';
      divinityName: string;
    };

export type SheetAction = {
  source: SheetChangeSource;
  action: SheetActionStep;
};

export type SheetActionStep =
  | {
      type: 'ModifyAttribute';
      attribute: Atributo;
      value: number; // Positive or negative
    }
  | {
      type: 'learnSkill';
      availableSkills: Skill[]; // Maybe modify this to be more flexible or to pick from random
      pick: number; // Number of skills to learn
    }
  | {
      type: 'learnSpell';
      availableSpells: Spell[]; // List of available spells
      pick: number; // Number of spells to learn
      customAttribute?: Atributo; // Optional custom attribute for the spell
    }
  | {
      type: 'learnAnySpellFromHighestCircle';
      pick: number; // Number of spells to learn
      allowedType: 'Arcane' | 'Divine' | 'Both'; // Allowed types of spells
      schools?: SpellSchool[]; // Optional list of allowed schools
    }
  | {
      type: 'getGeneralPower';
      availablePowers: GeneralPower[]; // List of available powers
      pick: number; // Number of powers to learn
    }
  | {
      type: 'addProficiency';
      availableProficiencies: string[]; // List of available proficiencies
      pick: number; // Number of proficiencies to learn
    }
  | {
      type: 'addEquipment';
      equipment: Partial<BagEquipments>; // Partial equipment object to add
      description: string; // Optional description for the equipment
    }
  | {
      type: 'addSense';
      sense: string; // string representing the sense to add
    }
  | {
      type: 'increaseAttribute';
    }
  | {
      type: 'special';
      specialAction:
        | 'humanoVersatil'
        | 'lefouDeformidade'
        | 'osteonMemoriaPostuma';
    }
  | {
      type: 'selectWeaponSpecialization';
      availableWeapons?: string[]; // List of weapon names to choose from, or empty for all weapons
    }
  | {
      type: 'selectFamiliar';
      availableFamiliars?: string[]; // List of familiar names to choose from, or empty for all familiars
    }
  | {
      type: 'selectAnimalTotem';
      availableTotems?: string[]; // List of totem names to choose from, or empty for all totems
    }
  | {
      type: 'addTruqueMagicSpells';
    }
  | {
      type: 'addVozCivilizacaoSpell';
    }
  | {
      type: 'buildGolpePessoal';
    };

export type SheetActionReceipt =
  | {
      type: 'Attribute';
      attribute: Atributo;
      value: number; // Positive or negative
    }
  | {
      type: 'SkillsAdded';
      skills: Skill[];
    }
  | {
      type: 'SpellsLearned';
      spellNames: string[];
    }
  | {
      type: 'SenseAdded';
      sense: string;
    }
  | {
      type: 'PowerAdded';
      powerName: string;
    }
  | {
      type: 'ProficiencyAdded';
      proficiency: string;
    }
  | {
      type: 'EquipmentAdded';
      equipment: Partial<BagEquipments>;
    }
  | {
      type: 'AttributeIncreasedByAumentoDeAtributo';
      attribute: Atributo;
      plateau: number; // Plateau number for the increase
    };

export type SheetActionHistoryEntry = {
  source: SheetChangeSource;
  powerName?: string; // Name of the power that caused this action
  changes: SheetActionReceipt[];
};

export type StatModifierTarget =
  | {
      type: 'Skill';
      name: Skill;
    }
  | {
      type: 'PV';
    }
  | {
      type: 'PM';
    }
  | {
      type: 'Defense';
    }
  | {
      type: 'Displacement';
    }
  | {
      type: 'MaxSpaces';
    }
  | {
      type: 'ArmorPenalty';
    }
  | {
      type: 'PickSkill';
      skills: Skill[];
      pick: number; // Number of skills to pick
    }
  | {
      type: 'ModifySkillAttribute';
      skill: Skill;
      attribute: Atributo;
    }
  | {
      type: 'WeaponDamage';
      weaponName?: string; // Specific weapon name
      weaponTags?: string[]; // Weapon tags to match
      proficiencyRequired?: boolean; // Whether proficiency is required
    }
  | {
      type: 'WeaponAttack';
      weaponName?: string;
      weaponTags?: string[];
      proficiencyRequired?: boolean;
    }
  | {
      type: 'WeaponCritical';
      weaponName?: string;
      weaponTags?: string[];
      proficiencyRequired?: boolean;
    }
  | {
      type: 'HPAttributeReplacement';
      newAttribute: Atributo;
    };

export type StatModifier =
  | {
      type: 'Attribute';
      attribute: Atributo;
    }
  | {
      type: 'LevelCalc';
      formula: string;
    }
  | {
      type: 'TormentaPowersCalc';
      formula: string;
    }
  | {
      type: 'SpecialAttribute';
      attribute: 'spellKeyAttr';
    }
  | {
      type: 'Fixed';
      value: number;
    };

export type SheetBonus = {
  source: SheetChangeSource;
  target: StatModifierTarget;
  modifier: StatModifier;
};

// TODO: Once all type errors are fixed, change this into a proper class with constructor and stuff.
export default interface CharacterSheet {
  id: string;
  nome: string;
  sexo: string;
  nivel: number;
  atributos: CharacterAttributes;
  raca: Race;
  classe: ClassDescription;
  skills: Skill[];
  pv: number;
  pm: number;
  sheetBonuses: SheetBonus[];
  sheetActionHistory: SheetActionHistoryEntry[];
  defesa: number;
  bag: Bag;
  devoto?: CharacterReligion;
  origin:
    | {
        name: string;
        powers: OriginPower[];
      }
    | undefined;
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  maxSpaces: number;
  generalPowers: GeneralPower[];
  classPowers?: ClassPower[];
  steps: Step[];
  extraArmorPenalty?: number;
  completeSkills?: CompleteSkill[];
  sentidos?: string[];
  dinheiro?: number;
  isThreat?: boolean;
}

export interface Step {
  label: string;
  type?: string;
  value: SubStep[];
}

export interface SubStep {
  name?: string;
  value: number | string;
}
