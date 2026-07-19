#!/usr/bin/env node
/**
 * Gera `src/premium-stub/` — o substituto público do submódulo privado
 * `src/premium`, que permite rodar o projeto a partir do repositório aberto.
 *
 *   node scripts/generate-premium-stub.mjs
 *   npx prettier --write "src/premium-stub/**\/*.tsx"
 *
 * Como funciona: varre todo o código público atrás de imports que apontam para
 * `src/premium` (direto ou através dos barrels de re-export em `src/services`
 * e `src/config/firebase`), monta o inventário de nomes exigidos por módulo e
 * emite um arquivo por módulo com valores inertes. O redirecionamento em tempo
 * de execução é feito pelo `premiumStubPlugin` em `vite.config.ts`.
 *
 * Rode este script depois de mexer em imports do premium no código público —
 * um export novo consumido pelo público sem stub correspondente quebra o build
 * de quem não tem o submódulo. Os módulos em HANDWRITTEN são preservados.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const PREMIUM = path.join(SRC, 'premium');
const STUB = path.join(SRC, 'premium-stub');

/**
 * Módulos escritos à mão: o valor inerte depende de um contrato que a
 * heurística não deduz (componente React de verdade, Proxy, duck-typing do
 * Firebase). O script não os sobrescreve.
 */
const HANDWRITTEN = new Set([
  '@/premium/components/Homebrew/HomebrewCard',
  '@/premium/config/firebase',
  '@/premium/data/bestiaryCategoryMeta',
  '@/premium/data/conditions',
  '@/premium/functions/threatConditions',
]);

/**
 * Formas que o código público LÊ — derivadas dos call sites reais. Sem isto o
 * stub devolveria `undefined` onde o público faz `.length`, spread ou soma
 * aritmética (a origem mais provável de NaN visível na ficha).
 * Chave: `<módulo>#<nome>` ou só `<nome>`.
 */
const OVERRIDES = {
  // estilos aplicados via spread em `sx` — precisam ser objeto, nunca undefined
  getConditionLabelStyle: { expr: '() => ({})' },
  getActiveEffectLabelStyle: { expr: '() => ({})' },
  ACTIVE_EFFECT_COLOR: { expr: "'inherit'" },
  // consumidos com `.defense.length` — as chaves precisam existir como arrays
  getActiveEffectHighlights: {
    expr: '() => ({ defense: [], damage: [], skills: {} })',
  },
  useConditionHighlights: {
    expr: '() => ({ name: [], defense: [], displacement: [], attack: [], attributes: {}, skills: {} })',
  },
  // somado a um atributo: undefined viraria NaN na ficha
  getConditionAttributeModifier: { expr: '() => 0' },
  // percorrido com forEach dentro de recalculateSheet
  aggregateConditionBonuses: { expr: '(bonuses = []) => bonuses' },
  CONDITION_TEMPLATES: { expr: '{}' },
  getComplicationPowerWarning: { expr: '() => null' },
  // false travaria o wizard no passo de complicação
  isComplicationPowerSelectionComplete: { expr: '() => true' },
  getComplicationByName: { expr: '() => undefined' },
  // dentro de try/catch no bônus de arma, mas undefined propaga NaN
  evaluateFormula: { expr: '() => 0' },
  validateHomebrew: { expr: '() => ({ valid: true, errors: [] })' },
  // sem call site público fora de testes
  compileClassContent: { expr: 'unavailable' },
  compileOriginContent: { expr: 'unavailable' },
  compileDeityHomebrew: { expr: 'unavailable' },
  compileHomebrewSpell: { expr: 'unavailable' },
  compileSpellPackContent: { expr: 'unavailable' },
  compilePowerPackContent: { expr: 'unavailable' },
  // undefined desliga o branch; um objeto vazio faria o público renderizar
  // componentes premium com definição vazia
  getActivePowerForSheetEntry: { expr: '() => undefined' },
  getActiveEffectForSpell: { expr: '() => undefined' },
  buildVirtualDefinitionFromCustomEffect: { expr: '() => null' },
  collectVirtualCustomEffectDefinitions: { expr: '() => []' },
  resolveProfileFont: { expr: "() => 'inherit'" },
  // hooks: as chaves abaixo são as que o público desestrutura
  useDiceRoll: {
    expr: '() => ({ showDiceResult: async () => {}, showAttackRoll: async () => {} })',
  },
  useGameTable: {
    expr: '() => ({ tables: [], loading: false, fetchUserTables: async () => {} })',
  },
  useOptionalEncounter: { expr: '() => null' },
  // a implementação real lança sem provider; o stub NÃO pode herdar isso
  useHomebrews: {
    expr: '() => ({ activated: [], myHomebrews: [], loading: false, error: null })',
  },
  useBatchThreatExport: {
    expr: '() => ({ isSelectMode: false, selectedIds: new Set(), loadedThreats: [], loading: false, progress: { current: 0, total: 0 }, error: null, printRef: { current: null }, toggleSelectMode: noop, toggleSelection: noop, selectAll: noop, clearSelection: noop, exportPdf: async () => {} })',
  },
  setEmbedTokenProvider: { expr: 'noop' },
  getSupportLevels: { expr: 'async () => []' },
  getSupporterCount: { expr: 'async () => 0' },
  '@/premium#getFeatureFlags': {
    expr: 'async () => ALL_FEATURES_DISABLED',
    imports: [
      "import { DEFAULT_FEATURE_FLAGS } from '@/types/featureFlags.types';",
      '',
      '// Sem o módulo premium não há como verificar assinatura, então toda',
      '// feature paga fica desligada — useFeatureAccess (público) já esconde a',
      '// UI correspondente a partir daqui.',
      'const ALL_FEATURES_DISABLED = Object.fromEntries(',
      '  Object.keys(DEFAULT_FEATURE_FLAGS).map((k) => [',
      '    k,',
      '    { enabled: false, supporterOnly: true },',
      '  ])',
      ') as unknown as typeof DEFAULT_FEATURE_FLAGS;',
    ],
  },
};

