import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const ANAO: Race = {
  name: 'Anão',
  habilites: {
    attrs: [
      { attr: 'any', mod: 4 },
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: -2 },
    ],
    other: [{ type: 'pv', mod: 3 }],
    texts: [
      'Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.',
      'Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.',
      'Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte (JÁ INCLUSO).',
      'Você é perito nas armas tradicionais anãs, seja por ter treinado com elas, seja por usá-las como ferramentas de ofício. Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ARSENAL: 1,
    KHALMYR: 1,
    LINWU: 1,
    THWOR: 1,
    TENEBRA: 1,
  },
  getDisplacement: () => 6,
};

export default ANAO;
