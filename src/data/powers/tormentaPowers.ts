import Skill from '@/interfaces/Skills';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../interfaces/Poderes';

const tormentaPowers: Record<string, GeneralPower> = {
  ANATOMIA_INSANA: {
    name: 'Anatomia Insana',
    description:
      'Você tem 25% de chance (resultado “1” em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo. A chance aumenta em +25% para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  ANTENAS: {
    name: 'Antenas',
    description:
      'Você recebe +1 em Iniciativa, Percepção e Vontade. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Antenas',
        },
        target: {
          type: 'Skill',
          name: Skill.INICIATIVA,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
      {
        source: {
          type: 'power',
          name: 'Antenas',
        },
        target: {
          type: 'Skill',
          name: Skill.PERCEPCAO,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
      {
        source: {
          type: 'power',
          name: 'Antenas',
        },
        target: {
          type: 'Skill',
          name: Skill.VONTADE,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
    ],
  },
  ARMAMENTO_ABERRANTE: {
    name: 'Armamento Aberrante',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para produzir uma versão orgânica de qualquer arma corpo a corpo ou de arremesso com a qual seja proficiente — ela brota do seu braço, ombro ou costas como uma planta grotesca e então se desprende. O dano da arma aumenta em um passo para cada dois outros poderes da Tormenta que você possui. A arma dura pela cena, então se desfaz numa poça de gosma. Pré-requisito: outro poder da Tormenta.',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      [
        {
          type: RequirementType.PODER_TORMENTA,
          value: 1,
        },
      ],
    ],
  },
  ARTICULACOES_FLEXIVEIS: {
    name: 'Articulações Flexíveis',
    description:
      'Você recebe +1 em Acrobacia, Furtividade e Reflexos. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Articulações Flexíveis',
        },
        target: {
          type: 'Skill',
          name: Skill.ACROBACIA,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
      {
        source: {
          type: 'power',
          name: 'Articulações Flexíveis',
        },
        target: {
          type: 'Skill',
          name: Skill.FURTIVIDADE,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
      {
        source: {
          type: 'power',
          name: 'Articulações Flexíveis',
        },
        target: {
          type: 'Skill',
          name: Skill.REFLEXOS,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
    ],
  },
  ASAS_INSETOIDES: {
    name: 'Asas Insetoides',
    description:
      'Você pode gastar 1 PM para receber deslocamento de voo 9m até o fim do seu turno. O deslocamento aumenta em +1,5m para cada outro poder da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      [
        {
          type: RequirementType.PODER_TORMENTA,
          value: 4,
        },
      ],
    ],
  },
  CARAPACA: {
    name: 'Carapaça',
    description:
      'Sua pele é recoberta por placas quitinosas. Você recebe +1 na Defesa. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Carapaça',
        },
        target: {
          type: 'Defense',
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
    ],
  },
  CORPO_ABERRANTE: {
    name: 'Corpo Aberrante',
    description:
      'Crostas vermelhas em várias partes de seu corpo tornam seus ataques mais perigosos. Seu dano desarmado aumenta em um passo, mais um passo para cada quatro outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      [
        {
          type: RequirementType.PODER_TORMENTA,
          value: 1,
        },
      ],
    ],
  },
  CUSPIR_ENXAME: {
    name: 'Cuspir Enxame',
    description:
      'Você pode gastar uma ação completa e 2 PM para criar um enxame de insetos rubros em um ponto a sua escolha em alcance curto e com duração sustentada. O enxame tem tamanho Médio e pode passar pelo espaço de outras criaturas. Uma vez por rodada, você pode gastar uma ação de movimento para mover o enxame 9m. No final do seu turno, o enxame causa 2d6 pontos de dano de ácido a qualquer criatura no espaço que ele estiver ocupando. Para cada dois outros poderes da Tormenta que possui, você pode gastar +1 PM quando usa este poder para aumentar o dano do enxame em +1d6.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  DENTES_AFIADOS: {
    name: 'Dentes Afiados',
    description:
      'Você recebe uma arma natural de mordida (dano 1d4, crítico x2, corte). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Dentes Afiados',
        },
        action: {
          type: 'addEquipment',
          equipment: {
            Arma: [
              {
                group: 'Arma',
                nome: 'Mordida',
                dano: '1d4',
                critico: 'x2',
                tipo: 'Corte',
                spaces: 0,
              },
            ],
          },
        },
      },
    ],
  },
  DESPREZAR_A_REALIDADE: {
    name: 'Desprezar a Realidade',
    description:
      'Você pode gastar 2 PM para ficar no limiar da realidade até o início de seu próximo turno. Nesse estado, você ignora terreno difícil e causa 20% de chance de falha em efeitos usados contra você (não apenas ataques). Para cada dois outros poderes de Tormenta que você possuir, essa chance aumenta em 5% (máximo de 50%).',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      [
        {
          type: RequirementType.PODER_TORMENTA,
          value: 4,
        },
      ],
    ],
  },
  EMPUNHADURA_RUBRA: {
    name: 'Empunhadura Rubra',
    description:
      'Você pode gastar 1 PM para cobrir suas mãos com uma carapaça rubra. Até o final da cena, você recebe +1 em Luta. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  FOME_DE_MANA: {
    name: 'Fome de Mana',
    description:
      'Quando passa em um teste de resistência para resistir a uma habilidade mágica, você recebe 1 PM temporário cumulativo. Você pode ganhar um máximo de PM temporários por cena desta forma igual ao número de poderes da Tormenta que possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  LARVA_EXPLOSIVA: {
    name: 'Larva Explosiva',
    description:
      'Se uma criatura que tenha sofrido dano de sua mordida nesta cena for reduzida a 0 ou menos PV, ela explode em chuva cáustica, morrendo e causando 4d4 pontos de dano de ácido em criaturas adjacentes. Para cada dois outros poderes da Tormenta que você possui, o dano aumenta em +2d4. Você é imune a esse dano.',
    type: GeneralPowerType.TORMENTA,
    requirements: [[{ type: RequirementType.PODER, name: 'Dentes Afiados' }]],
  },
  LEGIAO_ABERRANTE: {
    name: 'Legião Aberrante',
    description:
      'Seu corpo se transforma em uma massa de insetos rubros. Você pode atravessar qualquer espaço por onde seja possível passar uma moeda (mas considera esses espaços como terreno difícil) e recebe +1 em testes contra manobras de combate e de resistência contra efeitos que tenham você como alvo (mas não efeitos de área). Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Anatomia Insana' }],
      [{ type: RequirementType.PODER_TORMENTA, value: 3 }],
    ],
  },
  MAOS_MEMBRANOSAS: {
    name: 'Mãos Membranosas',
    description:
      'Você recebe +1 em Atletismo, Fortitude e testes de agarrar. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Mãos Membranosas',
        },
        target: {
          type: 'Skill',
          name: Skill.ATLETISMO,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
      {
        source: {
          type: 'power',
          name: 'Mãos Membranosas',
        },
        target: {
          type: 'Skill',
          name: Skill.FORTITUDE,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
    ],
  },
  MEMBROS_ESTENDIDOS: {
    name: 'Membros Estendidos',
    description:
      'Seus braços e armas naturais são grotescamente mais longos que o normal, o que aumenta seu alcance natural para ataques corpo a corpo em +1,5m. Para cada quatro outros poderes da Tormenta que você possui, esse alcance aumenta em +1,5m.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  MEMBROS_EXTRAS: {
    name: 'Membros extras',
    description:
      'Você possui duas armas naturais de patas insetoides que saem de suas costas, ombros ou flancos. Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 2 PM para fazer um ataque corpo a corpo extra com cada uma (dano 1d4, crítico x2, corte). Se possuir Ambidestria ou Estilo de Duas Armas, pode empunhar armas leves em suas patas insetoides (mas ainda precisa pagar 2 PM para atacar com elas e sofre a penalidade de –2 em todos os ataques).',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      [
        {
          type: RequirementType.PODER_TORMENTA,
          value: 4,
        },
      ],
    ],
  },
  MENTE_ABERRANTE: {
    name: 'Mente Aberrante',
    description:
      'Você recebe resistência a efeitos mentais +1. Além disso, sempre que precisa fazer um teste de Vontade para resistir a uma habilidade, a criatura que usou essa habilidade sofre 1d6 pontos de dano psíquico. Para cada dois outros poderes da Tormenta que você possui o bônus em testes de resistência aumenta em +1 e o dano aumenta em +1d6',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  OLHOS_VERMELHOS: {
    name: 'Olhos Vermelhos',
    description:
      'Você recebe visão no escuro e +1 em Intimidação. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Olhos Vermelhos',
        },
        action: {
          type: 'addSense',
          sense: 'Visão no escuro',
        },
      },
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Olhos Vermelhos',
        },
        target: {
          type: 'Skill',
          name: Skill.INTIMIDACAO,
        },
        modifier: {
          type: 'TormentaPowersCalc',
          formula: 'Math.floor(({tPowQtd} - 1) / 2) + 1',
        },
      },
    ],
  },
  PELE_CORROMPIDA: {
    name: 'Pele Corrompida',
    description:
      'Sua carne foi mesclada à matéria vermelha. Você recebe redução de ácido, eletricidade, fogo, frio, luz e trevas 2. Esta RD aumenta em +2 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  SANGUE_ACIDO: {
    name: 'Sangue Ácido',
    description:
      'Quando você sofre dano por um ataque corpo a corpo, o atacante sofre 1 ponto de dano de ácido por poder da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  VISCO_RUBRO: {
    name: 'Visco Rubro',
    description:
      'Você pode gastar 1 PM para expelir um líquido grosso e corrosivo. Até o final da cena, você recebe +1 nas rolagens de dano corpo a corpo. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
};

export default tormentaPowers;
