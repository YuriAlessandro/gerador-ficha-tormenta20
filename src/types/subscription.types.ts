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
  maxGameTables: number; // 0 = not available, -1 = unlimited
  maxPlayersPerTable: number; // -1 = unlimited
  maxWeeklyBestiaryPublications: number; // Bestiary publications per 7-day rolling window, -1 = unlimited
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
    maxGameTables: 1,
    maxPlayersPerTable: 6,
    maxWeeklyBestiaryPublications: 1,
  },
  [SupportLevel.NIVEL_1]: {
    maxSheets: 15,
    maxMenaceSheets: 50,
    maxGameTables: 1,
    maxPlayersPerTable: 6,
    maxWeeklyBestiaryPublications: 15,
  },
  [SupportLevel.NIVEL_1_ANUAL]: {
    maxSheets: 15,
    maxMenaceSheets: 50,
    maxGameTables: 1,
    maxPlayersPerTable: 6,
    maxWeeklyBestiaryPublications: 15,
  },
  [SupportLevel.NIVEL_2]: {
    maxSheets: 20,
    maxMenaceSheets: 70,
    maxGameTables: 5,
    maxPlayersPerTable: -1,
    maxWeeklyBestiaryPublications: 50,
  },
  [SupportLevel.NIVEL_3]: {
    maxSheets: -1, // Unlimited
    maxMenaceSheets: -1, // Unlimited
    maxGameTables: -1, // Unlimited
    maxPlayersPerTable: -1, // Unlimited
    maxWeeklyBestiaryPublications: -1, // Unlimited
  },
  [SupportLevel.NIVEL_2_ANUAL]: {
    maxSheets: 20,
    maxMenaceSheets: 70,
    maxGameTables: 5,
    maxPlayersPerTable: -1,
    maxWeeklyBestiaryPublications: 50,
  },
  [SupportLevel.NIVEL_3_ANUAL]: {
    maxSheets: -1, // Unlimited
    maxMenaceSheets: -1,
    maxGameTables: -1, // Unlimited
    maxPlayersPerTable: -1, // Unlimited
    maxWeeklyBestiaryPublications: -1, // Unlimited
  },
};

/**
 * Profile customization caps. MUST mirror the backend
 * (config/profileCustomization.ts) — the server re-validates every write, this
 * copy only drives enabling/disabling controls in the editor. `-1` = unlimited.
 *
 * Sections (any type) are a single total budget:
 *  - FREE: earned via gamification level — `floor(level / 10)` (lvl 10 → 1,
 *    lvl 20 → 2, below 10 → 0).
 *  - NIVEL_1: 3, NIVEL_2: 5, NIVEL_3: unlimited.
 * Fonts/colors are supporter-only.
 */
export interface ProfileCustomizationCaps {
  maxSections: number;
  canUsePhotoUrl: boolean;
  canUseColumns: boolean;
  canCustomizeColors: boolean;
  canCustomizeFont: boolean;
  canCustomizeBackgroundColor: boolean;
  canCustomizeBackgroundImage: boolean;
  maxPinnedBadges: number;
}

/** Free-tier section allowance is earned via gamification level. */
export function freeMaxSections(profileLevel: number): number {
  return Math.floor(Math.max(0, profileLevel) / 10);
}

/**
 * Resolve the caps for a support level. `profileLevel` (gamification level) only
 * affects the FREE tier's section allowance; supporters use fixed values.
 */
export function getProfileCustomizationCaps(
  level: SupportLevel,
  profileLevel = 0
): ProfileCustomizationCaps {
  switch (level) {
    case SupportLevel.NIVEL_1:
    case SupportLevel.NIVEL_1_ANUAL:
      return {
        maxSections: 3,
        canUsePhotoUrl: true,
        canUseColumns: false,
        canCustomizeColors: true,
        canCustomizeFont: true,
        canCustomizeBackgroundColor: true,
        canCustomizeBackgroundImage: false,
        maxPinnedBadges: 3,
      };
    case SupportLevel.NIVEL_2:
    case SupportLevel.NIVEL_2_ANUAL:
      return {
        maxSections: 5,
        canUsePhotoUrl: true,
        canUseColumns: true,
        canCustomizeColors: true,
        canCustomizeFont: true,
        canCustomizeBackgroundColor: true,
        canCustomizeBackgroundImage: false,
        maxPinnedBadges: 5,
      };
    case SupportLevel.NIVEL_3:
    case SupportLevel.NIVEL_3_ANUAL:
      return {
        maxSections: -1,
        canUsePhotoUrl: true,
        canUseColumns: true,
        canCustomizeColors: true,
        canCustomizeFont: true,
        canCustomizeBackgroundColor: true,
        canCustomizeBackgroundImage: true,
        maxPinnedBadges: 5,
      };
    case SupportLevel.FREE:
    default:
      return {
        maxSections: freeMaxSections(profileLevel),
        canUsePhotoUrl: false,
        canUseColumns: false,
        canCustomizeColors: false,
        canCustomizeFont: false,
        canCustomizeBackgroundColor: false,
        canCustomizeBackgroundImage: false,
        maxPinnedBadges: 1,
      };
  }
}

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
 * Helper to check if user can access game tables
 * Returns true if maxGameTables is not 0 (-1 means unlimited)
 */
export function canAccessGameTables(level: SupportLevel): boolean {
  const limits = getSupportLimits(level);
  return limits.maxGameTables !== 0;
}

/**
 * Helper to get max players per table for a support level
 * Returns null if unlimited
 */
export function getMaxPlayersPerTable(level: SupportLevel): number | null {
  const limits = getSupportLimits(level);
  return limits.maxPlayersPerTable === -1 ? null : limits.maxPlayersPerTable;
}

/**
 * Get the glow/shadow color for a supporter's badge
 * Returns null for free users
 */
export function getSupporterGlowColor(level?: SupportLevel): string | null {
  if (!level || level === SupportLevel.FREE) return null;
  return SUPPORT_LEVEL_CONFIG[level].badgeColor;
}
