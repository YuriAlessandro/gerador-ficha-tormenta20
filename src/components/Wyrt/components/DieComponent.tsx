import React from 'react';
import { Box, Typography } from '@mui/material';
import { DieState } from '../engine/types';

interface DieComponentProps {
  die: DieState;
  size?: number;
  highlight?: boolean;
}

const DOT_POSITIONS: Record<number, Array<{ top: string; left: string }>> = {
  1: [{ top: '50%', left: '50%' }],
  2: [
    { top: '25%', left: '75%' },
    { top: '75%', left: '25%' },
  ],
  3: [
    { top: '25%', left: '75%' },
    { top: '50%', left: '50%' },
    { top: '75%', left: '25%' },
  ],
  4: [
    { top: '25%', left: '25%' },
    { top: '25%', left: '75%' },
    { top: '75%', left: '25%' },
    { top: '75%', left: '75%' },
  ],
  5: [
    { top: '25%', left: '25%' },
    { top: '25%', left: '75%' },
    { top: '50%', left: '50%' },
    { top: '75%', left: '25%' },
    { top: '75%', left: '75%' },
  ],
  6: [
    { top: '25%', left: '25%' },
    { top: '25%', left: '75%' },
    { top: '50%', left: '25%' },
    { top: '50%', left: '75%' },
    { top: '75%', left: '25%' },
    { top: '75%', left: '75%' },
  ],
};

function DieComponent({
  die,
  size = 32,
  highlight = false,
}: DieComponentProps) {
  const dotSize = Math.max(4, size * 0.15);

  if (die.eliminated) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '4px',
          background: 'rgba(60,60,60,0.6)',
          border: '1px solid rgba(100,100,100,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          opacity: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: size * 0.5,
            color: '#ff4444',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          X
        </Typography>
      </Box>
    );
  }

  if (!die.rolled || die.value === null) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '4px',
          background: 'linear-gradient(145deg, #f5f0e6, #e8e0d0)',
          border: '1px solid #c0b090',
          boxShadow:
            '0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: highlight ? 'pulse 1.5s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
            '50%': { boxShadow: '0 0 12px rgba(212,168,71,0.5)' },
          },
        }}
      >
        <Typography
          sx={{
            fontSize: size * 0.5,
            color: '#8a7a60',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ?
        </Typography>
      </Box>
    );
  }

  const positions = DOT_POSITIONS[die.value] ?? [];

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '4px',
        background: 'linear-gradient(145deg, #f5f0e6, #e8e0d0)',
        border: '1px solid #c0b090',
        boxShadow: highlight
          ? '0 0 10px rgba(212,168,71,0.6), 0 2px 6px rgba(0,0,0,0.3)'
          : '0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
        position: 'relative',
      }}
    >
      {positions.map((pos) => (
        <Box
          key={`dot-${die.value}-${pos.top}-${pos.left}`}
          sx={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: '#2d2d2d',
            top: pos.top,
            left: pos.left,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </Box>
  );
}

export default DieComponent;
