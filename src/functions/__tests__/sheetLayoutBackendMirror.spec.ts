/**
 * O backend valida layouts com uma CÓPIA dos três arquivos do contrato
 * (`backend/src/sheetLayout/`). Se as cópias divergirem, o editor aprova um
 * layout que a API recusa com 400 — ou pior, a API grava algo que o app não
 * sabe sanear.
 *
 * Este teste compara byte a byte (só os caminhos de import mudam). Ele pula
 * quando o submódulo `backend` não está no checkout (CI público, fork).
 */
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../../..');
const BACKEND_DIR = path.join(ROOT, 'backend/src/sheetLayout');
const hasBackend = fs.existsSync(BACKEND_DIR);

const read = (p: string) => fs.readFileSync(p, 'utf8');

describe.skipIf(!hasBackend)('espelho do contrato de layout no backend', () => {
  it.each(['SheetLayout.ts', 'sheetLayoutPresets.ts'])(
    '%s é idêntico',
    (file) => {
      expect(read(path.join(BACKEND_DIR, file))).toBe(
        read(path.join(ROOT, 'src/interfaces', file))
      );
    }
  );

  it('sheetLayoutValidation.ts é idêntico (fora os imports)', () => {
    const front = read(
      path.join(ROOT, 'src/functions/sheetLayoutValidation.ts')
    ).replace(/'\.\.\/interfaces\//g, "'./");

    expect(read(path.join(BACKEND_DIR, 'sheetLayoutValidation.ts'))).toBe(
      front
    );
  });
});
