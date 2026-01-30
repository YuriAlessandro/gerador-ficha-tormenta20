import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';
import KOBOLDS_TALENTS from '../powers/koboldsTalents';

const koboldsAbilities: RaceAbility[] = [
  {
    name: 'Ajuntamento Escamoso',
    description:
      'Embora sejam um grupo de kobolds, para todos os efeitos vocês são uma única criatura Média com dois braços. Entretanto, contam como Pequenos para efeitos dos espaços por onde podem passar e, quando fazem um teste de resistência contra um efeito que afeta apenas uma criatura e não causa dano, rolam dois dados e usam o melhor resultado. Por fim, têm vulnerabilidade a dano de área.',
  },
  {
    name: 'Praça Perigosa',
    description:
      'Vocês são criaturas do tipo monstro e recebem visão no escuro e +2 em Sobrevivência.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Praça Perigosa' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Sensibilidade a Luz',
    description:
      'Quando expostos à luz do sol ou similar, vocês ficam ofuscados.',
  },
  {
    name: 'Talentos do Bando',
    description:
      'Escolham dois dos poderes a seguir. Uma vez por patamar, vocês podem escolher outro desses poderes no lugar de um poder de classe.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Talentos do Bando' },
        action: {
          type: 'getGeneralPower',
          availablePowers: KOBOLDS_TALENTS,
          pick: 2,
        },
      },
    ],
  },
];

const KOBOLDS: Race = {
  name: 'Kobolds',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.FORCA, mod: -1 },
    ],
  },
  faithProbability: {
    KALLYADRANOCH: 1,
    KHALMYR: 1,
    LENA: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
  },
  abilities: koboldsAbilities,
};

export default KOBOLDS;
