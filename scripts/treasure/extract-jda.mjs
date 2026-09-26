#!/usr/bin/env node
/**
 * Extrai as tabelas de tesouro do Tormenta20 Jogo do Ano (Capítulo 8,
 * Tabelas 8-1 a 8-15) do texto oficial em `livros/jda/8-recompensas/` e gera
 * `src/data/treasure/basic.generated.ts` — os dados do modo "Livro básico" do
 * gerador de recompensas (/recompensas).
 *
 *   node scripts/treasure/extract-jda.mjs
 *   npx prettier --write src/data/treasure/basic.generated.ts
 *
 * `livros/` é material de consulta local (gitignored), então este script só
 * roda na máquina de quem tem a pasta. O teste `jdaFidelity.spec.ts` refaz a
 * extração e compara com o arquivo gerado quando `livros/` existe (e é
 * pulado no CI). NÃO edite o arquivo gerado à mão.
 *
 * Como a planilha, este extrator não interpreta regra: só recorta cada tabela
 * entre marcadores literais do texto e reorganiza as células. Qualquer
 * inconsistência (faixa faltando, fórmula desconhecida) lança erro.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseItemFormula, parseMoneyFormula } from './parseSpreadsheet.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
export const JDA_DIR = path.join(ROOT, 'livros/jda/8-recompensas');
const OUT = path.join(ROOT, 'src/data/treasure/basic.generated.ts');

// ---------------------------------------------------------------------------
// Texto
// ---------------------------------------------------------------------------

/**
 * Junta as linhas do arquivo, tirando o cabeçalho "// JDA - ..." e o rodapé
 * de página (número da página + marca d'água do exemplar).
 */
function loadText(file) {
  return fs
    .readFileSync(path.join(JDA_DIR, file), 'utf8')
    .split('\n')
    .filter((l) => !l.startsWith('//'))
    .map((l) => l.replace(/\s+\d{3}\s+(?:[^\s@]+\s+){1,4}\S+@\S+\s*$/, ''))
    .join('\n');
}

function fail(table, msg, value) {
  throw new Error(`[JdA ${table}] ${msg}: ${JSON.stringify(value)}`);
}

/** Recorta o trecho entre `start` (exclusive) e `end` (exclusive). */
function slice(table, text, start, end) {
  const i = text.indexOf(start);
  if (i < 0) fail(table, 'marcador inicial não encontrado', start);
  const from = i + start.length;
  let j;
  if (end === '\n') j = text.indexOf('\n', from);
  else j = text.indexOf(end, from);
  if (j < 0) fail(table, 'marcador final não encontrado', end);
  return text.slice(from, j);
}

const collapse = (s) => s.replace(/\s+/g, ' ').trim();

// Faixa de d%: sempre 2-3 dígitos seguida de 3+ espaços no texto do livro.
const RANGE_SPLIT = /(?:^|\s)(\d{2}(?:-\d{2,3})?|100)(?=\s{3})/g;

function toRange(table, s) {
  const m = /^(\d{2,3})(?:-(\d{2,3}))?$/.exec(s);
  if (!m) fail(table, 'faixa inválida', s);
  return { min: Number(m[1]), max: Number(m[2] ?? m[1]) };
}

/** Quebra um trecho em pares [faixa, texto até a próxima faixa]. */
function pairs(table, text) {
  const matches = [...text.matchAll(RANGE_SPLIT)];
  if (matches.length === 0) fail(table, 'nenhuma faixa encontrada', text);
  return matches.map((m, idx) => {
    const valueStart = m.index + m[0].length;
    const valueEnd =
      idx + 1 < matches.length ? matches[idx + 1].index : text.length;
    return {
      ...toRange(table, m[1]),
      value: collapse(text.slice(valueStart, valueEnd)),
    };
  });
}

