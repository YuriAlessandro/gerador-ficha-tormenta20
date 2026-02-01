import { useMemo } from 'react';
import { useTheme } from '@mui/material';

/**
 * Hook that replaces hardcoded colors in SVG content with the current accent color.
 * Returns a data URL that can be used in background-image.
 *
 * @param svgContent - Raw SVG content as string (use ?raw import)
 * @returns Data URL with the SVG colored with the current accent
 */
export const useDynamicSvg = (svgContent: string): string => {
  const theme = useTheme();
  const accentColor = theme.palette.primary.main;

  return useMemo(() => {
    // Replace the hardcoded red color with the current accent color
    const coloredSvg = svgContent.replace(/#ac0000/gi, accentColor);
    const encoded = encodeURIComponent(coloredSvg);
    return `data:image/svg+xml,${encoded}`;
  }, [svgContent, accentColor]);
};
