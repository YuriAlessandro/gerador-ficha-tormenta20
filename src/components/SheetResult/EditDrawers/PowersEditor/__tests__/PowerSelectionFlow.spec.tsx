import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import BARDO from '@/data/systems/tormenta20/classes/bardo';
import { SupplementId } from '@/types/supplement.types';
import PowersEditorModal from '../PowersEditorModal';

vi.mock('@/hooks/useContentSupplements', () => ({
  useContentSupplements: () => [SupplementId.TORMENTA20_CORE],
}));

/**
 * Poder que exige escolha do jogador (perícia, magia, atributo, familiar,
 * arma...) precisa abrir o `PowerSelectionDialog` antes de entrar na ficha. O
 * caminho é `getPowerSelectionRequirements` → `requiresUserInput` → diálogo, e
 * vale igual para poder geral e de classe.
 *
 * Arquivo separado de propósito: rodando junto das outras suítes do editor,
 * este cenário falha por interferência de estado entre testes — o factory
 * `createMockCharacterSheet` devolve o mesmo objeto de classe em toda chamada e
 * há testes que recalculam a ficha. Isolar o módulo é mais barato e mais
 * estável do que costurar limpezas em volta de um mock compartilhado.
 */
describe('poderes que exigem escolha manual', () => {
  const renderBardo = () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = { ...BARDO };
    sheet.nivel = 6;
    const onSave = vi.fn();

    render(
      <PowersEditorModal open onClose={vi.fn()} sheet={sheet} onSave={onSave} />
    );

    return { onSave };
  };

  it('abre o diálogo de escolha e retém o poder até a confirmação', async () => {
    renderBardo();

    fireEvent.change(
      screen.getByPlaceholderText('Buscar poder ou habilidade...'),
      { target: { value: 'Aumento de Atributo' } }
    );

    const checkbox = await screen.findByLabelText(
      'Selecionar Aumento de Atributo'
    );
    fireEvent.click(checkbox);

    // O rótulo vem de `getPowerSelectionRequirements`. Consultar por texto e
    // não por `role=dialog`: ao abrir o diálogo aninhado o MUI marca o modal
    // externo com `aria-hidden`, e `getAllByRole` passa a enxergar só um.
    expect(
      await screen.findByText('Selecione 1 atributo para aumentar')
    ).toBeInTheDocument();

    // O poder fica retido no diálogo — não entra na ficha só por ser marcado.
    expect(
      screen.queryByLabelText('Remover Aumento de Atributo')
    ).not.toBeInTheDocument();
  });
});
