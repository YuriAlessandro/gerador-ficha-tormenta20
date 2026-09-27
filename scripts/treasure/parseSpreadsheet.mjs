/**
 * Parser determinístico da planilha "Geração de Tesouros em Tormenta20"
 * (Guilherme Dei Svaldi; riquezas adicionais: Rafael Dei Svaldi).
 *
 * Recebe o CSV cru de cada aba (snapshots em `scripts/treasure/snapshots/`) e
 * devolve a estrutura consumida por `src/data/treasure/supplements.generated.ts`.
 *
 * Regra de ouro: NADA aqui interpreta ou completa regra de jogo. O parser só
 * reorganiza o que está nas células. Qualquer célula fora do formato esperado
 * lança erro — não existe fallback silencioso.
 *
 * Usado por `import-spreadsheet.mjs` (gera o arquivo) e pelo teste
 * `spreadsheetFidelity.spec.ts` (garante que o arquivo gerado não foi editado
 * à mão).
 */

export const SPREADSHEET_ID = '18n22comQYq8L1QSucDbIecWnNsrjJb-paQUoU0FkX5Y';

/** Abas lidas, na ordem da planilha (a aba "Introdução" é só texto). */
export const TABS = [
  { key: 'introducao', title: 'Introdução', gid: '22296790' },
  { key: 'tesouroPorNd', title: 'Tesouro por ND', gid: '0' },
  { key: 'riquezas', title: 'Riquezas', gid: '30212173' },
  { key: 'itensDiversos', title: 'Itens Diversos', gid: '522361619' },
  { key: 'equipamentos', title: 'Equipamentos', gid: '176152497' },
  { key: 'pocoes', title: 'Poções', gid: '333198564' },
  { key: 'superiores', title: 'Superiores', gid: '1103375935' },
  { key: 'magicos', title: 'Mágicos', gid: '1598777648' },
  { key: 'acessorios', title: 'Mágicos (Acessórios)', gid: '1947343535' },
];

const BOOKS = [
  'Tormenta20',
  'Ameaças de Arton',
  'Deuses de Arton',
  'Heróis de Arton',
];

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/** CSV RFC 4180 (aspas, "" escapado, quebra de linha dentro de aspas). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const src = text.replace(/\r\n?/g, '\n');
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fail(tab, msg, value) {
  throw new Error(
    `[planilha de tesouro] aba "${tab}": ${msg}: ${JSON.stringify(value)}`
  );
}

const RANGE_RE = /^(\d{1,3})(?:-(\d{1,3}))?$/;

function isRange(s) {
  return RANGE_RE.test(s.trim());
}

function parseRange(tab, s) {
  const m = RANGE_RE.exec(s.trim());
  if (!m) fail(tab, 'faixa de d% inválida', s);
  const min = Number(m[1]);
  const max = m[2] ? Number(m[2]) : min;
  if (max < min) fail(tab, 'faixa invertida', s);
  return { min, max };
}

/** "1.080" → 1080 ; "30" → 30 (separador de milhar brasileiro). */
function parsePrice(tab, s) {
  const t = s.trim();
  if (!/^\d{1,3}(\.\d{3})*$/.test(t)) fail(tab, 'preço inválido', s);
  return Number(t.replace(/\./g, ''));
}

/** Separa o marcador de rodapé (*, **, ***) do fim do nome. */
function splitMarker(raw) {
  const m = /^(.*?)(\*{1,3})$/.exec(raw.trim());
  if (!m) return { name: raw.trim() };
  return { name: m[1].trim(), marker: m[2] };
}

function parseBook(tab, s) {
  const t = s.trim();
  if (!BOOKS.includes(t)) fail(tab, 'livro desconhecido', s);
  return t;
}

function parsePage(tab, s) {
  const t = s.trim();
  if (!/^\d+$/.test(t)) fail(tab, 'página inválida', s);
  return Number(t);
}

