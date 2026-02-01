/**
 * Bênçãos Dracônicas - Poderes exclusivos da raça Kallyanach
 * Regra: Apenas 1 bênção por patamar de nível
 * Patamares: Iniciante (1-4), Veterano (5-10), Campeão (11-16), Herói (17-20)
 */
import { v4 as uuid } from 'uuid';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';

const DRACONIC_BLESSINGS: GeneralPower[] = [
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Asas Dracônicas',
    description:
      'Você pode gastar 1 PM por rodada para voar com deslocamento de 9m. Enquanto estiver voando desta forma, você fica vulnerável.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Escamas Brilhantes',
    description:
      'Você recebe +2 de Defesa contra criaturas que possuam escamas resistentes e brilhantes (ref. CD Constituição) e +2 de Defesa contra criaturas que possuem resistência a seu tipo de dano de herança Dracônica (ref. CD Constituição), cumulativo.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Escamas Elementais',
    description:
      'Você pode lançar uma magia arcana de 1º círculo (escolha dentre as escolas de evocação e transmutação) relacionada ao elemento da sua Herança Dracônica (tipo de dano do sopro). Caso não exista magia de 1º círculo com esse tipo de dano dentre essas escolas, escolha uma magia arcana de 1º círculo.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Fúria Arcana',
    description:
      'Após usar uma magia arcana de 1º círculo ou maior, você ganha +1 PM por rodada (isso pode ultrapassar o seu máximo de PM). Quando usa seu sopro, ele causa +1d12 de dano adicional.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
    rolls: [
      {
        id: uuid(),
        label: 'Dano Adicional (Sopro)',
        dice: '1d12',
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Sentidos Dracônicos',
    description: 'Você possui faro e visão no escuro.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Sopro de Dragão',
    description:
      'Você pode gastar uma ação padrão e 1 PM para soprar um cone de 6m que causa 1d12 pontos de dano do tipo de sua Herança Dracônica (Ref CD Constituição reduz à metade). A cada quatro níveis após 1º, você pode gastar +1 PM para aumentar o dano do sopro em +1d12.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
    rolls: [
      {
        id: uuid(),
        label: 'Dano do Sopro (base)',
        dice: '1d12',
      },
    ],
  },
];

export default DRACONIC_BLESSINGS;
