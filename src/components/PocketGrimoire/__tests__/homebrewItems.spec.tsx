import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import PocketGrimoirePage from '../PocketGrimoirePage';
import PocketGrimoireFab from '../PocketGrimoireFab';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import {
  HOMEBREW,
  homebrewSupplement,
} from '../../../functions/pocketGrimoire/__tests__/homebrewFixture';
import { dataRegistry } from '../../../data/registry';

const withHomebrewDeity = () => {
  const state = createInitialState();
  state.grimoires[0].itemIds = [HOMEBREW.deityId];
  return state;
};

afterEach(() => {
  dataRegistry.unregisterRuntimeSupplement(HOMEBREW.id);
});

describe('itens de homebrew no grimório', () => {
  it('a página atualiza quando os homebrews chegam depois de abrir', () => {
    renderWithProviders(<PocketGrimoirePage />, {
      preloadedState: withHomebrewDeity(),
      route: '/grimorio/default',
      path: '/grimorio/:id',
    });
    expect(screen.getAllByText(/^Não encontrados/)[0]).toBeInTheDocument();

    act(() => {
      dataRegistry.registerRuntimeSupplement(HOMEBREW.id, homebrewSupplement());
    });
    expect(screen.queryByText(/^Não encontrados/)).not.toBeInTheDocument();
    expect(screen.getAllByText(HOMEBREW.deity).length).toBeGreaterThan(0);
  });

  it('o balão do botão flutuante também', () => {
    renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: withHomebrewDeity(),
    });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    expect(screen.getAllByText(/^Não encontrados/)[0]).toBeInTheDocument();

    act(() => {
      dataRegistry.registerRuntimeSupplement(HOMEBREW.id, homebrewSupplement());
    });
    expect(screen.queryByText(/^Não encontrados/)).not.toBeInTheDocument();
  });
});
