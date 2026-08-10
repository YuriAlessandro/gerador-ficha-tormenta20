import Equipment, { DefenseEquipment } from '../../interfaces/Equipment';
import {
  aggregateEffects,
  applyDelta,
  captureBaseValues,
  isDefenseEquipment,
  resolveScaledEffect,
  SourcedEffect,
  sumDeltas,
} from './core';
import { modificationEffects } from '../modifications/modificationEffects';
import { enchantmentEffects } from './enchantmentEffects';
import { resolveMaterialEffect } from './materialEffects';

/**
 * Recomputes an Equipment's stats from its `base*` snapshots and current
 * `modifications` + `enchantments` arrays. Pure / idempotent: calling it twice
 * with the same input produces the same output. Items without any enhancements
 * are returned unchanged (no base capture, no recomputation).
 *
 * The pipeline aggregates deltas from both sources and applies them once over
 * the captured base, so combining a mod and an enchantment that both modify the
 * same stat (e.g. Certeira +1 atk mod + Formidável +2 atk ench) yields the
 * correct sum (+3) without double counting.
 *
 * If the item has `hasManualEdits === true`, the pipeline still runs (to
 * regenerate derived extraDamage, specialActions, sheetBonuses etc.), but it
 * preserves the user's manual stat values for `dano`, `atkBonus`, `critico`,
 * `defenseBonus`, and `armorPenalty`. Clicking "Resetar" in the editor clears
 * the flag and restores automatic recomputation from base + deltas.
 */
export function applyItemEnhancements<T extends Equipment>(item: T): T {
  const hasMods = !!item.modifications?.length;
  const hasEnch = !!item.enchantments?.length;
  // Run the pipeline whenever the item has any extra damage entry, including
  // stale derived entries that should be stripped now that their source is
  // gone (e.g. a previously-applied Flamejante that was removed).
  const hasExtraDamage = !!item.extraDamage?.length;
  // Also run when base values were previously captured — this means an
  // enhancement was applied earlier and may need its derived state cleaned up
  // (specialActions, arremesso, sheetBonuses) now that the source is gone.
  const hasBaseCapture =
    item.baseSpecialActions !== undefined ||
    item.baseArremesso !== undefined ||
    item.baseSheetBonuses !== undefined;
  if (!hasMods && !hasEnch && !hasExtraDamage && !hasBaseCapture) return item;

  const captured = captureBaseValues(item);
  const isDefense = isDefenseEquipment(captured);
  const isWeapon = captured.group === 'Arma';

  // Ordem de resolução, para melhoria, material e encanto:
  //   1. snapshot gravado na entrada aplicada (conteúdo não-core),
  //   2. registro estático do core,
  //   3. sem efeito (melhoria puramente descritiva).
  // O snapshot vir primeiro é o que faz um item continuar valendo os mesmos
  // números depois que o suplemento/homebrew de origem é desativado.
  const modEntries: SourcedEffect[] = (captured.modifications ?? []).map(
    (m) => {
      if (m.mod === 'Material especial' && m.specialMaterial) {
        let context: 'weapon' | 'defense' | undefined;
        if (isWeapon) context = 'weapon';
        else if (isDefense) context = 'defense';

        let effect;
        if (m.materialEffect) {
          effect = resolveScaledEffect(
            m.materialEffect,
            isDefense ? (captured as DefenseEquipment) : undefined
          );
        } else if (context) {
          effect = resolveMaterialEffect(
            m.specialMaterial,
            context,
            isDefense ? (captured as DefenseEquipment) : undefined
          );
        }
        return {
          effect,
          source: 'modification',
          sourceName: `Material especial (${m.specialMaterial})`,
        };
      }
      return {
        effect: m.effect ?? modificationEffects[m.mod],
        source: 'modification',
        sourceName: m.mod,
      };
    }
  );
  const enchEntries: SourcedEffect[] = (captured.enchantments ?? []).map(
    (e) => ({
      effect: e.effect ?? enchantmentEffects[e.enchantment],
      source: 'enchantment',
      sourceName: e.enchantment,
    })
  );
  const modDelta = aggregateEffects(modEntries);
  const enchDelta = aggregateEffects(enchEntries);
  const delta = sumDeltas(modDelta, enchDelta);

  return applyDelta(captured, delta, item.hasManualEdits === true);
}
