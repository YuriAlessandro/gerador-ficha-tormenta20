import Skill from '@/interfaces/Skills';
import Race from '../../../../interfaces/Race';
import { Atributo } from '../atributos';

const ELFO: Race = {
  name: 'Elfo',
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.CONSTITUICAO, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ALLIHANNA: 1,
    THWOR: 1,
    KALLYADRANOCH: 1,
    MARAH: 1,
    WYNNA: 1,
  },
  getDisplacement: () => 12,
  abilities: [
    {
      name: 'Graça de Glórienn',
      description: 'Seu deslocamento é 12m (em vez de 9m).',
    },
    {
      name: 'Herança Feérica',
      description: 'Você recebe +1 ponto de mana por nível.',
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Herança Feérica',
          },
          target: {
            type: 'PM',
          },
          modifier: {
            type: 'LevelCalc',
            formula: '{level}',
          },
        },
      ],
    },
    {
      name: 'Sentidos Élficos',
      description:
        'Você recebe visão na penumbra e +2 em Misticismo e Percepção.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Sentidos Élficos',
          },
          action: {
            type: 'addSense',
            sense: 'Visão na penumbra',
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Sentidos Élficos',
          },
          target: {
            type: 'Skill',
            name: Skill.MISTICISMO,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Sentidos Élficos',
          },
          target: {
            type: 'Skill',
            name: Skill.PERCEPCAO,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
  ],
};

export default ELFO;
