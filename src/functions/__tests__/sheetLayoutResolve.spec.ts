import { describe, it, expect } from 'vitest';
import {
  PRESET_ACTION_MENU,
  PRESET_REGION_IDS,
  PRESET_SINGLE,
  PRESET_TABS,
} from '../../interfaces/sheetLayoutPresets';
import {
  SHEET_SECTION_KINDS,
  SheetSectionKind,
} from '../../interfaces/SheetLayout';
import { resolveLayout, SHEET_NARROW_BREAKPOINT } from '../sheetLayoutResolve';

const ALL_KINDS = new Set<SheetSectionKind>(SHEET_SECTION_KINDS);

const wide = (available: Set<SheetSectionKind> = ALL_KINDS) => ({
  width: 1200,
  fallbackNarrow: false,
  available,
});

const narrow = (available: Set<SheetSectionKind> = ALL_KINDS) => ({
  width: 390,
  fallbackNarrow: true,
  available,
});

const surfaceLabels = (regions: { role: string; label?: string }[]) =>
  regions.filter((r) => r.role === 'surface').map((r) => r.label);

describe('resolveLayout — largura decide a superfície', () => {
  it('usa a largura do container quando ela foi medida', () => {
    expect(
      resolveLayout(PRESET_TABS, { ...wide(), fallbackNarrow: true }).isNarrow
    ).toBe(false);

    expect(
      resolveLayout(PRESET_TABS, { ...narrow(), fallbackNarrow: false })
        .isNarrow
    ).toBe(true);
  });

  it('cai no fallback só enquanto a largura não foi medida', () => {
    const opts = { width: 0, available: ALL_KINDS };

    expect(
      resolveLayout(PRESET_TABS, { ...opts, fallbackNarrow: true }).isNarrow
    ).toBe(true);
    expect(
      resolveLayout(PRESET_TABS, { ...opts, fallbackNarrow: false }).isNarrow
    ).toBe(false);
  });

  it('trata o próprio breakpoint como estreito', () => {
    const resolved = resolveLayout(PRESET_TABS, {
      width: SHEET_NARROW_BREAKPOINT,
      fallbackNarrow: false,
      available: ALL_KINDS,
    });

    expect(resolved.isNarrow).toBe(true);
  });
});

describe('resolveLayout — preset de abas reproduz o comportamento histórico', () => {
  it('no largo, Perícias fica na coluna direita e não vira aba', () => {
    const resolved = resolveLayout(PRESET_TABS, wide());

    const aside = resolved.regions.find((r) => r.role === 'aside');
    expect(aside?.sections.map((s) => s.payload.kind)).toEqual([
      'skills',
      'journal',
    ]);

    expect(surfaceLabels(resolved.regions)).toEqual([
      'Ataques',
      'Defesa',
      'Poderes',
      'Magias',
      'Equip.',
    ]);
  });

  it('no estreito, Perícias vira a PRIMEIRA aba e a coluna direita some', () => {
    const resolved = resolveLayout(PRESET_TABS, narrow());

    expect(resolved.regions.some((r) => r.role === 'aside')).toBe(false);

    expect(surfaceLabels(resolved.regions)).toEqual([
      'Perícias',
      'Ataques',
      'Defesa',
      'Poderes',
      'Magias',
      'Equip.',
      'Diário',
    ]);

    const skillsTab = resolved.regions.find(
      (r) => r.id === PRESET_REGION_IDS.skills
    );
    expect(skillsTab?.sections.map((s) => s.payload.kind)).toEqual(['skills']);
  });

  it('sem o Diário do Jogador, não há aba nem cartão de diário', () => {
    const semDiario = new Set(ALL_KINDS);
    semDiario.delete('journal');

    const estreito = resolveLayout(PRESET_TABS, narrow(semDiario));
    expect(surfaceLabels(estreito.regions)).not.toContain('Diário');

    const largo = resolveLayout(PRESET_TABS, wide(semDiario));
    const aside = largo.regions.find((r) => r.role === 'aside');
    expect(aside?.sections.map((s) => s.payload.kind)).toEqual(['skills']);
  });

  it('não duplica Perícias ao mover para a aba', () => {
    const resolved = resolveLayout(PRESET_TABS, narrow());

    const skillsCount = resolved.regions
      .flatMap((r) => r.sections)
      .filter((s) => s.payload.kind === 'skills').length;

    expect(skillsCount).toBe(1);
  });

  it('força largura inteira no estreito', () => {
    const layout = {
      ...PRESET_TABS,
      regions: PRESET_TABS.regions.map((r) => ({
        ...r,
        sections: r.sections.map((s) => ({ ...s, width: 'half' as const })),
      })),
    };

    const resolved = resolveLayout(layout, narrow());

    expect(
      resolved.regions
        .flatMap((r) => r.sections)
        .every((s) => s.width === 'full')
    ).toBe(true);
  });

  it('preserva a largura escolhida no largo', () => {
    const layout = {
      ...PRESET_TABS,
      regions: PRESET_TABS.regions.map((r) => ({
        ...r,
        sections: r.sections.map((s) => ({ ...s, width: 'half' as const })),
      })),
    };

    const resolved = resolveLayout(layout, wide());

    expect(
      resolved.regions
        .flatMap((r) => r.sections)
        .every((s) => s.width === 'half')
    ).toBe(true);
  });
});

