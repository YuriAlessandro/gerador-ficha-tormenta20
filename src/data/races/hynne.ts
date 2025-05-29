import Skill from '@/interfaces/Skills';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

const HYNNE: Race = {
  name: 'Hynne',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.CARISMA, mod: 1 },
      { attr: Atributo.FORCA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    HYNINN: 1,
    MARAH: 1,
    OCEANO: 1,
    THWOR: 1,
  },
  size: RACE_SIZES.PEQUENO,
  getDisplacement: () => 6,
  abilities: [
    {
      name: 'Arremessador',
      description:
        'Quando faz um ataque à distância com uma funda ou uma arma de arremesso, seu dano aumenta em um passo.',
    },
    {
      name: 'Pequeno e Rechonchudo',
      description:
        'Seu tamanho é Pequeno (veja a página 106) e seu deslocamento é 6m. Você recebe +2 em Enganação e usa o modificador de Destreza para Atletismo (em vez de Força).',
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Pequeno e Rechonchudo',
          },
          target: {
            type: 'Displacement',
          },
          modifier: {
            type: 'Fixed',
            value: -3,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Pequeno e Rechonchudo',
          },
          target: {
            type: 'Skill',
            name: Skill.ENGANACAO,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Pequeno e Rechonchudo',
          },
          target: {
            type: 'ModifySkillAttribute',
            skill: Skill.ATLETISMO,
            attribute: Atributo.DESTREZA,
          },
          modifier: {
            type: 'Fixed',
            value: 0,
          },
        },
      ],
    },
    {
      name: 'Sorte Salvadora',
      description:
        'Quando faz um teste de resistência, você pode gastar 1 PM para rolar este teste novamente.',
    },
  ],
};

export default HYNNE;
