import type { Theme } from '@mui/material';

/**
 * Padrões de `sx` para telas estreitas. Todos usam o breakpoint `md` — o
 * mesmo de `useIsMobile` — e deixam o desktop exatamente como estava.
 */

/** Célula de tabela que some no mobile (a informação aparece em outro lugar). */
export const DESKTOP_ONLY_CELL_SX = {
  display: { xs: 'none', md: 'table-cell' },
} as const;

/** Bloco que só aparece no mobile (ex.: dado de uma coluna escondida). */
export const MOBILE_ONLY_BLOCK_SX = {
  display: { xs: 'block', md: 'none' },
} as const;

/** Trecho inline que só aparece no mobile (ex.: "(Des)" ao lado do nome). */
export const MOBILE_ONLY_INLINE_SX = {
  display: { xs: 'inline', md: 'none' },
} as const;

/**
 * Chip selecionável com alvo de toque confortável no mobile (32px de altura,
 * como o `Chip` médio do MUI). No desktop continua o `size='small'` de hoje.
 */
export const TOUCH_CHIP_SX = (theme: Theme) => ({
  [theme.breakpoints.down('md')]: {
    height: 32,
    fontSize: '0.8125rem',
  },
});
