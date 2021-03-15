import { cloneDeep, merge } from 'lodash';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const MINOTAURO: Race = {
  name: 'Minotauro',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 4 },
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: -2 },
    ],
    texts: [
      'Você possui uma arma natural de chifres (dano 1d6, crítico x2, perfuração). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os chifres.',
      'Sua pele é dura como a de um touro. Você recebe +1 na Defesa (JÁ INCLUSO).',
      'Você tem olfato apurado. Você não fica desprevenido e sofre apenas camuflagem (em vez de camuflagem total) contra inimigos em alcance curto que não possa ver.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ARSENAL: 1,
    MEGALOKK: 1,
    OCEANO: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Chifres',
      description:
        'Você possui uma arma natural de chifres (dano 1d6, crítico x2, perfuração). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os chifres.',
      action(sheet: CharacterSheet): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        return merge(sheetClone, {
          bag: {
            equipments: {
              Arma: [
                ...sheetClone.bag.equipments.Arma,
                {
                  group: 'Arma',
                  nome: 'Chifres',
                  dano: '1d6',
                  critico: 'x2',
                  tipo: 'Perf.',
                },
              ],
            },
          },
        });
      },
    },
    {
      name: 'Couro Rígido',
      description:
        'Sua pele é dura como a de um touro. Você recebe +1 na Defesa.',
      action(sheet: CharacterSheet): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          defesa: sheetClone.defesa + 1,
        });
      },
    },
    {
      name: 'Faro',
      description:
        'Você tem olfato apurado. Você não fica desprevenido e sofre apenas camuflagem (em vez de camuflagem total) contra inimigos em alcance curto que não possa ver.',
    },
    {
      name: 'Medo de Altura',
      description:
        'Se estiver adjacente a uma queda de 3m ou mais de altura (como um buraco ou penhasco), você fica abalado.',
    },
  ],
};

export default MINOTAURO;
