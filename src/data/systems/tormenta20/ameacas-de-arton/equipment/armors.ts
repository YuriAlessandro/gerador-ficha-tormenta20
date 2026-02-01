import { DefenseEquipment } from '../../../../../interfaces/Equipment';

/**
 * Novas armaduras e escudos do suplemento Ameaças de Arton - Tormenta 20
 * Apenas disponíveis quando o suplemento está ativo
 */

export const AMEACAS_ARTON_ARMORS: Record<string, DefenseEquipment> = {
  ARMADURA_DE_OSSOS: {
    nome: 'Armadura de ossos',
    defenseBonus: 3,
    armorPenalty: -2,
    spaces: 2,
    group: 'Armadura',
    preco: 120,
  },
  VESTE_DE_TEIA_DE_ARANHA: {
    nome: 'Veste de teia de aranha',
    defenseBonus: 4,
    armorPenalty: 0,
    spaces: 2,
    group: 'Armadura',
    preco: 3000,
  },
  ARMADURA_DE_QUITINA: {
    nome: 'Armadura de quitina',
    defenseBonus: 7,
    armorPenalty: -3,
    spaces: 5,
    group: 'Armadura',
    preco: 350,
  },
  ESCUDO_DE_COURO: {
    nome: 'Escudo de couro',
    defenseBonus: 1,
    armorPenalty: -1,
    spaces: 1,
    group: 'Escudo',
    preco: 3,
  },
};

export default AMEACAS_ARTON_ARMORS;
