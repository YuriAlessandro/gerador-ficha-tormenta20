import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import _ from 'lodash';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import GRANTED_POWERS from '@/data/systems/tormenta20/powers/grantedPowers';
import { recalculateSheet } from '@/functions/recalculateSheet';
import HYNINN from '@/data/systems/tormenta20/divindades/hyninn';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import PowerDetailBody from '../PowerDetailBody';

/**
 * O corpo do detalhe de um poder é um componente só, usado pelo accordion do
 * desktop e pelo bottom sheet do mobile.
 *
 * O que se trava aqui é a resposta ao feedback "Golpista Divino não está dando
 * bônus de Ladinagem": o card tem que provar, sem hover e sem sair da aba, que
 * o poder aplicou os três +2 — a coluna "Outros" da tabela de perícias mostra
 * "+1" em Ladinagem porque soma a penalidade de armadura no mesmo campo.
 */
const forceMobile = () => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('max-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const { GOLPISTA_DIVINO } = GRANTED_POWERS;

const mkDevotoSheet = (): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.devoto = {
    divindade: _.cloneDeep(HYNINN),
    poderes: [_.cloneDeep(GOLPISTA_DIVINO)],
  };
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  return recalculateSheet(sheet);
};

const renderBody = (
  sheet: CharacterSheet | undefined,
  history: SheetActionHistoryEntry[]
) =>
  render(
    <PowerDetailBody
      power={GOLPISTA_DIVINO}
      originKind='deityPower'
      sheetHistory={history}
      sheet={sheet}
    />
  );

describe('PowerDetailBody — "Aplicado na ficha"', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lista os três +2 do Golpista Divino', () => {
    const sheet = mkDevotoSheet();
    renderBody(sheet, sheet.sheetActionHistory);

    expect(screen.getByText('Aplicado na ficha')).toBeInTheDocument();
    expect(screen.getByText('Ladinagem +2')).toBeInTheDocument();
    expect(screen.getByText('Enganação +2')).toBeInTheDocument();
    expect(screen.getByText('Jogatina +2')).toBeInTheDocument();
  });

  it('atribui o poder à divindade em vez de "Origem não identificada"', () => {
    const sheet = mkDevotoSheet();
    renderBody(sheet, sheet.sheetActionHistory);

    expect(screen.getByText(/Vindo de: Devoto de Hyninn/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Origem não identificada/)
    ).not.toBeInTheDocument();
  });

  it('omite a seção quando não há ficha, sem quebrar', () => {
    renderBody(undefined, []);

    expect(screen.queryByText('Aplicado na ficha')).not.toBeInTheDocument();
    expect(screen.getByText(/Vindo de:/)).toBeInTheDocument();
  });

  it('mostra os bônus também no caminho mobile', () => {
    forceMobile();
    const sheet = mkDevotoSheet();
    renderBody(sheet, sheet.sheetActionHistory);

    expect(screen.getByText('Ladinagem +2')).toBeInTheDocument();
  });
});
