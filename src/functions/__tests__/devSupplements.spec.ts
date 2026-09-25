import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDevSupplements } from '../devSupplements';
import { SupplementId } from '../../types/supplement.types';

describe('getDevSupplements', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('retorna vazio em production', () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_DEV_SUPPLEMENTS', 'tormenta20-herois-de-arton');
    expect(getDevSupplements()).toEqual([]);
  });

  it('retorna vazio em test', () => {
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('VITE_DEV_SUPPLEMENTS', 'tormenta20-herois-de-arton');
    expect(getDevSupplements()).toEqual([]);
  });

  it('retorna vazio quando VITE_DEV_SUPPLEMENTS não está definido', () => {
    vi.stubEnv('MODE', 'development');
    expect(getDevSupplements()).toEqual([]);
  });

  it('parseia e retorna ids válidos', () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv(
      'VITE_DEV_SUPPLEMENTS',
      'tormenta20-herois-de-arton,tormenta20-deuses-de-arton'
    );
    expect(getDevSupplements()).toEqual([
      SupplementId.TORMENTA20_HEROIS_ARTON,
      SupplementId.TORMENTA20_DEUSES_ARTON,
    ]);
  });

  it('filtra ids inválidos', () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_DEV_SUPPLEMENTS', 'tormenta20-herois-de-arton,invalido,');
    expect(getDevSupplements()).toEqual([
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
  });

  it('deduplica ids repetidos', () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv(
      'VITE_DEV_SUPPLEMENTS',
      'tormenta20-herois-de-arton, tormenta20-herois-de-arton'
    );
    expect(getDevSupplements()).toEqual([
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
  });

  it('trata espaços em branco', () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_DEV_SUPPLEMENTS', '  tormenta20-herois-de-arton  ');
    expect(getDevSupplements()).toEqual([
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
  });
});
