import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LIMIT_BOOST_MULTIPLIER,
  LimitBoost,
  NO_BOOST,
  applyLimitBoost,
  boostValue,
  clampMultiplier,
  resolveLimitBoost,
} from '../limitBoost';
import { SupportLevel, getSupportLimits } from '../../types/subscription.types';

const BOOST: LimitBoost = { active: true, multiplier: 1.5 };

describe('boostValue', () => {
  it('arredonda para cima', () => {
    expect(boostValue(10, BOOST)).toBe(15);
    expect(boostValue(15, BOOST)).toBe(23); // 22.5 → 23
    expect(boostValue(20, BOOST)).toBe(30);
    expect(boostValue(1, BOOST)).toBe(2); // 1.5 → 2
    expect(boostValue(3, BOOST)).toBe(5); // 4.5 → 5
    expect(boostValue(6, BOOST)).toBe(9);
    expect(boostValue(70, BOOST)).toBe(105);
  });

  it('preserva as sentinelas -1 (ilimitado) e 0 (indisponível)', () => {
    expect(boostValue(-1, BOOST)).toBe(-1);
    expect(boostValue(0, BOOST)).toBe(0);
  });

  it('é identidade quando o boost está desligado', () => {
    expect(boostValue(10, NO_BOOST)).toBe(10);
    expect(boostValue(-1, NO_BOOST)).toBe(-1);
  });

  it('respeita outros multiplicadores', () => {
    expect(boostValue(10, { active: true, multiplier: 2 })).toBe(20);
    expect(boostValue(10, { active: true, multiplier: 1 })).toBe(10);
  });
});

describe('applyLimitBoost', () => {
  it('turbina todos os limites do nível grátis, menos suplementos', () => {
    const base = getSupportLimits(SupportLevel.FREE);
    const boosted = applyLimitBoost(base, BOOST);

    expect(boosted.maxSheets).toBe(15);
    expect(boosted.maxMenaceSheets).toBe(15);
    expect(boosted.maxGameTables).toBe(2);
    expect(boosted.maxPlayersPerTable).toBe(9);
    expect(boosted.maxWeeklyBestiaryPublications).toBe(2);
    // Exceção de produto: suplementos NÃO recebem boost
    expect(boosted.maxSupplements).toBe(base.maxSupplements);
    expect(boosted.maxSupplements).toBe(4);
  });

  it('mantém ilimitado como ilimitado no nível 3', () => {
    const boosted = applyLimitBoost(
      getSupportLimits(SupportLevel.NIVEL_3),
      BOOST
    );

    expect(boosted.maxSheets).toBe(-1);
    expect(boosted.maxMenaceSheets).toBe(-1);
    expect(boosted.maxGameTables).toBe(-1);
    expect(boosted.maxPlayersPerTable).toBe(-1);
  });

  it('não altera nada quando o boost está desligado', () => {
    const base = getSupportLimits(SupportLevel.NIVEL_2);
    expect(applyLimitBoost(base, NO_BOOST)).toEqual(base);
  });

  it('não muta a tabela original', () => {
    const base = getSupportLimits(SupportLevel.FREE);
    const before = base.maxSheets;
    applyLimitBoost(base, BOOST);
    expect(getSupportLimits(SupportLevel.FREE).maxSheets).toBe(before);
  });
});

describe('clampMultiplier', () => {
  it('cai no default para valores inválidos', () => {
    expect(clampMultiplier(undefined)).toBe(DEFAULT_LIMIT_BOOST_MULTIPLIER);
    expect(clampMultiplier(null)).toBe(DEFAULT_LIMIT_BOOST_MULTIPLIER);
    expect(clampMultiplier(NaN)).toBe(DEFAULT_LIMIT_BOOST_MULTIPLIER);
    expect(clampMultiplier('1.5')).toBe(DEFAULT_LIMIT_BOOST_MULTIPLIER);
    expect(clampMultiplier(Infinity)).toBe(DEFAULT_LIMIT_BOOST_MULTIPLIER);
  });

  it('limita à faixa permitida', () => {
    expect(clampMultiplier(0.1)).toBe(1);
    expect(clampMultiplier(-3)).toBe(1);
    expect(clampMultiplier(99)).toBe(5);
  });

  it('deixa passar valores válidos', () => {
    expect(clampMultiplier(1.5)).toBe(1.5);
    expect(clampMultiplier(2)).toBe(2);
  });
});

describe('resolveLimitBoost', () => {
  it('desligado quando a flag não existe ou está off', () => {
    expect(resolveLimitBoost(undefined)).toEqual(NO_BOOST);
    expect(
      resolveLimitBoost({ enabled: false, supporterOnly: false, value: 2 })
    ).toEqual(NO_BOOST);
  });

  it('ignora supporterOnly — o boost vale para todos', () => {
    expect(
      resolveLimitBoost({ enabled: true, supporterOnly: true, value: 1.5 })
    ).toEqual({ active: true, multiplier: 1.5 });
  });

  it('usa o default quando a flag não traz multiplicador', () => {
    expect(resolveLimitBoost({ enabled: true, supporterOnly: false })).toEqual({
      active: true,
      multiplier: DEFAULT_LIMIT_BOOST_MULTIPLIER,
    });
  });
});
