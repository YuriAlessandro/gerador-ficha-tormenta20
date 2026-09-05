import Equipment, {
  DamageType,
  DefenseEquipment,
  ExtraDamage,
  WeaponAction,
} from '../../interfaces/Equipment';
import {
  DamageType as RDDamageType,
  SheetBonus,
} from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

/**
 * Effect of a single item enhancement (modification or enchantment).
 *
 * Numeric deltas (atkBonus, danoDelta, etc.) are applied additively to the item's
 * base stats. Skill bonuses and standalone Defense bonuses are converted into
 * SheetBonus entries on the equipment.
 *
 * Stacking: when two enhancements target the same stat, deltas sum. This is how
 * mods like Certeira (+1 atk) and Pungente (+2 atk) combine to +3, and how a
 * mod and an enchantment on the same item add together (e.g. Certeira + Formidável
 * → +1 + 2 = +3 atk).
 */
export interface EnhancementEffect {
  weaponStats?: {
    atkBonus?: number;
    danoDelta?: number;
    /**
     * Step up the damage die size by N steps (Adamante). Progression:
     * 1d3 → 1d4 → 1d6 → 1d8 → 1d10 → 2d6 → 2d8 → 2d10. Applied to the base
     * die before `danoDelta` adjusts the flat suffix.
     */
    danoStepUp?: number;
    criticoMultDelta?: number;
    criticoThreatDelta?: number;
  };
  defenseStats?: {
    defenseBonusDelta?: number;
    armorPenaltyDelta?: number;
  };
  spacesDelta?: number;
  skillBonuses?: { skill: Skill; value: number }[];
  /**
   * Standalone Defense bonus emitted as a SheetBonus targeting `Defense`. Used
   * by weapon mods/enchantments that grant Defense to the wielder (Guarda, Defensora).
   */
  defenseBonus?: number;
  /**
   * Damage Reduction bonuses emitted as SheetBonus entries with target
   * `DamageReduction`. Used by special materials like Adamante (RD geral)
   * and Gelo Eterno (RD fogo).
   */
  damageReduction?: { damageType: RDDamageType; value: number }[];
  /**
   * Extra damage lines added to a weapon. Each entry rolls separately on hit
   * and does not crit.
   */
  extraDamage?: { dice: string; damageType: DamageType }[];
  /**
   * Doubles the critical threat margin (Ameaçadora). Applied AFTER any flat
   * `criticoThreatDelta`, matching the T20 RAW reading that Ameaçadora widens
   * the final margin. Multiple instances of the flag still double only once
   * (idempotent).
   */
  criticoThreatDoubleMargin?: boolean;
  /**
   * Special actions appended to the weapon's `specialActions` list (e.g.
   * Arremesso enchantment grants melee + throw modes to a weapon that didn't
   * have them). IDs should be prefixed (e.g. `'ench-arremesso-throw'`) so that
   * the pipeline can distinguish base actions from derived ones during
   * regeneration.
   */
  specialActions?: WeaponAction[];
  /**
   * Sets `equipment.arremesso = true` (e.g. for the Arremesso enchantment). The
   * pipeline tracks original value via `baseArremesso` so removing the
   * enchantment restores the previous state.
   */
  setArremesso?: boolean;
}

/**
 * Effect that may vary with the size of the defense item it is applied to.
 *
 * Core materials express this with a function (`materialEffects`), which is not
 * serializable. Content that travels as DATA (supplements, homebrew) uses this
 * two-branch shape instead — `light` covers light armor and shields, `heavy`
 * covers heavy armor.
 */
export type ScaledEnhancementEffect =
  | EnhancementEffect
  | { light: EnhancementEffect; heavy: EnhancementEffect };

/** True when the scaled effect actually branches on armor weight. */
function isBranchedEffect(
  effect: ScaledEnhancementEffect
): effect is { light: EnhancementEffect; heavy: EnhancementEffect } {
  return 'light' in effect && 'heavy' in effect;
}

/**
 * Picks the branch of a `ScaledEnhancementEffect` matching the item. Heavy
 * armor takes the `heavy` branch; light armor and shields take `light`.
 */
export function resolveScaledEffect(
  effect: ScaledEnhancementEffect,
  item?: DefenseEquipment
): EnhancementEffect {
  if (!isBranchedEffect(effect)) return effect;
  return item?.isHeavyArmor ? effect.heavy : effect.light;
}

/**
 * An effect being aggregated alongside the source name (mod/enchantment name)
 * so origin can be propagated to derived `ExtraDamage` entries.
 */
export interface SourcedEffect {
  effect: EnhancementEffect | undefined;
  source: 'modification' | 'enchantment';
  sourceName: string;
}

