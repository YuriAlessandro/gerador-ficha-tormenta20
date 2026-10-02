import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PocketGrimoireListPage from '../PocketGrimoireListPage';
import PocketGrimoireFab from '../PocketGrimoireFab';
import ImportGrimoireDialog from '../ImportGrimoireDialog';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { grimoireLimitMessage } from '../../../functions/pocketGrimoire/limit';
import { PocketGrimoireState } from '../../../interfaces/PocketGrimoire';

/** `count` grimórios (o plano gratuito permite 10). */
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

const LOGGED = { isAuthenticated: true };
const MESSAGE = grimoireLimitMessage(10);

describe('limite de grimórios na interface (plano gratuito)', () => {
  it('logado no limite: "Novo" avisa e não abre o diálogo', async () => {
    renderWithProviders(<PocketGrimoireListPage />, {
      preloadedState: withGrimoires(10),
      auth: LOGGED,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('Novo grimório')).not.toBeInTheDocument();
  });

  it('logado abaixo do limite: "Novo" abre o diálogo', () => {
    renderWithProviders(<PocketGrimoireListPage />, {
      preloadedState: withGrimoires(9),
      auth: LOGGED,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
    expect(screen.getByText('Novo grimório')).toBeInTheDocument();
  });

  it('deslogado não tem limite', () => {
    renderWithProviders(<PocketGrimoireListPage />, {
      preloadedState: withGrimoires(10),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Novo' }));
    expect(screen.getByText('Novo grimório')).toBeInTheDocument();
  });

  it('logado no limite: "Duplicar" avisa e não cria', async () => {
    const { store } = renderWithProviders(<PocketGrimoireListPage />, {
      preloadedState: withGrimoires(10),
      auth: LOGGED,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicar' }));
    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(store.getState().pocketGrimoire.grimoires).toHaveLength(10);
  });

  it('logado no limite: importar como novo mostra o limite e não cria', () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(
      <ImportGrimoireDialog open onClose={onClose} />,
      { preloadedState: withGrimoires(10), auth: LOGGED }
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Colar texto' }));
    fireEvent.change(screen.getByLabelText('JSON do grimório'), {
      target: {
        value: JSON.stringify({
          formato: 'fichas-de-nimb/grimorio-de-bolso',
          versao: 1,
          exportadoEm: '2026-09-18T00:00:00.000Z',
          grimorio: { nome: 'Trazido', itens: [{ id: 'spell:Luz' }] },
        }),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(store.getState().pocketGrimoire.grimoires).toHaveLength(10);
  });

  it('logado no limite: "Novo grimório" no botão flutuante avisa', async () => {
    renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: withGrimoires(10),
      auth: LOGGED,
    });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: /Grimório ativo/ })
    );
    fireEvent.click(screen.getByRole('option', { name: /Novo grimório/ }));
    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Novo grimório' })
    ).not.toBeInTheDocument();
  });
});
