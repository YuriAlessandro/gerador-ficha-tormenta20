import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const HOBGOBLIN: Race = {
  name: 'Hobgoblin',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    ARSENAL: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Arte da Guerra',
      description:
        'Você é treinado em Guerra e recebe proficiência em armas marciais. Se receber essa proficiência novamente, recebe +2 em rolagens de dano com essas armas.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Arte da Guerra' },
          target: { type: 'Skill', name: Skill.GUERRA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
      sheetActions: [
        {
          source: { type: 'power', name: 'Arte da Guerra' },
          action: {
            type: 'addProficiency',
            availableProficiencies: ['Armas Marciais'],
            pick: 1,
          },
        },
      ],
    },
    {
      name: 'Metalurgia Hobgoblin',
      description:
        'Você recebe +2 em Ofício (armeiro) e, se for treinado nesta perícia, pode fabricar armas e armaduras superiores com uma melhoria. Se aprender a fabricar itens superiores desses tipos por outra habilidade, gasta apenas ¼ do preço das melhorias que aplica nesses itens (em vez de ½).',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Metalurgia Hobgoblin' },
          target: { type: 'Skill', name: Skill.OFICIO_ARMEIRO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Táticas de Guerrilha',
      description: 'Você recebe visão no escuro e +2 em Furtividade.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Táticas de Guerrilha' },
          target: { type: 'Skill', name: Skill.FURTIVIDADE },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
  ],
};

export default HOBGOBLIN;
