import { Atributo } from '../data/systems/tormenta20/atributos';
import { SheetBonus, SheetAction } from './CharacterSheet';
import { DiceRoll } from './DiceRoll';
import { FaithProbability } from './Divindade';
import { Requirement } from './Poderes';
import Skill from './Skills';
import { SpellSchool } from './Spells';
import { SupplementId } from '../types/supplement.types';

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
  | 'Druida'
  // Deuses de Arton
  | 'Frade'
  // Heróis de Arton
  | 'Treinador'
  // Heróis de Arton - Variantes
  | 'Alquimista'
  | 'Atleta'
  | 'Burguês'
  | 'Duelista'
  | 'Ermitão'
  | 'Inovador'
  | 'Machado de Pedra'
  | 'Magimarcialista'
  | 'Necromante'
  | 'Santo'
  | 'Seteiro'
  | 'Usurpador'
  | 'Vassalo'
  | 'Ventanista';
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
  dynamicText?: string; // Texto dinâmico que substitui o texto padrão (ex: Autoridade Eclesiástica)
  requirements?: Requirement[][];
  sheetActions?: SheetAction[];
  sheetBonuses?: SheetBonus[];
  canRepeat?: boolean;
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
  supplementId?: SupplementId; // Suplemento de origem do poder
  supplementName?: string; // Nome do suplemento de origem
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
  isVariant?: boolean;
  baseClassName?: ClassNames;
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

/**
 * Tipo para definir uma classe variante com herança.
 * Apenas `name`, `isVariant` e `baseClassName` são obrigatórios.
 * Todos os outros campos são opcionais — se omitidos, serão herdados da classe base.
 */
export type VariantClassOverrides = Pick<ClassDescription, 'name'> & {
  isVariant: true;
  baseClassName: ClassNames;
  excludedPowers?: string[]; // Nomes de poderes da classe base que não são herdados pela variante
  excludeAllBasePowers?: boolean; // Se true, não herda nenhum poder da classe base
} & Partial<Omit<ClassDescription, 'name' | 'isVariant' | 'baseClassName'>>;
