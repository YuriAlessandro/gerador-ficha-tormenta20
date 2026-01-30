/**
 * Support system types (formerly subscription/premium features)
 */

/**
 * Available support levels
 */
export enum SupportLevel {
  FREE = 'free',
  NIVEL_1 = 'nivel_1',
  NIVEL_1_ANUAL = 'nivel_1_anual',
  NIVEL_2 = 'nivel_2',
  NIVEL_3 = 'nivel_3',
  NIVEL_2_ANUAL = 'nivel_2_anual',
  NIVEL_3_ANUAL = 'nivel_3_anual',
}

/**
 * Alias for backward compatibility
 */
export const SubscriptionTier = SupportLevel;
export type SubscriptionTier = SupportLevel;

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
  tier: SupportLevel;
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
 * Feature limits per support level
 */
export interface SubscriptionLimits {
  maxSheets: number;
  maxMenaceSheets: number; // -1 = unlimited
  canComment: boolean;
  maxGameTables: number; // 0 = not available, -1 = unlimited
  maxPlayersPerTable: number; // -1 = unlimited
}

/**
 * Support level info for display
 */
export interface SupportLevelInfo {
  level: SupportLevel;
  tier?: SupportLevel; // Alias for backward compatibility
  name: string;
  price: number;
  originalPrice?: number; // For discount display
  description: string;
  stripePriceId?: string;
  features: string[];
  limits: SubscriptionLimits;
  badgeVariant: 'silver' | 'gold' | 'diamond';
  recommended?: boolean;
  billingPeriod?: 'monthly' | 'yearly';
}

/**
 * Pricing plan configuration (alias for backward compatibility)
 */
export type PricingPlan = SupportLevelInfo;

/**
 * Invoice/payment history item
 */
export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible' | 'draft';
  paidAt?: Date | string | null;
  invoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  periodStart: Date | string;
  periodEnd: Date | string;
}

/**
 * Support level display configuration
 */
export const SUPPORT_LEVEL_CONFIG: Record<
  SupportLevel,
  {
    name: string;
    badgeColor: string;
    badgeGradient: string;
    badgeVariant: 'none' | 'silver' | 'gold' | 'diamond';
  }
> = {
  [SupportLevel.FREE]: {
    name: 'Grátis',
    badgeColor: '#666',
    badgeGradient: 'linear-gradient(135deg, #666 0%, #888 100%)',
    badgeVariant: 'none',
  },
  [SupportLevel.NIVEL_1]: {
    name: 'Apoiador Nível 1',
    badgeColor: '#A0A0A0',
    badgeGradient:
      'linear-gradient(135deg, #A8A8A8 0%, #C8C8C8 50%, #888888 100%)',
    badgeVariant: 'silver',
  },
  [SupportLevel.NIVEL_1_ANUAL]: {
    name: 'Apoiador Nível 1 - Anual',
    badgeColor: '#A0A0A0',
    badgeGradient:
      'linear-gradient(135deg, #A8A8A8 0%, #C8C8C8 50%, #888888 100%)',
    badgeVariant: 'silver',
  },
  [SupportLevel.NIVEL_2]: {
    name: 'Apoiador Nível 2',
    badgeColor: '#FFD700',
    badgeGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    badgeVariant: 'gold',
  },
  [SupportLevel.NIVEL_2_ANUAL]: {
    name: 'Apoiador Nível 2 - Anual',
    badgeColor: '#FFD700',
    badgeGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    badgeVariant: 'gold',
  },
  [SupportLevel.NIVEL_3]: {
    name: 'Apoiador Nível 3',
    badgeColor: '#B9F2FF',
    badgeGradient:
      'linear-gradient(135deg, #B9F2FF 0%, #89CFF0 50%, #00BFFF 100%)',
    badgeVariant: 'diamond',
  },
  [SupportLevel.NIVEL_3_ANUAL]: {
    name: 'Apoiador Nível 3 - Anual',
    badgeColor: '#B9F2FF',
    badgeGradient:
      'linear-gradient(135deg, #B9F2FF 0%, #89CFF0 50%, #00BFFF 100%)',
    badgeVariant: 'diamond',
  },
};

