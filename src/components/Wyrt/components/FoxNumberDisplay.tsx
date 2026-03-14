import React from 'react';
import { Box, Typography } from '@mui/material';

interface FoxNumberDisplayProps {
  foxNumber: number;
  visible: boolean;
  compact?: boolean;
}

function FoxNumberDisplay({
  foxNumber,
  visible,
  compact = false,
}: FoxNumberDisplayProps) {
  const circleSize = compact ? 76 : 100;
  const outerSize = compact ? 84 : 110;

  if (!visible) {
    return (
      <Box
        sx={{
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(30,50,30,0.8) 0%, rgba(15,30,15,0.6) 100%)',
          border: '2px solid rgba(212,168,71,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography
          sx={{
            fontSize: compact ? '0.7rem' : '0.85rem',
            color: 'rgba(212,168,71,0.4)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            textAlign: 'center',
          }}
        >
          Aguardando...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: outerSize,
        height: outerSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Outer glow ring */}
      <Box
        sx={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(212,168,71,0.15) 0%, transparent 70%)',
          animation: 'foxGlow 3s ease-in-out infinite',
          '@keyframes foxGlow': {
            '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
            '50%': { opacity: 1, transform: 'scale(1.05)' },
          },
        }}
      />

      {/* Main circle */}
      <Box
        sx={{
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 40% 35%, rgba(50,70,40,0.95) 0%, rgba(25,40,20,0.95) 100%)',
          border: '3px solid #d4a847',
          boxShadow:
            '0 0 20px rgba(212,168,71,0.3), inset 0 0 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Fox watermark */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15 L30 5 L35 30 L20 45 L35 50 L30 70 L40 65 L50 85 L60 65 L70 70 L65 50 L80 45 L65 30 L70 5 Z' fill='%23d4a84715'/%3E%3C/svg%3E")`,
            backgroundSize: '70%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.6,
          }}
        />

        <Typography
          key={foxNumber}
          sx={{
            fontSize: compact ? '2rem' : '2.5rem',
            fontWeight: 900,
            color: '#d4a847',
            textShadow:
              '0 0 10px rgba(212,168,71,0.5), 0 2px 4px rgba(0,0,0,0.5)',
            fontFamily: '"Tfont", serif',
            lineHeight: 1,
            zIndex: 1,
            animation: 'foxNumberPop 0.4s ease-out',
            '@keyframes foxNumberPop': {
              '0%': { transform: 'scale(1.4)', opacity: 0.5 },
              '60%': { transform: 'scale(0.95)' },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          {foxNumber}
        </Typography>
      </Box>

      {/* Label */}
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: '#d4a847',
          textTransform: 'uppercase',
          letterSpacing: 2,
          mt: 0.5,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          fontWeight: 600,
          zIndex: 1,
          whiteSpace: 'nowrap',
        }}
      >
        N. da Raposa
      </Typography>
    </Box>
  );
}

export default FoxNumberDisplay;
