import { useEffect, useMemo, useState } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { normalizeSearch } from '@/functions/stringUtils';
import { getPowerDisplayText } from '@/functions/powers/powerText';
import {
  POWER_ORIGINS,
  PowerOriginKind,
} from '@/functions/powers/powerOrigins';
import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { CustomPower } from '@/interfaces/CustomPower';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { PowerAvailability } from '@/functions/powers/requirementEvaluation';
import {
  ClassAbilitySet,
  ClassPowerSet,
  PowerCategory,
} from './usePowersEditor';

/**
 * O catálogo navegável: agrupamento, busca e filtros.
 *
 * A busca do editor antigo era boa por dentro (sem acento, varria nome e
 * descrição) e ruim por fora: só era aplicada a duas das cinco listas, e as
 * categorias que sobravam continuavam **fechadas**, com o contador alterado.
 * Digitar o nome exato de um poder deixava o usuário olhando para três
 * cabeçalhos fechados. Aqui, buscar achata tudo numa lista só, ordenada por
 * relevância — um resultado aparece sozinho.
 */

/** Um item já normalizado, venha de onde vier. */
export interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  kind: PowerOriginKind;
  icon: SvgIconComponent;
  color: string;
  /** Grupo a que pertence quando não há busca ativa. */
  groupKey: string;
  groupLabel: string;
  /** Só habilidades automáticas de classe/raça; não são selecionáveis. */
  readOnly: boolean;
  repeatable: boolean;
  /** Etiqueta curta à direita do nome: suplemento, ou a origem exigida. */
  badge?: string;
  /** O objeto original, para os handlers. */
  source:
    | { type: 'general'; power: GeneralPower }
    | { type: 'origin'; power: OriginPower }
    | { type: 'class'; power: ClassPower; className: string }
    | { type: 'classAbility'; ability: ClassAbility; className: string }
    | { type: 'raceAbility'; ability: { name: string; description?: string } }
    | { type: 'custom'; power: CustomPower };
}

export interface CatalogGroup {
  key: string;
  label: string;
  kind: PowerOriginKind;
  entries: CatalogEntry[];
}

interface UsePowerCatalogArgs {
  powerCategories: PowerCategory[];
  classPowerSets: ClassPowerSet[];
  classAbilitySets: ClassAbilitySet[];
  raceName: string;
  raceAbilities: { name: string; description?: string }[];
  customPowers: CustomPower[];
  /**
   * Quem sabe avaliar cada item é o editor, não o catálogo: poder de origem
   * depende da origem da ficha e poder concedido depende da divindade, regras
   * que não cabem no avaliador de pré-requisitos.
   */
  resolveAvailability: (entry: CatalogEntry) => PowerAvailability;
}

