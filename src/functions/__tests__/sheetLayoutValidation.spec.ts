import { describe, it, expect } from 'vitest';
import {
  SHEET_LAYOUT_CAPS,
  SHEET_LAYOUT_SCHEMA_VERSION,
  SheetLayout,
} from '../../interfaces/SheetLayout';
import {
  DEFAULT_SHEET_LAYOUT,
  PRESET_TABS,
} from '../../interfaces/sheetLayoutPresets';
import {
  sanitizeSheetLayout,
  validateSheetLayout,
} from '../sheetLayoutValidation';

/** Layout mínimo válido: só o obrigatório, para cada teste sujar um pedaço. */
const minimal = (): SheetLayout => ({
  schemaVersion: SHEET_LAYOUT_SCHEMA_VERSION,
  id: 'layout-1',
  name: 'Meu layout',
  template: 'tabs',
  regions: [
    {
      id: 'r1',
      role: 'main',
      sections: [{ id: 's1', payload: { kind: 'identity' }, width: 'full' }],
    },
  ],
  theme: {},
});

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const codes = (raw: unknown) =>
  validateSheetLayout(raw).issues.map((i) => i.code);

describe('sanitizeSheetLayout — nunca lança', () => {
  it.each([null, undefined, 42, 'layout', [], true])(
    'devolve o preset padrão para payload não-objeto (%s)',
    (payload) => {
      expect(() => sanitizeSheetLayout(payload)).not.toThrow();
      expect(sanitizeSheetLayout(payload)).toBe(DEFAULT_SHEET_LAYOUT);
    }
  );

  it('cai no preset quando faltam as seções obrigatórias', () => {
    const layout = clone(minimal());
    layout.regions[0].sections = [
      { id: 's1', payload: { kind: 'attacks' }, width: 'full' },
    ];

    expect(sanitizeSheetLayout(layout)).toBe(DEFAULT_SHEET_LAYOUT);
  });

  it('cai no preset quando o documento vem de uma versão futura', () => {
    const layout = clone(minimal());
    layout.schemaVersion = SHEET_LAYOUT_SCHEMA_VERSION + 1;

    expect(sanitizeSheetLayout(layout)).toBe(DEFAULT_SHEET_LAYOUT);
  });

  it('descarta seção de um tipo desconhecido sem derrubar o resto', () => {
    const layout = clone(minimal()) as unknown as Record<string, unknown>;
    (layout.regions as Record<string, unknown>[])[0].sections = [
      { id: 's1', payload: { kind: 'identity' }, width: 'full' },
      { id: 'sX', payload: { kind: 'teleporte' }, width: 'full' },
    ];

    const sanitized = sanitizeSheetLayout(layout);

    expect(sanitized.regions[0].sections.map((s) => s.payload.kind)).toEqual([
      'identity',
    ]);
  });

  it('descarta cor que não é #rrggbb', () => {
    const layout = clone(minimal());
    layout.regions[0].sections[0].titleColor = 'red';
    layout.theme.accentColor = '#GGGGGG';

    const sanitized = sanitizeSheetLayout(layout);

    expect(sanitized.regions[0].sections[0].titleColor).toBeUndefined();
    expect(sanitized.theme.accentColor).toBeUndefined();
  });

  it('descarta ícone fora do formato com namespace', () => {
    const layout = clone(minimal());
    layout.regions[0].iconKey = 'Shield';
    layout.regions[0].sections[0].iconKey = 'gi:magic/crystal-ball';

    const sanitized = sanitizeSheetLayout(layout);

    expect(sanitized.regions[0].iconKey).toBeUndefined();
    expect(sanitized.regions[0].sections[0].iconKey).toBe(
      'gi:magic/crystal-ball'
    );
  });

  it('descarta fundo que não é https', () => {
    const layout = clone(minimal());
    layout.theme.backgroundImageUrl = 'http://exemplo.com/fundo.png';
    expect(
      sanitizeSheetLayout(layout).theme.backgroundImageUrl
    ).toBeUndefined();

    // Montada em pedaços: escrever o esquema inteiro num literal dispara a
    // regra `no-script-url` do ESLint, e o alvo do teste é o saneamento.
    layout.theme.backgroundImageUrl = `${'java'}${'script'}:alert(1)`;
    expect(
      sanitizeSheetLayout(layout).theme.backgroundImageUrl
    ).toBeUndefined();

    layout.theme.backgroundImageUrl = 'https://exemplo.com/fundo.png';
    expect(sanitizeSheetLayout(layout).theme.backgroundImageUrl).toBe(
      'https://exemplo.com/fundo.png'
    );
  });

  it('trunca textos longos em vez de recusar o layout', () => {
    const layout = clone(minimal());
    layout.name = 'x'.repeat(500);
    layout.regions[0].label = 'y'.repeat(200);
    layout.regions[0].sections[0].title = 'z'.repeat(200);

    const sanitized = sanitizeSheetLayout(layout);

    expect(sanitized.name).toHaveLength(SHEET_LAYOUT_CAPS.maxLayoutNameLength);
    expect(sanitized.regions[0].label).toHaveLength(
      SHEET_LAYOUT_CAPS.maxRegionLabelLength
    );
    expect(sanitized.regions[0].sections[0].title).toHaveLength(
      SHEET_LAYOUT_CAPS.maxSectionTitleLength
    );
  });

  it('limita a opacidade do fundo ao intervalo 0..1', () => {
    const layout = clone(minimal());

    layout.theme.backgroundOpacity = 5;
    expect(sanitizeSheetLayout(layout).theme.backgroundOpacity).toBe(1);

    layout.theme.backgroundOpacity = -3;
    expect(sanitizeSheetLayout(layout).theme.backgroundOpacity).toBe(0);
  });

  it('remove override de mobile que aponta para região inexistente', () => {
    const layout = clone(minimal());
    layout.mobile = {
      regionOverrides: { s1: 'regiao-que-nao-existe' },
      hiddenRegionIds: ['tambem-nao-existe'],
    };

    const sanitized = sanitizeSheetLayout(layout);

    expect(sanitized.mobile?.regionOverrides).toBeUndefined();
    expect(sanitized.mobile?.hiddenRegionIds).toBeUndefined();
  });

  it('é idempotente', () => {
    const once = sanitizeSheetLayout(clone(PRESET_TABS));
    const twice = sanitizeSheetLayout(once);

    expect(twice).toEqual(once);
  });

  it('preserva o preset de abas sem alterações', () => {
    expect(sanitizeSheetLayout(clone(PRESET_TABS))).toEqual(PRESET_TABS);
  });
});

