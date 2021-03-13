import { ClassDescription } from './Class';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { RaceSize } from './Race';
import { Bag } from './Equipment';
import { Spell } from './Spells';
import { CharacterAttributes, CharacterReligion } from './Character';
import Skill from './Skills';

export default interface CharacterSheet {
  id: string;
  nome: string;
  sexo: string;
  nivel: number;
  atributos: CharacterAttributes;
  raca: Race;
  classe: ClassDescription;
  skills: Skill[];
  pv: number;
  pm: number;
  defesa: number;
  bag: Bag;
  devoto?: CharacterReligion;
  origin: {
    name: string;
    powers: OriginPower[];
  };
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  maxWeight: number;
  generalPowers: GeneralPower[];
  steps: Step[];
}

export interface Step {
  label: string;
  type?: string;
  value: { nome?: string; valor: number | string }[];
}
