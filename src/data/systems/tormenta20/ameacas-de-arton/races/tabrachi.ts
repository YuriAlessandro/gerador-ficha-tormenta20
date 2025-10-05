import Equipment from '../../../../../interfaces/Equipment';
import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const lingua: Equipment = {
  group: 'Arma',
  nome: 'Língua',
  dano: '1d4',
  critico: 'x2',
  tipo: 'Impacto',
  preco: 0,
};

const tabrachiAbilities: RaceAbility[] = [
  {
    name: 'Batráquio',
    description:
      'Você recebe visão na penumbra e deslocamento de natação igual ao seu deslocamento terrestre.',
  },
  {
    name: 'Linguarudo',
    description:
      'Sua língua é uma arma natural que pode atacar inimigos a até 3m (dano 1d4, crítico x2, impacto). Ela é uma arma versátil, fornecendo +2 em testes para desarmar e derrubar. Uma vez por rodada, quando usa a ação agredir com outra arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com a língua.',
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Linguarudo',
        },
        action: {
          type: 'addEquipment',
          equipment: {
            Arma: [lingua],
          },
          description: 'Língua pode ser usada como arma.',
        },
      },
    ],
  },
  {
    name: 'Saltador',
    description: 'Você recebe +10 em testes de Atletismo para saltar.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Saltador' },
        target: { type: 'Skill', name: Skill.ATLETISMO },
        modifier: { type: 'Fixed', value: 10 },
      },
    ],
  },
];

const TABRACHI: Race = {
  name: 'Tabrachi',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    MEGALOKK: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TENEBRA: 1,
  },
  abilities: tabrachiAbilities,
};

export default TABRACHI;
