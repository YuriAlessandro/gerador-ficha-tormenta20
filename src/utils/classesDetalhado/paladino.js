import PERICIAS from '../pericias';

const PALADINO = {
  name: 'Paladino',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.LUTA, PERICIAS.VONTADE],
    }],
  periciasrestantes: {
    qtd: 2,
    list: [
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATLETISMO,
      PERICIAS.CAVALGAR,
      PERICIAS.CURA,
      PERICIAS.DIPLOMACIA,
      PERICIAS.FORTITUDE,
      PERICIAS.GUERRA,
      PERICIAS.INICIATIVA,
      PERICIAS.INTUICAO,
      PERICIAS.NOBREZA,
      PERICIAS.PERCEPCAO,
      PERICIAS.RELIGIAO,
    ],
  },
  proeficiencias: ['Armas marciais e escudos', 'Armaduras pesadas e escudos'],
  habilities: [
    {
      name: 'Abençoado',
      text: 'Você soma seu bônus de Carisma no seu total de pontos de mana no 1º nível. Além disso, torna-se devoto de uma divindade disponível para paladinos (Azgher, Khalmyr, Lena, Lin-Wu, Marah, Tanna-Toh, Thyatis, Valkaria). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. Como alternativa, você pode ser um paladino do bem, lutando em prol da bondade e da justiça como um todo. Não recebe nenhum Poder Concedido, mas não precisa seguir nenhuma Obrigação & Restrição (além do Código do Herói, abaixo).',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Código de Héroi',
      text: 'Você deve sempre manter sua palavra e nunca pode recusar um pedido de ajuda de alguém inocente. Além disso, nunca pode mentir, trapacear ou roubar. Se violar o código, você perde todos os seus PM e só pode recuperá-los a partir do próximo dia.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Golpe Divino',
      text: 'Quando faz um ataque corpo a corpo, você pode gastar 2 PM para desferir um golpe destruidor. Você soma seu bônus de Carisma no teste de ataque e +1d8 na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o dano em +1d8.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
};

export default PALADINO;
