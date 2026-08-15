/**
 * Resolve um `SheetLayout` para a superfície concreta que vai ser renderizada.
 *
 * Função pura, e é aqui que mora toda a diferença entre "largo" e "estreito" —
 * o template não decide nada disso. Duas escolhas importantes:
 *
 * 1. A superfície é decidida pela LARGURA DO CONTAINER, não do viewport. O
 *    `Result` roda dentro do widget do Escudo do Mestre, de diálogos da mesa e
 *    do painel lateral estreito do Owlbear: nesses lugares o viewport é grande
 *    e o container é minúsculo, e `useMediaQuery` responde a pergunta errada.
 *    (`SpellsDisplay` já media o container pelo mesmo motivo.)
 *
 * 2. Seções indisponíveis são filtradas na RESOLUÇÃO, nunca no documento. Uma
 *    ficha sem conjurador não mostra Magias, mas o layout salvo continua com a
 *    seção — senão trocar de classe destruiria o design do usuário.
 */
import {
  LayoutRegion,
  LayoutSection,
  ResolvedLayout,
  SheetLayout,
  SheetSectionKind,
} from '../interfaces/SheetLayout';

/** Espelha o `MOBILE_MEDIA_QUERY` histórico do `Result` (`max-width: 768px`). */
export const SHEET_NARROW_BREAKPOINT = 768;

export interface ResolveLayoutOptions {
  /** Largura medida do container. `0` significa "não medido ainda". */
  width: number;
  /** Usado quando `width === 0` (jsdom, primeiro render antes do layout). */
  fallbackNarrow: boolean;
  /** Seções que existem nesta ficha. */
  available: Set<SheetSectionKind>;
}

const cloneRegion = (region: LayoutRegion): LayoutRegion => ({
  ...region,
  sections: [...region.sections],
});

/**
 * Move as seções listadas em `regionOverrides` para as regiões de destino.
 * Rodar ANTES de descartar as regiões ocultas: no preset de abas, Perícias sai
 * da coluna direita (que só então fica vazia e é descartada) e entra na aba.
 */
const applyRegionOverrides = (
  regions: LayoutRegion[],
  overrides: Record<string, string>
): LayoutRegion[] => {
  const moved = new Map<string, LayoutSection>();

  const withoutMoved = regions.map((region) => {
    const kept: LayoutSection[] = [];
    region.sections.forEach((section) => {
      const target = overrides[section.id];
      if (target && target !== region.id) {
        moved.set(section.id, section);
      } else {
        kept.push(section);
      }
    });
    return { ...region, sections: kept };
  });

  if (moved.size === 0) return withoutMoved;

  return withoutMoved.map((region) => {
    const incoming = Object.entries(overrides)
      .filter(
        ([sectionId, target]) => target === region.id && moved.has(sectionId)
      )
      .map(([sectionId]) => moved.get(sectionId) as LayoutSection);

    if (incoming.length === 0) return region;
    // Entram na frente: o caso real é Perícias virando a PRIMEIRA aba.
    return { ...region, sections: [...incoming, ...region.sections] };
  });
};

export function resolveLayout(
  layout: SheetLayout,
  opts: ResolveLayoutOptions
): ResolvedLayout {
  const { width, fallbackNarrow, available } = opts;
  const isNarrow =
    width > 0 ? width <= SHEET_NARROW_BREAKPOINT : fallbackNarrow;

  const mobile = layout.mobile ?? {};
  const template = isNarrow
    ? mobile.template ?? layout.template
    : layout.template;

  let regions = layout.regions.map(cloneRegion);

  if (isNarrow) {
    if (mobile.regionOverrides) {
      regions = applyRegionOverrides(regions, mobile.regionOverrides);
    }

    if (mobile.hiddenRegionIds?.length) {
      const hidden = new Set(mobile.hiddenRegionIds);
      regions = regions.filter((region) => !hidden.has(region.id));
    }

    // Coluna lateral não existe no estreito: o que sobrou nela vira conteúdo
    // normal do corpo, em vez de sumir.
    regions = regions.map((region) =>
      region.role === 'aside' ? { ...region, role: 'main' as const } : region
    );

    if (mobile.forceFullWidth !== false) {
      regions = regions.map((region) => ({
        ...region,
        sections: region.sections.map((section) => ({
          ...section,
          width: 'full' as const,
        })),
      }));
    }
  }

  // Filtra o que esta ficha não tem, e então descarta regiões que ficaram sem
  // nada — uma aba vazia não deve virar uma aba clicável e em branco.
  regions = regions
    .map((region) => ({
      ...region,
      sections: region.sections.filter((section) =>
        available.has(section.payload.kind)
      ),
    }))
    .filter((region) => region.sections.length > 0);

  return { template, regions, theme: layout.theme ?? {}, isNarrow };
}

/** Regiões de um papel, na ordem do documento. */
export const regionsByRole = (
  resolved: ResolvedLayout,
  role: LayoutRegion['role']
): LayoutRegion[] => resolved.regions.filter((r) => r.role === role);

/**
 * Índice da primeira região `surface`. É onde o card de abas (ou a lista-mestra)
 * é inserido no fluxo — o que estiver antes dele na coluna principal renderiza
 * acima, o que estiver depois renderiza abaixo.
 */
export const firstSurfaceIndex = (resolved: ResolvedLayout): number =>
  resolved.regions.findIndex((r) => r.role === 'surface');
