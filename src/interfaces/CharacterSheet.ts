import { ClassDescription } from './Class';
import Divindade from './Divindade';
import { GrantedPower } from './Poderes';
import Race from './Race';
import Equipment from './Equipment';

export interface RaceHability {
  attr: string;
  mod: number;
}

export interface CharacterAttribute {
  name: string;
  value: number;
  mod: number;
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
  equipamentos: Equipment[];
  devoto: {
    isDevoto: boolean;
    divindade: Divindade;
    poderes: (GrantedPower | undefined)[];
  };
}
