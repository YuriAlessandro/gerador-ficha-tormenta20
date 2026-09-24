/**
 * Layouts customizáveis de ficha.
 *
 * A ficha deixou de ter um arranjo fixo em código: o que era `Result.tsx`
 * decidindo onde cada bloco aparece virou este documento, que o usuário edita e
 * compartilha. O layout descreve REGIÕES (papéis estruturais) e as SEÇÕES
 * dentro de cada uma; o template decide como cada papel vira pixel.
 *
 * Os tipos vivem no repo público de propósito: quem renderiza é o `Result`, que
 * é público, e o build sem o submódulo premium precisa continuar de pé. Só o
 * editor, a galeria e o serviço HTTP são premium.
 *
 * ATENÇÃO: este arquivo é a fonte da verdade de um formato PERSISTIDO e
 * COMPARTILHADO entre usuários. Mudança que quebre leitura de documento antigo
 * exige subir `SHEET_LAYOUT_SCHEMA_VERSION` e tratar a migração no sanitize.
 */

export const SHEET_LAYOUT_SCHEMA_VERSION = 1;

export type SheetTemplateKind = 'single' | 'tabs' | 'actionMenu';

export const SHEET_TEMPLATE_KINDS: readonly SheetTemplateKind[] = [
  'single',
  'tabs',
  'actionMenu',
] as const;

/**
 * Papel estrutural da região. O template escolhe como renderiza cada papel —
 * é isso que permite trocar de modelo sem remontar o documento.
 *
 * - `header`  fixo no topo; obrigatório no `actionMenu`
 * - `main`    coluna esquerda (tabs) ou corpo do scroll (single)
 * - `aside`   coluna direita; só existe quando o container é largo
 * - `surface` uma aba (tabs) ou uma tela (actionMenu)
 * - `footer`  rodapé full-width
 */
export type LayoutRegionRole =
  | 'header'
  | 'main'
  | 'aside'
  | 'surface'
  | 'footer';

export const LAYOUT_REGION_ROLES: readonly LayoutRegionRole[] = [
  'header',
  'main',
  'aside',
  'surface',
  'footer',
] as const;

/**
 * Note que não existe um `vitals` separado: PV e PM são um irmão de flex dentro
 * do card de identidade, e não um bloco à parte. Separá-los jogaria os vitais
 * para um card próprio, quebrando o cabeçalho compacto que a ficha sempre teve.
 * Se um dia virarem seção movível, é mudança de `schemaVersion`.
 */
export const SHEET_SECTION_KINDS = [
  'identity',
  'attributes',
  'skills',
  'attacks',
  'defense',
  'powers',
  'spells',
  'equipment',
  'proficiencies',
  'sizeDisplacement',
  'partners',
  'animalCompanions',
  'journal',
  'creationSteps',
  'supportCta',
  'bugReport',
  'note',
] as const;

export type SheetSectionKind = (typeof SHEET_SECTION_KINDS)[number];

/**
 * União discriminada por `kind`, no molde de `GMScreenWidget`. Só `note` carrega
 * conteúdo próprio; as demais seções leem da ficha.
 */
export type SheetSectionPayload =
  | { kind: Exclude<SheetSectionKind, 'note'> }
  | { kind: 'note'; content: string };

export type SheetSectionWidth = 'full' | 'half';

/**
 * Id de ícone com namespace.
 *
 * - `mui:<Nome>` — ícone do `@mui/icons-material` já embarcado no app.
 * - `gi:<sprite>/<nome>` — catálogo do game-icons.net.
 *
 * O nome do sprite faz parte do id DE PROPÓSITO: renderizar vira uma resolução
 * de string para URL, sem tabela de lookup e sem carregar o manifest inteiro
 * (que só o seletor do editor precisa).
 */
export type SheetIconKey = string;

export const SHEET_ICON_KEY_RE =
  /^(mui:[A-Za-z][A-Za-z0-9]*|gi:[a-z0-9-]+\/[a-z0-9-]+)$/;

export const isSheetIconKey = (value: unknown): value is SheetIconKey =>
  typeof value === 'string' && SHEET_ICON_KEY_RE.test(value);

export interface LayoutSection {
  /** uuid — é o `draggableId` do react-beautiful-dnd, tem que ser único global. */
  id: string;
  payload: SheetSectionPayload;
  width: SheetSectionWidth;
  /** Sobrescreve o rótulo padrão do registry. */
  title?: string;
  iconKey?: SheetIconKey;
  /** `#rrggbb`; qualquer outra coisa é descartada no sanitize. */
  titleColor?: string;
}

export interface LayoutRegion {
  id: string;
  role: LayoutRegionRole;
  /** Nome da aba/tela. Obrigatório quando `role === 'surface'`. */
  label?: string;
  iconKey?: SheetIconKey;
  /** A ordem do array é a ordem de render. */
  sections: LayoutSection[];
}

export interface SheetLayoutTheme {
  accentColor?: string;
  titleColor?: string;
  cardBackgroundColor?: string;
  /** Preset do catálogo curado. Tem precedência sobre `backgroundImageUrl`. */
  backgroundPresetId?: string;
  /** URL https colada pelo usuário. */
  backgroundImageUrl?: string;
  /** Véu sobre a imagem de fundo, 0..1. */
  backgroundOpacity?: number;
  fontFamily?: string;
  cardStyle?: 'default' | 'flat' | 'outlined';
}

/**
 * Overrides aplicados quando o CONTAINER é estreito — não o viewport.
 *
 * Um layout com override, e não dois documentos: o código já fazia exatamente
 * isso, e em um lugar só (Perícias saía das abas no desktop). Dois documentos
 * independentes dobrariam o payload de compartilhamento e criariam a pergunta
 * insolúvel "adicionei uma seção no desktop, aparece no mobile?".
 */
export interface MobileLayoutOverride {
  template?: SheetTemplateKind;
  /** `sectionId` → `regionId` de destino no estreito. */
  regionOverrides?: Record<string, string>;
  hiddenRegionIds?: string[];
  /** Força `width: 'full'` no estreito. Default: `true`. */
  forceFullWidth?: boolean;
}

export interface SheetLayout {
  schemaVersion: number;
  /** `preset:<kind>` nos embutidos; uuid/ObjectId nos salvos pelo usuário. */
  id: string;
  name: string;
  template: SheetTemplateKind;
  regions: LayoutRegion[];
  theme: SheetLayoutTheme;
  mobile?: MobileLayoutOverride;
  /** Presets do bundle: o editor forka em vez de editar no lugar. */
  readonly?: boolean;
}

/** Layout já resolvido para uma superfície concreta — o que o template recebe. */
export interface ResolvedLayout {
  template: SheetTemplateKind;
  /** Overrides aplicados, regiões vazias e seções indisponíveis já removidas. */
  regions: LayoutRegion[];
  theme: SheetLayoutTheme;
  isNarrow: boolean;
}

export const PRESET_LAYOUT_ID_PREFIX = 'preset:';

export const isPresetLayoutId = (id: string): boolean =>
  id.startsWith(PRESET_LAYOUT_ID_PREFIX);

/** Limites do documento. Espelhados no validador do backend. */
export const SHEET_LAYOUT_CAPS = {
  maxRegions: 16,
  maxSectionsPerRegion: 12,
  maxRegionLabelLength: 24,
  maxSectionTitleLength: 40,
  maxNoteLength: 4000,
  maxLayoutNameLength: 60,
} as const;
