import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const NOBRE = {
  name: 'Nobre',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'or',
      list: [PERICIAS.DIPLOMACIA, PERICIAS.INTIMIDACAO],
    },
    {
      type: 'and',
      list: [PERICIAS.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATUACAO,
      PERICIAS.CAVALGAR,
      PERICIAS.CONHECIMENTO,
      PERICIAS.DIPLOMACIA,
      PERICIAS.ENGANACAO,
      PERICIAS.FORTITUDE,
      PERICIAS.GUERRA,
      PERICIAS.INICIATIVA,
      PERICIAS.INTIMIDACAO,
      PERICIAS.INTUICAO,
      PERICIAS.INVESTIGACAO,
      PERICIAS.JOGATINA,
      PERICIAS.LUTA,
      PERICIAS.NOBREZA,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
      PERICIAS.PONTARIA,
    ],
  },
  proeficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.PESADAS,
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.SIMPLES,
  ],
  habilities: [
    {
      name: 'Autoconfiança',
      text:
        'Você pode somar seu bônus de Carisma em vez de Destreza na Defesa (mas continua não podendo somar um bônus de atributo na Defesa quando usa armadura pesada).',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Espólio',
      text: 'Você recebe um item a sua escolha com preço de até T$ 2.000.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Orgulho',
      text:
        'Quando faz um teste de perícia, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu modificador de Carisma). Para cada PM que gastar, recebe +2 no teste.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
};

export default NOBRE;
