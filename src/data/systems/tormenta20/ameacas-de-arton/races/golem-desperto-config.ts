import {
  RaceAbility,
  RaceAttributeAbility,
  RaceSize,
} from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import { RACE_SIZES } from '../../races/raceSizes/raceSizes';

// Interfaces para as customizações do Golem Desperto

export interface GolemDespertoChassis {
  id: string;
  name: string;
  attributes: RaceAttributeAbility[];
  displacement: number;
  chassiAbility: RaceAbility;
  energyRestrictions?: string[]; // IDs de fontes de energia incompatíveis
}

export interface GolemDespertoEnergySource {
  id: string;
  name: string;
  displayName: string; // Nome para exibir no dropdown
  ability: RaceAbility;
}

export interface GolemDespertoSize {
  id: 'pequeno' | 'medio' | 'grande';
  name: string;
  displayName: string; // Nome com modificador para dropdown
  attributes: RaceAttributeAbility[];
  sizeCategory: RaceSize;
}

// =============================================================================
// CHASSIS (8 opções)
// =============================================================================

export const GOLEM_DESPERTO_CHASSIS: Record<string, GolemDespertoChassis> = {
  barro: {
    id: 'barro',
    name: 'Chassi de Barro',
    attributes: [{ attr: Atributo.CONSTITUICAO, mod: 2 }],
    displacement: 9,
    chassiAbility: {
      name: 'Chassi de Barro',
      description:
        'Seu corpo de barro é flexível e adaptável. Seu deslocamento não é afetado por terreno difícil e você passa automaticamente em testes de Acrobacia para passar por espaços apertados. Se permanecer mais de um dia sem contato com água, você não recupera PM com descanso até voltar para a água.',
    },
    energyRestrictions: [], // Sem restrições
  },

  bronze: {
    id: 'bronze',
    name: 'Chassi de Bronze',
    attributes: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    displacement: 9,
    chassiAbility: {
      name: 'Chassi de Bronze',
      description:
        'Seu corpo de bronze é nobre e versátil. Seu deslocamento não é reduzido por armaduras pesadas ou excesso de carga. Sua armadura não é acoplada ao seu corpo; você pode removê-la e colocá-la no tempo normal, mas ela conta em seu limite de itens vestidos.',
    },
    energyRestrictions: [], // Sem restrições
  },

  carne: {
    id: 'carne',
    name: 'Chassi de Carne',
    attributes: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
    displacement: 6,
    chassiAbility: {
      name: 'Chassi de Carne',
      description:
        'Seu corpo grotesco é formado por carne morta reanimada. Seu deslocamento é 6m, mas não é reduzido por uso de armadura ou excesso de carga. Você recebe imunidade a metamorfose e trevas, mas não pode escolher elemental (água ou fogo) ou vapor como sua fonte de energia, e dano mágico de fogo e frio o deixa lento por 1d4 rodadas.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Chassi de Carne' },
          action: {
            type: 'addSense',
            sense: 'Imunidade a metamorfose e trevas',
          },
        },
      ],
    },
    energyRestrictions: ['elemental-agua', 'elemental-fogo', 'vapor'],
  },

  espelhos: {
    id: 'espelhos',
    name: 'Chassi de Espelhos',
    attributes: [
      { attr: Atributo.CARISMA, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: Atributo.CONSTITUICAO, mod: -1 },
    ],
    displacement: 9,
    chassiAbility: {
      name: 'Chassi de Espelhos',
      description:
        'Seu corpo refletivo permite copiar habilidades. Quando uma criatura em alcance curto usa uma habilidade de classe que você possa ver, você pode gastar 1 PM para copiar essa habilidade. Até o fim do seu próximo turno, você pode usá-la como uma habilidade de raça (se ela usar um atributo para algo, use seu Carisma). Se copiar outra habilidade, você perde a anterior.',
    },
    energyRestrictions: [], // Sem restrições
  },

  ferro: {
    id: 'ferro',
    name: 'Chassi de Ferro',
    attributes: [
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
    ],
    displacement: 6,
    chassiAbility: {
      name: 'Chassi de Ferro',
      description:
        'Seu corpo de ferro é extremamente resistente. Seu deslocamento é 6m, mas não é reduzido por uso de armadura ou excesso de carga. Você recebe +2 na Defesa, mas possui penalidade de armadura –2.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Chassi de Ferro' },
          target: { type: 'Defense' },
          modifier: { type: 'Fixed', value: 2 },
        },
        {
          source: { type: 'power', name: 'Chassi de Ferro' },
          target: { type: 'ArmorPenalty' },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    energyRestrictions: [], // Sem restrições
  },

  gelo_eterno: {
    id: 'gelo_eterno',
    name: 'Chassi de Gelo Eterno',
    attributes: [{ attr: Atributo.CONSTITUICAO, mod: 2 }],
    displacement: 6,
    chassiAbility: {
      name: 'Chassi de Gelo Eterno',
      description:
        'Seu corpo de gelo eterno nunca derrete. Seu deslocamento é 6m, mas não é reduzido por uso de armadura ou excesso de carga. Você recebe imunidade a frio e redução de fogo 10, mas não pode escolher elemental (fogo) ou vapor como sua fonte de energia.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Chassi de Gelo Eterno' },
          action: {
            type: 'addSense',
            sense: 'Imunidade a frio e redução de fogo 10',
          },
        },
      ],
    },
    energyRestrictions: ['elemental-fogo', 'vapor'],
  },

  pedra: {
    id: 'pedra',
    name: 'Chassi de Pedra',
    attributes: [{ attr: Atributo.CONSTITUICAO, mod: 2 }],
    displacement: 6,
    chassiAbility: {
      name: 'Chassi de Pedra',
      description:
        'Seu corpo de pedra é extremamente resistente, mas lento. Você não pode correr e seu deslocamento é 6m, mas não é reduzido por uso de armadura ou excesso de carga. Você recebe redução de corte, fogo e perfuração 5.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Chassi de Pedra' },
          action: {
            type: 'addSense',
            sense: 'Redução de corte, fogo e perfuração 5',
          },
        },
      ],
    },
    energyRestrictions: [], // Sem restrições
  },

  sucata: {
    id: 'sucata',
    name: 'Chassi de Sucata',
    attributes: [
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
    ],
    displacement: 6,
    chassiAbility: {
      name: 'Chassi de Sucata',
      description:
        'Seu corpo é formado por peças improvisadas, mas fácil de reparar. Seu deslocamento é 6m, mas não é reduzido por uso de armadura ou excesso de carga. Quando recebe cuidados prolongados com a perícia Ofício (artesão), sua recuperação de PV aumenta em +2 por nível nesse dia (em vez de +1).',
    },
    energyRestrictions: [], // Sem restrições
  },
};

