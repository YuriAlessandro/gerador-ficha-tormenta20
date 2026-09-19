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
    // Resumo com os ícones de execução, alcance e duração.
    const summary = screen.getByTestId('grimoire-card-summary');
    expect(summary).toHaveTextContent('Padrão');
    expect(summary).toHaveTextContent('Médio');
    expect(summary).toHaveTextContent('Instantânea');
    expect(summary.querySelectorAll('svg')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByText('Aprimoramentos')).toBeInTheDocument();
  });

  it('detalhe da magia explica os termos com ⓘ', async () => {
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Bola de Fogo')}
        defaultOpen
        onRemove={vi.fn()}
      />
    );
    const info = screen.getByRole('button', {
      name: 'O que significa "Médio"?',
    });
    fireEvent.mouseOver(info);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('30m');
    expect(
      screen.getByRole('button', {
        name: 'O que significa "Reflexos reduz à metade"?',
      })
    ).toBeInTheDocument();
    // Área não tem termo padronizado: sem ⓘ.
    expect(
      screen.queryByRole('button', {
        name: 'O que significa "Esfera com 6m de raio"?',
      })
    ).not.toBeInTheDocument();
  });

  it('classe inteira mostra o resumo dos dados', () => {
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('class:Arcanista')}
        defaultOpen
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText('Pontos de vida')).toBeInTheDocument();
    expect(screen.getByText('Habilidades')).toBeInTheDocument();
  });

  it('chips seguem o estilo das cartas: preenchidos, na cor do tipo', () => {
    renderWithProviders(
      <>
        <GrimoireItemCard
          item={resolveItem('spell:Bola de Fogo')}
          defaultOpen={false}
          onRemove={vi.fn()}
        />
        <GrimoireItemCard
          item={resolveItem('spell:Curar Ferimentos')}
          defaultOpen={false}
          onRemove={vi.fn()}
        />
        <GrimoireItemCard
          item={resolveItem('class:Arcanista')}
          defaultOpen={false}
          onRemove={vi.fn()}
        />
        <GrimoireItemCard
          item={resolveItem('power:MAGIA:Magia Acelerada')}
          defaultOpen={false}
          onRemove={vi.fn()}
        />
      </>
    );
    const chip = (label: string) =>
      screen.getByText(label).closest('.MuiChip-root');
    expect(chip('Arcana')).toHaveClass('MuiChip-filled');
    expect(chip('Divina')).toHaveClass('MuiChip-filled');
    expect(chip('Classe')).toHaveClass('MuiChip-filled');
    expect(chip('Arcana')).toHaveAttribute('data-accent', 'arcane');
    expect(chip('Divina')).toHaveAttribute('data-accent', 'divine');
    expect(chip('Classe')).toHaveAttribute('data-accent', 'entity');
    expect(chip('Poder geral')).toHaveAttribute('data-accent', 'power');
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