/**
 * Support limits configuration
 */
export const SUPPORT_LIMITS: Record<SupportLevel, SubscriptionLimits> = {
  [SupportLevel.FREE]: {
    maxSheets: 10,
    maxMenaceSheets: 10,
    canComment: false,
    maxGameTables: 0,
    maxPlayersPerTable: 0,
  },
  [SupportLevel.NIVEL_1]: {
    maxSheets: 15,
    maxMenaceSheets: 50,
    canComment: true,
    maxGameTables: 1,
    maxPlayersPerTable: 6,
  },
  [SupportLevel.NIVEL_1_ANUAL]: {
    maxSheets: 15,
    maxMenaceSheets: 50,
    canComment: true,
    maxGameTables: 1,
    maxPlayersPerTable: 6,
  },
  [SupportLevel.NIVEL_2]: {
    maxSheets: 20,
    maxMenaceSheets: 70,
    canComment: true,
    maxGameTables: 5,
    maxPlayersPerTable: -1,
  },
  [SupportLevel.NIVEL_3]: {
    maxSheets: -1, // Unlimited
    maxMenaceSheets: -1, // Unlimited
    canComment: true,
    maxGameTables: -1, // Unlimited
    maxPlayersPerTable: -1, // Unlimited
  },
  [SupportLevel.NIVEL_2_ANUAL]: {
    maxSheets: 20,
    maxMenaceSheets: 70,
    canComment: true,
    maxGameTables: 5,
    maxPlayersPerTable: -1,
  },
  [SupportLevel.NIVEL_3_ANUAL]: {
    maxSheets: -1, // Unlimited
    maxMenaceSheets: -1,
    canComment: true,
    maxGameTables: -1, // Unlimited
    maxPlayersPerTable: -1, // Unlimited
  },
};

/**
 * Alias for backward compatibility
 */
export const PRICING_PLANS = SUPPORT_LIMITS;

/**
 * Helper to get limits for a support level
 */
export function getSupportLimits(level: SupportLevel): SubscriptionLimits {
  return SUPPORT_LIMITS[level];
}

/**
 * Alias for backward compatibility
 */
export const getSubscriptionLimits = getSupportLimits;

/**
 * Helper to check if user can access a feature
 */
export function canAccessFeature(
  level: SupportLevel,
  feature: keyof SubscriptionLimits
): boolean {
  const limits = getSupportLimits(level);
  const value = limits[feature];

  if (typeof value === 'boolean') {
    return value;
  }

  return value > 0;
}

/**
 * Helper to check if user has reached a limit
 */
export function hasReachedLimit(
  level: SupportLevel,
  limitType:
    | 'maxSheets'
    | 'maxMenaceSheets'
    | 'maxGameTables'
    | 'maxPlayersPerTable',
  currentCount: number
): boolean {
  const limits = getSupportLimits(level);
  const maxAllowed = limits[limitType];

  // -1 means unlimited
  if (maxAllowed === -1) {
    return false;
  }

  // 0 means feature not available
  if (maxAllowed === 0) {
    return true;
  }

  return currentCount >= maxAllowed;
}

/**
 * Helper to check if user is a supporter (any paid level)
 */
export function isSupporter(level: SupportLevel): boolean {
  return level !== SupportLevel.FREE;
}

/**
 * Get display name for a support level
 */
export function getSupportLevelName(level: SupportLevel): string {
  return SUPPORT_LEVEL_CONFIG[level].name;
}

/**
 * Helper to check if user can access game tables (NIVEL_2 or higher)
 */
export function canAccessGameTables(level: SupportLevel): boolean {
  const limits = getSupportLimits(level);
  return limits.maxGameTables > 0;
}

/**
 * Helper to get max players per table for a support level
 * Returns null if unlimited
 */
export function getMaxPlayersPerTable(level: SupportLevel): number | null {
  const limits = getSupportLimits(level);
  return limits.maxPlayersPerTable === -1 ? null : limits.maxPlayersPerTable;
}
