import { Atributo } from '../data/atributos';
import { CharacterAttributes, CharacterReligion } from './Character';
// eslint-disable-next-line
import CharacterSheet, { SubStep } from './CharacterSheet';
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
  action?: (sheet: CharacterSheet, subSteps: SubStep[]) => CharacterSheet;
}

export type RaceNames =
  | 'Humano'
  | 'Dahlan'
  | 'Anão'
  | 'Elfo'
  | 'Dahllan'
  | 'Osteon'
  | 'Goblin'
  | 'Lefou'
  | 'Kliren'
  | 'Minotauro'
  | 'Qareen'
  | 'Golem'
  | 'Hynne'
  | 'Medusa'
  | 'Sereia'
  | 'Sílfide'
  | 'Suraggel'
  | 'Trog'
  | 'Suraggel (Aggelus)'
  | 'Suraggel (Sulfure)';

export default interface Race {
  name: RaceNames;
  attributes: {
    attrs: RaceAttributeAbility[];
  };
  abilities: RaceAbility[];
  oldRace?: Race;
  setup?: (race: Race, allRaces: Race[]) => Race;
  getSize?: (race: Race) => RaceSize;
  getDisplacement?: (race: Race) => number;
  faithProbability?: FaithProbability;
  size?: RaceSize;
}
