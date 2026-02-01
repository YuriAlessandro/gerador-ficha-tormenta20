import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';
import { RACE_SIZES } from '../../races/raceSizes/raceSizes';

const ogroAbilities: RaceAbility[] = [
  {
    name: '...Maior a Porrada!',
    description:
      'Quando acerta um ataque corpo a corpo, você pode gastar 1 PM para causar +1d8 pontos de dano do mesmo tipo.',
  },
  {
    name: 'Camada de Ingenuidade',
    description: 'Você sofre -5 em Intuição e Vontade.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Camada de Ingenuidade' },
        target: { type: 'Skill', name: Skill.INTUICAO },
        modifier: { type: 'Fixed', value: -5 },
      },
      {
        source: { type: 'power', name: 'Camada de Ingenuidade' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: -5 },
      },
    ],
  },
  {
    name: 'Quanto Maior o Tamanho...',
    description:
      'Você é um humanoide do subtipo gigante; seu tamanho é Grande e você recebe visão na penumbra.',
  },
];

const OGRO: Race = {
  name: 'Ogro',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 3 },
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
  },
  size: RACE_SIZES.GRANDE,
  abilities: ogroAbilities,
};

export default OGRO;
