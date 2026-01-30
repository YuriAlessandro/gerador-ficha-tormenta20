/**
 * Accent Color Palette Definitions
 *
 * This file contains all available accent colors that users can choose from.
 * Each color has main, dark, light, and contrastText variants.
 */

export type AccentColorId = 'red' | 'brown' | 'dark-brown' | 'purple' | 'navy';

export interface AccentColorPalette {
  id: AccentColorId;
  name: string;
  main: string;
  dark: string;
  light: string;
  contrastText: string;
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
 * Get all accent colors as an array (useful for UI rendering)
 */
export const getAccentColorsArray = (): AccentColorPalette[] =>
  Object.values(ACCENT_COLORS);
