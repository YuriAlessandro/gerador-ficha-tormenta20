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
  for (let i = 0; i < count; i += 1) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

/**
 * Parseia string de dano do tipo "1d8+2", "2d6+5", "1d10", "1d8+2+3"
 * @param damageString String no formato NdM+X ou NdM (suporta múltiplos modificadores)
 * @returns Objeto com informações do dado e modificador total
 */
export function parseDamage(damageString: string): {
  diceCount: number;
  diceSides: number;
  modifier: number;
  diceString: string;
} | null {
  // Remove espaços
  const cleaned = damageString.trim();

  // Regex para capturar NdM seguido de múltiplos modificadores (+X-Y+Z...)
  const match = cleaned.match(/^(\d+)d(\d+)((?:[+-]\d+)*)$/i);

  if (!match) {
    return null;
  }

  const diceCount = parseInt(match[1], 10);
  const diceSides = parseInt(match[2], 10);

  // Soma todos os modificadores (ex: "+2+3-1" → ["+2", "+3", "-1"] → 4)
  let modifier = 0;
  if (match[3]) {
    const modifiers = match[3].match(/[+-]\d+/g);
    if (modifiers) {
      modifier = modifiers.reduce((sum, mod) => sum + parseInt(mod, 10), 0);
    }
  }

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

/**
 * Parseia string de crítico de uma arma
 * Formatos suportados:
 * - 'x2', 'x3', 'x4' - apenas multiplicador (threshold 20)
 * - '19', '18', '17' - apenas threshold (multiplicador x2)
 * - '19/x3', '18/x4' - threshold/multiplicador
 * - '-', '**' - sem crítico (threshold 21 = impossível)
 * @param criticalString String no formato do crítico da arma
 * @returns { threshold, multiplier }
 */
export function parseCritical(criticalString: string): {
  threshold: number;
  multiplier: number;
} {
  const defaultResult = { threshold: 20, multiplier: 2 };

  if (!criticalString || criticalString === '-' || criticalString === '**') {
    return { threshold: 21, multiplier: 2 }; // Impossível acertar crítico
  }

  const cleaned = criticalString.trim().toLowerCase();

  // Formato completo: "19/x3"
  const fullMatch = cleaned.match(/^(\d+)\/x(\d+)$/);
  if (fullMatch) {
    return {
      threshold: parseInt(fullMatch[1], 10),
      multiplier: parseInt(fullMatch[2], 10),
    };
  }

  // Apenas multiplicador: "x3"
  const multiplierMatch = cleaned.match(/^x(\d+)$/);
  if (multiplierMatch) {
    return {
      threshold: 20,
      multiplier: parseInt(multiplierMatch[1], 10),
    };
  }

  // Apenas threshold: "19"
  const thresholdMatch = cleaned.match(/^(\d+)$/);
  if (thresholdMatch) {
    return {
      threshold: parseInt(thresholdMatch[1], 10),
      multiplier: 2,
    };
  }

  return defaultResult;
}

/**
 * Verifica se uma string de dano contém notação de modo duplo (ex: "1d10/1d12")
 * Usado para armas que possuem mais de um tipo de ataque.
 * @param dano String de dano bruta da arma
 * @returns Objeto com as opções de dano e se são iguais, ou null se não for modo duplo
 */
export function parseDualModeDamage(dano: string): {
  options: string[];
  isSameDamage: boolean;
} | null {
  if (!dano || !dano.includes('/')) return null;

  const parts = dano.split('/').map((p) => p.trim());
  if (parts.length < 2) return null;

  const allValid = parts.every((part) => parseDamage(part) !== null);
  if (!allValid) return null;

  const isSameDamage = parts.every((part) => part === parts[0]);

  return { options: parts, isSameDamage };
}
