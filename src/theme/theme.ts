import { createTheme, ThemeOptions } from '@mui/material/styles';

// Paleta de cores do Tormenta 20
const TORMENTA_RED = {
  main: '#d13235',
  dark: '#922325',
  light: '#da5b5d',
  contrastText: '#ffffff',
};

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

export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: TORMENTA_RED,
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
  shadows: [
    'none',
    '0 2px 8px rgba(209, 50, 53, 0.15)',
    '0 4px 12px rgba(209, 50, 53, 0.2)',
    '0 6px 16px rgba(209, 50, 53, 0.25)',
    '0 8px 25px rgba(209, 50, 53, 0.3)',
    '0 12px 35px rgba(209, 50, 53, 0.35)',
    '0 16px 48px rgba(209, 50, 53, 0.4)',
    '0 20px 60px rgba(209, 50, 53, 0.45)',
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
  ],
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
          boxShadow: '0 2px 8px rgba(209, 50, 53, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(209, 50, 53, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow:
            mode === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(209, 50, 53, 0.08)',
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
          color: mode === 'dark' ? TORMENTA_RED.main : TORMENTA_GREY[700],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            color: mode === 'dark' ? '#fafafa' : TORMENTA_RED.main,
          },
          '&.Mui-focusVisible': {
            backgroundColor:
              mode === 'dark'
                ? 'rgba(250, 250, 250, 0.12)'
                : 'rgba(209, 50, 53, 0.12)',
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
          backgroundColor: TORMENTA_RED.main,
          color: '#ffffff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            color: TORMENTA_RED.main,
            backgroundColor:
              mode === 'dark'
                ? 'rgba(209, 50, 53, 0.08)'
                : 'rgba(209, 50, 53, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: TORMENTA_RED.light,
            },
          },
        },
      },
    },
  },
});

export const createTormentaTheme = (mode: 'light' | 'dark') =>
  createTheme(getThemeOptions(mode));
