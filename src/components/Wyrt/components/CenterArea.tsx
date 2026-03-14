import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { RolledDie } from '../engine/types';
import FoxNumberDisplay from './FoxNumberDisplay';
import DieComponent from './DieComponent';

interface CenterAreaProps {
  foxNumber: number;
  rolledDice: RolledDie[];
  pot: number;
  drawPileCount: number;
  showFoxNumber: boolean;
  compact?: boolean;
}

function CenterArea({
  foxNumber,
  rolledDice,
  pot,
  drawPileCount,
  showFoxNumber,
  compact = false,
}: CenterAreaProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? 0.5 : 1.5,
      }}
    >
      {/* Fox Number */}
      <FoxNumberDisplay
        foxNumber={foxNumber}
        visible={showFoxNumber}
        compact={compact}
      />

      {/* Rolled dice row */}
      {rolledDice.length > 0 && (
        <Stack direction='row' spacing={0.5} alignItems='center'>
          {rolledDice.map((rd) => (
            <DieComponent
              key={`rolled-${rd.playerId}`}
              die={{ rolled: true, eliminated: false, value: rd.value }}
              size={28}
            />
          ))}
        </Stack>
      )}

      {/* Pot */}
      <Box
        sx={{
          background: 'rgba(20,35,20,0.7)',
          border: '1px solid rgba(212,168,71,0.3)',
          borderRadius: '8px',
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8rem',
            color: 'rgba(212,168,71,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Pote:
        </Typography>
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#d4a847',
            fontFamily: '"Tfont", serif',
            textShadow: '0 0 8px rgba(212,168,71,0.3)',
          }}
        >
          T$ {pot}
        </Typography>
      </Box>

      {/* Draw pile (monte) */}
      {drawPileCount > 0 && (
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
              position: 'relative',
              width: compact ? 32 : 40,
              height: compact ? 44 : 56,
            }}
          >
            {[0, 1, 2].map((offset) => (
              <Box
                key={`pile-${offset}`}
                sx={{
                  position: 'absolute',
                  top: -offset * 2,
                  left: offset * 1,
                  width: compact ? 30 : 38,
                  height: compact ? 42 : 54,
                  borderRadius: '4px',
                  background:
                    'linear-gradient(135deg, #1a2a1a 0%, #0d1f0d 50%, #1a2a1a 100%)',
                  border: '1.5px solid #2d4a2d',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              />
            ))}
          </Box>
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: 'rgba(160,176,160,0.6)',
              mt: 0.3,
            }}
          >
            Monte ({drawPileCount})
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default CenterArea;
