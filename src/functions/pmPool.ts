/**
 * Pool de PM (Pontos de Mana) e as regras de gasto/recuperação.
 *
 * O algoritmo "consome o pool temporário primeiro, clampa em 0" estava
 * reimplementado em quatro lugares (`Result.tsx` handlePMDecrement e
 * handleSpellCast, `EncounterContext` adjustParticipantHP e
 * adjustParticipantMP). Este módulo é a definição única — puro, sem React e
 * sem dependência de premium, então roda no vitest mesmo sem o submódulo.
 */

export interface PmPool {
  current: number;
  temp: number;
  /** Teto da recuperação. `<= 0` significa "sem teto conhecido". */
  max: number;
}

export interface PmSpendOutcome {
  before: PmPool;
  after: PmPool;
  cost: number;
}

/** Total gastável: o pool temporário soma ao atual. */
export function getAvailablePm(pool: PmPool): number {
  return Math.max(0, pool.temp) + Math.max(0, pool.current);
}

export function canSpendFromPmPool(pool: PmPool, amount: number): boolean {
  if (amount <= 0) return true;
  return getAvailablePm(pool) >= amount;
}

/**
 * Gasta `amount` consumindo `temp` primeiro. Clampa em 0 — nunca devolve PM
 * negativo. Quem precisa recusar o gasto por falta de PM chama
 * `canSpendFromPmPool` antes; aqui o excesso simplesmente é absorvido.
 */
export function spendFromPmPool(pool: PmPool, amount: number): PmSpendOutcome {
  const before: PmPool = { ...pool };

  if (amount <= 0) {
    return { before, after: { ...pool }, cost: 0 };
  }

  const temp = Math.max(0, pool.temp);
  const consumedTemp = Math.min(temp, amount);
  const rest = amount - consumedTemp;

  return {
    before,
    after: {
      ...pool,
      temp: temp - consumedTemp,
      current: Math.max(0, pool.current - rest),
    },
    cost: amount,
  };
}

/** Recupera PM no pool principal, clampando em `max` quando há teto. */
export function recoverPm(pool: PmPool, amount: number): PmPool {
  if (amount <= 0) return { ...pool };

  const raised = pool.current + amount;

  return {
    ...pool,
    current: pool.max > 0 ? Math.min(raised, pool.max) : raised,
  };
}
