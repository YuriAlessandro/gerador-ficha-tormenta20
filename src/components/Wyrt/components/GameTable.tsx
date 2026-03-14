import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Typography,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import { useHistory } from 'react-router-dom';
import { useWyrtGame } from '../hooks/useWyrtGame';
import { useWyrtSounds } from '../hooks/useWyrtSounds';
import PlayerArea from './PlayerArea';
import CenterArea from './CenterArea';
import PlayerHand from './PlayerHand';
import CardComponent from './CardComponent';
import ActionBar from './ActionBar';
import GameLog from './GameLog';
import DoublePrompt from './DoublePrompt';
import RoundEndDialog from './RoundEndDialog';
import logoSmall from '../../../assets/images/logoFichasDeNimbSmall.svg';

type Position = 'top' | 'left' | 'right' | 'top-left' | 'top-right';

function getOpponentPositions(count: number): Position[] {
  switch (count) {
    case 2:
      return ['top-left', 'top-right'];
    case 3:
      return ['left', 'top', 'right'];
    case 4:
      return ['left', 'top-left', 'top-right', 'right'];
    case 5:
      return ['left', 'top-left', 'top', 'top-right', 'right'];
    default:
      return ['top-left', 'top-right'];
  }
}

function getPositionStyles(
  position: Position,
  isMobile: boolean
): Record<string, string | number> {
  const base = { position: 'absolute' as const };

  switch (position) {
    case 'top':
      return {
        ...base,
        top: isMobile ? 44 : 48,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        ...base,
        left: isMobile ? 4 : 16,
        top: '40%',
        transform: 'translateY(-50%)',
      };
    case 'right':
      return {
        ...base,
        right: isMobile ? 4 : 16,
        top: '40%',
        transform: 'translateY(-50%)',
      };
    case 'top-left':
      return { ...base, top: isMobile ? 44 : 48, left: isMobile ? 8 : '15%' };
    case 'top-right':
      return { ...base, top: isMobile ? 44 : 48, right: isMobile ? 8 : '15%' };
    default:
      return base;
  }
}

