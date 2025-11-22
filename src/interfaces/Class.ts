import { Atributo } from '../data/systems/tormenta20/atributos';
import { SheetBonus, SheetAction } from './CharacterSheet';
import { DiceRoll } from './DiceRoll';
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

export type ClassAbility = {
  name: string;
  text: string;
  nivel: number;
  sheetActions?: SheetAction[];
  sheetBonuses?: SheetBonus[];
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
};

export type ClassPower = {
  name: string;
  text: string;
  requirements?: Requirement[][];
  sheetActions?: SheetAction[];
  sheetBonuses?: SheetBonus[];
  canRepeat?: boolean;
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
};

export interface SpellPath {
  initialSpells: number;
  spellType: 'Arcane' | 'Divine' | 'Both';
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
  qtdPoderesConcedidos?: string | number;
  faithProbability?: FaithProbability;
  attrPriority: Atributo[];
  spellPath?: SpellPath;
  setup?: (classe: ClassDescription) => ClassDescription;
  originalAbilities?: ClassAbility[]; // Internal field to preserve original abilities during level-ups
}
