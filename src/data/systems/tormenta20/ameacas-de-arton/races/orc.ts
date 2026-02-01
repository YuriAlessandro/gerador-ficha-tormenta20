import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const orcAbilities: RaceAbility[] = [
  {
    name: 'Feroz',
    description:
      'Você recebe +2 em rolagens de dano com armas corpo a corpo e de arremesso. Quando sofre dano de um inimigo, esse bônus se torna +4 até o fim de seu próximo turno.',
  },
  {
    name: 'Habitante das Cavernas',
    description:
      'Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo. Entretanto, recebe sensibilidade a luz.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Habitante das Cavernas' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Habitante das Cavernas' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Vigor Brutal',
    description:
      'Você recebe +2 em Fortitude e soma sua Força em seu total de pontos de vida.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Vigor Brutal' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Vigor Brutal' },
        target: { type: 'PV' },
        modifier: { type: 'Attribute', attribute: Atributo.FORCA },
      },
    ],
  },
];

const ORC: Race = {
  name: 'Orc',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    MEGALOKK: 1,
    NIMB: 1,
    TENEBRA: 1,
  },
  abilities: orcAbilities,
};

export default ORC;
