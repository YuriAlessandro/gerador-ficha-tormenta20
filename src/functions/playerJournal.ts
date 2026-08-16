import { v4 as uuid } from 'uuid';
import CharacterSheet from '../interfaces/CharacterSheet';
import {
  JournalLink,
  JournalNode,
  PlayerJournal,
  JOURNAL_CHARACTER_NODE_ID,
  JOURNAL_CHARACTER_CATEGORY_ID,
  JOURNAL_DEFAULT_CATEGORY_ID,
} from '../interfaces/PlayerJournal';
import {
  getJournalCategories,
  getJournalCategory,
} from '../data/playerJournalCategories';

/**
 * Helpers públicos do Diário do Jogador.
 *
 * Ficam no repo público porque a migração roda no `normalizeSheet` e a
 * serialização é usada pelo PDF — os dois têm que funcionar num build sem o
 * submódulo premium. A UI do canvas é que é premium.
 */

/** Distância, em unidades de mundo, entre o personagem e o primeiro anel. */
export const JOURNAL_RING_RADIUS = 260;

export const JOURNAL_MAX_TITLE_LENGTH = 80;
export const JOURNAL_MAX_BODY_LENGTH = 10000;
export const JOURNAL_MIN_ZOOM = 0.3;
export const JOURNAL_MAX_ZOOM = 2.5;

/** Teto do bloco no PDF, para um diário grande não virar 60 páginas. */
export const JOURNAL_PDF_MAX_LENGTH = 40000;

const now = (): string => new Date().toISOString();

/**
 * O nó central do diário: o próprio personagem.
 *
 * O TÍTULO aqui é só o valor inicial. Quem exibe deve derivar de `sheet.nome`
 * (ver `resolveJournalNodeTitle`), senão renomear a ficha deixa o centro do
 * diário com o nome antigo.
 */
