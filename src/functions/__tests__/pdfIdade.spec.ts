/**
 * A página de descrição do PDF da ficha "Jão" saía com "Idade: undefined, 35
 * anos": a faixa etária (`age.bracket`) só existe com a regra opcional Idades
 * Variadas (Heróis de Arton) e era concatenada sem checagem.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildJao } from './fixtures/fichaJao';
import { fillSheetPdf, formatSheetAgeText } from '../downloadSheetPdf';

describe('PDF — seção Idade', () => {
  it('sem Idades Variadas: só "35 anos"', () => {
    expect(
      formatSheetAgeText({
        years: 35,
        stage: 'maduro',
        complications: [],
        extraLevels: 0,
      })
    ).toBe('35 anos');
  });

  it('com faixa etária: rótulo da faixa (não o id) e a idade', () => {
    expect(
      formatSheetAgeText({
        years: 35,
        bracket: 'adulto',
        complications: [],
        extraLevels: 0,
      })
    ).toBe('Adulto, 35 anos');
  });

  it('complicações de idade vão embaixo', () => {
    expect(
      formatSheetAgeText({
        years: 70,
        bracket: 'velho',
        complications: [{ name: 'Fraqueza', description: 'Cansa fácil.' }],
        extraLevels: 0,
      })
    ).toBe('Velho, 70 anos\n- Fraqueza: Cansa fácil.');
  });

  it('nada preenchido: corpo vazio (a seção some)', () => {
    expect(formatSheetAgeText({ complications: [], extraLevels: 0 })).toBe('');
  });

  it('o PDF do Jão (35 anos) é gerado', async () => {
    const jao = buildJao();
    jao.age = { years: 35, stage: 'maduro', complications: [], extraLevels: 0 };
    const template = new Uint8Array(
      readFileSync(path.resolve(__dirname, '../../../public/sheet.pdf'))
    );

    const doc = await PDFDocument.load(await fillSheetPdf(template, jao));

    expect(doc.getPageCount()).toBeGreaterThan(3);
  });
});
