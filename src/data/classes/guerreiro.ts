import { ClassDescription } from '../../interfaces/Class';
import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const GUERREIRO: ClassDescription = {
  name: 'Guerreiro',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'or',
      list: [PERICIAS.LUTA, PERICIAS.PONTARIA],
    },
    {
      type: 'and',
      list: [PERICIAS.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATLETISMO,
      PERICIAS.CAVALGAR,
      PERICIAS.GUERRA,
      PERICIAS.INICIATIVA,
      PERICIAS.INTIMIDACAO,
      PERICIAS.LUTA,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
      PERICIAS.PONTARIA,
      PERICIAS.REFLEXOS,
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
      name: 'Ataque Especial',
      text:
        'Quando faz um ataque, você pode gastar 1 PM para receber +4 no teste de ataque ou na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +4. Você pode dividir os bônus igualmente. Por exemplo, no 17º nível, pode gastar 5 PM para receber +20 no ataque, +20 no dano ou +10 no ataque e +10 no dano.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
  probDevoto: 0.4,
};

export default GUERREIRO;
