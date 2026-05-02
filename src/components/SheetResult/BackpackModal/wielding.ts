import Equipment from '../../../interfaces/Equipment';

export type WieldingSlot = 'main' | 'off' | 'both' | null;

export interface WieldingState {
  mainHandItemId?: string;
  offHandItemId?: string;
}

/**
 * True when the weapon requires both hands. Reads the dedicated `twoHanded`
 * flag, with a fallback for legacy data that may have used `weaponTags`.
 */
export function isTwoHanded(item: Equipment): boolean {
  if (item.twoHanded === true) return true;
  return item.weaponTags?.includes('twoHanded') === true;
}

/**
 * True when the item can occupy a hand slot. Categories considered wieldable:
 *  - Arma (weapons)
 *  - Escudo (shields)
 *  - Alquimía (alchemical items — most are thrown/applied with a hand)
 * Plus any item explicitly flagged via `canBeUsedAsWeapon` (e.g. Tocha) or the
 * player override `canBeWielded` (custom wands, focuses, etc.).
 */
export function isWieldable(item: Equipment): boolean {
  if (item.canBeWielded === true) return true;
  if (item.canBeUsedAsWeapon === true) return true;
  return (
    item.group === 'Arma' ||
    item.group === 'Escudo' ||
    item.group === 'Alquimía'
  );
}

export function getWieldingSlot(
  itemId: string | undefined,
  state: WieldingState
): WieldingSlot {
  if (!itemId) return null;
  if (state.mainHandItemId === itemId && state.offHandItemId === itemId) {
    return 'both';
  }
  if (state.mainHandItemId === itemId) return 'main';
  if (state.offHandItemId === itemId) return 'off';
  return null;
}

/**
 * Pure: returns the new wielding state when assigning `itemId` to `slot`.
 *
 * Rules:
 *  - `slot === null` removes the item from whichever slot(s) it occupies.
 *  - `slot === 'both'` (two-handed): the item occupies BOTH hands; whatever
 *    was in either slot before is evicted.
 *  - Assigning to a slot that already holds another item evicts the previous one.
 *  - Assigning an item that's already in the OTHER slot moves it.
 *  - Assigning to the slot the item already occupies is a no-op.
 *
 * When `lookup` is provided, additional reducer-level guards apply:
 *  - Assigning a Shield to a hand whose OTHER hand contains a two-handed weapon
 *    returns the state unchanged (a hand is consumed by a 2H weapon).
 *  - Assigning a Shield to `'both'` returns the state unchanged (shields are
 *    never two-handed).
 *  - Assigning a non-shield item that is `twoHanded === false` to a hand whose
 *    other hand contains a 2H weapon evicts the 2H from both hands implicitly
 *    (the remove step above already handles this).
 */
export function applyWielding(
  current: WieldingState,
  itemId: string,
  slot: WieldingSlot,
  lookup?: (id: string) => Equipment | undefined
): WieldingState {
  const next: WieldingState = {
    mainHandItemId: current.mainHandItemId,
    offHandItemId: current.offHandItemId,
  };

  if (slot === null) {
    if (next.mainHandItemId === itemId) next.mainHandItemId = undefined;
    if (next.offHandItemId === itemId) next.offHandItemId = undefined;
    return next;
  }

  if (lookup) {
    const target = lookup(itemId);
    const isShield = target?.group === 'Escudo';
    if (isShield && slot === 'both') {
      // Shields cannot occupy both hands.
      return current;
    }
    if (isShield && (slot === 'main' || slot === 'off')) {
      // Find the item already in the OTHER hand (after removing target from any
      // slot it currently occupies, to avoid false self-conflict).
      const otherSlotKey = slot === 'main' ? 'offHandItemId' : 'mainHandItemId';
      const otherId = next[otherSlotKey];
      if (otherId && otherId !== itemId) {
        const other = lookup(otherId);
        if (other && isTwoHanded(other)) {
          // Hand consumed by a 2H weapon — block.
          return current;
        }
      }
    }
  }

  // Remove the item from any slot it currently occupies.
  if (next.mainHandItemId === itemId) next.mainHandItemId = undefined;
  if (next.offHandItemId === itemId) next.offHandItemId = undefined;

  if (slot === 'both') {
    // Two-handed: evict whatever else is in either slot.
    next.mainHandItemId = itemId;
    next.offHandItemId = itemId;
    return next;
  }

  if (slot === 'main') {
    next.mainHandItemId = itemId;
    // Defensive: if main was previously part of a two-handed setup (both slots
    // had the same id), the off-hand cleanup above already handled it.
  } else {
    next.offHandItemId = itemId;
  }

  return next;
}

