import { createTheme, ThemeOptions, Shadows } from '@mui/material/styles';
import {
  AccentColorPalette,
  AccentColorId,
  getAccentColor,
  DEFAULT_ACCENT_COLOR,
} from './accentColors';

const TORMENTA_GREY = {
  50: '#fafafa',
  100: '#f3f2f1',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616160',
  800: '#424242',
  900: '#212121',
};

/**
 * Convert hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 209, g: 50, b: 53 }; // fallback to red
};

/**
 * Generate dynamic shadows based on accent color
 */
const generateShadows = (mainColor: string): Shadows => {
  const { r, g, b } = hexToRgb(mainColor);
  return [
    'none',
    `0 2px 8px rgba(${r}, ${g}, ${b}, 0.15)`,
    `0 4px 12px rgba(${r}, ${g}, ${b}, 0.2)`,
    `0 6px 16px rgba(${r}, ${g}, ${b}, 0.25)`,
    `0 8px 25px rgba(${r}, ${g}, ${b}, 0.3)`,
    `0 12px 35px rgba(${r}, ${g}, ${b}, 0.35)`,
    `0 16px 48px rgba(${r}, ${g}, ${b}, 0.4)`,
    `0 20px 60px rgba(${r}, ${g}, ${b}, 0.45)`,
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.1)',
    '0 12px 24px rgba(0,0,0,0.12)',
    '0 16px 32px rgba(0,0,0,0.14)',
    '0 20px 40px rgba(0,0,0,0.16)',
    '0 24px 48px rgba(0,0,0,0.18)',
    '0 28px 56px rgba(0,0,0,0.2)',
    '0 32px 64px rgba(0,0,0,0.22)',
    '0 36px 72px rgba(0,0,0,0.24)',
    '0 40px 80px rgba(0,0,0,0.26)',
    '0 44px 88px rgba(0,0,0,0.28)',
    '0 48px 96px rgba(0,0,0,0.3)',
    '0 52px 104px rgba(0,0,0,0.32)',
    '0 56px 112px rgba(0,0,0,0.34)',
    '0 60px 120px rgba(0,0,0,0.36)',
    '0 64px 128px rgba(0,0,0,0.38)',
  ] as Shadows;
};

/**
 * Generate button shadow based on accent color
 */
const generateButtonShadow = (
  mainColor: string,
  intensity: number = 0.25
): string => {
  const { r, g, b } = hexToRgb(mainColor);
  return `0 2px 8px rgba(${r}, ${g}, ${b}, ${intensity})`;
};

/**
 * Generate hover button shadow based on accent color
 */
const generateButtonHoverShadow = (mainColor: string): string => {
  const { r, g, b } = hexToRgb(mainColor);
  return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.35)`;
};

/**
 * Generate card shadow based on mode and accent color
 */
const generateCardShadow = (
  mode: 'light' | 'dark',
  mainColor: string
): string => {
  if (mode === 'dark') {
    return '0 2px 8px rgba(0, 0, 0, 0.3)';
  }
  const { r, g, b } = hexToRgb(mainColor);
  return `0 2px 8px rgba(${r}, ${g}, ${b}, 0.08)`;
};

/**
 * Generate list item hover background based on mode and accent color
 */
const generateListItemHoverBg = (
  mode: 'light' | 'dark',
  mainColor: string
): string => {
  const { r, g, b } = hexToRgb(mainColor);
  return mode === 'dark'
    ? `rgba(${r}, ${g}, ${b}, 0.08)`
    : `rgba(${r}, ${g}, ${b}, 0.04)`;
};

/**
 * Generate tab focus background based on mode and accent color
 */
const generateTabFocusBg = (
  mode: 'light' | 'dark',
  mainColor: string
): string => {
  if (mode === 'dark') {
    return 'rgba(250, 250, 250, 0.12)';
  }
  const { r, g, b } = hexToRgb(mainColor);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
};

/**
 * Get the effective primary color based on mode
 * Dark mode uses more vibrant colors (light variant as main)
 */
const getPrimaryPalette = (
  mode: 'light' | 'dark',
  accentColor: AccentColorPalette
) => {
  if (mode === 'dark') {
    // In dark mode, use lighter/more vibrant colors for better visibility
    return {
      main: accentColor.light, // More vibrant in dark mode
      dark: accentColor.main, // Original main becomes dark
      light: accentColor.light, // Keep light for consistency
      contrastText: accentColor.contrastText,
    };
  }
  // Light mode uses the standard darker palette
  return {
    main: accentColor.main,
    dark: accentColor.dark,
    light: accentColor.light,
    contrastText: accentColor.contrastText,
  };
};

export const getThemeOptions = (
  mode: 'light' | 'dark',
  accentColor: AccentColorPalette
): ThemeOptions => {
  const primaryPalette = getPrimaryPalette(mode, accentColor);

  return {
    palette: {
      mode,
      primary: primaryPalette,
      secondary: {
        main: mode === 'dark' ? '#fafafa' : '#616160',
        dark: mode === 'dark' ? '#e0e0e0' : '#424242',
        light: mode === 'dark' ? '#ffffff' : '#757575',
      },
      background: {
        default: mode === 'dark' ? TORMENTA_GREY[900] : TORMENTA_GREY[100],
        paper: mode === 'dark' ? 'rgb(54, 54, 54)' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
        secondary:
          mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
      grey: TORMENTA_GREY,
    },
    typography: {
      fontFamily: "'Alegreya Sans', sans-serif",
      h1: {
        fontFamily: 'Tfont, serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: 'Tfont, serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: 'Tfont, serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: 'Tfont, serif',
        fontWeight: 600,
      },
      h5: {
        fontFamily: 'Tfont, serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily: 'Tfont, serif',
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: generateShadows(accentColor.main),
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: generateButtonShadow(accentColor.main),
            '&:hover': {
              boxShadow: generateButtonHoverShadow(accentColor.main),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: generateCardShadow(mode, accentColor.main),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow:
              mode === 'dark'
                ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                : '0 2px 4px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? accentColor.main : TORMENTA_GREY[700],
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              color: mode === 'dark' ? '#fafafa' : accentColor.main,
            },
            '&.Mui-focusVisible': {
              backgroundColor: generateTabFocusBg(mode, accentColor.main),
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor:
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(224, 224, 224, 1)',
          },
          head: {
            fontWeight: 600,
            backgroundColor:
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: accentColor.main,
            color: accentColor.contrastText,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              color: accentColor.main,
              backgroundColor: generateListItemHoverBg(mode, accentColor.main),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor.light,
              },
            },
          },
        },
      },
    },
  };
};

export const createTormentaTheme = (
  mode: 'light' | 'dark',
  accentColorId: AccentColorId = DEFAULT_ACCENT_COLOR
) => {
  const accentColor = getAccentColor(accentColorId);
  return createTheme(getThemeOptions(mode, accentColor));
};
