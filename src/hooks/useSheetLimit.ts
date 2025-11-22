import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { useSheets } from './useSheets';
import { SubscriptionTier } from '../types/subscription.types';

export interface SheetLimitResult {
  totalSheets: number;
  maxSheets: number;
  canCreate: boolean;
  isNearLimit: boolean;
  remainingSlots: number;
  checkLimit: () => { canCreate: boolean; message: string };
}

/**
 * Custom hook to check sheet creation limits based on subscription tier
 * Counts both character sheets and threats in the cloud
 */
export const useSheetLimit = (): SheetLimitResult => {
  const { limits, tier } = useSubscription();
  const { sheets } = useSheets();

  // Calculate total sheets (characters + threats in cloud)
  // Note: Both characters and threats are stored in the sheets array
  // Threats have the isThreat flag set to true in their sheetData
  const totalSheets = useMemo(() => sheets?.length || 0, [sheets]);

  // Get max sheets from subscription limits
  const maxSheets = limits?.maxSheets || 5;

  // Check if user can create new sheet
  const canCreate = totalSheets < maxSheets;

  // Check if user is near the limit (1-2 sheets away)
  const isNearLimit =
    maxSheets - totalSheets <= 2 && maxSheets - totalSheets > 0;

  // Calculate remaining slots
  const remainingSlots = Math.max(0, maxSheets - totalSheets);

  // Function to check limit and return message
  const checkLimit = () => {
    if (canCreate) {
      return {
        canCreate: true,
        message: `Você pode criar mais ${remainingSlots} ficha${
          remainingSlots !== 1 ? 's' : ''
        }.`,
      };
    }

    return {
      canCreate: false,
      message: `Você atingiu o limite de ${maxSheets} ficha${
        maxSheets !== 1 ? 's' : ''
      } do plano ${tier === SubscriptionTier.FREE ? 'Gratuito' : tier}.`,
    };
  };

  return {
    totalSheets,
    maxSheets,
    canCreate,
    isNearLimit,
    remainingSlots,
    checkLimit,
  };
};
