import Race, { RaceAttributeAbility } from '../../../../../interfaces/Race';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';
import { Atributo } from '../../atributos';
import {
  GOLEM_DESPERTO_CHASSIS,
  GOLEM_DESPERTO_CHASSIS_NAMES,
  GOLEM_DESPERTO_ENERGY_SOURCES,
  GOLEM_DESPERTO_SIZES,
  GOLEM_DESPERTO_SIZE_NAMES,
  getRandomCompatibleEnergySource,
} from './golem-desperto-config';

// Atributos base do Golem Desperto (antes de chassi/tamanho)
export const GOLEM_DESPERTO_BASE_ATTRIBUTES: RaceAttributeAbility[] = [
  { attr: Atributo.FORCA, mod: 1 },
  { attr: Atributo.CARISMA, mod: -1 },
];

// Habilidades fixas do Golem Desperto (herdadas do Golem original)
const CANALIZAR_REPAROS = {
  name: 'Canalizar Reparos',
  description:
    'Como uma ação completa, você pode gastar pontos de mana para recuperar pontos de vida, à taxa de 5 PV por PM.',
};

const CRIATURA_ARTIFICIAL = {
  name: 'Criatura Artificial',
  description:
    'Você é uma criatura do tipo construto. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, não recupera pontos de vida por descanso e não se beneficia de habilidades de cura e itens ingeríveis (comidas, poções etc.). Você precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PM por descanso em condições normais (golems não são afetados por condições boas ou ruins de descanso).',
  sheetActions: [
    {
      source: { type: 'power' as const, name: 'Criatura Artificial' },
      action: {
        type: 'addSense' as const,
        sense: 'Visão no escuro',
      },
    },
    {
      source: { type: 'power' as const, name: 'Criatura Artificial' },
      action: {
        type: 'addSense' as const,
        sense: 'Imunidade a doenças, fadiga, sangramento, sono e venenos',
      },
    },
  ],
};

const SEM_ORIGEM = {
  name: 'Sem Origem',
  description:
    'Como uma criatura artificial, você já foi construído "pronto". Não teve uma infância — portanto, não tem direito a escolher uma origem e receber benefícios por ela.',
};

// Habilidades fixas exportadas (para uso em applyGolemDespertoCustomization)
export const GOLEM_DESPERTO_FIXED_ABILITIES = [
  CANALIZAR_REPAROS,
  CRIATURA_ARTIFICIAL,
  SEM_ORIGEM,
];

// Placeholders para habilidades dinâmicas (serão substituídas)
const CHASSI_PLACEHOLDER = {
  name: 'Chassi',
  description: 'Chassi do golem (será substituído pela customização).',
};

const FONTE_ENERGIA_PLACEHOLDER = {
  name: 'Fonte de Energia',
  description:
    'Fonte de energia do golem (será substituído pela customização).',
};

/**
 * Mescla atributos cumulativos, somando modificadores do mesmo atributo
 */
function mergeAttributes(
  attributes: RaceAttributeAbility[]
): RaceAttributeAbility[] {
  const attrMap = new Map<string, number>();

  attributes.forEach((attr) => {
    if (attr.attr !== 'any') {
      const current = attrMap.get(attr.attr) || 0;
      attrMap.set(attr.attr, current + attr.mod);
    }
  });

  // Incluir atributos 'any' sem mesclar
  const anyAttrs = attributes.filter((attr) => attr.attr === 'any');

  // Converter Map de volta para array
  const mergedAttrs: RaceAttributeAbility[] = Array.from(attrMap.entries()).map(
    ([attr, mod]) => ({
      attr: attr as Atributo,
      mod,
    })
  );

  return [...mergedAttrs, ...anyAttrs];
}

/**
 * Aplica customização ao Golem Desperto
 * Esta função é usada tanto na geração inicial quanto no editor manual
 */
export function applyGolemDespertoCustomization(
  baseRace: Race,
  chassisId: string,
  energySourceId: string,
  sizeId: string
): Race {
  const chassis = GOLEM_DESPERTO_CHASSIS[chassisId];
  const energySource = GOLEM_DESPERTO_ENERGY_SOURCES[energySourceId];
  const size = GOLEM_DESPERTO_SIZES[sizeId];

  if (!chassis || !energySource || !size) {
    // Invalid customization - return base race unchanged
    return baseRace;
  }

  // Construir atributos do zero: base conhecida + chassi + tamanho
  // Não usa baseRace.attributes.attrs para evitar duplicação quando setup() já aplicou
  const accumulatedAttrs = mergeAttributes([
    ...GOLEM_DESPERTO_BASE_ATTRIBUTES,
    ...chassis.attributes,
    ...size.attributes,
  ]);

  // Construir habilidades do zero: fixas conhecidas + chassi + energia
  // Não usa baseRace.abilities para evitar duplicação quando setup() já aplicou
  const abilities = [
    ...GOLEM_DESPERTO_FIXED_ABILITIES,
    chassis.chassiAbility,
    energySource.ability,
  ];

  return {
    ...baseRace,
    chassis: chassisId,
    energySource: energySourceId,
    sizeCategory: sizeId,
    attributes: {
      attrs: accumulatedAttrs,
    },
    abilities,
    size: size.sizeCategory,
  };
}

/**
 * Raça Golem Desperto
 * Usa setup() para gerar escolhas aleatórias iniciais
 * Modal de customização permite ao usuário alterar antes de finalizar
 */
const GOLEM_DESPERTO: Race = {
  name: 'Golem Desperto',

  // Atributos base (serão acumulados com chassis e tamanho)
  attributes: {
    attrs: [...GOLEM_DESPERTO_BASE_ATTRIBUTES],
  },

  faithProbability: {
    AHARADAK: 1,
    TANNATOH: 1,
    WYNNA: 1,
  },

  // Habilidades: fixas + placeholders para dinâmicas
  abilities: [
    ...GOLEM_DESPERTO_FIXED_ABILITIES,
    CHASSI_PLACEHOLDER,
    FONTE_ENERGIA_PLACEHOLDER,
  ],

  /**
   * setup() gera escolhas aleatórias e aplica customização
   * Modal permitirá alteração após geração
   */
  setup: (race) => {
    // Gerar escolhas aleatórias
    const randomChassisId = getRandomItemFromArray(
      GOLEM_DESPERTO_CHASSIS_NAMES
    );
    const randomEnergyId = getRandomCompatibleEnergySource(randomChassisId);
    const randomSizeId = getRandomItemFromArray(GOLEM_DESPERTO_SIZE_NAMES);

    // Aplicar customização completa
    // Isso garante que as habilidades corretas (com sheetActions) sejam aplicadas
    return applyGolemDespertoCustomization(
      race,
      randomChassisId,
      randomEnergyId,
      randomSizeId
    );
  },

  /**
   * Retorna deslocamento baseado no chassis
   */
  getDisplacement(race) {
    if (race.chassis) {
      const chassis = GOLEM_DESPERTO_CHASSIS[race.chassis];
      if (chassis) {
        return chassis.displacement;
      }
    }
    return 6; // Default
  },
};

export default GOLEM_DESPERTO;
