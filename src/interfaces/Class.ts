import { Atributo } from '../data/atributos';
import CharacterSheet from './CharacterSheet';
import { FaithProbability } from './Divindade';
import { Requirement } from './Poderes';
import Skill from './Skills';
import { SpellSchool } from './Spells';

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
  requirements?: Requirement[][];
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
  probDevoto: number;
  qtdPoderesConcedidos?: string;
  faithProbability?: FaithProbability;
  attrPriority: Atributo[];
  spellPath?: SpellPath;
  setup?: (classe: ClassDescription) => ClassDescription;
}
