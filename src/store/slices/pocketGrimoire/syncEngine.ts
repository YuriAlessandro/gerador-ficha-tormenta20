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
  GrimoireSyncResult,
  hasPendingChanges,
  isPristineDefault,
  pendingKey,
} from '../../../functions/pocketGrimoire/sync';
import { GrimoireSyncError } from '../../../functions/pocketGrimoire/syncError';
import {
  effectiveGrimoireLimit,
  grimoireLimitMessage,
} from '../../../functions/pocketGrimoire/limit';
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

export const REJECTED_MESSAGE =
  'Não foi possível salvar seus grimórios na conta.';

export const mergeMessage = (count: number): string =>
  count === 1
    ? '1 grimório deste navegador foi salvo na sua conta.'
    : `${count} grimórios deste navegador foram salvos na sua conta.`;

export interface GrimoireSyncService {
  getAll: () => Promise<PocketGrimoire[]>;
  sync: (payload: GrimoireSyncPayload) => Promise<GrimoireSyncResult>;
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
  /**
   * Antes do "Sair": envia já o que estiver pendente (sem esperar o
   * debounce). `true` se nada ficou para trás.
   */
  flush: () => Promise<boolean>;
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
  let inFlight: Promise<void> | null = null;
  let runAgain = false;
  let disposed = false;
  let lastSync: PocketGrimoireSyncState | null = null;
  let lastGrimoires: PocketGrimoire[] | null = null;
  let lastKey = '';
  let lastAttempt = 0;
  let announceCount = 0;
  /** Último conjunto de recusados por limite já avisado (evita repetir). */
  let announcedRejected = '';

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
    if (kind === 'rejected') deps.notify(REJECTED_MESSAGE, 'error');
  };

  /**
   * Novos recusados por limite ficam pendentes no navegador. Se só eles
   * sobraram, não reenvia sozinho: espera uma mudança (ex.: excluir outro).
   */
  const holdRejected = (rejected: string[], maxGrimoires: number) => {
    const rejectedSet = new Set(rejected);
    const { sync } = deps.getState();
    const onlyRejected =
      !sync.pendingMerge &&
      sync.deletedIds.length === 0 &&
      Object.keys(sync.dirty).every((id) => rejectedSet.has(id));
    if (onlyRejected) {
      cancelTimer();
      lastSync = sync;
      lastKey = pendingKey(sync);
    }
    deps.setStatus('error');
    const key = [...rejected].sort().join('|');
    if (key !== announcedRejected) {
      announcedRejected = key;
      deps.notify(
        grimoireLimitMessage(effectiveGrimoireLimit(maxGrimoires)),
        'error'
      );
    }
  };

  /** Uma requisição: envia as pendências, ou busca a lista. Nunca rejeita. */
  const execute = async (requestUser: string): Promise<void> => {
    const state = deps.getState();
    const payload = hasPendingChanges(state.sync)
      ? buildSyncPayload(state)
      : null;
    const sent = { ...state.sync.dirty };
    lastAttempt = now();
    deps.setStatus('syncing');

    try {
      let remote: PocketGrimoire[];
      let rejected: string[] = [];
      let maxGrimoires = -1;
      if (payload) {
        const result = await deps.service.sync(payload);
        remote = result.grimoires;
        rejected = result.rejectedIds;
        maxGrimoires = result.maxGrimoires;
      } else {
        remote = await deps.service.getAll();
      }
      // Logout ou troca de conta durante a requisição: a resposta é velha.
      if (
        userId !== requestUser ||
        deps.getState().sync.ownerId !== requestUser
      ) {
        return;
      }
      if (payload) {
        const confirmed = { ...sent };
        rejected.forEach((id) => {
          delete confirmed[id];
        });
        deps.dispatch(
          markSynced({ sent: confirmed, deletedIds: payload.deletes })
        );
      }
      deps.dispatch(applyRemote(remote));
      if (rejected.length > 0) {
        holdRejected(rejected, maxGrimoires);
      } else {
        announcedRejected = '';
        deps.setStatus('idle');
      }
      if (payload?.merge) {
        if (announceCount > 0) {
          deps.notify(mergeMessage(announceCount), 'success');
        }
        announceCount = 0;
      }
    } catch (error) {
      if (userId === requestUser) handleError(error);
    }
  };

  /** Uma requisição por vez: o que chega durante uma vai na seguinte. */
  const run = (): Promise<void> => {
    if (!userId || !active || disposed) return Promise.resolve();
    if (inFlight) {
      runAgain = true;
      return inFlight;
    }
    cancelTimer();
    inFlight = execute(userId).finally(() => {
      inFlight = null;
      if (runAgain) {
        runAgain = false;
        run();
      }
    });
    return inFlight;
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

    async flush() {
      const settled = () => !hasPendingChanges(deps.getState().sync);
      if (!userId || !active) return settled();
      // Requisição em voo (e a que ela encadear): espera terminar.
      while (inFlight) {
        // eslint-disable-next-line no-await-in-loop
        await inFlight;
      }
      if (!settled()) await run();
      return settled();
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
