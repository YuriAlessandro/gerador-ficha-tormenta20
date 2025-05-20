import { ClassDescription, ClassPower } from './Class';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { RaceSize } from './Race';
import Bag from './Bag';
import { Spell } from './Spells';
import { CharacterAttributes, CharacterReligion } from './Character';
import Skill, { CompleteSkill } from './Skills';
import { Atributo } from '../data/atributos';

export type StatModifier = {
  source: string;
} & ({
  type: 'Attribute';
  attribute: Atributo;
} | {
  type : 'Number';
  value: number;
})

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
  pvModifier: StatModifier[];
  pmModifier: StatModifier[];
  defesa: number;
  bag: Bag;
  devoto?: CharacterReligion;
  origin:
    | {
        name: string;
        powers: OriginPower[];
      }
    | undefined;
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  maxSpaces: number;
  generalPowers: GeneralPower[];
  classPowers?: ClassPower[];
  steps: Step[];
  extraArmorPenalty?: number;
  completeSkills?: CompleteSkill[];
  sentidos?: string[];
}

export interface Step {
  label: string;
  type?: string;
  value: SubStep[];
}

export interface SubStep {
  name?: string;
  value: number | string;
}
