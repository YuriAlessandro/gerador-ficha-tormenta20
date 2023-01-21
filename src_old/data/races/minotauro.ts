import { cloneDeep, merge } from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const chifres: Equipment = {
  group: 'Arma',
  nome: 'Chifres',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Perf.',
};

const MINOTAURO: Race = {
  name: 'Minotauro',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 4 },
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: -2 },
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
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        sheetClone.bag.addEquipment({
          Arma: [chifres],
        });

        substeps.push({
          name: 'Nova Arma',
          value: `Chifres pode ser usado como arma.`,
        });

        return sheetClone;
      },
    },
    {
      name: 'Couro Rígido',
      description:
        'Sua pele é dura como a de um touro. Você recebe +1 na Defesa.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        const finalDefense = sheetClone.defesa + 1;

        substeps.push({
          name: 'Couro Rígido',
          value: `+1 defesa (${sheet.defesa} + 1 = ${finalDefense})`,
        });

        return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          defesa: finalDefense,
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
