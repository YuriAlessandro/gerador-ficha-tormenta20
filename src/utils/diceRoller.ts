import { DiceRoll, RollResult } from '@/interfaces/DiceRoll';

/**
 * Parse a dice string like "3d6+2" or "1d20-1"
 * Returns: { count: 3, sides: 6, modifier: 2 }
 */
export function parseDiceString(dice: string): {
  count: number;
  sides: number;
  modifier: number;
} | null {
  // Regex: XdY or XdY+Z or XdY-Z
  const regex = /^(\d+)d(\d+)([+-]\d+)?$/i;
  const match = dice.trim().match(regex);

  if (!match) {
    return null;
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  return { count, sides, modifier };
}

/**
 * Roll a single die with N sides
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice and return individual results
 */
export function rollDice(count: number, sides: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i += 1) {
    rolls.push(rollDie(sides));
  }
  return rolls;
}

/**
 * Execute a dice roll from a DiceRoll object
 * Returns a RollResult with individual rolls and total
 */
export function executeDiceRoll(diceRoll: DiceRoll): RollResult | null {
  const parsed = parseDiceString(diceRoll.dice);

  if (!parsed) {
    return null;
  }

  const { count, sides, modifier } = parsed;
  const rolls = rollDice(count, sides);
  const rollSum = rolls.reduce((sum, roll) => sum + roll, 0);
  const total = rollSum + modifier;

  return {
    rollId: diceRoll.id,
    label: diceRoll.label,
    dice: diceRoll.dice,
    rolls,
    modifier,
    total,
  };
}

/**
 * Execute multiple dice rolls
 * Returns an array of RollResults
 */
export function executeMultipleDiceRolls(diceRolls: DiceRoll[]): RollResult[] {
  return diceRolls
    .map((roll) => executeDiceRoll(roll))
    .filter((result): result is RollResult => result !== null);
}

/**
 * Validate a dice string format
 */
export function isValidDiceString(dice: string): boolean {
  return parseDiceString(dice) !== null;
}

/**
 * Format a RollResult for display
 * Example: "3d6+2: [4, 5, 3] +2 = 14"
 */
export function formatRollResult(result: RollResult): string {
  const rollsStr = `[${result.rolls.join(', ')}]`;
  const modStr =
    result.modifier !== 0
      ? ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`
      : '';
  return `${result.dice}: ${rollsStr}${modStr} = ${result.total}`;
}
