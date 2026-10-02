import {
  DEFAULT_GRIMOIRE_ID,
  DEFAULT_GRIMOIRE_NAME,
  GRIMOIRE_NAME_MAX_LENGTH,
  PocketGrimoire,
  PocketGrimoireState,
  PocketGrimoireSyncState,
} from '../../interfaces/PocketGrimoire';

const UNNAMED_GRIMOIRE = 'Grimório sem nome';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const createAnonymousSync = (): PocketGrimoireSyncState => ({
  ownerId: null,
  dirty: {},
  deletedIds: [],
  pendingMerge: false,
});

export function createDefaultGrimoire(now: string): PocketGrimoire {
  return {
    id: DEFAULT_GRIMOIRE_ID,
    name: DEFAULT_GRIMOIRE_NAME,
    itemIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createInitialState(
  now: string = new Date().toISOString()
): PocketGrimoireState {
  return {
    grimoires: [createDefaultGrimoire(now)],
    activeId: DEFAULT_GRIMOIRE_ID,
    sync: createAnonymousSync(),
  };
}

/** Nome limpo (aparado, espaços colapsados, até 60 caracteres) ou `null`. */
export function normalizeGrimoireName(raw: string): string | null {
  const name = raw
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, GRIMOIRE_NAME_MAX_LENGTH)
    .trim();
  return name.length > 0 ? name : null;
}

/**
 * Evita dois grimórios com o mesmo nome (sem diferenciar maiúsculas):
 * "Mago" já existe → "Mago (2)", "Mago (3)"… sempre dentro do limite de
 * tamanho.
 */
export function uniqueGrimoireName(base: string, taken: string[]): string {
  const key = (name: string) => name.toLocaleLowerCase('pt-BR');
  const takenKeys = new Set(taken.map(key));
  if (!takenKeys.has(key(base))) return base;

  const withSuffix = (n: number) => {
    const suffix = ` (${n})`;
    const room = GRIMOIRE_NAME_MAX_LENGTH - suffix.length;
    return `${base.slice(0, room).trimEnd()}${suffix}`;
  };

  let n = 2;
  while (takenKeys.has(key(withSuffix(n)))) n += 1;
  return withSuffix(n);
}

function sanitizeGrimoire(raw: unknown, now: string): PocketGrimoire | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || raw.id.length === 0) {
    return null;
  }
  const name =
    typeof raw.name === 'string' ? normalizeGrimoireName(raw.name) : null;
  const rawItems = Array.isArray(raw.itemIds) ? raw.itemIds : [];
  const itemIds = Array.from(
    new Set(
      rawItems.filter(
        (item): item is string => typeof item === 'string' && item.length > 0
      )
    )
  );
  const fallbackName =
    raw.id === DEFAULT_GRIMOIRE_ID ? DEFAULT_GRIMOIRE_NAME : UNNAMED_GRIMOIRE;

  return {
    id: raw.id,
    name: name ?? fallbackName,
    itemIds,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}

/**
 * Pendências só fazem sentido numa cópia da conta. Ids de `dirty` precisam
 * existir na lista; ids de `deletedIds`, não.
 */
function sanitizeSync(
  raw: unknown,
  grimoireIds: Set<string>
): PocketGrimoireSyncState {
  if (
    !isRecord(raw) ||
    typeof raw.ownerId !== 'string' ||
    raw.ownerId.length === 0
  ) {
    return createAnonymousSync();
  }
  const dirty: Record<string, string> = {};
  if (isRecord(raw.dirty)) {
    Object.entries(raw.dirty).forEach(([id, updatedAt]) => {
      if (grimoireIds.has(id) && typeof updatedAt === 'string') {
        dirty[id] = updatedAt;
      }
    });
  }
  const rawDeleted = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
  const deletedIds = Array.from(
    new Set(
      rawDeleted.filter(
        (id): id is string =>
          typeof id === 'string' && id.length > 0 && !grimoireIds.has(id)
      )
    )
  );
  return {
    ownerId: raw.ownerId,
    dirty,
    deletedIds,
    pendingMerge: raw.pendingMerge === true,
  };
}

/**
 * Transforma qualquer coisa vinda de fora (localStorage, versão antiga do app,
 * edição manual) num estado que respeita as invariantes: existe pelo menos um
 * grimório, o ativo existe, nenhum id se repete e as pendências de sync são
 * coerentes.
 */
export function ensureValidState(
  input: unknown,
  now: string = new Date().toISOString()
): PocketGrimoireState {
  const rawList =
    isRecord(input) && Array.isArray(input.grimoires) ? input.grimoires : [];

  const seen = new Set<string>();
  const grimoires: PocketGrimoire[] = [];
  rawList.forEach((raw) => {
    const grimoire = sanitizeGrimoire(raw, now);
    if (grimoire && !seen.has(grimoire.id)) {
      seen.add(grimoire.id);
      grimoires.push(grimoire);
    }
  });

  // Sempre há pelo menos um grimório — e ele nasce como o "Padrão".
  if (grimoires.length === 0) grimoires.push(createDefaultGrimoire(now));

  const requestedActive = isRecord(input) ? input.activeId : undefined;
  const activeId =
    typeof requestedActive === 'string' &&
    grimoires.some((g) => g.id === requestedActive)
      ? requestedActive
      : grimoires[0].id;

  const sync = sanitizeSync(
    isRecord(input) ? input.sync : undefined,
    new Set(grimoires.map((g) => g.id))
  );

  return { grimoires, activeId, sync };
}
