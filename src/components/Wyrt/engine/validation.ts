import { WyrtGameState, WyrtActionType, WyrtPlayer } from './types';
import { MAX_DISCARDS } from './constants';

function getPlayer(
  state: WyrtGameState,
  playerId: string
): WyrtPlayer | undefined {
  return state.players.find((p) => p.id === playerId);
}

export function canRollDie(state: WyrtGameState, playerId: string): boolean {
  const player = getPlayer(state, playerId);
  if (!player || player.status !== 'active') return false;
  if (player.die.rolled || player.die.eliminated) return false;
  return state.phase === 'firstRoll' || state.phase === 'playing';
}

export function canDoubleBet(state: WyrtGameState, playerId: string): boolean {
  const player = getPlayer(state, playerId);
  if (!player || player.status !== 'active') return false;
  if (state.phase !== 'playing') return false;
  if (player.money <= 0) return false;
  if (player.money < state.currentBetAmount) return false;
  return true;
}

export function canDiscardCard(
  state: WyrtGameState,
  playerId: string,
  cardId: string
): boolean {
  const player = getPlayer(state, playerId);
  if (!player || player.status !== 'active') return false;
  if (state.phase !== 'playing') return false;
  if (player.discardsUsed >= MAX_DISCARDS) return false;

  const card = player.hand.find((c) => c.id === cardId);
  if (!card) return false;

  if (card.type === 'fox') {
    if (state.foxBlackDiscarded || state.foxRedDiscarded) return false;
  }

  return true;
}

export function canEliminateDie(
  state: WyrtGameState,
  playerId: string
): boolean {
  const player = getPlayer(state, playerId);
  if (!player || player.status !== 'active') return false;
  if (state.phase !== 'playing') return false;
  if (player.die.rolled || player.die.eliminated) return false;
  return true;
}

export function canCallMostrem(
  state: WyrtGameState,
  playerId: string
): boolean {
  const player = getPlayer(state, playerId);
  if (!player || player.status !== 'active') return false;
  if (state.phase !== 'playing') return false;
  if (!player.die.rolled && !player.die.eliminated) return false;
  return true;
}

export function getAvailableActions(
  state: WyrtGameState,
  playerId: string
): WyrtActionType[] {
  const actions: WyrtActionType[] = [];
  const player = getPlayer(state, playerId);
  if (!player || player.status !== 'active') return actions;

  if (state.phase === 'firstRoll') {
    if (canRollDie(state, playerId)) {
      actions.push('ROLL_DIE');
    }
    return actions;
  }

  if (state.phase === 'doubling') {
    if (
      state.doublingPlayerId !== playerId &&
      state.players[state.doublingResponseIndex]?.id === playerId
    ) {
      actions.push('ACCEPT_DOUBLE');
      actions.push('REJECT_DOUBLE');
    }
    return actions;
  }

  if (state.phase !== 'playing') return actions;

  if (canRollDie(state, playerId)) actions.push('ROLL_DIE');
  if (canDoubleBet(state, playerId)) actions.push('DOUBLE_BET');

  const hasDiscardableCard = player.hand.some((card) =>
    canDiscardCard(state, playerId, card.id)
  );
  if (hasDiscardableCard) actions.push('DISCARD_CARD');

  if (canEliminateDie(state, playerId)) actions.push('ELIMINATE_DIE');
  if (canCallMostrem(state, playerId)) actions.push('CALL_MOSTREM');

  return actions;
}
