import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { useSheets } from './useSheets';
import { SubscriptionTier } from '../types/subscription.types';

export interface SheetLimitResult {
  // Combined totals (for backward compatibility)
  totalSheets: number;
  maxSheets: number;
  maxMenaceSheets: number;
  canCreate: boolean;
  isNearLimit: boolean;
  remainingSlots: number;
  checkLimit: () => { canCreate: boolean; message: string };
  // Separate counts for characters and threats
  characterCount: number;
  menaceCount: number;
  canCreateCharacter: boolean;
  canCreateMenace: boolean;
  isNearCharacterLimit: boolean;
  isNearMenaceLimit: boolean;
  remainingCharacterSlots: number;
  remainingMenaceSlots: number;
  // Helpers for unlimited (-1) display
  isCharacterLimitUnlimited: boolean;
  isMenaceLimitUnlimited: boolean;
}

/**
 * Custom hook to check sheet creation limits based on subscription tier
 * Properly separates character sheets from threat/menace sheets
 */
export const useSheetLimit = (): SheetLimitResult => {
  const { limits, tier } = useSubscription();
  const { sheets } = useSheets();

  // Separate sheets by type
  const { characterCount, menaceCount } = useMemo(() => {
    if (!sheets || sheets.length === 0) {
      return { characterCount: 0, menaceCount: 0 };
    }

    let characters = 0;
    let menaces = 0;

    sheets.forEach((sheet) => {
      const sheetData = sheet.sheetData as Record<string, unknown> | undefined;
      if (sheetData?.isThreat) {
        menaces += 1;
      } else {
        characters += 1;
      }
    });

    return { characterCount: characters, menaceCount: menaces };
  }, [sheets]);

  // Get max limits from subscription (-1 means unlimited)
  const maxSheets = limits?.maxSheets ?? 10;
  const maxMenaceSheets = limits?.maxMenaceSheets ?? 10;

  // Check if limits are unlimited
  const isCharacterLimitUnlimited = maxSheets === -1;
  const isMenaceLimitUnlimited = maxMenaceSheets === -1;

  // Check if user can create new sheets (handle unlimited case)
  const canCreateCharacter =
    isCharacterLimitUnlimited || characterCount < maxSheets;
  const canCreateMenace =
    isMenaceLimitUnlimited || menaceCount < maxMenaceSheets;

  // Check if user is near limit (1-2 sheets away)
  const isNearCharacterLimit =
    !isCharacterLimitUnlimited &&
    maxSheets - characterCount <= 2 &&
    maxSheets - characterCount > 0;

  const isNearMenaceLimit =
    !isMenaceLimitUnlimited &&
    maxMenaceSheets - menaceCount <= 2 &&
    maxMenaceSheets - menaceCount > 0;

  // Calculate remaining slots (handle unlimited)
  const remainingCharacterSlots = isCharacterLimitUnlimited
    ? Infinity
    : Math.max(0, maxSheets - characterCount);

  const remainingMenaceSlots = isMenaceLimitUnlimited
    ? Infinity
    : Math.max(0, maxMenaceSheets - menaceCount);

  // Legacy: Combined values for backward compatibility (based on character sheets)
  const totalSheets = characterCount; // Keep this for backward compatibility
  const canCreate = canCreateCharacter;
  const isNearLimit = isNearCharacterLimit;
  const remainingSlots = isCharacterLimitUnlimited
    ? Infinity
    : Math.max(0, maxSheets - characterCount);

  // Function to check character limit and return message
  const checkLimit = () => {
    if (canCreateCharacter) {
      if (isCharacterLimitUnlimited) {
        return {
          canCreate: true,
          message: 'Você pode criar fichas ilimitadas.',
        };
      }
      return {
        canCreate: true,
        message: `Você pode criar mais ${remainingCharacterSlots} ficha${
          remainingCharacterSlots !== 1 ? 's' : ''
        } de personagem.`,
      };
    }

    return {
      canCreate: false,
      message: `Você atingiu o limite de ${maxSheets} ficha${
        maxSheets !== 1 ? 's' : ''
      } de personagem do plano ${
        tier === SubscriptionTier.FREE ? 'Gratuito' : tier
      }.`,
    };
  };

  return {
    // Legacy (backward compatibility)
    totalSheets,
    maxSheets,
    maxMenaceSheets,
    canCreate,
    isNearLimit,
    remainingSlots,
    checkLimit,
    // New separated values
    characterCount,
    menaceCount,
    canCreateCharacter,
    canCreateMenace,
    isNearCharacterLimit,
    isNearMenaceLimit,
    remainingCharacterSlots,
    remainingMenaceSlots,
    isCharacterLimitUnlimited,
    isMenaceLimitUnlimited,
  };
};
