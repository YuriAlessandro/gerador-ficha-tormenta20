import { createSlice, current, PayloadAction, Reducer } from '@reduxjs/toolkit';
import { PersistedState } from 'redux-persist';
import { v4 as uuid } from 'uuid';
import {
  PocketGrimoire,
  PocketGrimoireState,
} from '../../../interfaces/PocketGrimoire';
import {
  createInitialState,
  ensureValidState,
  normalizeGrimoireName,
  uniqueGrimoireName,
} from '../../../functions/pocketGrimoire/state';
import {
  applyRemote as applyRemoteState,
  claimForUser as claimForUserState,
  hasPendingChanges,
  markSynced as markSyncedState,
  trackChanges,
} from '../../../functions/pocketGrimoire/sync';

const NEW_GRIMOIRE_NAME = 'Novo grimório';
const IMPORTED_GRIMOIRE_NAME = 'Grimório importado';

interface ItemPayload {
  grimoireId: string;
  itemId: string;
  now: string;
}

interface MovePayload {
  itemId: string;
  fromId: string;
  toId: string;
  now: string;
}

interface NewGrimoirePayload {
  id: string;
  now: string;
  name: string;
  itemIds: string[];
}

interface RenamePayload {
  id: string;
  name: string;
  now: string;
}

interface ReplacePayload {
  id: string;
  itemIds: string[];
  now: string;
}

interface ApplyRemotePayload {
  grimoires: PocketGrimoire[];
  now: string;
}

interface MarkSyncedPayload {
  sent: Record<string, string>;
  deletedIds: string[];
  /** Recusados por limite na resposta. */
  rejectedIds?: string[];
}

interface DuplicatePayload {
  id: string;
  now: string;
  sourceId: string;
}

const isoNow = () => new Date().toISOString();

const findGrimoire = (state: PocketGrimoireState, id: string) =>
  state.grimoires.find((g) => g.id === id);

const namesExcept = (state: PocketGrimoireState, exceptId?: string) =>
  state.grimoires.filter((g) => g.id !== exceptId).map((g) => g.name);

const pushGrimoire = (
  state: PocketGrimoireState,
  { id, now, name, itemIds }: NewGrimoirePayload,
  fallbackName: string
) => {
  const grimoire: PocketGrimoire = {
    id,
    name: uniqueGrimoireName(
      normalizeGrimoireName(name) ?? fallbackName,
      namesExcept(state)
    ),
    itemIds: Array.from(new Set(itemIds)),
    createdAt: now,
    updatedAt: now,
  };
  state.grimoires.push(grimoire);
};

export const pocketGrimoireSlice = createSlice({
  name: 'pocketGrimoire',
  initialState: () => createInitialState(),
  reducers: {
    addItem: {
      reducer(state, action: PayloadAction<ItemPayload>) {
        const { grimoireId, itemId, now } = action.payload;
        const grimoire = findGrimoire(state, grimoireId);
        if (grimoire && !grimoire.itemIds.includes(itemId)) {
          grimoire.itemIds.push(itemId);
          grimoire.updatedAt = now;
        }
      },
      prepare(grimoireId: string, itemId: string) {
        return { payload: { grimoireId, itemId, now: isoNow() } };
      },
    },
    removeItem: {
      reducer(state, action: PayloadAction<ItemPayload>) {
        const { grimoireId, itemId, now } = action.payload;
        const grimoire = findGrimoire(state, grimoireId);
        if (grimoire && grimoire.itemIds.includes(itemId)) {
          grimoire.itemIds = grimoire.itemIds.filter((id) => id !== itemId);
          grimoire.updatedAt = now;
        }
      },
      prepare(grimoireId: string, itemId: string) {
        return { payload: { grimoireId, itemId, now: isoNow() } };
      },
    },
    /**
     * "Trocar" do aviso de adição: o item muda de grimório e o destino vira
     * o ativo, para que os próximos cliques no marcador já caiam nele.
     */
    moveItem: {
      reducer(state, action: PayloadAction<MovePayload>) {
        const { itemId, fromId, toId, now } = action.payload;
        const to = findGrimoire(state, toId);
        if (!to) return;
        state.activeId = toId;
        if (fromId === toId) return;
        const from = findGrimoire(state, fromId);
        if (from && from.itemIds.includes(itemId)) {
          from.itemIds = from.itemIds.filter((id) => id !== itemId);
          from.updatedAt = now;
        }
        if (!to.itemIds.includes(itemId)) {
          to.itemIds.push(itemId);
          to.updatedAt = now;
        }
      },
      prepare(itemId: string, fromId: string, toId: string) {
        return { payload: { itemId, fromId, toId, now: isoNow() } };
      },
    },
    createGrimoire: {
      reducer(state, action: PayloadAction<NewGrimoirePayload>) {
        pushGrimoire(state, action.payload, NEW_GRIMOIRE_NAME);
      },
      prepare(name = '') {
        return {
          payload: { id: uuid(), now: isoNow(), name, itemIds: [] as string[] },
        };
      },
    },
    importGrimoire: {
      reducer(state, action: PayloadAction<NewGrimoirePayload>) {
        pushGrimoire(state, action.payload, IMPORTED_GRIMOIRE_NAME);
      },
      prepare(name: string, itemIds: string[]) {
        return { payload: { id: uuid(), now: isoNow(), name, itemIds } };
      },
    },
    renameGrimoire: {
      reducer(state, action: PayloadAction<RenamePayload>) {
        const { id, name, now } = action.payload;
        const grimoire = findGrimoire(state, id);
        const normalized = normalizeGrimoireName(name);
        if (grimoire && normalized) {
          grimoire.name = uniqueGrimoireName(
            normalized,
            namesExcept(state, id)
          );
          grimoire.updatedAt = now;
        }
      },
      prepare(id: string, name: string) {
        return { payload: { id, name, now: isoNow() } };
      },
    },
    duplicateGrimoire: {
      reducer(state, action: PayloadAction<DuplicatePayload>) {
        const { id, now, sourceId } = action.payload;
        const source = findGrimoire(state, sourceId);
        if (source) {
          pushGrimoire(
            state,
            {
              id,
              now,
              name: `${source.name} (cópia)`,
              itemIds: [...source.itemIds],
            },
            NEW_GRIMOIRE_NAME
          );
        }
      },
      prepare(sourceId: string) {
        return { payload: { id: uuid(), now: isoNow(), sourceId } };
      },
    },
    /** "Importar e substituir": troca os itens, mantém nome e id. */
    replaceItems: {
      reducer(state, action: PayloadAction<ReplacePayload>) {
        const { id, itemIds, now } = action.payload;
        const grimoire = findGrimoire(state, id);
        if (grimoire) {
          grimoire.itemIds = Array.from(new Set(itemIds));
          grimoire.updatedAt = now;
        }
      },
      prepare(id: string, itemIds: string[]) {
        return { payload: { id, itemIds, now: isoNow() } };
      },
    },
    deleteGrimoire(state, action: PayloadAction<string>) {
      const id = action.payload;
      // Sempre sobra pelo menos um grimório.
      if (state.grimoires.length > 1 && findGrimoire(state, id)) {
        state.grimoires = state.grimoires.filter((g) => g.id !== id);
        if (state.activeId === id) state.activeId = state.grimoires[0].id;
      }
    },
    setActive(state, action: PayloadAction<string>) {
      if (findGrimoire(state, action.payload)) {
        state.activeId = action.payload;
      }
    },
    /** Login: a cópia passa a ser da conta (ver `functions/pocketGrimoire/sync`). */
    claimForUser(state, action: PayloadAction<string>) {
      return claimForUserState(current(state), action.payload);
    },
    applyRemote: {
      reducer(state, action: PayloadAction<ApplyRemotePayload>) {
        const { grimoires, now } = action.payload;
        return applyRemoteState(current(state), grimoires, now);
      },
      prepare(grimoires: PocketGrimoire[]) {
        return { payload: { grimoires, now: isoNow() } };
      },
    },
    markSynced(state, action: PayloadAction<MarkSyncedPayload>) {
      const { sent, deletedIds, rejectedIds } = action.payload;
      state.sync = markSyncedState(
        current(state).sync,
        sent,
        deletedIds,
        rejectedIds
      );
    },
    /** Logout explícito: o navegador volta ao zero. */
    resetToAnonymous: {
      reducer(_state, action: PayloadAction<string>) {
        return createInitialState(action.payload);
      },
      prepare() {
        return { payload: isoNow() };
      },
    },
  },
});