function GameTable() {
  const {
    state,
    humanPlayer,
    isHumanTurn,
    availableActions,
    isHost,
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
  } = useWyrtGame();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isShortScreen = useMediaQuery('(max-height: 800px)');
  const isMediumScreen = useMediaQuery('(max-height: 1050px)');
  const isPortrait = useMediaQuery(
    '(orientation: portrait) and (max-width: 768px)'
  );
  const history = useHistory();
  const { play } = useWyrtSounds();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [discardMode, setDiscardMode] = useState(false);
  const [showLog, setShowLog] = useState(!isMobile);
  const [showScoring, setShowScoring] = useState(false);

  const opponents = state.players.filter((p) => p.id !== humanPlayer?.id);
  const positions = getOpponentPositions(opponents.length);

  const showDoublePrompt =
    state.phase === 'doubling' &&
    humanPlayer &&
    state.players[state.doublingResponseIndex]?.id === humanPlayer.id;

  const doublerName =
    state.players.find((p) => p.id === state.doublingPlayerId)?.name ?? '';

  // --- Sound effects ---

  // Dice rolled (track count of rolled dice)
  const prevDiceCountRef = useRef(state.rolledDice.length);
  useEffect(() => {
    if (state.rolledDice.length > prevDiceCountRef.current) {
      play('diceRoll');
    }
    prevDiceCountRef.current = state.rolledDice.length;
  }, [state.rolledDice.length, play]);

  // Fox number revealed (first die rolled in the round)
  const prevShowFoxRef = useRef(false);
  useEffect(() => {
    const show = state.rolledDice.length > 0;
    if (show && !prevShowFoxRef.current) {
      play('foxReveal');
    }
    prevShowFoxRef.current = show;
  }, [state.rolledDice.length, play]);

  // Your turn notification
  const prevIsHumanTurnRef = useRef(isHumanTurn);
  useEffect(() => {
    if (
      isHumanTurn &&
      !prevIsHumanTurnRef.current &&
      state.phase === 'playing'
    ) {
      play('bell');
    }
    prevIsHumanTurnRef.current = isHumanTurn;
  }, [isHumanTurn, state.phase, play]);

  // Double bet proposed
  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (state.phase === 'doubling' && prevPhaseRef.current !== 'doubling') {
      play('doubleBet');
    }
    if (state.phase === 'roundEnd' && prevPhaseRef.current !== 'roundEnd') {
      play('shuffle');
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, play]);

  // Round number changed (new round started = card shuffle)
  const prevRoundRef = useRef(state.roundNumber);
  useEffect(() => {
    if (state.roundNumber > prevRoundRef.current) {
      play('shuffle');
    }
    prevRoundRef.current = state.roundNumber;
  }, [state.roundNumber, play]);

  // Player eliminated or folded
  const prevPlayerStatusRef = useRef<string[]>(
    state.players.map((p) => p.status)
  );
  useEffect(() => {
    const currentStatuses = state.players.map((p) => p.status);
    for (let i = 0; i < currentStatuses.length; i += 1) {
      const prev = prevPlayerStatusRef.current[i];
      const curr = currentStatuses[i];
      if (prev === 'active' && (curr === 'folded' || curr === 'eliminated')) {
        play('doorSlam');
        break;
      }
    }
    prevPlayerStatusRef.current = currentStatuses;
  }, [state.players, play]);

  // Auto-score when round ends
  useEffect(() => {
    if (state.phase === 'roundEnd' && !state.roundResults) {
      const timer = setTimeout(() => {
        scoreRound();
      }, 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.phase, state.roundResults, scoreRound]);

  // Show scoring dialog when results are ready
  useEffect(() => {
    if (state.roundResults) {
      setShowScoring(true);
    }
  }, [state.roundResults]);

  const handleDiscardToggle = useCallback(() => {
    if (discardMode) {
      setDiscardMode(false);
      setSelectedCardId(null);
    } else {
      setDiscardMode(true);
    }
  }, [discardMode]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (!discardMode) return;
      if (selectedCardId === cardId) {
        play('cardDiscard');
        discardCard(cardId);
        setDiscardMode(false);
        setSelectedCardId(null);
      } else {
        setSelectedCardId(cardId);
      }
    },
    [discardMode, selectedCardId, discardCard]
  );

  const handleNextRound = useCallback(() => {
    setShowScoring(false);
    nextRound();
  }, [nextRound]);

  const handleEndGame = useCallback(() => {
    setShowScoring(false);
    endGame();
  }, [endGame]);

  const showFoxNumber = state.rolledDice.length > 0;

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        background:
          'radial-gradient(ellipse at 50% 40%, #2d5a27 0%, #1a3a15 40%, #0f2a0d 70%, #081a06 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Portrait overlay — ask user to rotate */}
      {isPortrait && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background:
              'radial-gradient(ellipse at center, #1e3318 0%, #0a1508 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <ScreenRotationIcon sx={{ fontSize: 64, color: '#d4a847' }} />
          <Typography
            sx={{
              color: '#d4a847',
              fontSize: '1.3rem',
              fontFamily: '"Tfont", serif',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Gire o celular
          </Typography>
          <Typography
            sx={{
              color: 'rgba(160,180,160,0.7)',
              fontSize: '0.95rem',
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            Wyrt funciona melhor com o celular na horizontal
          </Typography>
        </Box>
      )}

      {/* Felt texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23000' opacity='0.03'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main game area */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-right 0.3s ease',
          mr: !isMobile && showLog ? '260px' : 0,
        }}
      >
        {/* Back button + logo */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 0.3,
            zIndex: 10,
          }}
        >
          <IconButton
            onClick={onCancelGame ?? (() => history.push('/'))}
            sx={{
              color: 'rgba(160,180,160,0.5)',
              '&:hover': { color: '#d4a847' },
            }}
            title='Cancelar Partida'
          >
            <ArrowBackIcon fontSize='small' />
          </IconButton>
          <Box
            component='img'
            src={logoSmall}
            alt='Fichas de Nimb'
            sx={{
              height: 26,
              width: 26,
              opacity: 0.5,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.9 },
            }}
          />
        </Box>

        {/* Round info - medieval banner */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {/* Left chevron */}
          <Box
            sx={{
              width: 28,
              height: 36,
              background:
                'linear-gradient(135deg, rgba(212,168,71,0.15) 0%, rgba(140,110,40,0.08) 100%)',
              clipPath: 'polygon(100% 0, 100% 100%, 0 50%)',
              borderRight: 'none',
            }}
          />
          {/* Center banner */}
          <Box
            sx={{
              background:
                'linear-gradient(180deg, rgba(30,45,25,0.95) 0%, rgba(20,32,18,0.9) 100%)',
              borderBottom: '2px solid rgba(212,168,71,0.4)',
              borderLeft: '1px solid rgba(212,168,71,0.2)',
              borderRight: '1px solid rgba(212,168,71,0.2)',
              px: isMobile ? 2 : 3,
              py: 0.6,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent, rgba(212,168,71,0.5), transparent)',
              },
            }}
          >
            <Typography
              sx={{
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                color: '#d4a847',
                textTransform: 'uppercase',
                letterSpacing: 3,
                fontWeight: 700,
                fontFamily: '"Tfont", serif',
                textShadow: '0 0 12px rgba(212,168,71,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              Rodada {state.roundNumber}
            </Typography>
          </Box>
          {/* Right chevron */}
          <Box
            sx={{
              width: 28,
              height: 36,
              background:
                'linear-gradient(225deg, rgba(212,168,71,0.15) 0%, rgba(140,110,40,0.08) 100%)',
              clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
            }}
          />
        </Box>

        {/* Log toggle (mobile) */}
        {isMobile && (
          <IconButton
            onClick={() => setShowLog(true)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'rgba(160,180,160,0.5)',
              zIndex: 10,
              '&:hover': { color: '#d4a847' },
            }}
          >
            <ChatIcon fontSize='small' />
          </IconButton>
        )}

        {/* Opponent areas */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {opponents.map((player, i) => {
            const pos = positions[i];
            return (
              <Box key={player.id} sx={getPositionStyles(pos, isMobile)}>
                <PlayerArea
                  player={player}
                  isCurrentTurn={
                    state.phase === 'doubling'
                      ? state.doublingResponseIndex ===
                        state.players.findIndex((p) => p.id === player.id)
                      : state.currentPlayerIndex ===
                        state.players.findIndex((p) => p.id === player.id)
                  }
                  position={pos}
                  foxBlackDiscarded={state.foxBlackDiscarded}
                  foxRedDiscarded={state.foxRedDiscarded}
                  compact={isMobile || isShortScreen || isMediumScreen}
                />
              </Box>
            );
          })}

          {/* Center */}
          <Box
            sx={{
              position: 'absolute',
              top: (() => {
                if (isShortScreen) return '48%';
                if (isMediumScreen) return '50vh';
                return '45%';
              })(),
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CenterArea
              foxNumber={state.foxNumber}
              rolledDice={state.rolledDice}
              pot={state.pot}
              drawPileCount={state.drawPile.length}
              showFoxNumber={showFoxNumber}
              compact={isShortScreen || isMediumScreen}
            />
          </Box>
        </Box>

        {/* Turn indicator */}
        {state.phase !== 'roundEnd' && state.phase !== 'gameOver' && (
          <Box sx={{ textAlign: 'center', py: 0.3 }}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: isHumanTurn ? '#d4a847' : 'rgba(160,180,160,0.5)',
                fontWeight: isHumanTurn ? 700 : 400,
              }}
            >
              {(() => {
                if (state.phase === 'doubling') {
                  if (isHumanTurn) {
                    return 'DOBRO! Aceite ou saia da rodada.';
                  }
                  const responder = state.players[state.doublingResponseIndex];
                  return `${
                    responder?.name ?? '...'
                  } está decidindo sobre o dobro...`;
                }
                if (!isHumanTurn) {
                  const name =
                    state.players[state.currentPlayerIndex]?.name ?? '...';
                  return `Vez de ${name}...`;
                }
                if (discardMode)
                  return 'Selecione uma carta para descartar (clique duas vezes para confirmar)';
                return 'Sua vez! Escolha uma ação.';
              })()}
            </Typography>
          </Box>
        )}

        {/* Action bar */}
        {humanPlayer &&
          state.phase !== 'roundEnd' &&
          state.phase !== 'gameOver' && (
            <ActionBar
              availableActions={availableActions}
              onRollDie={rollDie}
              onDoubleBet={doubleBet}
              onDiscardCard={handleDiscardToggle}
              onEliminateDie={eliminateDie}
              onCallMostrem={callMostrem}
              discardMode={discardMode}
              disabled={!isHumanTurn || state.phase === 'doubling'}
            />
          )}

        {/* Human hand */}
        {humanPlayer && humanPlayer.status === 'active' && (
          <Box
            sx={{
              pb: 2,
              px: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            {/* Player info */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.3,
                minWidth: 80,
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  color: isHumanTurn ? '#d4a847' : '#a0b0a0',
                  fontWeight: 600,
                }}
              >
                {humanPlayer.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '1rem',
                  color: humanPlayer.money > 300 ? '#8fc98f' : '#e07070',
                  fontWeight: 600,
                }}
              >
                T$ {humanPlayer.money}
              </Typography>
            </Box>

            <PlayerHand
              cards={humanPlayer.hand}
              selectedCardId={selectedCardId}
              onCardClick={handleCardClick}
              foxBlackDiscarded={state.foxBlackDiscarded}
              foxRedDiscarded={state.foxRedDiscarded}
              selectable={discardMode && isHumanTurn}
            />

            {/* Human discarded cards */}
            {humanPlayer.discardedCards.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(160,180,160,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Descarte
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    opacity: 0.7,
                  }}
                >
                  {humanPlayer.discardedCards.map((card) => (
                    <CardComponent
                      key={card.id}
                      card={card}
                      size='medium'
                      invalidated={
                        (card.color === 'black' && state.foxBlackDiscarded) ||
                        (card.color === 'red' && state.foxRedDiscarded)
                      }
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Game Log - Desktop sidebar */}
      {!isMobile && showLog && (
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: 260,
            zIndex: 5,
            p: 1,
            pt: 5,
          }}
        >
          <GameLog log={state.log} players={state.players} />
        </Box>
      )}

      {/* Game Log - Mobile drawer */}
      {isMobile && (
        <Drawer
          anchor='right'
          open={showLog}
          onClose={() => setShowLog(false)}
          PaperProps={{
            sx: {
              width: 280,
              background: 'rgba(10,20,10,0.95)',
              borderLeft: '1px solid rgba(60,80,60,0.4)',
            },
          }}
        >
          <Box sx={{ p: 1, height: '100%' }}>
            <GameLog log={state.log} players={state.players} />
          </Box>
        </Drawer>
      )}

      {/* Double Prompt */}
      <DoublePrompt
        open={showDoublePrompt ?? false}
        doublerName={doublerName}
        newBetAmount={state.currentBetAmount * 2}
        onAccept={acceptDouble}
        onReject={rejectDouble}
      />

      {/* Round End Dialog */}
      <RoundEndDialog
        open={showScoring}
        result={state.roundResults}
        players={state.players}
        foxBlackDiscarded={state.foxBlackDiscarded}
        foxRedDiscarded={state.foxRedDiscarded}
        onNextRound={handleNextRound}
        onEndGame={handleEndGame}
        isHost={isHost}
        unlimitedMoney={state.unlimitedMoney}
      />
    </Box>
  );
}

export default GameTable;
