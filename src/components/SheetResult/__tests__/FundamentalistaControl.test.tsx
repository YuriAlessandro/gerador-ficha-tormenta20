import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import CharacterSheet from '@/interfaces/CharacterSheet';
import FundamentalistaControl from '../FundamentalistaControl';

const availability = { value: true };
vi.mock('@/hooks/useFundamentalist', () => ({
  useFundamentalistAvailable: () => availability.value,
  default: () => availability.value,
}));

const devotoDe = (deity: string, fundamentalista = false): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.classe = { ...sheet.classe, name: 'Guerreiro' };
  sheet.devoto = {
    divindade: { name: deity, poderes: [] },
    poderes: [],
    ...(fundamentalista
      ? { fundamentalista: { dogma: 'sacerdote' as const } }
      : {}),
  };
  return sheet;
};

describe('FundamentalistaControl', () => {
  beforeEach(() => {
    availability.value = true;
  });

  it('não aparece para quem não é devoto, nem para deus fora dos maiores', () => {
    const { container, rerender } = render(
      <FundamentalistaControl
        sheet={createMockCharacterSheet()}
        onChange={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <FundamentalistaControl
        sheet={devotoDe('Deus Inventado')}
        onChange={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('liga a marca com o dogma resolvido pela classe', () => {
    const onChange = vi.fn();
    render(
      <FundamentalistaControl sheet={devotoDe('Khalmyr')} onChange={onChange} />
    );
    fireEvent.click(screen.getByRole('switch', { name: /fundamentalista/i }));
    const next = onChange.mock.calls[0][0] as CharacterSheet;
    expect(next.devoto?.fundamentalista).toEqual({ dogma: 'sacerdote' });
  });

  it('desliga removendo o campo', () => {
    const onChange = vi.fn();
    render(
      <FundamentalistaControl
        sheet={devotoDe('Khalmyr', true)}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('switch', { name: /fundamentalista/i }));
    const next = onChange.mock.calls[0][0] as CharacterSheet;
    expect(next.devoto && 'fundamentalista' in next.devoto).toBe(false);
  });

  it('fica oculto com devoção dupla', () => {
    const sheet = devotoDe('Khalmyr');
    sheet.devoto!.divindadeSecundaria = 'Tanna-Toh';
    const { container } = render(
      <FundamentalistaControl sheet={sheet} onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('sem o suplemento, só aparece se a ficha já for fundamentalista', () => {
    availability.value = false;
    const { container, rerender } = render(
      <FundamentalistaControl sheet={devotoDe('Khalmyr')} onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <FundamentalistaControl
        sheet={devotoDe('Khalmyr', true)}
        onChange={vi.fn()}
      />
    );
    expect(
      screen.getByRole('switch', { name: /fundamentalista/i })
    ).toBeInTheDocument();
  });

  it('somente leitura: mostra marcado e desabilitado; não mostra quem não é', () => {
    const { container, rerender } = render(
      <FundamentalistaControl sheet={devotoDe('Khalmyr')} />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<FundamentalistaControl sheet={devotoDe('Khalmyr', true)} />);
    const toggle = screen.getByRole('switch', { name: /fundamentalista/i });
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
  });

  it('avisa no popover quando o dogma é adaptação do app', () => {
    const sheet = devotoDe('Khalmyr', true);
    sheet.classe = { ...sheet.classe, name: 'Druida' };
    render(<FundamentalistaControl sheet={sheet} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /sobre o dogma/i }));
    expect(screen.getByText(/não tem dogma de druida/)).toBeInTheDocument();
  });

  it('o ícone de informação abre o dogma, a arma e a página', () => {
    render(
      <FundamentalistaControl
        sheet={devotoDe('Khalmyr', true)}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /sobre o dogma/i }));
    expect(screen.getByText(/necessitado por dia/)).toBeInTheDocument();
    expect(screen.getByText(/Espada Longa/)).toBeInTheDocument();
    expect(screen.getByText(/Deuses de Arton, p\. 15/)).toBeInTheDocument();
  });
});
