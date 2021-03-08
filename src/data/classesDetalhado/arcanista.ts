import { ClassDescription } from '../../interfaces/Class';
import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const ARCANISTA: ClassDescription = {
  name: 'Arcanista',
  pv: 8,
  addpv: 2,
  pm: 6,
  addpm: 6,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.MISTICISMO, PERICIAS.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 1,
    list: [
      PERICIAS.CONHECIMENTO,
      PERICIAS.INICIATIVA,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
    ],
  },
  proeficiencias: [PROFICIENCIAS.SIMPLES, PROFICIENCIAS.LEVES],
  habilities: [
    {
      name: 'Caminho do Arcanista',
      text: 'A FAZER MELHOR',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
  probDevoto: 0.4,
};

export default ARCANISTA;
