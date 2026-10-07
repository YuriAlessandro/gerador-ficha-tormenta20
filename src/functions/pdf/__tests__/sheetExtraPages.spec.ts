/**
 * Páginas de continuação do PDF. A quebra por largura vem do
 * `layoutMultilineText`; o bug era desenhar o texto original quando ele cabia
 * inteiro na página, e uma linha longa passava da margem direita.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PDFDocument, PDFPage, StandardFonts } from 'pdf-lib';
import { appendExtraPages } from '../sheetExtraPages';

const CONTENT_WIDTH = 501;
const BODY_SIZE = 9;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('appendExtraPages', () => {
  it('quebra linhas longas dentro da largura útil', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const drawn: string[] = [];
    vi.spyOn(PDFPage.prototype, 'drawText').mockImplementation(
      (text: string) => {
        drawn.push(text);
      }
    );

    const longLine =
      'Oferece ajuda a todos que encontra, primeiro a quem mais precisa, e ajuda pelo menos um necessitado por dia, sem exceção nenhuma.';
    await appendExtraPages(doc, [
      { title: 'Seção', body: `${longLine}\nLinha curta.` },
    ]);

    const bodyLines = drawn.slice(1); // a primeira é o título
    expect(bodyLines.length).toBeGreaterThan(2);
    bodyLines.forEach((line) => {
      expect(font.widthOfTextAtSize(line, BODY_SIZE)).toBeLessThanOrEqual(
        CONTENT_WIDTH
      );
    });
    expect(bodyLines.join(' ')).toContain('sem exceção nenhuma.');
    expect(bodyLines[bodyLines.length - 1]).toBe('Linha curta.');
  });
});
