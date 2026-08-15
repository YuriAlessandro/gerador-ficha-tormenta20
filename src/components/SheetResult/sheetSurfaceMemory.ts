/**
 * Última aba/tela aberta por ficha, viva só enquanto a página estiver aberta.
 *
 * Sucede o `sheetTabMemory`, que guardava uma união fechada de nomes de aba.
 * Isso deixou de servir quando as abas viraram dado do usuário: o valor agora é
 * o id de uma região, que só existe dentro de um layout específico.
 *
 * Daí a CHAVE COMPOSTA por ficha + layout. Sem o layout na chave, trocar de
 * modelo restauraria o id de uma região do layout anterior, e o template cairia
 * na primeira aba sem explicação — ou pior, numa aba que não existe mais.
 *
 * Continua sendo um Map de módulo, e não sessionStorage, pelo mesmo motivo de
 * antes: isto é estado de UI efêmero. A razão de existir é a mesa virtual, que
 * troca a ÁRVORE inteira ao girar o tablet e remonta o `<Result/>`, zerando o
 * `useState`. A ficha continua a mesma e a leitura do jogador também.
 */
const lastSurfaceBySheet = new Map<string, string>();

const keyOf = (sheetId: string, layoutId: string) => `${sheetId}::${layoutId}`;

export const getRememberedSheetSurface = (
  sheetId: string,
  layoutId: string
): string | undefined =>
  sheetId ? lastSurfaceBySheet.get(keyOf(sheetId, layoutId)) : undefined;

/**
 * Fichas sem id (importadas/legadas) são ignoradas de propósito: sem o guard
 * todas dividiriam o mesmo balde e uma restauraria a aba da outra.
 */
export const rememberSheetSurface = (
  sheetId: string,
  layoutId: string,
  regionId: string
): void => {
  if (!sheetId) return;
  lastSurfaceBySheet.set(keyOf(sheetId, layoutId), regionId);
};

/** Só para testes: o Map é de módulo e sobrevive entre casos. */
export const clearSheetSurfaceMemory = (): void => {
  lastSurfaceBySheet.clear();
};
