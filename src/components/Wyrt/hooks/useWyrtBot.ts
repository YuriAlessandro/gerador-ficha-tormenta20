import { useEffect, useRef } from 'react';
import { useWyrtContext } from '../WyrtProvider';
import { decideBotAction } from '../engine/botStrategy';
import {
  BOT_ACTION_DELAY_MIN,
  BOT_ACTION_DELAY_MAX,
} from '../engine/constants';

function randomDelay(): number {
  return (
    BOT_ACTION_DELAY_MIN +
    Math.random() * (BOT_ACTION_DELAY_MAX - BOT_ACTION_DELAY_MIN)
  );
}

export function useWyrtBot(enabled: boolean = true) {
  const { state, dispatch } = useWyrtContext();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const cleanup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    if (
      !enabled ||
      state.phase === 'setup' ||
      state.phase === 'gameOver' ||
      state.phase === 'roundEnd'
    ) {
      return cleanup;
    }

    // Determine which bot should act
    let botId: string | null = null;

    if (state.phase === 'doubling') {
      const responder = state.players[state.doublingResponseIndex];
      if (
        responder &&
        responder.type === 'bot' &&
        responder.status === 'active'
      ) {
        botId = responder.id;
      }
    } else {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (
        currentPlayer &&
        currentPlayer.type === 'bot' &&
        currentPlayer.status === 'active'
      ) {
        botId = currentPlayer.id;
      }
    }

    if (!botId) return cleanup;

    const decision = decideBotAction(state, botId);
    if (!decision) return cleanup;

    const delay = randomDelay();
    const capturedBotId = botId;

    timeoutRef.current = setTimeout(() => {
      switch (decision.action) {
        case 'ROLL_DIE': {
          const dieValue = Math.floor(Math.random() * 6) + 1;
          dispatch({
            type: 'ROLL_DIE',
            playerId: capturedBotId,
            dieValue,
          });
          break;
        }
        case 'DOUBLE_BET':
          dispatch({ type: 'DOUBLE_BET', playerId: capturedBotId });
          break;
        case 'ACCEPT_DOUBLE':
          dispatch({ type: 'ACCEPT_DOUBLE', playerId: capturedBotId });
          break;
        case 'REJECT_DOUBLE':
          dispatch({ type: 'REJECT_DOUBLE', playerId: capturedBotId });
          break;
        case 'DISCARD_CARD':
          if (decision.cardId) {
            dispatch({
              type: 'DISCARD_CARD',
              playerId: capturedBotId,
              cardId: decision.cardId,
            });
          }
          break;
        case 'ELIMINATE_DIE':
          dispatch({ type: 'ELIMINATE_DIE', playerId: capturedBotId });
          break;
        case 'CALL_MOSTREM':
          dispatch({ type: 'CALL_MOSTREM', playerId: capturedBotId });
          break;
        default:
          break;
      }
    }, delay);

    return cleanup;
  }, [
    enabled,
    state.phase,
    state.currentPlayerIndex,
    state.doublingResponseIndex,
    state.players,
    dispatch,
    state,
  ]);
}
