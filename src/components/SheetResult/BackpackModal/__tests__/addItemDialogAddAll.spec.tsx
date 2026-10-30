import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SupplementId } from '@/types/supplement.types';
import Equipment from '@/interfaces/Equipment';
import EQUIPAMENTOS from '@/data/systems/tormenta20/equipamentos';
import AddItemDialog from '../AddItemDialog';

vi.mock('@/hooks/useContentSupplements', () => ({
  useContentSupplements: () => [SupplementId.TORMENTA20_CORE],
}));

const renderDialog = (onAddMany?: (items: Equipment[]) => void) =>
  render(
    <AddItemDialog
      open
      onClose={() => undefined}
      onAddItem={() => undefined}
      onAddMany={onAddMany}
      defaultCategory='Armadura'
    />
  );

const names = (items: Equipment[]) => items.map((i) => i.nome).sort();

describe('AddItemDialog — "Adicionar todos"', () => {
  it('sem onAddMany (mochila), não mostra os botões', () => {
    renderDialog();
    expect(screen.queryByText(/adicionar todos/i)).not.toBeInTheDocument();
  });

  it('o botão da categoria envia todos os itens dela', () => {
    const onAddMany = vi.fn();
    renderDialog(onAddMany);
    fireEvent.click(
      screen.getByRole('button', {
        name: /^adicionar todos de armaduras \(\d+\)$/i,
      })
    );
    expect(names(onAddMany.mock.calls[0][0])).toEqual(
      names([
        ...(EQUIPAMENTOS.armadurasLeves as Equipment[]),
        ...(EQUIPAMENTOS.armaduraPesada as Equipment[]),
      ])
    );
  });

  it('o botão da subcategoria envia só os itens dela', () => {
    const onAddMany = vi.fn();
    renderDialog(onAddMany);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Adicionar todos de Armaduras Pesadas',
      })
    );
    expect(names(onAddMany.mock.calls[0][0])).toEqual(
      names(EQUIPAMENTOS.armaduraPesada as Equipment[])
    );
  });
});
