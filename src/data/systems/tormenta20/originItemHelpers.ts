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
  // Um item nulo aqui derruba a grade de escolha inteira (ela lê `.nome` de cada
  // opção). Já aconteceu com origens que referenciavam chaves inexistentes do
  // catálogo; homebrew e suplementos futuros podem repetir o erro.
  const validOptions = options.filter(Boolean);

  if (validOptions.length !== options.length) {
    // Filtrar salva a tela, mas o dado continua errado — avisa alto para que o
    // problema apareça no teste de integridade e no console de desenvolvimento
    // em vez de virar uma opção que some em silêncio.
    // eslint-disable-next-line no-console
    console.error(
      `[itemChoice] "${label}" recebeu ${
        options.length - validOptions.length
      } opção(ões) inválida(s) — provável referência a uma chave inexistente do catálogo de equipamentos.`
    );
  }

  return {
    // Com o pool vazio o sorteio devolveria `undefined`; cai para o próprio
    // rótulo, que os consumidores já sabem tratar como item de texto livre.
    equipment: validOptions.length
      ? getRandomItemFromArray(validOptions)
      : label,
    description: label,
    qtd,
    choice: { key, label, options: validOptions },
  };
}

export default itemChoice;