/** Linha de tabela padrão: d%, nome, livro, página (e preço opcional). */
function parseEntry(tab, cells, { withPrice = false } = {}) {
  const [rangeCell, rawName, ...rest] = cells;
  const { min, max } = parseRange(tab, rangeCell);
  const { name, marker } = splitMarker(rawName);
  if (!name) fail(tab, 'nome vazio', cells);
  const entry = { min, max, name, rawName: rawName.trim() };
  if (marker) entry.marker = marker;

  let bookCell;
  let pageCell;
  if (withPrice) {
    entry.price = parsePrice(tab, rest[0]);
    [, bookCell, pageCell] = rest;
  } else {
    [bookCell, pageCell] = rest;
  }

  // "Arma específica | Role na tabela abaixo | –" → remete à sub-tabela.
  if (bookCell.trim() === 'Role na tabela abaixo') {
    entry.rollOnSpecificTable = true;
    return entry;
  }
  entry.book = parseBook(tab, bookCell);
  entry.page = parsePage(tab, pageCell);
  return entry;
}

const isBlank = (cells) => cells.every((c) => c.trim() === '');

/**
 * Lê blocos de tabelas lado a lado (ex.: ARMAS | ARMADURAS | ESOTÉRICOS).
 * Cada bloco começa na coluna `offset` e tem `width` colunas. Dentro de um
 * bloco podem existir várias seções (título em CAIXA ALTA → linha "d%" →
 * linhas de dados → notas de rodapé).
 */
function parseBlocks(tab, rows, offsets, width, entryOpts) {
  return offsets.map((offset) => {
    const sections = [];
    let current = null;
    let pendingTitle = null;
    rows.forEach((row) => {
      const cells = [];
      for (let i = 0; i < width; i += 1) cells.push(row[offset + i] ?? '');
      if (isBlank(cells)) return;
      const first = cells[0].trim();
      if (first === 'd%') {
        current = { title: pendingTitle, rows: [], footnotes: [] };
        sections.push(current);
        pendingTitle = null;
        return;
      }
      if (current && isRange(first) && cells[1].trim() !== '') {
        if (current.footnotes.length > 0)
          fail(tab, 'linha de dados depois das notas', cells);
        current.rows.push(parseEntry(tab, cells, entryOpts));
        return;
      }
      // Texto solto: título de nova seção (CAIXA ALTA, sem minúsculas) ou nota.
      const rest = cells.slice(1).map((c) => c.trim());
      const isTitle =
        first !== '' &&
        first === first.toUpperCase() &&
        /[A-ZÀ-Ý]/.test(first) &&
        !/^\*/.test(first);
      if (isTitle) {
        pendingTitle = first;
        return;
      }
      if (!current) fail(tab, 'texto antes da primeira tabela', cells);
      if (rest.some((c) => c !== ''))
        fail(tab, 'nota com várias células', cells);
      current.footnotes.push(first);
    });
    return sections;
  });
}

// ---------------------------------------------------------------------------
// Tesouro por ND
// ---------------------------------------------------------------------------

const ND_LABELS = [
  '1/4',
  '1/2',
  ...Array.from({ length: 20 }, (_, i) => String(i + 1)),
];

/** "1d3+1" → {n:1,sides:3,add:1} ; "1" → {n:1} */
function parseCount(tab, s) {
  const m = /^(\d+)(?:d(\d+))?(?:\+(\d+))?$/.exec(s);
  if (!m) fail(tab, 'quantidade inválida', s);
  const count = { n: Number(m[1]) };
  if (m[2]) count.sides = Number(m[2]);
  if (m[3]) count.add = Number(m[3]);
  return count;
}

const TIERS = {
  menor: 'menor',
  menores: 'menor',
  média: 'media',
  médias: 'media',
  maior: 'maior',
  maiores: 'maior',
};

/**
 * Fórmula da coluna Dinheiro. Exportada porque a Tabela 8-1 do livro básico
 * usa exatamente a mesma notação.
 */
