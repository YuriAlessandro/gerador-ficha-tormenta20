import {
  RaceAbility,
  RaceAttributeAbility,
  RaceSize,
} from '../../../../../interfaces/Race';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import { RACE_SIZES } from '../../races/raceSizes/raceSizes';

// =============================================================================
// INTERFACES
// =============================================================================

export interface DuendeNature {
  id: string;
  name: string;
  displayName: string;
  abilities: RaceAbility[];
  extraAttribute?: boolean; // Se dá +1 atributo adicional (Animal)
}

export interface DuendeSize {
  id: string;
  name: string;
  displayName: string;
  displacement: number;
  sizeCategory: RaceSize;
  attributeModifiers?: RaceAttributeAbility[];
}

export interface DuendePresente {
  id: string;
  ability: RaceAbility;
}

// =============================================================================
// NATUREZAS (3 opções)
// =============================================================================

export const DUENDE_NATURES: Record<string, DuendeNature> = {
  animal: {
    id: 'animal',
    name: 'Animal',
    displayName: 'Animal (+1 atributo extra)',
    extraAttribute: true,
    abilities: [
      {
        name: 'Natureza Animal',
        description:
          'Você é feito de carne e osso. Seu corpo é humanoide, mas sua aparência varia: pode ser algo similar a um elfo ou sílfide, um animal que anda sobre duas patas ou uma mistura dessas possibilidades. Você recebe +1 em um atributo à sua escolha (pode acumular com os Dons).',
      },
    ],
  },

  vegetal: {
    id: 'vegetal',
    name: 'Vegetal',
    displayName: 'Vegetal (imunidades + cura)',
    extraAttribute: false,
    abilities: [
      {
        name: 'Natureza Vegetal',
        description:
          'Você é feito de folhas, vinhas, cortiça ou madeira. Você é imune a atordoamento e metamorfose, mas é afetado por efeitos que afetam plantas monstruosas — se o efeito não tiver um teste de resistência, você tem direito a um teste de Fortitude.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Natureza Vegetal' },
            action: {
              type: 'addSense',
              sense: 'Imunidade a atordoamento e metamorfose',
            },
          },
        ],
      },
      {
        name: 'Florescer Feérico',
        description:
          'Uma vez por rodada, você pode gastar uma quantidade de PM limitada pela sua Constituição para curar 2d8 PV por PM gasto no início do seu próximo turno.',
      },
    ],
  },

  mineral: {
    id: 'mineral',
    name: 'Mineral',
    displayName: 'Mineral (reduções + imunidade)',
    extraAttribute: false,
    abilities: [
      {
        name: 'Natureza Mineral',
        description:
          'Você é feito de material inorgânico, como argila, rocha, cristal ou vidro. Você recebe imunidade a efeitos de metabolismo e redução de corte, fogo e perfuração 5, mas não se beneficia de itens da categoria alimentação.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Natureza Mineral' },
            action: {
              type: 'addSense',
              sense:
                'Imunidade a metabolismo; Redução de corte, fogo e perfuração 5',
            },
          },
        ],
      },
    ],
  },
};

export const DUENDE_NATURE_NAMES = Object.keys(DUENDE_NATURES);

// =============================================================================
// TAMANHOS (4 opções)
// =============================================================================

export const DUENDE_SIZES: Record<string, DuendeSize> = {
  minusculo: {
    id: 'minusculo',
    name: 'Minúsculo',
    displayName: 'Minúsculo (6m, -1 For)',
    displacement: 6,
    sizeCategory: RACE_SIZES.MINUSCULO,
    attributeModifiers: [{ attr: Atributo.FORCA, mod: -1 }],
  },

  pequeno: {
    id: 'pequeno',
    name: 'Pequeno',
    displayName: 'Pequeno (6m)',
    displacement: 6,
    sizeCategory: RACE_SIZES.PEQUENO,
    attributeModifiers: [],
  },

  medio: {
    id: 'medio',
    name: 'Médio',
    displayName: 'Médio (9m)',
    displacement: 9,
    sizeCategory: RACE_SIZES.MEDIO,
    attributeModifiers: [],
  },

  grande: {
    id: 'grande',
    name: 'Grande',
    displayName: 'Grande (9m, -1 Des)',
    displacement: 9,
    sizeCategory: RACE_SIZES.GRANDE,
    attributeModifiers: [{ attr: Atributo.DESTREZA, mod: -1 }],
  },
};

