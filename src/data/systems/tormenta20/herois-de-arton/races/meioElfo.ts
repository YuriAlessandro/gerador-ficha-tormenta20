import Race from '../../../../../interfaces/Race';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

const MEIO_ELFO: Race = {
  name: 'Meio-Elfo',
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  abilities: [
    {
      name: 'Ambição Herdada',
      description:
        'Você recebe um poder geral ou poder único de origem a sua escolha.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Ambição Herdada',
          },
          action: {
            type: 'special',
            specialAction: 'meioElfoAmbicaoHerdada',
          },
        },
      ],
    },
    {
      name: 'Entre Dois Mundos',
      description: 'Você recebe +1 em perícias baseadas em Carisma.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Entre Dois Mundos' },
          target: { type: 'Skill', name: Skill.ADESTRAMENTO },
          modifier: { type: 'Fixed', value: 1 },
        },
        {
          source: { type: 'power', name: 'Entre Dois Mundos' },
          target: { type: 'Skill', name: Skill.ATUACAO },
          modifier: { type: 'Fixed', value: 1 },
        },
        {
          source: { type: 'power', name: 'Entre Dois Mundos' },
          target: { type: 'Skill', name: Skill.DIPLOMACIA },
          modifier: { type: 'Fixed', value: 1 },
        },
        {
          source: { type: 'power', name: 'Entre Dois Mundos' },
          target: { type: 'Skill', name: Skill.ENGANACAO },
          modifier: { type: 'Fixed', value: 1 },
        },
        {
          source: { type: 'power', name: 'Entre Dois Mundos' },
          target: { type: 'Skill', name: Skill.INTIMIDACAO },
          modifier: { type: 'Fixed', value: 1 },
        },
        {
          source: { type: 'power', name: 'Entre Dois Mundos' },
          target: { type: 'Skill', name: Skill.JOGATINA },
          modifier: { type: 'Fixed', value: 1 },
        },
      ],
    },
    {
      name: 'Sangue Élfico',
      description:
        'Você recebe visão na penumbra e +1 ponto de mana a cada nível ímpar (incluindo o 1º). Além disso, é considerado um elfo para efeitos relacionados a raça.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Sangue Élfico',
          },
          action: {
            type: 'addSense',
            sense: 'Visão na penumbra',
          },
        },
      ],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Sangue Élfico' },
          target: { type: 'PM' },
          modifier: {
            type: 'LevelCalc',
            formula: 'Math.floor(({level} + 1)/2)',
          },
        },
      ],
    },
  ],
};

export default MEIO_ELFO;
