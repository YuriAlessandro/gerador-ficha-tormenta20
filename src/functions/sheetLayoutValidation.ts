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
  DEVICE_VISIBILITIES,
  DeviceVisibility,
  isFooterLockedKind,
  showsOn,
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

const asShowOn = (v: unknown): DeviceVisibility | undefined =>
  v === 'desktop' || v === 'mobile' ? v : undefined;

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

  const showOn = asShowOn(raw.showOn);
  if (showOn) section.showOn = showOn;

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

  const showOn = asShowOn(raw.showOn);
  if (showOn) region.showOn = showOn;

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

  // Visíveis em todo dispositivo: nem a seção nem o rodapé podem ser "só
  // computador" ou "só celular".
  const sections = [...footer.sections, ...additions].map((s) => {
    if (!isFooterLockedKind(s.payload.kind) || !s.showOn) return s;
    const visibleEverywhere = { ...s };
    delete visibleEverywhere.showOn;
    return visibleEverywhere;
  });
  const nextFooter: LayoutRegion = { ...footer, sections };
  delete nextFooter.showOn;
  cleaned[footerIdx] = nextFooter;
  return cleaned;
};

/**
 * Seção "só computador" numa área que já é "só computador" diz a mesma coisa
 * duas vezes — e o editor mostrava o selo repetido em cada linha. Fica só o da
 * área. (A conversão da v1 produz exatamente esse caso na coluna lateral.)
 */
const dropRedundantShowOn = (regions: LayoutRegion[]): LayoutRegion[] =>
  regions.map((region) => {
    if (!region.showOn) return region;
    if (!region.sections.some((s) => s.showOn === region.showOn)) return region;
    return {
      ...region,
      sections: region.sections.map((s) => {
        if (s.showOn !== region.showOn) return s;
        const next = { ...s };
        delete next.showOn;
        return next;
      }),
    };
  });

/**
 * Converte o celular da v1 para `showOn` (v2).
 *
 * - `hiddenRegionIds` → a região vira "só computador".
 * - `regionOverrides` (seção X vai para a região Y no estreito) → a seção fica
 *   "só computador" onde está e ganha uma CÓPIA "só celular" na frente da
 *   região Y — exatamente onde o resolve da v1 a punha.
 */
const migrateV1Mobile = (
  regions: LayoutRegion[],
  rawMobile: Record<string, unknown> | undefined
): LayoutRegion[] => {
  if (!rawMobile) return regions;
  const regionIds = new Set(regions.map((r) => r.id));
  const sectionIds = new Set(
    regions.flatMap((r) => r.sections.map((s) => s.id))
  );

  const hidden = new Set(
    Array.isArray(rawMobile.hiddenRegionIds)
      ? rawMobile.hiddenRegionIds
          .map(asString)
          .filter((id): id is string => !!id)
      : []
  );

  const overrides = isRecord(rawMobile.regionOverrides)
    ? Object.entries(rawMobile.regionOverrides)
        .map(([sectionId, target]) => [sectionId, asString(target)] as const)
        .filter(
          (e): e is readonly [string, string] =>
            !!e[1] && sectionIds.has(e[0]) && regionIds.has(e[1])
        )
    : [];

  const movedToDesktop = new Set<string>();
  const incoming = new Map<string, LayoutSection[]>();
  overrides.forEach(([sectionId, target]) => {
    const home = regions.find((r) =>
      r.sections.some((s) => s.id === sectionId)
    );
    const section = home?.sections.find((s) => s.id === sectionId);
    if (!home || !section || home.id === target) return;
    movedToDesktop.add(sectionId);
    const copyId = freshId(`${sectionId}-mobile`, sectionIds);
    sectionIds.add(copyId);
    const list = incoming.get(target) ?? [];
    list.push({ ...section, id: copyId, showOn: 'mobile' });
    incoming.set(target, list);
  });

  if (hidden.size === 0 && movedToDesktop.size === 0) return regions;

  return regions.map((region) => {
    const sections = region.sections.map((s) =>
      movedToDesktop.has(s.id) ? { ...s, showOn: 'desktop' as const } : s
    );
    const next: LayoutRegion = {
      ...region,
      sections: [...(incoming.get(region.id) ?? []), ...sections],
    };
    if (hidden.has(region.id)) next.showOn = 'desktop';
    return next;
  });
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

  const rawMobile = isRecord(raw.mobile) ? raw.mobile : undefined;
  // v1 → v2 primeiro (as cópias do celular nascem aqui), depois a trava do
  // rodapé — que também tira `showOn` das seções travadas.
  const lockedRegions = dropRedundantShowOn(
    enforceFooterLock(migrateV1Mobile(regions, rawMobile))
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

  if (rawMobile) {
    const mobile: NonNullable<SheetLayout['mobile']> = {};

    const mobileTemplate = asString(rawMobile.template);
    if (mobileTemplate && TEMPLATE_SET.has(mobileTemplate)) {
      mobile.template = mobileTemplate as SheetTemplateKind;
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

  // Unicidade POR DISPOSITIVO: Ataques pode estar numa aba no computador e
  // noutra no celular, mas nunca duas vezes no mesmo — as seções montam ids
  // fixos de DOM e, no caso de Poderes, um DragDropContext próprio.
  const seenByDevice = new Map<DeviceVisibility, Set<SheetSectionKind>>(
    DEVICE_VISIBILITIES.map((d) => [d, new Set<SheetSectionKind>()])
  );
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
      // da ficha.
      if (kind === 'note') return;

      const clash = DEVICE_VISIBILITIES.some((device) => {
        if (!showsOn(region.showOn, device) || !showsOn(section.showOn, device))
          return false;
        const seen = seenByDevice.get(device) as Set<SheetSectionKind>;
        if (seen.has(kind)) return true;
        seen.add(kind);
        return false;
      });
      if (clash) {
        issues.push({
          level: 'error',
          code: 'duplicate-section-kind',
          message:
            'Cada seção só pode aparecer uma vez no computador e uma vez no celular. Marque as cópias como "só computador" ou "só celular".',
          sectionId: section.id,
          regionId: region.id,
        });
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
