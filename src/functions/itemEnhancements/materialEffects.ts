import { DefenseEquipment } from '../../interfaces/Equipment';
import { EnhancementEffect } from './core';

/**
 * Numeric effects applied by special materials when used as a weapon or as an
 * armor/shield. `Material especial` itself stays text-only in
 * `modificationEffects` — the actual numeric resolution happens here, keyed by
 * the concrete material name stored in `AppliedModification.specialMaterial`.
 *
 * `defenseEffect` may be a function when the bonus depends on the item being
 * a light vs heavy armor / shield (e.g. Adamante: RD 2 on light/shield, RD 5
 * on heavy).
 *
 * Materials with purely conditional or non-modelable effects (Aço-rubi, Madeira
 * Tollon weapon, Matéria Vermelha defense) are intentionally absent — their
 * descriptive effects remain in the item description only.
 */
export interface MaterialEffect {
  weaponEffect?: EnhancementEffect;
  defenseEffect?:
    | EnhancementEffect
    | ((item: DefenseEquipment) => EnhancementEffect);
}

/**
 * Keys match the `value` field of MATERIAL_OPTIONS in ItemModificationsEditor —
 * the lowercase form stored in `AppliedModification.specialMaterial`. Lookup
 * normalizes the input (trim + lowercase) to tolerate variations.
 */
export const materialEffects: Record<string, MaterialEffect> = {
  mitral: {
    weaponEffect: { weaponStats: { criticoThreatDelta: 1 } },
    defenseEffect: { defenseStats: { armorPenaltyDelta: -2 } },
  },
  adamante: {
    weaponEffect: { weaponStats: { danoStepUp: 1 } },
    defenseEffect: (item) => ({
      damageReduction: [
        { damageType: 'Geral', value: item.isHeavyArmor ? 5 : 2 },
      ],
    }),
  },
  'gelo eterno': {
    weaponEffect: { extraDamage: [{ dice: '2', damageType: 'Frio' }] },
    defenseEffect: (item) => ({
      damageReduction: [
        { damageType: 'Fogo', value: item.isHeavyArmor ? 10 : 5 },
      ],
    }),
  },
  'matéria vermelha': {
    weaponEffect: { extraDamage: [{ dice: '1d6', damageType: 'Essência' }] },
  },
};

/**
 * Resolves the EnhancementEffect for a given material applied to a specific
 * equipment context (weapon vs defense). Returns undefined when the material
 * has no numeric effect for that context.
 */
export function resolveMaterialEffect(
  materialName: string,
  context: 'weapon' | 'defense',
  defenseItem?: DefenseEquipment
): EnhancementEffect | undefined {
  const material = materialEffects[materialName.trim().toLowerCase()];
  if (!material) return undefined;
  if (context === 'weapon') return material.weaponEffect;
  if (!material.defenseEffect) return undefined;
  if (typeof material.defenseEffect === 'function') {
    if (!defenseItem) return undefined;
    return material.defenseEffect(defenseItem);
  }
  return material.defenseEffect;
}