export const {
  addItem,
  removeItem,
  moveItem,
  createGrimoire,
  importGrimoire,
  renameGrimoire,
  duplicateGrimoire,
  replaceItems,
  deleteGrimoire,
  setActive,
  claimForUser,
  applyRemote,
  markSynced,
  resetToAnonymous,
} = pocketGrimoireSlice.actions;

const SYNC_ACTION_TYPES = new Set<string>([
  claimForUser.type,
  applyRemote.type,
  markSynced.type,
  resetToAnonymous.type,
]);

/**
 * Envolve o reducer para registrar o que precisa ir para a conta, sem mexer
 * nos reducers de edição: compara a lista antes/depois de cada ação.
 * Só atua numa cópia da conta (`ownerId` definido).
 */
export const withSyncTracking =
  (reducer: Reducer<PocketGrimoireState>): Reducer<PocketGrimoireState> =>
  (state, action) => {
    const next = reducer(state, action);
    if (
      !state ||
      next === state ||
      next.sync.ownerId === null ||
      SYNC_ACTION_TYPES.has(action.type)
    ) {
      return next;
    }
    const sync = trackChanges(next.sync, state.grimoires, next.grimoires);
    return sync === next.sync ? next : { ...next, sync };
  };

export default withSyncTracking(pocketGrimoireSlice.reducer);

/** Formato mínimo que os selectors precisam (RootState ou store de teste). */
export interface WithPocketGrimoire {
  pocketGrimoire: PocketGrimoireState;
}

export const selectGrimoires = (state: WithPocketGrimoire) =>
  state.pocketGrimoire.grimoires;

export const selectActiveId = (state: WithPocketGrimoire) =>
  state.pocketGrimoire.activeId;

export const selectActiveGrimoire = (
  state: WithPocketGrimoire
): PocketGrimoire =>
  findGrimoire(state.pocketGrimoire, state.pocketGrimoire.activeId) ??
  state.pocketGrimoire.grimoires[0];

export const selectGrimoireById =
  (id: string | undefined) =>
  (state: WithPocketGrimoire): PocketGrimoire | undefined =>
    id === undefined ? undefined : findGrimoire(state.pocketGrimoire, id);

export const selectGrimoireSync = (state: WithPocketGrimoire) =>
  state.pocketGrimoire.sync;

export const selectHasPendingGrimoireChanges = (state: WithPocketGrimoire) =>
  hasPendingChanges(state.pocketGrimoire.sync);

/**
 * `migrate` do redux-persist: o localStorage é entrada externa (outra versão
 * do app, edição manual), então o que chega passa por `ensureValidState`
 * antes de virar estado. O spread preserva a chave de controle do persist.
 */
export const migratePocketGrimoire = (
  state: PersistedState
): Promise<PersistedState> =>
  Promise.resolve(
    state ? ({ ...state, ...ensureValidState(state) } as PersistedState) : state
  );
