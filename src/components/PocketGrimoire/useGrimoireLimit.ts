import { useCallback, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useLimitBoost } from '../../hooks/useLimitBoost';
import { applyLimitBoost } from '../../functions/limitBoost';
import {
  getSupportLimits,
  SubscriptionTier,
} from '../../types/subscription.types';
import {
  selectActiveId,
  selectGrimoires,
  selectGrimoireSync,
  setActive,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  grimoireLimitMessage,
  grimoireLimitState,
  lockedGrimoireIds,
  lockedGrimoireMessage,
} from '../../functions/pocketGrimoire/limit';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

/**
 * Limite de grimórios (plano + boost, como as fichas; deslogado vale o
 * gratuito). Para as ações que criam grimório: `ensureCanCreate()` avisa e
 * devolve `false` no limite. Para abrir um grimório: `ensureUnlocked(id)`
 * avisa e devolve `false` se ele estiver acima do limite.
 */
export function useGrimoireLimit() {
  const { isAuthenticated } = useAuth();
  const grimoires = useAppSelector(selectGrimoires);
  const { rejectedIds } = useAppSelector(selectGrimoireSync);
  const planTier = useAppSelector(
    (state) => state.subscription.subscription?.tier
  );
  // Deslogado vale o plano gratuito, mesmo com uma assinatura antiga em cache.
  const tier = (isAuthenticated && planTier) || SubscriptionTier.FREE;
  const boost = useLimitBoost();
  const max = applyLimitBoost(getSupportLimits(tier), boost).maxPocketGrimoires;
  const { enqueueSnackbar } = useSnackbar();

  const { canCreate, limit } = grimoireLimitState({
    count: grimoires.length,
    max,
  });
  const message = canCreate ? '' : grimoireLimitMessage(limit, isAuthenticated);
  const lockedMessage = lockedGrimoireMessage(limit, isAuthenticated);
  const lockedIds = useMemo(
    () => lockedGrimoireIds(grimoires, rejectedIds, limit),
    [grimoires, rejectedIds, limit]
  );

  const ensureCanCreate = useCallback(() => {
    if (canCreate) return true;
    enqueueSnackbar(message, { ...GRIMOIRE_SNACKBAR, variant: 'warning' });
    return false;
  }, [canCreate, message, enqueueSnackbar]);

  const ensureUnlocked = useCallback(
    (id: string) => {
      if (!lockedIds.has(id)) return true;
      enqueueSnackbar(lockedMessage, {
        ...GRIMOIRE_SNACKBAR,
        variant: 'warning',
      });
      return false;
    },
    [lockedIds, lockedMessage, enqueueSnackbar]
  );

  return {
    canCreate,
    message,
    limit,
    lockedIds,
    lockedMessage,
    ensureCanCreate,
    ensureUnlocked,
  };
}

/**
 * O ativo nunca fica bloqueado (ex.: a sobra que estava ativa antes do login):
 * passa para o primeiro grimório liberado. Montado uma vez, no App.
 */
export function useKeepActiveUnlocked() {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector(selectActiveId);
  const grimoires = useAppSelector(selectGrimoires);
  const { lockedIds } = useGrimoireLimit();

  useEffect(() => {
    if (!lockedIds.has(activeId)) return;
    const firstUnlocked = grimoires.find((g) => !lockedIds.has(g.id));
    if (firstUnlocked) dispatch(setActive(firstUnlocked.id));
  }, [activeId, grimoires, lockedIds, dispatch]);
}
