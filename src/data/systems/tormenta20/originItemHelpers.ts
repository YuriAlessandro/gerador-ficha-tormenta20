import Equipment from '../../../interfaces/Equipment';
import { Items } from '../../../interfaces/Origin';
import { getRandomItemFromArray } from '../../../functions/randomUtils';

/**
 * Declara um item de origem que o jogador escolhe entre várias opções
 * ("Uma arma marcial ou exótica", "Cota de malha ou escudo pesado").
 *
 * `equipment` continua recebendo um sorteio para manter compatibilidade com a
 * geração aleatória e com qualquer consumidor que ignore `choice`; no
 * assistente e no editor de ficha, a escolha do jogador substitui o sorteio via
 * `resolveOriginItems` (`src/functions/originItems.ts`).
 */
export function itemChoice(
  key: string,
  label: string,
  options: (Equipment | string)[],
  qtd?: number
): Items {
  return {
    equipment: getRandomItemFromArray(options),
    description: label,
    qtd,
    choice: { key, label, options },
  };
}

export default itemChoice;
