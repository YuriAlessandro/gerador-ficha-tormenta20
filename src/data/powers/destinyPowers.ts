import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../interfaces/Poderes';

export const DestinyPowers: Record<string, GeneralPower> = {
  APARENCIA_INOFENSIVA: {
    name: 'Aparência Inofensiva',
    description:
      'A primeira criatura inteligente (Int 3 ou mais) que atacar você em uma cena deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Este poder só funciona uma vez por cena; independentemente de a criatura falhar ou não no teste, poderá atacá-lo nas rodadas seguintes.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 13 },
    ],
  },
  SORTUDO: {
    name: 'Sortudo',
    description:
      'Você pode gastar 3 PM para rolar novamente um teste recém realizado (apenas uma vez por teste).',
    requirements: [],
    type: GeneralPowerType.DESTINO,
  },
  ACROBATICO: {
    name: 'Acrobático',
    description:
      'Você pode usar seu modificador de Destreza em vez de Força em testes de Atletismo. Além disso, terreno difícil não reduz seu deslocamento nem o impede de realizar investidas.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 15 },
    ],
  },
  FOCO_EM_PERICIA: {
    name: 'Foco em Perícia',
    description:
      'Escolha uma perícia. Quando faz um teste dessa perícia, você pode gastar 1 PM para rolar dois dados e usar o melhor resultado. Você pode escolher este poder outras vezes para perícias diferentes. Este poder não pode ser aplicado em Luta e Pontaria',
    type: GeneralPowerType.DESTINO,
    allowSeveralPicks: true,
    requirements: [],
  },
  INVESTIGADOR: {
    name: 'Investigador',
    description:
      'Você recebe +2 em Investigação e soma seu bônus de Inteligência em Intuição.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 },
    ],
  },
};

const destinyPowers: GeneralPower[] = [
  DestinyPowers.APARENCIAINOFENSIVA,
  DestinyPowers.SORTUDO,
  DestinyPowers.ACROBATICO,
  DestinyPowers.FOCO_EM_PERICIA,
  DestinyPowers.INVESTIGADOR,
];

export default destinyPowers;
