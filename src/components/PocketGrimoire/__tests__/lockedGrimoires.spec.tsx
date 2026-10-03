import React from 'react';
import { Route } from 'react-router-dom';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PocketGrimoireListPage from '../PocketGrimoireListPage';
import PocketGrimoirePage from '../PocketGrimoirePage';
import PocketGrimoireFab from '../PocketGrimoireFab';
import PocketGrimoireSync from '../PocketGrimoireSync';
import AddToGrimoireButton from '../AddToGrimoireButton';
import GrimoireMoveDialog from '../GrimoireMoveDialog';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { lockedGrimoireMessage } from '../../../functions/pocketGrimoire/limit';
import { PocketGrimoireState } from '../../../interfaces/PocketGrimoire';

/**
 * `count` grimórios: "Padrão" e "Grimório 1" … Com 12 e o limite gratuito de
 * 10, "Grimório 10" e "Grimório 11" ficam bloqueados.
 */
const withGrimoires = (count: number): PocketGrimoireState => {
  const state = createInitialState();
  for (let i = 1; i < count; i += 1) {
    state.grimoires.push({
      id: `g${i}`,
      name: `Grimório ${i}`,
      itemIds: [],
      createdAt: '',
      updatedAt: '',
    });
  }
  return state;
};

const ANON_MESSAGE = lockedGrimoireMessage(10, false);

const card = (name: string) =>
  screen.getByText(name).closest('.MuiCard-root') as HTMLElement;

const renderList = (
  state: PocketGrimoireState,
  auth?: { isAuthenticated: boolean }
) =>
  renderWithProviders(
    <>
      <Route exact path='/grimorio'>
        <PocketGrimoireListPage />
      </Route>
      <Route path='/grimorio/:id'>
        <p>Página do grimório aberta</p>
      </Route>
    </>,
    { preloadedState: state, route: '/grimorio', auth }
  );

describe('grimórios acima do limite na lista', () => {
  it('aparecem com a marca e sem a contagem de itens', () => {
    renderList(withGrimoires(12));
    expect(
      within(card('Grimório 11')).getByText('Acima do limite')
    ).toBeVisible();
    expect(
      within(card('Grimório 11')).queryByText(/itens/)
    ).not.toBeInTheDocument();
    expect(
      within(card('Grimório 9')).queryByText('Acima do limite')
    ).not.toBeInTheDocument();
  });

  it('clicar avisa e não abre', async () => {
    renderList(withGrimoires(12));
    fireEvent.click(within(card('Grimório 11')).getAllByRole('button')[0]);
    expect(await screen.findByText(ANON_MESSAGE)).toBeInTheDocument();
    expect(
      screen.queryByText('Página do grimório aberta')
    ).not.toBeInTheDocument();
  });

  it('o menu só oferece excluir', () => {
    renderList(withGrimoires(12));
    fireEvent.click(
      screen.getByRole('button', { name: 'Opções de Grimório 11' })
    );
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent)
    ).toEqual(['Excluir']);
  });

  it('excluir outro grimório libera o primeiro bloqueado', async () => {
    renderList(withGrimoires(12));
    fireEvent.click(
      screen.getByRole('button', { name: 'Opções de Grimório 1' })
    );
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Excluir',
      })
    );
    await waitFor(() =>
      expect(
        within(card('Grimório 10')).queryByText('Acima do limite')
      ).not.toBeInTheDocument()
    );
    expect(
      within(card('Grimório 11')).getByText('Acima do limite')
    ).toBeVisible();
  });

  it('logado: os recusados pelo servidor ficam bloqueados, não os da conta', () => {
    const state = withGrimoires(12);
    state.sync = {
      ownerId: 'user-1',
      dirty: { default: '', g1: '' },
      deletedIds: [],
      pendingMerge: false,
      rejectedIds: ['default', 'g1'],
    };
    renderList(state, { isAuthenticated: true });
    expect(within(card('Padrão')).getByText('Acima do limite')).toBeVisible();
    expect(
      within(card('Grimório 1')).getByText('Acima do limite')
    ).toBeVisible();
    expect(
      within(card('Grimório 11')).queryByText('Acima do limite')
    ).not.toBeInTheDocument();
  });
});

describe('grimório acima do limite em outros pontos', () => {
  it('pelo endereço direto, volta para a lista com o aviso', async () => {
    renderWithProviders(
      <>
        <Route exact path='/grimorio'>
          <p>Lista de grimórios</p>
        </Route>
        <Route path='/grimorio/:id'>
          <PocketGrimoirePage />
        </Route>
      </>,
      { preloadedState: withGrimoires(12), route: '/grimorio/g11' }
    );
    expect(await screen.findByText(ANON_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText('Lista de grimórios')).toBeInTheDocument();
  });

  it('no botão flutuante, aparece desabilitado como ativo', () => {
    renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: withGrimoires(12),
    });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: /Grimório ativo/ })
    );
    expect(screen.getByRole('option', { name: /Grimório 11/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(
      screen.getByRole('option', { name: /Grimório 9/ })
    ).not.toHaveAttribute('aria-disabled');
  });

  it('não aparece no "Trocar" nem no menu da seta', async () => {
    renderWithProviders(
      <>
        <AddToGrimoireButton itemId='spell:Luz' itemName='Luz' />
        <AddToGrimoireButton
          itemId='spell:Luz'
          itemName='Luz'
          variant='labeled'
        />
        <GrimoireMoveDialog />
      </>,
      { preloadedState: withGrimoires(12) }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Escolher grimório' }));
    expect(
      screen.queryByRole('menuitemcheckbox', { name: /Grimório 11/ })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitemcheckbox', { name: /Grimório 9/ })
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    fireEvent.click(
      await screen.findByRole('button', { name: 'Adicionar Luz a Padrão' })
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Trocar' }));
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).queryByRole('button', { name: /Grimório 11/ })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /Grimório 9/ })
    ).toBeInTheDocument();
  });

  it('se o ativo ficar bloqueado, o ativo passa para o primeiro liberado', async () => {
    const state = withGrimoires(12);
    state.activeId = 'g11';
    const service = {
      getAll: vi.fn(async () => []),
      sync: vi.fn(),
    };
    const { store } = renderWithProviders(
      <PocketGrimoireSync service={service} />,
      { preloadedState: state }
    );
    await waitFor(() =>
      expect(store.getState().pocketGrimoire.activeId).toBe('default')
    );
  });
});