export function parseMoneyFormula(tab, raw) {
  const s = raw.trim();
  if (s === '—') return { kind: 'none' };
  let m = /^(\d+d\d+(?:\+\d+)?)x([\d.]+) (TC|T\$|TO)$/.exec(s);
  if (m) {
    return {
      kind: 'coins',
      count: parseCount(tab, m[1]),
      mult: Number(m[2].replace(/\./g, '')),
      currency: m[3],
    };
  }
  m =
    /^(\d+(?:d\d+)?(?:\+\d+)?) riquezas? (menor|menores|média|médias|maior|maiores) ?(\+%)?$/.exec(
      s
    );
  if (m) {
    return {
      kind: 'riqueza',
      count: parseCount(tab, m[1]),
      tier: TIERS[m[2]],
      bonus: Boolean(m[3]),
    };
  }
  return fail(tab, 'fórmula de dinheiro não reconhecida', raw);
}

const MAGIC_TIERS = { menor: 'menor', médio: 'medio', maior: 'maior' };

/** Fórmula da coluna Itens (mesma notação da Tabela 8-1 do livro básico). */
export function parseItemFormula(tab, raw) {
  const s = raw.trim();
  if (s === '—') return { kind: 'none' };
  if (s === 'Item diverso' || s === 'Diverso') return { kind: 'diverso' };
  let m = /^Equipamento( 2D)?$/.exec(s);
  if (m) return { kind: 'equipamento', twoDice: Boolean(m[1]) };
  m = /^(\d+(?:d\d+)?(?:\+\d+)?) poç(?:ão|ões)( \+%)?$/.exec(s);
  if (m) {
    return {
      kind: 'pocao',
      count: parseCount(tab, m[1]),
      bonus: Boolean(m[2]),
    };
  }
  m = /^Superior \((\d+) melhorias?\)( 2D)?$/.exec(s);
  if (m) {
    return {
      kind: 'superior',
      improvements: Number(m[1]),
      twoDice: Boolean(m[2]),
    };
  }
  m = /^Mágico \((menor|médio|maior)\)( 2D)?$/.exec(s);
  if (m) {
    return {
      kind: 'magico',
      tier: MAGIC_TIERS[m[1]],
      twoDice: Boolean(m[2]),
    };
  }
  return fail(tab, 'fórmula de item não reconhecida', raw);
}

function parseNdTable(rows) {
  const tab = 'Tesouro por ND';
  const header = rows[0].slice(0, 6).map((c) => c.trim());
  if (header.join('|') !== 'ND|d%|Dinheiro||d%|Itens')
    fail(tab, 'cabeçalho inesperado', header);

  const byNd = {};
  let nd = null;
  const notes = [];
  // Coluna "Resultados da Tabela": instruções em prosa (tipo de equipamento
  // em 1d6, tipo de item mágico em 1d6 etc.), preservadas verbatim.
  const instructions = rows
    .slice(1)
    .map((row) => (row[7] ?? '').trim())
    .filter(Boolean);
  let finished = false;
  rows.slice(1).forEach((row) => {
    const [ndCell, moneyRange, money, , itemRange, item] = row.map((c) =>
      (c ?? '').trim()
    );
    if (finished) {
      if (ndCell) notes.push(ndCell);
      return;
    }
    if (!moneyRange && !itemRange) {
      if (nd === '20') finished = true;
      if (ndCell) notes.push(ndCell);
      return;
    }
    if (ndCell) {
      if (!ND_LABELS.includes(ndCell)) fail(tab, 'ND desconhecido', ndCell);
      nd = ndCell;
      byNd[nd] = { money: [], items: [] };
    }
    if (!nd) fail(tab, 'linha sem ND', row);
    if (moneyRange) {
      byNd[nd].money.push({
        ...parseRange(tab, moneyRange),
        label: money,
        result: parseMoneyFormula(tab, money),
      });
    }
    if (itemRange) {
      byNd[nd].items.push({
        ...parseRange(tab, itemRange),
        label: item,
        result: parseItemFormula(tab, item),
      });
    }
  });
  ND_LABELS.forEach((label) => {
    if (!byNd[label]) fail(tab, 'ND ausente', label);
  });
  return { byNd, notes, instructions };
}

