import { WyrtGameState, WyrtPlayer, PlayerScore, RoundResult } from './types';

function getValidCardValues(
  player: WyrtPlayer,
  foxBlackDiscarded: boolean,
  foxRedDiscarded: boolean
): { redValues: number[]; blackValues: number[] } {
  const validCards = player.hand.filter(
    (card) =>
      card.type !== 'fox' &&
      !(card.color === 'red' && foxRedDiscarded) &&
      !(card.color === 'black' && foxBlackDiscarded) &&
      card.value !== null
  );

  const redValues = validCards
    .filter((card) => card.color === 'red')
    .map((card) => card.value as number);

  const blackValues = validCards
    .filter((card) => card.color === 'black')
    .map((card) => card.value as number);

  return { redValues, blackValues };
}

const getAllCardValues = (player: WyrtPlayer): number[] =>
  player.hand
    .filter((c) => c.type === 'number' && c.value !== null)
    .map((c) => c.value as number)
    .sort((a, b) => b - a);

export function calculatePlayerScore(
  player: WyrtPlayer,
  foxNumber: number,
  foxBlackDiscarded: boolean,
  foxRedDiscarded: boolean
): PlayerScore {
  const { redValues, blackValues } = getValidCardValues(
    player,
    foxBlackDiscarded,
    foxRedDiscarded
  );

  const redSum = redValues.reduce((sum, v) => sum + v, 0);
  const blackSum = blackValues.reduce((sum, v) => sum + v, 0);

  const redDistance =
    redValues.length > 0 ? Math.abs(redSum - foxNumber) : Infinity;
  const blackDistance =
    blackValues.length > 0 ? Math.abs(blackSum - foxNumber) : Infinity;

  const isDoubleHit =
    redValues.length > 0 &&
    blackValues.length > 0 &&
    redSum === foxNumber &&
    blackSum === foxNumber;

  let bestDistance: number;
  let bestColor: 'red' | 'black' | 'both';

  if (isDoubleHit) {
    bestDistance = 0;
    bestColor = 'both';
  } else if (redDistance <= blackDistance) {
    bestDistance = redDistance;
    bestColor = 'red';
  } else {
    bestDistance = blackDistance;
    bestColor = 'black';
  }

  const allValues = getAllCardValues(player);
  const highestCard = allValues[0] ?? 0;
  const secondHighestCard = allValues[1] ?? 0;

  return {
    playerId: player.id,
    redSum,
    blackSum,
    bestDistance,
    bestColor,
    isDoubleHit,
    highestCard,
    secondHighestCard,
  };
}

export function determineWinner(
  scores: PlayerScore[]
): { winnerId: string; isDoubleHit: boolean } | null {
  if (scores.length === 0) return null;

  const doubleHitters = scores.filter((s) => s.isDoubleHit);
  if (doubleHitters.length > 0) {
    const winner = doubleHitters.sort((a, b) => {
      if (a.highestCard !== b.highestCard) return b.highestCard - a.highestCard;
      return b.secondHighestCard - a.secondHighestCard;
    })[0];
    return { winnerId: winner.playerId, isDoubleHit: true };
  }

  const sorted = [...scores].sort((a, b) => {
    if (a.bestDistance !== b.bestDistance)
      return a.bestDistance - b.bestDistance;
    if (a.highestCard !== b.highestCard) return b.highestCard - a.highestCard;
    return b.secondHighestCard - a.secondHighestCard;
  });

  return { winnerId: sorted[0].playerId, isDoubleHit: false };
}

export function scoreRound(state: WyrtGameState): RoundResult {
  const activePlayers = state.players.filter((p) => p.status === 'active');

  const scores = activePlayers.map((p) =>
    calculatePlayerScore(
      p,
      state.foxNumber,
      state.foxBlackDiscarded,
      state.foxRedDiscarded
    )
  );

  const result = determineWinner(scores);

  if (!result) {
    return {
      scores,
      winnerId: activePlayers[0]?.id ?? '',
      foxNumber: state.foxNumber,
      isDoubleHit: false,
      winnings: state.pot,
    };
  }

  let winnings = state.pot;
  if (result.isDoubleHit) {
    const otherPlayers = activePlayers.filter((p) => p.id !== result.winnerId);
    winnings += otherPlayers.length * state.currentBetAmount;
  }

  return {
    scores,
    winnerId: result.winnerId,
    foxNumber: state.foxNumber,
    isDoubleHit: result.isDoubleHit,
    winnings,
  };
}
