import { ClassDescription } from './Class';
import Divindade from './Divindade';
import { GrantedPower } from '../utils/poderes/types';

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
  id: string;
  nome: string;
  sexo: string;
  nivel: number;
  atributos: Record<string, any>[];
  raca: Race;
  classe: ClassDescription;
  pericias: string[];
  pv: number;
  pm: number;
  defesa: number;
  equipamentos: any[];
  devoto: {
    isDevoto: boolean;
    divindade: Divindade;
    poderes: (GrantedPower | undefined)[];
  };
}
