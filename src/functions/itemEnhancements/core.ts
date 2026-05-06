import Equipment, {
  DamageType,
  DefenseEquipment,
  ExtraDamage,
  WeaponAction,
} from '../../interfaces/Equipment';
import { SheetBonus } from '../../interfaces/CharacterSheet';
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
  criticoMultDelta: number;
  criticoThreatDelta: number;
  defenseBonusDelta: number;
  armorPenaltyDelta: number;
  spacesDelta: number;
  skillBonuses: { skill: Skill; value: number }[];
  defenseBonusFromSheetBonus: number;
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
    criticoMultDelta: 0,
    criticoThreatDelta: 0,
    defenseBonusDelta: 0,
    armorPenaltyDelta: 0,
    spacesDelta: 0,
    skillBonuses: [],
    defenseBonusFromSheetBonus: 0,
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
    acc.criticoMultDelta += d.criticoMultDelta;
    acc.criticoThreatDelta += d.criticoThreatDelta;
    acc.defenseBonusDelta += d.defenseBonusDelta;
    acc.armorPenaltyDelta += d.armorPenaltyDelta;
    acc.spacesDelta += d.spacesDelta;
    acc.skillBonuses.push(...d.skillBonuses);
    acc.defenseBonusFromSheetBonus += d.defenseBonusFromSheetBonus;
    acc.derivedExtraDamage.push(...d.derivedExtraDamage);
    if (d.criticoThreatDoubleMargin) acc.criticoThreatDoubleMargin = true;
    acc.derivedSpecialActions.push(...d.derivedSpecialActions);
    if (d.setArremesso !== undefined) acc.setArremesso = d.setArremesso;
    return acc;
  }, emptyDelta());
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

function parseCritico(c: string): ParsedCritico {
  const trimmed = (c || '').trim();
  const slashIdx = trimmed.indexOf('/');
  if (slashIdx >= 0) {
    const threat = parseInt(trimmed.substring(0, slashIdx), 10);
    const multStr = trimmed.substring(slashIdx + 1).replace(/^x/i, '');
    return {
      threat: Number.isFinite(threat) ? threat : 20,
      mult: parseInt(multStr, 10) || 2,
    };
  }
  const multStr = trimmed.replace(/^x/i, '');
  return { threat: 20, mult: parseInt(multStr, 10) || 2 };
}

function formatCritico({ threat, mult }: ParsedCritico): string {
  if (threat >= 20) return `x${mult}`;
  return `${threat}/x${mult}`;
}

export function adjustCriticoMult(c: string, delta: number): string {
  const parsed = parseCritico(c);
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
  if (item.atkBonus !== undefined && result.baseAtkBonus === undefined) {
    result.baseAtkBonus = item.atkBonus;
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
 */
export function applyDelta<T extends Equipment>(
  captured: T,
  delta: AggregatedDelta
): T {
  const result = { ...captured } as T;

  if (captured.baseAtkBonus !== undefined) {
    result.atkBonus = captured.baseAtkBonus + delta.atkBonusDelta;
  } else if (delta.atkBonusDelta) {
    result.atkBonus = delta.atkBonusDelta;
  }

  if (captured.baseDano !== undefined && delta.danoDelta) {
    result.dano = adjustDanoBonus(captured.baseDano, delta.danoDelta);
  } else if (captured.baseDano !== undefined) {
    result.dano = captured.baseDano;
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

  if (captured.baseSpaces !== undefined) {
    result.spaces = Math.max(0, captured.baseSpaces + delta.spacesDelta);
  }

  if (isDefenseEquipment(captured)) {
    const defenseCaptured = captured as DefenseEquipment;
    const defenseResult = result as unknown as DefenseEquipment;
    if (defenseCaptured.baseDefenseBonus !== undefined) {
      defenseResult.defenseBonus =
        defenseCaptured.baseDefenseBonus + delta.defenseBonusDelta;
    }
    if (defenseCaptured.baseArmorPenalty !== undefined) {
      defenseResult.armorPenalty =
        defenseCaptured.baseArmorPenalty + delta.armorPenaltyDelta;
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
  const combinedActions = [...baseActions, ...newDerived];
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
