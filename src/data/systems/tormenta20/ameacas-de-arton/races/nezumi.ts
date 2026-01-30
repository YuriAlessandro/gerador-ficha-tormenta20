import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';
import Equipment from '../../../../../interfaces/Equipment';

const mordida: Equipment = {
  group: 'Arma',
  nome: 'Mordida (Roedor)',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Corte',
  preco: 0,
};

const NEZUMI: Race = {
  name: 'Nezumi',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ARSENAL: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Empunhadura Poderosa',
      description:
        'Ao usar uma arma feita para uma categoria de tamanho maior que a sua (por exemplo, uma arma aumentada para uma criatura Pequena ou Média), a penalidade que você sofre nos testes de ataque diminui para –2. Caso receba esta habilidade novamente, a penalidade diminui para 0.',
    },
    {
      name: 'Pequeno, Mas Não Medrão',
      description:
        'Seu tamanho é Pequeno, mas seu deslocamento se mantém 9m e você recebe resistência +5 contra criaturas maiores que você e +2 em Intimidação.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Pequeno, Mas Não Medrão' },
          target: { type: 'Skill', name: Skill.INTIMIDACAO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Roedor',
      description:
        'Você possui uma arma natural de mordida (dano 1d6, crítico x2, corte). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida. Além disso, quando faz um acerto crítico com sua mordida, você deixa a armadura da vítima avariada ou, se ela estiver sem armadura, aumenta em +1 o multiplicador desse crítico.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Roedor' },
          action: {
            type: 'addEquipment',
            equipment: { Arma: [mordida] },
            description: 'Mordida pode ser usada como arma.',
          },
        },
      ],
    },
    {
      name: 'Sentidos Murídeos',
      description: 'Você recebe faro e visão na penumbra.',
    },
    {
      name: 'Longevidade',
      description: 'Normal.',
    },
    {
      name: 'Devotos',
      description: 'Arsenal, Megalokk, Tenebra.',
    },
  ],
};

export default NEZUMI;
