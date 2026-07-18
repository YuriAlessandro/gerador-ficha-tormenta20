import Equipment, { DefenseEquipment, BagEquipments } from './Equipment';

/**
 * Equipment organized for market display
 */
export interface MarketEquipment {
  weapons: Equipment[];
  armors: DefenseEquipment[];
  shields: DefenseEquipment[];
  generalItems: Equipment[];
  esoteric: Equipment[];
  clothing: Equipment[];
  alchemy: Equipment[];
  food: Equipment[];
  animals: Equipment[];
}

/**
 * Market selections made by the player in the wizard
 */
export interface MarketSelections {
  initialMoney: number;
  remainingMoney: number;
  bagEquipments: BagEquipments;
  /**
   * Ids das entradas da mochila que foram efetivamente PAGAS (adicionadas com
   * o desconto automático ligado). Só elas reembolsam ao serem removidas —
   * itens adicionados de graça e os pré-populados pela origem não devolvem
   * dinheiro que nunca saiu.
   */
  purchasedIds?: string[];
}
