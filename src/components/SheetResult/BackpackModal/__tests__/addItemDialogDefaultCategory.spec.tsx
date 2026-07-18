import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SupplementId } from '@/types/supplement.types';
import { CATEGORY_ORDER } from '../itemTypeStyles';
import AddItemDialog from '../AddItemDialog';

// O diálogo lê os suplementos ativos do Redux; aqui só precisamos do core.
vi.mock('@/hooks/useContentSupplements', () => ({
  useContentSupplements: () => [SupplementId.TORMENTA20_CORE],
}));

const renderDialog = (defaultCategory?: (typeof CATEGORY_ORDER)[number]) =>
  render(
    <AddItemDialog
      open
      onClose={() => undefined}
      onAddItem={() => undefined}
      defaultCategory={defaultCategory}
    />
  );

const selectedTabName = (): string | null => {
  const selected = screen
    .getAllByRole('tab')
    .find((tab) => tab.getAttribute('aria-selected') === 'true');
  return selected?.textContent ?? null;
};

describe('AddItemDialog — aba inicial', () => {
  it('abre na aba da categoria informada', () => {
    renderDialog('Armadura');
    expect(selectedTabName()).toBe('Armadura');
  });

  it('abre em outra categoria quando pedido', () => {
    renderDialog('Alquimía');
    expect(selectedTabName()).toBe('Alquimía');
  });

  it('sem categoria informada, abre na primeira aba', () => {
    renderDialog(undefined);
    expect(selectedTabName()).toBe(CATEGORY_ORDER[0]);
  });
});
