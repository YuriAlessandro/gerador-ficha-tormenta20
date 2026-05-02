import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { v4 as uuid } from 'uuid';

import Bag, { ensureIds, reconcileDisplayOrder } from '../../../interfaces/Bag';
import Equipment, {
  BagEquipments,
  equipGroup,
} from '../../../interfaces/Equipment';
import {
  calculateCurrencySpaces,
  calculateMaxSpaces,
} from '../../../functions/general';
import {
  applyWielding,
  isTwoHanded,
  migrateLegacyEquipState,
  pruneWielding,
  WieldingSlot,
} from './wielding';

export interface BackpackMoney {
  dinheiro: number;
  dinheiroTC: number;
  dinheiroTO: number;
}

interface StagedState {
  equipments: BagEquipments;
  displayOrder: string[];
  money: BackpackMoney;
  customMaxSpaces?: number;
  autoDeductMoney: boolean;
  mainHandItemId?: string;
  offHandItemId?: string;
  wornArmorId?: string;
  groupByCategory: boolean;
}

export interface BackpackInputs {
  bag: Bag;
  initialMoney: BackpackMoney;
  forca: number;
  initialCustomMaxSpaces?: number;
  /** Default for the auto-deduct toggle when entering the modal. */
  initialAutoDeductMoney?: boolean;
  initialMainHandItemId?: string;
  initialOffHandItemId?: string;
  initialWornArmorId?: string;
  initialGroupByCategory?: boolean;
  /**
   * When the modal transitions from closed to open, the staged snapshot is
   * resynced with the latest bag (so external mutations like ammo consumption
   * via attack rolls show up). Optional — when omitted, snapshot is captured
   * once at mount.
   */
  open?: boolean;
}

export interface BackpackDerivedTotals {
  itemSpaces: number;
  currencySpaces: number;
  totalSpaces: number;
  maxSpaces: number;
  isOverloaded: boolean;
  overflowItemIds: Set<string>;
  overflowStartIndex: number;
}

export interface BackpackFilters {
  searchQuery: string;
  selectedCategories: Set<equipGroup>;
}

export interface BackpackActions {
  /** Adds (or merges qty into) an item. Replaces existing armor/shield. */
  addItem: (item: Equipment, options?: { quantity?: number }) => void;
  /** Removes an item by id. Returns the item removed (for undo, refund, etc.). */
  removeItem: (id: string) => Equipment | null;
  /** Sets the quantity for an item; clamps to >= 1. */
  setQuantity: (id: string, quantity: number) => void;
  /** Replaces the item in place by id. */
  updateItem: (id: string, next: Equipment) => void;
  setMoney: (money: Partial<BackpackMoney>) => void;
  setCustomMaxSpaces: (value: number | undefined) => void;
  setAutoDeductMoney: (value: boolean) => void;
  /** Reorders by item id (used by drag-and-drop in PR 6). */
  reorder: (orderedIds: string[]) => void;
  /** Assigns or clears an item's hand slot. Mutually exclusive across slots. */
  setWielding: (itemId: string, slot: WieldingSlot) => void;
  /** Sets which armor is currently worn. Pass `null` to unwear. */
  setWornArmor: (itemId: string | null) => void;
  /** Switches the modal grid between flat (false) and category-grouped (true). */
  setGroupByCategory: (value: boolean) => void;
  /** Resets the staged state back to the snapshot taken at modal open. */
  revertChanges: () => void;
}

