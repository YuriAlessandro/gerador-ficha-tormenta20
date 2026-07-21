/**
 * Accent Color Palette Definitions
 *
 * This file contains all available accent colors that users can choose from.
 * Each color has main, dark, light, and contrastText variants.
 */

export type AccentColorId =
  | 'red'
  | 'brown'
  | 'dark-brown'
  | 'purple'
  | 'navy'
  | 'brazil-green'
  | 'brazil-yellow';

export interface AccentColorPalette {
  id: AccentColorId;
  name: string;
  main: string;
  dark: string;
  light: string;
  contrastText: string;
  /**
   * When true, this color is available to all users (não exige apoio).
   * Hoje só a cor padrão é free — as demais são exclusivas de apoiadores.
   */
  free?: boolean;
}

/**
 * All available accent color palettes
 */
export const ACCENT_COLORS: Record<AccentColorId, AccentColorPalette> = {
  red: {
    id: 'red',
    name: 'Tormenta 20',
    main: '#d13235',
    dark: '#922325',
    light: '#da5b5d',
    contrastText: '#ffffff',
    // Cor padrão da interface — SEMPRE disponível para todos os usuários,
    // mesmo não-apoiadores. Garante que qualquer um possa voltar à cor padrão.
    free: true,
  },
  brown: {
    id: 'brown',
    name: 'Atlas de Arton',
    main: '#9c5420',
    dark: '#6b3a16',
    light: '#b97a4a',
    contrastText: '#ffffff',
  },
  'dark-brown': {
    id: 'dark-brown',
    name: 'Ameaças de Arton',
    main: '#402815',
    dark: '#2a1a0e',
    light: '#5e422d',
    contrastText: '#ffffff',
  },
  purple: {
    id: 'purple',
    name: 'Deuses de Arton',
    main: '#823f5f',
    dark: '#5c2d43',
    light: '#a66183',
    contrastText: '#ffffff',
  },
  navy: {
    id: 'navy',
    name: 'Heróis de Arton',
    main: '#423e7a',
    dark: '#2d2a55',
    light: '#6b67a0',
    contrastText: '#ffffff',
  },
  // Estes dois nasceram como temas comemorativos da Copa 2026 (liberados a
  // todos). Encerrada a Copa, viraram cores normais exclusivas de apoiadores.
  // Os ids continuam `brazil-*` porque já estão persistidos no banco e no
  // localStorage dos usuários — renomeá-los exigiria migração de dados.
  'brazil-green': {
    id: 'brazil-green',
    name: 'Verde Esmeralda',
    main: '#009c3b',
    dark: '#00702a',
    light: '#2bb866',
    contrastText: '#ffffff',
  },
  'brazil-yellow': {
    id: 'brazil-yellow',
    name: 'Amarelo Ouro',
    main: '#e9b50a',
    dark: '#b88c00',
    light: '#ffd84d',
    contrastText: '#3d2e00',
  },
};

/**
 * Default accent color for new users
 */
export const DEFAULT_ACCENT_COLOR: AccentColorId = 'red';

/**
 * LocalStorage key for accent color preference
 */
export const ACCENT_COLOR_STORAGE_KEY = 'fdnAccentColor';

/**
 * Get an accent color palette by ID, with fallback to default
 */
export const getAccentColor = (id?: AccentColorId | null): AccentColorPalette =>
  ACCENT_COLORS[id || DEFAULT_ACCENT_COLOR] ||
  ACCENT_COLORS[DEFAULT_ACCENT_COLOR];

/**
 * Check if a string is a valid AccentColorId
 */
export const isValidAccentColorId = (id: string): id is AccentColorId =>
  Object.keys(ACCENT_COLORS).includes(id);

/**
 * Whether a given accent color can be used by the current user.
 *
 * Cores sem `free: true` são exclusivas de apoiadores. Usada tanto para
 * bloquear a seleção na UI quanto para cair de volta na cor padrão quando um
 * usuário deixa de ser apoiador (ou quando um tema deixa de ser gratuito).
 */
export const isAccentColorAllowed = (
  id: AccentColorId | null | undefined,
  isSupporter: boolean
): boolean => isSupporter || getAccentColor(id).free === true;

/**
 * Get all accent colors as an array (useful for UI rendering)
 */
export const getAccentColorsArray = (): AccentColorPalette[] =>
  Object.values(ACCENT_COLORS);
