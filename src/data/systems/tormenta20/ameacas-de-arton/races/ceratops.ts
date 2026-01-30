import Equipment from '../../../../../interfaces/Equipment';
import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import { RACE_SIZES } from '../../races/raceSizes/raceSizes';
import Skill from '../../../../../interfaces/Skills';

const chifres: Equipment = {
  group: 'Arma',
  nome: 'Chifres',
  dano: '1d8',
  critico: 'x2',
  tipo: 'Perf.',
  preco: 0,
};

const CERATOPS: Race = {
  name: 'Ceratops',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.DESTREZA, mod: -1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    AZGHER: 1,
    LENA: 1,
    MEGALOKK: 1,
  },
  size: RACE_SIZES.GRANDE,
  abilities: [
    {
      name: 'Chifres',
      description:
        'Você possui uma arma natural de chifres (dano 1d8, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com seus chifres.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Ceratops',
          },
          action: {
            type: 'addEquipment',
            equipment: {
              Arma: [chifres],
            },
            description: 'Chifres pode ser usado como arma.',
          },
        },
      ],
    },
    {
      name: 'Papel Tribal',
      description:
        'Você é treinado em uma perícia à sua escolha entre Cura, Intimidação, Ofício ou Sobrevivência.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Papel Tribal',
          },
          action: {
            type: 'learnSkill',
            availableSkills: [
              Skill.CURA,
              Skill.INTIMIDACAO,
              Skill.OFICIO,
              Skill.SOBREVIVENCIA,
            ],
            pick: 1,
          },
        },
      ],
    },
    {
      name: 'Paquiderme',
      description:
        'Seu tamanho é Grande. Você recebe +1 na Defesa e pode usar Força como atributo-chave de Intimidação (em vez de Carisma).',
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Paquiderme',
          },
          target: {
            type: 'Defense',
          },
          modifier: {
            type: 'Fixed',
            value: 1,
          },
        },
      ],
    },
    {
      name: 'Medo de Altura',
      description:
        'Se estiver adjacente a uma queda de 3m ou mais (como um buraco ou penhasco), você fica abalado.',
    },
  ],
};

export default CERATOPS;