export interface BackpackState extends BackpackActions {
  orderedItems: Equipment[];
  filteredItems: Equipment[];
  totals: BackpackDerivedTotals;
  filters: BackpackFilters;
  setSearchQuery: (q: string) => void;
  toggleCategoryFilter: (category: equipGroup) => void;
  resetCategoryFilters: () => void;
  reorderMode: boolean;
  setReorderMode: (active: boolean) => void;
  /** Current staged values (for the modal footer / persistence). */
  staged: StagedState;
  /** True when the user has changed anything since opening the modal. */
  isDirty: boolean;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function flattenEquipments(equipments: BagEquipments): Equipment[] {
  const out: Equipment[] = [];
  (Object.keys(equipments) as equipGroup[]).forEach((cat) => {
    const list = equipments[cat];
    if (Array.isArray(list)) list.forEach((eq) => eq && out.push(eq));
  });
  return out;
}

export function computeOverflow(
  orderedItems: Equipment[],
  ceiling: number
): { overflowItemIds: Set<string>; overflowStartIndex: number } {
  const overflowItemIds = new Set<string>();
  let cumulative = 0;
  let overflowStartIndex = -1;
  for (let i = 0; i < orderedItems.length; i += 1) {
    const item = orderedItems[i];
    cumulative += (item.spaces ?? 0) * (item.quantity ?? 1);
    if (cumulative > ceiling) {
      if (overflowStartIndex === -1) overflowStartIndex = i;
      if (item.id) overflowItemIds.add(item.id);
    }
  }
  return { overflowItemIds, overflowStartIndex };
}

/* -------------------------- reducer -------------------------- */

type Action =
  | { type: 'ADD_ITEM'; item: Equipment; quantity: number }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'SET_QUANTITY'; id: string; quantity: number }
  | { type: 'UPDATE_ITEM'; id: string; next: Equipment }
  | { type: 'SET_MONEY'; money: Partial<BackpackMoney> }
  | { type: 'SET_CUSTOM_MAX_SPACES'; value: number | undefined }
  | { type: 'SET_AUTO_DEDUCT'; value: boolean }
  | { type: 'REORDER'; orderedIds: string[] }
  | { type: 'SET_WIELDING'; itemId: string; slot: WieldingSlot }
  | { type: 'SET_WORN_ARMOR'; itemId: string | null }
  | { type: 'SET_GROUP_BY_CATEGORY'; value: boolean }
  | { type: 'RESET'; snapshot: StagedState };

function ensureId(item: Equipment): Equipment {
  if (item.id) return item;
  return { ...item, id: uuid() };
}

/**
 * Adds an item to the proper category bucket. Stacks by name when adding a
 * non-custom catalog item that already exists; otherwise appends. Armor and
 * shields are no longer single-item — multiple may coexist; only the worn
 * armor and the wielded shield apply their bonuses to the sheet.
 *
 * Returns the id of the item that ended up in the bag (existing stack id when
 * merged, fresh id otherwise) so the caller can auto-wield/auto-wear etc.
 */
function addItemToEquipments(
  equipments: BagEquipments,
  displayOrder: string[],
  itemRaw: Equipment,
  quantity: number
): { equipments: BagEquipments; displayOrder: string[]; addedId?: string } {
  const item = ensureId(itemRaw);
  const next: BagEquipments = { ...equipments };
  const nextOrder = [...displayOrder];

  const list = (next[item.group] ?? []) as Equipment[];
  // Stack by name when a non-custom catalog item is added.
  const existingIdx = list.findIndex(
    (it) => it.nome === item.nome && !it.isCustom && !item.isCustom
  );
  if (existingIdx >= 0) {
    const existing = list[existingIdx];
    let merged: Equipment;
    if (item.isAmmo) {
      // Ammo: track individual unit count in `unitsRemaining`. Each "buy" adds
      // ammoPackSize units per stack purchased. quantity stays cosmetically 1.
      const packSize = item.ammoPackSize ?? 20;
      const currentUnits = existing.unitsRemaining ?? 0;
      merged = {
        ...existing,
        unitsRemaining: currentUnits + packSize * quantity,
        quantity: 1,
      };
    } else {
      merged = {
        ...existing,
        quantity: (existing.quantity ?? 1) + quantity,
      };
    }
    next[item.group] = [
      ...list.slice(0, existingIdx),
      merged,
      ...list.slice(existingIdx + 1),
    ] as never;
    return {
      equipments: next,
      displayOrder: nextOrder,
      addedId: existing.id,
    };
  }

  let toInsert: Equipment;
  if (item.isAmmo) {
    const packSize = item.ammoPackSize ?? 20;
    toInsert = {
      ...item,
      quantity: 1,
      unitsRemaining: packSize * quantity,
    };
  } else {
    toInsert = { ...item, quantity };
  }
  next[item.group] = [...list, toInsert] as never;
  if (item.id) nextOrder.push(item.id);
  return { equipments: next, displayOrder: nextOrder, addedId: item.id };
}

