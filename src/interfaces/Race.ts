import { Atributo } from '../data/atributos';
import { CharacterAttributes, CharacterReligion } from './Character';
// eslint-disable-next-line
import CharacterSheet from './CharacterSheet';
import { ClassDescription } from './Class';
import { FaithProbability } from './Divindade';
import Origin from './Origin';
import { OriginPower, GeneralPower } from './Poderes';
import Bag from './Bag';
import Skill from './Skills';
import { Spell } from './Spells';

export interface RaceAttributeAbility {
  attr: Atributo | 'any';
  mod: number;
}

export type raceSize =
  | 'MINUSCULO'
  | 'PEQUENO'
  | 'MEDIO'
  | 'GRANDE'
  | 'ENORME'
  | 'COLOSSAL';

interface SizeModifiers {
  stealth: number;
  maneuver: number;
}
export interface RaceSize {
  naturalRange: number;
  modifiers: SizeModifiers;
  name: string;
}

export interface CharacterStats {
  level: number;
  attributes: CharacterAttributes;
  classDescription: ClassDescription;
  pv: number;
  pm: number;
  defense: number;
  bag: Bag;
  devote?: CharacterReligion;
  origin: Origin;
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  skills: Skill[];
  powers: {
    general: GeneralPower[];
    origin: OriginPower[];
  };
}

export interface RaceAbility {
  name: string;
  description: string;
  action?: (
    sheet: CharacterSheet,
    subSteps: { name: string; value: string }[]
  ) => CharacterSheet;
}

export default interface Race {
  name: string;
  attributes: {
    attrs: RaceAttributeAbility[];
    texts: string[];
  };
  abilities?: RaceAbility[];
  oldRace?: Race;
  setup?: (race: Race, allRaces: Race[]) => Race;
  getSize?: (race: Race) => RaceSize;
  getDisplacement?: (race: Race) => number;
  faithProbability?: FaithProbability;
  size?: RaceSize;
}
