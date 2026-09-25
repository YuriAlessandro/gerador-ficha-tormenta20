import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchSubscription,
  fetchPricingPlans,
  fetchInvoices,
  createCheckout,
  cancelSubscription,
  reactivateSubscription,
  openCustomerPortal,
  clearSubscriptionError,
} from '../store/slices/subscription/subscriptionSlice';
import {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionLimits,
  getSupportLimits,
  isSupporter as checkIsSupporter,
  canAccessGameTables as checkCanAccessGameTables,
} from '../types/subscription.types';
import { applyLimitBoost } from '../functions/limitBoost';
import { useLimitBoost } from './useLimitBoost';

/**
 * Usuário (uid) cuja assinatura já foi revalidada nesta carga de página.
 *
 * De MÓDULO, e não por instância: o hook é usado por dezenas de componentes
 * (todo `useFeatureAccess` passa por ele) e o efeito rodava em CADA montagem.
 * Uma ficha disparava 12 buscas de assinatura ao abrir, e cada resposta
 * regravava o slice e re-renderizava a ficha inteira 12 vezes — o editor de
 * layout, que monta uma segunda ficha no preview, dobrava isso. O `!loading`
 * do efeito não deduplicava nada: todas as instâncias montam no mesmo commit e
 * leem `loading = false`.
 */
let revalidatedUid: string | null = null;

/** Só para testes: o guard é de módulo e sobrevive entre casos. */
export const resetSubscriptionRevalidation = (): void => {
  revalidatedUid = null;
};

/**
 * Custom hook for subscription management
 */
export const useSubscription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscription = useSelector(
    (state: RootState) => state.subscription.subscription
  );
  const pricingPlans = useSelector(
    (state: RootState) => state.subscription.pricingPlans
  );
  const invoices = useSelector(
    (state: RootState) => state.subscription.invoices
  );
  const loading = useSelector((state: RootState) => state.subscription.loading);
  const error = useSelector((state: RootState) => state.subscription.error);

  // Get auth state to check if user is authenticated
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const uid = useSelector(
    (state: RootState) => state.auth.firebaseUser?.uid ?? null
  );

  // Get current tier (defaults to FREE if no subscription)
  const tier = subscription?.tier || SubscriptionTier.FREE;

  // Limites são DERIVADOS de (nível de apoio + boost global), e não lidos do
  // slice: o boost pode ser ligado/desligado pelo admin a qualquer momento, e
  // um valor guardado no store ficaria congelado até o próximo fetch.
  const limitBoost = useLimitBoost();
  const limits = useMemo(
    () => applyLimitBoost(getSupportLimits(tier), limitBoost),
    [tier, limitBoost]
  );

  const status = subscription?.status || SubscriptionStatus.ACTIVE;
  const isActive = status === SubscriptionStatus.ACTIVE;
  const isPremium =
    tier !== SubscriptionTier.FREE && status === SubscriptionStatus.ACTIVE;

  // Always revalidate subscription whenever the user becomes authenticated.
  // We intentionally do NOT short-circuit on `!subscription` because the slice
  // is persisted to localStorage — relying on persisted state means a user
  // whose tier changed since the last visit (upgrade, renewal, downgrade)
  // would keep seeing the old limits until they manually visit the profile.
  // The cost of one extra request per session is worth always-correct gating.
  // UMA por usuário por carga de página (ver `revalidatedUid`); quem precisa
  // de dado fresco depois disso (checkout, perfil) chama `loadSubscription`.
  useEffect(() => {
    if (!isAuthenticated || !uid || revalidatedUid === uid) return;
    revalidatedUid = uid;
    dispatch(fetchSubscription());
  }, [dispatch, isAuthenticated, uid]);

  // Actions
  const loadSubscription = useCallback(() => {
    dispatch(fetchSubscription());
  }, [dispatch]);

  const loadPricingPlans = useCallback(() => {
    dispatch(fetchPricingPlans());
  }, [dispatch]);

  const loadInvoices = useCallback(
    (limit?: number) => {
      dispatch(fetchInvoices(limit));
    },
    [dispatch]
  );

  const upgradeToTier = useCallback(
    (targetTier: SubscriptionTier) => {
      dispatch(createCheckout(targetTier));
    },
    [dispatch]
  );

  const cancel = useCallback(() => {
    dispatch(cancelSubscription());
  }, [dispatch]);

  const reactivate = useCallback(() => {
    dispatch(reactivateSubscription());
  }, [dispatch]);

  const manageSubscription = useCallback(() => {
    dispatch(openCustomerPortal());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSubscriptionError());
  }, [dispatch]);

  // Utility functions — operam sobre os limites JÁ turbinados
  const canAccess = useCallback(
    (feature: keyof SubscriptionLimits): boolean => limits[feature] > 0,
    [limits]
  );

  const hasReached = useCallback(
    (
      limitType: 'maxSheets' | 'maxGameTables' | 'maxPlayersPerTable',
      currentCount: number
    ): boolean => {
      const maxAllowed = limits[limitType];
      if (maxAllowed === -1) return false; // ilimitado
      if (maxAllowed === 0) return true; // indisponível
      return currentCount >= maxAllowed;
    },
    [limits]
  );

  // Check if user is a supporter (any paid level)
  const isUserSupporter = isAuthenticated && checkIsSupporter(tier);

  // Check if user can access game tables (NIVEL_2 or higher)
  const canAccessGameTables = checkCanAccessGameTables(tier) && isActive;

  const getLimit = useCallback(
    (limitType: keyof SubscriptionLimits): number | boolean =>
      limits ? limits[limitType] : 0,
    [limits]
  );

  return {
    // Subscription data
    subscription,
    tier,
    supportLevel: tier, // Alias for new terminology
    status,
    isActive,
    isPremium,
    isSupporter: isUserSupporter, // Is user a supporter (any paid level)
    canAccessGameTables, // Can access game tables (NIVEL_2 or higher)
    limits, // já turbinados quando o boost está ligado
    limitBoost, // estado do boost global, para a UI da chama
    baseLimits: getSupportLimits(tier), // valores sem boost, para "10 → 15"

    // Pricing and invoices
    pricingPlans,
    invoices,

    // Loading and error states
    loading,
    error,

    // Actions
    loadSubscription,
    loadPricingPlans,
    loadInvoices,
    upgradeToTier,
    cancel,
    reactivate,
    manageSubscription,
    clearError,

    // Utility functions
    canAccess,
    hasReached,
    getLimit,
  };
};