/** Espera o usuário parar de digitar antes de refiltrar centenas de itens. */
function useDebounced(value: string, delay = 120): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function usePowerCatalog({
  powerCategories,
  classPowerSets,
  classAbilitySets,
  raceName,
  raceAbilities,
  customPowers,
  resolveAvailability,
}: UsePowerCatalogArgs) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set());
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const debouncedSearch = useDebounced(searchTerm);

  // ── Todos os grupos, na ordem em que aparecem ────────────────────────────
  const groups = useMemo<CatalogGroup[]>(() => {
    const result: CatalogGroup[] = [];

    const descriptorFor = (kind: PowerOriginKind) => POWER_ORIGINS[kind];

    // Poderes de classe, um grupo por classe (multiclasse).
    classPowerSets.forEach(({ className, powers }) => {
      const kind: PowerOriginKind = 'classPower';
      const descriptor = descriptorFor(kind);
      result.push({
        key: `classPower:${className}`,
        label: descriptor.label(className),
        kind,
        entries: powers.map((power) => ({
          id: `classPower:${className}:${power.name}`,
          name: power.name,
          description: getPowerDisplayText(power),
          kind,
          icon: descriptor.icon,
          color: descriptor.color,
          groupKey: `classPower:${className}`,
          groupLabel: descriptor.label(className),
          readOnly: false,
          repeatable: !!power.canRepeat,
          badge: power.supplementName,
          source: { type: 'class', power, className },
        })),
      });
    });

    // Poderes gerais e de origem, pelas categorias já montadas no editor.
    powerCategories.forEach((category) => {
      const descriptor = descriptorFor(category.kind);
      result.push({
        key: category.key,
        label: category.name,
        kind: category.kind,
        entries: category.powers.map((power) => ({
          id: `${category.key}:${power.name}`,
          name: power.name,
          description: getPowerDisplayText(power),
          kind: category.kind,
          icon: descriptor.icon,
          color: descriptor.color,
          groupKey: category.key,
          groupLabel: category.name,
          readOnly: false,
          repeatable: !!(
            (power as GeneralPower).allowSeveralPicks ||
            (power as GeneralPower).canRepeat
          ),
          source:
            category.type === 'ORIGEM'
              ? { type: 'origin', power: power as OriginPower }
              : { type: 'general', power: power as GeneralPower },
        })),
      });
    });

    // Habilidades automáticas: entram na busca, mas não são selecionáveis.
    classAbilitySets.forEach(({ className, abilities }) => {
      const kind: PowerOriginKind = 'classAbility';
      const descriptor = descriptorFor(kind);
      result.push({
        key: `classAbility:${className}`,
        label: descriptor.label(className),
        kind,
        entries: abilities.map((ability) => ({
          id: `classAbility:${className}:${ability.name}`,
          name: ability.name,
          description: getPowerDisplayText(ability),
          kind,
          icon: descriptor.icon,
          color: descriptor.color,
          groupKey: `classAbility:${className}`,
          groupLabel: descriptor.label(className),
          readOnly: true,
          repeatable: false,
          source: { type: 'classAbility', ability, className },
        })),
      });
    });

    if (raceAbilities.length > 0) {
      const kind: PowerOriginKind = 'raceAbility';
      const descriptor = descriptorFor(kind);
      result.push({
        key: 'raceAbility',
        label: descriptor.label(raceName),
        kind,
        entries: raceAbilities.map((ability) => ({
          id: `raceAbility:${ability.name}`,
          name: ability.name,
          description: ability.description ?? '',
          kind,
          icon: descriptor.icon,
          color: descriptor.color,
          groupKey: 'raceAbility',
          groupLabel: descriptor.label(raceName),
          readOnly: true,
          repeatable: false,
          source: { type: 'raceAbility', ability },
        })),
      });
    }

    if (customPowers.length > 0) {
      const kind: PowerOriginKind = 'custom';
      const descriptor = descriptorFor(kind);
      result.push({
        key: 'custom',
        label: descriptor.label(),
        kind,
        entries: customPowers.map((power) => ({
          id: `custom:${power.id}`,
          name: power.name,
          description: power.description,
          kind,
          icon: descriptor.icon,
          color: descriptor.color,
          groupKey: 'custom',
          groupLabel: descriptor.label(),
          readOnly: false,
          repeatable: false,
          source: { type: 'custom', power },
        })),
      });
    }

    return result.filter((group) => group.entries.length > 0);
  }, [
    classAbilitySets,
    classPowerSets,
    customPowers,
    powerCategories,
    raceAbilities,
    raceName,
  ]);

  const availabilityOf = resolveAvailability;

  const matchesFilters = (entry: CatalogEntry) => {
    if (activeGroups.size > 0 && !activeGroups.has(entry.groupKey)) {
      return false;
    }
    if (onlyAvailable && !availabilityOf(entry).available) return false;
    return true;
  };

  // ── Modo lista agrupada (sem busca) ──────────────────────────────────────
  const filteredGroups = useMemo<CatalogGroup[]>(() => {
    if (debouncedSearch) return [];
    return groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter(matchesFilters),
      }))
      .filter((group) => group.entries.length > 0);
    // `matchesFilters` fecha sobre o estado já listado nas dependências.
  }, [
    groups,
    debouncedSearch,
    activeGroups,
    onlyAvailable,
    resolveAvailability,
  ]);

  // ── Modo resultado (com busca): lista única, ordenada por relevância ─────
  const searchResults = useMemo<CatalogEntry[]>(() => {
    if (!debouncedSearch) return [];
    const search = normalizeSearch(debouncedSearch);

    // 0 = o nome começa com o termo, 1 = o nome contém, 2 = só a descrição.
    const rank = (entry: CatalogEntry): number => {
      const name = normalizeSearch(entry.name);
      if (name.startsWith(search)) return 0;
      if (name.includes(search)) return 1;
      return 2;
    };

    return groups
      .flatMap((group) => group.entries)
      .filter((entry) => {
        if (!matchesFilters(entry)) return false;
        return (
          normalizeSearch(entry.name).includes(search) ||
          normalizeSearch(entry.description).includes(search)
        );
      })
      .sort((a, b) => {
        const byRank = rank(a) - rank(b);
        return byRank !== 0 ? byRank : a.name.localeCompare(b.name, 'pt-BR');
      });
  }, [
    groups,
    debouncedSearch,
    activeGroups,
    onlyAvailable,
    resolveAvailability,
  ]);

  /** Contagem por grupo respeitando o filtro de disponibilidade, não o de grupo. */
  const groupOptions = useMemo(
    () =>
      groups.map((group) => ({
        key: group.key,
        label: group.label,
        kind: group.kind,
        count: onlyAvailable
          ? group.entries.filter((e) => availabilityOf(e).available).length
          : group.entries.length,
      })),
    [groups, onlyAvailable, resolveAvailability]
  );

  const toggleGroup = (key: string) =>
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const resetGroups = () => setActiveGroups(new Set());

  const resultCount = debouncedSearch
    ? searchResults.length
    : filteredGroups.reduce((total, group) => total + group.entries.length, 0);

  return {
    searchTerm,
    setSearchTerm,
    /** O termo já estabilizado — use para destacar, não o valor cru do input. */
    activeSearch: debouncedSearch,
    activeGroups,
    toggleGroup,
    resetGroups,
    groupOptions,
    onlyAvailable,
    setOnlyAvailable,
    filteredGroups,
    searchResults,
    resultCount,
    availabilityOf,
  };
}