export const DUENDE_SIZE_NAMES = Object.keys(DUENDE_SIZES);

// =============================================================================
// PRESENTES DE MAGIA E DE CAOS (14 poderes)
// =============================================================================

export const DUENDE_PRESENTES: Record<string, DuendePresente> = {
  'afinidade-agua': {
    id: 'afinidade-agua',
    ability: {
      name: 'Afinidade Elemental (Água)',
      description:
        'Sua ligação com o elemento água lhe concede deslocamento de natação igual ao seu deslocamento base. Você pode lançar as magias Criar Elementos (apenas água) e Névoa. Seu atributo-chave para estas magias é Carisma.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Afinidade Elemental (Água)' },
          action: {
            type: 'addSense',
            sense: 'Deslocamento de natação igual ao deslocamento base',
          },
        },
      ],
    },
  },

  'afinidade-fogo': {
    id: 'afinidade-fogo',
    ability: {
      name: 'Afinidade Elemental (Fogo)',
      description:
        'Sua ligação com o elemento fogo lhe concede redução de dano de fogo 5. Você pode lançar as magias Criar Elementos (apenas fogo) e Explosão de Chamas. Seu atributo-chave para estas magias é Carisma.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Afinidade Elemental (Fogo)' },
          action: {
            type: 'addSense',
            sense: 'Redução de fogo 5',
          },
        },
      ],
    },
  },

  'afinidade-vegetacao': {
    id: 'afinidade-vegetacao',
    ability: {
      name: 'Afinidade Elemental (Vegetação)',
      description:
        'Sua ligação com a vegetação permite que você atravesse terrenos difíceis naturais sem sofrer redução no deslocamento. Você pode lançar as magias Armamento da Natureza e Controlar Plantas. Seu atributo-chave para estas magias é Carisma.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Afinidade Elemental (Vegetação)' },
          action: {
            type: 'addSense',
            sense: 'Ignora terreno difícil natural',
          },
        },
      ],
    },
  },

  'encantar-objetos': {
    id: 'encantar-objetos',
    ability: {
      name: 'Encantar Objetos',
      description:
        'Você pode gastar uma ação de movimento e 3 PM para tocar um item e aplicar a ele um encanto (sem pré-requisitos) que dura até o fim da cena.',
    },
  },

  enfeiticar: {
    id: 'enfeiticar',
    ability: {
      name: 'Enfeitiçar',
      description:
        'Você pode lançar a magia Enfeitiçar e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
    },
  },

  invisibilidade: {
    id: 'invisibilidade',
    ability: {
      name: 'Invisibilidade',
      description:
        'Você pode lançar a magia Invisibilidade e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
    },
  },

  'lingua-natureza': {
    id: 'lingua-natureza',
    ability: {
      name: 'Língua da Natureza',
      description:
        'Você pode falar com animais e plantas e recebe +2 em Adestramento e Sobrevivência.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Língua da Natureza' },
          target: { type: 'Skill', name: Skill.ADESTRAMENTO },
          modifier: { type: 'Fixed', value: 2 },
        },
        {
          source: { type: 'power', name: 'Língua da Natureza' },
          target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
  },

  maldicao: {
    id: 'maldicao',
    ability: {
      name: 'Maldição',
      description:
        'Você pode gastar uma ação padrão e 3 PM para amaldiçoar uma criatura em alcance curto. A vítima tem direito a um teste de resistência (Fortitude ou Vontade, escolhido na criação do duende). Se falhar, sofre um efeito permanente (escolhido de uma lista na criação do duende) até ser cancelado ou curado. Você só pode manter uma maldição por vez.',
    },
  },

  'mais-la-que-aqui': {
    id: 'mais-la-que-aqui',
    ability: {
      name: 'Mais Lá do que Aqui',
      description:
        'Você pode gastar uma ação padrão e 2 PM para fazer a maior parte do seu corpo desaparecer por uma cena, recebendo camuflagem leve e +5 em Furtividade.',
    },
  },

  'metamorfose-animal': {
    id: 'metamorfose-animal',
    ability: {
      name: 'Metamorfose Animal',
      description:
        'Você pode se transformar em um tipo de animal. Escolha uma forma selvagem básica do druida. Você pode gastar uma ação completa e 3 PM para assumir essa forma. Você pode falar e lançar magias em sua forma animal.',
    },
  },

  'sonhos-profeticos': {
    id: 'sonhos-profeticos',
    ability: {
      name: 'Sonhos Proféticos',
      description:
        'Uma vez por cena, você pode gastar 3 PM e rolar 1d20. Até o fim da cena, você pode substituir o resultado do d20 de um teste de uma criatura em alcance curto pelo resultado que você rolou.',
    },
  },

  'velocidade-pensamento': {
    id: 'velocidade-pensamento',
    ability: {
      name: 'Velocidade do Pensamento',
      description:
        'No primeiro turno de cada cena, você pode gastar 2 PM para realizar uma ação padrão adicional, mas em troca pula o seu turno na segunda rodada.',
    },
  },

  'visao-feerica': {
    id: 'visao-feerica',
    ability: {
      name: 'Visão Feérica',
      description:
        'Você recebe visão na penumbra e está permanentemente sob efeito da magia Visão Mística (com o aprimoramento para ver criaturas invisíveis).',
      sheetActions: [
        {
          source: { type: 'power', name: 'Visão Feérica' },
          action: {
            type: 'addSense',
            sense: 'Visão na penumbra; Visão Mística permanente',
          },
        },
      ],
    },
  },

  voo: {
    id: 'voo',
    ability: {
      name: 'Voo',
      description:
        'Você pode flutuar a 1,5m do chão com deslocamento de seu deslocamento base +3m e é imune a dano por queda. Pode voar de verdade gastando 1 PM por rodada, com deslocamento de seu deslocamento base +6m.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Voo' },
          action: {
            type: 'addSense',
            sense: 'Flutuar 1,5m; Imune a dano por queda',
          },
        },
      ],
    },
  },
};

