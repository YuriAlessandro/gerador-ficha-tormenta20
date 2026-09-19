import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrimoireNameDialog from '../GrimoireNameDialog';
import ImportGrimoireDialog from '../ImportGrimoireDialog';
import GrimoireMenu from '../GrimoireMenu';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { IMPORT_ERRORS } from '../../../functions/pocketGrimoire/exchange';

describe('GrimoireNameDialog', () => {
  it('confirma nome limpo e bloqueia vazio', () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <GrimoireNameDialog
        open
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    const confirm = screen.getByRole('button', { name: 'Criar' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: '  Mago  ' },
    });
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith('Mago');
  });
});

describe('ImportGrimoireDialog', () => {
  const pasteAndImport = (text: string) => {
    fireEvent.click(screen.getByRole('tab', { name: 'Colar texto' }));
    fireEvent.change(screen.getByLabelText('JSON do grimório'), {
      target: { value: text },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));
  };

  it('mostra erro para texto inválido', () => {
    renderWithProviders(<ImportGrimoireDialog open onClose={vi.fn()} />);
    pasteAndImport('não é json');
    expect(screen.getByText(IMPORT_ERRORS.notJson)).toBeInTheDocument();
  });

  it('importa texto válido como grimório novo', async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(
      <ImportGrimoireDialog open onClose={onClose} />
    );
    pasteAndImport(
      JSON.stringify({
        formato: 'fichas-de-nimb/grimorio-de-bolso',
        versao: 1,
        exportadoEm: '2026-09-18T00:00:00.000Z',
        grimorio: {
          nome: 'Trazido',
          itens: [{ id: 'spell:Bola de Fogo' }, { id: 'spell:Sumida' }],
        },
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const { grimoires } = store.getState().pocketGrimoire;
    expect(grimoires[1]).toMatchObject({
      name: 'Trazido',
      itemIds: ['spell:Bola de Fogo', 'spell:Sumida'],
    });
    expect(
      await screen.findByText('Trazido importado: 2 itens (1 não encontrado).')
    ).toBeInTheDocument();
  });
});

describe('GrimoireMenu', () => {
  it('Excluir fica desativado quando é o único grimório', () => {
    const state = createInitialState();
    renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    expect(screen.getByRole('menuitem', { name: /Excluir/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('Excluir fica liberado no Padrão quando há outro grimório', () => {
    const state = createInitialState();
    state.grimoires.push({
      id: 'outro',
      name: 'Outro',
      itemIds: [],
      createdAt: '',
      updatedAt: '',
    });
    renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    expect(
      screen.getByRole('menuitem', { name: /Excluir/ })
    ).not.toHaveAttribute('aria-disabled');
  });

  it('Duplicar cria uma cópia', () => {
    const state = createInitialState();
    const { store } = renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Duplicar/ }));
    expect(store.getState().pocketGrimoire.grimoires[1].name).toBe(
      'Padrão (cópia)'
    );
  });
});
