#!/usr/bin/env node
/**
 * Importa a planilha "Geração de Tesouros em Tormenta20" (pública) e gera
 * `src/data/treasure/supplements.generated.ts` — os dados do modo
 * "Suplementos" do gerador de recompensas (/recompensas).
 *
 *   node scripts/treasure/import-spreadsheet.mjs            # baixa + gera
 *   node scripts/treasure/import-spreadsheet.mjs --offline  # só regenera dos snapshots
 *   npx prettier --write src/data/treasure/supplements.generated.ts
 *
 * Os CSVs crus ficam versionados em `scripts/treasure/snapshots/`, para que
 * qualquer mudança na planilha apareça como diff revisável. O teste
 * `spreadsheetFidelity.spec.ts` re-parseia esses snapshots e exige que o
 * arquivo gerado bata exatamente — NÃO edite o arquivo gerado à mão.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPREADSHEET_ID, TABS, parseSpreadsheet } from './parseSpreadsheet.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const SNAPSHOTS = path.join(HERE, 'snapshots');
const OUT = path.join(ROOT, 'src/data/treasure/supplements.generated.ts');

const offline = process.argv.includes('--offline');

async function download(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar gid=${gid}`);
  return res.text();
}

async function main() {
  fs.mkdirSync(SNAPSHOTS, { recursive: true });
  const csvByKey = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const tab of TABS) {
    const file = path.join(SNAPSHOTS, `${tab.key}.csv`);
    if (offline) {
      csvByKey[tab.key] = fs.readFileSync(file, 'utf8');
    } else {
      // eslint-disable-next-line no-await-in-loop
      const text = await download(tab.gid);
      fs.writeFileSync(file, text.endsWith('\n') ? text : `${text}\n`);
      csvByKey[tab.key] = fs.readFileSync(file, 'utf8');
      console.log(`baixado: ${tab.title} → ${path.relative(ROOT, file)}`);
    }
  }

  const data = parseSpreadsheet(csvByKey);

  const body = `/* eslint-disable */
/**
 * ARQUIVO GERADO — NÃO EDITAR À MÃO.
 *
 * Fonte: planilha "Geração de Tesouros em Tormenta20"
 * (https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}).
 * Criação da planilha: Guilherme Dei Svaldi. Riquezas adicionais: Rafael Dei Svaldi.
 *
 * Gerado por scripts/treasure/import-spreadsheet.mjs a partir dos snapshots
 * em scripts/treasure/snapshots/. Verificado por spreadsheetFidelity.spec.ts.
 */
import type { TreasureSpreadsheetData } from './types';

const SUPPLEMENTS_SPREADSHEET: TreasureSpreadsheetData = ${JSON.stringify(
    data,
    null,
    2
  )};

export default SUPPLEMENTS_SPREADSHEET;
`;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body);
  console.log(`gerado: ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
