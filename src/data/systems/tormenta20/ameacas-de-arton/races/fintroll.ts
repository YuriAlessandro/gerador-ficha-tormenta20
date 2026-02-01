import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const FINTROLL: Race = {
  name: 'Fintroll',
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: Atributo.FORCA, mod: -1 },
    ],
  },
  faithProbability: {
    KALLYADRANOCH: 1,
    MEGALOKK: 1,
    SSZZAAS: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Corpo Vegetante',
      description:
        'Você é uma criatura do tipo monstro e recebe natureza vegetal e visão no escuro.',
    },
    {
      name: 'Presença Arcana',
      description: 'Você recebe +2 em Misticismo e resistência à magia +2.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Presença Arcana' },
          target: { type: 'Skill', name: Skill.MISTICISMO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Regeneração Vegetal',
      description:
        'Uma vez por rodada, você pode gastar 1 PM para recuperar 5 PV. Esta habilidade não cura dano de ácido ou fogo.',
    },
    {
      name: 'Intolerância à Luz',
      description:
        'Você recebe sensibilidade à luz +2 quando exposto à luz do sol ou similar, não consegue ativar sua Regeneração Vegetal.',
    },
  ],
};

export default FINTROLL;