function assertCoverage(table, rows, max = 100) {
  let expected = 1;
  rows.forEach((r) => {
    if (r.min !== expected)
      fail(table, `esperava faixa começando em ${expected}`, r);
    expected = r.max + 1;
  });
  if (expected !== max + 1)
    fail(table, `tabela não termina em ${max}`, rows.at(-1));
}

/**
 * Distribui pares de colunas intercaladas (tabela com várias colunas lidas
 * linha a linha) pela continuidade das faixas: cada coluna espera a faixa que
 * começa logo após a última. Em empate, segue a ordem cíclica das colunas.
 */
function splitColumns(table, list, columns) {
  const cols = Array.from({ length: columns }, () => []);
  const expected = Array(columns).fill(1);
  let last = -1;
  list.forEach((p) => {
    const candidates = [];
    for (let k = 1; k <= columns; k += 1) {
      const c = (last + k) % columns;
      if (expected[c] === p.min) candidates.push(c);
    }
    if (candidates.length === 0) fail(table, 'faixa sem coluna', p);
    const c = candidates[0];
    cols[c].push(p);
    expected[c] = p.max + 1;
    last = c;
  });
  return cols;
}

function splitMarker(raw) {
  // "Atroz 1" / "Animado 1" (sobrescrito do livro) ou "Energética*".
  let m = /^(.*?) ([12])$/.exec(raw);
  if (m) return { name: m[1], marker: m[2] };
  m = /^(.*?)(\*+)$/.exec(raw);
  if (m) return { name: m[1], marker: m[2] };
  return { name: raw };
}

function entry(p, name, extra = {}) {
  const { name: clean, marker } = splitMarker(name);
  const e = { min: p.min, max: p.max, name: clean, rawName: name };
  if (marker) e.marker = marker;
  return { ...e, ...extra };
}

function parsePrice(table, s) {
  if (!/^\d{1,3}(\.\d{3})*$/.test(s)) fail(table, 'preço inválido', s);
  return Number(s.replace(/\./g, ''));
}

/** "Nome   T$ 30.000" */
function priced(table, p) {
  const m = /^(.+?) T\$ ([\d.]+)$/.exec(p.value);
  if (!m) fail(table, 'linha sem preço', p);
  return entry(p, m[1], { price: parsePrice(table, m[2]) });
}

// ---------------------------------------------------------------------------
// Tabelas
// ---------------------------------------------------------------------------

const ND_LABELS = [
  '1/4',
  '1/2',
  ...Array.from({ length: 20 }, (_, i) => String(i + 1)),
];

function parseNdTable(text) {
  const table = 'Tabela 8-1';
  const body = slice(
    table,
    text,
    'Tabela 8-1: Tesouro por Nível de Desafio ND   d%   Dinheiro   d%   Itens',
    '+%   Na rolagem'
  ).replace(
    'Recompensas Tabela 8-1: Tesouro por Nível de Desafio (Continuação) ND   d%   Dinheiro   d%   Itens',
    ' '
  );
  const tokens = body.split(/\s+/).filter(Boolean);
  const isRange = (t) => /^\d{2}(?:-\d{2,3})?$|^100$/.test(t);

  const byNd = {};
  let ndIdx = -1;
  let current = null; // par em construção
  const pairsByNd = {};
  tokens.forEach((tok, i) => {
    const nextNd = ND_LABELS[ndIdx + 1];
    if (tok === nextNd && isRange(tokens[i + 1] ?? '')) {
      ndIdx += 1;
      pairsByNd[nextNd] = [];
      current = null;
      return;
    }
    if (ndIdx < 0) fail(table, 'texto antes do primeiro ND', tok);
    if (isRange(tok)) {
      current = { ...toRange(table, tok), words: [] };
      pairsByNd[ND_LABELS[ndIdx]].push(current);
      return;
    }
    if (!current) fail(table, 'valor sem faixa', tok);
    current.words.push(tok);
  });
  if (ndIdx !== ND_LABELS.length - 1) fail(table, 'NDs incompletos', ndIdx);

  ND_LABELS.forEach((nd) => {
    // Linhas intercaladas: Dinheiro, Itens, Dinheiro, Itens...
    const [money, items] = splitColumns(
      `${table} ND ${nd}`,
      pairsByNd[nd].map((p) => ({
        min: p.min,
        max: p.max,
        value: p.words.join(' '),
      })),
      2
    );
    assertCoverage(`${table} ND ${nd} Dinheiro`, money);
    assertCoverage(`${table} ND ${nd} Itens`, items);
    byNd[nd] = {
      money: money.map((p) => ({
        min: p.min,
        max: p.max,
        label: p.value,
        result: parseMoneyFormula(table, p.value),
      })),
      items: items.map((p) => ({
        min: p.min,
        max: p.max,
        label: p.value,
        result: parseItemFormula(table, p.value),
      })),
    };
  });

  return { byNd };
}

