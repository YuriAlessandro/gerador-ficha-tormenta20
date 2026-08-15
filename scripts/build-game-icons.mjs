#!/usr/bin/env node
/**
 * Gera o catálogo de ícones do game-icons.net usado pelos layouts de ficha.
 *
 * POR QUE ARQUIVO POR ÍCONE, E NÃO UM PACOTE NPM
 * ----------------------------------------------
 * Um ícone escolhido pelo usuário em runtime não é tree-shakeable: importar
 * `react-icons/gi` colocaria os ~4.200 desenhos no bundle de todo mundo,
 * inclusive de quem nunca abre o editor de layout. Servindo um arquivo por
 * ícone a partir de `public/`, uma ficha baixa exatamente os 5-15 que usa, o
 * Vite não põe nada no bundle, e o Cloudflare Pages serve tudo do CDN sem
 * invocar a Function (`public/_routes.json` só inclui rotas de página).
 *
 * O QUE É FEITO COM CADA SVG
 * --------------------------
 * O original tem `viewBox="0 0 512 512"` e DOIS paths: o primeiro é o quadrado
 * preto de fundo, o segundo é o glifo. Só o glifo entra, e sem o `fill` — assim
 * ele herda `currentColor` e obedece à cor do tema. É o mesmo tratamento que
 * `src/components/SheetResult/SpellsTab/spellSchoolIcons.tsx` já documenta para
 * os oito glifos de escola de magia que estão inline lá.
 *
 * LICENÇA
 * -------
 * O acervo é CC BY 3.0, com alguns autores em CC0. A licença é POR AUTOR, então
 * o manifest carrega o autor de cada ícone e o `credits.ts` gerado lista todos —
 * a atribuição é requisito da licença, não cortesia.
 *
 * USO
 *   node scripts/build-game-icons.mjs [caminho/para/icons-master]
 *
 * Sem argumento, baixa o repositório game-icons/icons do GitHub para um
 * diretório temporário.
 */
import { execFileSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'game-icons');
const GENERATED_DIR = join(ROOT, 'src', 'components', 'icons', 'gameIcons');

const TARBALL =
  'https://codeload.github.com/game-icons/icons/tar.gz/refs/heads/master';

/** Pastas do repositório que não são de autor. */
const NON_AUTHOR_DIRS = new Set(['badges', '.github']);

function fetchSource() {
  const tmp = mkdtempSync(join(tmpdir(), 'game-icons-'));
  console.log('Baixando o acervo do game-icons…');
  execFileSync('curl', ['-sSL', '-o', join(tmp, 'icons.tar.gz'), TARBALL]);
  execFileSync('tar', ['xzf', join(tmp, 'icons.tar.gz'), '-C', tmp]);
  return { dir: join(tmp, 'icons-master'), cleanup: () => rmSync(tmp, { recursive: true, force: true }) };
}

/**
 * Autores em CC0 segundo o `license.txt` do acervo (as linhas terminam em
 * "- CC0"). Todo o resto é CC BY 3.0.
 */
function parseLicenses(sourceDir) {
  const text = readFileSync(join(sourceDir, 'license.txt'), 'utf8');
  const cc0 = new Set();

  text.split('\n').forEach((line) => {
    if (!line.trim().startsWith('-')) return;
    if (!/CC0\s*$/.test(line.trim())) return;
    // "- Viscious Speed, http://… - CC0" → "viscious-speed"
    const name = line.replace(/^-\s*/, '').split(',')[0].split(' - ')[0].trim();
    cc0.add(name.toLowerCase().replace(/\s+/g, '-'));
  });

  return cc0;
}

