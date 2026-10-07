import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import CharacterSheet from '@/interfaces/CharacterSheet';
import PendingExtraPowerAlert from '../PendingExtraPowerAlert';

const sheetWith = (pendente: boolean): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.devoto = {
    divindade: { name: 'Khalmyr', poderes: [] },
    poderes: [],
    ...(pendente ? { poderAdicionalPendente: true } : {}),
  };
  return sheet;
};

describe('PendingExtraPowerAlert', () => {
  it('não aparece sem o lembrete', () => {
    const { container } = render(
      <PendingExtraPowerAlert sheet={sheetWith(false)} onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('avisa e permite manter o poder', () => {
    const onChange = vi.fn();
    render(
      <PendingExtraPowerAlert sheet={sheetWith(true)} onChange={onChange} />
    );
    expect(
      screen.getByText(/era o adicional do fundamentalismo/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Manter assim' }));
    const next = onChange.mock.calls[0][0] as CharacterSheet;
    expect(next.devoto?.poderAdicionalPendente).toBeUndefined();
  });

  it('somente leitura: avisa sem o botão', () => {
    render(<PendingExtraPowerAlert sheet={sheetWith(true)} />);
    expect(
      screen.getByText(/era o adicional do fundamentalismo/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manter assim' })).toBeNull();
  });
});
