import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../../../premium/services/socket.service';
import {
  WyrtGameState,
  WyrtRoomInfo,
  WyrtReducerAction,
} from '../engine/types';

// Socket event names (must match backend wyrtSocket.ts)
const WyrtClientEvents = {
  CREATE_ROOM: 'wyrt:create_room',
  JOIN_ROOM: 'wyrt:join_room',
  LEAVE_ROOM: 'wyrt:leave_room',
  UPDATE_CONFIG: 'wyrt:update_config',
  START_GAME: 'wyrt:start_game',
  GAME_ACTION: 'wyrt:game_action',
  NEXT_ROUND: 'wyrt:next_round',
  END_GAME: 'wyrt:end_game',
} as const;

const WyrtServerEvents = {
  ROOM_CREATED: 'wyrt:room_created',
  ROOM_UPDATED: 'wyrt:room_updated',
  GAME_STATE: 'wyrt:game_state',
  GAME_ERROR: 'wyrt:game_error',
  ROOM_CLOSED: 'wyrt:room_closed',
} as const;

export interface UseWyrtSocketReturn {
  isConnected: boolean;
  roomInfo: WyrtRoomInfo | null;
  gameState: WyrtGameState | null;
  myPlayerId: string | null;
  isHost: boolean;
  error: string | null;
  createRoom: (
    playerName: string,
    botCount: number,
    initialMoney?: number
  ) => Promise<void>;
  joinRoom: (code: string, playerName: string) => Promise<void>;
  leaveRoom: () => void;
  startGame: () => void;
  sendAction: (action: WyrtReducerAction) => void;
  updateConfig: (botCount: number) => void;
  nextRound: () => void;
  endGame: () => void;
  clearError: () => void;
}

function setupWyrtListeners(
  socket: Socket,
  handlers: {
    onRoomCreated: (data: { code: string }) => void;
    onRoomUpdated: (data: WyrtRoomInfo) => void;
    onGameState: (data: { state: WyrtGameState; myPlayerId: string }) => void;
    onGameError: (data: { message: string }) => void;
    onRoomClosed: () => void;
  }
): () => void {
  socket.on(WyrtServerEvents.ROOM_CREATED, handlers.onRoomCreated);
  socket.on(WyrtServerEvents.ROOM_UPDATED, handlers.onRoomUpdated);
  socket.on(WyrtServerEvents.GAME_STATE, handlers.onGameState);
  socket.on(WyrtServerEvents.GAME_ERROR, handlers.onGameError);
  socket.on(WyrtServerEvents.ROOM_CLOSED, handlers.onRoomClosed);

  return () => {
    socket.off(WyrtServerEvents.ROOM_CREATED, handlers.onRoomCreated);
    socket.off(WyrtServerEvents.ROOM_UPDATED, handlers.onRoomUpdated);
    socket.off(WyrtServerEvents.GAME_STATE, handlers.onGameState);
    socket.off(WyrtServerEvents.GAME_ERROR, handlers.onGameError);
    socket.off(WyrtServerEvents.ROOM_CLOSED, handlers.onRoomClosed);
  };
}