export const GOLEM_DESPERTO_CHASSIS_NAMES = Object.keys(GOLEM_DESPERTO_CHASSIS);

// =============================================================================
// FONTES DE ENERGIA (5 opções base, Elemental com 4 subtipos)
// =============================================================================

export const GOLEM_DESPERTO_ENERGY_SOURCES: Record<
  string,
  GolemDespertoEnergySource
> = {
  alquimica: {
    id: 'alquimica',
    name: 'Fonte de Energia: Alquímica',
    displayName: 'Alquímica',
    ability: {
      name: 'Fonte de Energia: Alquímica',
      description:
        'Uma mistura alquímica gera a energia necessária à sua vida. Você pode gastar uma ação padrão para ingerir um alquímico qualquer; se fizer isso, recupera 1 PM.',
    },
  },

  'elemental-agua': {
    id: 'elemental-agua',
    name: 'Fonte de Energia: Elemental (Água)',
    displayName: 'Elemental (Água/Frio)',
    ability: {
      name: 'Fonte de Energia: Elemental (Água)',
      description:
        'Você possui um espírito elemental de água preso em seu corpo. Você é imune a dano de frio. Se fosse sofrer dano mágico de frio, em vez disso cura PV em quantidade igual à metade do dano.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Fonte de Energia: Elemental (Água)' },
          action: {
            type: 'addSense',
            sense: 'Imunidade a frio',
          },
        },
      ],
    },
  },

  'elemental-ar': {
    id: 'elemental-ar',
    name: 'Fonte de Energia: Elemental (Ar)',
    displayName: 'Elemental (Ar/Eletricidade)',
    ability: {
      name: 'Fonte de Energia: Elemental (Ar)',
      description:
        'Você possui um espírito elemental de ar preso em seu corpo. Você é imune a dano de eletricidade. Se fosse sofrer dano mágico de eletricidade, em vez disso cura PV em quantidade igual à metade do dano.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Fonte de Energia: Elemental (Ar)' },
          action: {
            type: 'addSense',
            sense: 'Imunidade a eletricidade',
          },
        },
      ],
    },
  },

  'elemental-fogo': {
    id: 'elemental-fogo',
    name: 'Fonte de Energia: Elemental (Fogo)',
    displayName: 'Elemental (Fogo)',
    ability: {
      name: 'Fonte de Energia: Elemental (Fogo)',
      description:
        'Você possui um espírito elemental de fogo preso em seu corpo. Você é imune a dano de fogo. Se fosse sofrer dano mágico de fogo, em vez disso cura PV em quantidade igual à metade do dano.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Fonte de Energia: Elemental (Fogo)' },
          action: {
            type: 'addSense',
            sense: 'Imunidade a fogo',
          },
        },
      ],
    },
  },

  'elemental-terra': {
    id: 'elemental-terra',
    name: 'Fonte de Energia: Elemental (Terra)',
    displayName: 'Elemental (Terra/Ácido)',
    ability: {
      name: 'Fonte de Energia: Elemental (Terra)',
      description:
        'Você possui um espírito elemental de terra preso em seu corpo. Você é imune a dano de ácido. Se fosse sofrer dano mágico de ácido, em vez disso cura PV em quantidade igual à metade do dano.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Fonte de Energia: Elemental (Terra)',
          },
          action: {
            type: 'addSense',
            sense: 'Imunidade a ácido',
          },
        },
      ],
    },
  },

  sagrada: {
    id: 'sagrada',
    name: 'Fonte de Energia: Sagrada',
    displayName: 'Sagrada',
    ability: {
      name: 'Fonte de Energia: Sagrada',
      description:
        'Você foi animado por um texto ou símbolo sagrado depositado em seu corpo. Você pode lançar uma magia divina de 1º círculo a sua escolha (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM. Alguém treinado em Religião pode trocar essa magia com um ritual que demora um dia e exige o gasto de um pergaminho mágico com outra magia de 1° círculo.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Fonte de Energia: Sagrada' },
          action: {
            type: 'special',
            specialAction: 'golemDespertoSagrada',
          },
        },
      ],
    },
  },

  vapor: {
    id: 'vapor',
    name: 'Fonte de Energia: Vapor',
    displayName: 'Vapor',
    ability: {
      name: 'Fonte de Energia: Vapor',
      description:
        'Seu corpo é movido por vapor e engrenagens. Você é imune a dano de fogo; se fosse sofrer dano desse tipo, em vez disso seu deslocamento aumenta em 4,5m por 1 rodada. Entretanto, dano de frio deixa-o lento por 1 rodada. Você pode gastar uma ação padrão e PM para soprar um jato de vapor escaldante em um cone de 4,5m. Criaturas na área sofrem 1d6 pontos de dano de fogo por PM gasto e ficam em chamas (Ref CD Con reduz à metade e evita a condição).',
      sheetActions: [
        {
          source: { type: 'power', name: 'Fonte de Energia: Vapor' },
          action: {
            type: 'addSense',
            sense: 'Imunidade a fogo',
          },
        },
      ],
    },
  },
};

