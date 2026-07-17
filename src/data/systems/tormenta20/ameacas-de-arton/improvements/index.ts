import { ItemMod } from '@/interfaces/Rewards';
import { SupplementId } from '@/types/supplement.types';

/**
 * Novas Melhorias do suplemento Ameaças de Arton (cap. 3 — Bazar Monstruoso,
 * p. 399). Penetrante é text-only em modificationEffects.ts (ignorar a RD do
 * alvo não é representável nos deltas numéricos do item).
 *
 * Não inclui Multifuncional (ferramentas/vestuário), categoria não suportada
 * pelo editor — mesmo critério de Brasonado e Usado em Heróis de Arton.
 */

// Melhorias para armas
export const weaponImprovements: ItemMod[] = [
  {
    min: 0,
    max: 0,
    mod: 'Penetrante',
    description: 'A arma ignora 5 pontos de redução de dano.',
    prerequisite: 'Cruel',
    appliesTo: 'weapon',
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
  },
];

const AMEACAS_ARTON_IMPROVEMENTS = {
  weapons: weaponImprovements,
};

export default AMEACAS_ARTON_IMPROVEMENTS;
