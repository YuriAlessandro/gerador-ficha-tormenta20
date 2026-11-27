import {
  GeneralPowerType,
  Requirement,
  RequirementType,
} from '../../interfaces/Poderes';
import { SupplementId, SUPPLEMENT_METADATA } from '../../types/supplement.types';
import { ClassWithSupplement, dataRegistry } from '../../data/registry';
import { DIVINDADES } from '../../data/systems/tormenta20/divindades';
import {
  classLabelOf,
  encyclopediaIds,
} from '../../functions/encyclopediaSearch';
import { formatRequirements } from '../../functions/requirementText';
import { normalizeSearch } from '../../functions/stringUtils';
import { getDistinctionsBySupplements } from '../../premium/data/distinctions';
import { POWER_ONTOLOGY_MAP } from './powerOntologyMap';

export type PowerTabCategory = 'ALL' | GeneralPowerType | 'CLASSE';

export type PrereqQuickFilter =
  | 'ALL'
  | 'NONE'
  | 'PODER'
  | 'PERICIA'
  | 'ATRIBUTO'
  | 'NIVEL'
  | 'MAGIA'
  | 'TORMENTA'
  | 'ESCALA';

export const GENERIC_RACE_TRAIT_OPTION = '__TRAIT_OR_ANY_RACE__';
export const ANY_DEITY_OPTION = '__ANY_DEITY__';

export const ALL_POWER_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_ATLAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
  SupplementId.TORMENTA20_DEUSES_MENORES,
];

export const POWER_CATEGORY_LABELS: Record<
  Exclude<PowerTabCategory, 'ALL'>,
  string
> = {
  [GeneralPowerType.COMBATE]: 'Combate',
  [GeneralPowerType.CONCEDIDOS]: 'Concedidos',
  [GeneralPowerType.DESTINO]: 'Destino',
  [GeneralPowerType.MAGIA]: 'Magia',
  [GeneralPowerType.TORMENTA]: 'Tormenta',
  [GeneralPowerType.RACA]: 'Raça',
  CLASSE: 'Poderes de Classe',
  [GeneralPowerType.DISTINCAO]: 'Distinção',
};

export const TACTICAL_SUBCATEGORY_LABELS: Record<string, string> = {
  'combate-corpo-a-corpo': 'Corpo a Corpo',
  'combate-a-distancia': 'À Distância',
  defesa: 'Defesa',
  manobra: 'Manobra',
  metamagia: 'Metamagia',
  oficio: 'Ofício',
  social: 'Social',
  sobrevivencia: 'Sobrevivência',
  investigacao: 'Investigação',
  utilidade: 'Utilidade',
  'fabrica-sobrenatural': 'Fábrica Sobrenatural',
  concedido: 'Concedido',
  racial: 'Racial',
  tormenta: 'Tormenta',
};

export interface UnifiedPowerItem {
  id: string;
  name: string;
  description: string;
  category: Exclude<PowerTabCategory, 'ALL'>;
  categoryLabel: string;
  requirements: Requirement[][];
  supplementId: SupplementId;
  supplementName: string;
  races: string[];
  hasGenericRaceTrait: boolean;
  deities: string[];
  acceptsAnyDeity: boolean;
  classLabel?: string;
  eligibleClasses: string[];
  distinctionId?: string;
  distinctionName?: string;
  subcategoriaTatica?: string;
  areaEfeito?: string;
  escalaPorNivel?: boolean;
  escalaPorPoderesTormenta?: boolean;
  magiasRelacionadas?: string[];
  grimoireItemId: string;
  prereqFlags: Set<PrereqQuickFilter>;
}

const MAJOR_DEITY_NAMES = new Set(DIVINDADES.map((d) => d.name));

