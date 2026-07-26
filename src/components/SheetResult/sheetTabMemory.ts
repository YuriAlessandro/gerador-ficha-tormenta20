export type SheetTabValue =
  | 'pericias'
  | 'ataques'
  | 'defesa'
  | 'poderes'
  | 'magias'
  | 'equipamentos';

/**
 * Última aba aberta por ficha, viva só enquanto a página estiver aberta.
 *
 * Existe porque a mesa virtual troca a ÁRVORE inteira ao girar o tablet — o
 * GameSessionPage alterna entre layout de desktop e de mobile —, o que desmonta
 * e remonta o <Result/> e zera todo o `useState` dele. A ficha continua a mesma
 * e o jogador continua na mesma leitura; a aba tem que continuar também.
 *
 * Map de módulo, e não sessionStorage: isto é estado de UI efêmero. Sobreviver
 * a um reload seria pior (quem recarrega espera a ficha "do zero") e custaria
 * serialização, validação e um caminho de erro de quota à toa.
 */
const lastTabBySheet = new Map<string, SheetTabValue>();

export const getRememberedSheetTab = (
  sheetId: string
): SheetTabValue | undefined =>
  sheetId ? lastTabBySheet.get(sheetId) : undefined;

/**
 * Fichas sem id (importadas/legadas) são ignoradas de propósito: sem o guard
 * todas dividiriam o mesmo balde e uma restauraria a aba da outra.
 */
export const rememberSheetTab = (sheetId: string, tab: SheetTabValue): void => {
  if (!sheetId) return;
  lastTabBySheet.set(sheetId, tab);
};
