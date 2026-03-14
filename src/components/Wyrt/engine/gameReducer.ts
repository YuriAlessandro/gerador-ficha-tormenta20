import { v4 as uuid } from 'uuid';
import {
  WyrtGameState,
  WyrtReducerAction,
  WyrtPlayer,
  GameLogEntry,
  WyrtActionType,
} from './types';
import { CARDS_PER_PLAYER, DEFAULT_ANTE } from './constants';
import { scoreRound } from './scoring';

function createLogEntry(
  playerId: string,
  action: WyrtActionType,
  details: string,
  extra?: { cardId?: string; dieValue?: number }
): GameLogEntry {
  return {
    id: uuid(),
    timestamp: Date.now(),
    playerId,
    action,
    details,
    ...extra,
  };
}

function getPlayerName(state: WyrtGameState, playerId: string): string {
  return state.players.find((p) => p.id === playerId)?.name ?? 'Desconhecido';
}

function findNextActivePlayerIndex(
  players: WyrtPlayer[],
  fromIndex: number
): number {
  const count = players.length;
  for (let i = 1; i <= count; i += 1) {
    const idx = (fromIndex + i) % count;
    if (players[idx].status === 'active') return idx;
  }
  return fromIndex;
}

function hasActiveDice(state: WyrtGameState): boolean {
  return state.players.some(
    (p) => p.status === 'active' && !p.die.rolled && !p.die.eliminated
  );
}

function advanceTurn(state: WyrtGameState): WyrtGameState {
  if (!hasActiveDice(state)) {
    return { ...state, phase: 'roundEnd' };
  }

  const nextIndex = findNextActivePlayerIndex(
    state.players,
    state.currentPlayerIndex
  );

  return { ...state, currentPlayerIndex: nextIndex };
}

function calculateAnte(players: WyrtPlayer[], unlimitedMoney: boolean): number {
  if (unlimitedMoney) return DEFAULT_ANTE;
  const activePlayers = players.filter((p) => p.status !== 'eliminated');
  const minMoney = Math.min(...activePlayers.map((p) => p.money));
  return Math.min(DEFAULT_ANTE, minMoney);
}

function findNextDoublingResponder(
  state: WyrtGameState,
  fromIndex: number
): number {
  const count = state.players.length;
  const doublerIndex = state.players.findIndex(
    (p) => p.id === state.doublingPlayerId
  );

  for (let i = 1; i < count; i += 1) {
    const idx = (fromIndex + i) % count;
    // If we reached the doubler, we've gone full circle — all have responded
    if (idx === doublerIndex) return -1;
    const player = state.players[idx];
    if (player.status === 'active') return idx;
  }
  return -1;
}

export const initialGameState: WyrtGameState = {
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  drawPile: [],
  foxBlackDiscarded: false,
  foxRedDiscarded: false,
  pot: 0,
  currentBetAmount: 0,
  foxNumber: 0,
  rolledDice: [],
  log: [],
  roundNumber: 0,
  firstPlayerIndex: 0,
  doublingPlayerId: null,
  doublingResponseIndex: 0,
  roundResults: null,
  unlimitedMoney: false,
};