function removeItemFromEquipments(
  equipments: BagEquipments,
  displayOrder: string[],
  id: string
): {
  equipments: BagEquipments;
  displayOrder: string[];
  removed: Equipment | null;
} {
  let removed: Equipment | null = null;
  const next: BagEquipments = { ...equipments };
  (Object.keys(next) as equipGroup[]).forEach((cat) => {
    const list = next[cat];
    if (!Array.isArray(list)) return;
    const idx = list.findIndex((it) => it.id === id);
    if (idx >= 0) {
      removed = list[idx];
      next[cat] = [...list.slice(0, idx), ...list.slice(idx + 1)] as never;
    }
  });
  const nextOrder = displayOrder.filter((oid) => oid !== id);
  return { equipments: next, displayOrder: nextOrder, removed };
}

function updateItemInEquipments(
  equipments: BagEquipments,
  id: string,
  next: Equipment
): BagEquipments {
  const out: BagEquipments = { ...equipments };
  (Object.keys(out) as equipGroup[]).forEach((cat) => {
    const list = out[cat];
    if (!Array.isArray(list)) return;
    const idx = list.findIndex((it) => it.id === id);
    if (idx >= 0) {
      out[cat] = [
        ...list.slice(0, idx),
        { ...next, id },
        ...list.slice(idx + 1),
      ] as never;
    }
  });
  return out;
}

