import { describe, it, expect } from 'vitest';
import reducer, {
  requestGrimoireSync,
  selectGrimoireSyncRequested,
  selectGrimoireSyncStatus,
  setSyncStatus,
} from '../pocketGrimoireSyncStatusSlice';

const wrap = (state: ReturnType<typeof reducer>) => ({
  pocketGrimoireSyncStatus: state,
});

describe('pocketGrimoireSyncStatus', () => {
  it('começa ocioso e sem pedido de sync', () => {
    const state = reducer(undefined, { type: '@@init' });
    expect(selectGrimoireSyncStatus(wrap(state))).toBe('idle');
    expect(selectGrimoireSyncRequested(wrap(state))).toBe(false);
  });

  it('guarda o status e o pedido', () => {
    let state = reducer(undefined, setSyncStatus('offline'));
    state = reducer(state, requestGrimoireSync());
    expect(selectGrimoireSyncStatus(wrap(state))).toBe('offline');
    expect(selectGrimoireSyncRequested(wrap(state))).toBe(true);
  });
});
