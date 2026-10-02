import { useEffect, useRef } from 'react';
import { useSelector, useStore } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAppDispatch } from '../../store/hooks';
import {
  createSyncEngine,
  GrimoireSyncService,
  SyncEngine,
} from '../../store/slices/pocketGrimoire/syncEngine';
import {
  requestGrimoireSync,
  selectGrimoireSyncRequested,
  setSyncStatus,
  WithGrimoireSyncStatus,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSyncStatusSlice';
import { WithPocketGrimoire } from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { hasPendingChanges } from '../../functions/pocketGrimoire/sync';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

const LOGOUT_CHECK_ID = 'pocketGrimoire';

export const PENDING_LOGOUT_MESSAGE =
  'Alguns grimórios têm alterações que ainda não chegaram à sua conta. Se sair agora, elas serão perdidas.';

/** Liga o motor de sync à store, à auth e aos eventos da janela. */
export function usePocketGrimoireSync(service: GrimoireSyncService): void {
  const store = useStore<WithPocketGrimoire>();
  const { enqueueSnackbar } = useSnackbar();
  const { loading, isAuthenticated, userId } = useAuth();
  const { registerLogoutCheck, unregisterLogoutCheck } = useAuthContext();
  const requested = useSelector((state: WithGrimoireSyncStatus) =>
    selectGrimoireSyncRequested(state)
  );
  const engineRef = useRef<SyncEngine | null>(null);

  // `undefined` enquanto a auth não resolveu.
  let resolvedUser: string | null | undefined;
  if (!loading) resolvedUser = isAuthenticated && userId ? userId : null;
  const userRef = useRef(resolvedUser);
  userRef.current = resolvedUser;

  useEffect(() => {
    const engine = createSyncEngine({
      getState: () => store.getState().pocketGrimoire,
      dispatch: store.dispatch,
      service,
      setStatus: (status) => store.dispatch(setSyncStatus(status)),
      notify: (message, variant) =>
        enqueueSnackbar(message, { ...GRIMOIRE_SNACKBAR, variant }),
    });
    engineRef.current = engine;
    if (userRef.current !== undefined) engine.setUser(userRef.current);

    const unsubscribe = store.subscribe(() => engine.onStoreChange());
    const handleOnline = () => engine.onOnline();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') engine.onVisible();
    };
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
      engine.dispose();
      engineRef.current = null;
    };
  }, [store, service, enqueueSnackbar]);

  useEffect(() => {
    if (resolvedUser !== undefined) engineRef.current?.setUser(resolvedUser);
  }, [resolvedUser]);

  useEffect(() => {
    if (requested && resolvedUser) engineRef.current?.activate();
  }, [requested, resolvedUser]);

  useEffect(() => {
    registerLogoutCheck(LOGOUT_CHECK_ID, {
      message: PENDING_LOGOUT_MESSAGE,
      check: () => hasPendingChanges(store.getState().pocketGrimoire.sync),
      onLogout: () => engineRef.current?.onLogout(),
    });
    return () => unregisterLogoutCheck(LOGOUT_CHECK_ID);
  }, [store, registerLogoutCheck, unregisterLogoutCheck]);
}

/** Páginas do grimório: pedem que o sync com a conta seja ativado. */
export function useRequestGrimoireSync(): void {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(requestGrimoireSync());
  }, [dispatch]);
}
