import { Money, MONEY_TYPE, Rych } from '../../interfaces/Rewards';

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
        money: MONEY_TYPE.RIQUEZA_MEDIA,
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
  F16: [
    {
      min: 1,
      max: 5,
    },
    {
      min: 6,
      max: 75,
      reward: {
        qty: 3,
        dice: 8,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        money: MONEY_TYPE.RIQUEZA_MAIOR,
      },
    },
  ],
  F17: [
    {
      min: 1,
      max: 5,
    },
    {
      min: 6,
      max: 75,
      reward: {
        qty: 4,
        dice: 6,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 2,
        dice: 4,
        mult: 1000,
        money: MONEY_TYPE.TO,
      },
    },
  ],
  F18: [
    {
      min: 1,
      max: 5,
    },
    {
      min: 6,
      max: 75,
      reward: {
        qty: 4,
        dice: 10,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 1,
        dice: 3,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MAIOR,
      },
    },
  ],
  F19: [
    {
      min: 1,
      max: 5,
    },
    {
      min: 6,
      max: 75,
      reward: {
        qty: 4,
        dice: 12,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 1,
        dice: 12,
        mult: 1000,
        money: MONEY_TYPE.TO,
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
      max: 75,
      reward: {
        qty: 2,
        dice: 4,
        mult: 1000,
        money: MONEY_TYPE.TS,
      },
    },
    {
      min: 76,
      max: 100,
      reward: {
        qty: 1,
        dice: 4,
        mult: 1,
        som: 1,
        money: MONEY_TYPE.RIQUEZA_MAIOR,
      },
    },
  ],
};

export const minorRych: Rych[] = [
  {
    min: 1,
    max: 25,
    value: {
      qtd: 4,
      dice: 4,
      mult: 1,
    },
    items: [
      'Ágata',
      'Barril de farinha',
      'Gaiola com galinhas vivas',
      'Hematita',
    ],
  },
  {
    min: 26,
    max: 40,
    value: {
      qtd: 1,
      dice: 4,
      mult: 10,
    },
    items: [
      'Caixa de tabaco',
      'Jarro de especiarias',
      'Quartzo rosa',
      'Rolo de linho',
      'Topázio',
    ],
  },
  {
    min: 41,
    max: 55,
    value: {
      qtd: 2,
      dice: 4,
      mult: 10,
    },
    items: [
      'Estatueta de osso ou marfim entalhado',
      'Pequeno bracelete de ouro finamente trabalhado',
      'Rolo de seda',
      'Vaso de prata.',
    ],
  },
  {
    min: 56,
    max: 70,
    value: {
      qtd: 4,
      dice: 6,
      mult: 10,
    },
    items: [
      'Lingote de prata',
      'Ametista',
      'Pérola branca',
      'Cálice de prata com gemas de lápis-lazúli',
      'Tapeçaria grande e bem-feita de lã',
    ],
  },
  {
    min: 71,
    max: 85,
    value: {
      qtd: 1,
      dice: 6,
      mult: 100,
    },
    items: [
      'Alexandrita',
      'Pérola negra',
      'Pente de prata com pedras preciosas',
      'Espada cerimonial ornada com prata e gema negra no cabo',
    ],
  },
  {
    min: 86,
    max: 95,
    value: {
      qtd: 2,
      dice: 6,
      mult: 100,
    },
    items: [
      'Harpa de madeira exótica com ornamentos de zircão e marfim',
      'Pente em forma de dragão com olhos de gema vermelha',
    ],
  },
  {
    min: 96,
    max: 99,
    value: {
      qtd: 2,
      dice: 8,
      mult: 100,
    },
    items: [
      'Lingote de ouro',
      'Safira azul',
      'Opala negra',
      'Tapa-olho com um olho falso de safira',
      'Pingente de opala vermelha em uma correntinha de ouro',
      'Pintura antiga',
      'Luva bordada e adornada com gemas',
    ],
  },
  {
    min: 100,
    max: 101,
    value: {
      qtd: 4,
      dice: 10,
      mult: 100,
    },
    items: [
      'Esmeralda verde',
      'Manto bordado em veludo e seda com inúmeras pedras preciosas',
      'Pingente de safira',
      'Tornozeleira com gemas',
      'Caixinha de música de ouro',
    ],
  },
];

