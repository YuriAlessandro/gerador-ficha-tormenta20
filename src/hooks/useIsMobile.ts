import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Única definição de "mobile" das telas responsivas: abaixo do breakpoint
 * `md` (900px). Cobre celular em pé e deitado e tablet pequeno.
 *
 * Use o hook só quando a ESTRUTURA muda (dialog em tela cheia, trocar o
 * stepper, `colSpan`, renderizar um Fab). Mudança só visual (esconder
 * coluna, margem, fonte) vai em `sx` responsivo — `{ xs: ..., md: ... }` —
 * que não precisa de JS nem re-renderiza.
 *
 * `noSsr` faz o primeiro render já sair com o valor certo; sem ele o celular
 * veria um flash do layout de desktop.
 */
export const useIsMobile = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
};