// ---------------------------------------------------------------------------
// Riquezas
// ---------------------------------------------------------------------------

/** "4d4 (10)" / "1d4x10 (25)" / "4d12x10.000 (260.000)" */
function parseWealthValue(tab, raw) {
  const m = /^(\d+)d(\d+)(?:x([\d.]+))? \(([\d.]+)\)$/.exec(raw.trim());
  if (!m) fail(tab, 'valor de riqueza inválido', raw);
  return {
    n: Number(m[1]),
    sides: Number(m[2]),
    mult: m[3] ? Number(m[3].replace(/\./g, '')) : 1,
    average: Number(m[4].replace(/\./g, '')),
  };
}

/** Uma linha por quantidade de espaços: "0,5 espaço: a, b, c;" */
function parseExamples(tab, raw) {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = /^(—|[\d,]+ espaços?):\s*(.+?)[;.]?$/.exec(line);
      if (!m) fail(tab, 'linha de exemplo inválida', line);
      return { spaces: m[1], text: m[2].trim() };
    });
}

function parseTierRange(tab, s) {
  const t = s.trim();
  if (t === '—') return null;
  return parseRange(tab, t);
}

function parseRiquezas(rows) {
  const tab = 'Riquezas';
  if (rows[0][0].trim() !== 'VALOR DAS RIQUEZAS')
    fail(tab, 'título inesperado', rows[0]);
  const header = rows[1].map((c) => c.trim());
  if (header.slice(0, 4).join('|') !== 'Menor|Média|Maior|Valor (T$)')
    fail(tab, 'cabeçalho inesperado', header);

  const values = [];
  let i = 2;
  for (; i < rows.length; i += 1) {
    const [menor, media, maior, valor, exemplos] = rows[i];
    if (isBlank(rows[i])) break;
    values.push({
      menor: parseTierRange(tab, menor),
      media: parseTierRange(tab, media),
      maior: parseTierRange(tab, maior),
      valueLabel: valor.trim(),
      value: parseWealthValue(tab, valor),
      examples: parseExamples(tab, exemplos),
    });
  }

  // Tabela opcional de espaços (1d20).
  const notes = [];
  const spaces = [];
  let inSpaces = false;
  for (; i < rows.length; i += 1) {
    const cells = rows[i].map((c) => c.trim());
    if (isBlank(cells)) {
      // separador
    } else if (cells[0] === 'ESPAÇOS DAS RIQUEZAS') {
      // título
    } else if (cells[0] === '1d20') {
      inSpaces = true;
    } else if (inSpaces) {
      const m = /^(\d+)(?: a (\d+))?$/.exec(cells[0]);
      if (!m) fail(tab, 'faixa de 1d20 inválida', cells);
      spaces.push({
        min: Number(m[1]),
        max: m[2] ? Number(m[2]) : Number(m[1]),
        spaces: cells[1],
        description: cells[2],
      });
    } else {
      notes.push(cells[0]);
    }
  }
  return { values, spaces, notes };
}

// ---------------------------------------------------------------------------
// Abas de tabela simples
// ---------------------------------------------------------------------------

function parseSimpleTable(tab, rows, expectedHeader, entryOpts) {
  const header = rows[0].map((c) => c.trim());
  if (header.join('|') !== expectedHeader)
    fail(tab, 'cabeçalho inesperado', header);
  const entries = [];
  const footnotes = [];
  rows.slice(1).forEach((row) => {
    if (isBlank(row)) return;
    if (isRange(row[0])) entries.push(parseEntry(tab, row, entryOpts));
    else footnotes.push(row[0].trim());
  });
  return { rows: entries, footnotes };
}

