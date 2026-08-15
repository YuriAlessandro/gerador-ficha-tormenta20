/**
 * Os três modelos de ficha embarcados no app.
 *
 * `PRESET_TABS` é o mais importante dos três: ele tem que reproduzir EXATAMENTE
 * o arranjo que a ficha tinha antes de existir sistema de layout, porque é o
 * default de toda ficha sem layout salvo e de todo usuário sem acesso à feature.
 * O teste `Result.layoutParity.spec.tsx` trava esse contrato.
 *
 * Os ids são constantes (e não uuid gerado) porque o `regionOverrides` do mobile
 * precisa referenciá-los, e porque um preset tem que serializar igual em toda
 * máquina — senão dois usuários com "o mesmo" layout teriam documentos
 * diferentes.
 */
import {
  LayoutRegion,
  LayoutSection,
  SheetLayout,
  SheetSectionKind,
  SheetSectionWidth,
  SHEET_LAYOUT_SCHEMA_VERSION,
} from './SheetLayout';

/* ------------------------------------------------------------------ *
 * Ids estáveis
 * ------------------------------------------------------------------ */

export const PRESET_REGION_IDS = {
  header: 'r-header',
  main: 'r-main',
  aside: 'r-aside',
  footer: 'r-footer',
  attacks: 'r-attacks',
  defense: 'r-defense',
  powers: 'r-powers',
  spells: 'r-spells',
  equipment: 'r-equipment',
  skills: 'r-skills',
  /** Tela única do modelo de página contínua. */
  body: 'r-body',
  /** Telas agrupadas do menu de ação. */
  combat: 'r-combat',
  magic: 'r-magic',
  character: 'r-character',
  inventory: 'r-inventory',
  allies: 'r-allies',
  /** Segundo bloco da coluna esquerda, abaixo do card de abas. */
  mainBottom: 'r-main-bottom',
} as const;

const sectionId = (kind: SheetSectionKind) => `s-${kind}`;

export const PRESET_SECTION_IDS = {
  identity: sectionId('identity'),
  attributes: sectionId('attributes'),
  skills: sectionId('skills'),
  attacks: sectionId('attacks'),
  defense: sectionId('defense'),
  powers: sectionId('powers'),
  spells: sectionId('spells'),
  equipment: sectionId('equipment'),
  proficiencies: sectionId('proficiencies'),
  sizeDisplacement: sectionId('sizeDisplacement'),
  partners: sectionId('partners'),
  animalCompanions: sectionId('animalCompanions'),
  creationSteps: sectionId('creationSteps'),
  supportCta: sectionId('supportCta'),
  bugReport: sectionId('bugReport'),
} as const;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const sec = (
  kind: Exclude<SheetSectionKind, 'note'>,
  width: SheetSectionWidth = 'full'
): LayoutSection => ({
  id: sectionId(kind),
  payload: { kind },
  width,
});

/** Uma aba/tela com uma seção só — o formato de todas as abas de hoje. */
const surface = (
  id: string,
  label: string,
  iconKey: string,
  kinds: Exclude<SheetSectionKind, 'note'>[]
): LayoutRegion => ({
  id,
  role: 'surface',
  label,
  iconKey,
  sections: kinds.map((k) => sec(k)),
});

/** Seções fixas do topo, comuns aos três modelos. */
const headerSections = (): LayoutSection[] => [
  sec('identity'),
  sec('attributes'),
  sec('partners'),
  sec('animalCompanions'),
];

/** Rodapé comum aos três modelos. */
const footerRegion = (): LayoutRegion => ({
  id: PRESET_REGION_IDS.footer,
  role: 'footer',
  sections: [sec('bugReport'), sec('supportCta'), sec('creationSteps')],
});

/* ------------------------------------------------------------------ *
 * tabs — o layout de hoje
 * ------------------------------------------------------------------ */

/**
 * Reproduz o arranjo original:
 * - coluna esquerda: identidade + PV/PM, atributos, parceiros, companheiros,
 *   depois o card de abas, depois proficiências e tamanho/deslocamento;
 * - coluna direita (só no largo): Perícias;
 * - abas: Ataques, Defesa, Poderes, Magias, Equip.
 *
 * No estreito, Perícias sai da coluna direita e vira a PRIMEIRA aba — que é o
 * que `Result.tsx` fazia com um `if` cravado no render.
 */
