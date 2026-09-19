import { SnackbarOrigin } from 'notistack';

/**
 * O SnackbarProvider global nunca esconde (`autoHideDuration: null`) e ancora
 * à direita, onde fica o botão flutuante do grimório.
 *
 * Sem `variant` de propósito: o App estende os tipos do notistack com variantes
 * de rolagem, então cada chamada precisa dizer o seu `variant` explicitamente.
 */
export const GRIMOIRE_SNACKBAR: {
  autoHideDuration: number;
  anchorOrigin: SnackbarOrigin;
} = {
  autoHideDuration: 4000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
};
