import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../interfaces/Poderes';
import Skill from '../../../../interfaces/Skills';
import { Atributo } from '../atributos';

export const DestinyPowers: Record<string, GeneralPower> = {
  ACROBATICO: {
    name: 'Acrobático',
    description:
      'Você pode usar sua Destreza em vez de Força em testes de Atletismo. Além disso, terreno difícil não reduz seu deslocamento nem o impede de realizar investidas.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 }],
    ],
  },
  AO_SABOR_DO_DESTINO: {
    name: 'Ao Sabor do Destino',
    description:
      'Confiando em suas próprias habilidades (ou em sua própria sorte), você abre mão de usar itens mágicos. Sua autoconfiança fornece diversos benefícios, de acordo com seu nível de personagem e a tabela da página 130.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        {
          type: RequirementType.NIVEL,
          value: 6,
        },
      ],
    ],
  },
  APARENCIA_INOFENSIVA: {
    name: 'Aparência Inofensiva',
    description:
      'A primeira criatura inteligente (Int –3 ou maior) que atacar você em uma cena deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Este poder só funciona uma vez por cena; independentemente de a criatura falhar ou não no teste, poderá atacá-lo nas rodadas seguintes.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 }],
    ],
  },
  ATLETICO: {
    name: 'Atlético',
    description: 'Você recebe +2 em Atletismo e +3m em seu deslocamento.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Força', value: 2 }],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Atlético',
        },
        target: {
          type: 'Skill',
          name: Skill.ATLETISMO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Atlético',
        },
        target: {
          type: 'Displacement',
        },
        modifier: {
          type: 'Fixed',
          value: 3,
        },
      },
    ],
  },
  ATRAENTE: {
    name: 'Atraente',
    description:
      'Você recebe +2 em testes de perícias baseadas em Carisma contra criaturas que possam se sentir fisicamente atraídas por você.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 }],
    ],
  },
  COMANDAR: {
    name: 'Comandar',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para gritar ordens para seus aliados em alcance médio. Eles recebem +1 em testes de perícia até o fim da cena.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 }],
    ],
  },
  COSTAS_LARGAS: {
    name: 'Costas Largas',
    description:
      'Seu limite de carga aumenta em 5 espaços e você pode se beneficiar de um item vestido adicional.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Constituição', value: 1 },
        { type: RequirementType.ATRIBUTO, name: 'Força', value: 1 },
      ],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Costas Largas',
        },
        target: {
          type: 'MaxSpaces',
        },
        modifier: {
          type: 'Fixed',
          value: 5,
        },
      },
    ],
  },
  FOCO_EM_PERICIA: {
    name: 'Foco em Perícia',
    description:
      'Escolha uma perícia. Quando faz um teste dessa perícia, você pode gastar 1 PM para rolar dois dados e usar o melhor resultado. Você pode escolher este poder outras vezes para perícias diferentes. Este poder não pode ser aplicado em Luta e Pontaria (mas veja Foco em Arma).',
    type: GeneralPowerType.DESTINO,
    allowSeveralPicks: true,
    requirements: [],
  },
  INVENTARIO_ORGANIZADO: {
    name: 'Inventário Organizado',
    description:
      'Você soma sua Inteligência no limite de espaços que pode carregar. Para você, itens muito leves ou pequenos, que normalmente ocupam meio espaço, em vez disso ocupam 1/4 de espaço.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Inventário Organizado',
        },
        target: {
          type: 'MaxSpaces',
        },
        modifier: {
          type: 'Attribute',
          attribute: Atributo.INTELIGENCIA,
        },
      },
    ],
  },
  INVESTIGADOR: {
    name: 'Investigador',
    description:
      'Você recebe +2 em Investigação e soma sua Inteligência em Intuição.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Investigador',
        },
        target: {
          type: 'Skill',
          name: Skill.INVESTIGACAO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Investigador',
        },
        target: {
          type: 'Skill',
          name: Skill.INTUICAO,
        },
        modifier: {
          type: 'Attribute',
          attribute: Atributo.INTELIGENCIA,
        },
      },
    ],
  },
  LOBO_SOLITARIO: {
    name: 'Lobo Solitário',
    description:
      'Você recebe +1 em testes de perícia e Defesa se estiver sem nenhum aliado em alcance curto. Você não sofre penalidade por usar Cura em si mesmo.',
    type: GeneralPowerType.DESTINO,
    requirements: [],
  },
  MEDICINA: {
    name: 'Medicina',
    description:
      'Você pode gastar uma ação completa para fazer um teste de Cura (CD 15) em uma criatura. Se você passar, ela recupera 1d6 PV, mais 1d6 para cada 5 pontos pelos quais o resultado do teste exceder a CD (2d6 com um resultado 20, 3d6 com um resultado 25 e assim por diante). Você só pode usar este poder uma vez por dia numa mesma criatura.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
        { type: RequirementType.PERICIA, name: 'Cura' },
      ],
    ],
  },
  PARCEIRO: {
    name: 'Parceiro',
    description:
      'Você possui um parceiro animal ou humanoide que o acompanha em aventuras. Escolha os detalhes dele, como nome, aparência e personalidade. Em termos de jogo, é um parceiro iniciante de um tipo a sua escolha (veja a página 260). O parceiro obedece às suas ordens e se arrisca para ajudá-lo, mas, se for maltratado, pode parar de segui-lo (de acordo com o mestre). Se perder seu parceiro, você recebe outro no início da próxima aventura.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        {
          type: RequirementType.PERICIA,
          name: 'Adestramento',
        },
        {
          type: RequirementType.NIVEL,
          value: 5,
        },
      ],
      [
        {
          type: RequirementType.PERICIA,
          name: 'Diplomacia',
        },
        {
          type: RequirementType.NIVEL,
          value: 5,
        },
      ],
    ],
  },
  SENTIDOS_AGUCADOS: {
    name: 'Sentidos Aguçados',
    description:
      'Você recebe +2 em Percepção, não fica desprevenido contra inimigos que não possa ver e, sempre que erra um ataque devido a camuflagem, pode rolar mais uma vez o dado da chance de falha.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Sentidos Aguçados',
        },
        target: {
          type: 'Skill',
          name: Skill.PERCEPCAO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  SORTUDO: {
    name: 'Sortudo',
    description:
      'Você pode gastar 3 PM para rolar novamente um teste recém realizado (apenas uma vez por teste).',
    requirements: [],
    type: GeneralPowerType.DESTINO,
  },
  SURTO_HEROICO: {
    name: 'Surto Heroico',
    description:
      'Uma vez por rodada, você pode gastar 5 PM para realizar uma ação padrão ou de movimento adicional.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
    ],
  },
  TORCIDA: {
    name: 'Torcida',
    description:
      'Você recebe +2 em testes de perícia e Defesa quando tem a torcida a seu favor. Entenda-se por “torcida” qualquer número de criaturas inteligentes em alcance médio que não esteja realizando nenhuma ação além de torcer por você.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 }],
    ],
  },
  TREINAMENTO_EM_PERICIA: {
    name: 'Treinamento em Perícia',
    description:
      'Você se torna treinado em uma perícia a sua escolha. Você pode escolher este poder outras vezes para perícias diferentes.',
    type: GeneralPowerType.DESTINO,
    allowSeveralPicks: true,
    requirements: [],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Treinamento em Perícia',
        },
        action: {
          type: 'learnSkill',
          availableSkills: Object.values(Skill),
          pick: 1,
        },
      },
    ],
  },
  VENEFICIO: {
    name: 'Venefício',
    description:
      'Quando usa um veneno, você não corre risco de se envenenar acidentalmente. Além disso, a CD para resistir aos seus venenos aumenta em +2.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA }],
    ],
  },
  VONTADE_DE_FERRO: {
    name: 'Vontade de Ferro',
    description:
      'Você recebe +1 PM para cada dois níveis de personagem e +2 em Vontade.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 }],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Vontade de Ferro',
        },
        target: {
          type: 'PM',
        },
        modifier: {
          type: 'LevelCalc',
          formula: 'Math.floor({level} / 2)',
        },
      },
      {
        source: {
          type: 'power',
          name: 'Vontade de Ferro',
        },
        target: {
          type: 'Skill',
          name: Skill.VONTADE,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
};

const destinyPowers: GeneralPower[] = [
  DestinyPowers.ACROBATICO,
  DestinyPowers.AO_SABOR_DO_DESTINO,
  DestinyPowers.APARENCIA_INOFENSIVA,
  DestinyPowers.FOCO_EM_PERICIA,
  DestinyPowers.INVESTIGADOR,
  DestinyPowers.LOBO_SOLITARIO,
  DestinyPowers.MEDICINA,
  DestinyPowers.PARCEIRO,
  DestinyPowers.SENTIDOS_AGUCADOS,
  DestinyPowers.TORCIDA,
  DestinyPowers.TREINAMENTO_EM_PERICIA,
  DestinyPowers.VENEFICIO,
  DestinyPowers.VONTADE_DE_FERRO,
];

export default destinyPowers;
