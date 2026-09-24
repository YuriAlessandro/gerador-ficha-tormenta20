/**
 * Validação e saneamento de `SheetLayout`.
 *
 * Este módulo trata todo layout como PAYLOAD HOSTIL. Um layout chega de três
 * lugares em que o app não manda: `sheetData` salvo há meses, JSON de ficha
 * importado de terceiros e a galeria da comunidade. Nenhum deles pode derrubar
 * a ficha.
 *
 * Daí a divisão em duas funções:
 * - `sanitizeSheetLayout` NUNCA lança e sempre devolve um layout renderizável;
 *   o que não dá para consertar é descartado em silêncio (cor inválida, ícone
 *   desconhecido, seção de uma versão futura).
 * - `validateSheetLayout` responde "isto é aceitável para SALVAR?", e é essa
 *   que o editor e o backend usam. Erros bloqueiam; avisos só informam.
 *
 * O backend tem um espelho deste arquivo. Divergir os dois é como se ganha um
 * 400 no PUT com o editor achando que está tudo certo.
 */
import {
  LayoutRegion,
  LayoutRegionRole,
  LAYOUT_REGION_ROLES,
  LayoutSection,
  SheetLayout,
  SheetSectionKind,
  SheetSectionWidth,
  SheetTemplateKind,
  SHEET_ICON_KEY_RE,
  SHEET_LAYOUT_CAPS,
  SHEET_LAYOUT_SCHEMA_VERSION,
  SHEET_SECTION_KINDS,
  SHEET_TEMPLATE_KINDS,
  FOOTER_LOCKED_KINDS,
  isFooterLockedKind,
  isPresetLayoutId,
} from '../interfaces/SheetLayout';
import { DEFAULT_SHEET_LAYOUT } from '../interfaces/sheetLayoutPresets';

export type LayoutIssueLevel = 'error' | 'warning';

export interface LayoutIssue {
  level: LayoutIssueLevel;
  code: string;
  message: string;
  sectionId?: string;
  regionId?: string;
}

export interface ValidateLayoutResult {
  ok: boolean;
  layout?: SheetLayout;
  issues: LayoutIssue[];
}

/**
 * Seções sem as quais a ficha deixa de ser utilizável. `identity` carrega nome,
 * raça/classe, nível E os pontos de vida e mana — é o mínimo para a ficha ainda
 * servir numa mesa.
 */
export const REQUIRED_SECTION_KINDS: SheetSectionKind[] = ['identity'];

const KIND_SET = new Set<string>(SHEET_SECTION_KINDS);
const ROLE_SET = new Set<string>(LAYOUT_REGION_ROLES);
const TEMPLATE_SET = new Set<string>(SHEET_TEMPLATE_KINDS);

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const asString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined;

const asColor = (v: unknown): string | undefined => {
  const s = asString(v);
  return s && HEX_COLOR_RE.test(s) ? s : undefined;
};

const asIconKey = (v: unknown): string | undefined => {
  const s = asString(v);
  return s && SHEET_ICON_KEY_RE.test(s) ? s : undefined;
};

const asWidth = (v: unknown): SheetSectionWidth =>
  v === 'half' ? 'half' : 'full';

const asId = (v: unknown): string | undefined => {
  const s = asString(v);
  return s && s.length <= SHEET_LAYOUT_CAPS.maxIdLength ? s : undefined;
};

const asCatalogKey = (v: unknown): string | undefined => {
  const s = asString(v);
  return s && s.length <= SHEET_LAYOUT_CAPS.maxCatalogKeyLength ? s : undefined;
};

