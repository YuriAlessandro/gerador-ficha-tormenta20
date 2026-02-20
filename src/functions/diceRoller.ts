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
 * Parseia string de dano com suporte a múltiplos grupos de dados
 * Formatos: "1d8", "2d6+5", "1d8+1d6", "1d8+1d6+3", "2d6+1d8+5"
 * @param damageString String no formato NdM ou NdM+NdM+X (suporta múltiplos grupos de dados e modificadores)
 * @returns Objeto com grupos de dados, modificador total e string de exibição
 */
export function parseDamage(damageString: string): {
  diceGroups: Array<{ count: number; sides: number }>;
  modifier: number;
  diceString: string;
} | null {
  const cleaned = damageString.trim();
  if (!cleaned) return null;

  // Separa em tokens preservando sinais (+/-)
  // Ex: "1d8+1d6+3-1" → ["1d8", "+1d6", "+3", "-1"]
  const tokens = cleaned.match(/[+-]?[^+-]+/g);
  if (!tokens) return null;

  const diceRegex = /^\+?(\d+)d(\d+)$/i;
  const numRegex = /^[+-]?\d+$/;

  const hasInvalidToken = tokens.some((token) => {
    const trimmed = token.trim();
    return !diceRegex.test(trimmed) && !numRegex.test(trimmed);
  });
  if (hasInvalidToken) return null;

  const diceGroups = tokens.reduce<Array<{ count: number; sides: number }>>(
    (groups, token) => {
      const diceMatch = token.trim().match(diceRegex);
      if (diceMatch) {
        const count = parseInt(diceMatch[1], 10);
        const sides = parseInt(diceMatch[2], 10);
        if (count > 0 && sides > 0) {
          groups.push({ count, sides });
        }
      }
      return groups;
    },
    []
  );

  if (diceGroups.length === 0) return null;

  const modifier = tokens.reduce((sum, token) => {
    const trimmed = token.trim();
    if (numRegex.test(trimmed)) {
      return sum + parseInt(trimmed, 10);
    }
    return sum;
  }, 0);

  const diceString = diceGroups.map((g) => `${g.count}d${g.sides}`).join('+');

  return {
    diceGroups,
    modifier,
    diceString,
  };
}

/**
 * Rola dano baseado em uma string de dano com suporte a múltiplos dados
 * @param damageString String no formato "1d8+2", "2d6+5", "1d8+1d6+3", etc
 * @returns Objeto com os rolls individuais de todos os dados, modificador e total
 */
export function rollDamage(damageString: string): DamageRoll | null {
  const parsed = parseDamage(damageString);

  if (!parsed) {
    return null;
  }

  const { diceGroups, modifier, diceString } = parsed;
  const allRolls = diceGroups.flatMap((group) =>
    rollDice(group.sides, group.count)
  );

  const diceTotal = allRolls.reduce((sum, roll) => sum + roll, 0);
  const total = diceTotal + modifier;

  return {
    diceRolls: allRolls,
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
