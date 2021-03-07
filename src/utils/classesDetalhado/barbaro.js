import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const BARBARO = {
  name: 'Bárbaro',
  pv: 24,
  addpv: 6,
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
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATLETISMO,
      PERICIAS.CAVALGAR,
      PERICIAS.INICIATIVA,
      PERICIAS.INTIMIDACAO,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
      PERICIAS.PONTARIA,
      PERICIAS.SOBREVIVENCIA,
      PERICIAS.VONTADE,
    ],
  },
  proeficiencias: [
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.SIMPLES,
  ],
  habilities: [
    {
      name: 'Furia',
      text:
        'Você pode gastar 2 PM para invocar uma fúria selvagem, tornando-se temível em combate. Você recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode fazer nenhuma ação que exija calma e concentração (como usar a perícia Furtividade ou lançar magias). A cada cinco níveis, pode gastar +2 PM para aumentar os bônus em +1. A Fúria termina se, ao fim da rodada, você não tiver atacado nem sido alvo de um efeito (ataque, habilidade, magia...) hostil.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
  probDevoto: 0.5,
};

export default BARBARO;
