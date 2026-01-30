import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';
import CORE_POWERS from '../../core/powers';
import AMEACAS_ARTON_POWERS from '../powers';

// Combine all powers from Core and Ameaças de Arton for Plurivalente
const ALL_GENERAL_POWERS = [
  ...Object.values(CORE_POWERS).flat(),
  ...Object.values(AMEACAS_ARTON_POWERS).flat(),
];

const minauroAbilities: RaceAbility[] = [
  {
    name: 'Faro',
    description:
      'Você tem olfato apurado. Contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha.',
  },
  {
    name: 'Mente Aberta',
    description: 'Você recebe +2 em Diplomacia e Investigação.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Mente Aberta' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Mente Aberta' },
        target: { type: 'Skill', name: Skill.INVESTIGACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Plurivalente',
    description: 'Você recebe um poder geral a sua escolha.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Plurivalente' },
        action: {
          type: 'getGeneralPower',
          availablePowers: ALL_GENERAL_POWERS,
          pick: 1,
        },
      },
    ],
  },
];

const MINAURO: Race = {
  name: 'Minauro',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  faithProbability: {},
  abilities: minauroAbilities,
};

export default MINAURO;
