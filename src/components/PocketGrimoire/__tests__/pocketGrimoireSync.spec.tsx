import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PocketGrimoireSync from '../PocketGrimoireSync';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { GrimoireSyncPayload } from '../../../functions/pocketGrimoire/sync';
import { requestGrimoireSync } from '../../../store/slices/pocketGrimoire/pocketGrimoireSyncStatusSlice';

const fakeService = () => ({
  getAll: vi.fn(async () => []),
  sync: vi.fn(async ({ upserts }: GrimoireSyncPayload) => ({
    grimoires: upserts,
    rejectedIds: [],
    maxGrimoires: 10,
  })),
});

const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      })
  );

describe('PocketGrimoireSync', () => {
  it('logado: junta os grimórios do navegador e avisa', async () => {
    const state = createInitialState();
    state.grimoires[0].itemIds = ['spell:Bola de Fogo'];
    const service = fakeService();
    const { store } = renderWithProviders(
      <PocketGrimoireSync service={service} />,
      { preloadedState: state, auth: { isAuthenticated: true, userId: 'u1' } }
    );

    await waitFor(() => expect(service.sync).toHaveBeenCalledTimes(1));
    expect(service.sync.mock.calls[0][0].merge).toBe(true);
    expect(
      await screen.findByText(
        '1 grimório deste navegador foi salvo na sua conta.'
      )
    ).toBeInTheDocument();
    expect(store.getState().pocketGrimoire.sync.ownerId).toBe('u1');
  });

  it('logado sem uso: nenhuma requisição até abrir o grimório', async () => {
    const service = fakeService();
    const { store } = renderWithProviders(
      <PocketGrimoireSync service={service} />,
      { auth: { isAuthenticated: true, userId: 'u1' } }
    );
    await settle();
    expect(service.getAll).not.toHaveBeenCalled();
    expect(service.sync).not.toHaveBeenCalled();

    act(() => {
      store.dispatch(requestGrimoireSync());
    });
    await waitFor(() => expect(service.sync).toHaveBeenCalledTimes(1));
    expect(store.getState().pocketGrimoire.sync.ownerId).toBe('u1');
  });

  it('logado sem conta no backend (fora do ar): mostra offline e não apaga nada', async () => {
    const state = createInitialState();
    state.grimoires[0].itemIds = ['spell:Luz'];
    state.sync.ownerId = 'u1';
    const service = fakeService();
    const { store } = renderWithProviders(
      <PocketGrimoireSync service={service} />,
      { preloadedState: state, auth: { isAuthenticated: true, userId: '' } }
    );
    act(() => {
      store.dispatch(requestGrimoireSync());
    });
    await settle();
    expect(service.getAll).not.toHaveBeenCalled();
    expect(service.sync).not.toHaveBeenCalled();
    expect(store.getState().pocketGrimoireSyncStatus.status).toBe('offline');
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([
      'spell:Luz',
    ]);
  });

  it('deslogado: não chama a API', async () => {
    const service = fakeService();
    const { store } = renderWithProviders(
      <PocketGrimoireSync service={service} />
    );
    act(() => {
      store.dispatch(requestGrimoireSync());
    });
    await settle();
    expect(service.getAll).not.toHaveBeenCalled();
    expect(service.sync).not.toHaveBeenCalled();
  });
});
