import {
  layoutMultilineText,
  PDFDocument,
  PDFFont,
  StandardFonts,
  TextAlignment,
} from 'pdf-lib';

/**
 * Páginas de continuação desenhadas em código.
 *
 * O template `sheet.pdf` é um AcroForm de três páginas fixas, e campo AcroForm
 * multilinha não pagina: o que passa da altura do campo é simplesmente cortado
 * pelo visualizador. Além disso boa parte da ficha (anotações, redução de dano,
 * complicação, companheiros…) não tem campo nenhum no template — oito campos do
 * formulário são órfãos, sem widget em página alguma, então `setText` neles é
 * no-op.
 *
 * Em vez de mexer no PDF binário para criar widgets, o que não cabe é desenhado
 * em páginas novas com `drawText`.
 */

/** Mesmas medidas do template, para a continuação não destoar. */
const PAGE_WIDTH = 581;
const PAGE_HEIGHT = 780;
const MARGIN_X = 36;
const MARGIN_TOP = 43;
const CONTENT_WIDTH = 501;

const TITLE_SIZE = 13;
const BODY_SIZE = 9;
const TITLE_GAP = 6;
const SECTION_GAP = 14;

export interface PdfSection {
  title: string;
  body: string;
}

/**
 * Divide `text` no ponto exato em que ele deixa de caber num retângulo.
 *
 * Usa o `layoutMultilineText` do próprio pdf-lib — o mesmo motor de quebra que
 * o AcroForm usa para renderizar — em vez de estimar caracteres por linha.
 * Assim a conta do que "coube" no campo bate com o que o leitor de PDF vai
 * realmente mostrar, e o resto pode ir para a continuação sem risco de sumir
 * ou de duplicar.
 */
export function splitToFit(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
  height: number
): { fitted: string; remainder: string } {
  if (!text) return { fitted: '', remainder: '' };

  const layout = layoutMultilineText(text, {
    alignment: TextAlignment.Left,
    fontSize: size,
    font,
    bounds: { x: 0, y: 0, width, height },
  });

  // Linhas que não cabem saem com `y` negativo (o layout desce a partir do topo
  // do retângulo e não para na borda).
  const fittingCount = layout.lines.filter((line) => line.y >= 0).length;
  if (fittingCount >= layout.lines.length)
    return { fitted: text, remainder: '' };

  const fitted = layout.lines
    .slice(0, fittingCount)
    .map((line) => line.text)
    .join('\n');
  const remainder = layout.lines
    .slice(fittingCount)
    .map((line) => line.text)
    .join('\n');

  return { fitted, remainder };
}

/**
 * Anexa as seções ao documento, quebrando de página conforme o texto exige.
 *
 * No-op quando não há seção com conteúdo — uma ficha sem nada "sem-casa" tem
 * que continuar saindo com exatamente as três páginas do template.
 */
export async function appendExtraPages(
  pdfDoc: PDFDocument,
  sections: PdfSection[]
): Promise<void> {
  const filled = sections.filter((section) => section.body.trim().length > 0);
  if (filled.length === 0) return;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - MARGIN_TOP;

  const bottom = MARGIN_TOP;
  const lineHeight = BODY_SIZE * 1.15;

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursorY = PAGE_HEIGHT - MARGIN_TOP;
  };

  filled.forEach((section) => {
    // Título órfão no pé da página fica feio: só cabe se sobrar espaço para ele
    // e ao menos uma linha de corpo.
    if (cursorY - TITLE_SIZE - TITLE_GAP - lineHeight < bottom) newPage();

    page.drawText(section.title, {
      x: MARGIN_X,
      y: cursorY - TITLE_SIZE,
      size: TITLE_SIZE,
      font: boldFont,
    });
    cursorY -= TITLE_SIZE + TITLE_GAP;

    let pending = section.body;
    while (pending.length > 0) {
      const available = cursorY - bottom;
      if (available < lineHeight) {
        newPage();
        // eslint-disable-next-line no-continue
        continue;
      }

      const { fitted, remainder } = splitToFit(
        pending,
        font,
        BODY_SIZE,
        CONTENT_WIDTH,
        available
      );

      // Defesa contra laço infinito: se nada coube mesmo havendo espaço para uma
      // linha (palavra maior que a largura útil), a página nova não ajudaria.
      if (!fitted) break;

      const lines = fitted.split('\n');
      // `for` em vez de `forEach`: o callback captura `page`/`cursorY`, que o
      // laço externo reatribui a cada página nova (no-loop-func).
      for (let index = 0; index < lines.length; index += 1) {
        page.drawText(lines[index], {
          x: MARGIN_X,
          y: cursorY - BODY_SIZE - index * lineHeight,
          size: BODY_SIZE,
          font,
        });
      }
      cursorY -= lines.length * lineHeight;

      pending = remainder;
      if (pending.length > 0) newPage();
    }

    cursorY -= SECTION_GAP;
  });
}

export default appendExtraPages;
