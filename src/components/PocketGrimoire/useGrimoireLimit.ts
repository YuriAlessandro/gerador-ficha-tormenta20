import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useLimitBoost } from '../../hooks/useLimitBoost';
import { applyLimitBoost } from '../../functions/limitBoost';
import {
  getSupportLimits,
  SubscriptionTier,
} from '../../types/subscription.types';
import { selectGrimoires } from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  grimoireLimitMessage,
  grimoireLimitState,
} from '../../functions/pocketGrimoire/limit';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

/**
 * Limite de grimórios na conta (plano + boost, como as fichas). Para as ações
 * que criam grimório: `ensureCanCreate()` avisa e devolve `false` no limite.
 */
export function useGrimoireLimit() {
  const { isAuthenticated } = useAuth();
  const count = useAppSelector(selectGrimoires).length;
  const tier =
    useAppSelector((state) => state.subscription.subscription?.tier) ||
    SubscriptionTier.FREE;
  const boost = useLimitBoost();
  const max = applyLimitBoost(getSupportLimits(tier), boost).maxPocketGrimoires;
  const { enqueueSnackbar } = useSnackbar();

  const { canCreate, limit } = grimoireLimitState({
    isAuthenticated,
    count,
    max,
  });
  const message = canCreate ? '' : grimoireLimitMessage(limit);

  const ensureCanCreate = useCallback(() => {
    if (canCreate) return true;
    enqueueSnackbar(message, { ...GRIMOIRE_SNACKBAR, variant: 'warning' });
    return false;
  }, [canCreate, message, enqueueSnackbar]);

  return { canCreate, message, ensureCanCreate };
}
