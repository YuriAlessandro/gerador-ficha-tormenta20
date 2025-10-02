import Race from '../../../../interfaces/Race';

const HUMANO: Race = {
  name: 'Humano',
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    VALKARIA: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Versátil',
      description:
        'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Versátil',
          },
          action: {
            type: 'special',
            specialAction: 'humanoVersatil',
          },
        },
      ],
    },
  ],
};

export default HUMANO;
