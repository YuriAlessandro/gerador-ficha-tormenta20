export interface RaceHability {
  attr: string;
  mod: number;
}

export interface CharacterAttribute {
  name: string;
  value: number;
  mod: number;
}

export interface Race {
  name: string;
  habilites: {
    attrs: RaceHability[];
    other: {
      type: string;
      allowed: string;
      mod?: number;
    }[];
    texts: string[];
  };
  oldRace?: Race;
}

export default interface CharacterSheet {
  nome: string;
  sexo: string;
  nivel: number;
  atributos: Record<string, any>[];
  raca: Race;
  classe: {
    name: string;
    pv: number;
    addpv: number;
    pm: number;
    addpm: number;
    periciasbasicas: {
      type: string;
      list: string[];
    }[];
    periciasrestantes: {
      qtd: number;
      list: string[];
    };
    proeficiencias: string[];
    habilities: {
      name: string;
      text: string;
      effect: string;
      nivel: number;
    }[];
    magics: string[];
  };
  pericias: string[];
  pv: number;
  pm: number;
  defesa: number;
  equipamentos: any[];
}
