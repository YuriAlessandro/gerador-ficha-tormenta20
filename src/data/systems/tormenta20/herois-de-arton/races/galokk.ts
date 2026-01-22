import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import { RACE_SIZES } from '../../races/raceSizes/raceSizes';
import { SKILLS_WITHOUT_OFICIO_QUALQUER } from '../../pericias';

const GALOKK: Race = {
  name: 'Galokk',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    MEGALOKK: 1,
  },
  size: RACE_SIZES.GRANDE,
  abilities: [
    {
      name: 'Força dos Titãs',
      description:
        'Quando acerta um ataque corpo a corpo ou de arremesso, você pode gastar 1 PM. Se fizer isso, sempre que rolar o resultado máximo em um dado de dano da arma, role um dado extra, até um limite de dados extras igual à sua Força.',
    },
    {
      name: 'Meio-Gigante',
      description:
        'Você é uma criatura do tipo humanoide (gigante). Seu tamanho é Grande e você pode usar Força como atributo-chave de Intimidação.',
    },
    {
      name: 'Infância entre os Pequenos',
      description: 'Você se torna treinado em uma perícia a sua escolha.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Infância entre os Pequenos',
          },
          action: {
            type: 'learnSkill',
            availableSkills: SKILLS_WITHOUT_OFICIO_QUALQUER,
            pick: 1,
          },
        },
      ],
    },
  ],
};

export default GALOKK;
