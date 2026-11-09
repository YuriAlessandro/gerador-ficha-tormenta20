import type { Atributo } from '../data/systems/tormenta20/atributos';
import type { SpellSchool } from './Spells';

/**
 * Modificadores de magia: o efeito que um PODER, HABILIDADE ou ITEM aplica às
 * magias do personagem ("suas magias de cura de luz custam –1 PM", "a CD das
 * suas magias arcanas aumenta em +1", "magias que dão bônus em ataque também
 * dão +1 na margem de ameaça").
 *
 * É declarado nos DADOS, no campo `spellModifiers` da entidade que concede o
 * efeito (ao lado de `sheetBonuses`), para que homebrew possa declarar o mesmo.
 * O motor em `functions/spells/modifiers` coleta, filtra por magia e resolve
 * tudo num perfil único consumido pelo lançamento, pela lista de magias, pelo
 * PDF, pelo Foundry e pelos efeitos ativos.
 */

/** Filtro de magias. Campos combinam em E; listas são OU. Vazio = todas. */
export interface SpellModifierFilter {
  /** Nomes exatos de magia ("Curar Ferimentos"). */
  spellNames?: string[];
  schools?: SpellSchool[];
  tradition?: 'arcane' | 'divine';
  /** Alcances exatos ("Pessoal"). */
  ranges?: string[];
  /** Círculos (1–5). */
  circles?: number[];
  /**
   * Só as magias que o jogador marcou para ESTA fonte (Foco em Magia: "escolha
   * uma magia"). Ver `SpellModifierChoiceSpec`.
   */
  chosen?: boolean;
  /** Só magias com rolagem de cura ("magias de cura"). */
  healing?: boolean;
  /** Só magias com rolagem de dano ("magias de dano"). */
  damaging?: boolean;
  /**
   * Só se o personagem tem esta classe (principal, variante ou multiclasse
   * conjuradora) — "magias de bardo".
   */
  casterClass?: string;
}

/** Tipos de bônus de efeito ativo que contam como "bônus em X". */
export type SpellEffectBonusKind = 'attack' | 'defense' | 'resistance';

export type SpellModifierEffect =
  /**
   * Redução de custo. Por regra (JdA, Reduções de Custo) reduções NÃO
   * acumulam — vale a maior —, exceto as que o texto declara cumulativas.
   */
  | { type: 'PmReduction'; value: number; cumulative?: boolean }
  /** Custo reduzido à metade, depois de todo o resto (Alta Arcana). */
  | { type: 'PmHalve' }
  /** Bônus nas rolagens de cura ou de dano da magia. */
  | {
      type: 'RollBonus';
      rolls: 'healing' | 'damage';
      perDie?: number;
      flat?: number;
    }
  /** Bônus na CD para resistir à magia. */
  | { type: 'SpellDC'; value: number }
  /**
   * PM extras para gastar em aprimoramentos (Bolsa de pó, Tomo de guerra).
   * Não cumulativos entre si (Magia Instintiva, Heróis de Arton): vale o maior.
   */
  | { type: 'AprimoramentoPm'; value: number }
  /** Rolagem extra somada ao lançamento (Costela de lich: +1d6 de trevas). */
  | { type: 'ExtraRoll'; label: string; dice: string; damageType?: string }
  /**
   * Efeito ativo da magia: cada bônus de `kind` aumenta em +`value` (Luva de
   * ferro: bônus na Defesa ou em resistências).
   */
  | { type: 'EffectBonusIncrease'; kind: SpellEffectBonusKind; value: number }
  /**
   * Efeito ativo da magia: cada bônus de `kind` ganha também +`value` na
   * margem de ameaça (Medalhão Afiado).
   */
  | { type: 'EffectThreatMargin'; kind: SpellEffectBonusKind; value: number }
  /**
   * Efeito ativo da magia: PV temporários iguais a `multiplier` × o bônus de
   * `kind` concedido (Égide da Fé, Bênção Fortalecedora).
   */
  | { type: 'EffectTempPV'; kind: SpellEffectBonusKind; multiplier: number };

export interface SpellModifier {
  filter?: SpellModifierFilter;
  effect: SpellModifierEffect;
}

/** Quantas magias a fonte deixa escolher. */
export type SpellChoiceCount =
  | { type: 'fixed'; value: number }
  /** Uma por vez que o poder foi escolhido (Foco em Magia). */
  | { type: 'picks' }
  /** Igual a um atributo, com mínimo (Aspecto da Primavera: Carisma, mín. 1). */
  | { type: 'attribute'; attribute: Atributo; min?: number };

/**
 * "Escolha N magias…": quantas e quais podem ser escolhidas. As escolhas
 * ficam em `CharacterSheet.spellModifierChoices[nome da fonte]` e valem para
 * os modificadores com `filter.chosen`.
 */
export interface SpellModifierChoiceSpec {
  count: SpellChoiceCount;
  eligible?: SpellModifierFilter;
}

/** Entidade de dados que pode declarar modificadores de magia. */
export interface HasSpellModifiers {
  spellModifiers?: SpellModifier[];
  spellChoice?: SpellModifierChoiceSpec;
}
