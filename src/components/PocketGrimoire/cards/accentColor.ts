import { Theme } from '@mui/material';
import { ItemAccent } from './itemPresentation';

/** Cor de destaque de cada tom, sempre a partir do tema (claro e escuro). */
export const accentColor = (theme: Theme, accent: ItemAccent): string => {
  switch (accent) {
    case 'arcane':
      return theme.palette.primary.main;
    case 'divine':
      return theme.palette.info.main;
    case 'power':
      return theme.palette.warning.dark;
    case 'feature':
      return theme.palette.success.main;
    case 'entity':
      return theme.palette.secondary.main;
    default:
      return theme.palette.text.disabled;
  }
};
