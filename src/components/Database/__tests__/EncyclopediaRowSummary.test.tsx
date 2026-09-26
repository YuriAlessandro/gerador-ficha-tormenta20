import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import EncyclopediaRowSummary from '../EncyclopediaRowSummary';

const renderSummary = (open = false) => {
  const onToggle = vi.fn();
  const onShare = vi.fn();
  render(
    <EncyclopediaRowSummary
      name='Abençoar Alimentos'
      open={open}
      onToggle={onToggle}
      badge='1º'
      tags={<span>Divina</span>}
      action={
        <button type='button' onClick={onShare}>
          Compartilhar
        </button>
      }
    />
  );
  return { onToggle, onShare };
};

describe('EncyclopediaRowSummary', () => {
  it('mostra nome, selo, etiquetas e ação', () => {
    renderSummary();
    expect(screen.getByText('Abençoar Alimentos')).toBeInTheDocument();
    expect(screen.getByText('1º')).toBeInTheDocument();
    expect(screen.getByText('Divina')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compartilhar' })
    ).toBeInTheDocument();
  });

  it('expande ao tocar em qualquer ponto da linha', () => {
    const { onToggle } = renderSummary();
    fireEvent.click(screen.getByText('Divina'));
    fireEvent.click(screen.getByText('1º'));
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('o botão do nome alterna uma única vez e informa o estado', () => {
    const { onToggle } = renderSummary(true);
    const toggle = screen.getByRole('button', { name: /Abençoar Alimentos/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('a ação não expande a linha', () => {
    const { onToggle, onShare } = renderSummary();
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' }));
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('funciona sem selo, etiquetas nem ação', () => {
    const onToggle = vi.fn();
    render(
      <EncyclopediaRowSummary name='Anão' open={false} onToggle={onToggle} />
    );
    const toggle = screen.getByRole('button', { name: /Anão/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
