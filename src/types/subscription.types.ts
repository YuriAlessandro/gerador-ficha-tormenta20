/**
 * Subscription system types for premium features
 */

/**
 * Available subscription tiers
 */
export enum SubscriptionTier {
  FREE = 'free',
  SIMPLE = 'simple',
}

/**
 * Subscription status from Stripe
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}

/**
 * Subscription data model
 */
export interface Subscription {
  _id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Feature limits per subscription tier
 */
export interface SubscriptionLimits {
  maxSheets: number; // Maximum number of saved sheets
  maxDiaries: number; // Maximum number of player diaries
  maxNotebooks: number; // Maximum number of master notebooks
  canComment: boolean; // Can comment on platform content
  canUseBuilds: boolean; // Can generate sheets from builds
}

/**
 * Pricing plan configuration
 */
export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  price: number; // Monthly price in BRL
  originalPrice?: number; // Original price (if on sale)
  stripePriceId?: string; // Stripe price ID for checkout
  features: string[]; // List of feature descriptions
  limits: SubscriptionLimits;
  recommended?: boolean; // Highlight as recommended
}

/**
 * Invoice/payment history item
 */
export interface Invoice {
  _id: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  paidAt?: Date;
  invoiceUrl?: string;
  invoicePdfUrl?: string;
  createdAt: Date;
}

/**
 * Pricing plans configuration
 */
export const PRICING_PLANS: Record<SubscriptionTier, PricingPlan> = {
  [SubscriptionTier.FREE]: {
    tier: SubscriptionTier.FREE,
    name: 'Grátis',
    price: 0,
    features: [
      'Criação de fichas ilimitadas',
      'Acesso a todas as ferramentas da plataforma',
      'Até 5 fichas salvas na nuvem',
      '1 diário do jogador',
      '1 caderno do mestre',
    ],
    limits: {
      maxSheets: 5,
      maxDiaries: 1,
      maxNotebooks: 1,
      canComment: false,
      canUseBuilds: false,
    },
  },
  [SubscriptionTier.SIMPLE]: {
    tier: SubscriptionTier.SIMPLE,
    name: 'Simples',
    price: 6.99,
    originalPrice: 9.99,
    features: [
      'Tudo do plano grátis',
      'Até 50 fichas salvas na nuvem',
      'Comentar nos conteúdos da plataforma',
      'Gerar fichas a partir de builds',
      'Diários ilimitados do jogador',
      'Cadernos ilimitados do mestre',
    ],
    limits: {
      maxSheets: 50,
      maxDiaries: Infinity,
      maxNotebooks: Infinity,
      canComment: true,
      canUseBuilds: true,
    },
    recommended: true,
  },
};

/**
 * Helper to get limits for a subscription tier
 */
export function getSubscriptionLimits(
  tier: SubscriptionTier
): SubscriptionLimits {
  return PRICING_PLANS[tier].limits;
}

/**
 * Helper to check if user can access a feature
 */
export function canAccessFeature(
  tier: SubscriptionTier,
  feature: keyof SubscriptionLimits
): boolean {
  const limits = getSubscriptionLimits(tier);
  const value = limits[feature];

  if (typeof value === 'boolean') {
    return value;
  }

  // For numeric limits, just check if > 0
  return value > 0;
}

/**
 * Helper to check if user has reached a limit
 */
export function hasReachedLimit(
  tier: SubscriptionTier,
  limitType: keyof Pick<
    SubscriptionLimits,
    'maxSheets' | 'maxDiaries' | 'maxNotebooks'
  >,
  currentCount: number
): boolean {
  const limits = getSubscriptionLimits(tier);
  const maxAllowed = limits[limitType] as number;

  if (maxAllowed === Infinity) {
    return false;
  }

  return currentCount >= maxAllowed;
}
