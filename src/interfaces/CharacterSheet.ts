import { ClassDescription } from './Class';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { RaceSize } from './Race';
import { Bag } from './Equipment';
import { Spell } from './Spells';
import { CharacterAttributes, CharacterReligion } from './Character';

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
    powers: (OriginPower | GeneralPower)[];
  };
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  maxWeight: number;
}
