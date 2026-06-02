import { Atributo } from '@/data/systems/tormenta20/atributos';
import { getModValue } from './general';
import { rollDice } from './randomUtils';

// Quantidade de atributos do sistema (Força, Destreza, Constituição, Inteligência,
// Sabedoria, Carisma)
const ATTRIBUTE_COUNT = Object.values(Atributo).length;

// Soma mínima de modificadores exigida pela regra do livro para o método de dados
const MIN_MODIFIER_SUM = 6;

/**
 * Rola atributos pelo método de dados do livro (Tabela 1-1):
 * - Rola 4d6 descartando o menor, uma vez por atributo.
 * - Converte cada valor bruto em modificador pela tabela de atributos.
 * - Se a soma dos modificadores for menor que 6, rola novamente o menor valor
 *   e repete até a soma ser >= 6.
 *
 * Diferente de `rollAttributeValues` em general.ts, NÃO aplica piso de 8 por dado
 * (aquele é específico da geração aleatória de fichas).
 *
 * @returns Os 6 modificadores resultantes (não os valores brutos).
 */
export function rollAttributePool(): number[] {
  const rolledValues = Array.from({ length: ATTRIBUTE_COUNT }, () =>
    rollDice(4, 6, 1)
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const modifiers = rolledValues.map((value) => getModValue(value));
    const modSum = modifiers.reduce((acc, curr) => acc + curr, 0);
    if (modSum >= MIN_MODIFIER_SUM) {
      return modifiers;
    }

    rolledValues.sort((a, b) => a - b);
    rolledValues.shift();
    rolledValues.push(rollDice(4, 6, 1));
  }
}

// Configuração do método de compra de pontos (livro: 10 pontos, atributos de -1 a +4)
export const POINT_BUY_BUDGET = 10;
export const POINT_BUY_MIN = -1;
export const POINT_BUY_MAX = 4;

// Custo total (em pontos) de um atributo conforme o valor final do modificador.
// Reduzir um atributo para -1 devolve 1 ponto.
const POINT_BUY_COSTS: Record<number, number> = {
  [-1]: -1,
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 7,
};

export function getPointBuyCost(modValue: number): number {
  return POINT_BUY_COSTS[modValue] ?? 0;
}

/**
 * Calcula quantos pontos ainda restam dado o conjunto atual de modificadores base.
 */
export function getRemainingPoints(
  baseAttributes: Record<Atributo, number>
): number {
  const spent = Object.values(baseAttributes).reduce(
    (acc, value) => acc + getPointBuyCost(value),
    0
  );
  return POINT_BUY_BUDGET - spent;
}
