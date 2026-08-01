/**
 * Boost global de limites — recompensa da meta de 200 apoiadores.
 *
 * Quando ligado (flag `limitBoost` no painel admin), todos os limites por nível
 * de apoio são multiplicados e arredondados PARA CIMA, inclusive os de usuários
 * gratuitos. Este módulo é só apresentação/pré-validação: o servidor revalida
 * toda escrita lendo a própria flag, então um cliente adulterado só ganha 403.
 *
 * ESPELHO: `backend/src/services/limitBoostService.ts` — manter os dois em
 * sincronia (mesma política de arredondamento e mesma lista de exceções).
 */

import { FeatureFlag } from '../types/featureFlags.types';
import { SubscriptionLimits } from '../types/subscription.types';

export const DEFAULT_LIMIT_BOOST_MULTIPLIER = 1.5;
export const MIN_LIMIT_BOOST_MULTIPLIER = 1;
export const MAX_LIMIT_BOOST_MULTIPLIER = 5;

/**
 * Limites que NUNCA recebem boost.
 *
 * `maxSupplements` fica de fora por decisão de produto: a escolha entre
 * suplementos é o gancho de apoio e não faz parte da recompensa da meta.
 */
export const NON_BOOSTABLE_LIMITS: (keyof SubscriptionLimits)[] = [
  'maxSupplements',
];

export interface LimitBoost {
  active: boolean;
  multiplier: number;
}

export const NO_BOOST: LimitBoost = { active: false, multiplier: 1 };

/**
 * Normaliza o multiplicador vindo da API. Valor ausente, não-numérico ou fora
 * da faixa cai no default — nunca deixa um valor absurdo chegar na UI.
 */
export function clampMultiplier(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_LIMIT_BOOST_MULTIPLIER;
  }
  return Math.min(
    MAX_LIMIT_BOOST_MULTIPLIER,
    Math.max(MIN_LIMIT_BOOST_MULTIPLIER, value)
  );
}

/**
 * Aplica o boost a um valor de limite.
 *
 * Sentinelas passam intactas: `-1` (ilimitado) e `0` (indisponível) não fazem
 * sentido multiplicados. Qualquer valor positivo é arredondado para cima.
 */
export function boostValue(value: number, boost: LimitBoost): number {
  if (!boost.active) return value;
  if (value <= 0) return value;
  return Math.ceil(value * boost.multiplier);
}

/**
 * Versão turbinada da tabela de limites de um nível de apoio.
 * Retorna o próprio objeto quando o boost está desligado.
 */
export function applyLimitBoost(
  limits: SubscriptionLimits,
  boost: LimitBoost
): SubscriptionLimits {
  if (!boost.active) return limits;

  const boosted = { ...limits };
  (Object.keys(boosted) as (keyof SubscriptionLimits)[]).forEach((key) => {
    if (NON_BOOSTABLE_LIMITS.includes(key)) return;
    boosted[key] = boostValue(boosted[key], boost);
  });

  return boosted;
}

/**
 * Converte a feature flag `limitBoost` no estado de boost usado pela UI.
 *
 * `supporterOnly` é ignorado de propósito: o boost vale para todo mundo,
 * inclusive contas gratuitas — é justamente esse o anúncio da meta.
 */
export function resolveLimitBoost(flag?: FeatureFlag): LimitBoost {
  if (!flag?.enabled) return NO_BOOST;
  return { active: true, multiplier: clampMultiplier(flag.value) };
}