describe('validateSheetLayout — dá para salvar?', () => {
  it('aceita um layout mínimo válido', () => {
    const result = validateSheetLayout(minimal());

    expect(result.ok).toBe(true);
    expect(result.layout).toBeDefined();
    expect(result.issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('recusa payload que não é objeto', () => {
    expect(codes('nada disso')).toContain('not-an-object');
    expect(validateSheetLayout('nada disso').ok).toBe(false);
  });

  it('recusa documento de uma versão futura', () => {
    const layout = clone(minimal());
    layout.schemaVersion = SHEET_LAYOUT_SCHEMA_VERSION + 1;

    expect(codes(layout)).toContain('schema-version-ahead');
  });

  it('recusa seção duplicada', () => {
    const layout = clone(minimal());
    layout.regions.push({
      id: 'r2',
      role: 'surface',
      label: 'Outra',
      sections: [{ id: 's3', payload: { kind: 'identity' }, width: 'full' }],
    });

    const result = validateSheetLayout(layout);

    expect(result.ok).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain(
      'duplicate-section-kind'
    );
  });

  it('permite repetir apenas as anotações livres', () => {
    const layout = clone(minimal());
    layout.regions[0].sections.push(
      { id: 'n1', payload: { kind: 'note', content: 'a' }, width: 'full' },
      { id: 'n2', payload: { kind: 'note', content: 'b' }, width: 'full' }
    );

    expect(validateSheetLayout(layout).ok).toBe(true);
  });

  it('recusa aba sem nome', () => {
    const layout = clone(minimal());
    layout.regions.push({
      id: 'r2',
      role: 'surface',
      sections: [{ id: 's3', payload: { kind: 'attacks' }, width: 'full' }],
    });

    expect(codes(layout)).toContain('surface-without-label');
  });

  it('avisa (sem bloquear) sobre região vazia', () => {
    const layout = clone(minimal());
    layout.regions.push({
      id: 'r2',
      role: 'surface',
      label: 'Vazia',
      sections: [],
    });

    const result = validateSheetLayout(layout);

    expect(result.ok).toBe(true);
    expect(result.issues.find((i) => i.code === 'empty-region')?.level).toBe(
      'warning'
    );
  });

  it('exige cabeçalho no menu de ação', () => {
    const layout = clone(minimal());
    layout.template = 'actionMenu';

    expect(codes(layout)).toContain('header-required');

    layout.regions[0].role = 'header';
    expect(codes(layout)).not.toContain('header-required');
  });

  it('recusa layout sem as seções obrigatórias', () => {
    const layout = clone(minimal());
    layout.regions[0].sections = [
      { id: 's1', payload: { kind: 'attacks' }, width: 'full' },
    ];

    const result = validateSheetLayout(layout);

    expect(result.ok).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain(
      'missing-required-section'
    );
  });

  it('não devolve layout quando há erro', () => {
    const layout = clone(minimal());
    layout.regions[0].sections = [];

    expect(validateSheetLayout(layout).layout).toBeUndefined();
  });

  it.each([null, undefined, [], 0, ''])(
    'não lança com payload hostil (%s)',
    (payload) => {
      expect(() => validateSheetLayout(payload)).not.toThrow();
    }
  );
});

describe('endurecimento para a galeria (Fase 3)', () => {
  it('descarta região e seção com id repetido, mantendo a primeira', () => {
    const raw = clone(minimal());
    raw.regions.push({
      id: 'r1',
      role: 'aside',
      sections: [{ id: 's2', payload: { kind: 'skills' }, width: 'full' }],
    });
    raw.regions[0].sections.push({
      id: 's1',
      payload: { kind: 'attacks' },
      width: 'full',
    });

    const layout = sanitizeSheetLayout(raw);

    expect(layout.regions.map((r) => r.id)).toEqual(['r1']);
    expect(layout.regions[0].sections.map((s) => s.payload.kind)).toEqual([
      'identity',
    ]);
  });

  it('descarta ids longos demais', () => {
    const raw = clone(minimal());
    raw.regions[0].sections.push({
      id: 'x'.repeat(SHEET_LAYOUT_CAPS.maxIdLength + 1),
      payload: { kind: 'attacks' },
      width: 'full',
    });

    const kinds = sanitizeSheetLayout(raw).regions[0].sections.map(
      (s) => s.payload.kind
    );
    expect(kinds).toEqual(['identity']);
  });

  it.each([
    'https://exemplo.com/a b.png',
    'https://exemplo.com/a".png',
    "https://exemplo.com/a'.png",
    'https://exemplo.com/a\\.png',
    'https://exemplo.com/a\n.png',
    `https://exemplo.com/${'a'.repeat(
      SHEET_LAYOUT_CAPS.maxBackgroundUrlLength
    )}`,
  ])('recusa URL de fundo perigosa ou longa (%s)', (url) => {
    const raw = clone(minimal());
    raw.theme.backgroundImageUrl = url;

    expect(sanitizeSheetLayout(raw).theme.backgroundImageUrl).toBeUndefined();
  });

  it('guarda a URL de fundo normalizada', () => {
    const raw = clone(minimal());
    raw.theme.backgroundImageUrl = 'https://EXEMPLO.com/fundo.png';

    expect(sanitizeSheetLayout(raw).theme.backgroundImageUrl).toBe(
      'https://exemplo.com/fundo.png'
    );
  });

  it('descarta chaves de catálogo longas demais', () => {
    const raw = clone(minimal());
    raw.theme.fontFamily = 'f'.repeat(
      SHEET_LAYOUT_CAPS.maxCatalogKeyLength + 1
    );
    raw.theme.backgroundPresetId = 'b'.repeat(
      SHEET_LAYOUT_CAPS.maxCatalogKeyLength + 1
    );

    const { theme } = sanitizeSheetLayout(raw);
    expect(theme.fontFamily).toBeUndefined();
    expect(theme.backgroundPresetId).toBeUndefined();
  });

  it('recusa mais áreas do que o teto, em vez de cortar em silêncio', () => {
    const raw = clone(minimal());
    for (let i = 0; i < SHEET_LAYOUT_CAPS.maxRegions; i += 1) {
      raw.regions.push({ id: `extra-${i}`, role: 'main', sections: [] });
    }

    expect(codes(raw)).toContain('too-many-regions');
    expect(validateSheetLayout(raw).ok).toBe(false);
  });

  it('recusa mais seções numa área do que o teto', () => {
    const raw = clone(minimal());
    for (let i = 0; i < SHEET_LAYOUT_CAPS.maxSectionsPerRegion; i += 1) {
      raw.regions[0].sections.push({
        id: `nota-${i}`,
        payload: { kind: 'note', content: '' },
        width: 'full',
      });
    }

    expect(codes(raw)).toContain('too-many-sections');
  });

  it('recusa documento grande demais', () => {
    const raw = clone(minimal());
    raw.regions = Array.from({ length: 8 }, (_, r) => ({
      id: `r${r}`,
      role: 'main' as const,
      sections: Array.from({ length: 4 }, (__, s) => ({
        id: `n${r}-${s}`,
        payload: {
          kind: 'note' as const,
          content: 'x'.repeat(SHEET_LAYOUT_CAPS.maxNoteLength),
        },
        width: 'full' as const,
      })),
    }));
    raw.regions[0].sections.push({
      id: 'id',
      payload: { kind: 'identity' },
      width: 'full',
    });

    expect(codes(raw)).toContain('too-large');
  });
});
