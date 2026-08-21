import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { v4 as uuid } from 'uuid';

import Bag, {
  ensureIds,
  getItemSpaces,
  reconcileDisplayOrder,
} from '../../../interfaces/Bag';
import Equipment, {
  BagEquipments,
  equipGroup,
} from '../../../interfaces/Equipment';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import {
  calculateCurrencySpaces,
  calculateMaxSpaces,
  getEquipmentMaxSpacesBonus,
} from '../../../functions/general';
import {
  applyClothingWorn,
  commitWielding,
  isTwoHanded,
  migrateLegacyEquipState,
  pruneUnwornClothing,
  pruneWielding,
  WieldingSlot,
  WORN_ARMOR_NONE,
} from './wielding';
import { isStackable } from './stacking';

export interface BackpackMoney {
  dinheiro: number;
  dinheiroTC: number;
  dinheiroTO: number;
}

interface StagedState {
  equipments: BagEquipments;
  displayOrder: string[];
  money: BackpackMoney;
  maxSpacesAttribute: Atributo;
  customMaxSpaces?: number;
  autoDeductMoney: boolean;
  /**
   * Quanto de cada item foi efetivamente PAGO nesta sessão do modal. A chave é
   * o id da entrada na mochila; o valor está na MESMA unidade que o débito
   * usou — itens para item comum, PACOTES para munição.
   *
   * É o único gatilho de reembolso: consumir uma poção que o personagem já
   * tinha não devolve dinheiro que nunca saiu do bolso. Mesma regra do
   * `purchasedIds` do MarketStep (ver `MarketSelections`), mas contando
   * unidades em vez de ids — aqui a mochila JÁ EXISTE quando o modal abre e os
   * itens EMPILHAM, então uma mesma pilha pode ter parte paga e parte não.
   *
   * Nasce vazio a cada abertura do modal (`buildSnapshot`): é isso que torna
   * tudo que já estava na mochila irreembolsável.
   */
  paidUnits: Record<string, number>;
  mainHandItemId?: string;
  offHandItemId?: string;
  wornArmorId?: string;
  /**
   * Peças de Vestuário GUARDADAS (conjunto de opt-out — ver
   * `CharacterSheet.unwornClothingIds`). `undefined` = tudo vestido.
   */
  unwornClothingIds?: string[];
  groupByCategory: boolean;
}

