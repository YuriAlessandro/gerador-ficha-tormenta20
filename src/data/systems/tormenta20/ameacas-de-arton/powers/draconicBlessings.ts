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
import Equipment from '../../../../../interfaces/Equipment';
import { allArcaneSpellsCircle1 } from '../../magias/arcane';
import { Atributo } from '../../atributos';

// Arma natural da Bênção Dracônica: Armamento Kallyanach
const armaNaturalDraconica: Equipment = {
  group: 'Arma',
  nome: 'Arma Natural Dracônica',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Perf./Imp.',
  preco: 0,
};

const DRACONIC_BLESSINGS: GeneralPower[] = [
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Armamento Kallyanach',
    description:
      'Você possui uma arma natural (dano 1d6, crítico x2) escolhida entre cauda (impacto), chifres (perfuração) ou mordida (perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com essa arma.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Bênção Dracônica: Armamento Kallyanach',
        },
        action: {
          type: 'addEquipment',
          equipment: { Arma: [armaNaturalDraconica] },
          description:
            'Arma natural dracônica (cauda, chifres ou mordida) pode ser usada como ataque extra.',
        },
      },
    ],
  },
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
    name: 'Bênção Dracônica: Escamas Elementais',
    description:
      'Sua pele é recoberta de escamas resistentes e brilhantes, que fornecem +2 na Defesa e aumentam a RD de sua Herança Dracônica para 10.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Bênção Dracônica: Escamas Elementais',
        },
        target: {
          type: 'Defense',
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Prática Arcana',
    description:
      'Escolha uma magia arcana de 1º círculo que cause dano do mesmo tipo de sua Herança Dracônica. Você pode lançar essa magia (atributo-chave Inteligência). Caso aprenda novamente essa magia, seu custo diminui em –1 PM. Você pode escolher esta bênção mais de uma vez para outras magias.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Bênção Dracônica: Prática Arcana',
        },
        action: {
          type: 'learnSpell',
          availableSpells: allArcaneSpellsCircle1,
          pick: 1,
          customAttribute: Atributo.INTELIGENCIA,
        },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Sentidos Dracônicos',
    description:
      'Seus sentidos são impregnados com poder dracônico. Você recebe faro e visão no escuro.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TIER_LIMIT, name: 'Bênção Dracônica' },
      ],
    ],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Bênção Dracônica: Sentidos Dracônicos',
        },
        action: {
          type: 'addSense',
          sense: 'Faro',
        },
      },
      {
        source: {
          type: 'power',
          name: 'Bênção Dracônica: Sentidos Dracônicos',
        },
        action: {
          type: 'addSense',
          sense: 'Visão no Escuro',
        },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Bênção Dracônica: Sopro de Dragão',
    description:
      'Você pode gastar uma ação padrão e 1 PM para soprar um cone de 6m que causa 1d12 pontos de dano do tipo de sua Herança Dracônica (Ref CD Constituição reduz à metade). A cada quatro níveis após o 1º, você pode gastar +1 PM para aumentar o dano do sopro em +1d12.',
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