/**
 * Convenience for the common "the user clicked Empunhar/Soltar on a two-handed
 * weapon" interaction: passes 'both' (empunhar) or `null` (soltar) directly.
 */
export function applyTwoHandedToggle(
  current: WieldingState,
  itemId: string,
  empunhar: boolean
): WieldingState {
  return applyWielding(current, itemId, empunhar ? 'both' : null);
}

/**
 * Resolves the worn armor for a sheet. Rules:
 *  - When `wornArmorId` points to an armor present in the list → that armor.
 *  - When `wornArmorId` is undefined and there is exactly 1 armor → that armor
 *    (legacy compat for sheets created before the worn-armor feature).
 *  - Otherwise (≥2 armors and no wornArmorId, or wornArmorId stale) → undefined,
 *    meaning "ambiguous, no armor applies, prompt the player to choose".
 */
export function getWornArmor<T extends Equipment>(
  armors: T[],
  wornArmorId: string | undefined
): T | undefined {
  if (wornArmorId) {
    const match = armors.find((a) => a.id === wornArmorId);
    if (match) return match;
  }
  if (!wornArmorId && armors.length === 1) return armors[0];
  return undefined;
}

/**
 * One-shot migration for sheets created BEFORE the wielding/worn-armor system.
 *
 * When a sheet has never had any of `mainHandItemId`, `offHandItemId`,
 * `wornArmorId` set AND `equipStateMigrated` is not yet true, this function
 * picks the natural "active" items from the bag and seeds the slots:
 *  - First armor → `wornArmorId`.
 *  - First shield → `offHandItemId`.
 *  - First one-handed weapon → `mainHandItemId` (preferred when a shield is
 *    also being equipped, so the hand is free for it).
 *  - Otherwise: first two-handed weapon → both hands (only if there's no
 *    shield to equip — shields and 2H weapons are mutually exclusive).
 *
 * Once migrated, sets `equipStateMigrated = true`. Subsequent calls are no-ops,
 * preserving any deliberate "soltar" / "tirar" actions the player makes later.
 *
 * Returns a new state object when migration applies; the same input otherwise.
 */
export interface MigratableSheetView {
  mainHandItemId?: string;
  offHandItemId?: string;
  wornArmorId?: string;
  equipStateMigrated?: boolean;
}

export interface MigratableBagView {
  Armadura?: { id?: string }[];
  Escudo?: { id?: string }[];
  Arma?: Equipment[];
}

export function migrateLegacyEquipState<
  T extends MigratableSheetView & { bag: { equipments: MigratableBagView } }
>(sheet: T): T {
  if (sheet.equipStateMigrated) return sheet;
  // If ANY slot is already set, the sheet has clearly opted into the new
  // system at some point — just stamp the flag and leave the values alone.
  if (
    sheet.mainHandItemId !== undefined ||
    sheet.offHandItemId !== undefined ||
    sheet.wornArmorId !== undefined
  ) {
    return { ...sheet, equipStateMigrated: true };
  }

  const equipments = sheet.bag?.equipments ?? {};
  const armors = (equipments.Armadura ?? []) as { id?: string }[];
  const shields = (equipments.Escudo ?? []) as { id?: string }[];
  const weapons = (equipments.Arma ?? []) as Equipment[];

  const wornArmorId = armors[0]?.id;
  const offHandFromShield = shields[0]?.id;

  let mainHandItemId: string | undefined;
  let offHandItemId: string | undefined = offHandFromShield;

  const oneHandedWeapon = weapons.find((w) => w.id && !isTwoHanded(w));
  const twoHandedWeapon = weapons.find((w) => w.id && isTwoHanded(w));

  if (offHandItemId) {
    // Shield occupies the off-hand → main can only host a 1H weapon.
    if (oneHandedWeapon?.id) mainHandItemId = oneHandedWeapon.id;
  } else if (oneHandedWeapon?.id) {
    mainHandItemId = oneHandedWeapon.id;
  } else if (twoHandedWeapon?.id) {
    mainHandItemId = twoHandedWeapon.id;
    offHandItemId = twoHandedWeapon.id;
  }

  return {
    ...sheet,
    mainHandItemId,
    offHandItemId,
    wornArmorId,
    equipStateMigrated: true,
  };
}

/**
 * Strips slot references that point at items no longer present in the bag.
 * Used after item removal to keep slots consistent.
 */
export function pruneWielding(
  state: WieldingState,
  existingItemIds: Set<string>
): WieldingState {
  return {
    mainHandItemId:
      state.mainHandItemId && existingItemIds.has(state.mainHandItemId)
        ? state.mainHandItemId
        : undefined,
    offHandItemId:
      state.offHandItemId && existingItemIds.has(state.offHandItemId)
        ? state.offHandItemId
        : undefined,
  };
}
