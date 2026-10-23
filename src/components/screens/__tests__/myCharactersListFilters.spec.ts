import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MY_CHARACTERS_FILTERS,
  MyCharactersListFilters,
  parseMyCharactersListFilters,
  serializeMyCharactersListFilters,
} from '../myCharactersListFilters';

describe('myCharactersListFilters', () => {
  it('URL vazia devolve os filtros padrão', () => {
    expect(parseMyCharactersListFilters('')).toEqual(
      DEFAULT_MY_CHARACTERS_FILTERS
    );
  });

  it('filtros padrão não deixam nada na URL', () => {
    expect(
      serializeMyCharactersListFilters(DEFAULT_MY_CHARACTERS_FILTERS)
    ).toBe('');
  });

  it('faz a ida e volta de todos os filtros', () => {
    const filters: MyCharactersListFilters = {
      tab: 'ameacas',
      folderId: 'abc123',
      search: 'dragão',
      sortBy: 'level',
    };
    const query = serializeMyCharactersListFilters(filters);
    expect(query).toBe(
      'tab=ameacas&folder=abc123&busca=drag%C3%A3o&ordem=nivel'
    );
    expect(parseMyCharactersListFilters(`?${query}`)).toEqual(filters);
  });

  it('entende os links antigos do app', () => {
    expect(parseMyCharactersListFilters('?tab=personagens&folder=f1')).toEqual({
      ...DEFAULT_MY_CHARACTERS_FILTERS,
      folderId: 'f1',
    });
    expect(parseMyCharactersListFilters('?tab=ameacas').tab).toBe('ameacas');
  });

  it('valores inválidos caem no padrão', () => {
    expect(
      parseMyCharactersListFilters('?tab=magias&folder=%20&ordem=raca')
    ).toEqual(DEFAULT_MY_CHARACTERS_FILTERS);
  });

  it('preserva a ordenação por nome', () => {
    const query = serializeMyCharactersListFilters({
      ...DEFAULT_MY_CHARACTERS_FILTERS,
      sortBy: 'name',
    });
    expect(query).toBe('ordem=nome');
    expect(parseMyCharactersListFilters(query).sortBy).toBe('name');
  });
});
