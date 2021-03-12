import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const DAHLLAN: Race = {
  name: 'Dahllan',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 4 },
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: -2 },
    ],
    texts: [
      'Você pode lançar a magia Controlar Plantas (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      'Você pode gastar uma ação de movimento e 1 PM para transformar sua pele em casca de árvore, recebendo +2 na Defesa até o fim da cena.',
      'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento para mudar atitude e pedir favores de animais (veja Diplomacia, na página 117). Caso receba esta habilidade novamente, recebe +2 em Adestramento.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ALLIHANNA: 1,
    LENA: 1,
    OCEANO: 1,
    THWOR: 1,
  },
  abilities: [],
};

export default DAHLLAN;