function reducer(state: StagedState, action: Action): StagedState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { equipments, displayOrder, addedId } = addItemToEquipments(
        state.equipments,
        state.displayOrder,
        action.item,
        Math.max(1, action.quantity)
      );
      let { money } = state;
      if (state.autoDeductMoney && action.item.preco) {
        const cost = action.item.preco * action.quantity;
        money = { ...money, dinheiro: money.dinheiro - cost };
      }

      // Auto-wield: if a weapon is added while both hand slots are empty, the
      // player is implicitly wielding it. Two-handed weapons take both hands;
      // one-handed go to the main hand.
      let { mainHandItemId, offHandItemId } = state;
      const isWeapon = action.item.group === 'Arma';
      const noWielding =
        mainHandItemId === undefined && offHandItemId === undefined;
      if (isWeapon && noWielding && addedId) {
        if (action.item.twoHanded === true) {
          mainHandItemId = addedId;
          offHandItemId = addedId;
        } else {
          mainHandItemId = addedId;
        }
      }

      // Auto-wield shield: if a shield is added and the off-hand is free AND
      // no two-handed weapon occupies the main hand, it goes to the off-hand.
      if (action.item.group === 'Escudo' && addedId && !offHandItemId) {
        const mainItem = mainHandItemId
          ? flattenEquipments(state.equipments).find(
              (it) => it.id === mainHandItemId
            )
          : undefined;
        const mainIsTwoHanded = mainItem ? isTwoHanded(mainItem) : false;
        if (!mainIsTwoHanded) {
          offHandItemId = addedId;
        }
      }

      // Auto-wear armor: if an armor is added and no armor is worn yet, wear it.
      let { wornArmorId } = state;
      if (
        action.item.group === 'Armadura' &&
        addedId &&
        wornArmorId === undefined
      ) {
        wornArmorId = addedId;
      }

      return {
        ...state,
        equipments,
        displayOrder,
        money,
        mainHandItemId,
        offHandItemId,
        wornArmorId,
      };
    }
    case 'REMOVE_ITEM': {
      const { equipments, displayOrder, removed } = removeItemFromEquipments(
        state.equipments,
        state.displayOrder,
        action.id
      );
      let { money } = state;
      if (state.autoDeductMoney && removed?.preco) {
        let refund: number;
        if (removed.isAmmo) {
          // Ammo: each "buy" gave packSize units; refund full packs only.
          const packSize = removed.ammoPackSize ?? 20;
          const units = removed.unitsRemaining ?? 0;
          const stacks = Math.ceil(units / packSize);
          refund = removed.preco * stacks;
        } else {
          refund = removed.preco * (removed.quantity ?? 1);
        }
        money = { ...money, dinheiro: money.dinheiro + refund };
      }
      // Clear wielding slots if they pointed at the removed item.
      const mainHandItemId =
        state.mainHandItemId === action.id ? undefined : state.mainHandItemId;
      const offHandItemId =
        state.offHandItemId === action.id ? undefined : state.offHandItemId;
      const wornArmorId =
        state.wornArmorId === action.id ? undefined : state.wornArmorId;
      return {
        ...state,
        equipments,
        displayOrder,
        money,
        mainHandItemId,
        offHandItemId,
        wornArmorId,
      };
    }
    case 'SET_QUANTITY': {
      const equipments: BagEquipments = { ...state.equipments };
      let oldQty = 0;
      let unitPrice = 0;
      let touched = false;
      (Object.keys(equipments) as equipGroup[]).forEach((cat) => {
        const list = equipments[cat];
        if (!Array.isArray(list)) return;
        const idx = list.findIndex((it) => it.id === action.id);
        if (idx >= 0) {
          oldQty = list[idx].quantity ?? 1;
          unitPrice = list[idx].preco ?? 0;
          equipments[cat] = [
            ...list.slice(0, idx),
            { ...list[idx], quantity: Math.max(1, action.quantity) },
            ...list.slice(idx + 1),
          ] as never;
          touched = true;
        }
      });
      if (!touched) return state;
      let { money } = state;
      if (state.autoDeductMoney && unitPrice) {
        const delta = (Math.max(1, action.quantity) - oldQty) * unitPrice;
        money = { ...money, dinheiro: money.dinheiro - delta };
      }
      return { ...state, equipments, money };
    }
    case 'UPDATE_ITEM':
      return {
        ...state,
        equipments: updateItemInEquipments(
          state.equipments,
          action.id,
          action.next
        ),
      };
    case 'SET_MONEY':
      return { ...state, money: { ...state.money, ...action.money } };
    case 'SET_CUSTOM_MAX_SPACES':
      return { ...state, customMaxSpaces: action.value };
    case 'SET_AUTO_DEDUCT':
      return { ...state, autoDeductMoney: action.value };
    case 'REORDER':
      return { ...state, displayOrder: action.orderedIds };
    case 'SET_WIELDING': {
      const lookup = (id: string): Equipment | undefined =>
        flattenEquipments(state.equipments).find((it) => it.id === id);
      const next = applyWielding(
        {
          mainHandItemId: state.mainHandItemId,
          offHandItemId: state.offHandItemId,
        },
        action.itemId,
        action.slot,
        lookup
      );
      return {
        ...state,
        mainHandItemId: next.mainHandItemId,
        offHandItemId: next.offHandItemId,
      };
    }
    case 'SET_WORN_ARMOR': {
      return { ...state, wornArmorId: action.itemId ?? undefined };
    }
    case 'SET_GROUP_BY_CATEGORY': {
      return { ...state, groupByCategory: action.value };
    }
    case 'RESET':
      return action.snapshot;
    default:
      return state;
  }
}

/* -------------------------- hook -------------------------- */

