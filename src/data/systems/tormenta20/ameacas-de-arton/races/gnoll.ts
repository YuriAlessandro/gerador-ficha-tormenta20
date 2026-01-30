import Equipment from '../../../../../interfaces/Equipment';
import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';

const mordida: Equipment = {
  group: 'Arma',
  nome: 'Mordida',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Perf.',
  preco: 0,
};

const GNOLL: Race = {
  name: 'Gnoll',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    HYNINN: 1,
    MARAH: 1,
    MEGALOKK: 1,
    NIMB: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Faro',
      description:
        'Você tem olfato apurado. Contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha.',
    },
    {
      name: 'Mordida',
      description:
        'Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação acertar para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Gnoll' },
          action: {
            type: 'addEquipment',
            equipment: { Arma: [mordida] },
            description: 'Mordida pode ser usada como arma.',
          },
        },
      ],
    },
    {
      name: 'Oportunista',
      description:
        'Você recebe +2 em rolagens de dano contra criaturas que tenham sofrido dano de outras criaturas desde seu último turno.',
    },
    {
      name: 'Rendição',
      description:
        'Quando um inimigo se rende, você recebe 1d PM temporários cumulativos. Da mesma forma, quando é reduzido a um quarto de seus PV ou menos, seu instinto é se render. Caso continue lutando, fica abalroado.',
    },
  ],
};

export default GNOLL;
