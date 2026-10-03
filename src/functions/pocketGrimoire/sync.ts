import {
  DEFAULT_GRIMOIRE_ID,
  DEFAULT_GRIMOIRE_NAME,
  PocketGrimoire,
  PocketGrimoireState,
  PocketGrimoireSyncState,
} from '../../interfaces/PocketGrimoire';
import { ensureValidState } from './state';

/**
 * Regras puras do sync dos grimórios com a conta. O slice e o motor
 * (`store/slices/pocketGrimoire/syncEngine.ts`) só chamam estas funções.
 */

export interface GrimoireSyncPayload {
  upserts: PocketGrimoire[];
  deletes: string[];
  merge: boolean;
}

/** Resposta do sync: a lista da conta e os novos recusados por limite. */
export interface GrimoireSyncResult {
  grimoires: PocketGrimoire[];
  rejectedIds: string[];
  /** `maxPocketGrimoires` efetivo do plano (`-1` = ilimitado). */
  maxGrimoires: number;
}

const isDirty = (sync: PocketGrimoireSyncState, id: string) =>
  Object.prototype.hasOwnProperty.call(sync.dirty, id);

/** O "Padrão" que ninguém tocou não vale ser enviado para a conta. */
export const isPristineDefault = (grimoire: PocketGrimoire): boolean =>
  grimoire.id === DEFAULT_GRIMOIRE_ID &&
  grimoire.name === DEFAULT_GRIMOIRE_NAME &&
  grimoire.itemIds.length === 0;

export const hasPendingChanges = (sync: PocketGrimoireSyncState): boolean =>
  sync.pendingMerge ||
  sync.deletedIds.length > 0 ||
  Object.keys(sync.dirty).length > 0;

/** Muda sempre que surge algo novo a enviar (ou algo é confirmado). */
export const pendingKey = (sync: PocketGrimoireSyncState): string =>
  JSON.stringify([sync.pendingMerge, sync.deletedIds, sync.dirty]);

/**
 * Compara as listas por referência (o Immer preserva os objetos não
 * tocados): referência nova = pendente; sumiu = exclusão pendente.
 */
export function trackChanges(
  sync: PocketGrimoireSyncState,
  before: PocketGrimoire[],
  after: PocketGrimoire[]
): PocketGrimoireSyncState {
  if (before === after) return sync;
  const beforeById = new Map(before.map((g) => [g.id, g]));
  const afterIds = new Set(after.map((g) => g.id));
  const dirty = { ...sync.dirty };
  const deleted = new Set(sync.deletedIds);
  let changed = false;

  after.forEach((g) => {
    if (beforeById.get(g.id) !== g) {
      dirty[g.id] = g.updatedAt;
      deleted.delete(g.id);
      changed = true;
    }
  });
  before.forEach((g) => {
    if (!afterIds.has(g.id)) {
      delete dirty[g.id];
      deleted.add(g.id);
      changed = true;
    }
  });

  return changed ? { ...sync, dirty, deletedIds: Array.from(deleted) } : sync;
}

/** Login: a cópia passa a ser da conta e tudo o que importa fica pendente. */
export function claimForUser(
  state: PocketGrimoireState,
  userId: string
): PocketGrimoireState {
  const dirty: Record<string, string> = {};
  state.grimoires
    .filter((g) => !isPristineDefault(g))
    .forEach((g) => {
      dirty[g.id] = g.updatedAt;
    });
  return {
    ...state,
    sync: {
      ownerId: userId,
      dirty,
      deletedIds: [],
      pendingMerge: true,
      rejectedIds: [],
    },
  };
}

export function buildSyncPayload(
  state: PocketGrimoireState
): GrimoireSyncPayload {
  const { sync } = state;
  return {
    upserts: state.grimoires.filter((g) => isDirty(sync, g.id)),
    deletes: [...sync.deletedIds],
    merge: sync.pendingMerge,
  };
}

/**
 * Tira das pendências só o que o servidor confirmou: um grimório editado de
 * novo durante a requisição (outro `updatedAt`) continua pendente.
 * `rejectedIds` é a lista inteira de recusados: todo envio leva todos os
 * pendentes, inclusive os recusados antes.
 */
export function markSynced(
  sync: PocketGrimoireSyncState,
  sent: Record<string, string>,
  sentDeletes: string[],
  rejectedIds: string[] = []
): PocketGrimoireSyncState {
  const dirty = { ...sync.dirty };
  Object.entries(sent).forEach(([id, updatedAt]) => {
    if (dirty[id] === updatedAt) delete dirty[id];
  });
  const acked = new Set(sentDeletes);
  return {
    ...sync,
    dirty,
    deletedIds: sync.deletedIds.filter((id) => !acked.has(id)),
    pendingMerge: false,
    rejectedIds,
  };
}

/**
 * A lista do servidor vira o estado, exceto: pendentes mantêm a versão
 * local, exclusões não enviadas não voltam, e pendentes que o servidor ainda
 * não conhece continuam. O resto que sumiu foi excluído em outro dispositivo.
 */
export function applyRemote(
  state: PocketGrimoireState,
  remote: PocketGrimoire[],
  now: string
): PocketGrimoireState {
  const { sync } = state;
  const localById = new Map(state.grimoires.map((g) => [g.id, g]));
  const deleted = new Set(sync.deletedIds);
  const remoteIds = new Set(remote.map((g) => g.id));

  const merged = [
    ...remote
      .filter((g) => !deleted.has(g.id))
      .map((g) => (isDirty(sync, g.id) ? localById.get(g.id) ?? g : g)),
    ...state.grimoires.filter(
      (g) => isDirty(sync, g.id) && !remoteIds.has(g.id)
    ),
  ];

  return ensureValidState(
    { grimoires: merged, activeId: state.activeId, sync },
    now
  );
}
