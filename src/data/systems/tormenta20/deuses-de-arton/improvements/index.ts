import { ItemMod } from '@/interfaces/Rewards';
import { SupplementId } from '@/types/supplement.types';

/**
 * Superior item improvements from Deuses de Arton supplement
 */

// Melhorias para armas
export const weaponImprovements: ItemMod[] = [
  {
    min: 0,
    max: 0,
    mod: 'Conduíte',
    description: 'Reduz em –1 PM o custo de Abençoar Arma',
    appliesTo: 'weapon',
    supplementId: SupplementId.TORMENTA20_DEUSES_ARTON,
  },
];

// Melhorias para armaduras, escudos, ferramentas e vestuários
export const armorImprovements: ItemMod[] = [
  {
    min: 0,
    max: 0,
    mod: 'Diligente',
    description: 'Reduz em –1 PM o custo de Prece de Combate',
    appliesTo: 'armor',
    supplementId: SupplementId.TORMENTA20_DEUSES_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Inscrito',
    description: 'Conta como símbolo sagrado',
    appliesTo: 'armor',
    supplementId: SupplementId.TORMENTA20_DEUSES_ARTON,
  },
];

// Melhorias para todas as categorias (armas E armaduras/escudos)
export const universalImprovements: ItemMod[] = [
  {
    min: 0,
    max: 0,
    mod: 'Canônico',
    description: '+1 na CD para resistir a habilidades mágicas divinas',
    appliesTo: 'all',
    supplementId: SupplementId.TORMENTA20_DEUSES_ARTON,
  },
  {
    min: 0,
    max: 0,
    mod: 'Devotado',
    description: 'Reduz em –1 PM o custo de um poder concedido',
    appliesTo: 'all',
    supplementId: SupplementId.TORMENTA20_DEUSES_ARTON,
  },
];

// All improvements from this supplement
const DEUSES_ARTON_IMPROVEMENTS = {
  weapons: [...weaponImprovements, ...universalImprovements],
  armors: [...armorImprovements, ...universalImprovements],
};

export default DEUSES_ARTON_IMPROVEMENTS;