export function wyrtReducer(
  state: WyrtGameState,
  action: WyrtReducerAction
): WyrtGameState {
  switch (action.type) {
    case 'START_GAME': {
      const unlimited = action.unlimitedMoney ?? false;
      const ante = calculateAnte(action.players, unlimited);
      const totalCards = CARDS_PER_PLAYER * action.players.length;
      const drawPile = action.deck.slice(totalCards);

      const players: WyrtPlayer[] = action.players.map((p, i) => ({
        ...p,
        hand: action.deck.slice(
          i * CARDS_PER_PLAYER,
          (i + 1) * CARDS_PER_PLAYER
        ),
        money: p.money - ante,
        currentBet: ante,
        discardedCards: [],
        discardsUsed: 0,
        die: { rolled: false, eliminated: false, value: null },
        status: 'active' as const,
      }));

      return {
        ...state,
        phase: 'firstRoll',
        players,
        drawPile,
        pot: ante * players.length,
        currentBetAmount: ante,
        foxNumber: 0,
        rolledDice: [],
        foxBlackDiscarded: false,
        foxRedDiscarded: false,
        currentPlayerIndex: state.firstPlayerIndex,
        roundNumber: state.roundNumber + 1,
        doublingPlayerId: null,
        doublingResponseIndex: 0,
        roundResults: null,
        unlimitedMoney: unlimited,
        log: [
          createLogEntry(
            'system',
            'ROLL_DIE',
            `Rodada ${
              state.roundNumber + 1
            } iniciada! Ante: T$ ${ante} por jogador.`
          ),
        ],
      };
    }

    case 'ROLL_DIE': {
      const name = getPlayerName(state, action.playerId);
      const newPlayers = state.players.map((p) =>
        p.id === action.playerId
          ? {
              ...p,
              die: { rolled: true, eliminated: false, value: action.dieValue },
            }
          : p
      );

      const newRolledDice = [
        ...state.rolledDice,
        { playerId: action.playerId, value: action.dieValue },
      ];
      const newFoxNumber = newRolledDice.reduce((sum, d) => sum + d.value, 0);

      const newLog = [
        ...state.log,
        createLogEntry(
          action.playerId,
          'ROLL_DIE',
          `${name} rolou o dado e tirou ${action.dieValue}! Número da Raposa: ${newFoxNumber}`,
          { dieValue: action.dieValue }
        ),
      ];

      const newState: WyrtGameState = {
        ...state,
        players: newPlayers,
        rolledDice: newRolledDice,
        foxNumber: newFoxNumber,
        log: newLog,
        phase: state.phase === 'firstRoll' ? 'playing' : state.phase,
      };

      return advanceTurn(newState);
    }

    case 'DOUBLE_BET': {
      const name = getPlayerName(state, action.playerId);
      const firstResponderIndex = findNextDoublingResponder(
        { ...state, doublingPlayerId: action.playerId },
        state.currentPlayerIndex
      );

      return {
        ...state,
        phase: 'doubling',
        doublingPlayerId: action.playerId,
        doublingResponseIndex: firstResponderIndex,
        log: [
          ...state.log,
          createLogEntry(
            action.playerId,
            'DOUBLE_BET',
            `${name} gritou DOBRO! Aposta atual: T$ ${
              state.currentBetAmount * 2
            }`
          ),
        ],
      };
    }

    case 'ACCEPT_DOUBLE': {
      const name = getPlayerName(state, action.playerId);
      const newBetAmount = state.currentBetAmount * 2;
      const additionalBet = newBetAmount - state.currentBetAmount;

      // Charge only the accepting player (doubler is charged once when all respond)
      const newPlayers = state.players.map((p) =>
        p.id === action.playerId
          ? {
              ...p,
              money: p.money - additionalBet,
              currentBet: p.currentBet + additionalBet,
            }
          : p
      );

      const nextResponder = findNextDoublingResponder(
        { ...state, players: newPlayers },
        state.doublingResponseIndex
      );

      const allResponded =
        nextResponder === -1 ||
        newPlayers[nextResponder]?.id === state.doublingPlayerId;

      const newLog = [
        ...state.log,
        createLogEntry(
          action.playerId,
          'ACCEPT_DOUBLE',
          `${name} aceitou o dobro! Pagou T$ ${additionalBet}.`
        ),
      ];

      if (allResponded) {
        // Now also charge the doubler
        const finalPlayers = newPlayers.map((p) =>
          p.id === state.doublingPlayerId
            ? {
                ...p,
                money: p.money - additionalBet,
                currentBet: p.currentBet + additionalBet,
              }
            : p
        );

        const updatedState: WyrtGameState = {
          ...state,
          players: finalPlayers,
          pot: state.pot + additionalBet * 2,
          currentBetAmount: newBetAmount,
          phase: 'playing',
          doublingPlayerId: null,
          doublingResponseIndex: 0,
          log: newLog,
        };
        return advanceTurn(updatedState);
      }

      return {
        ...state,
        players: newPlayers,
        pot: state.pot + additionalBet,
        doublingResponseIndex: nextResponder,
        log: newLog,
      };
    }

    case 'REJECT_DOUBLE': {
      const name = getPlayerName(state, action.playerId);

      const newPlayers = state.players.map((p) =>
        p.id === action.playerId
          ? {
              ...p,
              status: 'folded' as const,
              die: { ...p.die, eliminated: true },
            }
          : p
      );

      const activePlayers = newPlayers.filter((p) => p.status === 'active');

      if (activePlayers.length <= 1) {
        const winnerId = activePlayers[0]?.id ?? state.doublingPlayerId ?? '';
        const winnerName = getPlayerName(state, winnerId);

        return {
          ...state,
          players: newPlayers.map((p) =>
            p.id === winnerId ? { ...p, money: p.money + state.pot } : p
          ),
          phase: 'roundEnd',
          log: [
            ...state.log,
            createLogEntry(
              action.playerId,
              'REJECT_DOUBLE',
              `${name} saiu da rodada.`
            ),
            createLogEntry(
              winnerId,
              'DOUBLE_BET',
              `${winnerName} venceu a rodada sem oposição! Levou T$ ${state.pot}.`
            ),
          ],
          roundResults: {
            scores: [],
            winnerId,
            foxNumber: state.foxNumber,
            isDoubleHit: false,
            winnings: state.pot,
          },
        };
      }

      const nextResponder = findNextDoublingResponder(
        { ...state, players: newPlayers },
        state.doublingResponseIndex
      );

      const allResponded =
        nextResponder === -1 ||
        newPlayers[nextResponder]?.id === state.doublingPlayerId;

      const newLog = [
        ...state.log,
        createLogEntry(
          action.playerId,
          'REJECT_DOUBLE',
          `${name} saiu da rodada.`
        ),
      ];

      if (allResponded) {
        const additionalBet = state.currentBetAmount;
        const doublerUpdated = newPlayers.map((p) =>
          p.id === state.doublingPlayerId
            ? {
                ...p,
                money: p.money - additionalBet,
                currentBet: p.currentBet + additionalBet,
              }
            : p
        );

        const updatedState: WyrtGameState = {
          ...state,
          players: doublerUpdated,
          pot: state.pot + additionalBet,
          currentBetAmount: state.currentBetAmount * 2,
          phase: 'playing',
          doublingPlayerId: null,
          doublingResponseIndex: 0,
          log: newLog,
        };
        return advanceTurn(updatedState);
      }

      return {
        ...state,
        players: newPlayers,
        doublingResponseIndex: nextResponder,
        log: newLog,
      };
    }

    case 'DISCARD_CARD': {
      const name = getPlayerName(state, action.playerId);
      const player = state.players.find((p) => p.id === action.playerId);
      const card = player?.hand.find((c) => c.id === action.cardId);

      if (!card) return state;

      const isFox = card.type === 'fox';
      const foxColorMsg = isFox
        ? ` Todas as cartas ${
            card.color === 'black' ? 'pretas' : 'vermelhas'
          } estão fora do jogo!`
        : '';

      const newPlayers = state.players.map((p) =>
        p.id === action.playerId
          ? {
              ...p,
              hand: p.hand.filter((c) => c.id !== action.cardId),
              discardedCards: [...p.discardedCards, card],
              discardsUsed: p.discardsUsed + 1,
            }
          : p
      );

      const cardLabel =
        card.type === 'fox'
          ? `Raposa ${card.color === 'black' ? 'Preta' : 'Vermelha'}`
          : `${card.value} ${card.color === 'black' ? 'Preto' : 'Vermelho'}`;

      const newState: WyrtGameState = {
        ...state,
        players: newPlayers,
        foxBlackDiscarded:
          state.foxBlackDiscarded || (isFox && card.color === 'black'),
        foxRedDiscarded:
          state.foxRedDiscarded || (isFox && card.color === 'red'),
        log: [
          ...state.log,
          createLogEntry(
            action.playerId,
            'DISCARD_CARD',
            `${name} descartou ${cardLabel}.${foxColorMsg}`,
            { cardId: action.cardId }
          ),
        ],
      };

      return advanceTurn(newState);
    }

    case 'ELIMINATE_DIE': {
      const name = getPlayerName(state, action.playerId);

      const newPlayers = state.players.map((p) =>
        p.id === action.playerId
          ? {
              ...p,
              die: { ...p.die, eliminated: true },
            }
          : p
      );

      const newState: WyrtGameState = {
        ...state,
        players: newPlayers,
        log: [
          ...state.log,
          createLogEntry(
            action.playerId,
            'ELIMINATE_DIE',
            `${name} eliminou seu dado do jogo.`
          ),
        ],
      };

      if (
        !newPlayers.some(
          (p) => p.status === 'active' && !p.die.rolled && !p.die.eliminated
        )
      ) {
        return { ...newState, phase: 'roundEnd' };
      }

      return advanceTurn(newState);
    }

    case 'CALL_MOSTREM': {
      const name = getPlayerName(state, action.playerId);

      return {
        ...state,
        phase: 'roundEnd',
        log: [
          ...state.log,
          createLogEntry(
            action.playerId,
            'CALL_MOSTREM',
            `${name} gritou MOSTREM! A rodada acabou.`
          ),
        ],
      };
    }

    case 'SCORE_ROUND': {
      const results = scoreRound(state);
      const winnerName = getPlayerName(state, results.winnerId);

      const newPlayers = state.players.map((p) => {
        if (p.id === results.winnerId) {
          return { ...p, money: p.money + results.winnings };
        }
        if (
          results.isDoubleHit &&
          p.status === 'active' &&
          p.id !== results.winnerId
        ) {
          return { ...p, money: p.money - state.currentBetAmount };
        }
        return p;
      });

      const eliminatedPlayers = state.unlimitedMoney
        ? []
        : newPlayers.filter((p) => p.money <= 0 && p.status !== 'eliminated');

      const finalPlayers = state.unlimitedMoney
        ? newPlayers
        : newPlayers.map((p) =>
            p.money <= 0 ? { ...p, status: 'eliminated' as const } : p
          );

      const eliminationLogs = eliminatedPlayers.map((p) =>
        createLogEntry(
          p.id,
          'CALL_MOSTREM',
          `${p.name} ficou sem dinheiro e foi eliminado da mesa!`
        )
      );

      const doubleHitMsg = results.isDoubleHit
        ? ' ACERTO DUPLO! Todos pagam o dobro!'
        : '';

      return {
        ...state,
        players: finalPlayers,
        roundResults: results,
        log: [
          ...state.log,
          createLogEntry(
            results.winnerId,
            'CALL_MOSTREM',
            `${winnerName} venceu a rodada e levou T$ ${results.winnings}!${doubleHitMsg}`
          ),
          ...eliminationLogs,
        ],
      };
    }

    case 'NEXT_ROUND': {
      const activePlayers = state.players.filter(
        (p) => p.status !== 'eliminated'
      );

      if (!state.unlimitedMoney && activePlayers.length < 2) {
        return { ...state, phase: 'gameOver' };
      }

      const nextFirstPlayer =
        (state.firstPlayerIndex + 1) % state.players.length;
      let adjustedFirst = nextFirstPlayer;
      while (state.players[adjustedFirst]?.status === 'eliminated') {
        adjustedFirst = (adjustedFirst + 1) % state.players.length;
      }

      const resetPlayers = state.players.map((p) =>
        p.status === 'eliminated'
          ? p
          : {
              ...p,
              hand: [],
              discardedCards: [],
              die: { rolled: false, eliminated: false, value: null },
              currentBet: 0,
              discardsUsed: 0,
              status: 'active' as const,
            }
      );

      const ante = calculateAnte(resetPlayers, state.unlimitedMoney);
      const totalCards = CARDS_PER_PLAYER * activePlayers.length;
      const drawPile = action.deck.slice(totalCards);

      let activeIdx = 0;
      const dealtPlayers = resetPlayers.map((p) => {
        if (p.status === 'eliminated') return p;
        const hand = action.deck.slice(
          activeIdx * CARDS_PER_PLAYER,
          (activeIdx + 1) * CARDS_PER_PLAYER
        );
        activeIdx += 1;
        return {
          ...p,
          hand,
          money: p.money - ante,
          currentBet: ante,
        };
      });

      return {
        ...state,
        phase: 'firstRoll',
        players: dealtPlayers,
        drawPile,
        pot: ante * activePlayers.length,
        currentBetAmount: ante,
        foxNumber: 0,
        rolledDice: [],
        foxBlackDiscarded: false,
        foxRedDiscarded: false,
        currentPlayerIndex: adjustedFirst,
        firstPlayerIndex: adjustedFirst,
        roundNumber: state.roundNumber + 1,
        doublingPlayerId: null,
        doublingResponseIndex: 0,
        roundResults: null,
        log: [
          createLogEntry(
            'system',
            'ROLL_DIE',
            `Rodada ${
              state.roundNumber + 1
            } iniciada! Ante: T$ ${ante} por jogador.`
          ),
        ],
      };
    }

    case 'END_GAME': {
      return { ...state, phase: 'gameOver' };
    }

    default:
      return state;
  }
}
