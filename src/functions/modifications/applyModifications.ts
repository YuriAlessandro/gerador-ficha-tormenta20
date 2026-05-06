import Equipment from '../../interfaces/Equipment';
import { applyItemEnhancements } from '../itemEnhancements/applyEnhancements';

export {
  adjustDanoBonus,
  adjustCriticoMult,
  adjustCriticoThreat,
} from '../itemEnhancements/core';

/**
 * Recomputes an Equipment's stats from its `base*` snapshots and current
 * `modifications` array. Items without modifications are returned unchanged.
 *
 * Thin wrapper over `applyItemEnhancements` (which also handles enchantments).
 * Kept so that consumers importing from `modifications/applyModifications`
 * continue to work; new code should prefer `applyItemEnhancements` directly.
 */
export function applyModificationsToEquipment<T extends Equipment>(item: T): T {
  return applyItemEnhancements(item);
}
