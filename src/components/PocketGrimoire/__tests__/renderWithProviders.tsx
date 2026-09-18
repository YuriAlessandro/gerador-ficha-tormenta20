import React from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import pocketGrimoireReducer from '../../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { PocketGrimoireState } from '../../../interfaces/PocketGrimoire';
import { createInitialState } from '../../../functions/pocketGrimoire/state';

interface Options {
  preloadedState?: PocketGrimoireState;
  /** URL inicial do MemoryRouter. */
  route?: string;
  /** Padrão de rota que envolve a UI (para `useParams`). */
  path?: string;
}

export const createTestStore = (preloadedState?: PocketGrimoireState) =>
  configureStore({
    reducer: { pocketGrimoire: pocketGrimoireReducer },
    preloadedState: {
      pocketGrimoire: preloadedState ?? createInitialState(),
    },
  });

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, route = '/', path }: Options = {}
) {
  const store = createTestStore(preloadedState);
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
