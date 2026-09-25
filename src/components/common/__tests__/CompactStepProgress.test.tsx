import React from 'react';
import { render, screen } from '@testing-library/react';
import CompactStepProgress from '../CompactStepProgress';

const steps = ['Informações Básicas', 'Atributos da Raça', 'Perícias'];

describe('CompactStepProgress', () => {
  it('mostra o passo atual e o rótulo dele', () => {
    render(<CompactStepProgress activeStep={0} steps={steps} />);
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
  });

  it('preenche a barra proporcionalmente e a descreve para leitores de tela', () => {
    render(<CompactStepProgress activeStep={1} steps={steps} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '67');
    expect(bar).toHaveAttribute(
      'aria-label',
      'Passo 2 de 3: Atributos da Raça'
    );
  });

  it('limita um passo fora do intervalo', () => {
    const { rerender } = render(
      <CompactStepProgress activeStep={7} steps={steps} />
    );
    expect(screen.getByText('Passo 3 de 3')).toBeInTheDocument();
    rerender(<CompactStepProgress activeStep={-2} steps={steps} />);
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument();
  });

  it('não renderiza nada sem passos', () => {
    const { container } = render(
      <CompactStepProgress activeStep={0} steps={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('usa reticências no rótulo em vez de quebrar linha', () => {
    render(
      <CompactStepProgress
        activeStep={0}
        steps={['Um rótulo de passo muito comprido que não caberia na tela']}
      />
    );
    expect(
      screen.getByText(
        'Um rótulo de passo muito comprido que não caberia na tela'
      )
    ).toHaveClass('MuiTypography-noWrap');
  });
});