function parseNdNotes(text) {
  const table = 'Tabela 8-1 (legenda)';
  const END = 'entre uma arma e um esotérico.';
  const legend = collapse(slice(table, text, 'Mágico (maior) 2D ', END) + END);
  const k = legend.indexOf(' 2D Na rolagem');
  if (!legend.startsWith('+% Na rolagem') || k < 0)
    fail(table, 'legenda inesperada', legend);
  return [legend.slice(0, k), legend.slice(k + 1)];
}

function parseRiquezas(text) {
  const table = 'Tabela 8-2';
  const body = slice(
    table,
    text,
    'Tabela 8-2: Riquezas Menor   Média   Maior   Valor (T$)   Exemplos',
    'Resultados da Tabela'
  );
  const R = '(\\d{2,3}(?:-\\d{2,3})?|—)';
  const rowRe = new RegExp(
    `${R}\\s+${R}\\s+${R}\\s+(\\d+)d(\\d+)(?:x([\\d.]+))?\\s+\\(([\\d.]+)\\)`,
    'g'
  );
  const matches = [...body.matchAll(rowRe)];
  const tier = (s) => (s === '—' ? null : toRange(table, s));
  const values = matches.map((m, idx) => {
    const end = idx + 1 < matches.length ? matches[idx + 1].index : body.length;
    const examplesText = collapse(body.slice(m.index + m[0].length, end));
    return {
      menor: tier(m[1]),
      media: tier(m[2]),
      maior: tier(m[3]),
      valueLabel: collapse(m[0].slice(m[0].search(/\d+d\d+/))),
      value: {
        n: Number(m[4]),
        sides: Number(m[5]),
        mult: m[6] ? Number(m[6].replace(/\./g, '')) : 1,
        average: Number(m[7].replace(/\./g, '')),
      },
      examples: examplesText
        .split(/;\s*/)
        .map((s) => s.replace(/\.$/, '').trim())
        .filter(Boolean)
        .map((s) => ({ spaces: '', text: s })),
    };
  });
  ['menor', 'media', 'maior'].forEach((t) =>
    assertCoverage(`${table} ${t}`, values.map((v) => v[t]).filter(Boolean))
  );
  return { values, spaces: [], notes: [] };
}

function parseInstructions(text) {
  const body = slice(
    'Resultados da Tabela',
    text,
    'Resultados da Tabela ',
    '4–6) acessório (página 342).'
  );
  return [collapse(`${body}4–6) acessório (página 342).`)];
}

function simpleNames(table, body) {
  const rows = pairs(table, body).map((p) => entry(p, p.value));
  assertCoverage(table, rows);
  return rows;
}

