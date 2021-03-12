import { Atributo } from '../data/atributos';
import { CharacterAttributes, CharacterReligion } from './Character';
import { ClassDescription } from './Class';
import { FaithProbability } from './Divindade';
import { Bag } from './Equipment';
import { OriginPower, GeneralPower } from './Poderes';
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
  nivel: number;
  atributos: CharacterAttributes;
  classe: ClassDescription;
  pericias: string[];
  pv: number;
  pm: number;
  defesa: number;
  bag: Bag;
  devoto?: CharacterReligion;
  origin: {
    name: string;
    powers: (OriginPower | GeneralPower)[];
  };
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  maxWeight: number;
}

export interface RaceAbility {}

export default interface Race {
  name: string;
  habilites: {
    attrs: RaceAttributeAbility[];
    other: {
      type: string;
      allowed?: string;
      mod?: number;
    }[];
    texts: string[];
  };
  oldRace?: Race;
  setup?: (race: Race, allRaces: Race[]) => Race;
  getSize?: (race: Race) => RaceSize;
  getDisplacement?: (race: Race) => number;
  getHabilities: (
    race: Race,
    sheet: CharacterStats
  ) => { stats: CharacterStats; habilities: RaceAbility };
  faithProbability?: FaithProbability;
  size?: RaceSize;
}
