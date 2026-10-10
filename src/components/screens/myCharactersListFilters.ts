export type MyCharactersTab = 'personagens' | 'ameacas';
export type MyCharactersSortBy = 'name' | 'date' | 'level';

/** Aba, pasta aberta, busca e ordenação de "Meus Personagens", na URL. */
export interface MyCharactersListFilters {
  tab: MyCharactersTab;
  folderId: string | null;
  search: string;
  sortBy: MyCharactersSortBy;
}

export const DEFAULT_MY_CHARACTERS_FILTERS: MyCharactersListFilters = {
  tab: 'personagens',
  folderId: null,
  search: '',
  sortBy: 'date',
};

// `tab` e `folder` mantêm os nomes antigos: há links para eles pelo app
// (`/meus-personagens?tab=ameacas`, `...&folder=<id>`).
const SORT_PARAM: Record<MyCharactersSortBy, string> = {
  name: 'nome',
  date: 'data',
  level: 'nivel',
};

/** Lê os filtros da query string; valor desconhecido cai no padrão. */
export function parseMyCharactersListFilters(
  search: string
): MyCharactersListFilters {
  const params = new URLSearchParams(search);
  const sortParam = params.get('ordem');
  return {
    tab: params.get('tab') === 'ameacas' ? 'ameacas' : 'personagens',
    folderId: params.get('folder')?.trim() || null,
    search: params.get('busca') ?? '',
    sortBy:
      (Object.keys(SORT_PARAM) as MyCharactersSortBy[]).find(
        (key) => SORT_PARAM[key] === sortParam
      ) ?? DEFAULT_MY_CHARACTERS_FILTERS.sortBy,
  };
}

/** Query string (sem o `?`) dos filtros, omitindo o que está no padrão. */
export function serializeMyCharactersListFilters(
  filters: MyCharactersListFilters
): string {
  const params = new URLSearchParams();
  if (filters.tab !== DEFAULT_MY_CHARACTERS_FILTERS.tab) {
    params.set('tab', filters.tab);
  }
  if (filters.folderId) params.set('folder', filters.folderId);
  const search = filters.search.trim();
  if (search) params.set('busca', search);
  if (filters.sortBy !== DEFAULT_MY_CHARACTERS_FILTERS.sortBy) {
    params.set('ordem', SORT_PARAM[filters.sortBy]);
  }
  return params.toString();
}