export interface AggregatedDelta {
  atkBonusDelta: number;
  danoDelta: number;
  danoStepUpDelta: number;
  criticoMultDelta: number;
  criticoThreatDelta: number;
  defenseBonusDelta: number;
  armorPenaltyDelta: number;
  spacesDelta: number;
  skillBonuses: { skill: Skill; value: number }[];
  defenseBonusFromSheetBonus: number;
  damageReductionBonuses: { damageType: RDDamageType; value: number }[];
  /**
   * Derived extra damage entries with origin info already attached, ready to
   * be merged with the user-managed extra damage entries on the equipment.
   */
  derivedExtraDamage: ExtraDamage[];
  /** Whether any aggregated effect requested doubling the critical margin. */
  criticoThreatDoubleMargin: boolean;
  /** Special actions contributed by mods/ench, replacing prior derived ones. */
  derivedSpecialActions: WeaponAction[];
  /** Tri-state: undefined (no opinion), true (force on), false (force off). */
  setArremesso?: boolean;
}

export function emptyDelta(): AggregatedDelta {
  return {
    atkBonusDelta: 0,
    danoDelta: 0,
    danoStepUpDelta: 0,
    criticoMultDelta: 0,
    criticoThreatDelta: 0,
    defenseBonusDelta: 0,
    armorPenaltyDelta: 0,
    spacesDelta: 0,
    skillBonuses: [],
    defenseBonusFromSheetBonus: 0,
    damageReductionBonuses: [],
    derivedExtraDamage: [],
    criticoThreatDoubleMargin: false,
    derivedSpecialActions: [],
  };
}

export function aggregateEffects(entries: SourcedEffect[]): AggregatedDelta {
  const acc = emptyDelta();
  entries.forEach(({ effect, source, sourceName }) => {
    if (!effect) return;
    if (effect.weaponStats) {
      acc.atkBonusDelta += effect.weaponStats.atkBonus ?? 0;
      acc.danoDelta += effect.weaponStats.danoDelta ?? 0;
      acc.danoStepUpDelta += effect.weaponStats.danoStepUp ?? 0;
      acc.criticoMultDelta += effect.weaponStats.criticoMultDelta ?? 0;
      acc.criticoThreatDelta += effect.weaponStats.criticoThreatDelta ?? 0;
    }
    if (effect.defenseStats) {
      acc.defenseBonusDelta += effect.defenseStats.defenseBonusDelta ?? 0;
      acc.armorPenaltyDelta += effect.defenseStats.armorPenaltyDelta ?? 0;
    }
    acc.spacesDelta += effect.spacesDelta ?? 0;
    if (effect.skillBonuses) acc.skillBonuses.push(...effect.skillBonuses);
    acc.defenseBonusFromSheetBonus += effect.defenseBonus ?? 0;
    if (effect.damageReduction) {
      acc.damageReductionBonuses.push(...effect.damageReduction);
    }
    if (effect.extraDamage) {
      effect.extraDamage.forEach((ed) => {
        acc.derivedExtraDamage.push({
          dice: ed.dice,
          damageType: ed.damageType,
          source,
          sourceName,
        });
      });
    }
    if (effect.criticoThreatDoubleMargin) {
      acc.criticoThreatDoubleMargin = true;
    }
    if (effect.specialActions) {
      acc.derivedSpecialActions.push(...effect.specialActions);
    }
    if (effect.setArremesso !== undefined) {
      acc.setArremesso = effect.setArremesso;
    }
  });
  return acc;
}

export function sumDeltas(...deltas: AggregatedDelta[]): AggregatedDelta {
  return deltas.reduce<AggregatedDelta>((acc, d) => {
    acc.atkBonusDelta += d.atkBonusDelta;
    acc.danoDelta += d.danoDelta;
    acc.danoStepUpDelta += d.danoStepUpDelta;
    acc.criticoMultDelta += d.criticoMultDelta;
    acc.criticoThreatDelta += d.criticoThreatDelta;
    acc.defenseBonusDelta += d.defenseBonusDelta;
    acc.armorPenaltyDelta += d.armorPenaltyDelta;
    acc.spacesDelta += d.spacesDelta;
    acc.skillBonuses.push(...d.skillBonuses);
    acc.defenseBonusFromSheetBonus += d.defenseBonusFromSheetBonus;
    acc.damageReductionBonuses.push(...d.damageReductionBonuses);
    acc.derivedExtraDamage.push(...d.derivedExtraDamage);
    if (d.criticoThreatDoubleMargin) acc.criticoThreatDoubleMargin = true;
    acc.derivedSpecialActions.push(...d.derivedSpecialActions);
    if (d.setArremesso !== undefined) acc.setArremesso = d.setArremesso;
    return acc;
  }, emptyDelta());
}

