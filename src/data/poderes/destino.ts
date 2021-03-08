import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../interfaces/Poderes';

const destinyPowers: GeneralPower[] = [
  {
    name: 'Acrobático',
    description:
      'Você pode usar seu modificador de Destreza em vez de Força em testes de Atletismo. Além disso, terreno difícil não reduz seu deslocamento nem o impede de realizar investidas.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 15 },
    ],
  },
  {
    name: 'Foco em Perícia',
    description:
      'Escolha uma perícia. Quando faz um teste dessa perícia, você pode gastar 1 PM para rolar dois dados e usar o melhor resultado. Você pode escolher este poder outras vezes para perícias diferentes. Este poder não pode ser aplicado em Luta e Pontaria',
    type: GeneralPowerType.DESTINO,
    allowSeveralPicks: true,
    requirements: [],
  },
  {
    name: 'Investigador',
    description:
      'Você recebe +2 em Investigação e soma seu bônus de Inteligência em Intuição.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 },
    ],
  },
];

export default destinyPowers;
