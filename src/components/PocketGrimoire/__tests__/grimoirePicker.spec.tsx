import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AddToGrimoireButton from '../AddToGrimoireButton';
import AddFromEncyclopediaItem from '../AddFromEncyclopediaItem';
import GrimoireMoveDialog from '../GrimoireMoveDialog';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { grimoireLimitMessage } from '../../../functions/pocketGrimoire/limit';
import {
  DEFAULT_GRIMOIRE_ID,
  PocketGrimoireState,
} from '../../../interfaces/PocketGrimoire';

const ID = 'spell:Bola de Fogo';

const withCombate = (): PocketGrimoireState => {
  const state = createInitialState();
  state.grimoires.push({
    id: 'combate',
    name: 'Combate',
    itemIds: [],
    createdAt: '',
    updatedAt: '',
  });
  return state;
};

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

const itemsOf = (state: PocketGrimoireState, id: string) =>
  state.grimoires.find((g) => g.id === id)?.itemIds;

const renderIconButton = (
  preloadedState: PocketGrimoireState,
  auth?: { isAuthenticated: boolean }
) =>
  renderWithProviders(
    <>
      <AddToGrimoireButton itemId={ID} itemName='Bola de Fogo' />
      <GrimoireMoveDialog />
    </>,
    { preloadedState, auth }
  );

describe('"Trocar" no aviso de adição', () => {
  it('move o item para o grimório escolhido e o torna ativo', async () => {
    const { store } = renderIconButton(withCombate());
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Bola de Fogo a Padrão' })
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Trocar' }));

    const dialog = screen.getByRole('dialog', {
      name: 'Mover "Bola de Fogo" para…',
    });
    fireEvent.click(within(dialog).getByRole('button', { name: /Combate/ }));

    const state = store.getState().pocketGrimoire;
    expect(itemsOf(state, DEFAULT_GRIMOIRE_ID)).toEqual([]);
    expect(itemsOf(state, 'combate')).toEqual([ID]);
    expect(state.activeId).toBe('combate');
    expect(
      await screen.findByText('"Bola de Fogo" foi para Combate.')
    ).toBeInTheDocument();
    // O diálogo ainda fechando deixa o resto da tela aria-hidden.
    expect(
      await screen.findByRole('button', {
        name: 'Remover Bola de Fogo de Combate',
      })
    ).toBeInTheDocument();
  });

  it('"Desfazer" depois de trocar devolve o item e o ativo', async () => {
    const { store } = renderIconButton(withCombate());
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Trocar' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: /Combate/,
      })
    );
    await screen.findByText('"Bola de Fogo" foi para Combate.');
    const undoButtons = await screen.findAllByRole('button', {
      name: 'Desfazer',
    });
    fireEvent.click(undoButtons[undoButtons.length - 1]);

    const state = store.getState().pocketGrimoire;
    expect(itemsOf(state, DEFAULT_GRIMOIRE_ID)).toEqual([ID]);
    expect(itemsOf(state, 'combate')).toEqual([]);
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('"Novo grimório" cria, move o item e o torna ativo', async () => {
    const { store } = renderIconButton(createInitialState());
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Trocar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Novo grimório' }));
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Rituais' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    const state = store.getState().pocketGrimoire;
    const created = state.grimoires.find((g) => g.name === 'Rituais');
    expect(created?.itemIds).toEqual([ID]);
    expect(itemsOf(state, DEFAULT_GRIMOIRE_ID)).toEqual([]);
    expect(state.activeId).toBe(created?.id);
  });

  it('"Novo grimório" no limite do plano avisa e não cria', async () => {
    const { store } = renderIconButton(withGrimoires(10), {
      isAuthenticated: true,
    });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Trocar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Novo grimório' }));

    expect(
      await screen.findByText(grimoireLimitMessage(10))
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
    expect(store.getState().pocketGrimoire.grimoires).toHaveLength(10);
  });

  it('aviso de remoção não oferece "Trocar"', async () => {
    const state = createInitialState();
    state.grimoires[0].itemIds = [ID];
    renderIconButton(state);
    fireEvent.click(screen.getByRole('button', { name: /Remover/ }));
    await screen.findByText('"Bola de Fogo" saiu de Padrão.');
    expect(
      screen.queryByRole('button', { name: 'Trocar' })
    ).not.toBeInTheDocument();
  });

  it('dentro de um grimório (destino explícito) não oferece "Trocar"', async () => {
    renderWithProviders(
      <AddFromEncyclopediaItem
        itemId={ID}
        itemName='Bola de Fogo'
        secondary='Magia'
        grimoireId='combate'
      />,
      { preloadedState: withCombate() }
    );
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
    await screen.findByText('"Bola de Fogo" foi para Combate.');
    expect(
      screen.queryByRole('button', { name: 'Trocar' })
    ).not.toBeInTheDocument();
  });
});

describe('botão dividido (variant="labeled")', () => {
  const renderLabeled = (
    preloadedState: PocketGrimoireState,
    auth?: { isAuthenticated: boolean }
  ) =>
    renderWithProviders(
      <AddToGrimoireButton
        itemId={ID}
        itemName='Bola de Fogo'
        variant='labeled'
      />,
      { preloadedState, auth }
    );

  it('a seta lista os grimórios marcando onde o item está', () => {
    const state = withCombate();
    state.grimoires[1].itemIds = [ID];
    renderLabeled(state);
    fireEvent.click(screen.getByRole('button', { name: 'Escolher grimório' }));

    expect(
      screen.getByRole('menuitemcheckbox', { name: /Padrão/ })
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('menuitemcheckbox', { name: /Combate/ })
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('marcar outro grimório adiciona nele e o torna ativo', () => {
    const { store } = renderLabeled(withCombate());
    fireEvent.click(screen.getByRole('button', { name: 'Escolher grimório' }));
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /Combate/ }));

    const state = store.getState().pocketGrimoire;
    expect(itemsOf(state, 'combate')).toEqual([ID]);
    expect(itemsOf(state, DEFAULT_GRIMOIRE_ID)).toEqual([]);
    expect(state.activeId).toBe('combate');
    // O menu continua aberto para marcar mais de um.
    expect(
      screen.getByRole('menuitemcheckbox', { name: /Combate/ })
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('desmarcar remove sem trocar o ativo', () => {
    const state = withCombate();
    state.grimoires[1].itemIds = [ID];
    const { store } = renderLabeled(state);
    fireEvent.click(screen.getByRole('button', { name: 'Escolher grimório' }));
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /Combate/ }));

    const next = store.getState().pocketGrimoire;
    expect(itemsOf(next, 'combate')).toEqual([]);
    expect(next.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('"Novo grimório" cria com o item e o torna ativo', async () => {
    const { store } = renderLabeled(createInitialState());
    fireEvent.click(screen.getByRole('button', { name: 'Escolher grimório' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Novo grimório' }));
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Rituais' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    const state = store.getState().pocketGrimoire;
    const created = state.grimoires.find((g) => g.name === 'Rituais');
    expect(created?.itemIds).toEqual([ID]);
    expect(state.activeId).toBe(created?.id);
    expect(
      await screen.findByRole('button', { name: /No grimório "Rituais"/ })
    ).toBeInTheDocument();
  });

  it('"Novo grimório" no limite do plano avisa e não cria', async () => {
    const { store } = renderLabeled(withGrimoires(10), {
      isAuthenticated: true,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Escolher grimório' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Novo grimório' }));

    expect(
      await screen.findByText(grimoireLimitMessage(10))
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
    expect(store.getState().pocketGrimoire.grimoires).toHaveLength(10);
  });
});
