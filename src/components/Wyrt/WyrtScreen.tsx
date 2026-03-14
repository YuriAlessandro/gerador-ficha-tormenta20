import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { WyrtProvider, useWyrtContext } from './WyrtProvider';
import { useWyrtGame } from './hooks/useWyrtGame';
import { useWyrtBot } from './hooks/useWyrtBot';
import { useWyrtSocket } from './hooks/useWyrtSocket';
import { useAuth } from '../../hooks/useAuth';
import { WyrtReducerAction } from './engine/types';
import GameSetup from './components/GameSetup';
import GameTable from './components/GameTable';
import WaitingRoom from './components/WaitingRoom';
import { useWyrtSounds } from './hooks/useWyrtSounds';

type ScreenMode = 'menu' | 'solo' | 'waiting' | 'online-playing';

interface GameOverScreenProps {
  players: Array<{
    name: string;
    money: number;
    type: string;
    status: string;
  }>;
  onRestart: () => void;
}

function GameOverScreen({ players, onRestart }: GameOverScreenProps) {
  const { play } = useWyrtSounds();
  const sortedPlayers = [...players].sort((a, b) => b.money - a.money);

  // Play victory sound on mount
  useEffect(() => {
    play('victory');
    // eslint-disable-next-line
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at center, #1e3318 0%, #0f200d 50%, #0a1508 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 3,
        p: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: '2.3rem',
          fontWeight: 900,
          color: '#d4a847',
          fontFamily: '"Tfont", serif',
          textShadow: '0 0 20px rgba(212,168,71,0.3)',
        }}
      >
        Fim de Jogo!
      </Typography>

      <Box
        sx={{
          background: 'rgba(20,35,20,0.8)',
          border: '2px solid rgba(212,168,71,0.3)',
          borderRadius: '12px',
          p: 3,
          minWidth: 300,
        }}
      >
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#a0b0a0',
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          Classificação Final
        </Typography>

        {sortedPlayers.map((player, i) => (
          <Box
            key={player.name}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1,
              borderBottom:
                i < sortedPlayers.length - 1
                  ? '1px solid rgba(60,80,60,0.2)'
                  : 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  color: i === 0 ? '#d4a847' : '#a0b0a0',
                  fontWeight: i === 0 ? 700 : 400,
                }}
              >
                {i === 0 ? '👑' : `${i + 1}.`}
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  color: i === 0 ? '#d4a847' : '#c0d0c0',
                  fontWeight: i === 0 ? 700 : 400,
                }}
              >
                {player.name}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '1.05rem',
                color: player.money > 0 ? '#8fc98f' : '#e07070',
                fontWeight: 600,
              }}
            >
              T$ {player.money}
            </Typography>
          </Box>
        ))}
      </Box>

      <Button
        onClick={onRestart}
        sx={{
          background: 'linear-gradient(180deg, #d4a847, #b8922e)',
          color: '#1a2a1a',
          border: '1px solid #f0d060',
          borderRadius: '8px',
          px: 4,
          py: 1,
          fontWeight: 700,
          fontSize: '1.05rem',
          textTransform: 'none',
          fontFamily: '"Tfont", serif',
          '&:hover': {
            background: 'linear-gradient(180deg, #f0d060, #d4a847)',
          },
        }}
      >
        Jogar Novamente
      </Button>
    </Box>
  );
}

// --- Solo Game Content (local reducer + bots) ---

function SoloGameContent() {
  const { state } = useWyrtContext();

  // Activate bot AI for local mode
  useWyrtBot(true);

  if (state.phase === 'setup') {
    // Should not happen - game starts before rendering this
    return null;
  }

  if (state.phase === 'gameOver') {
    return (
      <GameOverScreen
        players={state.players}
        onRestart={() => window.location.reload()}
      />
    );
  }

  return <GameTable />;
}

// --- Online Game Content (server state, no local bots) ---

function OnlineGameContent() {
  const { state } = useWyrtContext();

  // Bots are disabled in online mode — server handles them
  useWyrtBot(false);

  if (state.phase === 'gameOver') {
    return (
      <GameOverScreen
        players={state.players}
        onRestart={() => window.location.reload()}
      />
    );
  }

  return <GameTable />;
}

// Helper component to auto-start the solo game once the provider is mounted
function SoloGameStarter({
  playerName,
  botCount,
  initialMoney,
}: {
  playerName: string;
  botCount: number;
  initialMoney: number;
}) {
  const { state } = useWyrtContext();
  const { startGame } = useWyrtGame();

  // Start game on first render if still in setup
  React.useEffect(() => {
    if (state.phase === 'setup') {
      startGame(playerName, botCount, initialMoney);
    }
    // eslint-disable-next-line
  }, []);

  if (state.phase === 'setup') {
    return null;
  }

  return <SoloGameContent />;
}

