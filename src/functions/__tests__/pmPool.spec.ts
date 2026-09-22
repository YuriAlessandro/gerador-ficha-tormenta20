/**
 * Pool de PM: a regra "consome o temporário primeiro, clampa em 0".
 *
 * Estava reimplementada em quatro lugares antes de virar este módulo, então a
 * matriz aqui é o contrato que todos eles compartilham — inclusive o gasto de
 * PM das ameaças na mesa virtual.
 */
import { describe, it, expect } from 'vitest';
import {
  getAvailablePm,
  canSpendFromPmPool,
  spendFromPmPool,
  recoverPm,
} from '../pmPool';

describe('getAvailablePm', () => {
  it('soma o pool temporário ao atual', () => {
    expect(getAvailablePm({ current: 5, temp: 3, max: 12 })).toBe(8);
  });

  it('ignora valores negativos em vez de descontar', () => {
    expect(getAvailablePm({ current: -2, temp: 3, max: 12 })).toBe(3);
  });
});

describe('canSpendFromPmPool', () => {
  it('aceita quando o custo bate exatamente no disponível', () => {
    expect(canSpendFromPmPool({ current: 5, temp: 3, max: 12 }, 8)).toBe(true);
  });

  it('recusa um único PM acima do disponível', () => {
    expect(canSpendFromPmPool({ current: 5, temp: 3, max: 12 }, 9)).toBe(false);
  });

  it('custo zero ou negativo é sempre pagável', () => {
    expect(canSpendFromPmPool({ current: 0, temp: 0, max: 12 }, 0)).toBe(true);
  });
});

describe('spendFromPmPool', () => {
  it('consome o temporário antes do pool principal', () => {
    const outcome = spendFromPmPool({ current: 5, temp: 3, max: 12 }, 4);

    expect(outcome.after.temp).toBe(0);
    expect(outcome.after.current).toBe(4);
    expect(outcome.before).toEqual({ current: 5, temp: 3, max: 12 });
    expect(outcome.cost).toBe(4);
  });

  it('não toca o pool principal quando o temporário cobre o custo', () => {
    const outcome = spendFromPmPool({ current: 5, temp: 3, max: 12 }, 2);

    expect(outcome.after).toMatchObject({ current: 5, temp: 1 });
  });

  it('clampa em 0 em vez de deixar o PM negativo', () => {
    const outcome = spendFromPmPool({ current: 2, temp: 0, max: 12 }, 7);

    expect(outcome.after.current).toBe(0);
  });

  it('custo zero é no-op', () => {
    const outcome = spendFromPmPool({ current: 5, temp: 3, max: 12 }, 0);

    expect(outcome.after).toEqual({ current: 5, temp: 3, max: 12 });
    expect(outcome.cost).toBe(0);
  });
});

describe('recoverPm', () => {
  it('clampa no máximo', () => {
    expect(recoverPm({ current: 10, temp: 0, max: 12 }, 5).current).toBe(12);
  });

  it('sem máximo conhecido não impõe teto', () => {
    expect(recoverPm({ current: 10, temp: 0, max: 0 }, 5).current).toBe(15);
  });

  it('não transforma recuperação em pool temporário', () => {
    expect(recoverPm({ current: 10, temp: 2, max: 12 }, 5).temp).toBe(2);
  });
});
