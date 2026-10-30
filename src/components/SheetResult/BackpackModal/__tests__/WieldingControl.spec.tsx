import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import WieldingControl from '../WieldingControl';
import Equipment from '../../../../interfaces/Equipment';

const sword: Equipment = { id: 'sword', nome: 'Espada', group: 'Arma' };
const greatsword: Equipment = {
  id: 'gs',
  nome: 'Montante',
  group: 'Arma',
  twoHanded: true,
};

const openMenu = () =>
  fireEvent.click(screen.getByLabelText('Definir empunhadura'));

describe('WieldingControl', () => {
  test('sem Quatro Braços, só as duas mãos', () => {
    render(
      <WieldingControl item={sword} currentSlot={null} onChange={vi.fn()} />
    );
    openMenu();
    expect(screen.getByText('Mão Principal')).toBeTruthy();
    expect(screen.getByText('Mão Secundária')).toBeTruthy();
    expect(screen.queryByText('Mão Extra 1')).toBeNull();
  });

  test('com Quatro Braços, escolher uma mão extra', () => {
    const onChange = vi.fn();
    render(
      <WieldingControl
        item={sword}
        currentSlot={null}
        onChange={onChange}
        extraHands
      />
    );
    openMenu();
    expect(screen.getByText('Mão Extra 1')).toBeTruthy();
    fireEvent.click(screen.getByText('Mão Extra 2'));
    expect(onChange).toHaveBeenCalledWith('extra2');
  });

  test('arma de duas mãos escolhe entre os dois pares', () => {
    const onChange = vi.fn();
    render(
      <WieldingControl
        item={greatsword}
        currentSlot={null}
        onChange={onChange}
        extraHands
      />
    );
    openMenu();
    expect(screen.getByText('Mãos principais (ocupa duas mãos)')).toBeTruthy();
    expect(screen.queryByText('Mão Extra 1')).toBeNull();
    fireEvent.click(screen.getByText('Mãos extras (ocupa duas mãos)'));
    expect(onChange).toHaveBeenCalledWith('bothExtra');
  });

  test('mão extra bloqueada não dispara a troca', () => {
    const onChange = vi.fn();
    render(
      <WieldingControl
        item={sword}
        currentSlot={null}
        onChange={onChange}
        extraHands
        disabledSlots={{ extra1: { reason: 'Mão ocupada' } }}
      />
    );
    openMenu();
    expect(
      screen
        .getByText('Mão Extra 1')
        .closest('li')
        ?.getAttribute('aria-disabled')
    ).toBe('true');
  });
});
