import _ from 'lodash';
import Race, { CharacterStats } from '../../interfaces/Race';
import { Ability } from '../abilities';
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
  abilities: {
    [Ability.CONHECIMENTO_DAS_ROCHAS]: {
      name: 'Conhecimento das Rochas',
      description:
        'Você recebe visão no escuro e +2 em testes de Precepção e Sobrevivência realizados no subterrâneo.',
    },
    [Ability.DEVAGAR_E_SEMPRE]: {
      name: 'Devagar e Sempre',
      description:
        'Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.',
    },
    [Ability.TRADICAO_DE_HEREDRIMM]: {
      name: 'Tradição de Heredrimm',
      description:
        'Você é perito nas armas tradicionais anãs, seja por ter treinado com elas, seja por usálas como ferramentas de ofício. Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas.',
    },
    [Ability.DURO_COMO_PEDRA]: {
      name: 'Duro com Pedra',
      description:
        'Você recebe +3 pontos de vida no 1o nível e +1 por nível seguinte.',
      action(stats: CharacterStats): CharacterStats {
        return _.merge(stats, {
          pv: stats.pv + 3,
          classDescription: {
            addpv: stats.classDescription.addpv + 1,
          },
        });
      },
    },
  },
};

export default ANAO;
