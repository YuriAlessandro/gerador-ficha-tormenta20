import Race, {
  RaceAbility,
  RaceAttributeAbility,
} from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const nagahAbilities: RaceAbility[] = [
  {
    name: 'Cauda',
    description:
      'Você possui uma arma natural de cauda (dano 1d6, crítico x2, impacto). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a cauda.',
  },
  {
    name: 'Inocência Dissimulada',
    description:
      'Você recebe +2 em Enganação e pode gastar 2 PM para substituir um teste de perícia originalmente baseada em Inteligência, Sabedoria ou Carisma por Enganação.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Inocência Dissimulada' },
        target: { type: 'Skill', name: Skill.ENGANACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Presentes de Sszzaas',
    description:
      'Você recebe visão na penumbra, +1 na Defesa e resistência a veneno +5.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Presentes de Sszzaas' },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    name: 'Fraquezas Ofídicas',
    description:
      'Você sofre 1 ponto de dano adicional para cada dado de dano de frio e –5 em testes de resistência contra Músicas de bardo.',
  },
];

const NAGAH: Race = {
  name: 'Nagah',
  // Default attributes (will be overridden by getAttributes)
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
    ],
  },
  getAttributes: (sex: 'Masculino' | 'Feminino'): RaceAttributeAbility[] => {
    if (sex === 'Masculino') {
      return [
        { attr: Atributo.FORCA, mod: 1 },
        { attr: Atributo.DESTREZA, mod: 1 },
        { attr: Atributo.CONSTITUICAO, mod: 1 },
      ];
    }
    // Feminino
    return [
      { attr: Atributo.INTELIGENCIA, mod: 1 },
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: Atributo.CARISMA, mod: 1 },
    ];
  },
  faithProbability: {
    ALLIHANNA: 1,
    HYNINN: 1,
    KALLYADRANOCH: 1,
    MEGALOKK: 1,
    SSZZAAS: 2,
    TENEBRA: 1,
    WYNNA: 1,
  },
  abilities: nagahAbilities,
};

export default NAGAH;
