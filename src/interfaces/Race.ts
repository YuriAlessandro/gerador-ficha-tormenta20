import { Atributo } from '../data/atributos';
import { FaithProbability } from './Divindade';

export interface RaceAttributeHability {
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
export default interface Race {
  name: string;
  habilites: {
    attrs: RaceAttributeHability[];
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
  faithProbability?: FaithProbability;
  size?: RaceSize;
}
