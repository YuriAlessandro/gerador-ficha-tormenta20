import Equipment, {
  AmmoType,
  BagEquipments,
  equipGroup,
} from '../../../interfaces/Equipment';

/** Display-friendly labels for each ammo type. Used in dialogs and sub-rows. */
export const AMMO_LABELS: Record<AmmoType, string> = {
  Flechas: 'Flechas',
  Virotes: 'Virotes',
  Balas: 'Balas',
  Pedras: 'Pedras',
  'Bola de Ferro': 'Bolas de Ferro',
};

/**
 * Catalog flags for the legacy ammo items that already existed before the
 * ammo system was added. When a bag is rehydrated and an item matches one of
 * these names, we enrich it with the ammo metadata so migration can proceed.
 */
export const AMMO_BY_LEGACY_NAME: Record<
  string,
  { ammoType: AmmoType; ammoPackSize: number; ammoUnitsPerSpace: number }
> = {
  'Flechas (20)': {
    ammoType: 'Flechas',
    ammoPackSize: 20,
    ammoUnitsPerSpace: 20,
  },
  'Virotes (20)': {
    ammoType: 'Virotes',
    ammoPackSize: 20,
    ammoUnitsPerSpace: 20,
  },
  'Balas (20)': { ammoType: 'Balas', ammoPackSize: 20, ammoUnitsPerSpace: 20 },
  'Pedras (20)': {
    ammoType: 'Pedras',
    ammoPackSize: 20,
    ammoUnitsPerSpace: 20,
  },
  'Bola de ferro (1)': {
    ammoType: 'Bola de Ferro',
    ammoPackSize: 1,
    ammoUnitsPerSpace: 2,
  },
};

/**
 * Maps catalog weapon names to the ammo type they consume. Used to retrofit
 * legacy bags (weapons that already exist on a sheet but lack the new
 * `ammoType` flag because they were added before the ammo system).
 */
export const WEAPON_AMMO_BY_LEGACY_NAME: Record<string, AmmoType> = {
  // Core
  'Besta Leve': 'Virotes',
  Funda: 'Pedras',
  'Arco Curto': 'Flechas',
  'Arco Longo': 'Flechas',
  'Besta Pesada': 'Virotes',
  Mosquete: 'Balas',
  Pistola: 'Balas',
  // Ameaças de Arton
  Traque: 'Balas',
  Arcabuz: 'Balas',
  Bacamarte: 'Balas',
  'Pistola-punhal': 'Balas',
  // Heróis de Arton
  'Besta de mão': 'Virotes',
  'Arco montado': 'Flechas',
  'Besta dupla': 'Virotes',
  'Arco de guerra': 'Flechas',
  Balestra: 'Virotes',
  'Besta de repetição': 'Virotes',
  Garrucha: 'Balas',
  'Canhão portátil': 'Bola de Ferro',
};

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

/**
 * In-place migration: enriches legacy ammo items with the new metadata flags
 * (`isAmmo`, `ammoType`, `ammoPackSize`) and seeds `unitsRemaining` from the
 * old `quantity * packSize` model. Idempotent — runs once per item by checking
 * `unitsRemaining === undefined`.
 */
export function seedAmmoUnits(bagEquipments: BagEquipments): void {
  BAG_CATEGORIES.forEach((category) => {
    const list = bagEquipments[category];
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (!item || typeof item !== 'object') return;

      const legacyMatch = AMMO_BY_LEGACY_NAME[item.nome];
      if (legacyMatch && !item.isAmmo) {
        item.isAmmo = true;
        item.ammoType = legacyMatch.ammoType;
        item.ammoPackSize = legacyMatch.ammoPackSize;
        item.ammoUnitsPerSpace = legacyMatch.ammoUnitsPerSpace;
      }

      if (item.isAmmo && item.unitsRemaining === undefined) {
        const packSize = item.ammoPackSize ?? 20;
        const stacks = item.quantity ?? 1;
        item.unitsRemaining = packSize * stacks;
        item.quantity = 1;
      }

      // Retrofit legacy weapons with their ammoType so old sheets get the
      // ammo prompt and the sub-row in Ataques without re-adding the weapon.
      if (!item.isAmmo && !item.ammoType) {
        const weaponMatch = WEAPON_AMMO_BY_LEGACY_NAME[item.nome];
        if (weaponMatch) item.ammoType = weaponMatch;
      }
    });
  });
}

/** Iterates every item in the bag's category buckets. */
function forEachItem(
  bagEquipments: BagEquipments,
  fn: (item: Equipment) => void
): void {
  BAG_CATEGORIES.forEach((category) => {
    const list = bagEquipments[category];
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (item && typeof item === 'object') fn(item);
    });
  });
}

/**
 * Finds the ammo stack on the bag matching a weapon's ammo type.
 * Returns the first matching item (a player should normally only have one
 * stack per type, since ADD_ITEM merges by name).
 */
export function findAmmoStack(
  bagEquipments: BagEquipments,
  ammoType: AmmoType
): Equipment | undefined {
  let found: Equipment | undefined;
  forEachItem(bagEquipments, (item) => {
    if (found) return;
    if (item.isAmmo && item.ammoType === ammoType) found = item;
  });
  return found;
}

/** Returns remaining individual rounds for a given ammo type (0 when no stack). */
export function getAmmoUnits(
  bagEquipments: BagEquipments,
  ammoType: AmmoType
): number {
  const stack = findAmmoStack(bagEquipments, ammoType);
  return stack?.unitsRemaining ?? 0;
}

/** Returns the space cost of an ammo item using the ceil(units / unitsPerSpace) rule. */
export function calcAmmoSpaces(item: Equipment): number {
  if (!item.isAmmo) return 0;
  const unitsPerSpace = item.ammoUnitsPerSpace ?? 20;
  const units = item.unitsRemaining ?? 0;
  if (units <= 0) return 0;
  return Math.ceil(units / unitsPerSpace);
}
