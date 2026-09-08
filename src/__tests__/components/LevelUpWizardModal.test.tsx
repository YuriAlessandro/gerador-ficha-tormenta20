import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LevelUpWizardModal from '@/components/LevelUpWizard/LevelUpWizardModal';
import { dataRegistry } from '@/data/registry';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import { SupplementId } from '@/types/supplement.types';

vi.mock('@/hooks/useFeatureAccess', () => ({
  useFeatureAccess: () => ({
    hasAccess: false,
    isEnabled: false,
    isLoading: false,
    supporterOnly: false,
  }),
}));

const ACTIVE_SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

describe('LevelUpWizardModal — pré-requisitos do nível atual', () => {
  it('libera poderes que exigem poder concedido por habilidade do mesmo nível', () => {
    const sheet = createMockCharacterSheet();
    const alquimista = dataRegistry.getClassByName(
      'Alquimista',
      ACTIVE_SUPPLEMENTS
    );
    if (!alquimista) throw new Error('Alquimista não encontrado no registry');

    sheet.nivel = 1;
    sheet.classe = alquimista;
    sheet.classLevels = [{ level: 1, className: 'Alquimista' }];

    render(
      <LevelUpWizardModal
        open
        initialSheet={sheet}
        targetLevel={2}
        supplements={ACTIVE_SUPPLEMENTS}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));

    const nomeDoPoder = screen.getByText('Alquimista Exímio');
    expect(nomeDoPoder).toBeInTheDocument();

    // A asserção é ESCOPADA no card do poder: a lista de poderes de classe
    // agora também mostra os reprovados por pré-requisito, marcados
    // "Indisponível", então um `queryByText` global pegaria os vizinhos.
    const card = nomeDoPoder.closest('.MuiPaper-root');
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).queryByText('Indisponível')
    ).not.toBeInTheDocument();
  });
});
