export interface RaceHability {
  attr: string;
  mod: number;
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
  setup?: (races: Race[]) => void;
}
