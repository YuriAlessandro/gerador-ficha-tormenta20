import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClassDescription } from '@/interfaces/Class';
import { DivindadeEnum } from '@/data/systems/tormenta20/divindades';
import DeityPowerStep from '../DeityPowerStep';

const GUERREIRO = { name: 'Guerreiro' } as ClassDescription;

describe('DeityPowerStep — fundamentalista', () => {
  it('libera um poder concedido a mais', () => {
    render(
      <DeityPowerStep
        classe={GUERREIRO}
        deity={DivindadeEnum.KHALMYR}
        powerPool={DivindadeEnum.KHALMYR.poderes}
        selectedPowers={[]}
        onChange={vi.fn()}
        fundamentalista
      />
    );
    expect(screen.getByText('Selecionados: 0 / 2')).toBeInTheDocument();
    expect(
      screen.getByText(/Fundamentalista: \+1 poder concedido/)
    ).toBeInTheDocument();
  });

  it('sem a marca segue o valor da classe', () => {
    render(
      <DeityPowerStep
        classe={GUERREIRO}
        deity={DivindadeEnum.KHALMYR}
        powerPool={DivindadeEnum.KHALMYR.poderes}
        selectedPowers={[]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Selecionados: 0 / 1')).toBeInTheDocument();
  });
});
