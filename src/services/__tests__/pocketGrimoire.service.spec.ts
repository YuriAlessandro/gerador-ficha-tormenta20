import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosResponse } from 'axios';
import {
  fromApiGrimoire,
  toApiGrimoire,
  toGrimoireSyncError,
} from '../pocketGrimoire.service';

const grimoire = {
  id: 'g1',
  name: 'Magias',
  itemIds: ['spell:A', 'spell:B'],
  createdAt: '2026-10-02T10:00:00.000Z',
  updatedAt: '2026-10-02T11:00:00.000Z',
};

const api = {
  grimoireId: 'g1',
  name: 'Magias',
  items: [{ itemId: 'spell:A' }, { itemId: 'spell:B' }],
  createdAt: '2026-10-02T10:00:00.000Z',
  updatedAt: '2026-10-02T11:00:00.000Z',
};

const httpError = (status: number, data: unknown = {}) =>
  new AxiosError('erro', 'ERR', undefined, undefined, {
    status,
    data,
  } as AxiosResponse);

describe('conversão local ↔ API', () => {
  it('itemIds vira items: [{ itemId }]', () => {
    expect(toApiGrimoire(grimoire)).toEqual(api);
  });

  it('volta para itemIds, ignorando campos extras dos itens', () => {
    const items = [{ itemId: 'spell:A', nota: 'x' }, { itemId: 'spell:B' }];
    expect(fromApiGrimoire({ ...api, items })).toEqual(grimoire);
  });
});

describe('toGrimoireSyncError', () => {
  it('sem resposta é rede', () => {
    expect(toGrimoireSyncError(new Error('Network Error')).kind).toBe(
      'network'
    );
  });

  it('5xx é servidor', () => {
    expect(toGrimoireSyncError(httpError(503)).kind).toBe('server');
  });

  it('4xx é recusa, com o código do backend', () => {
    const error = toGrimoireSyncError(
      httpError(409, { code: 'GRIMOIRE_LIMIT' })
    );
    expect(error.kind).toBe('rejected');
    expect(error.code).toBe('GRIMOIRE_LIMIT');
  });
});