export function useBackpackState({
  bag,
  initialMoney,
  forca,
  initialCustomMaxSpaces,
  initialAutoDeductMoney = true,
  initialMainHandItemId,
  initialOffHandItemId,
  initialWornArmorId,
  initialGroupByCategory = false,
  open,
}: BackpackInputs): BackpackState {
  // Builds a fresh staged snapshot from the current bag + inputs. Used both
  // for the initial mount and for resyncing whenever the modal opens (so
  // external mutations like ammo consumption via attack rolls are reflected).
  const buildSnapshot = (): StagedState => {
    const equipments = bag.getEquipments();
    ensureIds(equipments);
    const displayOrder = reconcileDisplayOrder(
      equipments,
      Array.isArray(bag.displayOrder) ? [...bag.displayOrder] : []
    );
    const migrated = migrateLegacyEquipState({
      bag: { equipments },
      mainHandItemId: initialMainHandItemId,
      offHandItemId: initialOffHandItemId,
      wornArmorId: initialWornArmorId,
    });
    const existingIds = new Set<string>();
    flattenEquipments(equipments).forEach((eq) => {
      if (eq.id) existingIds.add(eq.id);
    });
    const pruned = pruneWielding(
      {
        mainHandItemId: migrated.mainHandItemId,
        offHandItemId: migrated.offHandItemId,
      },
      existingIds
    );
    const seededWornArmorId = migrated.wornArmorId;
    const wornArmorIsPresent =
      seededWornArmorId !== undefined && existingIds.has(seededWornArmorId);
    return {
      equipments,
      displayOrder,
      money: { ...initialMoney },
      customMaxSpaces: initialCustomMaxSpaces,
      autoDeductMoney: initialAutoDeductMoney,
      mainHandItemId: pruned.mainHandItemId,
      offHandItemId: pruned.offHandItemId,
      wornArmorId: wornArmorIsPresent ? seededWornArmorId : undefined,
      groupByCategory: initialGroupByCategory,
    };
  };

  const snapshotRef = React.useRef<StagedState | null>(null);
  if (snapshotRef.current === null) {
    snapshotRef.current = buildSnapshot();
  }
  const initialSnapshot = snapshotRef.current;

  const [staged, dispatch] = useReducer(reducer, initialSnapshot);

  // Resync the snapshot when the modal opens. Captures any external bag
  // mutations (ammo consumed via attacks, etc.) that happened while the
  // modal was closed.
  const wasOpenRef = React.useRef(open ?? false);
  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      const fresh = buildSnapshot();
      snapshotRef.current = fresh;
      dispatch({ type: 'RESET', snapshot: fresh });
    }
    wasOpenRef.current = open ?? false;
  }, [open]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<equipGroup>>(
    new Set()
  );
  const [reorderMode, setReorderMode] = useState(false);

  const orderedItems = useMemo<Equipment[]>(() => {
    const byId = new Map<string, Equipment>();
    flattenEquipments(staged.equipments).forEach((eq) => {
      if (eq.id) byId.set(eq.id, eq);
    });
    const ordered = staged.displayOrder
      .map((id) => byId.get(id))
      .filter((eq): eq is Equipment => Boolean(eq));
    // Defensive: include any item not yet in displayOrder (shouldn't happen
    // because reducer keeps it in sync, but covers race conditions).
    flattenEquipments(staged.equipments).forEach((eq) => {
      if (eq.id && !staged.displayOrder.includes(eq.id)) ordered.push(eq);
    });
    return ordered;
  }, [staged.equipments, staged.displayOrder]);

  const totals = useMemo<BackpackDerivedTotals>(() => {
    const itemSpaces = orderedItems.reduce(
      (acc, item) => acc + (item.spaces ?? 0) * (item.quantity ?? 1),
      0
    );
    const currencySpaces = calculateCurrencySpaces(
      staged.money.dinheiro,
      staged.money.dinheiroTC,
      staged.money.dinheiroTO
    );
    const totalSpaces = itemSpaces + currencySpaces;
    const maxSpaces = staged.customMaxSpaces ?? calculateMaxSpaces(forca);
    const { overflowItemIds, overflowStartIndex } = computeOverflow(
      orderedItems,
      maxSpaces - currencySpaces
    );
    return {
      itemSpaces,
      currencySpaces,
      totalSpaces,
      maxSpaces,
      isOverloaded: totalSpaces > maxSpaces,
      overflowItemIds,
      overflowStartIndex,
    };
  }, [orderedItems, staged.money, staged.customMaxSpaces, forca]);

  const filteredItems = useMemo(() => {
    const q = normalize(searchQuery);
    return orderedItems.filter((item) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(item.group)) {
        return false;
      }
      if (q.length === 0) return true;
      const display = item.customDisplayName || item.nome;
      return (
        normalize(display).includes(q) ||
        (item.descricao ? normalize(item.descricao).includes(q) : false)
      );
    });
  }, [orderedItems, searchQuery, selectedCategories]);

  const toggleCategoryFilter = (category: equipGroup) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const resetCategoryFilters = () => setSelectedCategories(new Set());

  const isDirty = useMemo(() => {
    if (staged.autoDeductMoney !== initialSnapshot.autoDeductMoney) return true;
    if (staged.customMaxSpaces !== initialSnapshot.customMaxSpaces) return true;
    if (
      staged.money.dinheiro !== initialSnapshot.money.dinheiro ||
      staged.money.dinheiroTC !== initialSnapshot.money.dinheiroTC ||
      staged.money.dinheiroTO !== initialSnapshot.money.dinheiroTO
    ) {
      return true;
    }
    if (
      staged.mainHandItemId !== initialSnapshot.mainHandItemId ||
      staged.offHandItemId !== initialSnapshot.offHandItemId ||
      staged.wornArmorId !== initialSnapshot.wornArmorId ||
      staged.groupByCategory !== initialSnapshot.groupByCategory
    ) {
      return true;
    }
    if (staged.displayOrder.length !== initialSnapshot.displayOrder.length) {
      return true;
    }
    for (let i = 0; i < staged.displayOrder.length; i += 1) {
      if (staged.displayOrder[i] !== initialSnapshot.displayOrder[i])
        return true;
    }
    return staged.equipments !== initialSnapshot.equipments;
  }, [staged, initialSnapshot]);

  const addItem = useCallback(
    (item: Equipment, options?: { quantity?: number }) =>
      dispatch({
        type: 'ADD_ITEM',
        item,
        quantity: options?.quantity ?? 1,
      }),
    []
  );

  const removeItem = useCallback(
    (id: string) => {
      // Find the item before dispatching so we can return it.
      let candidate: Equipment | null = null;
      flattenEquipments(staged.equipments).forEach((eq) => {
        if (eq.id === id) candidate = eq;
      });
      dispatch({ type: 'REMOVE_ITEM', id });
      return candidate;
    },
    [staged.equipments]
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      dispatch({ type: 'SET_QUANTITY', id, quantity }),
    []
  );

  const updateItem = useCallback(
    (id: string, next: Equipment) =>
      dispatch({ type: 'UPDATE_ITEM', id, next }),
    []
  );

  const setMoney = useCallback(
    (money: Partial<BackpackMoney>) => dispatch({ type: 'SET_MONEY', money }),
    []
  );

  const setCustomMaxSpaces = useCallback(
    (value: number | undefined) =>
      dispatch({ type: 'SET_CUSTOM_MAX_SPACES', value }),
    []
  );

  const setAutoDeductMoney = useCallback(
    (value: boolean) => dispatch({ type: 'SET_AUTO_DEDUCT', value }),
    []
  );

  const reorder = useCallback(
    (orderedIds: string[]) => dispatch({ type: 'REORDER', orderedIds }),
    []
  );

  const setWielding = useCallback(
    (itemId: string, slot: WieldingSlot) =>
      dispatch({ type: 'SET_WIELDING', itemId, slot }),
    []
  );

  const setWornArmor = useCallback(
    (itemId: string | null) => dispatch({ type: 'SET_WORN_ARMOR', itemId }),
    []
  );

  const setGroupByCategory = useCallback(
    (value: boolean) => dispatch({ type: 'SET_GROUP_BY_CATEGORY', value }),
    []
  );

  const revertChanges = useCallback(
    () => dispatch({ type: 'RESET', snapshot: initialSnapshot }),
    [initialSnapshot]
  );

  return {
    orderedItems,
    filteredItems,
    totals,
    filters: { searchQuery, selectedCategories },
    setSearchQuery,
    toggleCategoryFilter,
    resetCategoryFilters,
    reorderMode,
    setReorderMode,
    staged,
    isDirty,
    addItem,
    removeItem,
    setQuantity,
    updateItem,
    setMoney,
    setCustomMaxSpaces,
    setAutoDeductMoney,
    reorder,
    setWielding,
    setWornArmor,
    setGroupByCategory,
    revertChanges,
  };
}
