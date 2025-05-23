import { ClassDescription, ClassPower } from './Class';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { RaceSize } from './Race';
import Bag from './Bag';
import { Spell } from './Spells';
import { CharacterAttributes, CharacterReligion } from './Character';
import Skill, { CompleteSkill } from './Skills';
import { Atributo } from '../data/atributos';

export type SheetChangeSource =
  | {
      type: 'power';
      name: string;
    }
  | {
      type: 'levelUp';
      level: number;
    };

export type SheetChangeAction =
  | {
      type: 'ModifyAttribute';
      attribute: Atributo;
      value: number; // Positive or negative
    }
  | {
      type: 'learnSkill';
      skill: Skill; // Maybe modify this to be more flexible or to pick from random
    }
  | {
      type: 'learnSpell';
      availableSpells: string[]; // List of available spells
      pick: number; // Number of spells to learn
    };

export type SheetChangeStep =
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
    };

export type SheetChangeHistoryEntry = {
  source: SheetChangeSource;
  changes: SheetChangeStep[];
};

export type StatModifierTarget =
  | {
      type: 'Skill';
      name: string;
    }
  | {
      type: 'PV';
    }
  | {
      type: 'PM';
    }
  | {
      type: 'Defense';
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
  sheetChangeHistory: SheetChangeHistoryEntry[];
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
