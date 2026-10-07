import React from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { withPocketGrimoireAccount } from '@/premium/store/pocketGrimoire/withPocketGrimoireAccount';
import { premiumReducers } from '@/premium/store/premiumReducers';
import pocketGrimoireReducer from '../../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { PocketGrimoireState } from '../../../interfaces/PocketGrimoire';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import grimoireMoveReducer from '../../../store/slices/pocketGrimoire/grimoireMoveSlice';
import { DbUser } from '../../../types/auth.types';

export interface TestAuth {
  isAuthenticated: boolean;
  userId?: string;
}

/** Só o que `useAuth` lê; sem Firebase. */
const authState = ({ isAuthenticated, userId = 'user-1' }: TestAuth) => ({
  firebaseUser: null,
  dbUser: isAuthenticated ? ({ _id: userId } as unknown as DbUser) : null,
  loading: false,
  error: null,
  isAuthenticated,
});

interface Options {
  preloadedState?: PocketGrimoireState;
  /** URL inicial do MemoryRouter. */
  route?: string;
  /** Padrão de rota que envolve a UI (para `useParams`). */
  path?: string;
  /** Sessão simulada (padrão: deslogado). */
  auth?: TestAuth;
}

/** Como na store do app: o reducer público embrulhado pelo premium. */
const pocketGrimoireAccountReducer = withPocketGrimoireAccount(
  pocketGrimoireReducer
);

export const createTestStore = (
  preloadedState?: PocketGrimoireState,
  auth: TestAuth = { isAuthenticated: false }
) =>
  configureStore({
    reducer: {
      pocketGrimoire: pocketGrimoireAccountReducer,
      grimoireMove: grimoireMoveReducer,
      ...premiumReducers,
      auth: (state: ReturnType<typeof authState> = authState(auth)) => state,
      // Plano gratuito, sem boost (o que o limite de grimórios lê).
      subscription: (state = { subscription: null }) => state,
      system: (state = { featureFlags: {} }) => state,
    },
    preloadedState: {
      pocketGrimoire: preloadedState ?? createInitialState(),
    },
  });

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, route = '/', path, auth }: Options = {}
) {
  const store = createTestStore(preloadedState, auth);
  const result = render(
    <HelmetProvider>
      <Provider store={store}>
        <SnackbarProvider>
          <MemoryRouter initialEntries={[route]}>
            {path ? <Route path={path}>{ui}</Route> : ui}
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>
    </HelmetProvider>
  );
  return { store, ...result };
}
