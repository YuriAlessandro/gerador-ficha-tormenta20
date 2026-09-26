import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { useIsMobile } from '../useIsMobile';

/**
 * O setup global devolve `matches: false` para tudo. Aqui a media query de
 * `max-width` é avaliada de verdade contra uma largura simulada, que é o que
 * `theme.breakpoints.down('md')` gera: `(max-width:899.95px)`.
 */
const originalMatchMedia = window.matchMedia;

const setViewportWidth = (width: number) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const max = /max-width:\s*([\d.]+)px/.exec(query);
    return {
      matches: max ? width <= Number(max[1]) : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
};

const Probe = () => <span>{useIsMobile() ? 'mobile' : 'desktop'}</span>;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('useIsMobile', () => {
  it('é mobile num celular (390px)', () => {
    setViewportWidth(390);
    render(<Probe />);
    expect(screen.getByText('mobile')).toBeInTheDocument();
  });

  it('é mobile logo abaixo de 900px', () => {
    setViewportWidth(899);
    render(<Probe />);
    expect(screen.getByText('mobile')).toBeInTheDocument();
  });

  it('é desktop a partir de 900px', () => {
    setViewportWidth(900);
    render(<Probe />);
    expect(screen.getByText('desktop')).toBeInTheDocument();
  });
});
