import {
  ItemE,
  ItemM,
  Items,
  ItemWeapons,
  ITEM_TYPE,
} from '../../interfaces/Rewards';
import { Armaduras, Armas, Escudos } from '../equipamentos';

export const itemsRewards: Items = {
  S4: [
    {
      min: 1,
      max: 55,
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
  S2: [
    {
      min: 1,
      max: 45,
    },
    {
      min: 46,
      max: 70,
      reward: {
        qty: 2,
        dice: 6,
        type: ITEM_TYPE.DIVERSO,
      },
    },
    {
      min: 71,
      max: 100,
      reward: {
        qty: 2,
        dice: 8,
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
      max: 70,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
    {
      min: 71,
      max: 95,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 96,
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
      max: 60,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.ARMA_ARMADURA,
      },
    },
    {
      min: 61,
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
  F4: [
    {
      min: 1,
      max: 25,
    },
    {
      min: 26,
      max: 75,
      reward: {
        qty: 1,
        dice: 1,
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
  F5: [
    {
      min: 1,
      max: 25,
    },
    {
      min: 26,
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
      max: 25,
    },
    {
      min: 26,
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
      max: 15,
    },
    {
      min: 26,
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
      max: 25,
    },
    {
      min: 26,
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
        mods: 4,
      },
    },
  ],
  F9: [
    {
      min: 1,
      max: 50,
    },
    {
      min: 51,
      max: 95,
      reward: {
        qty: 1,
        dice: 4,
        som: 1,
        type: ITEM_TYPE.POCAO,
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
        mods: 5,
      },
    },
  ],
  F11: [
    {
      min: 1,
      max: 50,
    },
    {
      min: 51,
      max: 85,
      reward: {
        qty: 1,
        dice: 4,
        som: 1,
        type: ITEM_TYPE.POCAO,
      },
    },
    {
      min: 86,
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
      max: 50,
    },
    {
      min: 51,
      max: 95,
      reward: {
        qty: 1,
        dice: 1,
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
        type: ITEM_TYPE.SUPERIOR,
        mods: 6,
      },
    },
  ],
  F13: [
    {
      min: 1,
      max: 45,
    },
    {
      min: 46,
      max: 95,
      reward: {
        qty: 1,
        dice: 6,
        type: ITEM_TYPE.POCAO,
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
      max: 45,
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
        type: ITEM_TYPE.SUPERIOR,
        mods: 6,
      },
    },
  ],
  F15: [
    {
      min: 1,
      max: 45,
    },
    {
      min: 46,
      max: 85,
      reward: {
        qty: 1,
        dice: 6,
        som: 1,
        type: ITEM_TYPE.POCAO,
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
      max: 45,
    },
    {
      min: 46,
      max: 80,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 5,
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
      max: 45,
    },
    {
      min: 46,
      max: 95,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 5,
      },
    },
    {
      min: 96,
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
      max: 45,
    },
    {
      min: 46,
      max: 90,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.SUPERIOR,
        mods: 6,
      },
    },
    {
      min: 91,
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
      max: 45,
    },
    {
      min: 46,
      max: 85,
      reward: {
        qty: 1,
        dice: 1,
        type: ITEM_TYPE.MAGICO_MEDIO,
      },
    },
    {
      min: 86,
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
      max: 45,
    },
    {
      min: 46,
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
};

export const miscellaneousItems: ItemM[] = [
  {
    min: 1,
    max: 5,
    item: 'Ácido',
  },
  {
    min: 6,
    max: 10,
    item: 'Água Benta',
  },
  {
    min: 11,
    max: 11,
    item: 'Algemas',
  },
  {
    min: 12,
    max: 26,
    item: 'Bálsamo restaurador',
  },
  {
    min: 27,
    max: 31,
    item: 'Corda',
  },
  {
    min: 32,
    max: 32,
    item: 'Bomba',
  },
  {
    min: 33,
    max: 47,
    item: 'Essência de mana',
  },
  {
    min: 48,
    max: 49,
    item: 'Espelho de metal',
  },
  {
    min: 50,
    max: 54,
    item: 'Fogo alquímico',
  },
  {
    min: 55,
    max: 56,
    item: 'Instrumento musical',
  },
  {
    min: 57,
    max: 58,
    item: 'Kit de ofício',
  },
  {
    min: 59,
    max: 60,
    item: 'Kit de disfarces',
  },
  {
    min: 61,
    max: 62,
    item: 'Kit de ladrão',
  },
  {
    min: 63,
    max: 64,
    item: 'Kit de medicamentos',
  },
  {
    min: 65,
    max: 69,
    item: 'Lampião',
  },
  {
    min: 70,
    max: 74,
    item: 'Mochila',
  },
  {
    min: 75,
    max: 79,
    item: 'Odre',
  },
  {
    min: 80,
    max: 81,
    item: 'Pé de Cabra',
  },
  {
    min: 82,
    max: 83,
    item: 'Pederneira',
  },
  {
    min: 84,
    max: 88,
    item: 'Rações de viagem',
    effect: {
      qtd: 1,
      dice: 6,
    },
  },
  {
    min: 89,
    max: 93,
    item: 'Saco de Dormir',
  },
  {
    min: 94,
    max: 98,
    item: 'Tochas',
    effect: {
      qtd: 1,
      dice: 3,
    },
  },
  {
    min: 99,
    max: 100,
    item: 'Vara de Madeira',
  },
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
    item: Armaduras.ARMADURA_ACOLCHOADA,
  },
  {
    min: 6,
    max: 20,
    item: Armaduras.ARMADURA_COMPLETA,
  },
  {
    min: 21,
    max: 25,
    item: Armaduras.ARMADURADECOURO,
  },
  {
    min: 26,
    max: 30,
    item: Armaduras.BRUNEA,
  },
  {
    min: 31,
    max: 35,
    item: Armaduras.COTA_DE_MALHA,
  },
  {
    min: 36,
    max: 50,
    item: Armaduras.COURACA,
  },
  {
    min: 51,
    max: 60,
    item: Armaduras.COUROBATIDO,
  },
  {
    min: 61,
    max: 70,
    item: Escudos.ESCUDOLEVE,
  },
  {
    min: 71,
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
  {
    min: 1,
    max: 1,
    item: 'Abençoar Alimentos (óleo)',
  },
  {
    min: 2,
    max: 3,
    item: 'Área Escorregadia (granada)',
  },
  {
    min: 4,
    max: 6,
    item: 'Arma Mágica (óleo)',
  },
  {
    min: 7,
    max: 7,
    item: 'Compreensão',
  },
  {
    min: 8,
    max: 15,
    item: 'Curar Ferimentos (2d8+2 PV)',
  },
  {
    min: 16,
    max: 18,
    item: 'Disfarce Ilusório',
  },
  {
    min: 19,
    max: 20,
    item: 'Enfeitiçar',
  },
  {
    min: 21,
    max: 22,
    item: 'Escuridão (óleo)',
  },
  {
    min: 23,
    max: 24,
    item: 'Luz (óleo)',
  },
  {
    min: 25,
    max: 26,
    item: 'Névoa (granada)',
  },
  {
    min: 27,
    max: 28,
    item: 'Primor Atlético',
  },
  {
    min: 29,
    max: 30,
    item: 'Proteção Divina',
  },
  {
    min: 31,
    max: 32,
    item: 'Resistência a Energia',
  },
  {
    min: 33,
    max: 34,
    item: 'Sono',
  },
  {
    min: 35,
    max: 35,
    item: 'Suporte Ambiental',
  },
  {
    min: 36,
    max: 36,
    item: 'Tranca Arcana (óleo)',
  },
  {
    min: 37,
    max: 37,
    item: 'Visão Mística',
  },
  {
    min: 38,
    max: 38,
    item: 'Vitalidade Fantasma',
  },
  {
    min: 39,
    max: 41,
    item: 'Escudo da Fé (aprimoramento para duração cena)',
  },
  {
    min: 42,
    max: 43,
    item: 'Alterar Tamanho',
  },
  {
    min: 44,
    max: 45,
    item: 'Aparência Perfeita',
  },
  {
    min: 46,
    max: 46,
    item: 'Armamento da Natureza (óleo)',
  },
  {
    min: 47,
    max: 52,
    item: 'Bola de Fogo (granada)',
  },
  {
    min: 53,
    max: 53,
    item: 'Camuflagem Ilusória',
  },
  {
    min: 54,
    max: 55,
    item: 'Concentração de Combate (aprimoramento para duração cena)',
  },
  {
    min: 56,
    max: 62,
    item: 'Curar Ferimentos (4d8+4 PV)',
  },
  {
    min: 63,
    max: 66,
    item: 'Físico Divino',
  },
  {
    min: 67,
    max: 68,
    item: 'Mente Divina',
  },
  {
    min: 69,
    max: 70,
    item: 'Metamorfose',
  },
  {
    min: 71,
    max: 75,
    item: 'Purificação',
  },
  {
    min: 76,
    max: 77,
    item: 'Velocidade',
  },
  {
    min: 78,
    max: 79,
    item: 'Vestimenta da Fé (óleo)',
  },
  {
    min: 80,
    max: 80,
    item: 'Voz Divina',
  },
  {
    min: 81,
    max: 82,
    item: 'Arma Mágica (óleo; aprimoramento para bônus +3)',
  },
  {
    min: 83,
    max: 88,
    item: 'Curar Ferimentos (7d8+7 PV)',
  },
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
  {
    min: 97,
    max: 100,
    item: 'Curar Ferimentos (11d8+11 PV)',
  },
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
    effect: 'Bônus contra um tipo de criatura',
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
    effect: 'Ignora camuflagem e cobertura',
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
  {
    min: 29,
    max: 30,
    enchantment: 'Dançarina',
    effect: 'Ataca sozinha',
  },
  {
    min: 31,
    max: 34,
    enchantment: 'Defensora',
    effect: 'Defesa +2',
  },
  {
    min: 35,
    max: 36,
    enchantment: 'Destruidora',
    effect: 'Bônus contra construtos',
  },
  {
    min: 37,
    max: 38,
    enchantment: 'Drenante',
    effect: 'Crítico drena vítima',
  },
  {
    min: 39,
    max: 43,
    enchantment: 'Elétrica',
    effect: '+1d6 de dano de eletricidade',
  },
  {
    min: 44,
    max: 45,
    enchantment: 'Energética',
    effect: 'Bônus em ataque',
    double: true,
  },
  {
    min: 46,
    max: 47,
    enchantment: 'Excruciante',
    effect: 'Causa fraqueza',
  },
  {
    min: 48,
    max: 52,
    enchantment: 'Flamejante',
    effect: '+1d6 de dano de fogo',
  },
  {
    min: 53,
    max: 62,
    enchantment: 'Formidável',
    effect: 'Ataque e dano +2',
  },
  {
    min: 63,
    max: 64,
    enchantment: 'Lancinante',
    effect: 'Causa crítico terrível',
  },
  {
    min: 65,
    max: 72,
    enchantment: 'Magnífica',
    effect: 'Ataque e dano +4',
    double: true,
  },
  {
    min: 73,
    max: 74,
    enchantment: 'Piedosa',
    effect: 'Dano não letal',
  },
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
  {
    min: 79,
    max: 80,
    enchantment: 'Sanguinária',
    effect: 'Causa sangramento',
  },
  {
    min: 81,
    max: 82,
    enchantment: 'Trovejante',
    effect: 'Causa atordoamento',
  },
  {
    min: 83,
    max: 84,
    enchantment: 'Tumular',
    effect: '+1d8 de dano de trevas',
  },
  {
    min: 85,
    max: 88,
    enchantment: 'Veloz',
    effect: 'Fornece ataque extra',
  },
  {
    min: 89,
    max: 90,
    enchantment: 'Venenosa',
    effect: 'Causa envenenamento',
  },
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
  {
    min: 11,
    max: 12,
    enchantment: 'Acrobático',
    effect: 'Bônus em Acrobacia',
  },
  {
    min: 13,
    max: 14,
    enchantment: 'Alado',
    effect: 'Deslocamento de voo 12m',
  },
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
  {
    min: 23,
    max: 32,
    enchantment: 'Defensor',
    effect: 'Defesa +2',
  },
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
  {
    min: 63,
    max: 68,
    enchantment: 'Invulnerável',
    effect: 'Resistência a dano',
  },
  {
    min: 69,
    max: 72,
    enchantment: 'Opaco',
    effect: 'Resistência a energia',
  },
  {
    min: 73,
    max: 78,
    enchantment: 'Protetor',
    effect: 'Resistência +2',
  },
  {
    min: 79,
    max: 80,
    enchantment: 'Refletor',
    effect: 'Reflete magia',
  },
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
  {
    min: 87,
    max: 88,
    enchantment: 'Sombrio',
    effect: 'Bônus em Furtividade',
  },
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
