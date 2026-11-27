import { describe, expect, it } from 'vitest';
import { GeneralPowerType } from '../../../interfaces/Poderes';
import { SupplementId } from '../../../types/supplement.types';
import {
  ALL_POWER_SUPPLEMENTS,
  GENERIC_RACE_TRAIT_OPTION,
  PowersFilterState,
  buildClassSubfilterOptions,
  buildDeitySubfilterOptions,
  buildRaceSubfilterOptions,
  buildUnifiedPowersCatalog,
  filterPowersCatalog,
} from '../powersFilters';

const baseState = (
  overrides: Partial<PowersFilterState> = {}
): PowersFilterState => ({
  category: 'ALL',
  search: '',
  selectedRaces: [],
  selectedDeities: [],
  selectedClasses: [],
  selectedDistinctions: [],
  selectedTactical: [],
  prereqFilter: 'ALL',
  ...overrides,
});

describe('powersFilters', () => {
  const catalog = buildUnifiedPowersCatalog(ALL_POWER_SUPPLEMENTS);

  it('inclui poderes gerais, de raça, concedidos, de classe e de Atlas/Deuses Menores', () => {
    const names = catalog.map((p) => p.name);
    expect(names).toContain('Ataque Poderoso');
    expect(names).toContain('Presente de Wynlla'); // Atlas de Arton
    expect(names).toContain('Alcançar os Céus'); // Guia de Deuses Menores
    expect(catalog.some((p) => p.category === 'CLASSE')).toBe(true);
    expect(catalog.some((p) => p.category === GeneralPowerType.RACA)).toBe(true);
  });

  it('filtra poderes de Raça pelo chip de raça e inclui traços genéricos', () => {
    const raceOpts = buildRaceSubfilterOptions(catalog);
    expect(raceOpts.some((o) => o.value === 'Elfo')).toBe(true);
    expect(raceOpts.some((o) => o.value === GENERIC_RACE_TRAIT_OPTION)).toBe(
      true
    );

    const elfoPowers = filterPowersCatalog(
      catalog,
      baseState({
        category: GeneralPowerType.RACA,
        selectedRaces: ['Elfo'],
      })
    );
    expect(elfoPowers.map((p) => p.name)).toContain('Arquearia Élfica');
    expect(elfoPowers.map((p) => p.name)).not.toContain('Ajudante Nato');

    const traitPowers = filterPowersCatalog(
      catalog,
      baseState({
        category: GeneralPowerType.RACA,
        selectedRaces: [GENERIC_RACE_TRAIT_OPTION],
      })
    );
    expect(traitPowers.map((p) => p.name)).toContain(
      'Arma Natural Aprimorada'
    );
  });

  it('filtra poderes Concedidos pelo deus escolhido (maiores e menores)', () => {
    const deityOpts = buildDeitySubfilterOptions(catalog);
    expect(
      deityOpts.some(
        (o) => o.value === 'Arsenal' && o.group === 'Deuses Maiores'
      )
    ).toBe(true);
    expect(
      deityOpts.some(
        (o) => o.value === 'Hydora' && o.group === 'Deuses Menores'
      )
    ).toBe(true);

    const arsenalPowers = filterPowersCatalog(
      catalog,
      baseState({
        category: GeneralPowerType.CONCEDIDOS,
        selectedDeities: ['Arsenal'],
      })
    );
    expect(arsenalPowers.map((p) => p.name)).toContain('Armas da Destruição');
    expect(arsenalPowers.map((p) => p.name)).not.toContain('Abraço da Fênix');
  });

  it('deduplica poderes herdados de classe em Todos e filtra por classe selecionada', () => {
    const classOpts = buildClassSubfilterOptions(catalog);
    expect(classOpts.some((o) => o.value === 'Usurpador')).toBe(true);

    const allClassPowers = filterPowersCatalog(
      catalog,
      baseState({ category: 'CLASSE' })
    );
    const abencoarCount = allClassPowers.filter(
      (p) => p.name === 'Abençoar Arma'
    ).length;
    expect(abencoarCount).toBe(1);

    const usurpadorPowers = filterPowersCatalog(
      catalog,
      baseState({
        category: 'CLASSE',
        selectedClasses: ['Usurpador'],
      })
    );
    expect(usurpadorPowers.length).toBeGreaterThan(0);
    // Usurpador proíbe Conhecimento Mágico
    expect(usurpadorPowers.map((p) => p.name)).not.toContain(
      'Conhecimento Mágico'
    );
  });

  it('busca sem acentuação também no texto da descrição e nos pré-requisitos', () => {
    const result = filterPowersCatalog(
      catalog,
      baseState({
        search: 'margem de ameaca',
        category: GeneralPowerType.CONCEDIDOS,
      })
    );
    expect(result.map((p) => p.name)).toContain('Armas da Ambição');
  });

  it('respeita filtro por suplemento sem deuses menores quando desmarcado', () => {
    const coreOnly = buildUnifiedPowersCatalog([SupplementId.TORMENTA20_CORE]);
    expect(coreOnly.map((p) => p.name)).not.toContain('Alcançar os Céus');
  });
});
