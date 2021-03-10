import { ClassDescription } from './Class';
import Divindade from './Divindade';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { RaceSize } from './Race';
import { Bag } from './Equipment';
import { Spell } from './Spells';
import { Atributo } from '../data/atributos';

export interface RaceHability {
  attr: string;
  mod: number;
}

export interface CharacterAttribute {
  name: Atributo;
  value: number;
  mod: number;
}

export type CharacterAttributes = {
  [key in Atributo]: CharacterAttribute;
};

export interface CharacterReligion {
  divindade: Divindade;
  poderes: GeneralPower[];
}
export default interface CharacterSheet {
  id: string;
  nome: string;
  sexo: string;
  nivel: number;
  atributos: CharacterAttributes;
  raca: Race;
  classe: ClassDescription;
  pericias: string[];
  pv: number;
  pm: number;
  defesa: number;
  bag: Bag;
  devoto?: CharacterReligion;
  origin: {
    name: string;
    skills: string[];
    powers: (OriginPower | GeneralPower)[];
  };
  spells: Spell[];
  displacement: number;
  size: RaceSize;
}