/**
 * Tormenta 20 damage die progression. Stepping up moves one entry to the right;
 * stepping down moves left. Bounded at both ends.
 */
const DAMAGE_DICE_PROGRESSION = [
  '1d3',
  '1d4',
  '1d6',
  '1d8',
  '1d10',
  '2d6',
  '2d8',
  '2d10',
];

function stepUpSinglePart(part: string, steps: number): string {
  const match = part.trim().match(/^(\d+d\d+)([+-]\d+)?$/);
  if (!match) return part;
  const base = match[1];
  const suffix = match[2] ?? '';
  const idx = DAMAGE_DICE_PROGRESSION.indexOf(base);
  if (idx === -1) return part;
  const newIdx = Math.min(
    DAMAGE_DICE_PROGRESSION.length - 1,
    Math.max(0, idx + steps)
  );
  return DAMAGE_DICE_PROGRESSION[newIdx] + suffix;
}

/**
 * Steps the damage die size up (positive `steps`) or down (negative) according
 * to the T20 progression. Preserves any `+N` / `-N` flat suffix. Dual-mode
 * damage ("1d8/1d10", versatile weapons) has every side stepped.
 *   stepUpDamageDice('1d6', 1)        => '1d8'
 *   stepUpDamageDice('1d8+1', 2)      => '2d6+1'
 *   stepUpDamageDice('1d8/1d10', 1)   => '1d10/2d6'
 *   stepUpDamageDice('xpto', 1)       => 'xpto'   (untouched if not in progression)
 */
export function stepUpDamageDice(dano: string, steps: number): string {
  if (!dano || steps === 0) return dano;
  return dano
    .split('/')
    .map((part) => stepUpSinglePart(part, steps))
    .join('/');
}

/**
 * Adjusts the bonus appended to a damage dice expression.
 * Examples:
 *   adjustDanoBonus('1d6', +1)    => '1d6+1'
 *   adjustDanoBonus('1d6+1', +2)  => '1d6+3'
 *   adjustDanoBonus('1d8-1', +1)  => '1d8'
 *   adjustDanoBonus('1d8+2', -2)  => '1d8'
 */
export function adjustDanoBonus(dano: string, delta: number): string {
  if (!dano) return dano;
  const trimmed = dano.trim();
  const match = trimmed.match(/^(.*?)([+-]\d+)?$/);
  if (!match) return trimmed;
  const base = match[1];
  const existing = match[2] ? parseInt(match[2], 10) : 0;
  const total = existing + delta;
  if (total === 0) return base;
  if (total > 0) return `${base}+${total}`;
  return `${base}${total}`;
}

interface ParsedCritico {
  threat: number;
  mult: number;
}

/**
 * Formatos aceitos (os mesmos de `parseCritical` em `diceRoller`):
 *   "19/x3" → margem 19, multiplicador 3
 *   "x3"    → margem 20, multiplicador 3
 *   "19"    → margem 19, multiplicador 2  (o `x` é obrigatório para multiplicador)
 * Retorna `null` para strings sem crítico ("-", "**", vazio) ou não
 * reconhecidas, para que os ajustes devolvam a string original intacta.
 */
function parseCritico(c: string): ParsedCritico | null {
  const trimmed = (c || '').trim().toLowerCase();

  const fullMatch = trimmed.match(/^(\d+)\/x(\d+)$/);
  if (fullMatch) {
    return {
      threat: parseInt(fullMatch[1], 10),
      mult: parseInt(fullMatch[2], 10),
    };
  }

  const multMatch = trimmed.match(/^x(\d+)$/);
  if (multMatch) return { threat: 20, mult: parseInt(multMatch[1], 10) };

  // Só a margem: "19" é 19/x2, NUNCA multiplicador x19.
  const threatMatch = trimmed.match(/^(\d+)$/);
  if (threatMatch) return { threat: parseInt(threatMatch[1], 10), mult: 2 };

  return null;
}

function formatCritico({ threat, mult }: ParsedCritico): string {
  if (threat >= 20) return `x${mult}`;
  return `${threat}/x${mult}`;
}

export function adjustCriticoMult(c: string, delta: number): string {
  const parsed = parseCritico(c);
  if (!parsed) return c;
  return formatCritico({
    ...parsed,
    mult: Math.max(2, parsed.mult + delta),
  });
}

/**
 * Widens (delta > 0) or narrows (delta < 0) the critical threat range.
 * Positive delta lowers the threat threshold (broadening the range).
 */
