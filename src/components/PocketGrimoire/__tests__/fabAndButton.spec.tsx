import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AddToGrimoireButton from '../AddToGrimoireButton';
import PocketGrimoireFab from '../PocketGrimoireFab';
import { renderWithProviders } from './renderWithProviders';

// Botão e balão lado a lado, como na enciclopédia: os dois leem a mesma store.
const renderBoth = () =>
  renderWithProviders(
    <>
      <AddToGrimoireButton
        itemId='spell:Bola de Fogo'
        itemName='Bola de Fogo'
      />
      <PocketGrimoireFab />
    </>
  );

describe('AddToGrimoireButton + PocketGrimoireFab', () => {
  it('adicionar pelo botão aumenta o contador do botão flutuante', () => {
    renderBoth();
    expect(
      screen.getByRole('button', { name: 'Grimório de bolso: Padrão, 0 itens' })
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Bola de Fogo a Padrão' })
    );
    expect(
      screen.getByRole('button', { name: 'Grimório de bolso: Padrão, 1 item' })
    ).toBeInTheDocument();
  });

  it('remover pelo balão atualiza o botão do card', () => {
    renderBoth();
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Bola de Fogo a Padrão' })
    );
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso:/ }));
    const panel = screen.getByRole('dialog', { name: 'Grimório de bolso' });
    fireEvent.click(
      within(panel).getByRole('button', { name: 'Remover Bola de Fogo' })
    );
    expect(
      screen.getByRole('button', {
        name: 'Adicionar Bola de Fogo a Padrão',
        hidden: true,
      })
    ).toBeInTheDocument();
  });
});
