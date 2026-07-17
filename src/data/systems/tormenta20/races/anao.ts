import Race from '../../../../interfaces/Race';
import { Atributo } from '../atributos';

// Machados, martelos, marretas e picaretas cobertos por Tradição de Heredrimm
// (core + Heróis de Arton). Mantido como lista de nomes: cada um vira uma
// proficiência nomeada na ficha (removível pelo editor de proficiências).
const HEREDRIMM_WEAPON_NAMES = [
  // Core (marciais)
  'Machadinha',
  'Machado de Batalha',
  'Martelo de Guerra',
  'Picareta',
  'Machado de Guerra',
  'Marreta',
  // Core (exóticas)
  'Machado Anão',
  'Machado Táurico',
  // Heróis de Arton (marciais)
  'Martelo leve',
  'Martelo longo',
  'Malho',
  'Bico de corvo',
  // Heróis de Arton (exóticas)
  'Marrão',
  'Machado de haste',
];

const ANAO: Race = {
  name: 'Anão',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: Atributo.DESTREZA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ARSENAL: 1,
    KHALMYR: 1,
    LINWU: 1,
    THWOR: 1,
    TENEBRA: 1,
  },
  getDisplacement: () => 6,
  // "Devagar e Sempre": deslocamento não é reduzido por armadura ou carga.
  ignoreEncumbrance: true,
  abilities: [
    {
      name: 'Conhecimento das Rochas',
      description:
        'Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Conhecimento das Rochas',
          },
          action: {
            type: 'addSense',
            sense: 'Visão no Escuro',
          },
        },
      ],
    },
    {
      name: 'Devagar e Sempre',
      description:
        'Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.',
    },
    {
      name: 'Tradição de Heredrimm',
      description:
        'Você é perito nas armas tradicionais anãs, seja por ter treinado com elas, seja por usá-las como ferramentas de ofício. Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas.',
      sheetBonuses: [
        {
          source: {
            type: 'race',
            raceName: 'Anão',
          },
          target: {
            type: 'WeaponAttack',
            weaponTags: ['heredrimm'],
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        // "Todos os machados, martelos, marretas e picaretas são armas
        // simples para você": proficiências nomeadas, reconhecidas por
        // isProficientWithWeapon (evitam o -5 de não proficiência).
        ...HEREDRIMM_WEAPON_NAMES.map((nome) => ({
          source: {
            type: 'race' as const,
            raceName: 'Anão',
          },
          target: {
            type: 'Proficiency' as const,
            proficiency: nome,
          },
          modifier: {
            type: 'Fixed' as const,
            value: 1,
          },
        })),
      ],
    },
    {
      name: 'Duro com Pedra',
      description:
        'Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte.',
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Duro com Pedra',
          },
          target: {
            type: 'PV',
          },
          modifier: {
            type: 'LevelCalc',
            formula: '{level} + 2',
          },
        },
      ],
    },
  ],
};

export default ANAO;
