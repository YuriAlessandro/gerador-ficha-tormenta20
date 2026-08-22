import CharacterSheet from '../../interfaces/CharacterSheet';
import { getBrigaDice, updateUnarmedRolls } from '../unarmedDamage';

/**
 * Camada de compatibilidade da Briga (Lutador/Atleta).
 *
 * A regra deixou de ser exclusiva do Lutador: `unarmedDamage.ts` é o ponto
 * único de dano desarmado da ficha, e a Briga passou a ser só uma das fontes
 * do dado BASE — junto do 1d3 padrão e de `Estilo Desarmado` — sobre o qual
 * incidem os passos de tamanho e de `Corpo Aberrante`.
 *
 * `getBrigaDice` (a tabela oficial por nível de classe) continua morando lá e é
 * reexportado aqui para não quebrar quem já importava deste caminho.
 */
export { getBrigaDice };

/**
 * @deprecated Use `updateUnarmedRolls` de `functions/unarmedDamage`. Mantido
 * pelo contrato de retorno (o dado quando mudou, `null` quando não) que o
 * passo-a-passo de level-up consome.
 */
export function updateBrigaRolls(sheet: CharacterSheet): string | null {
  return updateUnarmedRolls(sheet);
}

export default updateBrigaRolls;
