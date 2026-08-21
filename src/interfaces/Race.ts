import type { CustomEffect } from '../premium/interfaces/CustomEffect';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { CharacterAttributes, CharacterReligion } from './Character';
// eslint-disable-next-line
import CharacterSheet, { SheetAction, SheetBonus } from './CharacterSheet';
import { ClassDescription } from './Class';
import { DiceRoll } from './DiceRoll';
import { FaithProbability } from './Divindade';
import Origin from './Origin';
import { OriginPower, GeneralPower } from './Poderes';
import Bag from './Bag';
import Skill from './Skills';
import { Spell } from './Spells';

export interface RaceAttributeAbility {
  attr: Atributo | 'any';
  mod: number;
}

export interface AttributeVariant {
  label: string;
  attrs: RaceAttributeAbility[];
  excludeFromAny?: Atributo[];
  /**
   * Marca a variante SINTÉTICA gerada por Raças Abertas (regra opcional de
   * Heróis de Arton, p. 281), na qual todo modificador racial vira um slot
   * `any`. Diferente das variantes declaradas em `Race.attributeVariants`, esta
   * não existe no catálogo — é derivada em tempo de criação, então quem lista
   * variantes para o jogador escolher precisa ignorá-la.
   */
  openRace?: boolean;
}

export type raceSize =
  | 'MINUSCULO'
  | 'PEQUENO'
  | 'MEDIO'
  | 'GRANDE'
  | 'ENORME'
  | 'COLOSSAL';

interface SizeModifiers {
  stealth: number;
  maneuver: number;
}
export interface RaceSize {
  naturalRange: number;
  modifiers: SizeModifiers;
  name: string;
}

export interface CharacterStats {
  level: number;
  attributes: CharacterAttributes;
  classDescription: ClassDescription;
  pv: number;
  pm: number;
  defense: number;
  bag: Bag;
  devote?: CharacterReligion;
  origin: Origin;
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  skills: Skill[];
  powers: {
    general: GeneralPower[];
    origin: OriginPower[];
  };
}

export type RaceAbility = {
  name: string;
  description: string;
  sheetActions?: SheetAction[];
  sheetBonuses?: SheetBonus[];
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
  customEffects?: CustomEffect[]; // Efeitos customizados pelo usuário
  // Nome definido pelo usuário. Quando presente, tem precedência sobre `name`
  // na exibição — a identidade continua sendo `name`.
  customName?: string;
  // Texto definido pelo usuário. Quando presente, substitui o texto do livro.
  customDescription?: string;
  // Satisfaz um requisito `PODER: <name>` como se o personagem tivesse esses poderes
  grantsPowerRequirements?: string[];
  // Ignora TODOS os pré-requisitos de poderes cujo nome inclua qualquer destes termos
  bypassPrereqForPowersNamed?: string[];
};

export interface RaceHeritage {
  name: string;
  attributes: RaceAttributeAbility[];
  abilities: RaceAbility[];
  displacement?: number;
}

export type RaceNames =
  | 'Humano'
  | 'Dahlan'
  | 'Anão'
  | 'Elfo'
  | 'Dahllan'
  | 'Osteon'
  | 'Goblin'
  | 'Lefou'
  | 'Kliren'
  | 'Minotauro'
  | 'Qareen'
  | 'Golem'
  | 'Hynne'
  | 'Medusa'
  | 'Sereia'
  | 'Sílfide'
  | 'Suraggel'
  | 'Trog'
  | 'Suraggel (Aggelus)'
  | 'Suraggel (Sulfure)'
  | 'Bugbear'
  | 'Centauro'
  | 'Ceratops'
  | 'Elfo-do-Mar'
  | 'Fintroll'
  | 'Gnoll'
  | 'Harpia'
  | 'Hobgoblin'
  | 'Kaijin'
  | 'Kallyanach'
  | 'Kappa'
  | 'Kobolds'
  | 'Mashin'
  | 'Meio-Orc'
  | 'Minauro'
  | 'Moreau'
  | 'Golem Desperto'
  | 'Nagah'
  | 'Nezumi'
  | 'Ogro'
  | 'Orc'
  | 'Pteros'
  | 'Soterrado'
  | 'Tabrachi'
  | 'Tengu'
  | 'Trog Anão'
  | 'Velocis'
  | 'Voracis'
  | 'Yidishan'
  // Heróis de Arton
  | 'Duende'
  | 'Eiradaan'
  | 'Galokk'
  | 'Meio-Elfo'
  | 'Sátiro';

export default interface Race {
  name: RaceNames;
  attributes: {
    attrs: RaceAttributeAbility[];
    excludeFromAny?: Atributo[];
  };
  abilities: RaceAbility[];
  oldRace?: Race;
  heritage?: string; // For races with heritages (like Moreau)
  heritages?: Record<string, RaceHeritage>; // All heritage options for encyclopedia display
  chassis?: string; // For Golem Desperto
  energySource?: string; // For Golem Desperto
  sizeCategory?: string; // For Golem Desperto and Duende
  nature?: string; // For Duende (animal/vegetal/mineral)
  presentPowers?: string[]; // For Duende (3 selected powers)
  tabuSkill?: Skill; // For Duende (skill with -5 penalty)
  duendeBonusAttributes?: Atributo[]; // For Duende: chosen Dons (transport for generation)
  attributeVariants?: AttributeVariant[];
  /**
   * Raças que este personagem TAMBÉM conta como para pré-requisitos de poderes
   * de raça (`RequirementType.RACA`). Cobre três casos:
   * - Raças Variantes (Ameaças de Arton): Soterrado → Osteon, Trog Anão → Trog
   * - "é considerado um X para efeitos relacionados a raça": Meio-Orc → Orc,
   *   Meio-Elfo → Elfo, Moreau → Humano
   * - Apelidos usados nos requisitos que diferem do nome do catálogo
   *   (ex.: "Suraggel" para as duas heranças, "Sereia/Tritão" para Sereia)
   *
   * É `string[]` e não `RaceNames[]` de propósito: os apelidos acima não são
   * nomes de raça do catálogo, e `Requirement.name` também é `string`.
   */
  countsAsRaces?: string[];
  setup?: (race: Race, allRaces: Race[]) => Race;
  getSize?: (race: Race) => RaceSize;
  getDisplacement?: (race: Race) => number;
  getAttributes?: (sex: 'Masculino' | 'Feminino') => RaceAttributeAbility[];
  faithProbability?: FaithProbability;
  size?: RaceSize;
  ignoreEncumbrance?: boolean;
  deprecated?: boolean;
}
