/**
 * Os dados do gerador de tesouro são GERADOS a partir das fontes. Estes testes
 * refazem a geração e exigem igualdade exata — qualquer edição manual nos
 * arquivos gerados (ou mudança no parser) aparece aqui.
 */
import fs from 'fs';
import path from 'path';
import BASIC_BOOK_TABLES from '@/data/treasure/basic.generated';
import SUPPLEMENTS_SPREADSHEET from '@/data/treasure/supplements.generated';
import {
  TABS,
  parseSpreadsheet,
} from '../../../../scripts/treasure/parseSpreadsheet.mjs';
import { extractJda } from '../../../../scripts/treasure/extract-jda.mjs';

const ROOT = path.resolve(__dirname, '../../../..');
const SNAPSHOTS = path.join(ROOT, 'scripts/treasure/snapshots');
const JDA_FILE = path.join(ROOT, 'livros/jda/8-recompensas/tesouros.txt');

describe('fidelidade dos dados de tesouro', () => {
  it('supplements.generated.ts = planilha (snapshots versionados)', () => {
    const csvByKey: Record<string, string> = {};
    TABS.forEach((tab: { key: string }) => {
      csvByKey[tab.key] = fs.readFileSync(
        path.join(SNAPSHOTS, `${tab.key}.csv`),
        'utf8'
      );
    });
    expect(parseSpreadsheet(csvByKey)).toEqual(SUPPLEMENTS_SPREADSHEET);
  });

  // livros/ é material local (gitignored): no CI este teste é pulado.
  const itWithBooks = fs.existsSync(JDA_FILE) ? it : it.skip;
  itWithBooks('basic.generated.ts = Tormenta20 JdA, Cap. 8 (livros/)', () => {
    expect(extractJda()).toEqual(BASIC_BOOK_TABLES);
  });
});
