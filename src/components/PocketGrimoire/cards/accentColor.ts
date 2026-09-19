import { Theme } from '@mui/material';
import { darken } from '@mui/material/styles';
import { ItemAccent } from './itemPresentation';

/** Cor sólida de cada tom, sempre a partir do tema (claro e escuro). */
export const accentColor = (theme: Theme, accent: ItemAccent): string => {
  switch (accent) {
    case 'arcane':
    case 'arcaneDivine':
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

/**
 * Fundo da moldura da carta: a cor do tipo com um brilho no canto e
 * escurecendo para as bordas. "Arcana e divina" mistura as duas cores.
 */
export const accentFrame = (theme: Theme, accent: ItemAccent): string => {
  if (accent === 'arcaneDivine') {
    const arcane = theme.palette.primary.main;
    const divine = theme.palette.info.main;
    return `linear-gradient(135deg, ${darken(arcane, 0.15)} 0%, ${darken(
      arcane,
      0.45
    )} 45%, ${darken(divine, 0.45)} 55%, ${darken(divine, 0.15)} 100%)`;
  }
  const color = accentColor(theme, accent);
  return `radial-gradient(circle at 20% 15%, ${darken(color, 0.1)} 0%, ${darken(
    color,
    0.45
  )} 50%, ${darken(color, 0.7)} 100%)`;
};
