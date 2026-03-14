import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { GameLogEntry, WyrtPlayer } from '../engine/types';

interface GameLogProps {
  log: GameLogEntry[];
  players: WyrtPlayer[];
  compact?: boolean;
}

function getActionColor(action: string): string {
  switch (action) {
    case 'ROLL_DIE':
      return '#8fc98f';
    case 'DOUBLE_BET':
      return '#d4a847';
    case 'ACCEPT_DOUBLE':
      return '#8faacc';
    case 'REJECT_DOUBLE':
      return '#e07070';
    case 'DISCARD_CARD':
      return '#c090d0';
    case 'ELIMINATE_DIE':
      return '#cc8a6a';
    case 'CALL_MOSTREM':
      return '#70c0e0';
    default:
      return '#a0b0a0';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function GameLog({ log, players, compact = false }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log.length]);

  const getPlayerName = (playerId: string): string => {
    if (playerId === 'system') return 'Sistema';
    return players.find((p) => p.id === playerId)?.name ?? 'Desconhecido';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'rgba(10,20,10,0.85)',
        border: '1px solid rgba(60,80,60,0.4)',
        borderRadius: '8px',
        height: compact ? 150 : '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.8,
          borderBottom: '1px solid rgba(60,80,60,0.3)',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: '#d4a847',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}
        >
          Registro
        </Typography>
      </Box>

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1,
          py: 0.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(100,120,100,0.4)',
            borderRadius: 2,
          },
        }}
      >
        {log.map((entry) => {
          const playerName = getPlayerName(entry.playerId);
          const color = getActionColor(entry.action);

          return (
            <Box
              key={entry.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.8,
                py: 0.4,
                borderBottom: '1px solid rgba(40,60,40,0.2)',
                animation: 'logFadeIn 0.3s ease-out',
                '@keyframes logFadeIn': {
                  from: { opacity: 0, transform: 'translateY(4px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              {entry.playerId !== 'system' && (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(60,80,60,0.6)',
                    border: `1px solid ${color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.2,
                  }}
                >
                  <Typography
                    sx={{ fontSize: '0.6rem', color, fontWeight: 700 }}
                  >
                    {getInitials(playerName)}
                  </Typography>
                </Box>
              )}

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: 'rgba(180,200,180,0.9)',
                  lineHeight: 1.4,
                  '& strong': {
                    color,
                    fontWeight: 700,
                  },
                }}
              >
                {entry.details}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export default GameLog;
