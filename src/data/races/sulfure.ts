import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const SULFURE: Race = {
  name: 'Suraggel (Sulfure)',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 4 },
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 4 },
    ],
    texts: [
      'Você é uma criatura do tipo espírito e recebe visão no escuro.',
      'Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributochave Inteligência). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    KALLYADRANOCH: 1,
    TENEBRA: 1,
  },
};

export default SULFURE;
