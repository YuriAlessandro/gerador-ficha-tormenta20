import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrimoireItemCard from '../cards/GrimoireItemCard';
import {
  getFullEncyclopediaIndex,
  resolveItem,
} from '../../../functions/pocketGrimoire/resolveItems';
import { prefixOf } from '../../../functions/pocketGrimoire/itemId';
import { renderWithProviders } from './renderWithProviders';

const idWithPrefix = (prefix: string) =>
  getFullEncyclopediaIndex().find((e) => prefixOf(e.id) === prefix)?.id ?? '';

describe('GrimoireItemCard', () => {
  it('magia aberta mostra estatísticas e aprimoramentos', () => {
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Bola de Fogo')}
        defaultOpen
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    expect(screen.getByText('Reflexos reduz à metade')).toBeInTheDocument();
    expect(screen.getByText('Aprimoramentos')).toBeInTheDocument();
  });

  it('magia fechada mostra resumo e abre ao clicar', () => {
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Bola de Fogo')}
        defaultOpen={false}
        onRemove={vi.fn()}
      />
    );
    expect(screen.queryByText('Aprimoramentos')).not.toBeInTheDocument();
    expect(screen.getByText(/Evoc · Padrão · Médio/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByText('Aprimoramentos')).toBeInTheDocument();
  });

  it('botão de remover chama onRemove com o id', () => {
    const onRemove = vi.fn();
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Bola de Fogo')}
        defaultOpen={false}
        onRemove={onRemove}
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Bola de Fogo do grimório' })
    );
    expect(onRemove).toHaveBeenCalledWith('spell:Bola de Fogo');
  });

  it('poder geral aberto mostra descrição', () => {
    const item = resolveItem(idWithPrefix('power'));
    renderWithProviders(
      <GrimoireItemCard item={item} defaultOpen onRemove={vi.fn()} />
    );
    if (item.kind !== 'power') throw new Error('esperava poder');
    expect(
      screen.getByText(item.power.description.slice(0, 30), { exact: false })
    ).toBeInTheDocument();
  });

  it('resumo tem link para a enciclopédia', () => {
    const item = resolveItem(idWithPrefix('class'));
    renderWithProviders(
      <GrimoireItemCard item={item} defaultOpen onRemove={vi.fn()} />
    );
    expect(
      screen.getByRole('link', { name: /Ver na enciclopédia/ })
    ).toHaveAttribute('href', expect.stringMatching(/^\/database\/classes\//));
  });

  it('item não encontrado avisa e permite remover', () => {
    const onRemove = vi.fn();
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Magia Sumida')}
        defaultOpen={false}
        onRemove={onRemove}
      />
    );
    expect(
      screen.getByText('Magia Sumida não existe mais na enciclopédia.')
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Magia Sumida do grimório' })
    );
    expect(onRemove).toHaveBeenCalledWith('spell:Magia Sumida');
  });
});