function singleSection(tab, blockSections, title) {
  if (blockSections.length !== 1)
    fail(tab, `esperava 1 seção em ${title}`, blockSections.length);
  return blockSections[0];
}

function stripTitle(section) {
  return { rows: section.rows, footnotes: section.footnotes };
}

function findSection(tab, sections, title) {
  const s = sections.find((sec) => sec.title === title);
  if (!s) fail(tab, 'seção ausente', title);
  return stripTitle(s);
}

// ---------------------------------------------------------------------------
// Entrada principal
// ---------------------------------------------------------------------------

/** @param csvByKey objeto { [tab.key]: textoCsv } */
export function parseSpreadsheet(csvByKey) {
  const rowsOf = (key) => parseCsv(csvByKey[key]);

  const equipTab = 'Equipamentos';
  const [armas, armaduras, esotericos] = parseBlocks(
    equipTab,
    rowsOf('equipamentos').slice(1),
    [0, 5, 10],
    4
  ).map((sections, idx) =>
    stripTitle(singleSection(equipTab, sections, String(idx)))
  );

  const supTab = 'Superiores';
  const [supArmas, supArmaduras, supEsotericos] = parseBlocks(
    supTab,
    rowsOf('superiores').slice(1),
    [0, 5, 10],
    4
  ).map((sections, idx) =>
    stripTitle(singleSection(supTab, sections, String(idx)))
  );

  const magTab = 'Mágicos';
  const [magArmas, magArmaduras, magEsotericos] = parseBlocks(
    magTab,
    rowsOf('magicos').slice(1),
    [0, 5, 10],
    4
  );

  const accTab = 'Mágicos (Acessórios)';
  const [accMenor, accMedio, accMaior] = parseBlocks(
    accTab,
    rowsOf('acessorios').slice(1),
    [0, 6, 12],
    5,
    { withPrice: true }
  ).map((sections, idx) =>
    stripTitle(singleSection(accTab, sections, String(idx)))
  );

  return {
    source: {
      title: 'Geração de Tesouros em Tormenta20',
      spreadsheetId: SPREADSHEET_ID,
      credits:
        'Criação da planilha: Guilherme Dei Svaldi. Riquezas adicionais: Rafael Dei Svaldi.',
    },
    introduction: rowsOf('introducao')
      .map((row) =>
        row
          .map((c) => c.trim())
          .filter(Boolean)
          .join(' ')
      )
      .filter(Boolean),
    tesouroPorNd: parseNdTable(rowsOf('tesouroPorNd')),
    riquezas: parseRiquezas(rowsOf('riquezas')),
    itensDiversos: parseSimpleTable(
      'Itens Diversos',
      rowsOf('itensDiversos'),
      'd%|Item|Livro|Página'
    ),
    equipamentos: { armas, armaduras, esotericos },
    pocoes: parseSimpleTable(
      'Poções',
      rowsOf('pocoes'),
      'd%|Poção|Preço (T$)|Livro|Página',
      { withPrice: true }
    ),
    superiores: {
      armas: supArmas,
      armaduras: supArmaduras,
      esotericos: supEsotericos,
    },
    magicos: {
      armas: findSection(magTab, magArmas, null),
      armasEspecificas: findSection(magTab, magArmas, 'ARMAS ESPECÍFICAS'),
      armaduras: findSection(magTab, magArmaduras, null),
      armadurasEspecificas: findSection(
        magTab,
        magArmaduras,
        'ARMADURAS & ESCUDOS ESPECÍFICOS'
      ),
      esotericos: findSection(magTab, magEsotericos, null),
      esotericosEspecificos: findSection(
        magTab,
        magEsotericos,
        'ESOTÉRICOS ESPECÍFICOS'
      ),
    },
    acessorios: { menor: accMenor, medio: accMedio, maior: accMaior },
  };
}