/** Nome de exibição e link de cada autor, na ordem do `license.txt`. */
function parseAuthors(sourceDir) {
  const text = readFileSync(join(sourceDir, 'license.txt'), 'utf8');
  const authors = [];

  text.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('-')) return;
    const body = trimmed.replace(/^-\s*/, '').replace(/\s*-\s*CC0\s*$/, '');
    const [namePart, ...rest] = body.split(',');
    const name = namePart.trim();
    const url = rest.join(',').trim();
    if (name) authors.push({ name, url: url || undefined });
  });

  return authors;
}

/**
 * Extrai o glifo. Devolve `null` quando o arquivo não tem a forma esperada —
 * é melhor perder um ícone do que emitir um quadrado preto.
 */
function extractGlyph(svg) {
  const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)];
  if (paths.length === 0) return null;

  // Um único path: o próprio glifo (alguns ícones não têm o fundo).
  if (paths.length === 1) return paths[0][1];

  // Dois ou mais: o primeiro é o quadrado de fundo, e os demais compõem o
  // glifo (alguns desenhos usam mais de um traçado).
  return paths
    .slice(1)
    .map((m) => m[1])
    .join(' ');
}

function main() {
  const argDir = process.argv[2];
  const source = argDir
    ? { dir: resolve(argDir), cleanup: () => {} }
    : fetchSource();

  if (!existsSync(source.dir)) {
    throw new Error(`Acervo não encontrado em ${source.dir}`);
  }

  const cc0Authors = parseLicenses(source.dir);
  const authors = parseAuthors(source.dir);

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest = [];
  let skipped = 0;

  readdirSync(source.dir)
    .filter((entry) => {
      const full = join(source.dir, entry);
      return (
        statSync(full).isDirectory() &&
        !entry.startsWith('.') &&
        !NON_AUTHOR_DIRS.has(entry)
      );
    })
    .sort()
    .forEach((author) => {
      const authorDir = join(source.dir, author);
      const files = readdirSync(authorDir).filter((f) => f.endsWith('.svg'));
      if (files.length === 0) return;

      mkdirSync(join(OUT_DIR, author), { recursive: true });

      files.sort().forEach((file) => {
        const name = file.replace(/\.svg$/, '');
        const glyph = extractGlyph(readFileSync(join(authorDir, file), 'utf8'));

        if (!glyph) {
          skipped += 1;
          return;
        }

        // Sem `fill`: o glifo herda `currentColor` de quem o inlina.
        writeFileSync(
          join(OUT_DIR, author, file),
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="${glyph}"/></svg>\n`
        );

        manifest.push({
          id: `gi:${author}/${name}`,
          n: name,
          a: author,
          // 0 = CC BY 3.0 (padrão), 1 = CC0.
          l: cc0Authors.has(author) ? 1 : 0,
        });
      });
    });

  writeFileSync(
    join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ version: 1, icons: manifest })
  );

  mkdirSync(GENERATED_DIR, { recursive: true });
  writeFileSync(
    join(GENERATED_DIR, 'credits.generated.ts'),
    `/**
 * GERADO por scripts/build-game-icons.mjs — não editar à mão.
 *
 * Atribuição dos ícones do game-icons.net. O acervo é CC BY 3.0 (alguns autores
 * em CC0), e a licença EXIGE crédito — por isso esta lista existe e é exibida
 * na página de créditos do app.
 */
export interface GameIconAuthor {
  name: string;
  url?: string;
}

export const GAME_ICONS_SOURCE = 'https://game-icons.net';

export const GAME_ICONS_AUTHORS: GameIconAuthor[] = ${JSON.stringify(
      authors,
      null,
      2
    )};

/** Autores cujo trabalho está em CC0 em vez de CC BY 3.0. */
export const GAME_ICONS_CC0_AUTHORS: string[] = ${JSON.stringify(
      [...cc0Authors].sort(),
      null,
      2
    )};
`
  );

  source.cleanup();

  console.log(`${manifest.length} ícones gerados em public/game-icons/`);
  if (skipped > 0) console.log(`${skipped} ignorados (formato inesperado)`);
  console.log(`${authors.length} autores creditados`);
}

main();
