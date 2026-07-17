import {
  stripSheetForStorage,
  computeSheetDelta,
} from '../sheetPayloadOptimizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';

describe('stripSheetForStorage', () => {
  it('omite chaves de nível superior cujo valor é undefined', () => {
    const sheet = createMockCharacterSheet();
    sheet.manualMaxPV = undefined;
    sheet.manualMaxPM = undefined;

    const stripped = stripSheetForStorage(sheet);

    expect('manualMaxPV' in stripped).toBe(false);
    expect('manualMaxPM' in stripped).toBe(false);
  });

  it('preserva chaves cujo valor é zero, string vazia ou null', () => {
    const sheet = createMockCharacterSheet() as unknown as Record<
      string,
      unknown
    >;
    sheet.manualPVEdit = 0;
    sheet.bonusPV = null;
    sheet.alcunha = '';

    const stripped = stripSheetForStorage(sheet as unknown as CharacterSheet);

    expect(stripped.manualPVEdit).toBe(0);
    expect(stripped.bonusPV).toBe(null);
    expect(stripped.alcunha).toBe('');
  });
});

describe('computeSheetDelta', () => {
  it('retorna null quando nada mudou', () => {
    const baseline = { nome: 'A', nivel: 1 };
    const updated = { nome: 'A', nivel: 1 };

    expect(computeSheetDelta(baseline, updated)).toBe(null);
  });

  it('inclui apenas chaves alteradas', () => {
    const baseline = { nome: 'A', nivel: 1, pv: 20 };
    const updated = { nome: 'B', nivel: 1, pv: 25 };

    expect(computeSheetDelta(baseline, updated)).toEqual({
      nome: 'B',
      pv: 25,
    });
  });

  it('emite null para chaves ausentes em updated (deleção explícita)', () => {
    const baseline = { nome: 'A', manualMaxPV: 50 };
    const updated = { nome: 'A' };

    expect(computeSheetDelta(baseline, updated)).toEqual({
      manualMaxPV: null,
    });
  });

  it('regressão: chave limpa via stripSheetForStorage vira null no delta', () => {
    // Cenário do bug: usuário define manualMaxPV, depois apaga (undefined).
    // stripSheetForStorage deve omitir a chave; computeSheetDelta deve
    // emitir null para que o backend interprete como $unset.
    const baselineSheet = createMockCharacterSheet();
    baselineSheet.manualMaxPV = 50;
    const baseline = stripSheetForStorage(baselineSheet);

    const updatedSheet = createMockCharacterSheet();
    updatedSheet.manualMaxPV = undefined;
    const updated = stripSheetForStorage(updatedSheet);

    const delta = computeSheetDelta(baseline, updated);

    expect(delta).not.toBe(null);
    expect(delta!.manualMaxPV).toBe(null);
  });

  it('ignora o marcador __stripped__', () => {
    const baselineSheet = createMockCharacterSheet();
    const updatedSheet = createMockCharacterSheet();
    updatedSheet.nome = 'Outro Nome';

    const baseline = stripSheetForStorage(baselineSheet);
    const updated = stripSheetForStorage(updatedSheet);

    const delta = computeSheetDelta(baseline, updated);

    expect(delta).not.toBe(null);
    expect('__stripped__' in delta!).toBe(false);
  });
});
