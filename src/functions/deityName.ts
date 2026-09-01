/**
 * Normalização de nome de divindade para comparação.
 *
 * Existe porque as opções dos formulários usam a CHAVE do enum estático
 * (`TANNATOH`, `LINWU`) enquanto o catálogo usa o nome formatado (`Tanna-Toh`,
 * `Lin-Wu`): sem tirar hífens e espaços os dois nunca casariam.
 *
 * Ponto ÚNICO — havia uma cópia em `general.ts` e outra no
 * `SheetInfoEditDrawer`, e o comentário de lá já avisava que dropdown e busca
 * precisam usar a MESMA normalização sob pena de a edição ser descartada em
 * silêncio.
 */
export const normalizeDeityName = (name: string): string =>
  name.toLowerCase().replace(/[-\s]/g, '');

export default normalizeDeityName;
