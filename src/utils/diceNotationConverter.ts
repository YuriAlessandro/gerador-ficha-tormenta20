import { RollGroup } from '../premium/services/socket.service';

/**
 * Convert RollGroups to DiceBox notation
 * DiceBox accepts: "2d6", "1d20+1d6", etc.
 *
 * We aggregate dice by type from all groups to create a combined notation
 * for the 3D visualization.
 *
 * @example
 * // Input: [{diceNotation: "2d6+3"}, {diceNotation: "1d20+5"}]
 * // Output: "2d6+1d20"
 */
export function rollGroupsToDiceNotation(rollGroups: RollGroup[]): string {
  const diceMap: Record<string, number> = {};

  rollGroups.forEach((group) => {
    // Parse notation like "2d6", "1d20", "3d8+5", "2d6-2"
    // We only care about the dice, not the modifier
    const diceRegex = /(\d+)d(\d+)/gi;
    const matches = Array.from(group.diceNotation.matchAll(diceRegex));

    matches.forEach((match) => {
      const count = parseInt(match[1], 10);
      const sides = match[2];
      const key = `d${sides}`;
      diceMap[key] = (diceMap[key] || 0) + count;
    });
  });

  // Build notation string: "2d20+3d6+1d8"
  // Sort by die size (d20 first, then d12, d10, etc.)
  const sortedEntries = Object.entries(diceMap).sort((a, b) => {
    const sidesA = parseInt(a[0].substring(1), 10);
    const sidesB = parseInt(b[0].substring(1), 10);
    return sidesB - sidesA;
  });

  return sortedEntries.map(([die, count]) => `${count}${die}`).join('+');
}

/**
 * Parse a dice notation string and return individual dice
 *
 * @example
 * // Input: "2d6+1d20"
 * // Output: [{count: 2, sides: 6}, {count: 1, sides: 20}]
 */
export function parseDiceNotation(
  notation: string
): Array<{ count: number; sides: number }> {
  const diceRegex = /(\d+)d(\d+)/gi;
  const matches = Array.from(notation.matchAll(diceRegex));

  return matches.map((match) => ({
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
  }));
}

/**
 * Get total number of dice to be rolled
 */
export function getTotalDiceCount(rollGroups: RollGroup[]): number {
  let total = 0;

  rollGroups.forEach((group) => {
    const diceRegex = /(\d+)d(\d+)/gi;
    const matches = Array.from(group.diceNotation.matchAll(diceRegex));

    matches.forEach((match) => {
      total += parseInt(match[1], 10);
    });
  });

  return total;
}