// Caracteres de controle e espaço não têm lugar numa URL colada; a URL vai
// parar dentro de um `url()` de CSS, então nada que possa fechar a string.
// eslint-disable-next-line no-control-regex
const UNSAFE_URL_CHARS_RE = /[\u0000-\u0020\u007f"'\\]/;

const asHttpsUrl = (v: unknown): string | undefined => {
  const s = asString(v);
  if (!s || s.length > SHEET_LAYOUT_CAPS.maxBackgroundUrlLength)
    return undefined;
  if (UNSAFE_URL_CHARS_RE.test(s)) return undefined;
  try {
    // Mesmo critério do `profileController` (só o protocolo, sem allowlist de
    // host): o app inteiro já aceita URL colada pelo usuário assim. Guarda a
    // forma normalizada (`href`), não o texto colado.
    const url = new URL(s);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};

/* ------------------------------------------------------------------ *
 * Sanitize — nunca lança
 * ------------------------------------------------------------------ */

const sanitizeSection = (raw: unknown): LayoutSection | null => {
  if (!isRecord(raw)) return null;

  const payload = isRecord(raw.payload) ? raw.payload : undefined;
  const kind = asString(payload?.kind);
  if (!kind || !KIND_SET.has(kind)) return null;

  const id = asId(raw.id);
  if (!id) return null;

  const section: LayoutSection = {
    id,
    payload:
      kind === 'note'
        ? {
            kind: 'note',
            content: (asString(payload?.content) ?? '').slice(
              0,
              SHEET_LAYOUT_CAPS.maxNoteLength
            ),
          }
        : { kind: kind as Exclude<SheetSectionKind, 'note'> },
    width: asWidth(raw.width),
  };

  const title = asString(raw.title);
  if (title)
    section.title = title.slice(0, SHEET_LAYOUT_CAPS.maxSectionTitleLength);

  const iconKey = asIconKey(raw.iconKey);
  if (iconKey) section.iconKey = iconKey;

  const titleColor = asColor(raw.titleColor);
  if (titleColor) section.titleColor = titleColor;

  return section;
};

const sanitizeRegion = (raw: unknown): LayoutRegion | null => {
  if (!isRecord(raw)) return null;

  const id = asId(raw.id);
  const role = asString(raw.role);
  if (!id || !role || !ROLE_SET.has(role)) return null;

  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .map(sanitizeSection)
        .filter((s): s is LayoutSection => s !== null)
        .slice(0, SHEET_LAYOUT_CAPS.maxSectionsPerRegion)
    : [];

  const region: LayoutRegion = {
    id,
    role: role as LayoutRegionRole,
    sections,
  };

  const label = asString(raw.label);
  if (label)
    region.label = label.slice(0, SHEET_LAYOUT_CAPS.maxRegionLabelLength);

  const iconKey = asIconKey(raw.iconKey);
  if (iconKey) region.iconKey = iconKey;

  return region;
};

/** Id de uma região nova que não colide com as existentes. */
const freshId = (base: string, taken: Set<string>): string => {
  let id = base;
  let n = 2;
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
};

/**
 * Garante as seções travadas (`FOOTER_LOCKED_KINDS`) no PRIMEIRO rodapé.
 *
 * Conserta em vez de recusar: um layout salvo antes da trava, ou montado à mão,
 * continua abrindo — só volta a ter o aviso e o convite no lugar deles. A ordem
 * entre as travadas que já estavam no rodapé é preservada (é a única liberdade
 * que o usuário tem com elas); as que vieram de fora ou faltavam entram no fim.
 */
const enforceFooterLock = (regions: LayoutRegion[]): LayoutRegion[] => {
  const moved = new Map<SheetSectionKind, LayoutSection>();
  let footerIdx = regions.findIndex((r) => r.role === 'footer');

  const cleaned = regions.map((region, i) => {
    if (i === footerIdx) return region;
    const kept = region.sections.filter((s) => {
      if (!isFooterLockedKind(s.payload.kind)) return true;
      if (!moved.has(s.payload.kind)) moved.set(s.payload.kind, s);
      return false;
    });
    return kept.length === region.sections.length
      ? region
      : { ...region, sections: kept };
  });

  if (footerIdx === -1) {
    const taken = new Set(regions.map((r) => r.id));
    cleaned.push({
      id: freshId('r-footer', taken),
      role: 'footer',
      sections: [],
    });
    footerIdx = cleaned.length - 1;
  }

  const footer = cleaned[footerIdx];
  const present = new Set(footer.sections.map((s) => s.payload.kind));
  const sectionIds = new Set(
    cleaned.flatMap((r) => r.sections.map((s) => s.id))
  );
  const additions: LayoutSection[] = [];
  FOOTER_LOCKED_KINDS.forEach((kind) => {
    if (present.has(kind)) return;
    const fromElsewhere = moved.get(kind);
    if (fromElsewhere) {
      additions.push(fromElsewhere);
      return;
    }
    const id = freshId(`s-${kind}`, sectionIds);
    sectionIds.add(id);
    additions.push({ id, payload: { kind }, width: 'full' });
  });

  if (additions.length === 0) return cleaned;
  cleaned[footerIdx] = {
    ...footer,
    sections: [...footer.sections, ...additions],
  };
  return cleaned;
};

/** Por que um payload é irrecuperável. Vira código de erro na validação. */
export type LayoutRejection =
  | 'not-an-object'
  | 'schema-version-ahead'
  | 'missing-required-section';

export interface StrictSanitizeResult {
  layout: SheetLayout | null;
  rejection?: LayoutRejection;
}

/**
 * O saneamento de verdade: devolve `null` (com o motivo) quando o payload é
 * irrecuperável, em vez de mascarar o problema com o preset padrão.
 *
 * Existe separado porque as duas chamadas querem coisas opostas. Renderizar
 * quer um fallback silencioso; salvar precisa saber que o documento foi
 * recusado — sem essa separação, validar um layout quebrado aprovava o preset
 * padrão no lugar dele.
 */
export function sanitizeSheetLayoutStrict(raw: unknown): StrictSanitizeResult {
  if (!isRecord(raw)) return { layout: null, rejection: 'not-an-object' };

  const version =
    typeof raw.schemaVersion === 'number' ? raw.schemaVersion : undefined;
  // Documento de uma versão futura: não dá para adivinhar o que mudou.
  if (version === undefined || version > SHEET_LAYOUT_SCHEMA_VERSION) {
    return { layout: null, rejection: 'schema-version-ahead' };
  }

  const template = asString(raw.template);
  // Ids repetidos quebram o drag-and-drop (droppableIds) e os overrides de
  // mobile, que endereçam seção e região por id: fica a primeira ocorrência.
  const seenRegionIds = new Set<string>();
  const seenSectionIds = new Set<string>();
  const regions = Array.isArray(raw.regions)
    ? raw.regions
        .map(sanitizeRegion)
        .filter((r): r is LayoutRegion => {
          if (r === null || seenRegionIds.has(r.id)) return false;
          seenRegionIds.add(r.id);
          return true;
        })
        .slice(0, SHEET_LAYOUT_CAPS.maxRegions)
        .map((r) => ({
          ...r,
          sections: r.sections.filter((s) => {
            if (seenSectionIds.has(s.id)) return false;
            seenSectionIds.add(s.id);
            return true;
          }),
        }))
    : [];

  const present = new Set(
    regions.flatMap((r) => r.sections.map((s) => s.payload.kind))
  );
  if (REQUIRED_SECTION_KINDS.some((kind) => !present.has(kind))) {
    return { layout: null, rejection: 'missing-required-section' };
  }

  // Aviso de problema e convite de apoio: sempre no rodapé.
  const lockedRegions = enforceFooterLock(regions);
  const footerId = lockedRegions.find((r) => r.role === 'footer')?.id;
  const lockedSectionIds = new Set(
    lockedRegions.flatMap((r) =>
      r.sections
        .filter((s) => isFooterLockedKind(s.payload.kind))
        .map((s) => s.id)
    )
  );

  const rawTheme = isRecord(raw.theme) ? raw.theme : {};
  const theme: SheetLayout['theme'] = {};
  const accentColor = asColor(rawTheme.accentColor);
  if (accentColor) theme.accentColor = accentColor;
  const titleColor = asColor(rawTheme.titleColor);
  if (titleColor) theme.titleColor = titleColor;
  const cardBackgroundColor = asColor(rawTheme.cardBackgroundColor);
  if (cardBackgroundColor) theme.cardBackgroundColor = cardBackgroundColor;
  const backgroundPresetId = asCatalogKey(rawTheme.backgroundPresetId);
  if (backgroundPresetId) theme.backgroundPresetId = backgroundPresetId;
  const backgroundImageUrl = asHttpsUrl(rawTheme.backgroundImageUrl);
  if (backgroundImageUrl) theme.backgroundImageUrl = backgroundImageUrl;
  if (typeof rawTheme.backgroundOpacity === 'number') {
    theme.backgroundOpacity = Math.min(
      1,
      Math.max(0, rawTheme.backgroundOpacity)
    );
  }
  const fontFamily = asCatalogKey(rawTheme.fontFamily);
  if (fontFamily) theme.fontFamily = fontFamily;
  if (
    rawTheme.cardStyle === 'flat' ||
    rawTheme.cardStyle === 'outlined' ||
    rawTheme.cardStyle === 'default'
  ) {
    theme.cardStyle = rawTheme.cardStyle;
  }

  const layout: SheetLayout = {
    schemaVersion: SHEET_LAYOUT_SCHEMA_VERSION,
    id: asId(raw.id) ?? DEFAULT_SHEET_LAYOUT.id,
    name: (asString(raw.name) ?? 'Meu layout').slice(
      0,
      SHEET_LAYOUT_CAPS.maxLayoutNameLength
    ),
    template:
      template && TEMPLATE_SET.has(template)
        ? (template as SheetTemplateKind)
        : 'tabs',
    regions: lockedRegions,
    theme,
  };

  const rawMobile = isRecord(raw.mobile) ? raw.mobile : undefined;
  if (rawMobile) {
    const regionIds = new Set(lockedRegions.map((r) => r.id));
    const sectionIds = new Set(
      lockedRegions.flatMap((r) => r.sections.map((s) => s.id))
    );

    const mobile: NonNullable<SheetLayout['mobile']> = {};

    const mobileTemplate = asString(rawMobile.template);
    if (mobileTemplate && TEMPLATE_SET.has(mobileTemplate)) {
      mobile.template = mobileTemplate as SheetTemplateKind;
    }

    if (isRecord(rawMobile.regionOverrides)) {
      const overrides: Record<string, string> = {};
      Object.entries(rawMobile.regionOverrides).forEach(
        ([sectionId, target]) => {
          const t = asString(target);
          // Override apontando para região/seção que não existe mais é lixo de
          // uma edição anterior — some sem alarde.
          // Seção travada não tem destino alternativo no celular: fica no
          // rodapé como no desktop.
          if (
            t &&
            sectionIds.has(sectionId) &&
            regionIds.has(t) &&
            !lockedSectionIds.has(sectionId)
          ) {
            overrides[sectionId] = t;
          }
        }
      );
      if (Object.keys(overrides).length > 0) mobile.regionOverrides = overrides;
    }

    if (Array.isArray(rawMobile.hiddenRegionIds)) {
      const hidden = rawMobile.hiddenRegionIds
        .map(asString)
        // O rodapé com as seções travadas não pode sumir no celular.
        .filter(
          (id): id is string => !!id && regionIds.has(id) && id !== footerId
        );
      if (hidden.length > 0) mobile.hiddenRegionIds = hidden;
    }

    if (rawMobile.forceFullWidth === false) mobile.forceFullWidth = false;

    if (Object.keys(mobile).length > 0) layout.mobile = mobile;
  }

  // `readonly` só é honrado nos presets embarcados. Num documento do usuário a
  // flag não concede nada (o editor apenas forka em vez de editar no lugar),
  // mas preservá-la aqui é o que mantém o sanitize idempotente sobre eles.
  if (raw.readonly === true && isPresetLayoutId(layout.id)) {
    layout.readonly = true;
  }

  return { layout };
}

/**
 * Devolve SEMPRE um layout renderizável: o que não dá para consertar vira o
 * preset padrão, que é o comportamento histórico da ficha.
 */
export function sanitizeSheetLayout(raw: unknown): SheetLayout {
  return sanitizeSheetLayoutStrict(raw).layout ?? DEFAULT_SHEET_LAYOUT;
}

/* ------------------------------------------------------------------ *
 * Validate — responde "dá para salvar?"
 * ------------------------------------------------------------------ */

const REJECTION_MESSAGES: Record<LayoutRejection, string> = {
  'not-an-object': 'Layout inválido.',
  'schema-version-ahead':
    'Este layout foi criado numa versão mais nova do app. Atualize a página.',
  'missing-required-section':
    'A ficha precisa manter a identidade e os pontos de vida.',
};

export function validateSheetLayout(raw: unknown): ValidateLayoutResult {
  const issues: LayoutIssue[] = [];

  // Usa a variante estrita de propósito: o fallback para o preset padrão
  // aprovaria silenciosamente um documento que o usuário acabou de quebrar.
  const { layout, rejection } = sanitizeSheetLayoutStrict(raw);

  if (!layout) {
    const code = rejection ?? 'not-an-object';
    return {
      ok: false,
      issues: [{ level: 'error', code, message: REJECTION_MESSAGES[code] }],
    };
  }

  // Os tetos são medidos no documento RECEBIDO: o saneamento corta em
  // silêncio, e medir depois dele aprovaria um layout diferente do enviado.
  const rawRegions =
    isRecord(raw) && Array.isArray(raw.regions) ? raw.regions : [];
  if (rawRegions.length > SHEET_LAYOUT_CAPS.maxRegions) {
    issues.push({
      level: 'error',
      code: 'too-many-regions',
      message: `Um layout pode ter no máximo ${SHEET_LAYOUT_CAPS.maxRegions} áreas.`,
    });
  }
  if (
    rawRegions.some(
      (r) =>
        isRecord(r) &&
        Array.isArray(r.sections) &&
        r.sections.length > SHEET_LAYOUT_CAPS.maxSectionsPerRegion
    )
  ) {
    issues.push({
      level: 'error',
      code: 'too-many-sections',
      message: `Uma área pode ter no máximo ${SHEET_LAYOUT_CAPS.maxSectionsPerRegion} seções.`,
    });
  }
  if (JSON.stringify(raw).length > SHEET_LAYOUT_CAPS.maxSerializedBytes) {
    issues.push({
      level: 'error',
      code: 'too-large',
      message: 'O layout ficou grande demais. Encurte as notas.',
    });
  }

  const seenKinds = new Set<SheetSectionKind>();
  layout.regions.forEach((region) => {
    if (region.role === 'surface' && !region.label) {
      issues.push({
        level: 'error',
        code: 'surface-without-label',
        message: 'Toda aba ou tela precisa de um nome.',
        regionId: region.id,
      });
    }

    if (region.sections.length === 0) {
      issues.push({
        level: 'warning',
        code: 'empty-region',
        message: `A área "${
          region.label ?? region.role
        }" está vazia e não vai aparecer.`,
        regionId: region.id,
      });
    }

    region.sections.forEach((section) => {
      const { kind } = section.payload;
      // `note` é a única que pode repetir: é conteúdo do usuário, não um bloco
      // da ficha. As demais montam DragDropContext e ids fixos de DOM, e
      // duplicar quebraria a reordenação de poderes.
      if (kind === 'note') return;

      if (seenKinds.has(kind)) {
        issues.push({
          level: 'error',
          code: 'duplicate-section-kind',
          message: 'Cada seção só pode aparecer uma vez no layout.',
          sectionId: section.id,
          regionId: region.id,
        });
      } else {
        seenKinds.add(kind);
      }
    });
  });

  // Não há checagem de seção obrigatória aqui: o saneamento estrito já recusa
  // o documento antes de chegar neste ponto.

  if (
    layout.template === 'actionMenu' &&
    !layout.regions.some((r) => r.role === 'header')
  ) {
    issues.push({
      level: 'error',
      code: 'header-required',
      message: 'O menu de ação precisa de uma área fixa no topo.',
    });
  }

  const ok = !issues.some((issue) => issue.level === 'error');
  return { ok, layout: ok ? layout : undefined, issues };
}
