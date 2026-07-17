import Bag from '../../../interfaces/Bag';
import Equipment, {
  BagEquipments,
  equipGroup,
} from '../../../interfaces/Equipment';

/**
 * Returns items in a bag matching `predicate`, respecting the user-defined
 * `bag.displayOrder`. Falls back to category-array iteration when the bag
 * lacks a usable `displayOrder` (legacy compat — e.g. a sheet not yet rehydrated
 * via `new Bag(...)` or one whose array is empty).
 *
 * Accepts both a `Bag` instance and a plain object snapshot of `equipments` +
 * optional `displayOrder` (used during cloud rehydration / persisted JSON).
 */
export function getOrderedItemsByGroup(
  source:
    | Bag
    | { equipments: BagEquipments; displayOrder?: string[] }
    | undefined,
  predicate: (item: Equipment) => boolean
): Equipment[] {
  if (!source) return [];

  const equipments: BagEquipments = (source as Bag).getEquipments
    ? (source as Bag).getEquipments()
    : (source as { equipments: BagEquipments }).equipments;

  const displayOrder: string[] = Array.isArray(
    (source as { displayOrder?: string[] }).displayOrder
  )
    ? ((source as { displayOrder?: string[] }).displayOrder as string[])
    : [];

  // Build an id-indexed map of all items in the bag.
  const byId = new Map<string, Equipment>();
  const seenIds = new Set<string>();
  (Object.keys(equipments) as equipGroup[]).forEach((cat) => {
    const list = equipments[cat];
    if (!Array.isArray(list)) return;
    list.forEach((eq) => {
      if (eq && typeof eq === 'object' && eq.id) {
        byId.set(eq.id, eq);
      }
    });
  });

  const result: Equipment[] = [];

  // Phase 1: emit items present in displayOrder, filtered by predicate.
  displayOrder.forEach((id) => {
    const item = byId.get(id);
    if (item && predicate(item)) {
      result.push(item);
      seenIds.add(id);
    }
  });

  // Phase 2: append any matching items that aren't in displayOrder (legacy
  // sheets, or items added through paths that bypassed the Bag constructor).
  // Iteration order follows the canonical category iteration, mirroring the
  // pre-displayOrder behavior so legacy rendering is preserved exactly.
  (Object.keys(equipments) as equipGroup[]).forEach((cat) => {
    const list = equipments[cat];
    if (!Array.isArray(list)) return;
    list.forEach((eq) => {
      if (!eq || typeof eq !== 'object') return;
      if (eq.id && seenIds.has(eq.id)) return;
      if (predicate(eq)) {
        result.push(eq);
        if (eq.id) seenIds.add(eq.id);
      }
    });
  });

  return result;
}
