import Divindade from '../../interfaces/Divindade';
import { SupplementId } from '../../types/supplement.types';
import { normalizeSearch } from '../../functions/stringUtils';

export type DeityCategoryFilter = 'ALL' | 'MAIOR' | 'MENOR';
export type DeityStatusDivinoFilter = 'ALL' | '1' | '2' | '3' | '4' | '5';
export type DeityEnergyFilter = 'ALL' | 'positiva' | 'negativa' | 'qualquer';

export const ALL_DEITY_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_DEUSES_MENORES,
];

export interface DeitiesFilterState {
  search: string;
  category: DeityCategoryFilter;
  statusDivino: DeityStatusDivinoFilter;
  energy: DeityEnergyFilter;
}

export function isMinorDeity(deity: Divindade): boolean {
  return deity.statusDivino !== undefined;
}

export function filterDeities(
  deities: Divindade[],
  state: DeitiesFilterState
): Divindade[] {
  const search = normalizeSearch(state.search.trim());

  return deities.filter((deity) => {
    const minor = isMinorDeity(deity);

    if (state.category === 'MAIOR' && minor) return false;
    if (state.category === 'MENOR' && !minor) return false;

    if (state.statusDivino !== 'ALL') {
      if (String(deity.statusDivino ?? '') !== state.statusDivino) {
        return false;
      }
    }

    if (state.energy !== 'ALL') {
      if (deity.energy !== state.energy) return false;
    }

    if (search.length > 0) {
      const haystack = normalizeSearch(
        [
          deity.name,
          deity.beliefs || '',
          deity.obligations || '',
          deity.preferredWeapon || '',
          ...(deity.poderes || []).flatMap((p) => [p.name, p.description]),
        ].join(' ')
      );
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}
