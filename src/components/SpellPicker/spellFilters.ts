import { Spell, SpellSchool, spellsCircles } from '@/interfaces/Spells';
import { normalizeSearch } from '@/functions/stringUtils';

export interface SpellFilterState {
  search: string;
  circle: number | 'all';
  school: SpellSchool | 'all';
  execution: string | 'all';
  spellType: 'arcane' | 'divine' | 'all';
}

export const EMPTY_SPELL_FILTERS: SpellFilterState = {
  search: '',
  circle: 'all',
  school: 'all',
  execution: 'all',
  spellType: 'all',
};

export interface SpellFilterOptions {
  schools: SpellSchool[];
  executions: string[];
  circles: number[];
}

/** Converts the `spellsCircles` enum value to its numeric circle. */
export const getCircleNumber = (spellCircle: spellsCircles): number => {
  switch (spellCircle) {
    case spellsCircles.c1:
      return 1;
    case spellsCircles.c2:
      return 2;
    case spellsCircles.c3:
      return 3;
    case spellsCircles.c4:
      return 4;
    case spellsCircles.c5:
      return 5;
    default:
      return 1;
  }
};

/**
 * Derives the distinct filter options present in a given spell list.
 * Mirrors the dedup + pt-BR sort pattern used by UnifiedSpellsTable.
 */
export const deriveSpellFilterOptions = (
  spells: Spell[]
): SpellFilterOptions => {
  const schools = [...new Set(spells.map((s) => s.school))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
  const executions = [...new Set(spells.map((s) => s.execucao))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
  const circles = [
    ...new Set(spells.map((s) => getCircleNumber(s.spellCircle))),
  ].sort((a, b) => a - b);

  return { schools, executions, circles };
};

/**
 * Pure filter applied to a spell list. Handles text search, circle,
 * school and execution. Arcane/divine is intentionally NOT applied here
 * — it is not a field on `Spell` and each picker resolves it at the
 * data source.
 */
export const applySpellFilters = (
  spells: Spell[],
  filters: SpellFilterState
): Spell[] => {
  const search = filters.search ? normalizeSearch(filters.search) : '';

  return spells.filter((spell) => {
    if (search) {
      const matchesSearch =
        normalizeSearch(spell.nome).includes(search) ||
        normalizeSearch(spell.description).includes(search) ||
        normalizeSearch(spell.school).includes(search);
      if (!matchesSearch) return false;
    }

    if (
      filters.circle !== 'all' &&
      getCircleNumber(spell.spellCircle) !== filters.circle
    ) {
      return false;
    }

    if (filters.school !== 'all' && spell.school !== filters.school) {
      return false;
    }

    if (filters.execution !== 'all' && spell.execucao !== filters.execution) {
      return false;
    }

    return true;
  });
};
