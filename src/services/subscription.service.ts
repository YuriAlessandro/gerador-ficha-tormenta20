import api from './api';
import {
  Subscription,
  PricingPlan,
  Invoice,
  SubscriptionTier,
} from '../types/subscription.types';

/**
 * Get current user's subscription
 */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  const response = await api.get('/api/subscriptions/current');
  return response.data.data;
}

/**
 * Get available pricing plans
 */
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const response = await api.get('/api/subscriptions/pricing');
  return response.data.data;
}

/**
 * Create a checkout session and redirect to Stripe
 */
export async function createCheckoutSession(
  tier: SubscriptionTier
): Promise<{ sessionId: string; url: string }> {
  const response = await api.post('/api/subscriptions/checkout', {
    level: tier,
  });
  return response.data.data;
}

/**
 * Create a customer portal session to manage subscription
 */
export async function createPortalSession(): Promise<{ url: string }> {
  const response = await api.post('/api/subscriptions/portal');
  return response.data.data;
}

/**
 * Cancel subscription at the end of billing period
 */
export async function cancelSubscription(): Promise<Subscription> {
  const response = await api.post('/api/subscriptions/cancel');
  return response.data.data;
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(): Promise<Subscription> {
  const response = await api.post('/api/subscriptions/reactivate');
  return response.data.data;
}

/**
 * Get subscription invoices/payment history
 */
export async function getInvoices(limit = 10): Promise<Invoice[]> {
  const response = await api.get('/api/subscriptions/invoices', {
    params: { limit },
  });
  return response.data.data;
}

/**
 * Open Stripe customer portal in new window
 */
export async function openCustomerPortal(): Promise<void> {
  const { url } = await createPortalSession();
  window.open(url, '_blank');
}

/**
 * Redirect to Stripe checkout
 */
export async function redirectToCheckout(
  tier: SubscriptionTier
): Promise<void> {
  const { url } = await createCheckoutSession(tier);
  window.location.href = url;
}

const subscriptionService = {
  getCurrentSubscription,
  getPricingPlans,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  reactivateSubscription,
  getInvoices,
  openCustomerPortal,
  redirectToCheckout,
};

export default subscriptionService;
