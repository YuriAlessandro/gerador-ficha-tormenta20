import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const LUTADOR = {
  name: 'Lutador',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.LUTA, PERICIAS.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      PERICIAS.ACROBACIA,
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATLETISMO,
      PERICIAS.ENGANACAO,
      PERICIAS.FURTIVIDADE,
      PERICIAS.INICIATIVA,
      PERICIAS.INTIMIDACAO,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
      PERICIAS.PONTARIA,
      PERICIAS.REFLEXOS,
    ],
  },
  proeficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.SIMPLES,
  ],
  habilities: [
    {
      name: 'Briga',
      text:
        'Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal (sem penalidades). A cada quatro níveis, seu dano desarmado aumenta, conforme a tabela. O dano na tabela é para criaturas Pequenas e Médias. Criaturas Minúsculas diminuem esse dano em um passo, Grandes e Enormes aumentam em um passo e Colossais aumentam em dois passos.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Golpe Relâmpago',
      text:
        'Quando usa a ação atacar para fazer um ataque desarmado, você pode gastar 1 PM para realizar um ataque desarmado adicional.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
};

export default LUTADOR;