export const GOLEM_DESPERTO_ENERGY_SOURCE_NAMES = Object.keys(
  GOLEM_DESPERTO_ENERGY_SOURCES
);

// =============================================================================
// TAMANHOS (3 opções)
// =============================================================================

export const GOLEM_DESPERTO_SIZES: Record<string, GolemDespertoSize> = {
  pequeno: {
    id: 'pequeno',
    name: 'Pequeno',
    displayName: 'Pequeno (Des +1)',
    attributes: [{ attr: Atributo.DESTREZA, mod: 1 }],
    sizeCategory: RACE_SIZES.PEQUENO,
  },

  medio: {
    id: 'medio',
    name: 'Médio',
    displayName: 'Médio (sem ajuste)',
    attributes: [],
    sizeCategory: RACE_SIZES.MEDIO,
  },

  grande: {
    id: 'grande',
    name: 'Grande',
    displayName: 'Grande (Des -1)',
    attributes: [{ attr: Atributo.DESTREZA, mod: -1 }],
    sizeCategory: RACE_SIZES.GRANDE,
  },
};

export const GOLEM_DESPERTO_SIZE_NAMES = Object.keys(GOLEM_DESPERTO_SIZES);

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Retorna as fontes de energia compatíveis com um chassis específico
 */
export function getCompatibleEnergySources(chassisId: string): string[] {
  const chassis = GOLEM_DESPERTO_CHASSIS[chassisId];
  if (!chassis) {
    return GOLEM_DESPERTO_ENERGY_SOURCE_NAMES;
  }

  const restrictions = chassis.energyRestrictions || [];
  return GOLEM_DESPERTO_ENERGY_SOURCE_NAMES.filter(
    (sourceId) => !restrictions.includes(sourceId)
  );
}

/**
 * Verifica se uma fonte de energia é compatível com um chassis
 */
export function isEnergySourceCompatible(
  chassisId: string,
  energySourceId: string
): boolean {
  const compatibleSources = getCompatibleEnergySources(chassisId);
  return compatibleSources.includes(energySourceId);
}

/**
 * Retorna uma fonte de energia aleatória compatível com o chassis
 */
export function getRandomCompatibleEnergySource(chassisId: string): string {
  const compatibleSources = getCompatibleEnergySources(chassisId);
  const randomIndex = Math.floor(Math.random() * compatibleSources.length);
  return compatibleSources[randomIndex];
}
