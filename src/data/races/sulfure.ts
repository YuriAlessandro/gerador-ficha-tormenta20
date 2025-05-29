import Skill from '@/interfaces/Skills';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { spellsCircle1 } from '../magias/generalSpells';

const SULFURE: Race = {
  name: 'Suraggel (Sulfure)',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    KALLYADRANOCH: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Herança Divina',
      description:
        'Você é uma criatura do tipo espírito e recebe visão no escuro.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Herança Divina',
          },
          action: {
            type: 'addSense',
            sense: 'Visão no Escuro',
          },
        },
      ],
    },
    {
      name: 'Sombras Profanas',
      description:
        'Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributo-chave Inteligência). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Sombras Profanas',
          },
          action: {
            type: 'learnSpell',
            availableSpells: [spellsCircle1.escuridao],
            pick: 1,
            customAttribute: Atributo.INTELIGENCIA,
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Sombras Profanas',
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
            name: 'Sombras Profanas',
          },
          target: {
            type: 'Skill',
            name: Skill.FURTIVIDADE,
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

export default SULFURE;
