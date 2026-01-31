import { DefenseEquipment } from '../../../../../interfaces/Equipment';

/**
 * Armaduras e Escudos do suplemento Heróis de Arton - Tormenta 20
 */

// ==========================================
// ARMADURAS LEVES
// ==========================================

const ARMADURA_SENSUAL: DefenseEquipment = {
  nome: 'Armadura sensual',
  defenseBonus: 1,
  armorPenalty: 0,
  spaces: 2,
  group: 'Armadura',
  preco: 55,
};

const ARMADURA_DE_FOLHAS: DefenseEquipment = {
  nome: 'Armadura de folhas',
  defenseBonus: 2,
  armorPenalty: 0,
  spaces: 2,
  group: 'Armadura',
  preco: 75,
};

const ARMADURA_DE_ENGENHOQUEIRO_GOBLIN: DefenseEquipment = {
  nome: 'Armadura de engenhoqueiro goblin',
  defenseBonus: 3,
  armorPenalty: -2,
  spaces: 2,
  group: 'Armadura',
  preco: 85,
};

const COTA_DE_MOEDAS: DefenseEquipment = {
  nome: 'Cota de moedas',
  defenseBonus: 4,
  armorPenalty: -3,
  spaces: 2,
  group: 'Armadura',
  preco: 350,
};

const COLETE_FORA_DA_LEI: DefenseEquipment = {
  nome: 'Colete fora da lei',
  defenseBonus: 5,
  armorPenalty: -5,
  spaces: 2,
  group: 'Armadura',
  preco: 750,
};

// ==========================================
// ARMADURAS PESADAS
// ==========================================

const BRIGANTINA: DefenseEquipment = {
  nome: 'Brigantina',
  defenseBonus: 6,
  armorPenalty: 0,
  spaces: 5,
  group: 'Armadura',
  preco: 75,
};

const ARMADURA_DE_CHUMBO: DefenseEquipment = {
  nome: 'Armadura de chumbo',
  defenseBonus: 7,
  armorPenalty: -5,
  spaces: 5,
  group: 'Armadura',
  preco: 750,
};

const ARMADURA_DE_JUSTA: DefenseEquipment = {
  nome: 'Armadura de justa',
  defenseBonus: 9,
  armorPenalty: -5,
  spaces: 5,
  group: 'Armadura',
  preco: 1200,
};

const ARMADURA_DE_HUSSARDO_ALADO: DefenseEquipment = {
  nome: 'Armadura de hussardo alado',
  defenseBonus: 10,
  armorPenalty: -6,
  spaces: 5,
  group: 'Armadura',
  preco: 4500,
};

const ARMADURA_DE_PEDRA: DefenseEquipment = {
  nome: 'Armadura de pedra',
  defenseBonus: 12,
  armorPenalty: -5,
  spaces: 5,
  group: 'Armadura',
  preco: 5500,
};

// ==========================================
// ESCUDOS
// ==========================================

const BROQUEL: DefenseEquipment = {
  nome: 'Broquel',
  defenseBonus: 0,
  armorPenalty: -1,
  spaces: 0.5,
  group: 'Escudo',
  preco: 25,
};

const ESCUDO_DE_VIME: DefenseEquipment = {
  nome: 'Escudo de vime',
  defenseBonus: 2,
  armorPenalty: -2,
  spaces: 2,
  group: 'Escudo',
  preco: 15,
};

const ESCUDO_TORRE: DefenseEquipment = {
  nome: 'Escudo torre',
  defenseBonus: 2,
  armorPenalty: -4,
  spaces: 2,
  group: 'Escudo',
  preco: 45,
};

const SAGNA: DefenseEquipment = {
  nome: 'Sagna',
  defenseBonus: 2,
  armorPenalty: -3,
  spaces: 2,
  group: 'Escudo',
  preco: 20,
};

export const HEROIS_ARTON_ARMORS: Record<string, DefenseEquipment> = {
  // Armaduras Leves
  ARMADURA_SENSUAL,
  ARMADURA_DE_FOLHAS,
  ARMADURA_DE_ENGENHOQUEIRO_GOBLIN,
  COTA_DE_MOEDAS,
  COLETE_FORA_DA_LEI,
  // Armaduras Pesadas
  BRIGANTINA,
  ARMADURA_DE_CHUMBO,
  ARMADURA_DE_JUSTA,
  ARMADURA_DE_HUSSARDO_ALADO,
  ARMADURA_DE_PEDRA,
  // Escudos
  BROQUEL,
  ESCUDO_DE_VIME,
  ESCUDO_TORRE,
  SAGNA,
};
