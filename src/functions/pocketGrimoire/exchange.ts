import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import { normalizeSearch } from '../stringUtils';
import { isRecord } from './state';

export const GRIMOIRE_FILE_FORMAT = 'fichas-de-nimb/grimorio-de-bolso';
export const GRIMOIRE_FILE_VERSION = 1;
export const MAX_IMPORT_BYTES = 1024 * 1024;
export const MAX_IMPORT_ITEMS = 1000;

export const IMPORT_ERRORS = {
  tooLarge: 'Arquivo grande demais para ser um grimório.',
  notJson: 'Não foi possível ler o arquivo. Ele não parece ser um JSON válido.',
  notGrimoire: 'Este arquivo não é um grimório do Fichas de Nimb.',
  newerVersion: 'Este grimório foi criado numa versão mais nova do site.',
  tooManyItems: `Este grimório tem itens demais (máximo ${MAX_IMPORT_ITEMS}).`,
} as const;

export interface GrimoireFile {
  formato: string;
  versao: number;
  exportadoEm: string;
  grimorio: {
    nome: string;
    itens: { id: string; nome: string }[];
  };
}

export type ImportResult =
  | { ok: true; value: { name: string; itemIds: string[] } }
  | { ok: false; error: string };

/** O `nome` de cada item é só para leitura humana; a importação usa o `id`. */
export function exportGrimoire(
  grimoire: PocketGrimoire,
  resolveName: (id: string) => string,
  now: Date = new Date()
): string {
  const file: GrimoireFile = {
    formato: GRIMOIRE_FILE_FORMAT,
    versao: GRIMOIRE_FILE_VERSION,
    exportadoEm: now.toISOString(),
    grimorio: {
      nome: grimoire.name,
      itens: grimoire.itemIds.map((id) => ({ id, nome: resolveName(id) })),
    },
  };
  return JSON.stringify(file, null, 2);
}

const fail = (error: string): ImportResult => ({ ok: false, error });

export function parseGrimoireImport(text: string): ImportResult {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) {
    return fail(IMPORT_ERRORS.tooLarge);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return fail(IMPORT_ERRORS.notJson);
  }

  if (!isRecord(data) || data.formato !== GRIMOIRE_FILE_FORMAT) {
    return fail(IMPORT_ERRORS.notGrimoire);
  }
  const { versao, grimorio } = data;
  if (typeof versao !== 'number' || !Number.isInteger(versao) || versao < 1) {
    return fail(IMPORT_ERRORS.notGrimoire);
  }
  if (versao > GRIMOIRE_FILE_VERSION) return fail(IMPORT_ERRORS.newerVersion);
  if (!isRecord(grimorio) || !Array.isArray(grimorio.itens)) {
    return fail(IMPORT_ERRORS.notGrimoire);
  }
  if (grimorio.itens.length > MAX_IMPORT_ITEMS) {
    return fail(IMPORT_ERRORS.tooManyItems);
  }

  const ids = grimorio.itens.map((item) =>
    isRecord(item) && typeof item.id === 'string' ? item.id.trim() : ''
  );
  if (ids.some((id) => id.length === 0)) {
    return fail(IMPORT_ERRORS.notGrimoire);
  }

  return {
    ok: true,
    value: {
      name: typeof grimorio.nome === 'string' ? grimorio.nome : '',
      itemIds: Array.from(new Set(ids)),
    },
  };
}

export function grimoireFileName(name: string): string {
  const slug = normalizeSearch(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `grimorio-${slug || 'sem-nome'}.json`;
}
