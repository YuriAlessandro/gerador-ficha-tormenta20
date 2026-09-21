import React from 'react';
import { act, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import PocketGrimoirePage from '../PocketGrimoirePage';
import PocketGrimoireListPage from '../PocketGrimoireListPage';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { getFullEncyclopediaIndex } from '../../../functions/pocketGrimoire/resolveItems';
import { prefixOf } from '../../../functions/pocketGrimoire/itemId';
import {
  addItem,
  removeItem,
} from '../../../store/slices/pocketGrimoire/pocketGrimoireSlice';

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

  it('filtro volta para Tudo quando a categoria escolhida some', () => {
    const [spellId] = idsWithPrefix('spell', 1);
    const [powerId] = idsWithPrefix('power', 1);
    const { store } = renderPage([spellId, powerId]);
    fireEvent.click(screen.getByRole('button', { name: 'Magias' }));
    act(() => {
      store.dispatch(removeItem('default', spellId));
    });
    expect(screen.getByText('Poderes gerais')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tudo' })
    ).not.toBeInTheDocument();
  });

  it('filtro que sumiu não volta sozinho quando a categoria reaparece', () => {
    const [spellId, otherSpellId] = idsWithPrefix('spell', 2);
    const [powerId] = idsWithPrefix('power', 1);
    const { store } = renderPage([spellId, powerId]);
    fireEvent.click(screen.getByRole('button', { name: 'Magias' }));
    act(() => {
      store.dispatch(removeItem('default', spellId));
    });
    act(() => {
      store.dispatch(addItem('default', otherSpellId));
    });
    expect(screen.getByText('Poderes gerais')).toBeInTheDocument();
  });

  it('avisa quando nenhum item do grimório corresponde à busca', () => {
    renderPage(idsWithPrefix('spell', 2));
    fireEvent.change(screen.getByLabelText('Buscar no grimório ou adicionar'), {
      target: { value: 'zzzz' },
    });
    expect(
      screen.getByText('Nenhum item deste grimório corresponde.')
    ).toBeInTheDocument();
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

  it('clicar na linha do resultado guarda e devolve o item', () => {
    const { store } = renderPage([]);
    fireEvent.change(screen.getByLabelText('Buscar no grimório ou adicionar'), {
      target: { value: 'bola de fogo' },
    });
    const row = screen.getByRole('button', {
      name: 'Adicionar Bola de Fogo a Padrão',
    });
    fireEvent.click(row);
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toContain(
      'spell:Bola de Fogo'
    );

    // A linha espelha o marcador: o segundo clique tira de novo.
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Bola de Fogo de Padrão' })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).not.toContain(
      'spell:Bola de Fogo'
    );
  });

  it('grimório inexistente mostra aviso', () => {
    renderWithProviders(<PocketGrimoirePage />, {
      route: '/grimorio/fantasma',
      path: '/grimorio/:id',
    });
    expect(screen.getByText('Grimório não encontrado')).toBeInTheDocument();
  });
});

describe('PocketGrimoirePage — modo cartas', () => {
  const THREE = [
    'spell:Bola de Fogo',
    'spell:Seta Infalível de Talude',
    'power:MAGIA:Magia Acelerada',
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('alterna para cartas e lembra a escolha', () => {
    renderPage(THREE);
    fireEvent.click(screen.getByRole('button', { name: /Cartas/ }));
    expect(
      screen.getByRole('button', { name: /Abrir carta Bola de Fogo/ })
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('fdn-grimoire-view')).toBe('cards');
  });

  it('abre a carta ampliada e navega com as setas', () => {
    window.localStorage.setItem('fdn-grimoire-view', 'cards');
    renderPage(THREE);
    fireEvent.click(
      screen.getByRole('button', { name: /Abrir carta Seta Infalível/ })
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Seta Infalível de Talude');
    expect(dialog).toHaveTextContent(/1 de 3/);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima carta' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Bola de Fogo');
    expect(screen.getByRole('dialog')).toHaveTextContent('Aprimoramentos');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Seta Infalível de Talude'
    );
  });

  it('legenda mostra só os tipos presentes, e só no modo cartas', () => {
    window.localStorage.setItem('fdn-grimoire-view', 'cards');
    renderPage(THREE);
    const legend = screen.getByRole('region', { name: 'Legenda das cartas' });
    expect(legend).toHaveTextContent('Magia arcana');
    expect(legend).toHaveTextContent('Poder geral');
    expect(legend).not.toHaveTextContent('Magia divina');
    fireEvent.click(screen.getByRole('button', { name: /Lista/ }));
    expect(
      screen.queryByRole('region', { name: 'Legenda das cartas' })
    ).not.toBeInTheDocument();
  });

  it('remover pela carta ampliada tira o item do grimório', () => {
    window.localStorage.setItem('fdn-grimoire-view', 'cards');
    const { store } = renderPage(THREE);
    fireEvent.click(screen.getByRole('button', { name: /Abrir carta Bola/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover do grimório' })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).not.toContain(
      'spell:Bola de Fogo'
    );
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
