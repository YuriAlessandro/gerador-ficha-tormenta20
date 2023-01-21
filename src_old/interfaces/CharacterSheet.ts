import { ClassDescription, ClassPower } from './Class';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { RaceSize } from './Race';
import Bag from './Bag';
import { Spell } from './Spells';
import { CharacterAttributes, CharacterReligion } from './Character';
import Skill, { CompleteSkill } from './Skills';

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
  origin:
    | {
        name: string;
        powers: OriginPower[];
      }
    | undefined;
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  maxWeight: number;
  generalPowers: GeneralPower[];
  classPowers?: ClassPower[];
  steps: Step[];
  extraArmorPenalty?: number;
  completeSkills?: CompleteSkill[];
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
