import { ClassDescription } from '../../interfaces/Class';
import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const BARDO: ClassDescription = {
  name: 'Bardo',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.ATUACAO, PERICIAS.REFLEXOS],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      PERICIAS.ACROBACIA,
      PERICIAS.CAVALGAR,
      PERICIAS.CONHECIMENTO,
      PERICIAS.DIPLOMACIA,
      PERICIAS.ENGANACAO,
      PERICIAS.FURTIVIDADE,
      PERICIAS.INICIATIVA,
      PERICIAS.INTUICAO,
      PERICIAS.INVESTIGACAO,
      PERICIAS.JOGATINA,
      PERICIAS.LADINAGEM,
      PERICIAS.LUTA,
      PERICIAS.MISTICISMO,
      PERICIAS.NOBREZA,
      PERICIAS.PERCEPCAO,
      PERICIAS.PONTARIA,
      PERICIAS.RELIGIAO,
      PERICIAS.VONTADE,
    ],
  },
  proeficiencias: [
    PROFICIENCIAS.SIMPLES,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
  ],
  habilities: [
    {
      name: 'Inspiração',
      text:
        'Você pode gastar uma ação padrão e 2 PM para inspirar as pessoas com sua música (ou outro tipo de arte, como dança). Você e todos os seus aliados em alcance curto ganham +1 em testes de perícia até o fim da cena. A cada quatro níveis, pode gastar +2 PM para aumentar o bônus em +1.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Magias',
      text:
        'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias arcanas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Você pode lançar essas magias vestindo armaduras leves sem precisar de testes de Misticismo. Seu atributo-chave para lançar magias é Carisma e você soma seu bônus de Carisma no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
  probDevoto: 0.5,
};

export default BARDO;
