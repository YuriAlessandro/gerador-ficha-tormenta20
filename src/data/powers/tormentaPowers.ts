import { cloneDeep, merge } from 'lodash';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../interfaces/Poderes';

const tormentaPowers: Record<string, GeneralPower> = {
  ANATOMIA_INSANA: {
    name: 'Anatomia Insana',
    description:
      'Você tem 25% de chance (resultado “1” em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo. A chance aumenta em +25% para cada dois outros poderes da Tormenta que você possui',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  ANTENAS: {
    name: 'Antenas',
    description:
      'Você recebe +1 em Iniciativa, Percepção e Vontade. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  ARMAMENTO_ABERRANTE: {
    name: 'Armamento Aberrante',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para produzir uma arma orgânica macabra — ela brota do seu braço, ombro ou costas como uma planta grotesca e então se desprende. Você pode produzir qualquer arma corpo a corpo ou de arremesso com a qual seja proficiente. O dano da arma aumenta em um passo para cada dois outros poderes da Tormenta que você possui. A arma dura pela cena, então se desfaz numa poça de gosma. Pré-requisito: outro poder da Tormenta.',
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
  },
  ASAS_INSETOIDES: {
    name: 'Asas Insetoides',
    description:
      'Você pode gastar 1 PM para receber deslocamento de voo 9m até o fim da rodada. O deslocamento aumenta em 1,5m para cada outro poder da Tormenta que você possui.',
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
      'Sua pele é recoberta por placas quitinosas. Você recebe +1 na Defesa (JÁ INCLUSO). Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    // action(
    //   sheet: CharacterSheet,
    //   subSteps: { name: string; value: string }[]
    // ): CharacterSheet {
    //   const sheetClone = cloneDeep(sheet);

    //   const tormentaPowersQtd = sheetClone.generalPowers.filter(
    //     (power) => power.type === GeneralPowerType.TORMENTA
    //   ).length;

    //   const defenseBonus = Math.floor(tormentaPowersQtd / 2);

    //   subSteps.push({
    //     name: 'Carapaça',
    //     value: `+${defenseBonus} na Defesa`,
    //   });

    //   sheetClone.defesa += defenseBonus;

    //   return sheetClone;
    // }, // TODO: Isso aqui tem que ser feito direitinho depois
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
  DENTES_AFIADOS: {
    name: 'Dentes Afiados',
    description:
      'Você recebe uma arma natural de mordida (dano 1d4, crítico x2, corte). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);
      subSteps.push({ name: 'Dentes Afiados', value: 'Ataque "Mordida"' });
      return merge(sheetClone, {
        bag: {
          equipments: {
            Arma: [
              ...sheetClone.bag.equipments.Arma,
              {
                group: 'Arma',
                nome: 'Mordida',
                dano: '1d4',
                critico: 'x2',
                tipo: 'Corte',
              },
            ],
          },
        },
      });
    },
  },
  EMPUNHADURA_RUBRA: {
    name: 'Empunhadura Rubra',
    description:
      'Você pode gastar 1 PM para cobrir suas mãos com uma carapaça rubra. Até o final da cena, você recebe +1 em Luta. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  MAOS_MEMBRANOSAS: {
    name: 'Mãos Membranosas',
    description:
      'Você recebe +1 em Atletismo, Fortitude e testes de agarrar. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  MEMBROS_EXTRAS: {
    name: 'Membros extras',
    description:
      'Você possui um par de patas insetoides que saem de suas costas, ombros ou flancos. Quando usa a ação atacar, pode gastar 2 PM para fazer um ataque corpo a corpo extra com cada um (dano 1d4, crítico x2, corte). Se possuir Ambidestria ou Estilo de Duas Armas, pode empunhar armas leves em suas patas insetoides (mas ainda precisa pagar 2 PM para atacar com elas e sofre a penalidade de –2 em todos os ataques).',
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
  OLHOS_VERMELHOS: {
    name: 'Olhos Vermelhos',
    description:
      'Você recebe visão no escuro e +1 em Intimidação. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  PELE_CORROMPIDA: {
    name: 'Pele Corrompida',
    description:
      'Sua carne foi mesclada à matéria vermelha. Você recebe resistência a ácido, eletricidade, fogo, frio, luz e trevas 2. Esta RD aumenta em +2 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  SANGUE_ACIDO: {
    name: 'Sangue Ácido',
    description:
      'Quando você sofre dano por um ataque corpo a corpo, o atacante sofre 1 ponto de dano de ácido. Este dano aumenta em +1 para cada outro poder da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  VISCO_RUBRO: {
    name: 'Visco Rubro',
    description:
      'Você pode gastar 1 PM para expelir um líquido escuro, grosso e corrosivo. Até o final da cena, você recebe +1 nas rolagens de dano corpo a corpo. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
};

export default tormentaPowers;
