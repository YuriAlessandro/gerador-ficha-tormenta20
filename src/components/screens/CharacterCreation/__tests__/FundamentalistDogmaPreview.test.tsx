import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FundamentalistDogmaPreview from '../FundamentalistDogmaPreview';

describe('FundamentalistDogmaPreview', () => {
  it('mostra o resumo, a arma preferida e a página do dogma escolhido', () => {
    render(<FundamentalistDogmaPreview deityName='KHALMYR' dogma='paladino' />);
    expect(screen.getByText('Mesmo dogma do sacerdote.')).toBeInTheDocument();
    expect(screen.getByText(/necessitado por dia/)).toBeInTheDocument();
    expect(screen.getByText(/Espada Longa/)).toBeInTheDocument();
    expect(
      screen.getByText('Deuses de Arton, p. 15 e 28.')
    ).toBeInTheDocument();
  });

  it('acompanha a troca de dogma', () => {
    const { rerender } = render(
      <FundamentalistDogmaPreview deityName='AZGHER' dogma='sacerdote' />
    );
    expect(screen.queryByText(/necromantes/)).toBeNull();
    rerender(
      <FundamentalistDogmaPreview deityName='AZGHER' dogma='paladino' />
    );
    expect(screen.getByText(/necromantes/)).toBeInTheDocument();
    expect(screen.getByText('Dogma do sacerdote, mais:')).toBeInTheDocument();
  });

  it('não renderiza nada para deus sem dogma', () => {
    const { container } = render(
      <FundamentalistDogmaPreview
        deityName='Deus Inventado'
        dogma='sacerdote'
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
