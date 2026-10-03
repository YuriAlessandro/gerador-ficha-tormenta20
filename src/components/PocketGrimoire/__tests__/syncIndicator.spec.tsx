import React from 'react';
import { act, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GrimoireSyncIndicator, {
  syncIndicatorView,
} from '../GrimoireSyncIndicator';
import GrimoireLoginHint from '../GrimoireLoginHint';
import PocketGrimoireListPage from '../PocketGrimoireListPage';
import { renderWithProviders } from './renderWithProviders';
import { setSyncStatus } from '../../../store/slices/pocketGrimoire/pocketGrimoireSyncStatusSlice';

const OFFLINE =
  'Sem conexão: as alterações serão enviadas quando a conexão voltar';

describe('syncIndicatorView', () => {
  it.each([
    ['idle', false, 'saved', 'Salvo na sua conta'],
    ['idle', true, 'syncing', 'Sincronizando…'],
    ['syncing', false, 'syncing', 'Sincronizando…'],
    ['offline', true, 'offline', OFFLINE],
    ['error', true, 'error', 'Erro ao salvar na conta'],
  ] as const)('%s com pendência=%s → %s', (status, pending, kind, label) => {
    expect(syncIndicatorView(status, pending)).toEqual({ kind, label });
  });
});

describe('GrimoireSyncIndicator', () => {
  it('logado mostra o estado', () => {
    const { store } = renderWithProviders(<GrimoireSyncIndicator />, {
      auth: { isAuthenticated: true },
    });
    expect(
      screen.getByRole('img', { name: 'Salvo na sua conta' })
    ).toBeInTheDocument();
    act(() => {
      store.dispatch(setSyncStatus('offline'));
    });
    expect(screen.getByRole('img', { name: OFFLINE })).toBeInTheDocument();
  });

  it('deslogado não aparece', () => {
    renderWithProviders(<GrimoireSyncIndicator />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('GrimoireLoginHint', () => {
  it('deslogado convida para entrar', () => {
    renderWithProviders(<GrimoireLoginHint />);
    expect(
      screen.getByRole('button', { name: 'Entre na sua conta' })
    ).toBeInTheDocument();
  });

  it('logado não aparece', () => {
    renderWithProviders(<GrimoireLoginHint />, {
      auth: { isAuthenticated: true },
    });
    expect(
      screen.queryByRole('button', { name: 'Entre na sua conta' })
    ).not.toBeInTheDocument();
  });
});

describe('páginas do grimório', () => {
  it('abrir a lista pede o sync com a conta', () => {
    const { store } = renderWithProviders(<PocketGrimoireListPage />, {
      auth: { isAuthenticated: true },
    });
    expect(store.getState().pocketGrimoireSyncStatus.requested).toBe(true);
    expect(
      screen.getByRole('img', { name: 'Salvo na sua conta' })
    ).toBeInTheDocument();
  });
});
