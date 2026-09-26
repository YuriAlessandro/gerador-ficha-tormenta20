import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AddToGrimoireButton from '../AddToGrimoireButton';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';
import { GeneralPowerType } from '../../../interfaces/Poderes';
import {
  getGrimoireCatalog,
  powerItemId,
} from '../../../functions/pocketGrimoire/resolveItems';

const ID = 'spell:Bola de Fogo';

describe('AddToGrimoireButton', () => {
  it('adiciona ao ativo, troca o ícone e desfaz', async () => {
    const { store } = renderWithProviders(
      <AddToGrimoireButton itemId={ID} itemName='Bola de Fogo' />
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Bola de Fogo a Padrão' })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([ID]);
    expect(
      screen.getByRole('button', { name: 'Remover Bola de Fogo de Padrão' })
    ).toBeInTheDocument();

    expect(
      await screen.findByText('"Bola de Fogo" foi para Padrão.')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([]);
  });

  it('com grimoireId age sobre aquele grimório, não sobre o ativo', () => {
    const state = createInitialState();
    state.grimoires.push({
      id: 'outro',
      name: 'Outro',
      itemIds: [],
      createdAt: '',
      updatedAt: '',
    });
    const { store } = renderWithProviders(
      <AddToGrimoireButton
        itemId={ID}
        itemName='Bola de Fogo'
        grimoireId='outro'
      />,
      { preloadedState: state }
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Bola de Fogo a Outro' })
    );
    const { grimoires } = store.getState().pocketGrimoire;
    expect(grimoires[0].itemIds).toEqual([]);
    expect(grimoires[1].itemIds).toEqual([ID]);
  });

  it('não propaga o clique para a linha da tabela', () => {
    let rowClicks = 0;
    const countRowClick = () => {
      rowClicks += 1;
    };
    renderWithProviders(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={countRowClick}>
        <AddToGrimoireButton itemId={ID} itemName='Bola de Fogo' />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
    expect(rowClicks).toBe(0);
  });
});

describe('AddToGrimoireButton variant="labeled"', () => {
  it('mostra o grimório de destino no texto e alterna', () => {
    const { store } = renderWithProviders(
      <AddToGrimoireButton
        itemId={ID}
        itemName='Bola de Fogo'
        variant='labeled'
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Adicionar ao grimório "Padrão"/ })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([ID]);
    fireEvent.click(
      screen.getByRole('button', { name: /No grimório "Padrão"/ })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([]);
  });
});

describe('ids montados pela tabela de poderes', () => {
  it('powerItemId acha no índice o id de todo poder geral', () => {
    const { byId } = getGrimoireCatalog();
    const byType = dataRegistry.getPowersWithSupplementInfo(
      Object.values(SupplementId)
    );
    const broken = (Object.keys(byType) as GeneralPowerType[]).flatMap((type) =>
      byType[type].map(powerItemId).filter((id) => !byId.has(id))
    );
    expect(broken).toEqual([]);
  });

  it('não confia em power.type (dado inconsistente em Magia Acelerada)', () => {
    expect(powerItemId({ name: 'Magia Acelerada', type: 'DESTINO' })).toBe(
      'power:MAGIA:Magia Acelerada'
    );
  });
});
