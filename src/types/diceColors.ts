// Dice colors for 3D dice - hex values used by DiceBox
export type DiceColorId =
  | 'red'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'black'
  | 'white'
  | 'gold';

export interface DiceColorDefinition {
  id: DiceColorId;
  name: string;
  hex: string;
  textColor: string; // For contrast on UI
}

export const DICE_COLORS: Record<DiceColorId, DiceColorDefinition> = {
  red: {
    id: 'red',
    name: 'Vermelho',
    hex: '#c41e3a',
    textColor: '#ffffff',
  },
  blue: {
    id: 'blue',
    name: 'Azul',
    hex: '#1e90ff',
    textColor: '#ffffff',
  },
  green: {
    id: 'green',
    name: 'Verde',
    hex: '#228b22',
    textColor: '#ffffff',
  },
  purple: {
    id: 'purple',
    name: 'Roxo',
    hex: '#8b008b',
    textColor: '#ffffff',
  },
  orange: {
    id: 'orange',
    name: 'Laranja',
    hex: '#ff8c00',
    textColor: '#000000',
  },
  black: {
    id: 'black',
    name: 'Preto',
    hex: '#1a1a1a',
    textColor: '#ffffff',
  },
  white: {
    id: 'white',
    name: 'Branco',
    hex: '#f5f5f5',
    textColor: '#000000',
  },
  gold: {
    id: 'gold',
    name: 'Dourado',
    hex: '#ffd700',
    textColor: '#000000',
  },
};

export const getDiceColorsArray = (): DiceColorDefinition[] =>
  Object.values(DICE_COLORS);

export const getDiceColorHex = (colorId: DiceColorId): string =>
  DICE_COLORS[colorId]?.hex || DICE_COLORS.red.hex;