function parseEquipamentos(text) {
  const table = 'Tabela 8-4';
  const armasBody = slice(
    table,
    text,
    'Tabela 8-4: Equipamento d%   Arma   d%   Arma',
    'd%   Armadura'
  );
  const armas = pairs(`${table} armas`, armasBody)
    .sort((a, b) => a.min - b.min)
    .map((p) => entry(p, p.value));
  assertCoverage(`${table} armas`, armas);
  const armaduras = simpleNames(
    `${table} armaduras`,
    slice(table, text, 'd%   Armadura ', 'd%   Esotérico')
  );
  const esotericos = simpleNames(
    `${table} esotéricos`,
    slice(table, text, 'd%   Esotérico ', '\n')
  );
  return {
    armas: { rows: armas, footnotes: [] },
    armaduras: { rows: armaduras, footnotes: [] },
    esotericos: { rows: esotericos, footnotes: [] },
  };
}

function parseSuperiores(text) {
  const table = 'Tabela 8-5';
  const F1 =
    '1 Conta como duas melhorias. Se o item só possuir uma, role novamente.';
  const F2 =
    '2 Role 1d6 para definir o material: 1) aço-rubi, 2) adamante, 3) gelo eterno, 4) madeira Tollon, 5) matéria vermelha, 6) mitral.';
  let body = collapse(
    slice(
      table,
      text,
      'Tabela 8-5: Itens Superiores d%   Armas   d%   Armaduras/Escudos   d%   Esotéricos',
      'Tabela 8-6'
    )
  );
  [F1, F2].forEach((f) => {
    if (!body.includes(f)) fail(table, 'nota de rodapé não encontrada', f);
    body = body.replace(f, ' ');
  });
  // `collapse` tirou os 3 espaços que delimitam as faixas; recoloca-os.
  body = body.replace(/(^| )(\d{2}(?:-\d{2,3})?|100) (?=\D)/g, '$1$2   ');
  const [armas, armaduras, esotericos] = splitColumns(
    table,
    pairs(table, body),
    3
  ).map((col, idx) => {
    const rows = col.map((p) => entry(p, p.value));
    assertCoverage(`${table} coluna ${idx}`, rows);
    return { rows, footnotes: idx === 0 ? [F1, F2] : [] };
  });
  return { armas, armaduras, esotericos };
}

/** Tabela de encantos: "Nome[*| 1| 2]   Efeito" ; "Arma específica Veja a Tabela 8-9". */
function enchantments(table, body) {
  const rows = pairs(table, body).map((p) => {
    const m = /^(Arma específica|Item específico)\b/.exec(p.value);
    if (m)
      return {
        min: p.min,
        max: p.max,
        name: m[1],
        rawName: m[1],
        rollOnSpecificTable: true,
      };
    const tokens = p.value.split(' ');
    const name = /^[12]$/.test(tokens[1] ?? '')
      ? `${tokens[0]} ${tokens[1]}`
      : tokens[0];
    return entry(p, name);
  });
  assertCoverage(table, rows);
  return rows;
}

function pricedTable(table, body) {
  const rows = pairs(table, body).map((p) => priced(table, p));
  assertCoverage(table, rows);
  return { rows, footnotes: [] };
}

function parseMagicos(text) {
  const armas = enchantments(
    'Tabela 8-8',
    slice(
      'Tabela 8-8',
      text,
      'Tabela 8-8: Armas Mágicas d%   Encanto   Efeito',
      '*Conta como dois encantos'
    )
  );
  const armaduras = enchantments(
    'Tabela 8-10',
    slice(
      'Tabela 8-10',
      text,
      'Tabela 8-10:  Armaduras & Escudos Mágicos d%   Encanto   Efeito',
      '1 Apenas escudos.'
    )
  );
  return {
    armas: {
      rows: armas,
      footnotes: [
        '*Conta como dois encantos. Para itens menores, role novamente.',
      ],
    },
    armasEspecificas: pricedTable(
      'Tabela 8-9',
      slice(
        'Tabela 8-9',
        text,
        'Tabela 8-9: Armas Específicas d%   Arma   Preço',
        'Essas têm direito'
      )
    ),
    armaduras: {
      rows: armaduras,
      footnotes: [
        '1 Apenas escudos. Para armaduras, role novamente.',
        '2 Conta como dois encantos. Para itens menores, role novamente.',
      ],
    },
    armadurasEspecificas: pricedTable(
      'Tabela 8-11',
      slice(
        'Tabela 8-11',
        text,
        'Tabela 8-11: Armaduras  & Escudos Específicos d%   Armadura/Escudo   Preço',
        '\n'
      )
    ),
  };
}