const COMPONENT_SUFFIX =
  /(Page|Modal|Dialog|Panel|Screen|Bar|Chip|Marker|Editor|View|List|Section|Showcase|Prompt|Toolbar|Step|Drawer|Link|Export|Renderer|Posts|Card|Toggle|Picker|Nudge)$/;
const HELPERS = [
  'NullComponent',
  'PassthroughProvider',
  'noop',
  'rejects',
  'inertService',
  'unavailable',
];

// ---------------------------------------------------------------- inventário

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || p === PREMIUM || p === STUB)
        continue;
      walk(p);
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(p);
    }
  }
})(SRC);

const STATEMENT = /(import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+'([^']+)'/g;

const toModuleId = (spec, fromFile) => {
  if (/^\.{1,2}\//.test(spec)) {
    const abs = path.resolve(path.dirname(fromFile), spec);
    return abs.startsWith(SRC)
      ? `@/${path.relative(SRC, abs).replace(/\\/g, '/')}`
      : null;
  }
  return spec.startsWith('@/') ? spec : null;
};

const parseClause = (clause, isTypeImport) => {
  const out = { values: [], types: [], hasDefault: false };
  const c = clause.trim();
  if (c === '*') return out;
  const brace = c.indexOf('{');
  const defaultPart = (brace === -1 ? c : c.slice(0, brace))
    .replace(/,\s*$/, '')
    .trim();
  if (defaultPart && !defaultPart.startsWith('{')) out.hasDefault = true;
  if (brace === -1) return out;
  for (let part of c.slice(brace + 1, c.lastIndexOf('}')).split(',')) {
    part = part.trim();
    if (!part) continue;
    let inlineType = false;
    if (part.startsWith('type ')) {
      inlineType = true;
      part = part.slice(5).trim();
    }
    const aliased = part.match(/^(\w+)\s+as\s+(\w+)$/);
    const name = aliased ? aliased[1] : part;
    if (!/^\w+$/.test(name)) continue;
    (isTypeImport || inlineType ? out.types : out.values).push(name);
  }
  return out;
};

// Barrels públicos que re-exportam o premium (src/services/*, src/config/firebase):
// o que os consumidores deles importam também precisa existir no stub.
const barrelTarget = new Map();
const edges = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const selfId = `@/${path
    .relative(SRC, file)
    .replace(/\\/g, '/')
    .replace(/\.tsx?$/, '')}`;
  let match;
  STATEMENT.lastIndex = 0;
  while ((match = STATEMENT.exec(source))) {
    const [, kind, typeKeyword, clause, spec] = match;
    const moduleId = toModuleId(spec, file);
    if (!moduleId) continue;
    if (kind === 'export' && moduleId.startsWith('@/premium')) {
      barrelTarget.set(selfId, moduleId);
    }
    edges.push({
      from: selfId,
      moduleId,
      ...parseClause(clause, !!typeKeyword),
    });
  }
}

