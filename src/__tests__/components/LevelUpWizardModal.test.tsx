import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LevelUpWizardModal from '@/components/LevelUpWizard/LevelUpWizardModal';
import { dataRegistry } from '@/data/registry';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import { SupplementId } from '@/types/supplement.types';
import { Atributo } from '@/data/systems/tormenta20/atributos';

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

    // A asserção é ESCOPADA no card do poder: com "Só os que posso pegar"
    // desligado — ou com uma busca digitada — a lista
    // também traz os reprovados, marcados "Indisponível", então um
    // `queryByText` global pegaria os vizinhos.
    const card = nomeDoPoder.closest('.MuiPaper-root');
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).queryByText('Indisponível')
    ).not.toBeInTheDocument();
  });
});

describe('LevelUpWizardModal — fabricação de engenhocas', () => {
  const buildInventor = (comEngenhoqueiro: boolean) => {
    const sheet = createMockCharacterSheet();
    const inventor = dataRegistry.getClassByName(
      'Inventor',
      ACTIVE_SUPPLEMENTS
    );
    if (!inventor) throw new Error('Inventor não encontrado no registry');

    sheet.nivel = 2;
    sheet.classe = inventor;
    sheet.classLevels = [1, 2].map((level) => ({
      level,
      className: 'Inventor',
    }));
    sheet.atributos[Atributo.INTELIGENCIA].value = 3;
    sheet.classPowers = comEngenhoqueiro
      ? inventor.powers.filter((p) => p.name === 'Engenhoqueiro')
      : [];
    return sheet;
  };

  const renderWizard = (comEngenhoqueiro: boolean) =>
    render(
      <LevelUpWizardModal
        open
        initialSheet={buildInventor(comEngenhoqueiro)}
        targetLevel={3}
        supplements={ACTIVE_SUPPLEMENTS}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

  it('mostra o passo Engenhocas para quem tem Engenhoqueiro', () => {
    renderWizard(true);
    expect(screen.getByText('Engenhocas')).toBeInTheDocument();
  });

  it('não mostra o passo para Inventor sem o poder', () => {
    renderWizard(false);
    expect(screen.queryByText('Engenhocas')).not.toBeInTheDocument();
  });
});