export interface BackpackInputs {
  bag: Bag;
  initialMoney: BackpackMoney;
  maxSpacesAttribute: Atributo;
  attributeValues: Record<Atributo, number>;
  initialCustomMaxSpaces?: number;
  /** Default for the auto-deduct toggle when entering the modal. */
  initialAutoDeductMoney?: boolean;
  initialMainHandItemId?: string;
  initialOffHandItemId?: string;
  initialWornArmorId?: string;
  initialUnwornClothingIds?: string[];
  initialGroupByCategory?: boolean;
  /**
   * Categories to pre-select in the filter when the modal opens. The user can
   * still toggle/clear them via the toolbar; this only seeds the initial state
   * (and is reapplied each time the modal transitions from closed to open, so
   * reopening from a different entry point picks up the new context).
   */
  initialCategoryFilters?: equipGroup[];
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
  setMaxSpacesAttribute: (attribute: Atributo) => void;
  setCustomMaxSpaces: (value: number | undefined) => void;
  setAutoDeductMoney: (value: boolean) => void;
  /** Reorders by item id (used by drag-and-drop in PR 6). */
  reorder: (orderedIds: string[]) => void;
  /** Assigns or clears an item's hand slot. Mutually exclusive across slots. */
  setWielding: (itemId: string, slot: WieldingSlot) => void;
  /** Sets which armor is currently worn. Pass `null` to unwear. */
  setWornArmor: (itemId: string | null) => void;
  /** Veste (`worn = true`) ou guarda na mochila uma peça de Vestuário. */
  setWornClothing: (itemId: string, worn: boolean) => void;
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
    cumulative += getItemSpaces(item);
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
  | { type: 'SET_MAX_SPACES_ATTRIBUTE'; attribute: Atributo }
  | { type: 'SET_CUSTOM_MAX_SPACES'; value: number | undefined }
  | { type: 'SET_AUTO_DEDUCT'; value: boolean }
  | { type: 'REORDER'; orderedIds: string[] }
  | { type: 'SET_WIELDING'; itemId: string; slot: WieldingSlot }
  | { type: 'SET_WORN_ARMOR'; itemId: string | null }
  | { type: 'SET_WORN_CLOTHING'; itemId: string; worn: boolean }
  | { type: 'SET_GROUP_BY_CATEGORY'; value: boolean }
  | { type: 'RESET'; snapshot: StagedState };

/** Todos os ids já ocupados na mochila, em todas as categorias. */
function collectIds(equipments: BagEquipments): Set<string> {
  const ids = new Set<string>();
  (Object.keys(equipments) as equipGroup[]).forEach((cat) => {
    const list = equipments[cat];
    if (!Array.isArray(list)) return;
    list.forEach((it) => {
      if (it.id) ids.add(it.id);
    });
  });
  return ids;
}

/**
 * Garante que o item entre na mochila com identidade PRÓPRIA.
 *
 * Duas armadilhas justificam o clone e o id novo:
 *
 * 1. `AddItemDialog` entrega o objeto do catálogo por referência, e o catálogo
 *    é compartilhado e cacheado (ver aviso em `registry.getEquipmentBySupplements`).
 *    Guardar essa referência na mochila faz a edição de um item vazar para o
 *    catálogo — e para toda ficha que adicione o mesmo item depois.
 * 2. Se o objeto do catálogo já carrega um `id` (contaminado por um `ensureIds`
 *    anterior), reusá-lo cria DUAS entradas com o mesmo id. Empunhadura, edição
 *    e remoção resolvem por id, então as duas entradas passam a agir como uma:
 *    empunhar uma empunha a outra, editar não salva, e a chave React duplicada
 *    faz uma delas desaparecer da lista enquanto os espaços seguem somando.
 */
function ensureUniqueId(item: Equipment, taken: Set<string>): Equipment {
  if (item.id && !taken.has(item.id)) return { ...item };
  return { ...item, id: uuid() };
}

/**
 * Adds an item to the proper category bucket. Stacks by name when adding a
 * non-custom catalog item that already exists AND both sides are
 * interchangeable (ver `isStackable`); otherwise appends. Armor and
 * shields are no longer single-item — multiple may coexist; only the worn
 * armor and the wielded shield apply their bonuses to the sheet.
 *
 * Returns the id of the item that ended up in the bag (existing stack id when
 * merged, fresh id otherwise) so the caller can auto-wield/auto-wear etc.
 *
 * Exportada para teste — o merge é a única via de perda de dados da mochila.
 */
export function addItemToEquipments(
  equipments: BagEquipments,
  displayOrder: string[],
  itemRaw: Equipment,
  quantity: number
): { equipments: BagEquipments; displayOrder: string[]; addedId?: string } {
  const item = ensureUniqueId(itemRaw, collectIds(equipments));
  const next: BagEquipments = { ...equipments };
  const nextOrder = [...displayOrder];

  const list = (next[item.group] ?? []) as Equipment[];
  // Stack by name when a non-custom catalog item is added. Itens encantados,
  // modificados, apelidados ou editados à mão nunca empilham — o merge
  // preserva `existing` e descartaria as diferenças do outro lado.
  const existingIdx = list.findIndex(
    (it) =>
      it.nome === item.nome &&
      !it.isCustom &&
      !item.isCustom &&
      isStackable(it) &&
      isStackable(item)
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

/**
 * Quantas "unidades de compra" o item representa HOJE — a mesma unidade em que
 * o débito foi cobrado, para poder comparar com `paidUnits`.
 *
 * Item comum conta por `quantity`. Munição conta por PACOTES FECHADOS: um
 * pacote parcialmente gasto não volta pra loja, então `floor` (e não `ceil`,
 * que devolvia um pacote cheio por 1 flecha sobrando).
 */
function purchaseUnits(item: Equipment): number {
  if (item.isAmmo) {
    const packSize = item.ammoPackSize ?? 20;
    return Math.floor((item.unitsRemaining ?? 0) / packSize);
  }
  return item.quantity ?? 1;
}

/** Soma `delta` ao crédito pago de `id`, descartando a chave ao chegar em zero. */
function bumpPaidUnits(
  paidUnits: Record<string, number>,
  id: string,
  delta: number
): Record<string, number> {
  const next = { ...paidUnits };
  const value = (next[id] ?? 0) + delta;
  if (value > 0) next[id] = value;
  else delete next[id];
  return next;
}

/**
 * Exportados para teste — a contabilidade de dinheiro da mochila (débito na
 * compra, reembolso só do que foi pago) não tem como ser exercitada pela UI
 * neste projeto: React 17 + @testing-library/react v11 não têm `renderHook`.
 */
export type BackpackStagedState = StagedState;
export type BackpackAction = Action;

export function reducer(state: StagedState, action: Action): StagedState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { equipments, displayOrder, addedId } = addItemToEquipments(
        state.equipments,
        state.displayOrder,
        action.item,
        Math.max(1, action.quantity)
      );
      let { money, paidUnits } = state;
      if (state.autoDeductMoney && action.item.preco) {
        const cost = action.item.preco * action.quantity;
        money = { ...money, dinheiro: money.dinheiro - cost };
        // Registra a procedência para que SÓ essa parte reembolse depois. No
        // merge, `addedId` é o id da pilha JÁ existente — de propósito: 3 poções
        // antigas + 2 compradas viram uma pilha com `paidUnits = 2`.
        if (addedId) {
          paidUnits = bumpPaidUnits(paidUnits, addedId, action.quantity);
        }
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

      // Auto-vestir peça de Vestuário. O default já é "vestida" (o conjunto é
      // de opt-out), mas o merge de pilha pode cair numa entrada GUARDADA — uma
      // 2ª Bandana somada a uma Bandana guardada. Vestir explicitamente evita
      // que a peça recém-comprada nasça sem efeito.
      let { unwornClothingIds } = state;
      if (action.item.group === 'Vestuário' && addedId) {
        unwornClothingIds = applyClothingWorn(unwornClothingIds, addedId, true);
      }

      return {
        ...state,
        equipments,
        displayOrder,
        money,
        paidUnits,
        mainHandItemId,
        offHandItemId,
        wornArmorId,
        unwornClothingIds,
      };
    }
    case 'REMOVE_ITEM': {
      const { equipments, displayOrder, removed } = removeItemFromEquipments(
        state.equipments,
        state.displayOrder,
        action.id
      );
      let { money, paidUnits } = state;
      // O gate é a PROCEDÊNCIA, não o toggle: só devolve o que foi comprado
      // nesta sessão do modal. Apagar/consumir um item que o personagem já
      // possuía não gera mais dinheiro do nada (era o bug de "consumir = vender").
      //
      // O toggle não entra aqui de propósito: `paidUnits` só é preenchido
      // enquanto ele está ligado, então um crédito nunca devolve mais do que
      // saiu — e comprar, desligar o toggle e desfazer a compra ainda funciona.
      const paid = state.paidUnits[action.id] ?? 0;
      if (paid > 0 && removed?.preco) {
        // `min` com o que de fato está na pilha: `SET_WIELDING` divide pilhas
        // criando um id novo, então uma pilha paga pode encolher sem passar
        // por SET_QUANTITY.
        const refundable = Math.min(paid, purchaseUnits(removed));
        money = {
          ...money,
          dinheiro: money.dinheiro + removed.preco * refundable,
        };
      }
      if (paid > 0) paidUnits = bumpPaidUnits(paidUnits, action.id, -paid);
      // Clear wielding slots if they pointed at the removed item.
      const mainHandItemId =
        state.mainHandItemId === action.id ? undefined : state.mainHandItemId;
      const offHandItemId =
        state.offHandItemId === action.id ? undefined : state.offHandItemId;
      const wornArmorId =
        state.wornArmorId === action.id ? undefined : state.wornArmorId;
      // Higiene de payload: ids são uuid e nunca reusados, mas deixar o id
      // órfão no conjunto sujaria o delta a cada save.
      const unwornClothingIds = applyClothingWorn(
        state.unwornClothingIds,
        action.id,
        true
      );
      return {
        ...state,
        equipments,
        displayOrder,
        money,
        paidUnits,
        mainHandItemId,
        offHandItemId,
        wornArmorId,
        unwornClothingIds,
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
      let { money, paidUnits } = state;
      const delta = Math.max(1, action.quantity) - oldQty;
      if (unitPrice && delta > 0) {
        // Aumentar quantidade é compra: cobra (se o toggle deixar) e registra.
        if (state.autoDeductMoney) {
          money = { ...money, dinheiro: money.dinheiro - delta * unitPrice };
          paidUnits = bumpPaidUnits(paidUnits, action.id, delta);
        }
      } else if (unitPrice && delta < 0) {
        // Diminuir é consumo OU desfazer compra. Só devolve a parte paga —
        // gastar 2 de uma pilha com 1 unidade paga reembolsa 1, não 2.
        const refundable = Math.min(-delta, paidUnits[action.id] ?? 0);
        if (refundable > 0) {
          money = {
            ...money,
            dinheiro: money.dinheiro + refundable * unitPrice,
          };
          paidUnits = bumpPaidUnits(paidUnits, action.id, -refundable);
        }
      }
      return { ...state, equipments, money, paidUnits };
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
    case 'SET_MAX_SPACES_ATTRIBUTE':
      return {
        ...state,
        maxSpacesAttribute: action.attribute,
        customMaxSpaces: undefined,
      };
    case 'SET_CUSTOM_MAX_SPACES':
      return { ...state, customMaxSpaces: action.value };
    case 'SET_AUTO_DEDUCT':
      return { ...state, autoDeductMoney: action.value };
    case 'REORDER':
      return { ...state, displayOrder: action.orderedIds };
    case 'SET_WIELDING': {
      // `commitWielding` também divide a pilha quando o jogador põe a segunda
      // cópia de um item empilhado na outra mão (duas Machadinhas), e refunde
      // quando ele solta uma delas.
      const next = commitWielding({
        equipments: state.equipments,
        displayOrder: state.displayOrder,
        state: {
          mainHandItemId: state.mainHandItemId,
          offHandItemId: state.offHandItemId,
        },
        itemId: action.itemId,
        slot: action.slot,
        newId: uuid(),
      });
      return {
        ...state,
        equipments: next.equipments,
        displayOrder: next.displayOrder,
        mainHandItemId: next.mainHandItemId,
        offHandItemId: next.offHandItemId,
      };
    }
    case 'SET_WORN_ARMOR': {
      // `null` = the player took off their armor. Store the explicit
      // WORN_ARMOR_NONE sentinel rather than `undefined` so the single-armor
      // legacy fallback doesn't immediately re-apply it (see wielding.ts).
      return { ...state, wornArmorId: action.itemId ?? WORN_ARMOR_NONE };
    }
    case 'SET_WORN_CLOTHING': {
      return {
        ...state,
        unwornClothingIds: applyClothingWorn(
          state.unwornClothingIds,
          action.itemId,
          action.worn
        ),
      };
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
  maxSpacesAttribute,
  attributeValues,
  initialCustomMaxSpaces,
  initialAutoDeductMoney = true,
  initialMainHandItemId,
  initialOffHandItemId,
  initialWornArmorId,
  initialUnwornClothingIds,
  initialGroupByCategory = false,
  initialCategoryFilters,
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
    // The WORN_ARMOR_NONE sentinel ("explicitly no armor") is intentionally not
    // a real item id, but it must survive snapshot rebuilds — otherwise a
    // reopened modal would prune it to undefined and re-apply the single-armor
    // legacy fallback, making the armor impossible to take off.
    const wornArmorIsPresent =
      seededWornArmorId !== undefined &&
      (seededWornArmorId === WORN_ARMOR_NONE ||
        existingIds.has(seededWornArmorId));
    return {
      equipments,
      displayOrder,
      money: { ...initialMoney },
      maxSpacesAttribute,
      customMaxSpaces: initialCustomMaxSpaces,
      autoDeductMoney: initialAutoDeductMoney,
      // Sempre vazio: nada que já estava na mochila ao abrir o modal foi pago
      // AQUI, então nada disso reembolsa. É o que impede "consumir = vender".
      paidUnits: {},
      mainHandItemId: pruned.mainHandItemId,
      offHandItemId: pruned.offHandItemId,
      wornArmorId: wornArmorIsPresent ? seededWornArmorId : undefined,
      // Sem sentinela aqui: `undefined` significa só "nada guardado", então
      // basta descartar os ids de peças que saíram da mochila.
      unwornClothingIds: pruneUnwornClothing(
        initialUnwornClothingIds,
        existingIds
      ),
      groupByCategory: initialGroupByCategory,
    };
  };

  const snapshotRef = React.useRef<StagedState | null>(null);
  if (snapshotRef.current === null) {
    snapshotRef.current = buildSnapshot();
  }
  const initialSnapshot = snapshotRef.current;

  const [staged, dispatch] = useReducer(reducer, initialSnapshot);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<equipGroup>>(
    () => new Set(initialCategoryFilters ?? [])
  );

  // Keep latest preset in a ref so the open-transition effect can reapply it
  // without forcing the array prop into the effect's deps (parents pass array
  // literals, which would retrigger on every render).
  const initialCategoryFiltersRef = React.useRef(initialCategoryFilters);
  initialCategoryFiltersRef.current = initialCategoryFilters;

  // Resync the snapshot when the modal opens. Captures any external bag
  // mutations (ammo consumed via attacks, etc.) that happened while the
  // modal was closed.
  const wasOpenRef = React.useRef(open ?? false);
  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      const fresh = buildSnapshot();
      snapshotRef.current = fresh;
      dispatch({ type: 'RESET', snapshot: fresh });
      setSelectedCategories(new Set(initialCategoryFiltersRef.current ?? []));
      setSearchQuery('');
    }
    wasOpenRef.current = open ?? false;
  }, [open]);
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
    // Mesma conta do total da ficha (`bag.getSpaces()`) — antes esta linha
    // divergia dela na munição, e a modal mostrava um total que a ficha não
    // reconhecia.
    const itemSpaces = orderedItems.reduce(
      (acc, item) => acc + getItemSpaces(item),
      0
    );
    const currencySpaces = calculateCurrencySpaces(
      staged.money.dinheiro,
      staged.money.dinheiroTC,
      staged.money.dinheiroTO
    );
    const totalSpaces = itemSpaces + currencySpaces;
    // Itens como a "Mochila de aventureiro" concedem bônus de capacidade
    // (MaxSpaces) sem ocupar espaço — somá-los ao limite para que o limite e o
    // destaque de sobrecarga reajam ao adicionar/remover esses itens.
    const equipMaxSpacesBonus = getEquipmentMaxSpacesBonus(orderedItems);
    const maxSpaces =
      staged.customMaxSpaces ??
      calculateMaxSpaces(attributeValues[staged.maxSpacesAttribute]) +
        equipMaxSpacesBonus;
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
  }, [
    orderedItems,
    staged.money,
    staged.customMaxSpaces,
    staged.maxSpacesAttribute,
    attributeValues,
  ]);

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
    if (staged.maxSpacesAttribute !== initialSnapshot.maxSpacesAttribute) {
      return true;
    }
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
    // Mesmo critério do `computeSheetDelta`, que compara por JSON — por isso
    // `applyClothingWorn` preserva a ordem de inserção.
    if (
      JSON.stringify(staged.unwornClothingIds ?? null) !==
      JSON.stringify(initialSnapshot.unwornClothingIds ?? null)
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

  const setMaxSpacesAttribute = useCallback(
    (attribute: Atributo) =>
      dispatch({ type: 'SET_MAX_SPACES_ATTRIBUTE', attribute }),
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

  const setWornClothing = useCallback(
    (itemId: string, worn: boolean) =>
      dispatch({ type: 'SET_WORN_CLOTHING', itemId, worn }),
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
    setMaxSpacesAttribute,
    setCustomMaxSpaces,
    setAutoDeductMoney,
    reorder,
    setWielding,
    setWornArmor,
    setWornClothing,
    setGroupByCategory,
    revertChanges,
  };
}
