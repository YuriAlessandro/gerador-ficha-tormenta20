/**
 * O gating não pode depender da UI.
 *
 * Uma ficha é um documento que o usuário controla: dá para exportar o JSON,
 * editar à mão e importar de volta, e a mesa virtual recebe fichas de outras
 * contas. Se a decisão "pode usar layout customizado?" morasse só no botão,
 * bastaria embutir um `layout` no payload para contornar o apoio.
 */
import { describe, it, expect } from 'vitest';
import {
  PRESET_ACTION_MENU,
  PRESET_SINGLE,
  DEFAULT_SHEET_LAYOUT,
} from '../../../../interfaces/sheetLayoutPresets';
import { resolveSheetLayoutFor } from '../sheetLayoutAccess';

describe('resolveSheetLayoutFor', () => {
  it('ignora o layout da ficha quando não há acesso', () => {
    const resolved = resolveSheetLayoutFor(false, {
      fromSheet: PRESET_ACTION_MENU,
    });

    expect(resolved).toBe(DEFAULT_SHEET_LAYOUT);
  });

  it('ignora o padrão do usuário quando não há acesso', () => {
    const resolved = resolveSheetLayoutFor(false, {
      fromUserDefault: PRESET_SINGLE,
    });

    expect(resolved).toBe(DEFAULT_SHEET_LAYOUT);
  });

  it('usa o layout da ficha quando há acesso', () => {
    const resolved = resolveSheetLayoutFor(true, {
      fromSheet: PRESET_ACTION_MENU,
    });

    expect(resolved.template).toBe('actionMenu');
  });

  it('cai no padrão do usuário quando a ficha não tem layout próprio', () => {
    const resolved = resolveSheetLayoutFor(true, {
      fromUserDefault: PRESET_SINGLE,
    });

    expect(resolved).toBe(PRESET_SINGLE);
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
