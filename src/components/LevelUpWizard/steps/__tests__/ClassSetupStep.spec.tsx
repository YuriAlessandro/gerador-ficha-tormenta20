import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ClassSetupStep from '@/components/LevelUpWizard/steps/ClassSetupStep';
import { ClassSetupSelection } from '@/interfaces/WizardSelections';
import { SupplementId } from '@/types/supplement.types';

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
];

function renderStep(
  classSetup: ClassSetupSelection,
  onChange = vi.fn(),
  recoveringDeus = false
) {
  render(
    <ClassSetupStep
      selectedClassName='Arcanista'
      classSetup={classSetup}
      onChange={onChange}
      activeSupplements={SUPPLEMENTS}
      recoveringDeus={recoveringDeus}
    />
  );
  return onChange;
}

describe('ClassSetupStep — Arcanista na multiclasse', () => {
  it('usa os cards de caminho da criação de personagem', () => {
    const onChange = renderStep({});
    fireEvent.click(screen.getByRole('radio', { name: /Feiticeiro/ }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ arcanistaSubtype: 'Feiticeiro' })
    );
    expect(screen.queryByText(/Linhagem Dracônica/)).toBeNull();
  });

  it('mostra os cards de linhagem para o Feiticeiro', () => {
    const onChange = renderStep({ arcanistaSubtype: 'Feiticeiro' });
    fireEvent.click(screen.getByRole('radio', { name: /Linhagem Abençoada/ }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        arcanistaSubtype: 'Feiticeiro',
        feiticeiroLinhagem: 'Linhagem Abençoada',
      })
    );
  });

  it('na recuperação pede só o deus', () => {
    renderStep(
      {
        arcanistaSubtype: 'Feiticeiro',
        feiticeiroLinhagem: 'Linhagem Abençoada',
      },
      vi.fn(),
      true
    );
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });
});
