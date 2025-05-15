import {
  ItemE,
  ItemM,
  ItemMod,
  Items,
  ItemWeapons,
  ITEM_TYPE,
} from '../../interfaces/Rewards';
import { Armaduras, Armas, Escudos } from '../equipamentos';

export const itemsRewards: Items = {
  S4: [
    {
      min: 1,
      max: 50,
    },
    {
      min: 51,
      max: 80,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 1,
        dice: 4,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
  ],
  S3: [
    {
      min: 1,
      max: 50,
    },
    {
      min: 51,
      max: 75,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
  ],
  S2: [
    {
      min: 1,
      max: 45,
    },
    {
      min: 46,
      max: 70,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 71,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
  ],
  F1: [
    {
      min: 1,
      max: 40,
    },
    {
      min: 41,
      max: 65,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 66,
      max: 90,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
  ],
  F2: [
    {
      min: 1,
      max: 30,
    },
    {
      min: 31,
      max: 40,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 41,
      max: 70,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
    {
      min: 71,
      max: 90,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 1,
      },
    },
  ],
  F3: [
    {
      min: 1,
      max: 25,
    },
    {
      min: 26,
      max: 35,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 36,
      max: 60,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
    {
      min: 61,
      max: 85,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 86,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 1,
      },
    },
  ],
  F4: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 30,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 31,
      max: 55,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
    {
      min: 56,
      max: 80,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.POCAO,
        applyRollBonus: true,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 1,
      },
    },
  ],
  F5: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 70,
      reward: {
        qty: 1,
        dice: 3,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 71,
      max: 90,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 1,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 2,
      },
    },
  ],
  F6: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 65,
      reward: {
        qty: 1,
        dice: 3,
        type: ITEM_TYPE.POCAO,
        applyRollBonus: true,
      },
    },
    {
      min: 66,
      max: 95,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 1,
      },
    },
    {
      min: 96,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 3,
      },
    },
  ],
  F7: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 60,
      reward: {
        qty: 1,
        dice: 3,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 61,
      max: 90,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 2,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 3,
      },
    },
  ],
  F8: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 75,
      reward: {
        qty: 1,
        dice: 3,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 76,
      max: 95,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 2,
      },
    },
    {
      min: 96,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 3,
      },
    },
  ],
  F9: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 70,
      reward: {
        qty: 1,
        dice: 1,
        applyRollBonus: true,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 71,
      max: 95,
      reward: {
        qty: 1,
        dice: 1,
        applyRollBonus: true,
        type: ITEM_TYPE.SUPERIOR,
        mods: 3,
      },
    },
    {
      min: 96,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
  ],
  F10: [
    {
      min: 1,
      max: 50,
    },
    {
      min: 51,
      max: 75,
      reward: {
        qty: 1,
        dice: 3,
        som: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 76,
      max: 90,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 3,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
  ],
  F11: [
    {
      min: 1,
      max: 45,
    },
    {
      min: 46,
      max: 70,
      reward: {
        qty: 1,
        dice: 4,
        som: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 71,
      max: 90,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 3,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
  ],
  F12: [
    {
      min: 1,
      max: 45,
    },
    {
      min: 46,
      max: 70,
      reward: {
        qty: 1,
        dice: 3,
        som: 1,
        type: ITEM_TYPE.POCAO,
        applyRollBonus: true,
      },
    },
    {
      min: 71,
      max: 85,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 4,
      },
    },
    {
      min: 96,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
  ],
  F13: [
    {
      min: 1,
      max: 40,
    },
    {
      min: 41,
      max: 65,
      reward: {
        qty: 1,
        dice: 4,
        som: 1,
        applyRollBonus: true,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 66,
      max: 95,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 4,
      },
    },
    {
      min: 96,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
  ],
  F14: [
    {
      min: 1,
      max: 40,
    },
    {
      min: 41,
      max: 65,
      reward: {
        qty: 1,
        dice: 4,
        som: 1,
        applyRollBonus: true,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 66,
      max: 85,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 4,
      },
    },
    {
      min: 86,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
  ],
  F15: [
    {
      min: 1,
      max: 35,
    },
    {
      min: 36,
      max: 45,
      reward: {
        qty: 1,
        dice: 6,
        som: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 46,
      max: 85,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 4,
      },
    },
    {
      min: 86,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
  ],
  F16: [
    {
      min: 1,
      max: 35,
    },
    {
      min: 36,
      max: 40,
      reward: {
        qty: 1,
        dice: 6,
        som: 1,
        applyRollBonus: true,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 46,
      max: 80,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 4,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
  ],
  F17: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 40,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
    {
      min: 41,
      max: 80,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MAIOR,
      },
    },
  ],
  F18: [
    {
      min: 1,
      max: 15,
    },
    {
      min: 16,
      max: 40,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
    {
      min: 41,
      max: 70,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
    {
      min: 71,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MAIOR,
      },
    },
  ],
  F19: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 40,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
    {
      min: 41,
      max: 60,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
    {
      min: 61,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MAIOR,
      },
    },
  ],
  F20: [
    {
      min: 1,
      max: 5,
    },
    {
      min: 6,
      max: 40,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MENOR,
      },
    },
    {
      min: 41,
      max: 50,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
    {
      min: 51,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MAIOR,
      },
    },
  ],
};

export const miscellaneousItems: ItemM[] = [
  { min: 1, max: 2, item: 'Ácido' },
  { min: 3, max: 4, item: 'Água benta' },
  { min: 5, max: 5, item: 'Alaúde élfico' },
  { min: 6, max: 6, item: 'Algemas' },
  { min: 7, max: 8, item: 'Baga-de-fogo' },
  { min: 9, max: 23, item: 'Bálsamo restaurador' },
  { min: 24, max: 24, item: 'Bandana' },
  { min: 25, max: 25, item: 'Bandoleira de poções' },
  { min: 26, max: 30, item: 'Bomba' },
  { min: 31, max: 31, item: 'Botas reforçadas' },
  { min: 32, max: 32, item: 'Camisa bufante' },
  { min: 33, max: 33, item: 'Capa esvoaçante' },
  { min: 34, max: 34, item: 'Capa pesada' },
  { min: 35, max: 35, item: 'Casaco longo' },
  { min: 36, max: 36, item: 'Chapéu arcano' },
  { min: 37, max: 38, item: 'Coleção de livros' },
  { min: 39, max: 40, item: 'Cosmético' },
  { min: 41, max: 42, item: 'Dente-de-dragão' },
  { min: 43, max: 43, item: 'Enfeite de elmo' },
  { min: 44, max: 44, item: 'Elixir do amor' },
  { min: 45, max: 46, item: 'Equipamento de viagem' },
  { min: 47, max: 56, item: 'Essência de mana' },
  { min: 57, max: 57, item: 'Estojo de disfarces' },
  { min: 58, max: 58, item: 'Farrapos de ermitão' },
  { min: 59, max: 59, item: 'Flauta mística' },
  { min: 60, max: 66, item: 'Fogo alquímico' },
  { min: 67, max: 67, item: 'Gorro de ervas' },
  { min: 68, max: 69, item: 'Líquen lilás' },
  { min: 70, max: 70, item: 'Luneta' },
  { min: 71, max: 71, item: 'Luva de pelica' },
  { min: 72, max: 73, item: 'Maleta de medicamentos' },
  { min: 74, max: 74, item: 'Manopla' },
  { min: 75, max: 75, item: 'Manto eclesiástico' },
  { min: 76, max: 78, item: 'Mochila de aventureiro' },
  { min: 79, max: 80, item: 'Musgo púrpura' },
  { min: 81, max: 81, item: 'Organizador de pergaminhos' },
  { min: 82, max: 83, item: 'Ossos de monstro' },
  { min: 84, max: 85, item: 'Pó de cristal' },
  { min: 86, max: 87, item: 'Pó de giz' },
  { min: 88, max: 88, item: 'Pó do desaparecimento' },
  { min: 89, max: 89, item: 'Robe de mago' },
  { min: 90, max: 91, item: 'Saco de sal' },
  { min: 92, max: 92, item: 'Sapatos de camurça' },
  { min: 93, max: 94, item: 'Seixo de âmbar' },
  { min: 95, max: 95, item: 'Sela' },
  { min: 96, max: 96, item: 'Tabardo' },
  { min: 97, max: 98, item: 'Terra de cemitério' },
  { min: 99, max: 99, item: 'Veste de seda' },
  { min: 100, max: 100, item: 'Veste da corte' },
];

export const weapons: ItemWeapons[] = [
  {
    min: 1,
    max: 3,
    item: Armas.ADAGA,
  },
  {
    min: 4,
    max: 5,
    item: Armas.ALABARDA,
  },
  {
    min: 6,
    max: 7,
    item: Armas.ALFANGE,
  },
  {
    min: 8,
    max: 10,
    item: Armas.ARCOCURTO,
  },
  {
    min: 11,
    max: 13,
    item: Armas.ARCO_LONGO,
  },
  {
    min: 14,
    max: 15,
    item: Armas.AZAGAIA,
  },
  {
    min: 16,
    max: 16,
    item: Armas.BALAS,
  },
  {
    min: 17,
    max: 18,
    item: Armas.BESTALEVE,
  },
  {
    min: 19,
    max: 20,
    item: Armas.BESTA_PESADA,
  },
  {
    min: 21,
    max: 23,
    item: Armas.BORDAO,
  },
  {
    min: 24,
    max: 24,
    item: Armas.CHICOTE,
  },
  {
    min: 25,
    max: 27,
    item: Armas.CIMITARRA,
  },
  {
    min: 28,
    max: 30,
    item: Armas.CLAVA,
  },
  {
    min: 31,
    max: 31,
    item: Armas.CORRENTE_DE_ESPINHOS,
  },
  {
    min: 32,
    max: 33,
    item: Armas.ESPADA_BASTARDA,
  },
  {
    min: 34,
    max: 38,
    item: Armas.ESPADACURTA,
  },
  {
    min: 39,
    max: 43,
    item: Armas.ESPADA_LONGA,
  },
  {
    min: 44,
    max: 46,
    item: Armas.FLECHAS,
  },
  {
    min: 47,
    max: 49,
    item: Armas.FLORETE,
  },
  {
    min: 50,
    max: 51,
    item: Armas.FOICE,
  },
  {
    min: 52,
    max: 53,
    item: Armas.FUNDA,
  },
  {
    min: 54,
    max: 55,
    item: Armas.GADANHO,
  },
  {
    min: 56,
    max: 56,
    item: Armas.KATANA,
  },
  {
    min: 57,
    max: 59,
    item: Armas.LANCA,
  },
  {
    min: 60,
    max: 60,
    item: Armas.LANCA_MONTADA,
  },
  {
    min: 61,
    max: 63,
    item: Armas.MACA,
  },
  {
    min: 64,
    max: 66,
    item: Armas.MACHADINHA,
  },
  {
    min: 67,
    max: 67,
    item: Armas.MACHADO_ANAO,
  },
  {
    min: 68,
    max: 70,
    item: Armas.MACHADO_DE_BATALHA,
  },
  {
    min: 71,
    max: 73,
    item: Armas.MACHADO_DE_GUERRA,
  },
  {
    min: 74,
    max: 74,
    item: Armas.MACHADO_TAURICO,
  },
  {
    min: 75,
    max: 76,
    item: Armas.MANGUAL,
  },
  {
    min: 77,
    max: 77,
    item: Armas.MANOPLA,
  },
  {
    min: 78,
    max: 80,
    item: Armas.MARTELO_DE_GUERRA,
  },
  {
    min: 81,
    max: 83,
    item: Armas.MONTANTE,
  },
  {
    min: 84,
    max: 84,
    item: Armas.MOSQUETE,
  },
  {
    min: 81,
    max: 83,
    item: Armas.MONTANTE,
  },
  {
    min: 84,
    max: 84,
    item: Armas.MOSQUETE,
  },
  {
    min: 85,
    max: 85,
    item: Armas.MUNICAO,
  },
  {
    min: 86,
    max: 88,
    item: Armas.PICARETA,
  },
  {
    min: 89,
    max: 90,
    item: Armas.PIQUE,
  },
  {
    min: 91,
    max: 92,
    item: Armas.PISTOLA,
  },
  {
    min: 93,
    max: 93,
    item: Armas.REDE,
  },
  {
    min: 94,
    max: 96,
    item: Armas.TACAPE,
  },
  {
    min: 97,
    max: 98,
    item: Armas.TRIDENTE,
  },
  {
    min: 99,
    max: 100,
    item: Armas.VIROTES,
  },
];

export const armors: ItemWeapons[] = [
  {
    min: 1,
    max: 5,
    item: Armaduras.ARMADURADECOURO,
  },
  {
    min: 6,
    max: 10,
    item: Armaduras.BRUNEA,
  },
  {
    min: 11,
    max: 25,
    item: Armaduras.ARMADURA_COMPLETA,
  },
  {
    min: 26,
    max: 30,
    item: Armaduras.COTA_DE_MALHA,
  },
  {
    min: 31,
    max: 45,
    item: Armaduras.COURACA,
  },
  {
    min: 46,
    max: 55,
    item: Armaduras.COUROBATIDO,
  },
  {
    min: 56,
    max: 65,
    item: Escudos.ESCUDOLEVE,
  },
  {
    min: 66,
    max: 80,
    item: Escudos.ESCUDO_PESADO,
  },
  {
    min: 81,
    max: 85,
    item: Armaduras.GIBAODEPELES,
  },
  {
    min: 86,
    max: 90,
    item: Armaduras.LORIGA_SEGMENTADA,
  },
  {
    min: 91,
    max: 100,
    item: Armaduras.MEIA_ARMADURA,
  },
];

export const potions: ItemM[] = [
  { min: 1, max: 1, item: 'Abençoar Alimentos (óleo)' },
  { min: 2, max: 3, item: 'Área Escorregadia (granada)' },
  { min: 4, max: 6, item: 'Arma Mágica (óleo)' },
  { min: 7, max: 7, item: 'Compreensão' },
  { min: 8, max: 15, item: 'Curar Ferimentos (2d8+2 PV)' },
  { min: 16, max: 18, item: 'Disfarce Ilusório' },
  { min: 19, max: 20, item: 'Escuridão (óleo)' },
  { min: 21, max: 22, item: 'Luz (óleo)' },
  { min: 23, max: 24, item: 'Névoa (granada)' },
  { min: 25, max: 26, item: 'Primor Atlético' },
  { min: 27, max: 28, item: 'Proteção Divina' },
  { min: 29, max: 30, item: 'Resistência a Energia' },
  { min: 31, max: 32, item: 'Sono' },
  { min: 33, max: 33, item: 'Suporte Ambiental' },
  { min: 34, max: 34, item: 'Tranca Arcana (óleo)' },
  { min: 35, max: 35, item: 'Visão Mística' },
  { min: 36, max: 36, item: 'Vitalidade Fantasma' },
  { min: 37, max: 38, item: 'Escudo da Fé (aprimoramento para duração cena)' },
  { min: 39, max: 40, item: 'Alterar Tamanho' },
  { min: 41, max: 42, item: 'Aparência Perfeita' },
  { min: 43, max: 43, item: 'Armamento da Natureza (óleo)' },
  { min: 44, max: 49, item: 'Bola de Fogo (granada)' },
  { min: 50, max: 51, item: 'Camuflagem Ilusória' },
  {
    min: 52,
    max: 53,
    item: 'Concentração de Combate (aprimoramento para duração cena)',
  },
  { min: 54, max: 62, item: 'Curar Ferimentos (4d8+4 PV)' },
  { min: 63, max: 66, item: 'Físico Divino' },
  { min: 67, max: 68, item: 'Mente Divina' },
  { min: 69, max: 70, item: 'Metamorfose' },
  { min: 71, max: 75, item: 'Purificação' },
  { min: 76, max: 77, item: 'Velocidade' },
  { min: 78, max: 79, item: 'Vestimenta da Fé (óleo)' },
  { min: 80, max: 80, item: 'Voz Divina' },
  { min: 81, max: 82, item: 'Arma Mágica (óleo; aprimoramento para bônus +3)' },
  { min: 83, max: 88, item: 'Curar Ferimentos (7d8+7 PV)' },
  {
    min: 89,
    max: 89,
    item: 'Físico Divino (aprimoramento para três atributos)',
  },
  {
    min: 90,
    max: 92,
    item: 'Invisibilidade (aprimoramento para duração cena)',
  },
  {
    min: 93,
    max: 96,
    item: 'Bola de Fogo (granada; aprimoramento para 10d6 de dano)',
  },
  { min: 97, max: 100, item: 'Curar Ferimentos (11d8+11 PV)' },
];

export const weaponsEnchantments: ItemE[] = [
  {
    min: 1,
    max: 5,
    enchantment: 'Ameaçadora',
    effect: 'Duplica margem de ameaça',
  },
  {
    min: 6,
    max: 10,
    enchantment: 'Anticriatura',
    effect: 'Bônus contra tipo de criatura',
  },
  {
    min: 11,
    max: 12,
    enchantment: 'Arremesso',
    effect: 'Pode ser arremessada',
  },
  {
    min: 13,
    max: 14,
    enchantment: 'Assassina',
    effect: 'Aumenta ataque furtivo',
  },
  {
    min: 15,
    max: 16,
    enchantment: 'Caçadora',
    effect: 'Ignora camuflagem leve e total e cobertura leve',
  },
  {
    min: 17,
    max: 21,
    enchantment: 'Congelante',
    effect: '+1d6 de dano de frio',
  },
  {
    min: 22,
    max: 23,
    enchantment: 'Conjuradora',
    effect: 'Pode guardar e lançar magias',
  },
  {
    min: 24,
    max: 28,
    enchantment: 'Corrosiva',
    effect: '+1d6 de dano de ácido',
  },
  { min: 29, max: 30, enchantment: 'Dançarina', effect: 'Ataca sozinha' },
  { min: 31, max: 34, enchantment: 'Defensora', effect: 'Defesa +2' },
  {
    min: 35,
    max: 36,
    enchantment: 'Destruidora',
    effect: 'Bônus contra construtos',
  },
  {
    min: 37,
    max: 38,
    enchantment: 'Dilacerante',
    effect: '+10 de dano em acertos críticos',
  },
  { min: 39, max: 40, enchantment: 'Drenante', effect: 'Crítico drena vítima' },
  {
    min: 41,
    max: 45,
    enchantment: 'Elétrica',
    effect: '+1d6 de dano de eletricidade',
  },
  {
    min: 46,
    max: 46,
    enchantment: 'Energética*',
    effect: 'Bônus em ataque',
    double: true,
  },
  { min: 47, max: 48, enchantment: 'Excruciante', effect: 'Causa fraqueza' },
  {
    min: 49,
    max: 53,
    enchantment: 'Flamejante',
    effect: '+1d6 de dano de fogo',
  },
  { min: 54, max: 63, enchantment: 'Formidável', effect: 'Ataque e dano +2' },
  {
    min: 64,
    max: 64,
    enchantment: 'Lancinante*',
    effect: 'Causa crítico terrível',
    double: true,
  },
  {
    min: 65,
    max: 72,
    enchantment: 'Magnífica*',
    effect: 'Ataque e dano +4',
    double: true,
  },
  { min: 73, max: 74, enchantment: 'Piedosa', effect: 'Dano não letal' },
  {
    min: 75,
    max: 76,
    enchantment: 'Profana',
    effect: 'Bônus contra devotos do Bem',
  },
  {
    min: 77,
    max: 78,
    enchantment: 'Sagrada',
    effect: 'Bônus contra devotos do Mal',
  },
  { min: 79, max: 80, enchantment: 'Sanguinária', effect: 'Causa sangramento' },
  { min: 81, max: 82, enchantment: 'Trovejante', effect: 'Causa atordoamento' },
  {
    min: 83,
    max: 84,
    enchantment: 'Tumular',
    effect: '+1d8 de dano de trevas',
  },
  { min: 85, max: 88, enchantment: 'Veloz', effect: 'Fornece ataque extra' },
  { min: 89, max: 90, enchantment: 'Venenosa', effect: 'Causa envenenamento' },
];

export const enchantedWeapons: ItemM[] = [
  {
    min: 1,
    max: 5,
    item: 'Azagaia dos relâmpagos',
  },
  {
    min: 6,
    max: 15,
    item: 'Espada baronial',
  },
  {
    min: 16,
    max: 25,
    item: 'Lâmina da luz',
  },
  {
    min: 26,
    max: 30,
    item: 'Lança animalesca',
  },
  {
    min: 31,
    max: 35,
    item: 'Maça do terror',
  },
  {
    min: 36,
    max: 40,
    item: 'Florete fugaz',
  },
  {
    min: 41,
    max: 45,
    item: 'Cajado da destruição',
  },
  {
    min: 46,
    max: 50,
    item: 'Cajado da vida',
  },
  {
    min: 51,
    max: 55,
    item: 'Machado silvestre',
  },
  {
    min: 56,
    max: 60,
    item: 'Martelo de Doherimm',
  },
  {
    min: 61,
    max: 67,
    item: 'Arco do poder',
  },
  {
    min: 68,
    max: 72,
    item: 'Língua do deserto',
  },
  {
    min: 73,
    max: 77,
    item: 'Besta explosiva',
  },
  {
    min: 78,
    max: 82,
    item: 'Punhal sszzaazita',
  },
  {
    min: 83,
    max: 87,
    item: 'Espada sortuda',
  },
  {
    min: 88,
    max: 92,
    item: 'Avalanche',
  },
  {
    min: 93,
    max: 95,
    item: 'Cajado do poder',
  },
  {
    min: 96,
    max: 100,
    item: 'Vingadora sagrada',
  },
];

export const armorEnchantments: ItemE[] = [
  {
    min: 1,
    max: 6,
    enchantment: 'Abascanto',
    effect: 'Resistência contra magia',
  },
  {
    min: 7,
    max: 10,
    enchantment: 'Abençoado',
    effect: 'Resistência contra trevas',
  },
  { min: 11, max: 12, enchantment: 'Acrobático', effect: 'Bônus em Acrobacia' },
  { min: 13, max: 14, enchantment: 'Alado', effect: 'Deslocamento de voo 12m' },
  {
    min: 15,
    max: 16,
    enchantment: 'Animado',
    effect: 'Escudo defende sozinho',
    onlyShield: true,
  },
  {
    min: 17,
    max: 18,
    enchantment: 'Assustador',
    effect: 'Causa efeito de medo',
  },
  {
    min: 19,
    max: 22,
    enchantment: 'Cáustica',
    effect: 'Resistência contra ácido',
  },
  { min: 23, max: 32, enchantment: 'Defensor', effect: 'Defesa +2' },
  {
    min: 33,
    max: 34,
    enchantment: 'Escorregadio',
    effect: 'Bônus para escapar',
  },
  {
    min: 35,
    max: 36,
    enchantment: 'Esmagador',
    effect: 'Escudo causa mais dano',
    onlyShield: true,
  },
  {
    min: 37,
    max: 38,
    enchantment: 'Fantasmagórico',
    effect: 'Lança Manto de Sombras',
  },
  {
    min: 39,
    max: 40,
    enchantment: 'Fortificado',
    effect: 'Chance de ignorar crítico',
  },
  {
    min: 41,
    max: 44,
    enchantment: 'Gélido',
    effect: 'Resistência contra frio',
  },
  {
    min: 45,
    max: 54,
    enchantment: 'Guardião',
    effect: 'Defesa +4',
    double: true,
  },
  {
    min: 55,
    max: 56,
    enchantment: 'Hipnótico',
    effect: 'Causa efeito de fascinar',
  },
  {
    min: 57,
    max: 58,
    enchantment: 'Ilusório',
    effect: 'Camufla-se como item comum',
  },
  {
    min: 59,
    max: 62,
    enchantment: 'Incandescente',
    effect: 'Resistência contra fogo',
  },
  { min: 63, max: 68, enchantment: 'Invulnerável', effect: 'Redução de dano' },
  { min: 69, max: 72, enchantment: 'Opaco', effect: 'Redução de energia' },
  { min: 73, max: 78, enchantment: 'Protetor', effect: 'Resistência +2' },
  { min: 79, max: 80, enchantment: 'Refletor', effect: 'Reflete magia' },
  {
    min: 81,
    max: 84,
    enchantment: 'Relampejante',
    effect: 'Resistência contra eletricidade',
  },
  {
    min: 85,
    max: 86,
    enchantment: 'Reluzente',
    effect: 'Causa efeito de cegueira',
  },
  { min: 87, max: 88, enchantment: 'Sombrio', effect: 'Bônus em Furtividade' },
  {
    min: 89,
    max: 90,
    enchantment: 'Zeloso',
    effect: 'Atrai ataques em aliados',
  },
];

export const enchantedArmors: ItemM[] = [
  {
    min: 1,
    max: 10,
    item: 'Cota élfica',
  },
  {
    min: 11,
    max: 20,
    item: 'Couro de monstro',
  },
  {
    min: 21,
    max: 25,
    item: 'Escudo do conjurador',
  },
  {
    min: 26,
    max: 32,
    item: 'Loriga do centurião',
  },
  {
    min: 33,
    max: 42,
    item: 'Manto da noite',
  },
  {
    min: 43,
    max: 49,
    item: 'Couraça do comando',
  },
  {
    min: 50,
    max: 59,
    item: 'Baluarte anão',
  },
  {
    min: 60,
    max: 66,
    item: 'Escudo espinhoso',
  },
  {
    min: 67,
    max: 76,
    item: 'Escudo do leão',
  },
  {
    min: 77,
    max: 83,
    item: 'Carapaça demoníaca',
  },
  {
    min: 84,
    max: 88,
    item: 'Escudo do eclipse',
  },
  {
    min: 89,
    max: 93,
    item: 'Escudo de Azgher',
  },
  {
    min: 94,
    max: 100,
    item: 'Armadura da luz',
  },
];

export const minorAccessories: ItemM[] = [
  {
    min: 1,
    max: 2,
    item: 'Anel do sustento',
  },
  {
    min: 3,
    max: 7,
    item: 'Bainha mágica',
  },
  {
    min: 8,
    max: 12,
    item: 'Corda da escalada',
  },
  {
    min: 13,
    max: 14,
    item: 'Ferraduras da velocidade',
  },
  {
    min: 15,
    max: 19,
    item: 'Garrafa da fumaça eterna',
  },
  {
    min: 20,
    max: 24,
    item: 'Gema da luminosidade',
  },
  {
    min: 25,
    max: 29,
    item: 'Manto élfico',
  },
  {
    min: 30,
    max: 34,
    item: 'Mochila de carga',
  },
  {
    min: 35,
    max: 40,
    item: 'Brincos da sagacidade',
  },
  {
    min: 41,
    max: 46,
    item: 'Luvas da delicadeza',
  },
  {
    min: 47,
    max: 52,
    item: 'Manoplas da força do ogro',
  },
  {
    min: 53,
    max: 59,
    item: 'Manto da resistência',
  },
  {
    min: 60,
    max: 65,
    item: 'Manto do fascínio',
  },
  {
    min: 66,
    max: 71,
    item: 'Pingente da sensatez',
  },
  {
    min: 72,
    max: 77,
    item: 'Torque do vigor',
  },
  {
    min: 78,
    max: 82,
    item: 'Chapéu do disfarce',
  },
  {
    min: 83,
    max: 84,
    item: 'Flauta fantasma',
  },
  {
    min: 85,
    max: 89,
    item: 'Lanterna da revelação',
  },
  {
    min: 90,
    max: 96,
    item: 'Anel da proteção',
  },
  {
    min: 97,
    max: 98,
    item: 'Anel do escudo mental',
  },
  {
    min: 99,
    max: 100,
    item: 'Pingente da saúde',
  },
];

export const mediumAccessories: ItemM[] = [
  {
    min: 1,
    max: 4,
    item: 'Anel de telecinesia',
  },
  {
    min: 5,
    max: 8,
    item: 'Bola de cristal',
  },
  {
    min: 9,
    max: 10,
    item: 'Caveira maldita',
  },
  {
    min: 11,
    max: 14,
    item: 'Botas aladas',
  },
  {
    min: 15,
    max: 18,
    item: 'Braceletes de bronze',
  },
  {
    min: 19,
    max: 24,
    item: 'Anel da energia',
  },
  {
    min: 25,
    max: 30,
    item: 'Anel da vitalidade',
  },
  {
    min: 31,
    max: 34,
    item: 'Anel de invisibilidade',
  },
  {
    min: 35,
    max: 38,
    item: 'Braçadeiras do arqueiro',
  },
  {
    min: 39,
    max: 42,
    item: 'Brincos de Marah',
  },
  {
    min: 43,
    max: 46,
    item: 'Faixas do pugilista',
  },
  {
    min: 47,
    max: 50,
    item: 'Manto da aranha',
  },
  {
    min: 51,
    max: 54,
    item: 'Vassoura voadora',
  },
  {
    min: 55,
    max: 58,
    item: 'Símbolo abençoado',
  },
  {
    min: 59,
    max: 64,
    item: 'Amuleto da robustez',
  },
  {
    min: 65,
    max: 68,
    item: 'Botas velozes',
  },
  {
    min: 69,
    max: 74,
    item: 'Cinto da força do gigante',
  },
  {
    min: 75,
    max: 80,
    item: 'Coroa majestosa',
  },
  {
    min: 81,
    max: 86,
    item: 'Estola da serenidade',
  },
  {
    min: 87,
    max: 88,
    item: 'Manto do morcego',
  },
  {
    min: 89,
    max: 94,
    item: 'Pulseiras da celeridade',
  },
  {
    min: 95,
    max: 100,
    item: 'Tiara da sapiência',
  },
];

export const majorAccessories: ItemM[] = [
  {
    min: 1,
    max: 2,
    item: 'Elmo do teletransporte',
  },
  {
    min: 3,
    max: 4,
    item: 'Gema da telepatia',
  },
  {
    min: 5,
    max: 9,
    item: 'Gema elemental',
  },
  {
    min: 10,
    max: 15,
    item: 'Manual da saúde corporal',
  },
  {
    min: 16,
    max: 21,
    item: 'Manual do bom exercício',
  },
  {
    min: 22,
    max: 27,
    item: 'Manual dos movimentos precisos',
  },
  {
    min: 28,
    max: 34,
    item: 'Medalhão de Lena',
  },
  {
    min: 35,
    max: 40,
    item: 'Tomo da compreensão',
  },
  {
    min: 41,
    max: 46,
    item: 'Tomo da liderança e influência',
  },
  {
    min: 47,
    max: 52,
    item: 'Tomo dos grandes pensamentos',
  },
  {
    min: 53,
    max: 57,
    item: 'Anel refletor',
  },
  {
    min: 58,
    max: 60,
    item: 'Cinto do campeão',
  },
  {
    min: 61,
    max: 67,
    item: 'Colar guardião',
  },
  {
    min: 68,
    max: 72,
    item: 'Estatueta animista',
  },
  {
    min: 73,
    max: 77,
    item: 'Anel da liberdade',
  },
  {
    min: 78,
    max: 82,
    item: 'Tapete voador',
  },
  {
    min: 83,
    max: 87,
    item: 'Braceletes de ouro',
  },
  {
    min: 90,
    max: 94,
    item: 'Robe do arquimago',
  },
  {
    min: 95,
    max: 96,
    item: 'Orbe das tempestades',
  },
  {
    min: 97,
    max: 98,
    item: 'Anel da regeneração',
  },
  {
    min: 99,
    max: 100,
    item: 'Espelho do aprisionamento',
  },
];

export const weaponsModifications: ItemMod[] = [
  {
    min: 1,
    max: 10,
    mod: 'Atroz',
    double: true,
  },
  {
    min: 11,
    max: 13,
    mod: 'Banhada a ouro',
  },
  {
    min: 14,
    max: 23,
    mod: 'Certeira',
  },
  {
    min: 24,
    max: 26,
    mod: 'Cravejada de gemas',
  },
  {
    min: 27,
    max: 36,
    mod: 'Cruel',
  },
  {
    min: 37,
    max: 39,
    mod: 'Discreta',
  },
  {
    min: 40,
    max: 44,
    mod: 'Equilibrada',
  },
  {
    min: 45,
    max: 48,
    mod: 'Harmonizada',
  },
  {
    min: 49,
    max: 53,
    mod: 'Injeção alquímica',
  },
  {
    min: 54,
    max: 55,
    mod: 'Macabra',
  },
  {
    min: 56,
    max: 65,
    mod: 'Maciça',
  },
  {
    min: 66,
    max: 75,
    mod: 'Material especial',
  },
  {
    min: 76,
    max: 80,
    mod: 'Mira telescópica',
  },
  {
    min: 81,
    max: 90,
    mod: 'Precisa',
  },
  {
    min: 91,
    max: 100,
    mod: 'Pungente',
    double: true,
  },
];

export const armorsModifications: ItemMod[] = [
  {
    min: 1,
    max: 15,
    mod: 'Ajustada',
  },
  {
    min: 16,
    max: 19,
    mod: 'Banhada a ouro',
  },
  {
    min: 20,
    max: 23,
    mod: 'Cravejada de gemas',
  },
  {
    min: 24,
    max: 28,
    mod: 'Delicada',
  },
  {
    min: 29,
    max: 32,
    mod: 'Discreta',
  },
  {
    min: 33,
    max: 37,
    mod: 'Espinhos',
  },
  {
    min: 38,
    max: 40,
    mod: 'Macabra',
  },
  {
    min: 41,
    max: 50,
    mod: 'Material especial',
  },
  {
    min: 51,
    max: 55,
    mod: 'Polida',
  },
  {
    min: 56,
    max: 80,
    mod: 'Reforçada',
  },
  {
    min: 81,
    max: 90,
    mod: 'Selada',
  },
  {
    min: 91,
    max: 100,
    mod: 'Sob medida',
    double: true,
  },
];
