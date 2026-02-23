/**
 * Maravilhas Mecânicas - Poderes exclusivos do chassi Mashin (Golem Desperto)
 * Regra: Apenas 1 maravilha por patamar de nível
 * Patamares: Iniciante (1-4), Veterano (5-10), Campeão (11-16), Herói (17-20)
 */
import { v4 as uuid } from 'uuid';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

const MECHANICAL_MARVELS: GeneralPower[] = [
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Adaptação Elemental',
    description:
      'Quando sofre dano de ácido, eletricidade, fogo, frio, luz ou trevas, você pode gastar 2 PM para receber redução 10 contra esse tipo de dano até o fim da cena.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Arma Acoplada',
    description:
      'Você possui uma arma corpo a corpo acoplada ao seu corpo. Ela fica recolhida em um compartimento e não pode ser desarmada, e você conta como se tivesse Saque Rápido para usá-la. Uma vez por rodada, quando usa a ação atacar para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a arma acoplada, desde que esteja livre e não tenha sido usada para atacar neste turno. Escolha uma arma corpo a corpo de 1 espaço para acoplar (consulte seu mestre para definir qual arma está acoplada).',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Arma Elemental',
    description:
      'Você pode gastar uma ação de movimento e 2 PM para fazer com que sua arma acoplada esteja empunhando causar +1d6 pontos de dano do tipo de sua fonte de energia até o fim da cena. Pré-requisito: Fonte de Energia (elemental).',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
        { type: RequirementType.TEXT, name: 'Fonte de Energia (elemental)' },
      ],
    ],
    rolls: [
      {
        id: uuid(),
        label: 'Dano Elemental',
        dice: '1d6',
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Auxílio de Mira',
    description:
      'Quando faz um ataque à distância, você pode pagar 1 PM para aumentar em +2 a margem de ameaça desse ataque.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Caminho da Perfeição',
    description:
      'Escolha uma de suas perícias treinadas. Você recebe +2 nessa perícia. Escolha uma perícia treinada ao adquirir esta maravilha (consulte seu mestre para definir qual perícia recebe o bônus).',
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Maravilha Mecânica: Caminho da Perfeição',
        },
        target: {
          type: 'Skill',
          name: Skill.ATLETISMO, // Default - deve ser escolhido manualmente
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Canalizar Reparos',
    description:
      'Como uma ação completa, você pode gastar pontos de mana para recuperar pontos de vida, à taxa de 5 PV por PM.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Canhão Energético',
    description:
      'Se sua arma acoplada for uma arma de fogo, você pode gastar uma ação de movimento e 1 PM para energizá-la. Até o fim da cena, seu próximo ataque com ela causa +1 dado de dano do mesmo tipo. Múltiplos usos deste poder são cumulativos (limitado por sua Constituição). Pré-requisito: Arma Acoplada. Requer Arma Acoplada com uma arma de fogo.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
        {
          type: RequirementType.TEXT,
          name: 'Maravilha Mecânica: Arma Acoplada',
        },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Dínamo de Mana',
    description:
      'Escolha uma de suas habilidades com um custo em PM. Você pode gastar uma ação de movimento para canalizar sua mana. Quando faz isso, até o fim do seu turno, o custo do próximo uso da habilidade escolhida é reduzido em –1 PM. Um personagem treinado em Ofício (artesão) pode substituir essa habilidade com uma hora de trabalho e o gasto de T$ 100. Escolha uma habilidade com custo em PM ao adquirir esta maravilha.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Pernas Aprimoradas',
    description:
      'Você pode gastar 2 PM para receber +6m em seu deslocamento e +5cm Atletismo até o fim da cena.',
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Maravilha Mecânica: Pernas Aprimoradas',
        },
        target: {
          type: 'Displacement',
        },
        modifier: {
          type: 'Fixed',
          value: 6,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Maravilha Mecânica: Pernas Aprimoradas',
        },
        target: {
          type: 'Skill',
          name: Skill.ATLETISMO,
        },
        modifier: {
          type: 'Fixed',
          value: 5,
        },
      },
    ],
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maravilha Mecânica: Reservatório Alquímico',
    description:
      'Você possui um reservatório em seu corpo que pode armazenar até duas doses de preparados alquímicos. Uma vez por rodada, você pode usar um desses preparados como uma ação livre. Carregar seu reservatório exige uma ação completa e o gasto dos itens com os quais você quiser carregá-lo. Pré-requisito: Fonte de Energia (alquímica).',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Golem Desperto' },
        { type: RequirementType.CHASSIS, name: 'mashin' },
        { type: RequirementType.TIER_LIMIT, name: 'Maravilha Mecânica' },
        { type: RequirementType.TEXT, name: 'Fonte de Energia (alquímica)' },
      ],
    ],
  },
];

export default MECHANICAL_MARVELS;
