import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
} from 'react';
import {
  WyrtGameState,
  WyrtReducerAction,
  WyrtPlayer,
  WyrtActionType,
  WyrtGameMode,
} from './engine/types';
import { wyrtReducer, initialGameState } from './engine/gameReducer';
import { getAvailableActions } from './engine/validation';

export interface WyrtContextValue {
  state: WyrtGameState;
  dispatch: React.Dispatch<WyrtReducerAction>;
  currentPlayer: WyrtPlayer | null;
  humanPlayer: WyrtPlayer | null;
  isHumanTurn: boolean;
  availableActions: WyrtActionType[];
  activePlayers: WyrtPlayer[];
  mode: WyrtGameMode;
  isHost: boolean;
  onNextRound?: () => void;
  onEndGame?: () => void;
  onCancelGame?: () => void;
}

const WyrtContext = createContext<WyrtContextValue | undefined>(undefined);

// --- Helper to compute derived values from game state ---

function computeDerivedValues(
  state: WyrtGameState,
  myPlayerId: string | null
): {
  currentPlayer: WyrtPlayer | null;
  humanPlayer: WyrtPlayer | null;
  isHumanTurn: boolean;
  availableActions: WyrtActionType[];
  activePlayers: WyrtPlayer[];
} {
  const currentPlayer =
    state.phase !== 'setup' && state.phase !== 'gameOver'
      ? state.players[state.currentPlayerIndex] ?? null
      : null;

  // In online mode, "humanPlayer" is the local player identified by myPlayerId
  // In local mode, it's the player with type === 'human'
  const humanPlayer = myPlayerId
    ? state.players.find((p) => p.id === myPlayerId) ?? null
    : state.players.find((p) => p.type === 'human') ?? null;

  const isHumanTurn = (() => {
    if (state.phase === 'doubling') {
      const responder = state.players[state.doublingResponseIndex];
      if (myPlayerId) {
        return responder?.id === myPlayerId;
      }
      return responder?.type === 'human';
    }
    if (myPlayerId) {
      return currentPlayer?.id === myPlayerId;
    }
    return currentPlayer?.type === 'human';
  })();

  const availableActions = (() => {
    if (state.phase === 'doubling' && humanPlayer) {
      const responder = state.players[state.doublingResponseIndex];
      if (myPlayerId) {
        if (responder?.id === myPlayerId) {
          return getAvailableActions(state, responder.id);
        }
        return [];
      }
      if (responder?.type === 'human') {
        return getAvailableActions(state, responder.id);
      }
      return [];
    }
    if (isHumanTurn && currentPlayer) {
      return getAvailableActions(state, currentPlayer.id);
    }
    return [];
  })();

  const activePlayers = state.players.filter((p) => p.status === 'active');

  return {
    currentPlayer,
    humanPlayer,
    isHumanTurn,
    availableActions,
    activePlayers,
  };
}

// --- Local Mode Provider ---

interface WyrtLocalProviderProps {
  children: ReactNode;
  onCancelGame?: () => void;
}

function WyrtLocalProvider({ children, onCancelGame }: WyrtLocalProviderProps) {
  const [state, dispatch] = useReducer(wyrtReducer, initialGameState);

  const value = useMemo<WyrtContextValue>(() => {
    const derived = computeDerivedValues(state, null);
    return {
      state,
      dispatch,
      ...derived,
      mode: 'local' as const,
      isHost: true,
      onCancelGame,
    };
  }, [state, dispatch, onCancelGame]);

  return <WyrtContext.Provider value={value}>{children}</WyrtContext.Provider>;
}

// --- Online Mode Provider ---

interface WyrtOnlineProviderProps {
  children: ReactNode;
  state: WyrtGameState;
  dispatch: React.Dispatch<WyrtReducerAction>;
  myPlayerId: string | null;
  isHost: boolean;
  onNextRound?: () => void;
  onEndGame?: () => void;
  onCancelGame?: () => void;
}

function WyrtOnlineProvider({
  children,
  state,
  dispatch,
  myPlayerId,
  isHost,
  onNextRound,
  onEndGame,
  onCancelGame,
}: WyrtOnlineProviderProps) {
  const value = useMemo<WyrtContextValue>(() => {
    const derived = computeDerivedValues(state, myPlayerId);
    return {
      state,
      dispatch,
      ...derived,
      mode: 'online' as const,
      isHost,
      onNextRound,
      onEndGame,
      onCancelGame,
    };
  }, [
    state,
    dispatch,
    myPlayerId,
    isHost,
    onNextRound,
    onEndGame,
    onCancelGame,
  ]);

  return <WyrtContext.Provider value={value}>{children}</WyrtContext.Provider>;
}

// --- Main Provider ---

interface WyrtProviderProps {
  children: ReactNode;
  mode?: WyrtGameMode;
  onlineState?: WyrtGameState;
  onlineDispatch?: React.Dispatch<WyrtReducerAction>;
  myPlayerId?: string | null;
  isHost?: boolean;
  onNextRound?: () => void;
  onEndGame?: () => void;
  onCancelGame?: () => void;
}

export function WyrtProvider({
  children,
  mode = 'local',
  onlineState,
  onlineDispatch,
  myPlayerId,
  isHost = false,
  onNextRound,
  onEndGame,
  onCancelGame,
}: WyrtProviderProps) {
  if (mode === 'online' && onlineState && onlineDispatch) {
    return (
      <WyrtOnlineProvider
        state={onlineState}
        dispatch={onlineDispatch}
        myPlayerId={myPlayerId ?? null}
        isHost={isHost}
        onNextRound={onNextRound}
        onEndGame={onEndGame}
        onCancelGame={onCancelGame}
      >
        {children}
      </WyrtOnlineProvider>
    );
  }
  return (
    <WyrtLocalProvider onCancelGame={onCancelGame}>
      {children}
    </WyrtLocalProvider>
  );
}

export function useWyrtContext(): WyrtContextValue {
  const context = useContext(WyrtContext);
  if (!context) {
    throw new Error('useWyrtContext must be used within WyrtProvider');
  }
  return context;
}
