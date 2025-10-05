import { Atributo } from '../data/systems/tormenta20/atributos';
import { CharacterAttributes, CharacterReligion } from './Character';
// eslint-disable-next-line
import CharacterSheet, { SheetAction, SheetBonus } from './CharacterSheet';
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

export type RaceAbility = {
  name: string;
  description: string;
  sheetActions?: SheetAction[];
  sheetBonuses?: SheetBonus[];
};

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
  | 'Suraggel (Sulfure)'
  | 'Bugbear'
  | 'Centauro'
  | 'Ceratops'
  | 'Elfo-do-Mar'
  | 'Fintroll'
  | 'Gnoll'
  | 'Harpia'
  | 'Hobgoblin'
  | 'Kaijin'
  | 'Kallyanach'
  | 'Kappa'
  | 'Kobolds'
  | 'Meio-Orc'
  | 'Minauro'
  | 'Ogro'
  | 'Orc'
  | 'Pteros'
  | 'Soterrado';

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
