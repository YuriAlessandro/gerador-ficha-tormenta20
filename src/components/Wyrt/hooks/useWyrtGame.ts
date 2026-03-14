import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useWyrtContext } from '../WyrtProvider';
import { useWyrtDice } from './useWyrtDice';
import { WyrtPlayer } from '../engine/types';
import { createDeck, shuffleDeck } from '../engine/deck';
import { INITIAL_MONEY, BOT_NAMES } from '../engine/constants';

function getShuffledBotNames(count: number): string[] {
  const shuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function useWyrtGame() {
  const {
    state,
    dispatch,
    currentPlayer,
    humanPlayer,
    isHumanTurn,
    availableActions,
    activePlayers,
    mode,
    isHost,
    onNextRound: contextNextRound,
    onEndGame: contextEndGame,
    onCancelGame,
  } = useWyrtContext();
  const { rollD6 } = useWyrtDice();

  const startGame = useCallback(
    (playerName: string, botCount: number, initialMoney?: number) => {
      const botNames = getShuffledBotNames(botCount);
      const unlimited = initialMoney === 0;
      const money = unlimited ? INITIAL_MONEY : initialMoney ?? INITIAL_MONEY;

      const players: WyrtPlayer[] = [
        {
          id: uuid(),
          name: playerName,
          type: 'human',
          money,
          hand: [],
          discardedCards: [],
          die: { rolled: false, eliminated: false, value: null },
          status: 'active',
          currentBet: 0,
          discardsUsed: 0,
        },
        ...botNames.map((name) => ({
          id: uuid(),
          name,
          type: 'bot' as const,
          money,
          hand: [],
          discardedCards: [],
          die: { rolled: false, eliminated: false, value: null },
          status: 'active' as const,
          currentBet: 0,
          discardsUsed: 0,
        })),
      ];

      const deck = shuffleDeck(createDeck());
      dispatch({
        type: 'START_GAME',
        players,
        deck,
        unlimitedMoney: unlimited,
      });
    },
    [dispatch]
  );

  const rollDie = useCallback(async () => {
    if (!currentPlayer) return;
    const dieValue = await rollD6();
    dispatch({ type: 'ROLL_DIE', playerId: currentPlayer.id, dieValue });
  }, [currentPlayer, rollD6, dispatch]);

  const doubleBet = useCallback(() => {
    if (!currentPlayer) return;
    dispatch({ type: 'DOUBLE_BET', playerId: currentPlayer.id });
  }, [currentPlayer, dispatch]);

  const acceptDouble = useCallback(() => {
    if (!humanPlayer) return;
    dispatch({ type: 'ACCEPT_DOUBLE', playerId: humanPlayer.id });
  }, [humanPlayer, dispatch]);

  const rejectDouble = useCallback(() => {
    if (!humanPlayer) return;
    dispatch({ type: 'REJECT_DOUBLE', playerId: humanPlayer.id });
  }, [humanPlayer, dispatch]);

  const discardCard = useCallback(
    (cardId: string) => {
      if (!currentPlayer) return;
      dispatch({
        type: 'DISCARD_CARD',
        playerId: currentPlayer.id,
        cardId,
      });
    },
    [currentPlayer, dispatch]
  );

  const eliminateDie = useCallback(() => {
    if (!currentPlayer) return;
    dispatch({ type: 'ELIMINATE_DIE', playerId: currentPlayer.id });
  }, [currentPlayer, dispatch]);

  const callMostrem = useCallback(() => {
    if (!currentPlayer) return;
    dispatch({ type: 'CALL_MOSTREM', playerId: currentPlayer.id });
  }, [currentPlayer, dispatch]);

  const scoreRound = useCallback(() => {
    dispatch({ type: 'SCORE_ROUND' });
  }, [dispatch]);

  const nextRound = useCallback(() => {
    if (mode === 'online' && contextNextRound) {
      contextNextRound();
      return;
    }
    const deck = shuffleDeck(createDeck());
    dispatch({ type: 'NEXT_ROUND', deck });
  }, [dispatch, mode, contextNextRound]);

  const endGame = useCallback(() => {
    if (mode === 'online' && contextEndGame) {
      contextEndGame();
      return;
    }
    dispatch({ type: 'END_GAME' });
  }, [dispatch, mode, contextEndGame]);

  return {
    state,
    currentPlayer,
    humanPlayer,
    isHumanTurn,
    availableActions,
    activePlayers,
    mode,
    isHost,
    startGame,
    rollDie,
    doubleBet,
    acceptDouble,
    rejectDouble,
    discardCard,
    eliminateDie,
    callMostrem,
    scoreRound,
    nextRound,
    endGame,
    onCancelGame,
  };
}