function createCharacterNode(characterName: string): JournalNode {
  const timestamp = now();
  return {
    id: JOURNAL_CHARACTER_NODE_ID,
    categoryId: JOURNAL_CHARACTER_CATEGORY_ID,
    title: characterName || 'Meu personagem',
    body: '',
    x: 0,
    y: 0,
    locked: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Diário recém-criado: só o nó do personagem, na origem. */
export function createEmptyJournal(characterName: string): PlayerJournal {
  return {
    version: 1,
    nodes: [createCharacterNode(characterName)],
    links: [],
    customCategories: [],
  };
}

/**
 * Título exibido de um nó. Só o nó do personagem é derivado — ele espelha o
 * nome da ficha, então renomear o personagem renomeia o centro do diário sem
 * precisar de nenhuma escrita.
 */
export function resolveJournalNodeTitle(
  node: JournalNode,
  characterName: string
): string {
  if (node.id === JOURNAL_CHARACTER_NODE_ID) {
    return characterName || node.title || 'Meu personagem';
  }
  return node.title;
}

/** Quantos nós contam para o limite. O do personagem é de graça. */
export function countJournalNodes(journal?: PlayerJournal): number {
  if (!journal) return 0;
  return journal.nodes.filter((node) => !node.locked).length;
}

/** Um diário só tem conteúdo quando existe algo além do nó do personagem. */
export function journalHasContent(journal?: PlayerJournal): boolean {
  return countJournalNodes(journal) > 0;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const finite = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.slice(0, max) : '';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Saneia um diário vindo do disco.
 *
 * Existe pelo mesmo motivo do `sanitizeWeaponOverrides`: há fichas corrompidas
 * na nuvem, e um nó com `x: NaN` ou uma aresta apontando para um nó apagado
 * quebrariam o canvas inteiro em vez de sumir sozinhos.
 *
 * NUNCA corta `nodes` por causa de limite de plano — quem perdeu o apoio mantém
 * tudo que escreveu; o limite só barra criação nova (mesma política dos
 * suplementos).
 */
export function sanitizeJournal(value: unknown): PlayerJournal | undefined {
  if (!isRecord(value)) return undefined;

  const rawNodes = Array.isArray(value.nodes) ? value.nodes : [];
  const seenIds = new Set<string>();
  let characterSeen = false;

  const nodes: JournalNode[] = [];
  rawNodes.forEach((raw) => {
    if (!isRecord(raw)) return;
    const id = typeof raw.id === 'string' ? raw.id : '';
    if (!id || seenIds.has(id)) return;
    seenIds.add(id);

    // No máximo um nó de personagem: um segundo daria dois centros ao layout.
    const locked = raw.locked === true && !characterSeen;
    if (locked) characterSeen = true;

    const timestamp =
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : new Date(0).toISOString();

    nodes.push({
      id,
      categoryId:
        typeof raw.categoryId === 'string' && raw.categoryId
          ? raw.categoryId
          : JOURNAL_DEFAULT_CATEGORY_ID,
      title: text(raw.title, JOURNAL_MAX_TITLE_LENGTH),
      body: text(raw.body, JOURNAL_MAX_BODY_LENGTH),
      x: finite(raw.x, 0),
      y: finite(raw.y, 0),
      ...(locked ? { locked: true as const } : {}),
      createdAt: timestamp,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : timestamp,
    });
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const seenPairs = new Set<string>();
  const rawLinks = Array.isArray(value.links) ? value.links : [];

  const links: JournalLink[] = [];
  rawLinks.forEach((raw) => {
    if (!isRecord(raw)) return;
    const { from, to } = raw;
    if (typeof from !== 'string' || typeof to !== 'string') return;
    // Aresta órfã (nó apagado) e laço no próprio nó não têm o que desenhar.
    if (from === to || !nodeIds.has(from) || !nodeIds.has(to)) return;
    // Par não-ordenado: A→B e B→A são a mesma linha na tela.
    const pair = [from, to].sort().join('|');
    if (seenPairs.has(pair)) return;
    seenPairs.add(pair);

    links.push({
      id: typeof raw.id === 'string' && raw.id ? raw.id : uuid(),
      from,
      to,
      ...(typeof raw.label === 'string' && raw.label
        ? { label: raw.label.slice(0, 40) }
        : {}),
    });
  });

  const rawCategories = Array.isArray(value.customCategories)
    ? value.customCategories
    : [];
  const customCategories = rawCategories.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const { id, name, color, icon } = raw;
    if (typeof id !== 'string' || !id) return [];
    if (typeof name !== 'string' || !name) return [];
    if (typeof color !== 'string' || !HEX_COLOR.test(color)) return [];
    return [
      {
        id,
        name: name.slice(0, JOURNAL_MAX_TITLE_LENGTH),
        color,
        icon: typeof icon === 'string' && icon ? icon : 'nota',
        custom: true as const,
      },
    ];
  });

  const journal: PlayerJournal = {
    version: 1,
    nodes,
    links,
    customCategories,
  };

  if (isRecord(value.viewport)) {
    journal.viewport = {
      x: finite(value.viewport.x, 0),
      y: finite(value.viewport.y, 0),
      zoom: Math.min(
        JOURNAL_MAX_ZOOM,
        Math.max(JOURNAL_MIN_ZOOM, finite(value.viewport.zoom, 1))
      ),
    };
  }

  return journal;
}

/**
 * Migra as anotações livres antigas (`sheet.notes`) para o diário.
 *
 * Roda no `normalizeSheet`, o chokepoint de toda carga de ficha. Regras:
 *
 * - Idempotente: não faz nada se a ficha já tem diário.
 * - Ficha sem anotações não ganha diário nenhum — o campo só nasce quando o
 *   jogador criar o primeiro nó, para não engordar toda ficha do banco à toa.
 * - NÃO apaga `sheet.notes`. Apagar viraria `$unset` no `stripSheetForStorage`,
 *   ou seja, uma escrita destrutiva; o texto original fica em disco como rede
 *   de segurança e é ignorado pela UI daqui em diante.
 */
export function migrateNotesToJournal(sheet: CharacterSheet): void {
  if (sheet.journal) {
    // Diário já existe: nada de migrar, mas é o momento certo de sanear —
    // este é o ponto por onde TODA carga de ficha passa.
    //
    // Quando nem dá para sanear (valor que não é objeto), o campo vira um
    // diário VAZIO em vez de ser apagado: `journal` está em
    // NEVER_UNSET_SHEET_KEYS, e um `delete` aqui faria a próxima gravação da
    // ficha ser rejeitada inteira por integridade.
    sheet.journal =
      sanitizeJournal(sheet.journal) ?? createEmptyJournal(sheet.nome);
    return;
  }

  const notes = sheet.notes?.trim();
  if (!notes) return;

  const journal = createEmptyJournal(sheet.nome);
  const timestamp = now();
  const noteNode: JournalNode = {
    id: uuid(),
    categoryId: JOURNAL_DEFAULT_CATEGORY_ID,
    title: 'Anotações',
    body: sheet.notes ?? '',
    x: JOURNAL_RING_RADIUS,
    y: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  journal.nodes.push(noteNode);
  journal.links.push({
    id: uuid(),
    from: JOURNAL_CHARACTER_NODE_ID,
    to: noteNode.id,
  });

  sheet.journal = journal;
}

/**
 * Achata markdown para texto corrido.
 *
 * O PDF desenha texto puro, então `**negrito**` e `# título` sairiam com os
 * símbolos à mostra. Não dá para usar o `react-markdown`: ele é um renderer de
 * React, não um conversor para string.
 */
export function flattenMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // blocos de código
    .replace(/`([^`]*)`/g, '$1') // código inline
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // imagens
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // títulos
    .replace(/^\s{0,3}>\s?/gm, '') // citações
    .replace(/^\s*[-*+]\s+/gm, '• ') // listas
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // negrito
    .replace(/(\*|_)(.*?)\1/g, '$2') // itálico
    .replace(/~~(.*?)~~/g, '$1') // riscado
    .replace(/\s*\n\s*/g, ' ') // tudo numa linha
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Texto do diário para as páginas de continuação do PDF, agrupado por
 * categoria. O nó do personagem não entra: ele é só o centro do canvas e o nome
 * já está no cabeçalho da ficha.
 *
 * Agrupa por CATEGORIA e não por travessia do grafo porque ficha impressa é
 * consultada como índice — e a ordem das categorias é estável entre salvamentos,
 * enquanto uma ordem derivada das arestas embaralharia o documento inteiro toda
 * vez que uma conexão mudasse.
 */
export function serializeJournalForPdf(
  journal: PlayerJournal | undefined,
  characterName: string
): string {
  if (!journal || !journalHasContent(journal)) return '';

  const titleOf = (nodeId: string): string => {
    const node = journal.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) return '';
    return resolveJournalNodeTitle(node, characterName);
  };

  const connectionsOf = (nodeId: string): string[] =>
    journal.links
      .filter((link) => link.from === nodeId || link.to === nodeId)
      .map((link) => titleOf(link.from === nodeId ? link.to : link.from))
      .filter((title) => !!title);

  const blocks: string[] = [];

  getJournalCategories(journal).forEach((category) => {
    const nodes = journal.nodes.filter(
      (node) => !node.locked && node.categoryId === category.id
    );
    if (nodes.length === 0) return;

    const lines = nodes.map((node) => {
      const body = flattenMarkdown(node.body);
      const connections = connectionsOf(node.id);
      const parts = [`- ${node.title}${body ? ` — ${body}` : ''}`];
      if (connections.length > 0) {
        parts.push(`  Conexões: ${connections.join(', ')}`);
      }
      return parts.join('\n');
    });

    blocks.push(`${category.name}\n${lines.join('\n')}`);
  });

  // Nós cuja categoria customizada foi apagada caem no fallback `nota` e já
  // saem no bloco dela — mas só se ainda não tiverem sido listados acima.
  const listed = new Set(
    getJournalCategories(journal).map((category) => category.id)
  );
  const orphans = journal.nodes.filter(
    (node) => !node.locked && !listed.has(node.categoryId)
  );
  if (orphans.length > 0) {
    const fallback = getJournalCategory(JOURNAL_DEFAULT_CATEGORY_ID, journal);
    const lines = orphans.map((node) => {
      const body = flattenMarkdown(node.body);
      return `- ${node.title}${body ? ` — ${body}` : ''}`;
    });
    blocks.push(`${fallback.name}\n${lines.join('\n')}`);
  }

  const output = blocks.join('\n\n');
  if (output.length <= JOURNAL_PDF_MAX_LENGTH) return output;
  return `${output.slice(0, JOURNAL_PDF_MAX_LENGTH)}\n[...]`;
}
