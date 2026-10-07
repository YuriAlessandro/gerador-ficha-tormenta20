import { describe, it, expect } from 'vitest';
import {
  exportGrimoire,
  grimoireFileName,
  IMPORT_ERRORS,
  MAX_IMPORT_ITEMS,
  parseGrimoireImport,
} from '../exchange';
import { PocketGrimoire } from '../../../interfaces/PocketGrimoire';

const grimoire: PocketGrimoire = {
  id: 'x',
  name: 'Mago da one-shot',
  itemIds: ['spell:Bola de Fogo', 'class-power:Arcanista:Magia Acelerada'],
  createdAt: '2026-09-18T00:00:00.000Z',
  updatedAt: '2026-09-18T00:00:00.000Z',
};

const resolveName = (id: string) => id.split(':').pop() ?? id;
const NOW = new Date('2026-09-18T21:30:00.000Z');

const fileWith = (patch: Record<string, unknown>) =>
  JSON.stringify({
    formato: 'fichas-de-nimb/grimorio-de-bolso',
    versao: 1,
    exportadoEm: NOW.toISOString(),
    grimorio: { nome: 'X', itens: [] },
    ...patch,
  });

describe('exportGrimoire', () => {
  it('gera o formato documentado', () => {
    expect(JSON.parse(exportGrimoire(grimoire, resolveName, NOW))).toEqual({
      formato: 'fichas-de-nimb/grimorio-de-bolso',
      versao: 1,
      exportadoEm: '2026-09-18T21:30:00.000Z',
      grimorio: {
        nome: 'Mago da one-shot',
        itens: [
          { id: 'spell:Bola de Fogo', nome: 'Bola de Fogo' },
          {
            id: 'class-power:Arcanista:Magia Acelerada',
            nome: 'Magia Acelerada',
          },
        ],
      },
    });
  });

  it('ida e volta preserva nome e itens', () => {
    expect(
      parseGrimoireImport(exportGrimoire(grimoire, resolveName, NOW))
    ).toEqual({
      ok: true,
      value: { name: 'Mago da one-shot', itemIds: grimoire.itemIds },
    });
  });
});

describe('parseGrimoireImport', () => {
  it('não é JSON', () => {
    expect(parseGrimoireImport('{oi')).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notJson,
    });
  });

  it('JSON de outra coisa', () => {
    expect(parseGrimoireImport('{"a":1}')).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(parseGrimoireImport('[]')).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(parseGrimoireImport(fileWith({ grimorio: { nome: 'X' } }))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(
      parseGrimoireImport(fileWith({ grimorio: { nome: 'X', itens: [{}] } }))
    ).toEqual({ ok: false, error: IMPORT_ERRORS.notGrimoire });
  });

  it('versão inválida ou futura', () => {
    expect(parseGrimoireImport(fileWith({ versao: 'um' }))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(parseGrimoireImport(fileWith({ versao: 2 }))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.newerVersion,
    });
  });

  it('grande demais', () => {
    expect(parseGrimoireImport(' '.repeat(1024 * 1024 + 1))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.tooLarge,
    });
  });

  it('itens demais', () => {
    const itens = Array.from({ length: MAX_IMPORT_ITEMS + 1 }, (_, i) => ({
      id: `spell:${i}`,
    }));
    expect(
      parseGrimoireImport(fileWith({ grimorio: { nome: 'X', itens } }))
    ).toEqual({ ok: false, error: IMPORT_ERRORS.tooManyItems });
  });

  it('remove repetidos, apara ids e aceita nome ausente', () => {
    expect(
      parseGrimoireImport(
        fileWith({
          grimorio: {
            itens: [{ id: ' spell:A ' }, { id: 'spell:A' }, { id: 'spell:B' }],
          },
        })
      )
    ).toEqual({
      ok: true,
      value: { name: '', itemIds: ['spell:A', 'spell:B'] },
    });
  });

  it('mantém ids desconhecidos', () => {
    const result = parseGrimoireImport(
      fileWith({ grimorio: { nome: 'X', itens: [{ id: 'spell:Nada' }] } })
    );
    expect(result).toEqual({
      ok: true,
      value: { name: 'X', itemIds: ['spell:Nada'] },
    });
  });
});

describe('grimoireFileName', () => {
  it('gera slug sem acentos', () => {
    expect(grimoireFileName('Clériga de Lena!')).toBe(
      'grimorio-cleriga-de-lena.json'
    );
    expect(grimoireFileName('!!!')).toBe('grimorio-sem-nome.json');
  });
});
