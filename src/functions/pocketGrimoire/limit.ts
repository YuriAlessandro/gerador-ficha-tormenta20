/**
 * Limite de grimórios salvos na conta. O número vem do plano
 * (`maxPocketGrimoires`, ESPELHO do backend, com boost); deslogado não há
 * limite, porque os grimórios ficam só no navegador.
 */

/** Teto absoluto por conta, inclusive nos planos ilimitados (backend igual). */
export const GRIMOIRE_HARD_LIMIT = 100;

export interface GrimoireLimitState {
  canCreate: boolean;
  /** Limite efetivo; `Infinity` deslogado. */
  limit: number;
}

/** Limite efetivo de um `maxPocketGrimoires` (`-1` = até o teto). */
export const effectiveGrimoireLimit = (max: number): number =>
  max === -1 ? GRIMOIRE_HARD_LIMIT : Math.min(max, GRIMOIRE_HARD_LIMIT);

export function grimoireLimitState({
  isAuthenticated,
  count,
  max,
}: {
  isAuthenticated: boolean;
  count: number;
  /** `maxPocketGrimoires` do plano; `-1` = ilimitado. */
  max: number;
}): GrimoireLimitState {
  if (!isAuthenticated) return { canCreate: true, limit: Infinity };
  const limit = effectiveGrimoireLimit(max);
  return { canCreate: count < limit, limit };
}

export const grimoireLimitMessage = (limit: number): string =>
  limit >= GRIMOIRE_HARD_LIMIT
    ? `Você atingiu o limite de ${GRIMOIRE_HARD_LIMIT} grimórios por conta. Exclua algum para criar outro.`
    : `Você atingiu o limite de ${limit} grimórios do seu plano. Exclua algum ou apoie o projeto para ter mais.`;
