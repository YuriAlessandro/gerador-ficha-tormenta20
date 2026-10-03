import { PocketGrimoire } from '../../interfaces/PocketGrimoire';

/**
 * Limite de grimórios. O número vem do plano (`maxPocketGrimoires`, ESPELHO
 * do backend, com boost); deslogado vale o do plano gratuito.
 *
 * Acima do limite (login com sobras, plano rebaixado), os excedentes ficam
 * bloqueados: aparecem na lista, mas não abrem até sobrar vaga.
 */

/** Teto absoluto por conta, inclusive nos planos ilimitados (backend igual). */
export const GRIMOIRE_HARD_LIMIT = 100;

export interface GrimoireLimitState {
  canCreate: boolean;
  /** Limite efetivo. */
  limit: number;
}

/** Limite efetivo de um `maxPocketGrimoires` (`-1` = até o teto). */
export const effectiveGrimoireLimit = (max: number): number =>
  max === -1 ? GRIMOIRE_HARD_LIMIT : Math.min(max, GRIMOIRE_HARD_LIMIT);

export function grimoireLimitState({
  count,
  max,
}: {
  count: number;
  /** `maxPocketGrimoires` do plano; `-1` = ilimitado. */
  max: number;
}): GrimoireLimitState {
  const limit = effectiveGrimoireLimit(max);
  return { canCreate: count < limit, limit };
}

const SUPPORT_HINT = 'apoie o projeto para ter mais.';
const LOGIN_HINT = 'entre na sua conta e apoie o projeto para ter mais.';

export const grimoireLimitMessage = (
  limit: number,
  isAuthenticated = true
): string => {
  if (limit >= GRIMOIRE_HARD_LIMIT) {
    return `Você atingiu o limite de ${GRIMOIRE_HARD_LIMIT} grimórios por conta. Exclua algum para criar outro.`;
  }
  return isAuthenticated
    ? `Você atingiu o limite de ${limit} grimórios do seu plano. Exclua algum ou ${SUPPORT_HINT}`
    : `Você atingiu o limite de ${limit} grimórios. Exclua algum, ou ${LOGIN_HINT}`;
};

/** Aviso ao tentar abrir um grimório bloqueado. */
export const lockedGrimoireMessage = (
  limit: number,
  isAuthenticated = true
): string =>
  isAuthenticated
    ? `Este grimório está acima do limite de ${limit} grimórios do seu plano. Exclua algum grimório para liberá-lo ou ${SUPPORT_HINT}`
    : `Este grimório está acima do limite de ${limit} grimórios. Exclua algum grimório para liberá-lo, ou ${LOGIN_HINT}`;

/**
 * Quais grimórios ficam bloqueados: os da conta têm prioridade, depois os que
 * o servidor recusou por limite, cada grupo na ordem da lista. Os primeiros
 * `limit` ficam liberados. Excluir qualquer grimório libera o primeiro
 * bloqueado na hora, mesmo offline; o próximo sync o leva para a conta (o
 * servidor aceita os novos na mesma ordem).
 */
export function lockedGrimoireIds(
  grimoires: PocketGrimoire[],
  rejectedIds: string[],
  limit: number
): Set<string> {
  if (grimoires.length <= limit) return new Set();
  const rejected = new Set(rejectedIds);
  const ordered = [
    ...grimoires.filter((g) => !rejected.has(g.id)),
    ...grimoires.filter((g) => rejected.has(g.id)),
  ];
  return new Set(ordered.slice(limit).map((g) => g.id));
}
