import axios from 'axios';
import api from './api';
import { PocketGrimoire } from '../interfaces/PocketGrimoire';
import { GrimoireSyncPayload } from '../functions/pocketGrimoire/sync';
import { GrimoireSyncError } from '../functions/pocketGrimoire/syncError';

/**
 * Único lugar que conhece o formato da API dos grimórios. Localmente o
 * grimório guarda `itemIds`; na API e no banco são `items: [{ itemId }]`,
 * para caber campos por item no futuro.
 */

const BASE_URL = '/api/pocket-grimoires';

export interface ApiGrimoire {
  grimoireId: string;
  name: string;
  items: { itemId: string }[];
  createdAt: string;
  updatedAt: string;
}

interface GrimoireListResponse {
  success: boolean;
  data: ApiGrimoire[];
  count: number;
}

export const toApiGrimoire = ({
  id,
  name,
  itemIds,
  createdAt,
  updatedAt,
}: PocketGrimoire): ApiGrimoire => ({
  grimoireId: id,
  name,
  items: itemIds.map((itemId) => ({ itemId })),
  createdAt,
  updatedAt,
});

export const fromApiGrimoire = ({
  grimoireId,
  name,
  items,
  createdAt,
  updatedAt,
}: ApiGrimoire): PocketGrimoire => ({
  id: grimoireId,
  name,
  itemIds: items.map(({ itemId }) => itemId),
  createdAt,
  updatedAt,
});

export function toGrimoireSyncError(error: unknown): GrimoireSyncError {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    const rawCode =
      data && typeof data === 'object'
        ? (data as { code?: unknown }).code
        : undefined;
    return new GrimoireSyncError(
      status >= 500 ? 'server' : 'rejected',
      `HTTP ${status}`,
      typeof rawCode === 'string' ? rawCode : undefined
    );
  }
  return new GrimoireSyncError(
    'network',
    error instanceof Error ? error.message : 'Network error'
  );
}

const requestList = async (
  call: () => Promise<{ data: GrimoireListResponse }>
): Promise<PocketGrimoire[]> => {
  try {
    const { data } = await call();
    return data.data.map(fromApiGrimoire);
  } catch (error) {
    throw toGrimoireSyncError(error);
  }
};

const pocketGrimoireService = {
  getAll: (): Promise<PocketGrimoire[]> =>
    requestList(() => api.get<GrimoireListResponse>(BASE_URL)),

  sync: ({
    upserts,
    deletes,
    merge,
  }: GrimoireSyncPayload): Promise<PocketGrimoire[]> =>
    requestList(() =>
      api.post<GrimoireListResponse>(`${BASE_URL}/sync`, {
        upserts: upserts.map(toApiGrimoire),
        deletes,
        merge,
      })
    ),
};

export default pocketGrimoireService;
