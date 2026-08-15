/**
 * Sucessor dos testes que viviam em `equipmentTableLayout.spec.ts` e cobriam o
 * `sheetTabMemory`. Os casos originais foram preservados; o que mudou é que a
 * chave passou a incluir o layout, porque o id de uma aba só existe dentro do
 * layout que a criou.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearSheetSurfaceMemory,
  getRememberedSheetSurface,
  rememberSheetSurface,
} from '../sheetSurfaceMemory';

const LAYOUT = 'preset:tabs';

beforeEach(() => {
  clearSheetSurfaceMemory();
});

describe('memória da aba/tela aberta', () => {
  it('não lembra nada antes da primeira escrita', () => {
    expect(getRememberedSheetSurface('ficha-nova', LAYOUT)).toBeUndefined();
  });

  it('devolve a última região da ficha', () => {
    rememberSheetSurface('ficha-a', LAYOUT, 'r-equipment');
    expect(getRememberedSheetSurface('ficha-a', LAYOUT)).toBe('r-equipment');
  });

  it('não mistura fichas diferentes', () => {
    rememberSheetSurface('ficha-b', LAYOUT, 'r-spells');
    rememberSheetSurface('ficha-c', LAYOUT, 'r-powers');

    expect(getRememberedSheetSurface('ficha-b', LAYOUT)).toBe('r-spells');
    expect(getRememberedSheetSurface('ficha-c', LAYOUT)).toBe('r-powers');
  });

  it('ignora ficha sem id, para uma não herdar a aba da outra', () => {
    rememberSheetSurface('', LAYOUT, 'r-spells');
    expect(getRememberedSheetSurface('', LAYOUT)).toBeUndefined();
  });

  it('não restaura a região de um layout para outro', () => {
    // O id de uma aba só existe dentro do layout que a criou. Sem o layout na
    // chave, trocar de modelo restauraria um id inexistente e o template cairia
    // na primeira aba sem explicação.
    rememberSheetSurface('ficha-d', 'preset:tabs', 'r-spells');

    expect(
      getRememberedSheetSurface('ficha-d', 'preset:actionMenu')
    ).toBeUndefined();
    expect(getRememberedSheetSurface('ficha-d', 'preset:tabs')).toBe(
      'r-spells'
    );
  });
});
