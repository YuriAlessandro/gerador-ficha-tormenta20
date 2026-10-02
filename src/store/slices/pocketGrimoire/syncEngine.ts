import { AnyAction } from '@reduxjs/toolkit';
import {
  GrimoireSyncStatus,
  PocketGrimoire,
  PocketGrimoireState,
  PocketGrimoireSyncState,
} from '../../../interfaces/PocketGrimoire';
import {
  buildSyncPayload,
  GrimoireSyncPayload,
  hasPendingChanges,
  isPristineDefault,
  pendingKey,
} from '../../../functions/pocketGrimoire/sync';
import {
  GRIMOIRE_LIMIT_CODE,
  GrimoireSyncError,
} from '../../../functions/pocketGrimoire/syncError';
import {
  applyRemote,
  claimForUser,
  markSynced,
  resetToAnonymous,
} from './pocketGrimoireSlice';

/**
 * Motor do sync dos grimórios com a conta, sem React: o hook
 * `usePocketGrimoireSync` só o liga à store, à auth e aos eventos da janela.
 *
 * Logado, o motor começa inativo (nenhuma requisição) e só ativa para quem
 * usa o grimório: cópia desta conta já no navegador, algo para juntar no
 * login, página do grimório aberta (`activate`) ou a primeira edição.
 */

export const SYNC_DEBOUNCE_MS = 1000;
export const REFRESH_INTERVAL_MS = 60_000;

export const LIMIT_MESSAGE =
  'Sua conta chegou ao limite de 100 grimórios. Exclua algum para salvar os novos.';
export const REJECTED_MESSAGE =
  'Não foi possível salvar seus grimórios na conta.';

export const mergeMessage = (count: number): string =>
  count === 1
    ? '1 grimório deste navegador foi salvo na sua conta.'
    : `${count} grimórios deste navegador foram salvos na sua conta.`;

export interface GrimoireSyncService {
  getAll: () => Promise<PocketGrimoire[]>;
  sync: (payload: GrimoireSyncPayload) => Promise<PocketGrimoire[]>;
}

export interface SyncEngineDeps {
  getState: () => PocketGrimoireState;
  dispatch: (action: AnyAction) => unknown;
  service: GrimoireSyncService;
  setStatus: (status: GrimoireSyncStatus) => void;
  notify: (message: string, variant: 'success' | 'error') => void;
  now?: () => number;
}

export interface SyncEngine {
  /** Auth resolvida: o id do usuário logado, ou `null`. */
  setUser: (userId: string | null) => void;
  /** Uso do grimório (página aberta): liga o sync para o usuário logado. */
  activate: () => void;
  onStoreChange: () => void;
  onOnline: () => void;
  onVisible: () => void;
  /** Logout explícito (botão "Sair"). */
  onLogout: () => void;
  dispose: () => void;
}

const hasSomethingToMerge = (state: PocketGrimoireState) =>
  state.grimoires.some((g) => !isPristineDefault(g));

export function createSyncEngine(deps: SyncEngineDeps): SyncEngine {
  const now = deps.now ?? Date.now;
  let userId: string | null = null;
  let active = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let runAgain = false;
  let disposed = false;
  let lastSync: PocketGrimoireSyncState | null = null;
  let lastGrimoires: PocketGrimoire[] | null = null;
  let lastKey = '';
  let lastAttempt = 0;
  let announceCount = 0;

  const cancelTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const handleError = (error: unknown) => {
    const kind = error instanceof GrimoireSyncError ? error.kind : 'network';
    if (kind === 'network') {
      deps.setStatus('offline');
      return;
    }
    deps.setStatus('error');
    if (kind === 'rejected') {
      const limit =
        error instanceof GrimoireSyncError &&
        error.code === GRIMOIRE_LIMIT_CODE;
      deps.notify(limit ? LIMIT_MESSAGE : REJECTED_MESSAGE, 'error');
    }
  };

  const run = async (): Promise<void> => {
    if (!userId || !active || disposed) return;
    if (inFlight) {
      runAgain = true;
      return;
    }
    cancelTimer();

    const requestUser = userId;
    const state = deps.getState();
    const payload = hasPendingChanges(state.sync)
      ? buildSyncPayload(state)
      : null;
    const sent = { ...state.sync.dirty };
    inFlight = true;
    lastAttempt = now();
    deps.setStatus('syncing');

    try {
      const remote = payload
        ? await deps.service.sync(payload)
        : await deps.service.getAll();
      // Logout ou troca de conta durante a requisição: a resposta é velha.
      if (
        userId !== requestUser ||
        deps.getState().sync.ownerId !== requestUser
      ) {
        return;
      }
      if (payload) {
        deps.dispatch(markSynced({ sent, deletedIds: payload.deletes }));
      }
      deps.dispatch(applyRemote(remote));
      deps.setStatus('idle');
      if (payload?.merge) {
        if (announceCount > 0) {
          deps.notify(mergeMessage(announceCount), 'success');
        }
        announceCount = 0;
      }
    } catch (error) {
      if (userId === requestUser) handleError(error);
    } finally {
      inFlight = false;
      if (runAgain) {
        runAgain = false;
        run();
      }
    }
  };

  const schedule = () => {
    cancelTimer();
    timer = setTimeout(() => {
      timer = null;
      run();
    }, SYNC_DEBOUNCE_MS);
  };

  /** `fromLogin`: só a ativação no login anuncia o merge. */
  const activate = (fromLogin: boolean) => {
    if (!userId || active || disposed) return;
    active = true;
    if (deps.getState().sync.ownerId !== userId) {
      deps.dispatch(claimForUser(userId));
      announceCount = fromLogin
        ? Object.keys(deps.getState().sync.dirty).length
        : 0;
    }
    lastSync = deps.getState().sync;
    lastKey = pendingKey(lastSync);
    run();
  };

  return {
    setUser(next) {
      if (next === userId) return;
      userId = next;
      active = false;
      announceCount = 0;
      cancelTimer();
      if (!next) {
        // Saída involuntária: não apaga nada (ver spec, "Saída involuntária").
        deps.setStatus('idle');
        return;
      }
      const owner = deps.getState().sync.ownerId;
      // A cópia de outra conta não fica à mostra nem é juntada.
      if (owner !== null && owner !== next) {
        deps.dispatch(resetToAnonymous());
      }
      const state = deps.getState();
      lastGrimoires = state.grimoires;
      if (state.sync.ownerId === next || hasSomethingToMerge(state)) {
        activate(true);
      }
    },

    activate() {
      activate(false);
    },

    onStoreChange() {
      if (!userId) return;
      const state = deps.getState();
      if (!active) {
        // Primeira edição feita logado: ativa.
        if (state.grimoires !== lastGrimoires) {
          lastGrimoires = state.grimoires;
          if (hasSomethingToMerge(state)) activate(false);
        }
        return;
      }
      const { sync } = state;
      if (sync === lastSync) return;
      const key = pendingKey(sync);
      lastSync = sync;
      if (key === lastKey) return;
      lastKey = key;
      if (hasPendingChanges(sync)) schedule();
    },

    onOnline() {
      run();
    },

    onVisible() {
      if (now() - lastAttempt >= REFRESH_INTERVAL_MS) run();
    },

    onLogout() {
      userId = null;
      active = false;
      announceCount = 0;
      cancelTimer();
      deps.dispatch(resetToAnonymous());
      deps.setStatus('idle');
    },

    dispose() {
      disposed = true;
      cancelTimer();
    },
  };
}
