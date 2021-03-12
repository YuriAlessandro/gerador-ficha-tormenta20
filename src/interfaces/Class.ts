import { Atributo } from '../data/atributos';
import { FaithProbability } from './Divindade';
import { SpellSchool } from './Spells';

export interface BasicExpertise {
  type: string;
  list: string[];
}

export interface RemainingExpertise {
  qtd: number;
  list: string[];
}

export interface ClassAbility {
  name: string;
  text: string;
  effect?: string | null;
  nivel: number;
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
  proeficiencias: string[];
  habilities: ClassAbility[];
  probDevoto: number;
  qtdPoderesConcedidos?: string;
  faithProbability?: FaithProbability;
  spellPath?: SpellPath;
  setup?: (classe: ClassDescription) => ClassDescription;
}
