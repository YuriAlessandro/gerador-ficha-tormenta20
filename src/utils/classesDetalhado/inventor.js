import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const INVENTOR = {
  name: 'Inventor',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.OFICIO, PERICIAS.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      PERICIAS.CONHECIMENTO,
      PERICIAS.CURA,
      PERICIAS.DIPLOMACIA,
      PERICIAS.FORTITUDE,
      PERICIAS.INICIATIVA,
      PERICIAS.INVESTIGACAO,
      PERICIAS.LUTA,
      PERICIAS.MISTICISMO,
      PERICIAS.OFICIO,
      PERICIAS.PILOTAGEM,
      PERICIAS.PONTARIA,
      PERICIAS.PERCEPCAO,
    ],
  },
  proeficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.NENHUMA,
    PROFICIENCIAS.SIMPLES,
  ],
  habilities: [
    {
      name: 'Engenhosidade',
      text:
        'Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Inteligência no teste. Você não pode usar esta habilidade em testes de ataque.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Protótipo',
      text:
        'Você começa o jogo com um item superior com uma modificação ou 10 itens alquímicos, com preço total de até T$ 500. Veja o Capítulo 3: Equipamento para a lista de itens.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
  probDevoto: 0.3,
};

export default INVENTOR;