// --- Main Screen Orchestrator ---

function WyrtScreen() {
  const [screenMode, setScreenMode] = useState<ScreenMode>('menu');
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const wyrtSocket = useWyrtSocket();

  // Solo mode: starts game via local provider
  const [soloStarted, setSoloStarted] = useState(false);
  const [soloConfig, setSoloConfig] = useState<{
    playerName: string;
    botCount: number;
    initialMoney: number;
  } | null>(null);

  const handleStartSolo = useCallback(
    (playerName: string, botCount: number, initialMoney: number) => {
      setSoloConfig({ playerName, botCount, initialMoney });
      setSoloStarted(true);
      setScreenMode('solo');
    },
    []
  );

  // Online mode uses the authenticated user's display name
  const onlinePlayerName = user?.username || user?.fullName || 'Jogador';

  const handleCreateRoom = useCallback(
    (botCount: number, initialMoney: number) => {
      wyrtSocket.createRoom(onlinePlayerName, botCount, initialMoney);
      setScreenMode('waiting');
    },
    [wyrtSocket, onlinePlayerName]
  );

  const handleJoinRoom = useCallback(
    (code: string) => {
      wyrtSocket.joinRoom(code, onlinePlayerName);
      setScreenMode('waiting');
    },
    [wyrtSocket, onlinePlayerName]
  );

  const handleLeaveRoom = useCallback(() => {
    wyrtSocket.leaveRoom();
    setScreenMode('menu');
  }, [wyrtSocket]);

  const handleStartOnlineGame = useCallback(() => {
    wyrtSocket.startGame();
  }, [wyrtSocket]);

  const handleCancelSolo = useCallback(() => {
    setSoloStarted(false);
    setSoloConfig(null);
    setScreenMode('menu');
  }, []);

  const handleCancelOnline = useCallback(() => {
    wyrtSocket.leaveRoom();
    setScreenMode('menu');
  }, [wyrtSocket]);

  // Transition to online-playing when game state arrives
  if (
    screenMode === 'waiting' &&
    wyrtSocket.gameState &&
    wyrtSocket.gameState.phase !== 'setup'
  ) {
    setScreenMode('online-playing');
  }

  // Online dispatch wrapper: sends actions to socket instead of local reducer
  const onlineDispatch = useCallback(
    (action: WyrtReducerAction) => {
      wyrtSocket.sendAction(action);
    },
    [wyrtSocket]
  );

  // --- MENU ---
  if (screenMode === 'menu') {
    return (
      <GameSetup
        onStartGame={handleStartSolo}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isAuthenticated={isAuthenticated}
        onlineUserName={onlinePlayerName}
        error={wyrtSocket.error}
        onClearError={wyrtSocket.clearError}
      />
    );
  }

  // --- SOLO ---
  if (screenMode === 'solo' && soloStarted && soloConfig) {
    return (
      <WyrtProvider mode='local' onCancelGame={handleCancelSolo}>
        <SoloGameStarter
          playerName={soloConfig.playerName}
          botCount={soloConfig.botCount}
          initialMoney={soloConfig.initialMoney}
        />
      </WyrtProvider>
    );
  }

  // --- WAITING ROOM ---
  if (screenMode === 'waiting' && wyrtSocket.roomInfo) {
    return (
      <WaitingRoom
        roomInfo={wyrtSocket.roomInfo}
        isConnected={wyrtSocket.isConnected}
        isHost={wyrtSocket.isHost}
        onLeave={handleLeaveRoom}
        onStart={handleStartOnlineGame}
        onUpdateBots={wyrtSocket.updateConfig}
      />
    );
  }

  // --- ONLINE PLAYING ---
  if (screenMode === 'online-playing' && wyrtSocket.gameState) {
    return (
      <WyrtProvider
        mode='online'
        onlineState={wyrtSocket.gameState}
        onlineDispatch={onlineDispatch}
        myPlayerId={wyrtSocket.myPlayerId}
        isHost={wyrtSocket.isHost}
        onNextRound={wyrtSocket.nextRound}
        onEndGame={wyrtSocket.endGame}
        onCancelGame={handleCancelOnline}
      >
        <OnlineGameContent />
      </WyrtProvider>
    );
  }

  // Fallback: show menu
  return (
    <GameSetup
      onStartGame={handleStartSolo}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      isAuthenticated={isAuthenticated}
      onlineUserName={onlinePlayerName}
      error={wyrtSocket.error}
      onClearError={wyrtSocket.clearError}
    />
  );
}

export default WyrtScreen;
