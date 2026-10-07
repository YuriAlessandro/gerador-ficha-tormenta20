import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { usePocketGrimoirePlan } from '@/premium/components/PocketGrimoire/usePocketGrimoirePlan';
import { useAppSelector } from '../../store/hooks';
import { selectGrimoires } from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  anonymousGrimoireLimit,
  anonymousLimitMessage,
} from '../../functions/pocketGrimoire/limit';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

const NONE_LOCKED: Set<string> = new Set();

/**
 * Limite de grimórios. Deslogado (ou sem o módulo premium): o fixo do plano
 * gratuito, sem bloqueios. Logado: o plano que o premium informa — e, enquanto
 * ele carrega, nada é bloqueado nem impedido (o servidor é a autoridade).
 * `ensureCanCreate()` avisa e devolve `false` no limite; `ensureUnlocked(id)`
 * avisa e devolve `false` para um grimório acima do limite.
 */
export function useGrimoireLimit() {
  const count = useAppSelector(selectGrimoires).length;
  const plan = usePocketGrimoirePlan();
  const { enqueueSnackbar } = useSnackbar();

  let limit = Infinity;
  let createMessage = '';
  let lockedIds = NONE_LOCKED;
  let lockedMessage = '';
  if (plan === null) {
    limit = anonymousGrimoireLimit();
    createMessage = anonymousLimitMessage(limit);
  } else if (plan.ready) {
    ({ limit, lockedIds, lockedMessage } = plan);
    createMessage = plan.createLimitMessage;
  }
  const canCreate = count < limit;
  const message = canCreate ? '' : createMessage;

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