export function adjustCriticoThreat(c: string, delta: number): string {
  const parsed = parseCritico(c);
  if (!parsed) return c;
  return formatCritico({
    ...parsed,
    threat: Math.min(20, parsed.threat - delta),
  });
}

/**
 * Doubles the threat margin (e.g. Ameaçadora). Margin = 21 - threshold; new
 * threshold = 21 - 2*margin. Examples: x2 (margin 1) → 19/x2; 19/x2 (margin
 * 2) → 17/x2; 18/x2 (margin 3) → 15/x2.
 */
export function doubleCriticoThreatMargin(c: string): string {
  const parsed = parseCritico(c);
  if (!parsed) return c;
  const margin = 21 - parsed.threat;
  const newThreat = Math.max(2, 21 - margin * 2);
  return formatCritico({ ...parsed, threat: newThreat });
}

export function isDefenseEquipment(item: Equipment): item is DefenseEquipment {
  return item.group === 'Armadura' || item.group === 'Escudo';
}

/**
 * Captures pristine stat values into the `base*` fields the first time the item
 * is processed. Subsequent calls are idempotent — base values stay frozen.
 */
export function captureBaseValues<T extends Equipment>(item: T): T {
  const result = { ...item } as T;
  if (item.dano !== undefined && result.baseDano === undefined) {
    result.baseDano = item.dano;
  }
  // Captura sempre (default 0 quando ausente): uma arma sem `atkBonus` explícito
  // tem bônus de ataque base 0. Capturar 0 evita que um valor *baked* por
  // bônus downstream (ex.: efeitos ativos, aplicados após a reaplicação de
  // aprimoramentos) seja erroneamente capturado como base num recálculo
  // posterior — o que comporia o bônus a cada recálculo.
  if (result.baseAtkBonus === undefined) {
    result.baseAtkBonus = item.atkBonus ?? 0;
  }
  if (item.critico !== undefined && result.baseCritico === undefined) {
    result.baseCritico = item.critico;
  }
  if (item.spaces !== undefined && result.baseSpaces === undefined) {
    result.baseSpaces = item.spaces;
  }
  if (result.baseSheetBonuses === undefined) {
    result.baseSheetBonuses = item.sheetBonuses ?? [];
  }
  if (result.baseArremesso === undefined) {
    result.baseArremesso = item.arremesso ?? false;
  }
  if (result.baseSpecialActions === undefined) {
    result.baseSpecialActions = item.specialActions
      ? item.specialActions.map((a) => ({ ...a }))
      : [];
  }
  if (isDefenseEquipment(item)) {
    const defenseItem = item as unknown as DefenseEquipment;
    const defenseResult = result as unknown as DefenseEquipment;
    if (
      defenseItem.defenseBonus !== undefined &&
      defenseResult.baseDefenseBonus === undefined
    ) {
      defenseResult.baseDefenseBonus = defenseItem.defenseBonus;
    }
    if (
      defenseItem.armorPenalty !== undefined &&
      defenseResult.baseArmorPenalty === undefined
    ) {
      defenseResult.baseArmorPenalty = defenseItem.armorPenalty;
    }
  }
  return result;
}

/**
 * Applies an aggregated delta to an item that has already had its base values
 * captured. Returns a new item with recomputed `dano`, `atkBonus`, `critico`,
 * `spaces`, defense fields, and `sheetBonuses` (merging baseSheetBonuses with
 * skill bonuses and standalone Defense bonuses derived from the delta).
 *
 * When `preserveManualStats` is true, skip rewriting the numeric stat fields
 * the user can edit by hand (`dano`, `atkBonus`, `critico`, `defenseBonus`,
 * `armorPenalty`). Derived effects (sheetBonuses, extraDamage, specialActions,
 * arremesso) still apply — those don't compete with manual edits.
 *
 * `spaces` também é editável pelo jogador, mas tem a sua própria flag
 * (`hasManualSpaces`) em vez de entrar no grupo acima: o editor deixa mexer no
 * espaço sem tocar nos stats de combate, e vice-versa.
 */
