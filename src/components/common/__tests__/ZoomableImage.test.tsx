import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ZoomableImage from '../ZoomableImage';

describe('ZoomableImage', () => {
  it('abre a imagem ampliada pelo botão de lupa e fecha pelo X', () => {
    render(<ZoomableImage src='https://x/img.png' alt='Retrato' />);
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ampliar imagem' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getAllByAltText('Retrato')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  });

  it('amplia ao clicar na miniatura, a menos que clickToZoom seja falso', () => {
    const { rerender } = render(
      <ZoomableImage src='https://x/img.png' alt='Capa' />
    );
    fireEvent.click(screen.getByAltText('Capa'));
    expect(screen.getByRole('dialog')).toBeTruthy();

    rerender(
      <ZoomableImage
        key='sem-clique'
        src='https://x/img.png'
        alt='Capa'
        clickToZoom={false}
      />
    );
    fireEvent.click(screen.getByAltText('Capa'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('mostra o fallback quando a imagem falha', () => {
    render(
      <ZoomableImage
        src='https://x/quebrada.png'
        alt='Parceiro'
        fallback={<span>P</span>}
      />
    );
    fireEvent.error(screen.getByAltText('Parceiro'));
    expect(screen.queryByAltText('Parceiro')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ampliar imagem' })).toBeNull();
    expect(screen.getByText('P')).toBeTruthy();
  });
});
