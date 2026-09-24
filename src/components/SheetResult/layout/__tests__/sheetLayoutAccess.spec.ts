/**
 * Quem desenha a ficha é o layout DELA, para qualquer visualizador — o mestre
 * sem apoio vê a ficha do jogador apoiador como o jogador a montou. A única
 * chave que derruba isso é a flag (kill-switch). O payload continua sendo
 * tratado como hostil: tudo passa pelo saneamento.
 */
import { describe, it, expect } from 'vitest';
import {
  PRESET_ACTION_MENU,
  PRESET_SINGLE,
  DEFAULT_SHEET_LAYOUT,
} from '../../../../interfaces/sheetLayoutPresets';
import { resolveSheetLayoutFor } from '../sheetLayoutAccess';

describe('resolveSheetLayoutFor', () => {
  it('flag desligada: todos veem o arranjo histórico', () => {
    const resolved = resolveSheetLayoutFor(false, {
      fromSheet: PRESET_ACTION_MENU,
    });

    expect(resolved).toBe(DEFAULT_SHEET_LAYOUT);
  });

  it('flag ligada: usa o layout da ficha, independente de quem olha', () => {
    const resolved = resolveSheetLayoutFor(true, {
      fromSheet: PRESET_ACTION_MENU,
    });

    expect(resolved.template).toBe('actionMenu');
  });

  it('cai no preset histórico quando não há nada', () => {
    expect(resolveSheetLayoutFor(true, {})).toBe(DEFAULT_SHEET_LAYOUT);
  });

  it('saneia o layout vindo da ficha em vez de confiar nele', () => {
    const hostil = {
      schemaVersion: 1,
      id: 'x',
      name: 'Hostil',
      template: 'tabs',
      // Sem a seção obrigatória: um documento assim quebraria a ficha.
      regions: [{ id: 'r1', role: 'main', sections: [] }],
      theme: {},
    };

    expect(resolveSheetLayoutFor(true, { fromSheet: hostil })).toBe(
      DEFAULT_SHEET_LAYOUT
    );
  });

  it('não lança com layout corrompido na ficha', () => {
    expect(() =>
      resolveSheetLayoutFor(true, { fromSheet: 'não é um objeto' })
    ).not.toThrow();
  });

  it('o preview do editor tem precedência, inclusive sobre a ficha', () => {
    const resolved = resolveSheetLayoutFor(true, {
      override: PRESET_SINGLE,
      fromSheet: PRESET_ACTION_MENU,
    });

    expect(resolved).toBe(PRESET_SINGLE);
  });
});
