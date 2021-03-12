import { Atributo } from '../data/atributos';
import Divindade from './Divindade';
import { GeneralPower } from './Poderes';

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
