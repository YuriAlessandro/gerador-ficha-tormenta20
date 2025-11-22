import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
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
  canAccessFeature,
  hasReachedLimit,
  SubscriptionLimits,
} from '../types/subscription.types';

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
  const limits = useSelector((state: RootState) => state.subscription.limits);

  // Get current tier (defaults to FREE if no subscription)
  const tier = subscription?.tier || SubscriptionTier.FREE;
  const status = subscription?.status || SubscriptionStatus.ACTIVE;
  const isActive = status === SubscriptionStatus.ACTIVE;
  const isPremium =
    tier !== SubscriptionTier.FREE && status === SubscriptionStatus.ACTIVE;

  // Fetch subscription on mount if not loaded
  useEffect(() => {
    if (!subscription && !loading) {
      dispatch(fetchSubscription());
    }
  }, [dispatch, subscription, loading]);

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

  // Utility functions
  const canAccess = useCallback(
    (feature: keyof SubscriptionLimits): boolean =>
      canAccessFeature(tier, feature),
    [tier]
  );

  const hasReached = useCallback(
    (
      limitType: keyof Pick<
        SubscriptionLimits,
        'maxSheets' | 'maxDiaries' | 'maxNotebooks'
      >,
      currentCount: number
    ): boolean => hasReachedLimit(tier, limitType, currentCount),
    [tier]
  );

  const getLimit = useCallback(
    (limitType: keyof SubscriptionLimits): number | boolean =>
      limits ? limits[limitType] : 0,
    [limits]
  );

  return {
    // Subscription data
    subscription,
    tier,
    status,
    isActive,
    isPremium,
    limits,

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
