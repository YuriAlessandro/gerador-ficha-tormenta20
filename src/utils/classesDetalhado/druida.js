import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const DRUIDA = {
  name: 'Druida',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.SOBREVIVENCIA, PERICIAS.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATLESTISMO,
      PERICIAS.CAVALGAR,
      PERICIAS.CONHECIMENTO,
      PERICIAS.CURA,
      PERICIAS.FORIITUDE,
      PERICIAS.INICIATIVA,
      PERICIAS.INTUICAO,
      PERICIAS.LUTA,
      PERICIAS.MISTICISMO,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
      PERICIAS.RELIGIAO,
    ],
  },
  proeficiencias: [PROFICIENCIAS.SIMPLES, PROFICIENCIAS.LEVES],
  habilities: [
    {
      name: 'Devoto',
      text:
        'Você se torna devoto de uma divindade disponível para druidas (Allihanna, Megalokk ou Oceano). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. O nome desta habilidade muda de acordo com a divindade escolhida: Devoto de Allihanna, Devoto de Megalokk ou Devoto de Oceano.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Empatia Selvagem',
      text:
        'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e pedir favores (veja Diplomacia, na página 117).',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Empatia Selvagem',
      text:
        'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias divinas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma seu bônus de Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
};

export default DRUIDA;
