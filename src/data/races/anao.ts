import _ from 'lodash';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const ANAO: Race = {
  name: 'Anão',
  attributes: {
    attrs: [
      { attr: 'any', mod: 4 },
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: -2 },
    ],
    texts: [
      'Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.',
      'Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.',
      'Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte.',
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
  abilities: [
    {
      name: 'Conhecimento das Rochas',
      description:
        'Você recebe visão no escuro e +2 em testes de Precepção e Sobrevivência realizados no subterrâneo.',
    },
    {
      name: 'Devagar e Sempre',
      description:
        'Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.',
    },
    {
      name: 'Tradição de Heredrimm',
      description:
        'Você é perito nas armas tradicionais anãs, seja por ter treinado com elas, seja por usá-las como ferramentas de ofício. Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas. (Não contabilizado)',
    },
    {
      name: 'Duro com Pedra',
      description:
        'Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte.',
      action(sheet: CharacterSheet): CharacterSheet {
        return _.merge(sheet, {
          pv: sheet.pv + 3,
          classe: {
            addpv: sheet.classe.addpv + 1,
          },
        });
      },
    },
  ],
};

export default ANAO;