const inventory = new Map();
const record = (id) => {
  if (!inventory.has(id)) {
    inventory.set(id, {
      module: id,
      values: new Set(),
      types: new Set(),
      hasDefault: false,
    });
  }
  return inventory.get(id);
};

for (const edge of edges) {
  const target = edge.moduleId.startsWith('@/premium')
    ? edge.moduleId
    : barrelTarget.get(edge.moduleId);
  if (!target) continue;
  const entry = record(target);
  if (edge.hasDefault) entry.hasDefault = true;
  edge.values.forEach((n) => entry.values.add(n));
  edge.types.forEach((n) => {
    if (!entry.values.has(n)) entry.types.add(n);
  });
}
barrelTarget.forEach((target) => record(target));

// ------------------------------------------------------------------ emissão

const classify = (moduleId, name) => {
  const override = OVERRIDES[`${moduleId}#${name}`] || OVERRIDES[name];
  if (override) return { expr: override.expr, imports: override.imports || [] };
  if (/^use[A-Z]/.test(name)) return { expr: '() => ({})', imports: [] };
  if (/Provider$/.test(name))
    return { expr: 'PassthroughProvider', imports: [] };
  if (/^[A-Z][A-Z0-9_]+$/.test(name)) return { expr: '[]', imports: [] };
  if (/Service$/.test(name)) return { expr: 'inertService()', imports: [] };
  if (/^[a-z]/.test(name)) return { expr: 'noop', imports: [] };
  if (
    COMPONENT_SUFFIX.test(name) ||
    moduleId.includes('/components') ||
    moduleId === '@/premium'
  ) {
    return { expr: 'NullComponent', imports: [] };
  }
  // PascalCase restante: quase sempre um tipo importado sem `import type`.
  return { ambiguous: true, imports: [] };
};

let written = 0;
let skipped = 0;

for (const entry of [...inventory.values()].sort((a, b) =>
  a.module.localeCompare(b.module)
)) {
  if (HANDWRITTEN.has(entry.module)) {
    skipped += 1;
    continue;
  }
  const relative = entry.module.replace('@/premium', '') || '/index';
  const file = path.join(STUB, `${relative}.tsx`);
  const helpers = new Set();
  const extraImports = [];
  const body = [];

  for (const name of [...entry.values].sort()) {
    if (name === 'default') continue;
    const kind = classify(entry.module, name);
    kind.imports.forEach((line) => extraImports.push(line));
    if (kind.ambiguous) {
      body.push(`export type ${name} = any;`);
      body.push(`export const ${name} = undefined as unknown as ${name};`);
    } else {
      HELPERS.forEach((h) => {
        if (new RegExp(`\\b${h}\\b`).test(kind.expr)) helpers.add(h);
      });
      body.push(`export const ${name} = ${kind.expr};`);
    }
  }
  // Um mesmo nome pode chegar como tipo num arquivo e como valor noutro; a
  // forma de valor já emite o `type`, então emitir de novo redeclararia.
  for (const type of [...entry.types]
    .filter((t) => !entry.values.has(t))
    .sort()) {
    body.push(`export type ${type} = any;`);
  }
  if (entry.hasDefault) {
    if (entry.module.includes('/components')) {
      helpers.add('NullComponent');
      body.push('export default NullComponent;');
    } else {
      helpers.add('inertService');
      body.push('export default inertService();');
    }
  }

  const depth = path.relative(path.dirname(file), STUB) || '.';
  const lines = [
    '/* eslint-disable */',
    '// Stub público — gerado por scripts/generate-premium-stub.mjs.',
  ];
  if (helpers.size) {
    lines.push(
      `import { ${[...helpers].sort().join(', ')} } from '${depth}/_inert';`
    );
  }
  extraImports.forEach((line) => lines.push(line));
  lines.push('', ...body, '');

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, lines.join('\n'));
  written += 1;
}

console.log(
  `${written} módulos gerados, ${skipped} preservados (escritos à mão).`
);
console.log('Rode: npx prettier --write "src/premium-stub/**/*.tsx"');
