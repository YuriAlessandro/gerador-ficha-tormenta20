import { Atributo } from '../data/systems/tormenta20/atributos';
import Divindade from './Divindade';
import { GeneralPower } from './Poderes';

export interface CharacterAttribute {
  name: Atributo;
  value: number; // O modificador do atributo diretamente (-5 a +10)
}

export type CharacterAttributes = {
  [key in Atributo]: CharacterAttribute;
};

export interface CharacterReligion {
  divindade: Divindade;
  poderes: GeneralPower[];
}
