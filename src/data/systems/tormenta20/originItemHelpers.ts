import Equipment from '../../../interfaces/Equipment';
import { Items } from '../../../interfaces/Origin';
import { getRandomItemFromArray } from '../../../functions/randomUtils';

/**
 * Aplica um material especial (ex.: "madeira Tollon") a um item, no mesmo
 * formato que o editor de itens grava (`AppliedModification`). O efeito
 * numérico é resolvido depois, pelo pipeline de `applyItemEnhancements`
 * (`src/functions/itemEnhancements/`), a partir do registro em
 * `specialMaterials.ts` — aqui só anota qual material foi escolhido.
 */
export function applySpecialMaterial(
  equipment: Equipment | string,
  specialMaterial: string | undefined
): Equipment | string {
  if (!specialMaterial || typeof equipment === 'string') return equipment;
  return {
    ...equipment,
    modifications: [
      ...(equipment.modifications || []),
      { mod: 'Material especial', specialMaterial },
    ],
  };
}

/**
 * Aplica uma melhoria comum (ex.: "Certeira") a um item, no mesmo formato que
 * o editor de itens grava. Diferente de `applySpecialMaterial`: o efeito é
 * resolvido por `modificationEffects`/`TEXT_ONLY_MODIFICATIONS`, não por um
 * material.
 */
export function applyModification(
  equipment: Equipment | string,
  modification: string | undefined
): Equipment | string {
  if (!modification || typeof equipment === 'string') return equipment;
  return {
    ...equipment,
    modifications: [...(equipment.modifications || []), { mod: modification }],
  };
}

export interface ItemChoiceOptions {
  qtd?: number;
  /** Material especial aplicado automaticamente ao item escolhido. */
  specialMaterial?: string;
  /** Melhoria comum aplicada automaticamente ao item escolhido. */
  modification?: string;
}

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
  // Aceita o `qtd` legado (usado por dezenas de origens já existentes) e o
  // objeto de opções novo, com material especial e/ou melhoria.
  qtdOrOpts?: number | ItemChoiceOptions
): Items {
  const opts: ItemChoiceOptions =
    typeof qtdOrOpts === 'number' ? { qtd: qtdOrOpts } : qtdOrOpts || {};

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

  // Com o pool vazio o sorteio devolveria `undefined`; cai para o próprio
  // rótulo, que os consumidores já sabem tratar como item de texto livre.
  const fallback = validOptions.length
    ? getRandomItemFromArray(validOptions)
    : label;

  const withExtras = (equipment: Equipment | string): Equipment | string =>
    applyModification(
      applySpecialMaterial(equipment, opts?.specialMaterial),
      opts?.modification
    );

  return {
    equipment: withExtras(fallback),
    description: label,
    qtd: opts?.qtd,
    choice: {
      key,
      label,
      options: validOptions,
      specialMaterial: opts?.specialMaterial,
      modification: opts?.modification,
    },
  };
}

export default itemChoice;