describe('resolveLayout — disponibilidade de seção', () => {
  it('remove seções que a ficha não tem', () => {
    const semMagia = new Set(
      SHEET_SECTION_KINDS.filter((k) => k !== 'spells')
    ) as Set<SheetSectionKind>;

    const resolved = resolveLayout(PRESET_TABS, wide(semMagia));

    expect(surfaceLabels(resolved.regions)).not.toContain('Magias');
    expect(
      resolved.regions.flatMap((r) => r.sections).map((s) => s.payload.kind)
    ).not.toContain('spells');
  });

  it('descarta a região que ficou vazia em vez de deixar uma aba em branco', () => {
    const semMagia = new Set(
      SHEET_SECTION_KINDS.filter((k) => k !== 'spells')
    ) as Set<SheetSectionKind>;

    const resolved = resolveLayout(PRESET_TABS, wide(semMagia));

    expect(
      resolved.regions.some((r) => r.id === PRESET_REGION_IDS.spells)
    ).toBe(false);
  });

  it('não altera o documento original', () => {
    const before = JSON.stringify(PRESET_TABS);
    resolveLayout(PRESET_TABS, narrow(new Set(['identity'])));
    expect(JSON.stringify(PRESET_TABS)).toBe(before);
  });
});

describe('resolveLayout — outros modelos', () => {
  it('página única não tem abas, só regiões de conteúdo', () => {
    const resolved = resolveLayout(PRESET_SINGLE, wide());

    expect(resolved.template).toBe('single');
    expect(resolved.regions.some((r) => r.role === 'surface')).toBe(false);
  });

  it('menu de ação mantém o cabeçalho fixo e agrupa seções por tela', () => {
    const resolved = resolveLayout(PRESET_ACTION_MENU, narrow());

    expect(resolved.template).toBe('actionMenu');

    const header = resolved.regions.find((r) => r.role === 'header');
    expect(header?.sections.map((s) => s.payload.kind)).toEqual(['identity']);

    const combate = resolved.regions.find((r) => r.label === 'Combate');
    expect(combate?.sections.map((s) => s.payload.kind)).toEqual([
      'attacks',
      'defense',
    ]);
  });

  it('no estreito a coluna lateral vira conteúdo do corpo, não some', () => {
    const resolved = resolveLayout(
      { ...PRESET_SINGLE, mobile: { forceFullWidth: true } },
      narrow()
    );

    expect(resolved.regions.some((r) => r.role === 'aside')).toBe(false);
    expect(
      resolved.regions.flatMap((r) => r.sections).map((s) => s.payload.kind)
    ).toContain('skills');
  });
});
