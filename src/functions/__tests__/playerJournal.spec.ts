import { describe, it, expect } from 'vitest';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  JOURNAL_CHARACTER_NODE_ID,
  PlayerJournal,
} from '../../interfaces/PlayerJournal';
import {
  countJournalNodes,
  createEmptyJournal,
  flattenMarkdown,
  journalHasContent,
  JOURNAL_MAX_BODY_LENGTH,
  JOURNAL_MAX_TITLE_LENGTH,
  JOURNAL_PDF_MAX_LENGTH,
  migrateNotesToJournal,
  resolveJournalNodeTitle,
  sanitizeJournal,
  serializeJournalForPdf,
} from '../playerJournal';

/** Ficha mínima: só o que a migração e a serialização realmente leem. */
const sheetWith = (partial: Partial<CharacterSheet>): CharacterSheet =>
  ({ nome: 'Thalia', ...partial } as CharacterSheet);

describe('createEmptyJournal', () => {
  it('nasce com o nó do personagem na origem, travado', () => {
    const journal = createEmptyJournal('Thalia');
    expect(journal.nodes).toHaveLength(1);
    expect(journal.nodes[0].id).toBe(JOURNAL_CHARACTER_NODE_ID);
    expect(journal.nodes[0].locked).toBe(true);
    expect(journal.nodes[0]).toMatchObject({ x: 0, y: 0 });
    expect(journal.links).toEqual([]);
  });

  it('o nó do personagem NÃO conta para o limite', () => {
    expect(countJournalNodes(createEmptyJournal('Thalia'))).toBe(0);
    expect(journalHasContent(createEmptyJournal('Thalia'))).toBe(false);
  });
});

describe('resolveJournalNodeTitle', () => {
  it('deriva o título do nó do personagem do nome ATUAL da ficha', () => {
    const journal = createEmptyJournal('Nome Antigo');
    // Renomear a ficha tem que renomear o centro do diário, sem escrita.
    expect(resolveJournalNodeTitle(journal.nodes[0], 'Nome Novo')).toBe(
      'Nome Novo'
    );
  });

  it('não mexe no título dos demais nós', () => {
    const journal = createEmptyJournal('Thalia');
    migrateNotesToJournal(sheetWith({ notes: 'oi' }));
    const other = { ...journal.nodes[0], id: 'outro', locked: undefined };
    expect(resolveJournalNodeTitle(other, 'Qualquer')).toBe('Thalia');
  });
});

