import React from 'react';
import { Box, Typography } from '@mui/material';
import { WyrtPlayer } from '../engine/types';
import CardComponent from './CardComponent';
import DieComponent from './DieComponent';

interface PlayerAreaProps {
  player: WyrtPlayer;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right' | 'top-left' | 'top-right';
  foxBlackDiscarded: boolean;
  foxRedDiscarded: boolean;
  compact?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function PlayerArea({
  player,
  isCurrentTurn,
  position: _position,
  foxBlackDiscarded,
  foxRedDiscarded,
  compact = false,
}: PlayerAreaProps) {
  const isFolded = player.status === 'folded';
  const isEliminated = player.status === 'eliminated';
  const isInactive = isFolded || isEliminated;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        opacity: isInactive ? 0.4 : 1,
        filter: isInactive ? 'grayscale(0.6)' : 'none',
        transition: 'opacity 0.5s, filter 0.5s',
        minWidth: compact ? 85 : 120,
      }}
    >
      {/* Avatar + name */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.3,
        }}
      >
        <Box
          sx={{
            width: compact ? 42 : 52,
            height: compact ? 42 : 52,
            borderRadius: '50%',
            background: isCurrentTurn
              ? 'linear-gradient(135deg, #d4a847, #b8922e)'
              : 'linear-gradient(135deg, #4a5a4a, #3a4a3a)',
            border: isCurrentTurn ? '2px solid #f0d060' : '2px solid #5a6a5a',
            boxShadow: isCurrentTurn
              ? '0 0 15px rgba(212,168,71,0.5)'
              : '0 2px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <Typography
            sx={{
              fontSize: compact ? '0.95rem' : '1.1rem',
              fontWeight: 700,
              color: isCurrentTurn ? '#1a2a1a' : '#c0d0c0',
              lineHeight: 1,
            }}
          >
            {getInitials(player.name)}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: '1rem',
            color: isCurrentTurn ? '#d4a847' : '#a0b0a0',
            fontWeight: isCurrentTurn ? 700 : 500,
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            maxWidth: 120,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {player.name}
        </Typography>

        {/* Money */}
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: player.money > 300 ? '#8fc98f' : '#e07070',
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          T$ {player.money}
        </Typography>
      </Box>

      {/* Status badges */}
      {isFolded && (
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: '#e07070',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Fora
        </Typography>
      )}

      {isEliminated && (
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: '#888',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Eliminado
        </Typography>
      )}

      {/* Die */}
      {!isEliminated && (
        <DieComponent
          die={player.die}
          size={compact ? 28 : 34}
          highlight={isCurrentTurn}
        />
      )}

      {/* Face-down cards (opponent's hand) */}
      {!isInactive && player.hand.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: '-8px',
            mt: 0.3,
          }}
        >
          {player.hand.map((card, cardIndex) => (
            <Box key={card.id} sx={{ ml: cardIndex > 0 ? '-12px' : 0 }}>
              <CardComponent faceDown size='small' />
            </Box>
          ))}
        </Box>
      )}

      {/* Discarded cards (face-up) */}
      {player.discardedCards.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.3,
            mt: 0.3,
          }}
        >
          {player.discardedCards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              size='small'
              invalidated={
                (card.color === 'black' && foxBlackDiscarded) ||
                (card.color === 'red' && foxRedDiscarded)
              }
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default PlayerArea;
