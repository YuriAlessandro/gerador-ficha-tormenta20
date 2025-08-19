import Race from '../../interfaces/Race';
import { RACE_SIZES } from './raceSizes/raceSizes';

const DUENDE: Race = {
  name: 'Duende',
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    HYNINN: 1,
    NIMB: 1,
    WYNNA: 1,
  },
  size: RACE_SIZES.PEQUENO,
  getDisplacement: () => 9,
  abilities: [
    {
      name: 'Tipo de Criatura',
      description: 'Você é uma criatura do tipo Espírito.',
    },
    {
      name: 'Aversão a Ferro',
      description:
        'Você sofre 1 ponto de dano adicional por dado de dano de armas de ferro/aço e 1d6 de dano por rodada se empunhar ou vestir itens de ferro/aço.',
    },
    {
      name: 'Aversão a Sinos',
      description:
        'Ao ouvir o badalar de um sino, você fica nas condições alquebrado e esmorecido até o fim da cena. Em ambientes urbanos, há uma chance em seis (role 1d6, resultado 1) de ouvir um sino no início de qualquer cena.',
    },
    {
      name: 'Poderes de Duende',
      description:
        'Você pode escolher entre diferentes naturezas, tamanhos e poderes.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Poderes de Duende',
          },
          action: {
            type: 'special',
            specialAction: 'duendePowers',
          },
        },
      ],
    },
  ],
};

export default DUENDE;