describe('migrateNotesToJournal', () => {
  it('transforma as anotações num nó ligado ao personagem', () => {
    const sheet = sheetWith({ notes: 'O taverneiro se chama Bruno.' });
    migrateNotesToJournal(sheet);

    expect(sheet.journal).toBeDefined();
    expect(countJournalNodes(sheet.journal)).toBe(1);

    const noteNode = sheet.journal?.nodes.find((node) => !node.locked);
    expect(noteNode?.title).toBe('Anotações');
    expect(noteNode?.body).toBe('O taverneiro se chama Bruno.');

    expect(sheet.journal?.links).toHaveLength(1);
    expect(sheet.journal?.links[0].from).toBe(JOURNAL_CHARACTER_NODE_ID);
    expect(sheet.journal?.links[0].to).toBe(noteNode?.id);
  });

  it('NUNCA apaga sheet.notes — é a rede de segurança da migração', () => {
    // Regressão do risco de `$unset`: `stripSheetForStorage` transforma chave
    // `undefined` em remoção permanente no documento da nuvem.
    const sheet = sheetWith({ notes: 'texto original' });
    migrateNotesToJournal(sheet);
    expect(sheet.notes).toBe('texto original');
  });

  it('é idempotente', () => {
    const sheet = sheetWith({ notes: 'algo' });
    migrateNotesToJournal(sheet);
    const first = JSON.parse(JSON.stringify(sheet.journal));

    migrateNotesToJournal(sheet);
    expect(countJournalNodes(sheet.journal)).toBe(1);
    expect(sheet.journal?.nodes.map((node) => node.id)).toEqual(
      first.nodes.map((node: { id: string }) => node.id)
    );
  });

  it('ficha sem anotações não ganha diário nenhum', () => {
    const empty = sheetWith({});
    migrateNotesToJournal(empty);
    expect(empty.journal).toBeUndefined();

    const blank = sheetWith({ notes: '   \n  ' });
    migrateNotesToJournal(blank);
    expect(blank.journal).toBeUndefined();
  });

  it('não toca no diário de quem já tem um', () => {
    const journal = createEmptyJournal('Thalia');
    journal.nodes.push({
      id: 'a',
      categoryId: 'npc',
      title: 'Bruno',
      body: '',
      x: 10,
      y: 10,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    const sheet = sheetWith({ notes: 'não deveria virar nó', journal });

    migrateNotesToJournal(sheet);

    expect(countJournalNodes(sheet.journal)).toBe(1);
    expect(sheet.journal?.nodes.find((node) => !node.locked)?.title).toBe(
      'Bruno'
    );
  });

  it('diário irrecuperável vira um diário VAZIO, nunca apagado', () => {
    // `journal` está em NEVER_UNSET_SHEET_KEYS: um `delete` aqui faria a
    // próxima gravação da ficha ser rejeitada inteira por integridade.
    const sheet = sheetWith({ journal: 'lixo' as unknown as PlayerJournal });
    migrateNotesToJournal(sheet);
    expect(sheet.journal).toBeDefined();
    expect(sheet.journal?.version).toBe(1);
  });
});

describe('sanitizeJournal', () => {
  const base = (extra: Record<string, unknown>) => ({
    version: 1,
    nodes: [],
    links: [],
    customCategories: [],
    ...extra,
  });

  it('descarta arestas órfãs e laços no próprio nó', () => {
    const journal = sanitizeJournal(
      base({
        nodes: [
          { id: 'a', title: 'A', body: '', x: 0, y: 0 },
          { id: 'b', title: 'B', body: '', x: 1, y: 1 },
        ],
        links: [
          { id: 'l1', from: 'a', to: 'b' },
          { id: 'l2', from: 'a', to: 'apagado' },
          { id: 'l3', from: 'a', to: 'a' },
        ],
      })
    );

    expect(journal?.links.map((link) => link.id)).toEqual(['l1']);
  });

  it('trata A→B e B→A como a mesma conexão', () => {
    const journal = sanitizeJournal(
      base({
        nodes: [
          { id: 'a', title: 'A', body: '', x: 0, y: 0 },
          { id: 'b', title: 'B', body: '', x: 0, y: 0 },
        ],
        links: [
          { id: 'l1', from: 'a', to: 'b' },
          { id: 'l2', from: 'b', to: 'a' },
        ],
      })
    );

    expect(journal?.links).toHaveLength(1);
  });

  it('conserta coordenadas não-finitas e ids duplicados', () => {
    const journal = sanitizeJournal(
      base({
        nodes: [
          { id: 'a', title: 'A', body: '', x: Number.NaN, y: 'oi' },
          { id: 'a', title: 'duplicado', body: '', x: 0, y: 0 },
        ],
      })
    );

    expect(journal?.nodes).toHaveLength(1);
    expect(journal?.nodes[0]).toMatchObject({ x: 0, y: 0, title: 'A' });
  });

  it('mantém no máximo um nó de personagem', () => {
    const journal = sanitizeJournal(
      base({
        nodes: [
          { id: 'a', title: 'A', body: '', x: 0, y: 0, locked: true },
          { id: 'b', title: 'B', body: '', x: 0, y: 0, locked: true },
        ],
      })
    );

    expect(journal?.nodes.filter((node) => node.locked)).toHaveLength(1);
  });

  it('trunca título e corpo nos limites', () => {
    const journal = sanitizeJournal(
      base({
        nodes: [
          {
            id: 'a',
            title: 'x'.repeat(500),
            body: 'y'.repeat(JOURNAL_MAX_BODY_LENGTH + 500),
            x: 0,
            y: 0,
          },
        ],
      })
    );

    expect(journal?.nodes[0].title).toHaveLength(JOURNAL_MAX_TITLE_LENGTH);
    expect(journal?.nodes[0].body).toHaveLength(JOURNAL_MAX_BODY_LENGTH);
  });

  it('NUNCA corta nós por causa de limite de plano', () => {
    // Quem perdeu o apoio mantém tudo que escreveu; o limite só barra criação.
    const nodes = Array.from({ length: 80 }, (_, index) => ({
      id: `n${index}`,
      title: `Nó ${index}`,
      body: '',
      x: index,
      y: 0,
    }));
    const journal = sanitizeJournal(base({ nodes }));
    expect(journal?.nodes).toHaveLength(80);
  });

  it('limita o zoom do viewport à faixa válida', () => {
    expect(
      sanitizeJournal(base({ viewport: { x: 1, y: 2, zoom: 99 } }))?.viewport
    ).toMatchObject({ zoom: 2.5 });
    expect(
      sanitizeJournal(base({ viewport: { x: 1, y: 2, zoom: 0 } }))?.viewport
    ).toMatchObject({ zoom: 0.3 });
    expect(
      sanitizeJournal(base({ viewport: { x: Number.NaN, y: 2, zoom: 1 } }))
        ?.viewport
    ).toMatchObject({ x: 0 });
  });

  it('descarta categoria customizada com cor inválida', () => {
    const journal = sanitizeJournal(
      base({
        customCategories: [
          { id: 'c1', name: 'Boa', color: '#ff0000', icon: 'nota' },
          { id: 'c2', name: 'Cor ruim', color: 'vermelho', icon: 'nota' },
          { id: 'c3', color: '#00ff00', icon: 'nota' },
        ],
      })
    );

    expect(journal?.customCategories.map((category) => category.id)).toEqual([
      'c1',
    ]);
  });

  it('devolve undefined para valor que nem é objeto', () => {
    expect(sanitizeJournal(null)).toBeUndefined();
    expect(sanitizeJournal('texto')).toBeUndefined();
    expect(sanitizeJournal([])).toBeUndefined();
  });
});

describe('flattenMarkdown', () => {
  it('remove a sintaxe e devolve texto corrido', () => {
    expect(flattenMarkdown('# Título\n\nUm **negrito** e um _itálico_.')).toBe(
      'Título Um negrito e um itálico.'
    );
  });

  it('converte listas e resolve links pelo texto', () => {
    expect(flattenMarkdown('- item um\n- item dois')).toBe(
      '• item um • item dois'
    );
    expect(flattenMarkdown('veja [a taverna](http://x.com)')).toBe(
      'veja a taverna'
    );
  });
});

describe('serializeJournalForPdf', () => {
  const journalWithNodes = (): PlayerJournal => {
    const journal = createEmptyJournal('Thalia');
    journal.nodes.push(
      {
        id: 'npc1',
        categoryId: 'npc',
        title: 'Bruno',
        body: 'Guarda do portão. **Subornável**.',
        x: 0,
        y: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'loc1',
        categoryId: 'local',
        title: 'Vale do Sol',
        body: 'Vila de ferreiros.',
        x: 0,
        y: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }
    );
    journal.links.push({ id: 'l1', from: 'npc1', to: 'loc1' });
    return journal;
  };

  it('agrupa por categoria e lista as conexões', () => {
    const text = serializeJournalForPdf(journalWithNodes(), 'Thalia');

    expect(text).toContain('NPC');
    expect(text).toContain('- Bruno — Guarda do portão. Subornável.');
    expect(text).toContain('Conexões: Vale do Sol');
    expect(text).toContain('Local');
    expect(text).toContain('- Vale do Sol — Vila de ferreiros.');
  });

  it('não imprime o nó do personagem', () => {
    const text = serializeJournalForPdf(journalWithNodes(), 'Thalia');
    expect(text).not.toContain('Thalia');
  });

  it('devolve string vazia para diário ausente ou só com o personagem', () => {
    expect(serializeJournalForPdf(undefined, 'Thalia')).toBe('');
    expect(serializeJournalForPdf(createEmptyJournal('Thalia'), 'Thalia')).toBe(
      ''
    );
  });

  it('inclui os nós de categoria customizada', () => {
    const journal = createEmptyJournal('Thalia');
    journal.customCategories.push({
      id: 'custom:1',
      name: 'Segredos',
      color: '#ff0000',
      icon: 'nota',
      custom: true,
    });
    journal.nodes.push({
      id: 's1',
      categoryId: 'custom:1',
      title: 'A carta',
      body: 'Escondida no porão.',
      x: 0,
      y: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const text = serializeJournalForPdf(journal, 'Thalia');
    expect(text).toContain('Segredos');
    expect(text).toContain('- A carta — Escondida no porão.');
  });

  it('não perde nó cuja categoria customizada foi apagada', () => {
    const journal = createEmptyJournal('Thalia');
    journal.nodes.push({
      id: 'orfao',
      categoryId: 'custom:sumiu',
      title: 'Órfão',
      body: '',
      x: 0,
      y: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(serializeJournalForPdf(journal, 'Thalia')).toContain('- Órfão');
  });

  it('trunca um diário gigante em vez de gerar dezenas de páginas', () => {
    const journal = createEmptyJournal('Thalia');
    for (let index = 0; index < 400; index += 1) {
      journal.nodes.push({
        id: `n${index}`,
        categoryId: 'nota',
        title: `Nó ${index}`,
        body: 'x'.repeat(400),
        x: 0,
        y: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    }

    const text = serializeJournalForPdf(journal, 'Thalia');
    expect(text.length).toBeLessThanOrEqual(JOURNAL_PDF_MAX_LENGTH + 10);
    expect(text.endsWith('[...]')).toBe(true);
  });
});
