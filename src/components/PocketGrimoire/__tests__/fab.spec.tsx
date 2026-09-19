import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PocketGrimoireFab from '../PocketGrimoireFab';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { PocketGrimoireState } from '../../../interfaces/PocketGrimoire';

const stateWithItems = (): PocketGrimoireState => {
  const state = createInitialState();
  state.grimoires[0].itemIds = ['spell:Bola de Fogo'];
  state.grimoires.push({
    id: 'outro',
    name: 'Clériga',
    itemIds: [],
    createdAt: '',
    updatedAt: '',
  });
  return state;
};

describe('PocketGrimoireFab', () => {
  it('mostra a contagem do ativo', () => {
    renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: stateWithItems(),
    });
    expect(
      screen.getByRole('button', { name: 'Grimório de bolso: Padrão, 1 item' })
    ).toBeInTheDocument();
  });

  it('abre o balão com os itens e remove', () => {
    const { store } = renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: stateWithItems(),
    });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    const panel = screen.getByRole('dialog', { name: 'Grimório de bolso' });
    expect(within(panel).getByText('Bola de Fogo')).toBeInTheDocument();
    fireEvent.click(
      within(panel).getByRole('button', { name: 'Remover Bola de Fogo' })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([]);
    expect(
      within(panel).getByText(/Seu grimório está vazio/)
    ).toBeInTheDocument();
  });

  it('marca cada item com a cor do tipo, como as cartas', () => {
    const state = stateWithItems();
    state.grimoires[0].itemIds = [
      'spell:Bola de Fogo',
      'power:MAGIA:Magia Acelerada',
    ];
    renderWithProviders(<PocketGrimoireFab />, { preloadedState: state });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    const panel = screen.getByRole('dialog', { name: 'Grimório de bolso' });
    expect(
      within(panel).getByTitle('Magia arcana · 2º círculo')
    ).toHaveAttribute('data-accent', 'arcane');
    expect(within(panel).getByTitle('Poder geral')).toHaveAttribute(
      'data-accent',
      'power'
    );
  });

  it('troca o ativo pelo seletor', () => {
    const { store } = renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: stateWithItems(),
    });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    // O nome acessível do Select junta o rótulo e o valor exibido.
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: /Grimório ativo/ })
    );
    fireEvent.click(screen.getByRole('option', { name: /Clériga/ }));
    expect(store.getState().pocketGrimoire.activeId).toBe('outro');
  });
});
