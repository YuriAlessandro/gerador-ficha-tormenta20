import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  PRESET_ACTION_MENU,
  PRESET_TABS,
} from '../../../../interfaces/sheetLayoutPresets';
import SheetLayoutWireframe from '../SheetLayoutWireframe';

describe('SheetLayoutWireframe', () => {
  it('desenha as abas do modelo de abas', () => {
    render(<SheetLayoutWireframe layout={PRESET_TABS} />);

    expect(screen.getAllByText('Ataques').length).toBeGreaterThan(0);
    expect(screen.getByText('Identidade')).toBeInTheDocument();
    // As abas "só celular" (Perícias, Diário) ficam fora da miniatura: o
    // único "Diário" é o bloco da coluna direita.
    expect(screen.getAllByText('Diário')).toHaveLength(1);
  });

  it('desenha as telas do menu de ação', () => {
    render(<SheetLayoutWireframe layout={PRESET_ACTION_MENU} />);

    expect(screen.getByText('Combate')).toBeInTheDocument();
    expect(screen.getByText('Inventário')).toBeInTheDocument();
  });

  it('não quebra com payload hostil', () => {
    expect(() =>
      render(<SheetLayoutWireframe layout={{ regions: 'x' }} />)
    ).not.toThrow();
  });
});
