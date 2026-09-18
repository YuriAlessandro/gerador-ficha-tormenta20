import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PocketGrimoirePage from '../PocketGrimoirePage';
import PocketGrimoireListPage from '../PocketGrimoireListPage';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { getFullEncyclopediaIndex } from '../../../functions/pocketGrimoire/resolveItems';
import { prefixOf } from '../../../functions/pocketGrimoire/itemId';

const idsWithPrefix = (prefix: string, count: number) =>
  getFullEncyclopediaIndex()
    .filter((e) => prefixOf(e.id) === prefix)
    .slice(0, count)
    .map((e) => e.id);

const renderPage = (itemIds: string[]) => {
  const state = createInitialState();
  state.grimoires[0].itemIds = itemIds;
  return renderWithProviders(<PocketGrimoirePage />, {
    preloadedState: state,
    route: '/grimorio/default',
    path: '/grimorio/:id',
  });
};

const openCards = () => screen.queryAllByRole('button', { expanded: true });

describe('PocketGrimoirePage', () => {
  it('abre os cards com 5 itens ou menos', () => {
    renderPage(idsWithPrefix('spell', 5));
    expect(openCards()).toHaveLength(5);
  });

  it('deixa fechados com 6 itens ou mais', () => {
    renderPage(idsWithPrefix('spell', 6));
    expect(openCards()).toHaveLength(0);
  });

  it('só mostra filtros de categorias presentes', () => {
    renderPage([...idsWithPrefix('spell', 1), ...idsWithPrefix('power', 1)]);
    expect(screen.getByRole('button', { name: 'Magias' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Poderes' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Habilidades' })
    ).not.toBeInTheDocument();
  });

  it('esconde os filtros quando só há uma categoria', () => {
    renderPage(idsWithPrefix('spell', 2));
    expect(
      screen.queryByRole('button', { name: 'Magias' })
    ).not.toBeInTheDocument();
  });

  it('filtro por categoria esconde os outros itens', () => {
    const [spellId] = idsWithPrefix('spell', 1);
    const [powerId] = idsWithPrefix('power', 1);
    renderPage([spellId, powerId]);
    fireEvent.click(screen.getByRole('button', { name: 'Poderes' }));
    expect(screen.queryByText('Poderes gerais')).toBeInTheDocument();
    expect(screen.queryByText(/Magias · /)).not.toBeInTheDocument();
  });

  it('busca mostra resultados da enciclopédia para adicionar', () => {
    renderPage([]);
    fireEvent.change(screen.getByLabelText('Buscar no grimório ou adicionar'), {
      target: { value: 'bola de fogo' },
    });
    expect(screen.getByText('Adicionar da enciclopédia')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {
        name: 'Adicionar Bola de Fogo a Padrão',
      }).length
    ).toBeGreaterThan(0);
  });

  it('grimório inexistente mostra aviso', () => {
    renderWithProviders(<PocketGrimoirePage />, {
      route: '/grimorio/fantasma',
      path: '/grimorio/:id',
    });
    expect(screen.getByText('Grimório não encontrado')).toBeInTheDocument();
  });
});

describe('PocketGrimoireListPage', () => {
  it('lista grimórios com o ativo marcado e o aviso de armazenamento local', () => {
    renderWithProviders(<PocketGrimoireListPage />);
    expect(screen.getByText('Padrão')).toBeInTheDocument();
    expect(screen.getByText('ativo')).toBeInTheDocument();
    expect(screen.getByText(/ficam só neste navegador/)).toBeInTheDocument();
  });

  it('cria um grimório novo pelo botão Novo', () => {
    const { store } = renderWithProviders(<PocketGrimoireListPage />);
    fireEvent.click(screen.getByRole('button', { name: /Novo/ }));
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Mago' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    expect(store.getState().pocketGrimoire.grimoires[1].name).toBe('Mago');
  });
});
