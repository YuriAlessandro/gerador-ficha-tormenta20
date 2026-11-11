import type { EnhancementEffect } from '../functions/itemEnhancements/core';
import Equipment from './Equipment';
import type { SheetBonus } from './CharacterSheet';
import type { SpellModifier, SpellModifierChoiceSpec } from './SpellModifiers';

export enum LEVELS {
  S4 = 'S4',
  S3 = 'S3',
  S2 = 'S2',
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  F13 = 'F13',
  F14 = 'F14',
  F15 = 'F15',
  F16 = 'F16',
  F17 = 'F17',
  F18 = 'F18',
  F19 = 'F19',
  F20 = 'F20',
}

export enum MONEY_TYPE {
  TC = 'TC',
  TS = 'T$',
  TO = 'TO',
  RIQUEZA_MENOR = 'Riquezas menores',
  RIQUEZA_MEDIA = 'Riquezas médias',
  RIQUEZA_MAIOR = 'Riquezas maiores',
}

export enum ITEM_TYPE {
  DIVERSO = 'Diverso',
  ARMA_ARMADURA = 'Arma/Armadura',
  POCAO = 'Poção',
  SUPERIOR = 'Superior',
  MAGICO_MENOR = 'Item Mágico (menor)',
  MAGICO_MEDIO = 'Item Mágico (médio)',
  MAGICO_MAIOR = 'Item Mágico (maior)',
}

export interface MoneyReward {
  min: number;
  max: number;
  reward?: {
    dice: number;
    qty: number;
    money: MONEY_TYPE;
    mult: number;
    som?: number;
    applyRollBonus?: boolean;
  };
}

export interface ItemReward {
  min: number;
  max: number;
  reward?: {
    dice: number;
    qty: number;
    type: ITEM_TYPE;
    som?: number;
    mods?: number;
    applyRollBonus?: boolean;
  };
}

export type Money = {
  [key in LEVELS]: MoneyReward[];
};

export type Items = {
  [key in LEVELS]: ItemReward[];
};

export interface Rych {
  min: number;
  max: number;
  value: {
    qtd: number;
    dice: number;
    mult: number;
  };
  items: string[];
}

export interface ItemM {
  min: number;
  max: number;
  item: string;
  effect?: {
    qtd: number;
    dice: number;
  };
}

export interface ItemWeapons {
  min: number;
  max: number;
  item: Equipment;
}

export interface ItemE {
  min: number;
  max: number;
  enchantment: string;
  effect: string;
  double?: boolean;
  onlyShield?: boolean;
  /** Optional supplement ID for supplement-specific enchantments */
  supplementId?: string;
  /** Nome de exibição do suplemento de origem (carimbado pelo registry) */
  supplementName?: string;
  /**
   * Efeito numérico embutido no próprio dado. Presente em conteúdo não-core
   * (suplemento/homebrew), cujo nome nunca casaria no registro estático
   * `enchantmentEffects`. Ausente = resolve pelo registro estático.
   *
   * `effect` acima é a PROSA do encanto; este é a mecânica.
   */
  effectStats?: EnhancementEffect;
  /** Efeito nas magias (encantos de esotérico), como em `ItemMod`. */
  spellModifiers?: SpellModifier[];
  /** "Pré-requisito: outro encanto" (Implacável, Majestoso, Pulverizante). */
  requiresOtherEnchantment?: boolean;
  /** Encantos que não podem estar no mesmo item ("não pode ser nímbico"). */
  excludes?: string[];
}

export interface ItemMod {
  min: number;
  max: number;
  mod: string;
  description?: string;
  /**
   * Pré-requisito(s) para aplicar esta modificação.
   *
   * - `string`: requer exatamente essa modificação aplicada antes (AND único).
   * - `string[]`: requer **qualquer uma** das modificações listadas (OR).
   *   Quando o usuário escolhe a mod dependente sem ter um prereq, o helper
   *   `addModificationWithPrerequisites` adiciona automaticamente o primeiro
   *   item do array.
   */
  prerequisite?: string | string[];
  double?: boolean;
  /** What item types this modification applies to */
  appliesTo?: 'weapon' | 'armor' | 'shield' | 'esoteric' | 'all';
  /**
   * Efeito nas magias (melhorias de esotérico: Poderoso, Canalizador…). Vale
   * enquanto o item está em uso — esotérico, só empunhado — e o item com as
   * melhorias conta como UM esotérico.
   */
  spellModifiers?: SpellModifier[];
  /** A melhoria pede uma divindade (Canônico); ver `deity`. */
  choosesDeity?: boolean;
  /** Divindade escolhida no editor (vira `AppliedModification.deity`). */
  deity?: string;
  /** "Escolha uma magia" da melhoria (Harmonizado), gravada por item. */
  spellChoice?: SpellModifierChoiceSpec;
  /**
   * Bônus na ficha que só valem com o item em uso (Vigilante: +2 na Defesa
   * com o esotérico empunhado).
   */
  inUseSheetBonuses?: SheetBonus[];
  /** Optional supplement ID for supplement-specific modifications */
  supplementId?: string;
  /** Nome de exibição do suplemento de origem (carimbado pelo registry) */
  supplementName?: string;
  /**
   * Efeito numérico embutido no próprio dado (conteúdo não-core). Ausente =
   * resolve pelo registro estático `modificationEffects`.
   */
  effect?: EnhancementEffect;
}
