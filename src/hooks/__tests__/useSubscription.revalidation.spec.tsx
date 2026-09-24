/**
 * A assinatura é revalidada UMA vez por usuário, não uma por componente.
 *
 * Todo `useFeatureAccess` passa pelo `useSubscription`, e a ficha tem dezenas
 * deles: com o refetch por montagem, abrir uma ficha disparava 12 buscas e 12
 * re-renders da ficha inteira (o editor de layout dobrava isso).
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'firebase/auth';

const getCurrentSubscription = vi.fn(async () => ({
  tier: 'free',
  status: 'active',
}));
vi.mock('@/services/subscription.service', () => ({
  getCurrentSubscription: () => getCurrentSubscription(),
  getPricingPlans: vi.fn(async () => []),
  getInvoices: vi.fn(async () => []),
}));

// eslint-disable-next-line import/first
import store from '@/store';
// eslint-disable-next-line import/first
import { setFirebaseUser, clearAuth } from '@/store/slices/auth/authSlice';
// eslint-disable-next-line import/first
import {
  useSubscription,
  resetSubscriptionRevalidation,
} from '../useSubscription';

const Consumer: React.FC = () => {
  useSubscription();
  return null;
};

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

describe('useSubscription — revalidação', () => {
  beforeEach(() => {
    getCurrentSubscription.mockClear();
    resetSubscriptionRevalidation();
    store.dispatch(clearAuth());
  });

  it('busca uma vez só, por mais componentes que usem o hook', async () => {
    store.dispatch(setFirebaseUser({ uid: 'u1' } as User));
    render(
      <Provider store={store}>
        {Array.from({ length: 12 }, (_, i) => (
          <Consumer key={i} />
        ))}
      </Provider>
    );
    await flush();

    expect(getCurrentSubscription).toHaveBeenCalledTimes(1);
  });

  it('não busca de novo quando mais componentes montam depois', async () => {
    store.dispatch(setFirebaseUser({ uid: 'u1' } as User));
    const { rerender } = render(
      <Provider store={store}>
        <Consumer />
      </Provider>
    );
    await flush();
    rerender(
      <Provider store={store}>
        <Consumer />
        <Consumer />
      </Provider>
    );
    await flush();

    expect(getCurrentSubscription).toHaveBeenCalledTimes(1);
  });

  it('busca de novo para outro usuário', async () => {
    store.dispatch(setFirebaseUser({ uid: 'u1' } as User));
    const { unmount } = render(
      <Provider store={store}>
        <Consumer />
      </Provider>
    );
    await flush();
    unmount();

    store.dispatch(setFirebaseUser({ uid: 'u2' } as User));
    render(
      <Provider store={store}>
        <Consumer />
      </Provider>
    );
    await flush();

    expect(getCurrentSubscription).toHaveBeenCalledTimes(2);
  });
});
