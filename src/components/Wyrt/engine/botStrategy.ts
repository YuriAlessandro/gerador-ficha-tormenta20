import { WyrtGameState, WyrtPlayer, WyrtActionType, WyrtCard } from './types';
import { getAvailableActions, canDiscardCard } from './validation';

interface BotDecision {
  action: WyrtActionType;
  cardId?: string;
}

function getHandStrength(
  player: WyrtPlayer,
  foxNumber: number,
  foxBlackDiscarded: boolean,
  foxRedDiscarded: boolean
): { redSum: number; blackSum: number; bestDistance: number } {
  const validCards = player.hand.filter(
    (card) =>
      card.type !== 'fox' &&
      card.value !== null &&
      !(card.color === 'red' && foxRedDiscarded) &&
      !(card.color === 'black' && foxBlackDiscarded)
  );

  const redSum = validCards
    .filter((card) => card.color === 'red')
    .reduce((sum, card) => sum + (card.value ?? 0), 0);

  const blackSum = validCards
    .filter((card) => card.color === 'black')
    .reduce((sum, card) => sum + (card.value ?? 0), 0);

  const redDist = redSum > 0 ? Math.abs(redSum - foxNumber) : Infinity;
  const blackDist = blackSum > 0 ? Math.abs(blackSum - foxNumber) : Infinity;
  const bestDistance = Math.min(redDist, blackDist);

  return { redSum, blackSum, bestDistance };
}

function findWorstCard(
  player: WyrtPlayer,
  foxNumber: number,
  foxBlackDiscarded: boolean,
  foxRedDiscarded: boolean,
  state: WyrtGameState
): WyrtCard | null {
  const discardable = player.hand.filter((card) =>
    canDiscardCard(state, player.id, card.id)
  );

  if (discardable.length === 0) return null;

  // Check if we have a fox card that would hurt opponents
  const foxCards = discardable.filter((c) => c.type === 'fox');
  if (foxCards.length > 0) {
    const strategicFox = foxCards.find((fox) => {
      // Count how many of our own valid cards are this color
      const ownCardsOfColor = player.hand.filter(
        (c) => c.type === 'number' && c.color === fox.color
      ).length;
      // If we have few or no cards of this color, discarding the fox hurts others more
      return ownCardsOfColor <= 1;
    });

    if (strategicFox) {
      return strategicFox;
    }
  }

  // Otherwise, find the card that contributes least to our best sum
  const strength = getHandStrength(
    player,
    foxNumber,
    foxBlackDiscarded,
    foxRedDiscarded
  );

  let bestColor: string;
  if (strength.redSum > 0 && strength.blackSum > 0) {
    if (
      Math.abs(strength.redSum - foxNumber) <=
      Math.abs(strength.blackSum - foxNumber)
    ) {
      bestColor = 'red';
    } else {
      bestColor = 'black';
    }
  } else if (strength.redSum > 0) {
    bestColor = 'red';
  } else {
    bestColor = 'black';
  }

  // Discard from the non-best color if possible
  const nonBestCards = discardable.filter(
    (c) => c.type === 'number' && c.color !== bestColor
  );

  if (nonBestCards.length > 0) {
    // Discard the card that makes the non-best sum furthest from fox number
    return nonBestCards.sort((a, b) => {
      const aVal = a.value ?? 0;
      const bVal = b.value ?? 0;
      // Prefer to discard the one that's least useful
      return bVal - aVal;
    })[0];
  }

  return null;
}

function decideBotDoubleResponse(
  state: WyrtGameState,
  bot: WyrtPlayer
): BotDecision {
  const { foxNumber } = state;
  const { bestDistance } = getHandStrength(
    bot,
    foxNumber,
    state.foxBlackDiscarded,
    state.foxRedDiscarded
  );

  const additionalCost = state.currentBetAmount;

  // Can't afford it
  if (bot.money <= 0 || bot.money < additionalCost) {
    return { action: 'REJECT_DOUBLE' };
  }

  // Good hand? Accept
  if (bestDistance <= 3) {
    return { action: 'ACCEPT_DOUBLE' };
  }

  // Moderate hand with enough money? Sometimes accept
  if (bestDistance <= 6 && bot.money > additionalCost * 3) {
    if (Math.random() < 0.4) {
      return { action: 'ACCEPT_DOUBLE' };
    }
  }

  // Weak hand or low money
  if (Math.random() < 0.15) {
    // Occasional call-bluff
    return { action: 'ACCEPT_DOUBLE' };
  }

  return { action: 'REJECT_DOUBLE' };
}

