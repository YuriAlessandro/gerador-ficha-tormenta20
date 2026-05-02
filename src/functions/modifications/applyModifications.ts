import Equipment, {
  AppliedModification,
  DefenseEquipment,
} from '../../interfaces/Equipment';
import { SheetBonus } from '../../interfaces/CharacterSheet';
import { modificationEffects } from './modificationEffects';

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

function isDefenseEquipment(item: Equipment): item is DefenseEquipment {
  return item.group === 'Armadura' || item.group === 'Escudo';
}

interface AggregatedDelta {
  atkBonusDelta: number;
  danoDelta: number;
  criticoMultDelta: number;
  criticoThreatDelta: number;
  defenseBonusDelta: number;
  armorPenaltyDelta: number;
  spacesDelta: number;
  skillBonuses: {
    skill: import('../../interfaces/Skills').default;
    value: number;
  }[];
}

function aggregate(modifications: AppliedModification[]): AggregatedDelta {
  const acc: AggregatedDelta = {
    atkBonusDelta: 0,
    danoDelta: 0,
    criticoMultDelta: 0,
    criticoThreatDelta: 0,
    defenseBonusDelta: 0,
    armorPenaltyDelta: 0,
    spacesDelta: 0,
    skillBonuses: [],
  };

  modifications.forEach(({ mod }) => {
    const effect = modificationEffects[mod];
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
  });

  return acc;
}

/**
 * Captures pristine stat values into the `base*` fields the first time the item
 * is processed. Subsequent calls are idempotent — base values stay frozen.
 */
function captureBaseValues<T extends Equipment>(item: T): T {
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
  if (
    item.sheetBonuses !== undefined &&
    result.baseSheetBonuses === undefined
  ) {
    result.baseSheetBonuses = item.sheetBonuses;
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
 * Recomputes an Equipment's stats from its `base*` snapshots and current
 * `modifications` array. Pure / idempotent: calling it twice with the same input
 * produces the same output. Items without modifications are returned unchanged
 * (no base capture, no recomputation).
 *
 * If the item has `hasManualEdits === true`, the function still recomputes from
 * the base values — manual edits are an override the user opted into and they
 * should be aware that re-applying modifications resets manual tweaks.
 */
export function applyModificationsToEquipment<T extends Equipment>(item: T): T {
  if (!item.modifications || item.modifications.length === 0) return item;

  const captured = captureBaseValues(item);
  const delta = aggregate(captured.modifications ?? []);
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
  const modBonuses: SheetBonus[] = delta.skillBonuses.map((sb) => ({
    source: { type: 'equipment', equipmentName: result.nome },
    target: { type: 'Skill', name: sb.skill },
    modifier: { type: 'Fixed', value: sb.value },
  }));
  result.sheetBonuses = [...baseBonuses, ...modBonuses];

  return result;
}
