import { ItemMod } from '@/interfaces/Rewards';
import { SupplementId } from '@/types/supplement.types';

/**
 * Novas Melhorias do suplemento Heróis de Arton (cap. 3 - Arsenal dos Heróis,
 * pp. 239-240). A maioria tem efeitos condicionais ou que dependem de subtipo
 * de item (munição, arma corpo a corpo, escudo), então são text-only em
 * modificationEffects.ts e a descrição informa o jogador. Exceção: Guarda
 * aplica +1 de Defesa numericamente.
 *
 * Não inclui (por enquanto) melhorias específicas de categorias não
 * suportadas pelo editor: Potencializador (esotéricos), Brasonado e Usado
 * (ferramentas/vestuário).
 */

// Melhorias para armas
export const weaponImprovements: ItemMod[] = [
  {
    min: 0,
    max: 0,
    mod: 'Farpada',
    description:
      'Acerto crítico provoca sangramento (-5 em Constituição para remover). Apenas armas de corte ou perfuração.',
    prerequisite: 'Cruel',
    appliesTo: 'weapon',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Fósforo',
    description:
      'Apenas munições. Dano diminui em um passo, mas alvo atingido fica ofuscado por 1 rodada.',
    appliesTo: 'weapon',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Guarda',
    description:
      '+1 na Defesa (aplicado automaticamente) e em testes contra manobras. Apenas armas corpo a corpo.',
    appliesTo: 'weapon',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Incendiária',
    description:
      'Apenas munições. +1 de dano de fogo; se acertar por 5 ou mais, deixa o alvo em chamas.',
    appliesTo: 'weapon',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Pressurizada',
    description:
      '+2 em ataque e dano ao acionar mecanismo (ação completa). Apenas armas corpo a corpo de impacto e armas de fogo.',
    appliesTo: 'weapon',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
];

// Melhorias para armaduras e escudos
export const armorImprovements: ItemMod[] = [
  {
    min: 0,
    max: 0,
    mod: 'Balístico',
    description:
      'Apenas escudos. Gasta uma bala (até 2 cargas) para aumentar o dano do escudo em +2d6.',
    prerequisite: 'Reforçada',
    appliesTo: 'shield',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Deslumbrante',
    description:
      '+1 na CD para resistir às suas habilidades baseadas em Carisma. Apenas armaduras e vestuários.',
    prerequisite: 'Banhada a ouro',
    appliesTo: 'armor',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Injetora',
    description:
      'Apenas armaduras. Mecanismo injetor com 1 dose de preparado ou poção, acionado por uma ação de movimento.',
    appliesTo: 'armor',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Prudente',
    description:
      'Apenas armaduras. 1 vez/dia, ao usar Falhas Críticas, role duas vezes na Tabela 4-6 e escolha o resultado.',
    appliesTo: 'armor',
    supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  },
];

const HEROIS_ARTON_IMPROVEMENTS = {
  weapons: weaponImprovements,
  armors: armorImprovements,
};

export default HEROIS_ARTON_IMPROVEMENTS;
