import Equipment from '../../interfaces/Equipment';
import {
  aggregateEffects,
  applyDelta,
  captureBaseValues,
  SourcedEffect,
  sumDeltas,
} from './core';
import { modificationEffects } from '../modifications/modificationEffects';
import { enchantmentEffects } from './enchantmentEffects';

/**
 * Recomputes an Equipment's stats from its `base*` snapshots and current
 * `modifications` + `enchantments` arrays. Pure / idempotent: calling it twice
 * with the same input produces the same output. Items without any enhancements
 * are returned unchanged (no base capture, no recomputation).
 *
 * The pipeline aggregates deltas from both sources and applies them once over
 * the captured base, so combining a mod and an enchantment that both modify the
 * same stat (e.g. Certeira +1 atk mod + Formidável +2 atk ench) yields the
 * correct sum (+3) without double counting.
 *
 * If the item has `hasManualEdits === true`, the function still recomputes from
 * the base values — manual edits are an override the user opted into, and they
 * are aware that re-applying enhancements resets manual tweaks.
 */
export function applyItemEnhancements<T extends Equipment>(item: T): T {
  const hasMods = !!item.modifications?.length;
  const hasEnch = !!item.enchantments?.length;
  // Run the pipeline whenever the item has any extra damage entry, including
  // stale derived entries that should be stripped now that their source is
  // gone (e.g. a previously-applied Flamejante that was removed).
  const hasExtraDamage = !!item.extraDamage?.length;
  if (!hasMods && !hasEnch && !hasExtraDamage) return item;

  const captured = captureBaseValues(item);

  const modEntries: SourcedEffect[] = (captured.modifications ?? []).map(
    (m) => ({
      effect: modificationEffects[m.mod],
      source: 'modification',
      sourceName: m.mod,
    })
  );
  const enchEntries: SourcedEffect[] = (captured.enchantments ?? []).map(
    (e) => ({
      effect: enchantmentEffects[e.enchantment],
      source: 'enchantment',
      sourceName: e.enchantment,
    })
  );
  const modDelta = aggregateEffects(modEntries);
  const enchDelta = aggregateEffects(enchEntries);
  const delta = sumDeltas(modDelta, enchDelta);

  return applyDelta(captured, delta);
}
