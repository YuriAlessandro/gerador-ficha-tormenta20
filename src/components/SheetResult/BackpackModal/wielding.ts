import Equipment, {
  BagEquipments,
  equipGroup,
} from '../../../interfaces/Equipment';

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
 * Plus any item explicitly flagged via `canBeUsedAsWeapon` (e.g. Tocha).
 *
 * `canBeWielded` é um override de três estados: `true` força empunhável
 * (varinhas, catalisadores custom), `false` força NÃO empunhável e `undefined`
 * cai na regra por grupo. O `false` existe para itens virtuais que não estão na
 * mochila — armas naturais da Forma Selvagem — cujo id não pode ser gravado em
 * `mainHandItemId`/`offHandItemId` (ficaria pendurado ao reverter a forma).
 */
export function isWieldable(item: Equipment): boolean {
  if (item.canBeWielded === false) return false;
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
 * Sentinel `wornArmorId` value meaning "the player explicitly removed all
 * armor". Needed because `undefined` is overloaded: it ALSO means "never
 * chosen, fall back to the single armor in the bag". Without this sentinel,
 * a player owning exactly 1 armor could never take it off — clearing the
 * selection to `undefined` would immediately re-apply the legacy fallback.
 *
 * It is a constant string (never a real item id, which are uuids), so it
 * flows transparently through every `wornArmorId ? find() : ...` resolver:
 * being truthy it skips the `!wornArmorId` legacy branch, and matching no
 * item id it resolves to "no armor worn".
 */
export const WORN_ARMOR_NONE = '__none__';

/**
 * Resolves the worn armor for a sheet. Rules:
 *  - When `wornArmorId` is the WORN_ARMOR_NONE sentinel → undefined
 *    (the player explicitly took off their armor).
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
  if (wornArmorId === WORN_ARMOR_NONE) return undefined;
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
 * Escolhe a mão para "empunhar automaticamente" (atalho Empunhar e atacar).
 * Regras, nesta ordem:
 *  - item não empunhável (armas naturais da Forma Selvagem) → null;
 *  - arma de duas mãos → 'both';
 *  - item já empunhado → mantém o slot atual (no-op);
 *  - arma de 2 mãos ocupando as duas → 'main' (troca);
 *  - mão principal livre → 'main';
 *  - principal ocupada por OUTRO item e secundária livre → 'off';
 *  - ambas ocupadas → substitui a principal, salvo quando ela tem um escudo e
 *    a secundária não (aí substitui a secundária, para não desarmar a defesa
 *    sem o jogador pedir).
 *
 * Substituir um escudo é permitido, mas nunca preferido: bloquear faria o
 * atalho silenciosamente não fazer nada, o que é pior.
 *
 * `lookup` é opcional; sem ele a regra do escudo não roda (só o fallback).
 */
export function pickDefaultWieldSlot(
  state: WieldingState,
  item: Equipment,
  lookup?: (id: string) => Equipment | undefined
): WieldingSlot {
  if (!item.id) return null;
  if (!isWieldable(item)) return null;
  if (isTwoHanded(item)) return 'both';

  const current = getWieldingSlot(item.id, state);
  if (current !== null) return current;

  const { mainHandItemId, offHandItemId } = state;
  // Arma de duas mãos ocupando os dois slots: a troca começa pela principal
  // (o `applyWielding` limpa o outro slot sozinho).
  if (mainHandItemId !== undefined && mainHandItemId === offHandItemId) {
    return 'main';
  }
  if (mainHandItemId === undefined) return 'main';
  if (offHandItemId === undefined) return 'off';

  const isShield = (id: string): boolean => lookup?.(id)?.group === 'Escudo';
  if (isShield(mainHandItemId) && !isShield(offHandItemId)) return 'off';
  return 'main';
}

/**
 * Item carrega algum efeito mecânico na ficha? Usado por `canSplitStack` (que
 * recusa dividir a pilha porque `applyEquipmentBonuses` soma por ENTRADA e não
 * por `quantity`) e pela UI, que só sinaliza "Guardado" quando guardar de fato
 * muda algum número.
 */
export function hasMechanicalBonus(item: Equipment): boolean {
  if (item.sheetBonuses && item.sheetBonuses.length > 0) return true;
  if (item.conditionalBonuses && item.conditionalBonuses.length > 0) {
    return true;
  }
  return item.selectableBonus !== undefined;
}

/**
 * Itens não-custom empilham por nome numa única entrada (`quantity`), então
 * duas Machadinhas compartilham um id — e um id nos dois slots significa "arma
 * de duas mãos" em toda a base (getWieldingSlot, calcDefense, dualWielding,
 * Estilo de Uma Arma...). Em vez de reinterpretar esse invariante, dividimos a
 * pilha: a cópia ganha id próprio e todos os consumidores continuam corretos.
 *
 * Recusa itens que carregam bônus porque `applyEquipmentBonuses` soma por
 * ENTRADA e não por quantidade — duplicar a entrada dobraria o bônus.
 */
export function canSplitStack(item: Equipment): boolean {
  if (item.isAmmo) return false;
  if ((item.quantity ?? 1) < 2) return false;
  return !hasMechanicalBonus(item);
}

/**
 * Duas entradas representam exatamente o mesmo item de catálogo? Usado para
 * refundir as cópias criadas pelo split quando o jogador solta uma delas.
 * Conservador de propósito: qualquer customização impede a fusão.
 */
export function canMergeStacks(a: Equipment, b: Equipment): boolean {
  if (a.id === b.id) return false;
  if (a.group !== b.group || a.nome !== b.nome) return false;
  if (a.isCustom || b.isCustom || a.isAmmo || b.isAmmo) return false;
  if (a.hasManualEdits || b.hasManualEdits) return false;
  if (a.customDisplayName || b.customDisplayName) return false;
  if (a.descricao !== b.descricao) return false;
  const empty = (arr?: unknown[]): boolean => !arr || arr.length === 0;
  return (
    empty(a.modifications) &&
    empty(b.modifications) &&
    empty(a.enchantments) &&
    empty(b.enchantments) &&
    empty(a.extraDamage) &&
    empty(b.extraDamage) &&
    empty(a.sheetBonuses) &&
    empty(b.sheetBonuses)
  );
}

function flattenBagEquipments(equipments: BagEquipments): Equipment[] {
  return (Object.keys(equipments) as equipGroup[]).reduce<Equipment[]>(
    (acc, cat) => {
      const list = equipments[cat];
      if (Array.isArray(list)) acc.push(...(list as Equipment[]));
      return acc;
    },
    []
  );
}

export interface WieldingCommitInput {
  equipments: BagEquipments;
  displayOrder: string[];
  state: WieldingState;
  itemId: string;
  slot: WieldingSlot;
  /**
   * Id da cópia quando houver split. Injetado pelo chamador (uuid) para que
   * `commitWielding` continue pura e testável.
   */
  newId: string;
}

export interface WieldingCommitResult extends WieldingState {
  equipments: BagEquipments;
  displayOrder: string[];
  /** true quando equipments/displayOrder mudaram (split ou refusão). */
  bagChanged: boolean;
}

/**
 * Ponto único de escrita de empunhadura. Existem dois caminhos na UI (o
 * reducer da Mochila e o atalho da aba Ataques); ambos passam por aqui, para
 * que o split de pilha, a refusão e os guards de escudo valham nos dois.
 *
 * Ordem: split (se o item já ocupa a outra mão e a pilha comporta) →
 * `applyWielding` com lookup → refusão das cópias órfãs.
 */
export function commitWielding(
  input: WieldingCommitInput
): WieldingCommitResult {
  const { state, itemId, slot, newId } = input;
  let { equipments, displayOrder } = input;
  let bagChanged = false;

  const target = flattenBagEquipments(equipments).find(
    (it) => it.id === itemId
  );

  // --- Split: o item já está na OUTRA mão e a pilha tem cópias sobrando.
  let effectiveId = itemId;
  if (
    target &&
    (slot === 'main' || slot === 'off') &&
    canSplitStack(target) &&
    (getWieldingSlot(itemId, state) === 'main' ||
      getWieldingSlot(itemId, state) === 'off') &&
    getWieldingSlot(itemId, state) !== slot
  ) {
    const cat = target.group;
    const list = (equipments[cat] ?? []) as Equipment[];
    const idx = list.findIndex((it) => it.id === itemId);
    if (idx >= 0) {
      const copy: Equipment = { ...target, id: newId, quantity: 1 };
      const decremented: Equipment = {
        ...target,
        quantity: (target.quantity ?? 1) - 1,
      };
      equipments = { ...equipments };
      // A cópia entra logo após a original: as duas leem como par na Mochila e
      // o drag-reorder continua intuitivo.
      equipments[cat] = [
        ...list.slice(0, idx),
        decremented,
        copy,
        ...list.slice(idx + 1),
      ] as never;
      const orderIdx = displayOrder.indexOf(itemId);
      displayOrder =
        orderIdx >= 0
          ? [
              ...displayOrder.slice(0, orderIdx + 1),
              newId,
              ...displayOrder.slice(orderIdx + 1),
            ]
          : [...displayOrder, newId];
      effectiveId = newId;
      bagChanged = true;
    }
  }

  const flattened = flattenBagEquipments(equipments);
  const lookup = (id: string): Equipment | undefined =>
    flattened.find((it) => it.id === id);

  const next = applyWielding(state, effectiveId, slot, lookup);

  // --- Refusão: uma cópia ficou sem mão nenhuma, então volta para a pilha.
  // Roda só para o item tocado, nunca como varredura de fundo.
  if (target) {
    const cat = target.group;
    const list = (equipments[cat] ?? []) as Equipment[];
    const sameName = list.filter(
      (it) => it.nome === target.nome && it.group === target.group
    );
    const isWielded = (it: Equipment): boolean =>
      it.id !== undefined &&
      (it.id === next.mainHandItemId || it.id === next.offHandItemId);

    let mergedInto: Equipment | undefined;
    let mergedFrom: Equipment | undefined;
    sameName.forEach((a) => {
      if (mergedFrom) return;
      sameName.forEach((b) => {
        if (mergedFrom) return;
        if (a === b || !canMergeStacks(a, b)) return;
        // Absorve a entrada que ficou sem mão, preservando o id da empunhada
        // (a referência do slot precisa sobreviver).
        if (!isWielded(b)) {
          mergedInto = a;
          mergedFrom = b;
        } else if (!isWielded(a)) {
          mergedInto = b;
          mergedFrom = a;
        }
      });
    });

    if (mergedInto && mergedFrom) {
      const from = mergedFrom as Equipment;
      const into = mergedInto as Equipment;
      const fused: Equipment = {
        ...into,
        quantity: (into.quantity ?? 1) + (from.quantity ?? 1),
      };
      equipments = { ...equipments };
      equipments[cat] = list
        .filter((it) => it.id !== from.id)
        .map((it) => (it.id === into.id ? fused : it)) as never;
      displayOrder = displayOrder.filter((id) => id !== from.id);
      bagChanged = true;
    }
  }

  return {
    mainHandItemId: next.mainHandItemId,
    offHandItemId: next.offHandItemId,
    equipments,
    displayOrder,
    bagChanged,
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

/**
 * Peça de vestuário — o único grupo, além de Armadura, com estado
 * vestido/guardado. Vestuário nunca é empunhável (ver `isWieldable`), então os
 * dois controles da mochila são mutuamente exclusivos.
 */
export function isClothing(item: Equipment): boolean {
  return item.group === 'Vestuário';
}

/**
 * A peça está vestida? `unwornClothingIds` é um conjunto de OPT-OUT: sem
 * conjunto (ficha legada) ou id fora dele = vestida. Item sem id nunca pôde ser
 * guardado, então também conta como vestido — nunca perder bônus por acidente.
 */
export function isClothingWorn(
  itemId: string | undefined,
  unwornClothingIds: string[] | undefined
): boolean {
  if (!itemId) return true;
  if (!unwornClothingIds) return true;
  return !unwornClothingIds.includes(itemId);
}

/**
 * Novo conjunto de guardados ao vestir (`worn = true`) ou guardar
 * (`worn = false`) uma peça. Devolve `undefined` quando o resultado ficaria
 * vazio, para a ficha voltar ao estado "nada guardado" e não sujar o payload.
 *
 * NÃO reordena: `computeSheetDelta` compara por `JSON.stringify`, então manter
 * a ordem de inserção evita delta espúrio a cada save.
 */
export function applyClothingWorn(
  current: string[] | undefined,
  itemId: string,
  worn: boolean
): string[] | undefined {
  const list = current ?? [];
  if (worn) {
    if (!list.includes(itemId)) return current;
    const next = list.filter((id) => id !== itemId);
    return next.length > 0 ? next : undefined;
  }
  if (list.includes(itemId)) return current;
  return [...list, itemId];
}

/**
 * Descarta ids de peças que não estão mais na mochila. Espelho de
 * `pruneWielding`, usado no snapshot da modal.
 */
export function pruneUnwornClothing(
  current: string[] | undefined,
  existingItemIds: Set<string>
): string[] | undefined {
  if (!current) return undefined;
  const next = current.filter((id) => existingItemIds.has(id));
  if (next.length === 0) return undefined;
  return next.length === current.length ? current : next;
}
