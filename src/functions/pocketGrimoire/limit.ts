import { getSupportLimits, SupportLevel } from '../../types/subscription.types';

/**
 * Limite de grimórios de quem está deslogado (e do build sem o módulo
 * premium): o do plano gratuito, sem boost. Nunca é maior que o de uma conta
 * gratuita, então entrar na conta nunca bloqueia grimório. O limite de quem
 * está logado vem do premium (`usePocketGrimoirePlan`).
 */
export const anonymousGrimoireLimit = (): number =>
  getSupportLimits(SupportLevel.FREE).maxPocketGrimoires;

export const anonymousLimitMessage = (limit: number): string =>
  `Você atingiu o limite de ${limit} grimórios. Exclua algum, ou entre na sua conta e apoie o projeto para ter mais.`;
