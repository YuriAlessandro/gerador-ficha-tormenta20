/**
 * Utilitários para rolagem de dados
 * Suporta d20, dados múltiplos e parse de strings de dano
 */

export interface DiceRoll {
  rolls: number[];
  total: number;
}

export interface DamageRoll {
  diceRolls: number[];
  modifier: number;
  total: number;
  diceString: string;
}

/**
 * Rola um dado de 20 faces
 * @returns Número entre 1 e 20
 */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Rola múltiplos dados de N faces
 * @param sides Número de faces do dado
 * @param count Quantidade de dados a rolar
 * @returns Array com os resultados de cada dado
 */
export function rollDice(sides: number, count: number = 1): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

/**
 * Parseia string de dano do tipo "1d8+2", "2d6+5", "1d10"
 * @param damageString String no formato NdM+X ou NdM
 * @returns Objeto com informações do dado e modificador
 */
export function parseDamage(damageString: string): {
  diceCount: number;
  diceSides: number;
  modifier: number;
  diceString: string;
} | null {
  // Remove espaços
  const cleaned = damageString.trim();

  // Regex para capturar NdM+X ou NdM-X ou NdM
  const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    return null;
  }

  const diceCount = parseInt(match[1], 10);
  const diceSides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  return {
    diceCount,
    diceSides,
    modifier,
    diceString: `${diceCount}d${diceSides}`,
  };
}

/**
 * Rola dano baseado em uma string de dano
 * @param damageString String no formato "1d8+2", "2d6+5", etc
 * @returns Objeto com os rolls individuais, modificador e total
 */
export function rollDamage(damageString: string): DamageRoll | null {
  const parsed = parseDamage(damageString);

  if (!parsed) {
    return null;
  }

  const { diceCount, diceSides, modifier, diceString } = parsed;
  const diceRolls = rollDice(diceSides, diceCount);
  const diceTotal = diceRolls.reduce((sum, roll) => sum + roll, 0);
  const total = diceTotal + modifier;

  return {
    diceRolls,
    modifier,
    total,
    diceString,
  };
}

/**
 * Formata um array de rolls de dados para exibição
 * @param rolls Array de números dos dados
 * @returns String formatada como "[5, 3, 8]" ou "5"
 */
export function formatDiceRolls(rolls: number[]): string {
  if (rolls.length === 1) {
    return rolls[0].toString();
  }
  return `[${rolls.join(', ')}]`;
}

/**
 * Determina se uma rolagem de d20 é crítica (20) ou falha crítica (1)
 * @param roll Resultado do d20
 * @returns 'critical' | 'fumble' | 'normal'
 */
export function checkD20Result(roll: number): 'critical' | 'fumble' | 'normal' {
  if (roll === 20) return 'critical';
  if (roll === 1) return 'fumble';
  return 'normal';
}