export function useWyrtSocket(): UseWyrtSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<WyrtRoomInfo | null>(null);
  const [gameState, setGameState] = useState<WyrtGameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomCodeRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleRoomCreated = useCallback((data: { code: string }) => {
    roomCodeRef.current = data.code;
  }, []);

  const handleRoomUpdated = useCallback((data: WyrtRoomInfo) => {
    setRoomInfo(data);
    roomCodeRef.current = data.code;
  }, []);

  const handleGameState = useCallback(
    (data: { state: WyrtGameState; myPlayerId: string }) => {
      setGameState(data.state);
      setMyPlayerId(data.myPlayerId);
    },
    []
  );

  const handleGameError = useCallback((data: { message: string }) => {
    setError(data.message);
  }, []);

  const handleRoomClosed = useCallback(() => {
    setRoomInfo(null);
    setGameState(null);
    setMyPlayerId(null);
    setIsHost(false);
    roomCodeRef.current = null;
  }, []);

  // Attach listeners to an already-connected socket
  const attachListeners = useCallback(
    (socket: Socket) => {
      // Clean up previous listeners
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      const cleanup = setupWyrtListeners(socket, {
        onRoomCreated: handleRoomCreated,
        onRoomUpdated: handleRoomUpdated,
        onGameState: handleGameState,
        onGameError: handleGameError,
        onRoomClosed: handleRoomClosed,
      });

      cleanupRef.current = cleanup;
    },
    [
      handleRoomCreated,
      handleRoomUpdated,
      handleGameState,
      handleGameError,
      handleRoomClosed,
    ]
  );

  // Setup initial listeners if socket is already available
  useEffect(() => {
    const socket = socketService.getRawSocket();
    if (!socket) return undefined;

    attachListeners(socket);
    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [attachListeners]);

  const createRoom = useCallback(
    async (playerName: string, botCount: number, initialMoney?: number) => {
      try {
        setError(null);
        await socketService.connect();
        const socket = socketService.getRawSocket();
        if (!socket) throw new Error('Socket não conectado');

        setIsConnected(true);
        setIsHost(true);
        attachListeners(socket);

        socket.emit(WyrtClientEvents.CREATE_ROOM, {
          playerName,
          botCount,
          initialMoney,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar sala.');
      }
    },
    [attachListeners]
  );

  const joinRoom = useCallback(
    async (code: string, playerName: string) => {
      try {
        setError(null);
        await socketService.connect();
        const socket = socketService.getRawSocket();
        if (!socket) throw new Error('Socket não conectado');

        setIsConnected(true);
        setIsHost(false);
        attachListeners(socket);

        socket.emit(WyrtClientEvents.JOIN_ROOM, { code, playerName });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao entrar na sala.'
        );
      }
    },
    [attachListeners]
  );

  const leaveRoom = useCallback(() => {
    const socket = socketService.getRawSocket();
    if (socket && roomCodeRef.current) {
      socket.emit(WyrtClientEvents.LEAVE_ROOM, {
        code: roomCodeRef.current,
      });
    }
    setRoomInfo(null);
    setGameState(null);
    setMyPlayerId(null);
    setIsHost(false);
    roomCodeRef.current = null;
  }, []);

  const startGame = useCallback(() => {
    const socket = socketService.getRawSocket();
    if (socket && roomCodeRef.current) {
      socket.emit(WyrtClientEvents.START_GAME, {
        code: roomCodeRef.current,
      });
    }
  }, []);

  const sendAction = useCallback((action: WyrtReducerAction) => {
    const socket = socketService.getRawSocket();
    if (socket && roomCodeRef.current) {
      socket.emit(WyrtClientEvents.GAME_ACTION, {
        code: roomCodeRef.current,
        action,
      });
    }
  }, []);

  const updateConfig = useCallback((botCount: number) => {
    const socket = socketService.getRawSocket();
    if (socket && roomCodeRef.current) {
      socket.emit(WyrtClientEvents.UPDATE_CONFIG, {
        code: roomCodeRef.current,
        botCount,
      });
    }
  }, []);

  const nextRound = useCallback(() => {
    const socket = socketService.getRawSocket();
    if (socket && roomCodeRef.current) {
      socket.emit(WyrtClientEvents.NEXT_ROUND, {
        code: roomCodeRef.current,
      });
    }
  }, []);

  const endGame = useCallback(() => {
    const socket = socketService.getRawSocket();
    if (socket && roomCodeRef.current) {
      socket.emit(WyrtClientEvents.END_GAME, {
        code: roomCodeRef.current,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isConnected,
    roomInfo,
    gameState,
    myPlayerId,
    isHost,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    sendAction,
    updateConfig,
    nextRound,
    endGame,
    clearError,
  };
}