export function applyDelta<T extends Equipment>(
  captured: T,
  delta: AggregatedDelta,
  preserveManualStats = false
): T {
  const result = { ...captured } as T;

  if (!preserveManualStats) {
    if (captured.baseAtkBonus !== undefined) {
      result.atkBonus = captured.baseAtkBonus + delta.atkBonusDelta;
    } else if (delta.atkBonusDelta) {
      result.atkBonus = delta.atkBonusDelta;
    }

    if (captured.baseDano !== undefined) {
      let dano = captured.baseDano;
      if (delta.danoStepUpDelta) {
        dano = stepUpDamageDice(dano, delta.danoStepUpDelta);
      }
      if (delta.danoDelta) {
        dano = adjustDanoBonus(dano, delta.danoDelta);
      }
      result.dano = dano;
    }

    if (captured.baseCritico !== undefined) {
      let crit = captured.baseCritico;
      if (delta.criticoMultDelta) {
        crit = adjustCriticoMult(crit, delta.criticoMultDelta);
      }
      if (delta.criticoThreatDelta) {
        crit = adjustCriticoThreat(crit, delta.criticoThreatDelta);
      }
      if (delta.criticoThreatDoubleMargin) {
        crit = doubleCriticoThreatMargin(crit);
      }
      result.critico = crit;
    }
  }

  // `hasManualSpaces` é do ITEM, não do parâmetro `preserveManualStats`: este
  // pipeline também roda no recálculo da ficha, longe do editor, e lá o único
  // sinal de que o jogador digitou o espaço à mão é a flag gravada no item.
  if (!captured.hasManualSpaces && captured.baseSpaces !== undefined) {
    result.spaces = Math.max(0, captured.baseSpaces + delta.spacesDelta);
  }

  if (isDefenseEquipment(captured)) {
    const defenseCaptured = captured as DefenseEquipment;
    const defenseResult = result as unknown as DefenseEquipment;
    if (!preserveManualStats) {
      if (defenseCaptured.baseDefenseBonus !== undefined) {
        defenseResult.defenseBonus =
          defenseCaptured.baseDefenseBonus + delta.defenseBonusDelta;
      }
      if (defenseCaptured.baseArmorPenalty !== undefined) {
        defenseResult.armorPenalty =
          defenseCaptured.baseArmorPenalty + delta.armorPenaltyDelta;
      }
    }
  }

  const baseBonuses: SheetBonus[] = captured.baseSheetBonuses ?? [];
  const derivedBonuses: SheetBonus[] = delta.skillBonuses.map((sb) => ({
    source: { type: 'equipment', equipmentName: result.nome },
    target: { type: 'Skill', name: sb.skill },
    modifier: { type: 'Fixed', value: sb.value },
  }));
  if (delta.defenseBonusFromSheetBonus !== 0) {
    derivedBonuses.push({
      source: { type: 'equipment', equipmentName: result.nome },
      target: { type: 'Defense' },
      modifier: { type: 'Fixed', value: delta.defenseBonusFromSheetBonus },
    });
  }
  delta.damageReductionBonuses.forEach((dr) => {
    if (dr.value === 0) return;
    derivedBonuses.push({
      source: { type: 'equipment', equipmentName: result.nome },
      target: { type: 'DamageReduction', damageType: dr.damageType },
      modifier: { type: 'Fixed', value: dr.value },
    });
  });
  result.sheetBonuses = [...baseBonuses, ...derivedBonuses];

  // Merge user-managed extra damage entries with derived ones from mods/ench.
  const userExtraDamage = (captured.extraDamage ?? []).filter(
    (e) => e.source === 'user'
  );
  const merged = [...userExtraDamage, ...delta.derivedExtraDamage];
  result.extraDamage = merged.length > 0 ? merged : undefined;

  // Rebuild specialActions from base + derived (deduped by id, preferring base).
  const baseActions = captured.baseSpecialActions ?? [];
  const baseIds = new Set(baseActions.map((a) => a.id));
  const newDerived = delta.derivedSpecialActions.filter(
    (a) => !baseIds.has(a.id)
  );
  // O atributo de dano por modo é escolha do usuário (editor da mochila, que
  // grava em `specialActions`). `baseSpecialActions` é um snapshot congelado na
  // primeira passagem do pipeline, então reconstruir a lista só a partir dele
  // apagaria essa escolha a cada recálculo. Reaplicamos os overrides atuais por
  // id — mesmo princípio do `extraDamage` do usuário, preservado acima.
  const damageAttributeOverrides = new Map(
    (captured.specialActions ?? []).map((a) => [a.id, a.damageAttribute])
  );
  const combinedActions = [...baseActions, ...newDerived].map<WeaponAction>(
    (a) =>
      damageAttributeOverrides.has(a.id)
        ? { ...a, damageAttribute: damageAttributeOverrides.get(a.id) }
        : a
  );
  result.specialActions =
    combinedActions.length > 0 ? combinedActions : undefined;

  // Resolve arremesso: enchantment override wins; otherwise restore base.
  if (delta.setArremesso === true) {
    result.arremesso = true;
  } else {
    result.arremesso = captured.baseArremesso || undefined;
  }

  return result;
}