export function extractPowerRaces(requirements: Requirement[][] = []): {
  races: string[];
  hasGenericRaceTrait: boolean;
} {
  const raceSet = new Set<string>();
  requirements.forEach((group) => {
    group.forEach((req) => {
      if (req.type === RequirementType.RACA && !req.not && req.name) {
        raceSet.add(req.name);
      }
    });
  });

  const races = Array.from(raceSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return {
    races,
    hasGenericRaceTrait: races.length === 0,
  };
}

export function extractPowerDeities(requirements: Requirement[][] = []): {
  deities: string[];
  acceptsAnyDeity: boolean;
} {
  const deitySet = new Set<string>();
  let acceptsAnyDeity = false;

  requirements.forEach((group) => {
    group.forEach((req) => {
      if (req.type === RequirementType.DEVOTO && !req.not) {
        if (!req.name || req.name === 'any') {
          acceptsAnyDeity = true;
        } else {
          deitySet.add(req.name);
        }
      }
    });
  });

  if (deitySet.size === 0 && !acceptsAnyDeity) {
    acceptsAnyDeity = true;
  }

  return {
    deities: Array.from(deitySet).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    acceptsAnyDeity,
  };
}

function buildPrereqFlags(
  requirements: Requirement[][] = [],
  escalaPorNivel?: boolean,
  escalaPorPoderesTormenta?: boolean
): Set<PrereqQuickFilter> {
  const flags = new Set<PrereqQuickFilter>();
  const flatReqs = requirements.flat().filter((r) => Boolean(r));
  if (flatReqs.length === 0) {
    flags.add('NONE');
  } else {
    flatReqs.forEach((req) => {
      if (req.type === RequirementType.PODER) flags.add('PODER');
      if (req.type === RequirementType.PERICIA) flags.add('PERICIA');
      if (req.type === RequirementType.ATRIBUTO) flags.add('ATRIBUTO');
      if (req.type === RequirementType.NIVEL) flags.add('NIVEL');
      if (
        req.type === RequirementType.LANCAR_MAGIAS ||
        req.type === RequirementType.MAGIA
      ) {
        flags.add('MAGIA');
      }
      if (req.type === RequirementType.PODER_TORMENTA) flags.add('TORMENTA');
    });
  }
  if (escalaPorNivel || escalaPorPoderesTormenta) {
    flags.add('ESCALA');
  }
  return flags;
}

function inferTacticalSubcategory(
  name: string,
  description: string,
  category: Exclude<PowerTabCategory, 'ALL'>
): string | undefined {
  const onto = POWER_ONTOLOGY_MAP[normalizeSearch(name)];
  if (onto?.subcategoriaTatica) return onto.subcategoriaTatica;

  if (category === GeneralPowerType.TORMENTA) return 'tormenta';
  if (category === GeneralPowerType.CONCEDIDOS) return 'concedido';
  if (category === GeneralPowerType.RACA) return 'racial';
  if (category === GeneralPowerType.MAGIA) return 'metamagia';

  const text = normalizeSearch(`${name} ${description}`);
  if (text.includes('a distancia') || text.includes('arremesso') || text.includes('disparo')) {
    return 'combate-a-distancia';
  }
  if (text.includes('manobra') || text.includes('agarrar') || text.includes('derrubar')) {
    return 'manobra';
  }
  if (text.includes('defesa') || text.includes('escudo') || text.includes('armadura')) {
    return 'defesa';
  }
  if (category === GeneralPowerType.COMBATE) return 'combate-corpo-a-corpo';
  return undefined;
}

export function buildUnifiedPowersCatalog(
  selectedSupplements: SupplementId[]
): UnifiedPowerItem[] {
  const items: UnifiedPowerItem[] = [];
  const generalByCat =
    dataRegistry.getPowersWithSupplementInfo(selectedSupplements);

  const distinctions = getDistinctionsBySupplements(selectedSupplements) as {
    id: string;
    name: string;
  }[];
  const distinctionMap = new Map(distinctions.map((d) => [d.id, d.name]));

  const generalCategories: GeneralPowerType[] = [
    GeneralPowerType.COMBATE,
    GeneralPowerType.CONCEDIDOS,
    GeneralPowerType.DESTINO,
    GeneralPowerType.MAGIA,
    GeneralPowerType.TORMENTA,
    GeneralPowerType.RACA,
    GeneralPowerType.DISTINCAO,
  ];

  generalCategories.forEach((cat) => {
    generalByCat[cat].forEach((power) => {
      const normName = normalizeSearch(power.name);
      const onto = POWER_ONTOLOGY_MAP[normName];
      const raceMeta =
        cat === GeneralPowerType.RACA
          ? extractPowerRaces(power.requirements)
          : { races: [], hasGenericRaceTrait: false };
      const deityMeta =
        cat === GeneralPowerType.CONCEDIDOS
          ? extractPowerDeities(power.requirements)
          : { deities: [], acceptsAnyDeity: false };

      const distinctionName = power.distinctionId
        ? distinctionMap.get(power.distinctionId) || power.distinctionId
        : undefined;

      items.push({
        id: `${cat}-${power.supplementId}-${power.name}-${deityMeta.deities.join(',')}`,
        name: power.customName || power.name,
        description: power.customDescription || power.description,
        category: cat,
        categoryLabel: POWER_CATEGORY_LABELS[cat],
        requirements: power.requirements || [],
        supplementId: power.supplementId,
        supplementName: power.supplementName,
        races: raceMeta.races,
        hasGenericRaceTrait: raceMeta.hasGenericRaceTrait,
        deities: deityMeta.deities,
        acceptsAnyDeity: deityMeta.acceptsAnyDeity,
        eligibleClasses: [],
        distinctionId: power.distinctionId,
        distinctionName,
        subcategoriaTatica: inferTacticalSubcategory(
          power.name,
          power.description,
          cat
        ),
        areaEfeito: onto?.areaEfeito,
        escalaPorNivel: onto?.escalaPorNivel,
        escalaPorPoderesTormenta: onto?.escalaPorPoderesTormenta,
        magiasRelacionadas: onto?.magiasRelacionadas,
        grimoireItemId: encyclopediaIds.power(cat, power.name),
        prereqFlags: buildPrereqFlags(
          power.requirements,
          onto?.escalaPorNivel,
          onto?.escalaPorPoderesTormenta
        ),
      });
    });
  });

  // Poderes de Classe deduplicados quando compartilhados entre classe base e variantes
  const classes = dataRegistry.getClassesWithSupplementInfo(selectedSupplements);
  const classPowerGroups = new Map<
    string,
    {
      primaryClass: ClassWithSupplement;
      eligibleClasses: Set<string>;
      power: ClassWithSupplement['powers'][number];
    }
  >();

  // Processa classes base primeiro para que sejam o rótulo primário em poderes herdados
  const orderedClasses = [
    ...classes.filter((c) => !c.isVariant),
    ...classes.filter((c) => c.isVariant),
  ];

  orderedClasses.forEach((cls) => {
    const label = classLabelOf(cls);
    (cls.powers || []).forEach((power) => {
      const text = power.dynamicText || power.text || '';
      const key = `${normalizeSearch(power.name)}::${normalizeSearch(text)}`;
      const existing = classPowerGroups.get(key);
      if (existing) {
        existing.eligibleClasses.add(label);
      } else {
        classPowerGroups.set(key, {
          primaryClass: cls,
          eligibleClasses: new Set([label]),
          power,
        });
      }
    });
  });

  classPowerGroups.forEach(({ primaryClass, eligibleClasses, power }) => {
    const clsLabel = classLabelOf(primaryClass);
    const supplementId = power.supplementId ?? primaryClass.supplementId;
    const supplementName =
      power.supplementName ??
      SUPPLEMENT_METADATA[supplementId]?.name ??
      primaryClass.supplementName;
    const normName = normalizeSearch(power.name);
    const onto = POWER_ONTOLOGY_MAP[normName];
    const reqs = power.requirements || [];
    const description = power.dynamicText || power.text || '';

    items.push({
      id: `CLASSE-${clsLabel}-${supplementId}-${power.name}`,
      name: power.customName || power.name,
      description: power.customDescription || description,
      category: 'CLASSE',
      categoryLabel: POWER_CATEGORY_LABELS.CLASSE,
      requirements: reqs,
      supplementId,
      supplementName,
      races: [],
      hasGenericRaceTrait: false,
      deities: [],
      acceptsAnyDeity: false,
      classLabel: clsLabel,
      eligibleClasses: Array.from(eligibleClasses),
      subcategoriaTatica: inferTacticalSubcategory(
        power.name,
        description,
        'CLASSE'
      ),
      areaEfeito: onto?.areaEfeito,
      escalaPorNivel: onto?.escalaPorNivel,
      escalaPorPoderesTormenta: onto?.escalaPorPoderesTormenta,
      magiasRelacionadas: onto?.magiasRelacionadas,
      grimoireItemId: encyclopediaIds.classPower(primaryClass, power.name),
      prereqFlags: buildPrereqFlags(
        reqs,
        onto?.escalaPorNivel,
        onto?.escalaPorPoderesTormenta
      ),
    });
  });

  return items;
}

export interface PowersFilterState {
  category: PowerTabCategory;
  search: string;
  selectedRaces: string[];
  selectedDeities: string[];
  selectedClasses: string[];
  selectedDistinctions: string[];
  selectedTactical: string[];
  prereqFilter: PrereqQuickFilter;
}

export function filterPowersCatalog(
  catalog: UnifiedPowerItem[],
  state: PowersFilterState
): UnifiedPowerItem[] {
  const search = normalizeSearch(state.search.trim());

  return catalog.filter((item) => {
    if (state.category !== 'ALL' && item.category !== state.category) {
      return false;
    }

    if (
      state.category === GeneralPowerType.RACA &&
      state.selectedRaces.length > 0
    ) {
      const wantsGeneric = state.selectedRaces.includes(
        GENERIC_RACE_TRAIT_OPTION
      );
      const matchesSpecific = item.races.some((r) =>
        state.selectedRaces.includes(r)
      );
      const matchesGeneric = wantsGeneric && item.hasGenericRaceTrait;
      if (!matchesSpecific && !matchesGeneric) return false;
    }

    if (
      state.category === GeneralPowerType.CONCEDIDOS &&
      state.selectedDeities.length > 0
    ) {
      const wantsAny = state.selectedDeities.includes(ANY_DEITY_OPTION);
      const matchesSpecific = item.deities.some((d) =>
        state.selectedDeities.includes(d)
      );
      const matchesAny = wantsAny && item.acceptsAnyDeity;
      if (!matchesSpecific && !matchesAny) return false;
    }

    if (state.category === 'CLASSE' && state.selectedClasses.length > 0) {
      if (
        !item.eligibleClasses.some((c) => state.selectedClasses.includes(c))
      ) {
        return false;
      }
    }

    if (
      state.category === GeneralPowerType.DISTINCAO &&
      state.selectedDistinctions.length > 0
    ) {
      if (
        !item.distinctionName ||
        !state.selectedDistinctions.includes(item.distinctionName)
      ) {
        return false;
      }
    }

    if (state.selectedTactical.length > 0) {
      if (
        !item.subcategoriaTatica ||
        !state.selectedTactical.includes(item.subcategoriaTatica)
      ) {
        return false;
      }
    }

    if (state.prereqFilter !== 'ALL') {
      if (!item.prereqFlags.has(state.prereqFilter)) {
        return false;
      }
    }

    if (search.length > 0) {
      const reqText = formatRequirements(item.requirements);
      const haystack = normalizeSearch(
        [
          item.name,
          item.description,
          item.categoryLabel,
          reqText,
          ...item.races,
          ...item.deities,
          ...item.eligibleClasses,
          item.distinctionName || '',
          item.subcategoriaTatica
            ? TACTICAL_SUBCATEGORY_LABELS[item.subcategoriaTatica] ||
              item.subcategoriaTatica
            : '',
        ].join(' ')
      );
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export function buildRaceSubfilterOptions(catalog: UnifiedPowerItem[]) {
  const counts = new Map<string, number>();
  let genericCount = 0;

  catalog
    .filter((i) => i.category === GeneralPowerType.RACA)
    .forEach((item) => {
      if (item.hasGenericRaceTrait) genericCount += 1;
      item.races.forEach((race) => {
        counts.set(race, (counts.get(race) || 0) + 1);
      });
    });

  const options = Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([race, count]) => ({ value: race, label: race, count }));

  if (genericCount > 0) {
    options.unshift({
      value: GENERIC_RACE_TRAIT_OPTION,
      label: 'Traços / Sem raça fixa',
      count: genericCount,
    });
  }
  return options;
}

export function buildDeitySubfilterOptions(catalog: UnifiedPowerItem[]) {
  const counts = new Map<string, number>();
  let anyCount = 0;

  catalog
    .filter((i) => i.category === GeneralPowerType.CONCEDIDOS)
    .forEach((item) => {
      if (item.acceptsAnyDeity) anyCount += 1;
      item.deities.forEach((deity) => {
        counts.set(deity, (counts.get(deity) || 0) + 1);
      });
    });

  const majors: { value: string; label: string; count: number; group: string }[] = [];
  const minors: { value: string; label: string; count: number; group: string }[] = [];

  Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .forEach(([deity, count]) => {
      const target = MAJOR_DEITY_NAMES.has(deity) ? majors : minors;
      target.push({
        value: deity,
        label: deity,
        count,
        group: MAJOR_DEITY_NAMES.has(deity)
          ? 'Deuses Maiores'
          : 'Deuses Menores',
      });
    });

  const result = [...majors, ...minors];
  if (anyCount > 0) {
    result.unshift({
      value: ANY_DEITY_OPTION,
      label: 'Qualquer Divindade',
      count: anyCount,
      group: 'Geral',
    });
  }
  return result;
}

export function buildClassSubfilterOptions(catalog: UnifiedPowerItem[]) {
  const counts = new Map<string, number>();
  catalog
    .filter((i) => i.category === 'CLASSE')
    .forEach((item) => {
      item.eligibleClasses.forEach((cls) => {
        counts.set(cls, (counts.get(cls) || 0) + 1);
      });
    });

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([cls, count]) => ({ value: cls, label: cls, count }));
}

export function buildDistinctionSubfilterOptions(catalog: UnifiedPowerItem[]) {
  const counts = new Map<string, number>();
  catalog
    .filter((i) => i.category === GeneralPowerType.DISTINCAO)
    .forEach((item) => {
      if (item.distinctionName) {
        counts.set(
          item.distinctionName,
          (counts.get(item.distinctionName) || 0) + 1
        );
      }
    });

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([name, count]) => ({ value: name, label: name, count }));
}

export function buildTacticalSubfilterOptions(
  catalog: UnifiedPowerItem[],
  category: PowerTabCategory
) {
  const counts = new Map<string, number>();
  catalog
    .filter((i) => category === 'ALL' || i.category === category)
    .forEach((item) => {
      if (item.subcategoriaTatica) {
        counts.set(
          item.subcategoriaTatica,
          (counts.get(item.subcategoriaTatica) || 0) + 1
        );
      }
    });

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    .map(([key, count]) => ({
      value: key,
      label: TACTICAL_SUBCATEGORY_LABELS[key] || key,
      count,
    }));
}
