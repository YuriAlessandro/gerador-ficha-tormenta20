import { cloneDeep, differenceBy, isArray, merge, mergeWith } from 'lodash';
import { v4 as uuid } from 'uuid';
import Equipment, { BagEquipments, equipGroup } from './Equipment';
import {
  calcAmmoSpaces,
  seedAmmoUnits,
} from '../components/SheetResult/BackpackModal/ammo';

// Canonical list of category keys. Iterating these (instead of `Object.values`)
// makes the Bag resilient to callers who pass wrapper objects with extra
// properties (some legacy test mocks do this).
const BAG_CATEGORIES: equipGroup[] = [
  'Arma',
  'Armadura',
  'Escudo',
  'Item Geral',
  'Alquimía',
  'Esotérico',
  'Vestuário',
  'Hospedagem',
  'Alimentação',
  'Animal',
  'Veículo',
  'Serviço',
];

const emptyEquipments: BagEquipments = {
  'Item Geral': [],
  Alimentação: [],
  Alquimía: [],
  Animal: [],
  Arma: [],
  Armadura: [],
  Escudo: [],
  Esotérico: [],
  Hospedagem: [],
  Serviço: [],
  Vestuário: [],
  Veículo: [],
};

const defaultEquipments: BagEquipments = {
  ...emptyEquipments,
  'Item Geral': [
    {
      nome: 'Mochila',
      group: 'Item Geral',
      spaces: 0,
    },
    {
      nome: 'Saco de dormir',
      group: 'Item Geral',
      spaces: 1,
    },
    {
      nome: 'Traje de viajante',
      group: 'Item Geral',
      spaces: 0,
    },
  ],
};

function flattenEquipments(bagEquipments: BagEquipments): Equipment[] {
  const out: Equipment[] = [];
  BAG_CATEGORIES.forEach((category) => {
    const list = bagEquipments[category];
    if (!Array.isArray(list)) return;
    list.forEach((eq) => {
      if (eq && typeof eq === 'object') out.push(eq);
    });
  });
  return out;
}

function calcBagSpaces(bagEquipments: BagEquipments): number {
  let spaces = 0;

  flattenEquipments(bagEquipments).forEach((equipment) => {
    if (equipment.isAmmo) {
      spaces += calcAmmoSpaces(equipment);
      return;
    }
    const equipamentSpaces = equipment.spaces || 0;
    const qty = equipment.quantity || 1;
    spaces += equipamentSpaces * qty;
  });

  return spaces;
}

function calcArmorPenalty(equipments: BagEquipments): number {
  const armorPenalty = equipments.Armadura.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  const shieldPenalty = equipments.Escudo.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  return armorPenalty + shieldPenalty;
}

/**
 * Mutates the bag in place to assign a stable UUID to every equipment that lacks one.
 * The Bag's runtime invariant is that every stored item has an `id`.
 */
export function ensureIds(bagEquipments: BagEquipments): void {
  flattenEquipments(bagEquipments).forEach((equipment) => {
    if (!equipment.id) {
      // eslint-disable-next-line no-param-reassign
      equipment.id = uuid();
    }
  });
}

/**
 * Reconciles a desired display order against the current bag contents.
 * Keeps known ids in their previous order, drops missing ones, appends unknown ids
 * at the end (in iteration order over BagEquipments).
 */
export function reconcileDisplayOrder(
  bagEquipments: BagEquipments,
  previous?: string[]
): string[] {
  const existingIds = new Set<string>();
  flattenEquipments(bagEquipments).forEach((eq) => {
    if (eq.id) existingIds.add(eq.id);
  });

  const result: string[] = [];
  const seen = new Set<string>();

  if (previous) {
    previous.forEach((id) => {
      if (existingIds.has(id) && !seen.has(id)) {
        result.push(id);
        seen.add(id);
      }
    });
  }

  flattenEquipments(bagEquipments).forEach((eq) => {
    if (eq.id && !seen.has(eq.id)) {
      result.push(eq.id);
      seen.add(eq.id);
    }
  });

  return result;
}

export default class Bag {
  public equipments: BagEquipments;

  public spaces: number;

  public armorPenalty: number;

  public displayOrder: string[];

