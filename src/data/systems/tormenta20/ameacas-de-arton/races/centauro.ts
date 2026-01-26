import Equipment from '../../../../../interfaces/Equipment';
import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import { RACE_SIZES } from '../../races/raceSizes/raceSizes';

const cascos: Equipment = {
  group: 'Arma',
  nome: 'Cascos',
  dano: '1d8',
  critico: 'x2',
  tipo: 'Perf.',
  preco: 0,
};

const CENTAURO: Race = {
  name: 'Centauro',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    MEGALOKK: 1,
  },
  size: RACE_SIZES.GRANDE,
  getDisplacement: () => 12,
  abilities: [
    {
      name: 'Avantajado',
      description: 'Seu tamanho é Grande e seu deslocamento é 12m.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Avantajado' },
          target: { type: 'Displacement' },
          modifier: { type: 'Fixed', value: 3 },
        },
      ],
    },
    {
      name: 'Cascos',
      description:
        'Você possui uma arma natural de cascos (dano 1d8, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode escolher um poder Carga ou Investida mesmo sem cumprir seus pré-requisitos. Entretanto, se pode escolher Carga ou Investida e já tiver, estiver carregando um cavaleiro, sofre –2 em testes (além das penalidades de sobrecarga) se houver penalidades significativas; e se locomover em combates ruins para lançar magias.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Centauro',
          },
          action: {
            type: 'addEquipment',
            equipment: {
              Arma: [cascos],
            },
            description: 'Cascos pode ser usado como arma.',
          },
        },
      ],
    },
    {
      name: 'Ginete Natural',
      description:
        'Você é considerado uma montaria para efeitos de fazer testes e para benefícios das armas que empunha, e pode escolher o poder Ataque em Sela sem cumprir seus pré-requisitos. Entretanto, se pode escolher Ataque em Sela e já tiver, estiver carregando um cavaleiro, sofre –2 em testes (além das penalidades de sobrecarga) se houver penalidades significativas; e se locomover em combates ruins para lançar magias.',
    },
    {
      name: 'Medo de Altura',
      description:
        'Se estiver adjacente a uma queda de 3m ou mais (como um buraco ou penhasco), você fica abalado.',
    },
  ],
};

export default CENTAURO;
