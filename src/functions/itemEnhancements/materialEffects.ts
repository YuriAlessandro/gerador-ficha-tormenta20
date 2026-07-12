import { DefenseEquipment } from '../../interfaces/Equipment';
import { DamageType } from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
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

  // Ameaças de Arton. Ficam text-only: Casco de Monstro arma (interação com
  // Armamento da Natureza), Couraça de Kaiju defesa (RD X/mágico não tem
  // qualificador de bypass no modelo), Couro de Bulette (deslocamento de
  // escavação + redução condicional), Cristal de Sol defesa (rolar dois dados),
  // Lanajuste arma (combate submerso), Pena de Kraken (dano só no crítico /
  // retaliação em erro), Prata (efeitos condicionais a tipo de criatura) e
  // Quitina Razza arma (dados explosivos).
  'casco de monstro': {
    defenseEffect: { defenseStats: { armorPenaltyDelta: -1 } },
  },
  'couraça de kaiju': {
    weaponEffect: { weaponStats: { danoStepUp: 1 } },
  },
  // A restrição a armas de corte/perfuração fica na descrição (a elegibilidade
  // do item é responsabilidade de quem aplica o material).
  'cristal de sol': {
    weaponEffect: { extraDamage: [{ dice: '2', damageType: 'Fogo' }] },
  },
  lanajuste: {
    defenseEffect: (item) => ({
      damageReduction: [
        { damageType: 'Corte', value: item.isHeavyArmor ? 10 : 5 },
      ],
    }),
  },
  'quitina razza': {
    defenseEffect: (item) => ({
      defenseStats: { defenseBonusDelta: item.isHeavyArmor ? 2 : 1 },
      skillBonuses: [
        { skill: Skill.PERCEPCAO, value: item.isHeavyArmor ? 5 : 2 },
      ],
    }),
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

/**
 * Resolves the damage reduction granted by a special material applied to an
 * equipped armor/shield. Returns an empty array when the item has no
 * `Material especial` modification or the material grants no RD.
 *
 * `heavy` drives the light-vs-heavy branch (e.g. Adamante: RD 5 on heavy armor,
 * RD 2 on light armor and shields). Callers must pass `false` for shields.
 *
 * This is the single source of truth for armor-material RD: it is read only for
 * the WORN armor/shield during the sheet's RD calculation, so armor sitting in
 * the bag does not grant RD (and RD does not flow through equipment
 * `sheetBonuses`, which would double-count and ignore the worn state).
 */
export function getDefenseMaterialRd(
  item: DefenseEquipment,
  heavy: boolean
): { damageType: DamageType; value: number }[] {
  const materialMod = item.modifications?.find(
    (m) => m.mod === 'Material especial' && m.specialMaterial
  );
  if (!materialMod?.specialMaterial) return [];
  const effect = resolveMaterialEffect(materialMod.specialMaterial, 'defense', {
    ...item,
    isHeavyArmor: heavy,
  });
  return effect?.damageReduction ?? [];
}