export function decideBotAction(
  state: WyrtGameState,
  botId: string
): BotDecision | null {
  const bot = state.players.find((p) => p.id === botId);
  if (!bot || bot.status !== 'active') return null;

  const available = getAvailableActions(state, botId);
  if (available.length === 0) return null;

  // First roll phase: must roll
  if (state.phase === 'firstRoll' && available.includes('ROLL_DIE')) {
    return { action: 'ROLL_DIE' };
  }

  // Doubling response
  if (state.phase === 'doubling') {
    if (available.includes('ACCEPT_DOUBLE')) {
      return decideBotDoubleResponse(state, bot);
    }
    return null;
  }

  const { foxNumber } = state;
  const { bestDistance } = getHandStrength(
    bot,
    foxNumber,
    state.foxBlackDiscarded,
    state.foxRedDiscarded
  );

  // If fox number is 0 (no dice rolled yet), prefer to roll
  if (foxNumber === 0 && available.includes('ROLL_DIE')) {
    return { action: 'ROLL_DIE' };
  }

  // Strong hand and in good position? Consider doubling
  if (
    available.includes('DOUBLE_BET') &&
    bestDistance <= 2 &&
    bot.money >= state.currentBetAmount * 2
  ) {
    // ~40% chance to double with a strong hand
    if (Math.random() < 0.4) {
      return { action: 'DOUBLE_BET' };
    }
  }

  // Bluff double (~8% chance with any hand)
  if (
    available.includes('DOUBLE_BET') &&
    bot.money >= state.currentBetAmount * 2 &&
    Math.random() < 0.08
  ) {
    return { action: 'DOUBLE_BET' };
  }

  // If hand is good and close to fox number, consider MOSTREM
  if (available.includes('CALL_MOSTREM') && bestDistance <= 1) {
    if (Math.random() < 0.6) {
      return { action: 'CALL_MOSTREM' };
    }
  }

  // Consider eliminating die to lock in a good fox number
  if (
    available.includes('ELIMINATE_DIE') &&
    bestDistance <= 2 &&
    foxNumber > 0
  ) {
    if (Math.random() < 0.35) {
      return { action: 'ELIMINATE_DIE' };
    }
  }

  // Consider discarding a card
  if (available.includes('DISCARD_CARD')) {
    const worstCard = findWorstCard(
      bot,
      foxNumber,
      state.foxBlackDiscarded,
      state.foxRedDiscarded,
      state
    );

    if (worstCard) {
      // Higher chance to discard fox cards (strategic)
      const discardChance = worstCard.type === 'fox' ? 0.5 : 0.25;
      if (Math.random() < discardChance) {
        return { action: 'DISCARD_CARD', cardId: worstCard.id };
      }
    }
  }

  // Default: roll die if available
  if (available.includes('ROLL_DIE')) {
    return { action: 'ROLL_DIE' };
  }

  // If die is gone but can't MOSTREM, try to discard or eliminate
  if (available.includes('ELIMINATE_DIE')) {
    return { action: 'ELIMINATE_DIE' };
  }

  if (available.includes('CALL_MOSTREM')) {
    return { action: 'CALL_MOSTREM' };
  }

  // Last resort: discard anything available
  if (available.includes('DISCARD_CARD')) {
    const discardableCards = bot.hand.filter((c) =>
      canDiscardCard(state, botId, c.id)
    );
    if (discardableCards.length > 0) {
      return { action: 'DISCARD_CARD', cardId: discardableCards[0].id };
    }
  }

  return null;
}