function checkFootnotesExist(text, notes) {
  notes.forEach((n) => {
    if (!collapse(text).includes(n))
      fail('notas', 'nota não encontrada no livro', n);
  });
}

export function extractJda() {
  const tesouros = loadText('tesouros.txt');
  const magicos = loadText('itens-magicos.txt');

  const { byNd } = parseNdTable(tesouros);
  const mag = parseMagicos(magicos);
  checkFootnotesExist(magicos, [
    ...mag.armas.footnotes,
    ...mag.armaduras.footnotes,
  ]);

  const pocoes = pairs(
    'Tabela 8-12',
    slice(
      'Tabela 8-12',
      magicos,
      'Tabela 8-12: Poções d%   Poção   Preço',
      '\n'
    )
  ).map((p) => priced('Tabela 8-12', p));
  assertCoverage('Tabela 8-12', pocoes);

  return {
    source: {
      title: 'Tormenta20 Jogo do Ano — Capítulo 8: Recompensas',
      credits:
        'Tormenta20 Jogo do Ano (Jambô Editora), Tabelas 8-1 a 8-5 e 8-8 a 8-15.',
    },
    tesouroPorNd: {
      byNd,
      notes: parseNdNotes(tesouros),
      instructions: parseInstructions(tesouros),
    },
    riquezas: parseRiquezas(tesouros),
    itensDiversos: {
      rows: simpleNames(
        'Tabela 8-3',
        slice(
          'Tabela 8-3',
          tesouros,
          'Tabela 8-3: Itens Diversos d%   Item',
          'Tabela 8-4:'
        )
      ),
      footnotes: [],
    },
    equipamentos: parseEquipamentos(tesouros),
    pocoes: { rows: pocoes, footnotes: [] },
    superiores: parseSuperiores(tesouros),
    magicos: mag,
    acessorios: {
      menor: pricedTable(
        'Tabela 8-13',
        slice(
          'Tabela 8-13',
          magicos,
          'Tabela 8-13: Acessórios Menores d%   Acessório   Preço',
          '\n'
        )
      ),
      medio: pricedTable(
        'Tabela 8-14',
        slice(
          'Tabela 8-14',
          magicos,
          'Tabela 8-14: Acessórios Médios d%   Acessório   Preço',
          'Tabela 8-15'
        )
      ),
      maior: pricedTable(
        'Tabela 8-15',
        slice(
          'Tabela 8-15',
          magicos,
          'Tabela 8-15: Acessórios Maiores d%   Acessório   Preço',
          '\n'
        )
      ),
    },
  };
}

export function renderBasicModule(data) {
  return `/* eslint-disable */
/**
 * ARQUIVO GERADO — NÃO EDITAR À MÃO.
 *
 * Fonte: Tormenta20 Jogo do Ano, Capítulo 8 (Tabelas 8-1 a 8-5 e 8-8 a 8-15),
 * texto oficial em livros/jda/8-recompensas/ (tesouros.txt, itens-magicos.txt).
 *
 * Gerado por scripts/treasure/extract-jda.mjs. Verificado por
 * jdaFidelity.spec.ts quando livros/ está presente.
 */
import type { TreasureTables } from './types';

const BASIC_BOOK_TABLES: TreasureTables = ${JSON.stringify(data, null, 2)};

export default BASIC_BOOK_TABLES;
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = extractJda();
  fs.writeFileSync(OUT, renderBasicModule(data));
  console.log(`gerado: ${path.relative(ROOT, OUT)}`);
}
