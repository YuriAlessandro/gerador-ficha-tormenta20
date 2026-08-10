/**
 * Congelamento ("snapshot") do efeito numérico de uma melhoria, encanto ou
 * material no momento em que ele é aplicado a um item.
 *
 * Por que existe: o item guarda apenas o NOME do que foi aplicado
 * (`AppliedModification.mod`, `AppliedEnchantment.enchantment`). Para conteúdo
 * do livro básico isso basta — o efeito vive num registro estático que sempre
 * está lá, e rebalanceamentos oficiais chegam a fichas antigas de graça. Mas
 * conteúdo de suplemento e principalmente de homebrew pode ser desativado; se o
 * efeito dependesse de lookup, os números sumiriam da ficha salva e voltariam
 * ao reativar. Congelando na aplicação, o item continua valendo o mesmo.
 *
 * Estas funções são puras e não consultam o registry: quem aplica já tem o
 * `ItemMod`/`ItemE`/`SpecialMaterial` escolhido em mãos.
 */
import {
  AppliedEnchantment,
  AppliedModification,
} from '../../interfaces/Equipment';
import { ItemE, ItemMod } from '../../interfaces/Rewards';
import { SpecialMaterial } from '../../interfaces/SpecialMaterials';

/** Contexto do item ao qual o material está sendo aplicado. */
export type MaterialContext = 'weapon' | 'defense';

/**
 * Converte a melhoria escolhida no catálogo numa entrada aplicada, congelando
 * o efeito quando ele veio embutido no dado (conteúdo não-core).
 */
export function toAppliedModification(
  mod: ItemMod,
  specialMaterial?: string
): AppliedModification {
  const applied: AppliedModification = { mod: mod.mod };
  if (specialMaterial) applied.specialMaterial = specialMaterial;

  if (mod.effect) {
    applied.effect = mod.effect;
    if (mod.description) applied.description = mod.description;
    if (mod.supplementId) applied.supplementId = mod.supplementId;
  }

  return applied;
}

/**
 * Congela o efeito do material especial na entrada `Material especial`, no lado
 * (arma ou defesa) correspondente ao item.
 */
export function withMaterialSnapshot(
  applied: AppliedModification,
  material: SpecialMaterial | undefined,
  context: MaterialContext
): AppliedModification {
  if (!material) return applied;

  const stats =
    context === 'weapon'
      ? material.weaponEffectStats
      : material.armorEffectStats;
  if (!stats) return applied;

  const next: AppliedModification = { ...applied, materialEffect: stats };
  const prose =
    context === 'weapon' ? material.weaponEffect : material.armorEffect;
  if (prose?.effect) next.description = prose.effect;
  if (material.supplementId) next.supplementId = material.supplementId;
  return next;
}

/**
 * Converte o encanto escolhido no catálogo numa entrada aplicada, congelando o
 * efeito quando ele veio embutido no dado (conteúdo não-core).
 */
export function toAppliedEnchantment(
  ench: ItemE,
  selectedSpell?: string
): AppliedEnchantment {
  const applied: AppliedEnchantment = { enchantment: ench.enchantment };
  if (selectedSpell) applied.selectedSpell = selectedSpell;

  if (ench.effectStats) {
    applied.effect = ench.effectStats;
    if (ench.effect) applied.description = ench.effect;
    if (ench.supplementId) applied.supplementId = ench.supplementId;
  }

  return applied;
}
