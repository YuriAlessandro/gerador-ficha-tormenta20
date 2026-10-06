/**
 * Fundamentalista na persistência: `stripSheetForStorage` remonta `devoto`
 * campo a campo, e campo não listado some ao salvar na nuvem.
 */
import { describe, it, expect } from 'vitest';
import { normalizeSheet } from '../sheetNormalizer';
import { stripSheetForStorage } from '../sheetPayloadOptimizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { DivindadeEnum } from '../../data/systems/tormenta20/divindades';

const buildSheet = (): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.devoto = {
    // Objeto completo, com catálogo: é o que dispara a remontagem no strip.
    divindade: DivindadeEnum.KHALMYR,
    poderes: [],
    fundamentalista: { dogma: 'paladino' },
  };
  return sheet;
};

describe('Fundamentalista — persistência', () => {
  it('sobrevive ao strip para a nuvem e à normalização', () => {
    const stripped = stripSheetForStorage(
      buildSheet()
    ) as unknown as CharacterSheet;
    expect(stripped.devoto?.fundamentalista).toEqual({ dogma: 'paladino' });
    expect(stripped.devoto?.divindade.poderes).toEqual([]);

    normalizeSheet(stripped);
    expect(stripped.devoto?.fundamentalista).toEqual({ dogma: 'paladino' });
  });

  it('descarta dogma desconhecido', () => {
    const sheet = buildSheet();
    (sheet.devoto as unknown as Record<string, unknown>).fundamentalista = {
      dogma: 'bardo',
    };
    normalizeSheet(sheet);
    expect(sheet.devoto?.fundamentalista).toBeUndefined();
  });

  it('descarta lixo que não é objeto', () => {
    const sheet = buildSheet();
    (sheet.devoto as unknown as Record<string, unknown>).fundamentalista = true;
    normalizeSheet(sheet);
    expect(sheet.devoto?.fundamentalista).toBeUndefined();
  });

  it('descarta a combinação com devoção dupla', () => {
    const sheet = buildSheet();
    sheet.devoto!.divindadeSecundaria = 'Tanna-Toh';
    normalizeSheet(sheet);
    expect(sheet.devoto?.fundamentalista).toBeUndefined();
    expect(sheet.devoto?.divindadeSecundaria).toBe('Tanna-Toh');
  });
});
