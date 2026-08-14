import type { CustomEffect } from '../premium/interfaces/CustomEffect';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { SheetBonus, SheetAction } from './CharacterSheet';
import { DiceRoll } from './DiceRoll';
import { FaithProbability } from './Divindade';
import { CountsAsTormentaPower, Requirement } from './Poderes';
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
  sourceClassName?: string; // Para multiclasse: qual classe originou esta habilidade
  sheetActions?: SheetAction[];
  sheetBonuses?: SheetBonus[];
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
  customEffects?: CustomEffect[]; // Efeitos customizados pelo usuário
  // Nome definido pelo usuário. Quando presente, tem precedência sobre `name`
  // na exibição — a identidade continua sendo `name`.
  customName?: string;
  // Texto definido pelo usuário. Quando presente, substitui o texto do livro.
  customDescription?: string;
};

export type ClassPower = CountsAsTormentaPower & {
  name: string;
  text: string;
  dynamicText?: string; // Texto dinâmico que substitui o texto padrão (ex: Autoridade Eclesiástica)
  requirements?: Requirement[][];
  sheetActions?: SheetAction[];
  sheetBonuses?: SheetBonus[];
  canRepeat?: boolean;
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
  customEffects?: CustomEffect[]; // Efeitos customizados pelo usuário
  // Nome definido pelo usuário. Quando presente, tem precedência sobre `name`
  // na exibição — a identidade continua sendo `name`.
  customName?: string;
  // Texto definido pelo usuário. Quando presente, substitui o texto do livro.
  customDescription?: string;
  supplementId?: SupplementId; // Suplemento de origem do poder
  supplementName?: string; // Nome do suplemento de origem
  className?: string; // Multiclasse: qual classe concedeu este poder
};

/**
 * Regras extras sobre o pool da tradição oposta — o habilitado por
 * `includeDivineSchools` / `includeArcaneSchools`.
 *
 * AUSENTE (`undefined`) = sem regra extra, que é o comportamento do Necromante
 * (`includeDivineSchools: ['Necro']` em todos os círculos) e do Teurgista
 * Místico (`applyTeurgistaMistico`). Só quem precisa de teto de círculo ou de
 * mínimo obrigatório declara este campo.
 */
export interface CrossTraditionRules {
  /** Teto de círculo da tradição oposta sem nenhum poder de classe. */
  maxCircle: number;
  /**
   * Poderes de classe/gerais que elevam o teto. O maior valor entre os poderes
   * que o personagem possui vence; nenhum poder possuído = `maxCircle`.
   */
  maxCircleByPower?: { powerName: string; maxCircle: number }[];
  /**
   * Quantas das magias INICIAIS têm que vir obrigatoriamente da tradição
   * oposta (Linhagem Abençoada: "você aprende uma magia divina de 1º círculo").
   */
  minInitialSpells?: number;
}

export interface SpellPath {
  initialSpells: number;
  spellType: 'Arcane' | 'Divine' | 'Both';
  schools?: SpellSchool[];
  // Escolha de escolas pelo jogador (estilo Bardo): `schools` fica indefinido
  // até a geração/wizard preencher com `count` escolas do pool `available`
  // (ausente = todas). Usado por classes homebrew, que não têm setup().
  schoolChoice?: { count: number; available?: SpellSchool[] };
  excludeSchools?: SpellSchool[];
  includeDivineSchools?: SpellSchool[];
  includeArcaneSchools?: SpellSchool[];
  crossTraditionLimit?: number;
  crossTraditionRules?: CrossTraditionRules;
  qtySpellsLearnAtLevel: (level: number) => number;
  spellCircleAvailableAtLevel: (level: number) => number;
  keyAttribute: Atributo;
  /**
   * Como o personagem obtém acesso às magias.
   *
   * ausente / 'known' — padrão: aprende magias, que ficam em `sheet.spells`.
   * 'allOfType' — Usurpar (Usurpador): lança QUALQUER magia do `spellType` nos
   *   círculos a que tem acesso, sem aprender nenhuma. A lista é DERIVADA no
   *   render por `getDerivedSpells` e NUNCA persistida em `sheet.spells` —
   *   mesmo contrato de `getDeitySpellCircleWarning`.
   *
   * ATENÇÃO: `spellPath` não sobrevive à serialização (carrega funções) e é
   * reconstruído em vários pontos. Ao mexer aqui, conferir todos eles:
   * `SerializedSpellPath`, `serializeSpellPath`/`applySerializedOverrides`
   * (multiclass.ts), `sheetPayloadOptimizer` (strip campo a campo),
   * `restoreSpellPath` (general.ts) e o rebuild inline do LevelUpWizardModal.
   */
  spellAccess?: 'known' | 'allOfType';
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
  setup?: (
    classe: ClassDescription,
    supplements?: SupplementId[]
  ) => ClassDescription;
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
