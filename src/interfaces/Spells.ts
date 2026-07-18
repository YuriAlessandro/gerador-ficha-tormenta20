import type { CustomEffect } from '../premium/interfaces/CustomEffect';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { DiceRoll } from './DiceRoll';

/**
 * Vínculo estruturado entre um aprimoramento e as rolagens de dano/cura da
 * magia. Permite que a UI aumente automaticamente as rolagens quando o
 * aprimoramento é ativado, ao invés de deixar o usuário ajustar na mão.
 *
 * Um aprimoramento pode conter vários vínculos (ex.: Flecha Ácida aumenta o
 * dano inicial E o dano por rodada), por isso `Aprimoramento.damageBonus` é um
 * array.
 */
export interface AprimoramentoDamageBonus {
  /**
   * Substring (normalizada — sem acento, case-insensitive) usada para casar
   * com o `DiceRoll.label` alvo. Omitido quando a magia tem uma única rolagem
   * (o vínculo resolve para ela automaticamente).
   */
  targetRollLabel?: string;
  /** Dado somado por ativação, ex.: "1d6", "2d6", "1d8+2". */
  dicePerActivation: string;
  /** Bônus fixo por ativação, para "aumenta o dano em 10" (sem dado). */
  flatPerActivation?: number;
}

export interface Aprimoramento {
  trick?: boolean;
  addPm: number;
  text: string;
  /**
   * Vínculo(s) com as rolagens de dano da magia. Quando presente, a UI aumenta
   * as rolagens automaticamente ao ativar o aprimoramento. Ausente em
   * aprimoramentos que não alteram dano (e coberto por fallback de texto para
   * conteúdo antigo/homebrew).
   */
  damageBonus?: AprimoramentoDamageBonus[];
}

export enum spellsCircles {
  c1 = '1º Circulo',
  c2 = '2º Circulo',
  c3 = '3º Circulo',
  c4 = '4º Circulo',
  c5 = '5º Circulo',
}

export type Spell = {
  nome: string;
  execucao: 'Padrão' | 'Movimento' | 'Completa' | 'Reação' | string;
  alcance: 'Pessoal' | 'Toque' | 'Curto' | 'Médio' | 'Longo' | string;
  alvo?: string;
  area?: string;
  duracao: 'Instantânea' | 'Cena' | string;
  description: string;
  resistencia?: string;
  spellCircle: spellsCircles;
  manaExpense?: number;
  manaReduction?: number;
  customKeyAttr?: Atributo;
  school: SpellSchool;
  aprimoramentos?: Aprimoramento[];
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
  memorized?: boolean; // Para Magos: magia memorizada para o dia
  alwaysPrepared?: boolean; // Para Magos: magia sempre preparada (não conta no limite)
  isCustom?: boolean; // Magia personalizada criada pelo usuário
  customEffects?: CustomEffect[]; // Efeitos ativos (ex.: magia homebrew com buff)
  /**
   * Set when this spell entry was injected by an equipment enchantment (e.g.
   * Conjuradora). The value is the equipment id, so `recalculateSheet` can
   * strip and re-inject these entries idempotently as gear changes.
   */
  equipmentSource?: string;
};

export type SpellSchool =
  | 'Abjur'
  | 'Adiv'
  | 'Conv'
  | 'Encan'
  | 'Evoc'
  | 'Ilusão'
  | 'Necro'
  | 'Trans';

export const allSpellSchools: SpellSchool[] = [
  'Abjur',
  'Adiv',
  'Conv',
  'Encan',
  'Evoc',
  'Ilusão',
  'Necro',
  'Trans',
];

export type SpellCircle = {
  [key in SpellSchool]: Spell[];
};
