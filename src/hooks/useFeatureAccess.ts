import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  FeatureFlags,
  DEFAULT_FEATURE_FLAGS,
} from '../types/featureFlags.types';
import { useSubscription } from './useSubscription';

/**
 * Hook para verificar acesso a uma feature gated.
 *
 * - Se a flag não existe ou `enabled === false` → sem acesso
 * - Se `supporterOnly === true` → apenas apoiadores
 * - Se `supporterOnly === false` → acesso para todos
 */
export function useFeatureAccess(featureName: keyof FeatureFlags) {
  const featureFlags = useSelector(
    (state: RootState) => state.system.featureFlags
  );
  const { isSupporter } = useSubscription();

  const flags = featureFlags ?? DEFAULT_FEATURE_FLAGS;
  const flag = flags[featureName];

  if (!flag || !flag.enabled) {
    return {
      hasAccess: false,
      isLoading: false,
      supporterOnly: flag?.supporterOnly ?? false,
    };
  }

  if (flag.supporterOnly) {
    return {
      hasAccess: isSupporter,
      isLoading: false,
      supporterOnly: true,
    };
  }

  return {
    hasAccess: true,
    isLoading: false,
    supporterOnly: false,
  };
}
