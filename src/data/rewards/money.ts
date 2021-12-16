import { Money, MONEY_TYPE } from '../../interfaces/Rewards';

export const moneyRewards: Money = {
  S4: [
    {
      min: 1,
      max: 35,
    },
    {
      min: 36,
      max: 75,
      reward: {
        qty: 1,
        dice: 6,
        mult: 10,
        money: MONEY_TYPE.TC,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 1,
        dice: 4,
        mult: 100,
        money: MONEY_TYPE.TC,
      },
    },
  ],
  S3: [
    {
      min: 1,
      max: 30,
    },
    {
      min: 31,
      max: 75,
      reward: {
        qty: 1,
        dice: 6,
        mult: 100,
        money: MONEY_TYPE.TC,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 2,
        dice: 4,
        mult: 10,
        money: MONEY_TYPE.TS,
      },
    },
  ],
  S2: [
    {
      min: 1,
      max: 25,
    },
    {
      min: 26,
      max: 75,
      reward: {
        qty: 2,
        dice: 6,
        mult: 100,
        money: MONEY_TYPE.TC,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 2,
        dice: 8,
        mult: 10,
        money: MONEY_TYPE.TS,
      },
    },
  ],
  F1: [
    {
      min: 1,
      max: 20,
    },
    {
      min: 21,
      max: 70,
      reward: {
        qty: 3,
        dice: 8,
        mult: 10,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 71,
      max: 95,
      reward: {
        qty: 3,
        dice: 12,
        mult: 10,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 96,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
  ],
  F2: [
    {
      min: 1,
      max: 15,
    },
    {
      min: 16,
      max: 65,
      reward: {
        qty: 3,
        dice: 10,
        mult: 10,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 66,
      max: 95,
      reward: {
        qty: 2,
        dice: 4,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 96,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
  ],
  F3: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 60,
      reward: {
        qty: 1,
        dice: 4,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 61,
      max: 90,
      reward: {
        qty: 1,
        dice: 8,
        mult: 10,
        money: MONEY_TYPE.TO,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
  ],
  F4: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 60,
      reward: {
        qty: 1,
        dice: 6,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 61,
      max: 90,
      reward: {
        qty: 1,
        dice: 12,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
  ],
  F5: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 60,
      reward: {
        qty: 1,
        dice: 8,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 61,
      max: 90,
      reward: {
        qty: 3,
        dice: 4,
        mult: 10,
        money: MONEY_TYPE.TO,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
  ],
  F6: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 60,
      reward: {
        qty: 2,
        dice: 6,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 61,
      max: 90,
      reward: {
        qty: 2,
        dice: 10,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
  ],
  F7: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 60,
      reward: {
        qty: 2,
        dice: 8,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 61,
      max: 90,
      reward: {
        qty: 2,
        dice: 12,
        mult: 10,
        money: MONEY_TYPE.TO,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 4,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
  ],
  F8: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 60,
      reward: {
        qty: 2,
        dice: 10,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 61,
      max: 90,
      reward: {
        qty: 1,
        dice: 4,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MENOR,
      },
    },
    {
      min: 91,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MEDIA,
      },
    },
  ],
  F9: [
    {
      min: 1,
      max: 15,
    },
    {
      min: 16,
      max: 85,
      reward: {
        qty: 4,
        dice: 6,
        mult: 100,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 86,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MEDIA,
      },
    },
  ],
  F10: [
    {
      min: 1,
      max: 15,
    },
    {
      min: 16,
      max: 85,
      reward: {
        qty: 4,
        dice: 10,
        mult: 10,
        money: MONEY_TYPE.TO,
      },
    },
    {
      min: 86,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MEDIA,
      },
    },
  ],
  F11: [
    {
      min: 1,
      max: 15,
    },
    {
      min: 16,
      max: 85,
      reward: {
        qty: 2,
        dice: 4,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 86,
      max: 100,
      reward: {
        qty: 2,
        dice: 6,
        mult: 100,
        money: MONEY_TYPE.TO,
      },
    },
  ],
  F12: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 80,
      reward: {
        qty: 2,
        dice: 6,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 1,
        dice: 4,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MEDIA,
      },
    },
  ],
  F13: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 80,
      reward: {
        qty: 4,
        dice: 4,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 4,
        dice: 6,
        mult: 100,
        money: MONEY_TYPE.TC,
      },
    },
  ],
  F14: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 80,
      reward: {
        qty: 3,
        dice: 6,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 1,
        dice: 1,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MAIOR,
      },
    },
  ],
  F15: [
    {
      min: 1,
      max: 10,
    },
    {
      min: 11,
      max: 80,
      reward: {
        qty: 2,
        dice: 10,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 81,
      max: 100,
      reward: {
        qty: 1,
        dice: 4,
        mult: 1000,
        money: MONEY_TYPE.TO,
      },
    },
  ],
};

// export const minorRich;