export const mediumRych: Rych[] = [
  {
    min: 1,
    max: 10,
    value: {
      qtd: 2,
      dice: 4,
      mult: 10,
    },
    items: [
      'Estatueta de osso ou marfim entalhado',
      'Pequeno bracelete de ouro finamente trabalhado',
      'Rolo de seda',
      'Vaso de prata.',
    ],
  },
  {
    min: 11,
    max: 30,
    value: {
      qtd: 4,
      dice: 6,
      mult: 10,
    },
    items: [
      'Lingote de prata',
      'Ametista',
      'Pérola branca',
      'Cálice de prata com gemas de lápis-lazúli',
      'Tapeçaria grande e bem-feita de lã',
    ],
  },
  {
    min: 31,
    max: 50,
    value: {
      qtd: 1,
      dice: 6,
      mult: 100,
    },
    items: [
      'Alexandrita',
      'Pérola negra',
      'Pente de prata com pedras preciosas',
      'Espada cerimonial ornada com prata e gema negra no cabo',
    ],
  },
  {
    min: 51,
    max: 65,
    value: {
      qtd: 2,
      dice: 6,
      mult: 100,
    },
    items: [
      'Harpa de madeira exótica com ornamentos de zircão e marfim',
      'Pente em forma de dragão com olhos de gema vermelha',
    ],
  },
  {
    min: 66,
    max: 80,
    value: {
      qtd: 2,
      dice: 8,
      mult: 100,
    },
    items: [
      'Lingote de ouro',
      'Safira azul',
      'Opala negra',
      'Tapa-olho com um olho falso de safira',
      'Pingente de opala vermelha em uma correntinha de ouro',
      'Pintura antiga',
      'Luva bordada e adornada com gemas',
    ],
  },
  {
    min: 81,
    max: 90,
    value: {
      qtd: 4,
      dice: 10,
      mult: 100,
    },
    items: [
      'Esmeralda verde',
      'Manto bordado em veludo e seda com inúmeras pedras preciosas',
      'Pingente de safira',
      'Tornozeleira com gemas',
      'Caixinha de música de ouro',
    ],
  },
  {
    min: 91,
    max: 95,
    value: {
      qtd: 6,
      dice: 12,
      mult: 100,
    },
    items: [
      'Diamante branco',
      'Anel de prata e safira',
      'Correntinha com pequenas pérolas rosas',
      'Ídolo de ouro puro maciço',
    ],
  },
  {
    min: 96,
    max: 99,
    value: {
      qtd: 2,
      dice: 10,
      mult: 1000,
    },
    items: [
      'Diamante vermelho',
      'Anel de ouro e rubi',
      'Conjunto de taças de ouro decoradas com esmeraldas',
    ],
  },
  {
    min: 100,
    max: 101,
    value: {
      qtd: 6,
      dice: 8,
      mult: 1000,
    },
    items: [
      'Coroa de ouro adornada com centenas de gemas, pertencente a um antigo monarca',
    ],
  },
];

export const majorRych: Rych[] = [
  {
    min: 1,
    max: 5,
    value: {
      qtd: 1,
      dice: 6,
      mult: 100,
    },
    items: [
      'Alexandrita',
      'Pérola negra',
      'Pente de prata com pedras preciosas',
      'Espada cerimonial ornada com prata e gema negra no cabo',
    ],
  },
  {
    min: 6,
    max: 15,
    value: {
      qtd: 2,
      dice: 6,
      mult: 100,
    },
    items: [
      'Harpa de madeira exótica com ornamentos de zircão e marfim',
      'Pente em forma de dragão com olhos de gema vermelha',
    ],
  },
  {
    min: 16,
    max: 25,
    value: {
      qtd: 2,
      dice: 8,
      mult: 100,
    },
    items: [
      'Lingote de ouro',
      'Safira azul',
      'Opala negra',
      'Tapa-olho com um olho falso de safira',
      'Pingente de opala vermelha em uma correntinha de ouro',
      'Pintura antiga',
      'Luva bordada e adornada com gemas',
    ],
  },
  {
    min: 26,
    max: 40,
    value: {
      qtd: 4,
      dice: 10,
      mult: 100,
    },
    items: [
      'Esmeralda verde',
      'Manto bordado em veludo e seda com inúmeras pedras preciosas',
      'Pingente de safira',
      'Tornozeleira com gemas',
      'Caixinha de música de ouro',
    ],
  },
  {
    min: 41,
    max: 60,
    value: {
      qtd: 6,
      dice: 12,
      mult: 100,
    },
    items: [
      'Diamante branco',
      'Anel de prata e safira',
      'Correntinha com pequenas pérolas rosas',
      'Ídolo de ouro puro maciço',
    ],
  },
  {
    min: 61,
    max: 75,
    value: {
      qtd: 2,
      dice: 10,
      mult: 1000,
    },
    items: [
      'Diamante vermelho',
      'Anel de ouro e rubi',
      'Conjunto de taças de ouro decoradas com esmeraldas',
    ],
  },
  {
    min: 76,
    max: 85,
    value: {
      qtd: 6,
      dice: 8,
      mult: 1000,
    },
    items: [
      'Coroa de ouro adornada com centenas de gemas, pertencente a um antigo monarca',
    ],
  },
  {
    min: 86,
    max: 95,
    value: {
      qtd: 1,
      dice: 10,
      mult: 10000,
    },
    items: [
      'Arca de madeira reforçada repleta de barras de prata e ouro e pedras preciosas de vários tipos',
    ],
  },
  {
    min: 96,
    max: 100,
    value: {
      qtd: 4,
      dice: 12,
      mult: 10000,
    },
    items: ['Uma sala forrada de moedas!'],
  },
];