export const DUENDE_PRESENTE_NAMES = Object.keys(DUENDE_PRESENTES);

// =============================================================================
// PERÍCIAS DO TABU
// =============================================================================

export const DUENDE_TABU_SKILLS: Skill[] = [
  Skill.DIPLOMACIA,
  Skill.INICIATIVA,
  Skill.LUTA,
  Skill.PERCEPCAO,
];

// =============================================================================
// HABILIDADES FIXAS (Limitações)
// =============================================================================

export const DUENDE_FIXED_ABILITIES: RaceAbility[] = [
  {
    name: 'Tipo de Criatura',
    description: 'Você é uma criatura do tipo Espírito.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Tipo de Criatura' },
        action: {
          type: 'addSense',
          sense: 'Tipo: Espírito',
        },
      },
    ],
  },
  {
    name: 'Aversão a Ferro',
    description:
      'Você sofre 1 ponto de dano adicional por dado de dano de ataques com armas de ferro e sofre 1d6 pontos de dano por rodada se estiver empunhando ou vestindo um item de ferro. Isso também se aplica a aço, que inclui ferro em sua composição. Na prática, duendes usam apenas armas de madeira ou de materiais especiais, como mitral.',
  },
  {
    name: 'Aversão a Sinos',
    description:
      'O badalar de um sino representa ordem e devoção, algo que faz mal a duendes. Se você escutar esse som, fica alquebrado e esmorecido até o fim da cena. No início de qualquer cena em um ambiente urbano no qual haja uma ou mais igrejas ou templos, role 1d6. Em um resultado 1, você escutará um sino badalando em algum lugar.',
  },
];

/**
 * Cria a habilidade Tabu com a perícia selecionada
 */
export function buildTabuAbility(skill: Skill): RaceAbility {
  return {
    name: 'Tabu',
    description: `Você possui um tabu — algo que nunca pode fazer (ou deixar de fazer). A esquisitice de seu tabu impõe uma penalidade de –5 em ${skill}. Se você desrespeitar seu tabu, fica fatigado por um dia (mesmo que seja imune a essa condição). Se no dia seguinte continuar desrespeitando o tabu, você fica exausto. Se no terceiro dia não mudar seu comportamento, você morre.`,
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Tabu' },
        target: { type: 'Skill', name: skill },
        modifier: { type: 'Fixed', value: -5 },
      },
    ],
  };
}
