import { Atributo } from '../data/atributos';
import CharacterSheet from './CharacterSheet';
import { FaithProbability } from './Divindade';
import { Requirement } from './Poderes';
import Skill from './Skills';
import { SpellSchool } from './Spells';

export type ClassNames =
  | 'Arcanista'
  | 'Bárbaro'
  | 'Bardo'
  | 'Caçador'
  | 'Cavaleiro'
  | 'Clérigo'
  | 'Guerreiro'
  | 'Inventor'
  | 'Ladino'
  | 'Lutador'
  | 'Nobre'
  | 'Paladino'
  | 'Bucaneiro'
  | 'Druida';
export interface BasicExpertise {
  type: string;
  list: Skill[];
}

export interface RemainingExpertise {
  qtd: number;
  list: Skill[];
}

export interface ClassAbility {
  name: string;
  text: string;
  nivel: number;
  action?: (
    sheet: CharacterSheet,
    subSteps: { name: string; value: string }[]
  ) => CharacterSheet;
}

export interface ClassPower {
  name: string;
  text: string;
  requirements?: Requirement[][];
  action?: (
    sheet: CharacterSheet,
    subSteps: { name: string; value: string }[]
  ) => CharacterSheet;
  canRepeat?: boolean;
}

export interface SpellPath {
  initialSpells: number;
  spellType: 'Arcane' | 'Divine';
  schools?: SpellSchool[];
  qtySpellsLearnAtLevel: (level: number) => number;
  spellCircleAvailableAtLevel: (level: number) => number;
  keyAttribute: Atributo;
}
export interface ClassDescription {
  name: string;
  subname?: string;
  pv: number;
  addpv: number;
  pm: number;
  addpm: number;
  periciasbasicas: BasicExpertise[];
  periciasrestantes: RemainingExpertise;
  proficiencias: string[];
  abilities: ClassAbility[];
  powers: ClassPower[];
  probDevoto: number;
  qtdPoderesConcedidos?: string;
  faithProbability?: FaithProbability;
  attrPriority: Atributo[];
  spellPath?: SpellPath;
  setup?: (classe: ClassDescription) => ClassDescription;
}
