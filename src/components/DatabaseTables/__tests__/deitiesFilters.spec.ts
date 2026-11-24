import { describe, expect, it } from 'vitest';
import { dataRegistry } from '../../../data/registry';
import {
  ALL_DEITY_SUPPLEMENTS,
  filterDeities,
} from '../deitiesFilters';

describe('deitiesFilters', () => {
  const allDeities = dataRegistry.getDeitiesWithSupplementPowers(
    ALL_DEITY_SUPPLEMENTS
  );

  it('separa corretamente os 20 Deuses Maiores dos Deuses Menores', () => {
    const majors = filterDeities(allDeities, {
      search: '',
      category: 'MAIOR',
      statusDivino: 'ALL',
      energy: 'ALL',
    });
    const minors = filterDeities(allDeities, {
      search: '',
      category: 'MENOR',
      statusDivino: 'ALL',
      energy: 'ALL',
    });

    expect(majors).toHaveLength(20);
    expect(minors.length).toBeGreaterThanOrEqual(63);
    expect(majors.map((d) => d.name)).toContain('Valkaria');
    expect(minors.map((d) => d.name)).toContain('Sckhar');
  });

  it('filtra Deuses Menores por Status Divino', () => {
    const status5 = filterDeities(allDeities, {
      search: '',
      category: 'MENOR',
      statusDivino: '5',
      energy: 'ALL',
    });

    expect(status5.map((d) => d.name)).toContain('Sckhar');
    expect(status5.map((d) => d.name)).toContain('Tibar');
    expect(status5.every((d) => d.statusDivino === 5)).toBe(true);
  });

  it('busca também pelo nome dos poderes concedidos', () => {
    const found = filterDeities(allDeities, {
      search: 'Almejar o Impossivel',
      category: 'ALL',
      statusDivino: 'ALL',
      energy: 'ALL',
    });
    expect(found.map((d) => d.name)).toContain('Valkaria');
    expect(found.map((d) => d.name)).toContain('Thwor');
  });
});