export const PRESET_TABS: SheetLayout = {
  schemaVersion: SHEET_LAYOUT_SCHEMA_VERSION,
  id: 'preset:tabs',
  name: 'Abas',
  template: 'tabs',
  readonly: true,
  regions: [
    {
      id: PRESET_REGION_IDS.main,
      role: 'main',
      sections: headerSections(),
    },
    {
      id: PRESET_REGION_IDS.aside,
      role: 'aside',
      sections: [sec('skills')],
    },
    // A aba de Perícias só existe no estreito; no largo ela fica vazia e o
    // resolve a descarta, então nunca aparece no desktop.
    surface(PRESET_REGION_IDS.skills, 'Perícias', 'mui:Psychology', []),
    surface(PRESET_REGION_IDS.attacks, 'Ataques', 'mui:Colorize', ['attacks']),
    surface(PRESET_REGION_IDS.defense, 'Defesa', 'mui:Shield', ['defense']),
    surface(PRESET_REGION_IDS.powers, 'Poderes', 'mui:AutoAwesome', ['powers']),
    surface(PRESET_REGION_IDS.spells, 'Magias', 'mui:AutoFixHigh', ['spells']),
    surface(PRESET_REGION_IDS.equipment, 'Equip.', 'mui:Backpack', [
      'equipment',
    ]),
    {
      id: PRESET_REGION_IDS.mainBottom,
      role: 'main',
      sections: [sec('proficiencies'), sec('sizeDisplacement')],
    },
    footerRegion(),
  ],
  theme: {},
  // `forceFullWidth` não é declarado: `true` é o default, e o saneamento
  // normaliza o documento removendo o que é redundante.
  mobile: {
    regionOverrides: {
      [PRESET_SECTION_IDS.skills]: PRESET_REGION_IDS.skills,
    },
    hiddenRegionIds: [PRESET_REGION_IDS.aside],
  },
};

/* ------------------------------------------------------------------ *
 * single — página única
 * ------------------------------------------------------------------ */

/**
 * O arranjo anterior ao commit 5cb8bf9f: cada bloco é um card empilhado num
 * scroll contínuo, sem abas. Perícias continua na coluna direita no largo.
 */
export const PRESET_SINGLE: SheetLayout = {
  schemaVersion: SHEET_LAYOUT_SCHEMA_VERSION,
  id: 'preset:single',
  name: 'Página única',
  template: 'single',
  readonly: true,
  regions: [
    {
      id: PRESET_REGION_IDS.main,
      role: 'main',
      sections: headerSections(),
    },
    {
      id: PRESET_REGION_IDS.aside,
      role: 'aside',
      sections: [sec('skills')],
    },
    {
      id: PRESET_REGION_IDS.body,
      role: 'main',
      sections: [
        sec('attacks'),
        sec('defense'),
        sec('powers'),
        sec('spells'),
        sec('equipment'),
        sec('proficiencies'),
        sec('sizeDisplacement'),
      ],
    },
    footerRegion(),
  ],
  theme: {},
  mobile: {
    hiddenRegionIds: [PRESET_REGION_IDS.aside],
  },
};

/* ------------------------------------------------------------------ *
 * actionMenu — lista-mestra de seções
 * ------------------------------------------------------------------ */

/**
 * Estilo app do D&D Beyond: cabeçalho fixo com os vitais e o resto atrás de uma
 * lista-mestra de telas, cada uma abrindo em tela cheia.
 *
 * Aqui as telas AGRUPAM seções (Combate = Ataques + Defesa), que é o ganho que
 * o modelo de regiões traz sobre as abas 1:1 de hoje.
 */
export const PRESET_ACTION_MENU: SheetLayout = {
  schemaVersion: SHEET_LAYOUT_SCHEMA_VERSION,
  id: 'preset:actionMenu',
  name: 'Menu de ação',
  template: 'actionMenu',
  readonly: true,
  regions: [
    {
      id: PRESET_REGION_IDS.header,
      role: 'header',
      sections: [sec('identity')],
    },
    surface(PRESET_REGION_IDS.combat, 'Combate', 'mui:Colorize', [
      'attacks',
      'defense',
    ]),
    surface(PRESET_REGION_IDS.magic, 'Magias', 'mui:AutoFixHigh', ['spells']),
    surface(PRESET_REGION_IDS.powers, 'Poderes', 'mui:AutoAwesome', ['powers']),
    surface(PRESET_REGION_IDS.character, 'Personagem', 'mui:Person', [
      'attributes',
      'skills',
      'proficiencies',
      'sizeDisplacement',
    ]),
    surface(PRESET_REGION_IDS.inventory, 'Inventário', 'mui:Backpack', [
      'equipment',
    ]),
    surface(PRESET_REGION_IDS.allies, 'Aliados', 'mui:Groups', [
      'partners',
      'animalCompanions',
    ]),
    footerRegion(),
  ],
  // Sem `mobile`: o menu de ação já é desenhado para o estreito, e o default
  // de largura inteira vale sem precisar ser declarado.
  theme: {},
};

/* ------------------------------------------------------------------ *
 * Registro
 * ------------------------------------------------------------------ */

export const SHEET_LAYOUT_PRESETS: SheetLayout[] = [
  PRESET_TABS,
  PRESET_SINGLE,
  PRESET_ACTION_MENU,
];

/** O default de toda ficha sem layout e de todo usuário sem acesso à feature. */
export const DEFAULT_SHEET_LAYOUT = PRESET_TABS;

export const getPresetLayout = (id: string): SheetLayout | undefined =>
  SHEET_LAYOUT_PRESETS.find((preset) => preset.id === id);
