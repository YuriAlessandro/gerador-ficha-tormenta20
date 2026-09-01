/**
 * Identidade do efeito ativo de Poder Capturado (Clérigo Usurpador).
 *
 * Módulo FOLHA de propósito — sem imports. `getSheetDeityNames` precisa saber
 * se há um deus capturado ativo, e `poderCapturadoEffects` precisa saber quem
 * é o devoto: pôr as duas primitivas aqui quebra o ciclo que existiria entre
 * eles.
 */
export const PODER_CAPTURADO_KEY = 'usurpador:poder-capturado';

/** Separador do `optionId` — `<deus>|<poder>`. */
const OPTION_ID_SEPARATOR = '|';

export function buildPoderCapturadoOptionId(
  divindade: string,
  poder: string
): string {
  return `${divindade}${OPTION_ID_SEPARATOR}${poder}`;
}

/** Nome do deus embutido no `optionId` de um efeito de Poder Capturado. */
export function parsePoderCapturadoDeity(optionId: string): string {
  return optionId.split(OPTION_ID_SEPARATOR)[0];
}
