import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistedState } from 'redux-persist';
import { v4 as uuid } from 'uuid';
import {
  DEFAULT_GRIMOIRE_ID,
  PocketGrimoire,
  PocketGrimoireState,
} from '../../../interfaces/PocketGrimoire';
import {
  createInitialState,
  ensureValidState,
  normalizeGrimoireName,
  uniqueGrimoireName,
} from '../../../functions/pocketGrimoire/state';

const NEW_GRIMOIRE_NAME = 'Novo grimório';
const IMPORTED_GRIMOIRE_NAME = 'Grimório importado';

interface ItemPayload {
  grimoireId: string;
  itemId: string;
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
    deleteGrimoire(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (id !== DEFAULT_GRIMOIRE_ID) {
        state.grimoires = state.grimoires.filter((g) => g.id !== id);
        if (state.activeId === id) state.activeId = DEFAULT_GRIMOIRE_ID;
      }
    },
    setActive(state, action: PayloadAction<string>) {
      if (findGrimoire(state, action.payload)) {
        state.activeId = action.payload;
      }
    },
  },
});

export const {
  addItem,
  removeItem,
  createGrimoire,
  importGrimoire,
  renameGrimoire,
  duplicateGrimoire,
  deleteGrimoire,
  setActive,
} = pocketGrimoireSlice.actions;

export default pocketGrimoireSlice.reducer;

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
