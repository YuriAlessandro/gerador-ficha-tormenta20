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
  DeviceVisibility,
  LayoutRegion,
  ResolvedLayout,
  SheetLayout,
  SheetSectionKind,
  showsOn,
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

/** Rótulo de uma tela nascida de uma área de corpo/coluna sem nome. */
const fallbackScreenLabel = (region: LayoutRegion): string =>
  region.role === 'aside' ? 'Lateral' : 'Geral';

/**
 * O menu de ação só desenha topo, telas e rodapé. Áreas de corpo e coluna
 * lateral viram TELAS aqui — senão o conteúdo delas simplesmente não aparecia
 * (o editor já converte ao trocar de modelo; isto cobre documentos antigos e
 * um `mobile.template` de menu sobre um layout de abas). Sem topo, a área da
 * identidade é promovida, como faz o `applyTemplate`.
 */
const adaptForActionMenu = (regions: LayoutRegion[]): LayoutRegion[] => {
  const hasHeader = regions.some((r) => r.role === 'header');
  const identityRegionId = hasHeader
    ? undefined
    : regions.find((r) => r.sections.some((s) => s.payload.kind === 'identity'))
        ?.id;

  return regions.map((region) => {
    if (region.id === identityRegionId) return { ...region, role: 'header' };
    if (region.role !== 'main' && region.role !== 'aside') return region;
    return {
      ...region,
      role: 'surface',
      label: region.label ?? fallbackScreenLabel(region),
    };
  });
};

export function resolveLayout(
  layout: SheetLayout,
  opts: ResolveLayoutOptions
): ResolvedLayout {
  const { width, fallbackNarrow, available } = opts;
  const isNarrow =
    width > 0 ? width <= SHEET_NARROW_BREAKPOINT : fallbackNarrow;
  const device: DeviceVisibility = isNarrow ? 'mobile' : 'desktop';

  const mobile = layout.mobile ?? {};
  const template = isNarrow
    ? mobile.template ?? layout.template
    : layout.template;

  // O que é de outro dispositivo sai antes de tudo — inclusive as cópias
  // "só celular" de seções que no computador moram noutro lugar.
  let regions = layout.regions
    .filter((region) => showsOn(region.showOn, device))
    .map((region) => ({
      ...cloneRegion(region),
      sections: region.sections.filter((s) => showsOn(s.showOn, device)),
    }));

  if (isNarrow) {
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

  if (template === 'actionMenu') regions = adaptForActionMenu(regions);

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
