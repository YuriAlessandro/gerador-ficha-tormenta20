import EQUIPAMENTOS from '../data/systems/tormenta20/equipamentos';
import { dataRegistry } from '../data/registry';
import Equipment from '../interfaces/Equipment';
import { SupplementId } from '../types/supplement.types';

/**
 * Lists of combat items (weapons/armors/shields) categorized by subtype, merging
 * core equipment from `EQUIPAMENTOS` with weapons/armors/shields from the user's
 * active supplements. Used by the superior- and magical-item generators so that
 * supplement items become valid bases when their supplement is enabled.
 *
 * Core items are pre-categorized in `EQUIPAMENTOS`; supplement items are slotted
 * by their `weaponCategory` field (weapons) or `isHeavyArmor` flag (armors).
 */
export interface CategorizedCombatItems {
  weaponsByType: {
    all: Equipment[];
    simple: Equipment[];
    martial: Equipment[];
    exotic: Equipment[];
    firearm: Equipment[];
  };
  armorsByType: {
    all: Equipment[];
    light: Equipment[];
    heavy: Equipment[];
  };
  shields: Equipment[];
}

export function getCategorizedCombatItems(
  supplementIds: SupplementId[]
): CategorizedCombatItems {
  // Core items (already categorized by their array placement).
  const weaponsByType = {
    simple: [...EQUIPAMENTOS.armasSimples],
    martial: [...EQUIPAMENTOS.armasMarciais],
    exotic: [...EQUIPAMENTOS.armasExoticas],
    firearm: [...EQUIPAMENTOS.armasDeFogo],
  };
  const armorsByType = {
    light: [...EQUIPAMENTOS.armadurasLeves] as Equipment[],
    heavy: [...EQUIPAMENTOS.armaduraPesada] as Equipment[],
  };
  const shields: Equipment[] = [...EQUIPAMENTOS.escudos];

  // Merge in supplement items. `getEquipmentBySupplements` returns core + supplement
  // items flat; only supplement items carry `supplementId`, so we filter on that.
  const merged = dataRegistry.getEquipmentBySupplements(supplementIds);

  merged.weapons
    .filter((item) => item.supplementId && !item.isAmmo)
    .forEach((item) => {
      // Skip weapons without a known category — they can't be reliably placed.
      if (item.weaponCategory) {
        weaponsByType[item.weaponCategory].push(item);
      }
    });

  merged.armors
    .filter((item) => item.supplementId)
    .forEach((item) => {
      if (item.isHeavyArmor) armorsByType.heavy.push(item);
      else armorsByType.light.push(item);
    });

  shields.push(...merged.shields.filter((item) => item.supplementId));

  return {
    weaponsByType: {
      all: [
        ...weaponsByType.simple,
        ...weaponsByType.martial,
        ...weaponsByType.exotic,
        ...weaponsByType.firearm,
      ],
      simple: weaponsByType.simple,
      martial: weaponsByType.martial,
      exotic: weaponsByType.exotic,
      firearm: weaponsByType.firearm,
    },
    armorsByType: {
      all: [...armorsByType.light, ...armorsByType.heavy],
      light: armorsByType.light,
      heavy: armorsByType.heavy,
    },
    shields,
  };
}
