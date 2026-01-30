import Skill from '@/interfaces/Skills';
import Race from '../../../../interfaces/Race';
import { Atributo } from '../atributos';
import { spellsCircle1 } from '../magias/generalSpells';

const AGGELUS: Race = {
  name: 'Suraggel (Aggelus)',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.CARISMA, mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    AZGHER: 1,
    KHALMYR: 1,
    MARAH: 1,
    THYATIS: 1,
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
      name: 'Luz Sagrada',
      description:
        'Você recebe +2 em Diplomacia e Intuição. Além disso, pode lançar Luz (como uma magia divina; atributo-chave Carisma). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Luz Sagrada',
          },
          action: {
            type: 'learnSpell',
            availableSpells: [spellsCircle1.luz],
            pick: 1,
            customAttribute: Atributo.CARISMA,
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Luz Sagrada',
          },
          target: {
            type: 'Skill',
            name: Skill.DIPLOMACIA,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Luz Sagrada',
          },
          target: {
            type: 'Skill',
            name: Skill.INTUICAO,
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

export default AGGELUS;