  /**
   * @param equipments  partial BagEquipments to merge over defaults
   * @param skipDefaults  when true, starts from emptyEquipments (no Mochila/Saco/Traje injected)
   * @param displayOrder  optional previous display order (preserved on rehydration)
   */
  constructor(equipments = {}, skipDefaults = false, displayOrder?: string[]) {
    const base = skipDefaults ? emptyEquipments : defaultEquipments;
    this.equipments = merge(cloneDeep(base), equipments);

    ensureIds(this.equipments);
    seedAmmoUnits(this.equipments);

    this.displayOrder = reconcileDisplayOrder(this.equipments, displayOrder);
    this.spaces = calcBagSpaces(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public setEquipments(equipments: BagEquipments): void {
    this.equipments = equipments;
    ensureIds(this.equipments);
    seedAmmoUnits(this.equipments);
    this.displayOrder = reconcileDisplayOrder(
      this.equipments,
      this.displayOrder
    );
    this.spaces = calcBagSpaces(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public getEquipments(): BagEquipments {
    return this.equipments;
  }

  public getSpaces(): number {
    return this.spaces;
  }

  public getArmorPenalty(): number {
    return this.armorPenalty;
  }

  /**
   * Returns the armor-penalty considering only the worn armor and the
   * shield(s) currently in a hand slot.
   *
   *  - Armor: the one matching `wornArmorId` applies; with a legacy fallback
   *    where exactly 1 armor in the bag and no `wornArmorId` selection still
   *    counts as worn.
   *  - Shield: only counts when assigned to a hand slot. A shield kept in the
   *    bag without being wielded contributes 0 penalty.
   *
   * @param wornArmorId  id of the worn armor; when undefined and the bag has
   *                     exactly 1 armor, that armor is treated as worn.
   * @param mainHandItemId  current main-hand id (shield or weapon).
   * @param offHandItemId   current off-hand id.
   */
  public getActiveArmorPenalty(
    wornArmorId?: string,
    mainHandItemId?: string,
    offHandItemId?: string
  ): number {
    const armors = this.equipments.Armadura;
    let armorPenalty = 0;
    if (wornArmorId !== undefined) {
      const worn = armors.find((a) => a.id === wornArmorId);
      if (worn) armorPenalty = worn.armorPenalty;
    } else if (armors.length === 1) {
      // Legacy compat: single armor without explicit selection still applies.
      armorPenalty = armors[0].armorPenalty;
    }

    let shieldPenalty = 0;
    this.equipments.Escudo.forEach((shield) => {
      const inHand =
        shield.id !== undefined &&
        (shield.id === mainHandItemId || shield.id === offHandItemId);
      if (inHand) shieldPenalty += shield.armorPenalty;
    });

    return armorPenalty + shieldPenalty;
  }

  /**
   * Returns all equipments as a flat array in the user-defined display order.
   * Items without an id (should not happen in practice — see `ensureIds`) are skipped.
   */
  public getOrderedEquipments(): Equipment[] {
    const byId = new Map<string, Equipment>();
    flattenEquipments(this.equipments).forEach((eq) => {
      if (eq.id) byId.set(eq.id, eq);
    });

    return this.displayOrder
      .map((id) => byId.get(id))
      .filter((eq): eq is Equipment => Boolean(eq));
  }

  public setDisplayOrder(ids: string[]): void {
    this.displayOrder = reconcileDisplayOrder(this.equipments, ids);
  }

  /**
   * Moves the equipment with the given id to a new position in the global display order.
   * Out-of-range positions are clamped.
   */
  public moveItem(id: string, toIndex: number): void {
    const ids = [...this.displayOrder];
    const from = ids.indexOf(id);
    if (from === -1) return;

    const [moved] = ids.splice(from, 1);
    const clamped = Math.max(0, Math.min(toIndex, ids.length));
    ids.splice(clamped, 0, moved);

    this.displayOrder = ids;
  }

  public addEquipment(equipments: Partial<BagEquipments>): void {
    const newEquipments = mergeWith(
      this.equipments,
      equipments,
      (oldEquips: Equipment[], newEquips: Equipment[]) => {
        if (isArray(oldEquips))
          return newEquips.concat(differenceBy(oldEquips, newEquips, 'nome'));

        return undefined;
      }
    );

    this.setEquipments(newEquipments);
  }
}
