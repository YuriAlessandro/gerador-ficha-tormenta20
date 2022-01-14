import Equipment from './Equipment';

export enum LEVELS {
  S4 = 'S4',
  S3 = 'S3',
  S2 = 'S2',
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  F13 = 'F13',
  F14 = 'F14',
  F15 = 'F15',
  F16 = 'F16',
  F17 = 'F17',
  F18 = 'F18',
  F19 = 'F19',
  F20 = 'F20',
}

export enum MONEY_TYPE {
  TC = 'TC',
  TS = 'T$',
  TO = 'TO',
  RIQUEZA_MENOR = 'Riquezas menores',
  RIQUEZA_MEDIA = 'Riquezas médias',
  RIQUEZA_MAIOR = 'Riquezas maiores',
}

export enum ITEM_TYPE {
  DIVERSO = 'Diverso',
  ARMA_ARMADURA = 'Arma/Armadura',
  POCAO = 'Poção',
  SUPERIOR = 'Superior',
  MAGICO_MENOR = 'Item Mágico (menor)',
  MAGICO_MEDIO = 'Item Mágico (médio)',
  MAGICO_MAIOR = 'Item Mágico (maior)',
}

export interface MoneyReward {
  min: number;
  max: number;
  reward?: {
    dice: number;
    qty: number;
    money: MONEY_TYPE;
    mult: number;
    som?: number;
  };
}

export interface ItemReward {
  min: number;
  max: number;
  reward?: {
    dice: number;
    qty: number;
    type: ITEM_TYPE;
    som?: number;
    mods?: number;
  };
}

export type Money = {
  [key in LEVELS]: MoneyReward[];
};

export type Items = {
  [key in LEVELS]: ItemReward[];
};

export interface Rych {
  min: number;
  max: number;
  value: {
    qtd: number;
    dice: number;
    mult: number;
  };
  items: string[];
}

export interface ItemM {
  min: number;
  max: number;
  item: string;
  effect?: {
    qtd: number;
    dice: number;
  };
}

export interface ItemWeapons {
  min: number;
  max: number;
  item: Equipment;
}

export interface ItemE {
  min: number;
  max: number;
  enchantment: string;
  effect: string;
  double?: boolean;
  onlyShield?: boolean;
}

export interface ItemMod {
  min: number;
  max: number;
  mod: string;
  double?: boolean;
}
