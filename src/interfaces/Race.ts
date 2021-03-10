import { FaithProbability } from './Divindade';

export interface RaceHability {
  attr: string;
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
    attrs: RaceHability[];
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
  displacement?: number;
  size?: RaceSize;
}
