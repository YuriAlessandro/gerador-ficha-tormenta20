import { OptionsObject } from 'notistack';

/**
 * O SnackbarProvider global nunca esconde (`autoHideDuration: null`) e ancora
 * à direita, onde fica o botão flutuante do grimório.
 */
export const GRIMOIRE_SNACKBAR: OptionsObject = {
  autoHideDuration: 4000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
};
