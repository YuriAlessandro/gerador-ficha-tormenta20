import { ClassDescription } from './Class';
import Divindade from './Divindade';
import { GeneralPower, OriginPower } from './Poderes';
import Race from './Race';
import Equipment, { Bag } from './Equipment';

export interface RaceHability {
  attr: string;
  mod: number;
}

export interface CharacterAttribute {
  name: string;
  value: number;
  mod: number;
}

export interface CharacterReligion {
  divindade: Divindade;
  poderes: GeneralPower[];
}

export default interface CharacterSheet {
  id: string;
  nome: string;
  sexo: string;
  nivel: number;
  atributos: CharacterAttribute[];
  raca: Race;
  classe: ClassDescription;
  pericias: string[];
  pv: number;
  pm: number;
  defesa: number;
  equipamentos: Bag;
  devoto?: CharacterReligion;
  origin: {
    name: string;
    skills: string[];
    powers: (OriginPower | GeneralPower)[];
  };
  armorPenalty: number;
}
