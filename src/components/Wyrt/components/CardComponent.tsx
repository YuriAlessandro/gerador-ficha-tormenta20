import React from 'react';
import { Box, Typography } from '@mui/material';
import { WyrtCard } from '../engine/types';

interface CardComponentProps {
  card?: WyrtCard;
  faceDown?: boolean;
  selected?: boolean;
  invalidated?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  hoverable?: boolean;
}

const FOX_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15 L30 5 L35 30 L20 45 L35 50 L30 70 L40 65 L50 85 L60 65 L70 70 L65 50 L80 45 L65 30 L70 5 Z' fill='%23ffffff30'/%3E%3C/svg%3E")`;

const CARD_SIZES = {
  small: { width: 54, height: 81 },
  medium: { width: 72, height: 108 },
  large: { width: 100, height: 150 },
};

function CardComponent({
  card,
  faceDown = false,
  selected = false,
  invalidated = false,
  onClick,
  size = 'medium',
  hoverable = false,
}: CardComponentProps) {
  const dimensions = CARD_SIZES[size];
  const fontSizeMap = { small: '1.3rem', medium: '1.9rem', large: '2.8rem' };
  const fontSize = fontSizeMap[size];
  const cornerSize = size === 'small' ? '0.6rem' : '0.75rem';

  if (faceDown || !card) {
    return (
      <Box
        onClick={onClick}
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: '6px',
          background:
            'linear-gradient(135deg, #1a2a1a 0%, #0d1f0d 50%, #1a2a1a 100%)',
          border: '2px solid #2d4a2d',
          boxShadow:
            '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          backgroundImage: FOX_SVG,
          backgroundSize: '60%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '3px',
            border: '1px solid #3d5a3d',
            borderRadius: '4px',
            pointerEvents: 'none',
          },
        }}
      />
    );
  }

  const isRed = card.color === 'red';
  const isFox = card.type === 'fox';
  const bgGradient = isRed
    ? 'linear-gradient(145deg, #c41e3a 0%, #a01830 40%, #8a1428 100%)'
    : 'linear-gradient(145deg, #3a3a3a 0%, #2d2d2d 40%, #1e1e1e 100%)';

  return (
    <Box
      onClick={onClick}
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: '6px',
        background: bgGradient,
        border: selected
          ? '2px solid #d4a847'
          : `2px solid ${isRed ? '#e0445a' : '#555'}`,
        boxShadow: selected
          ? '0 0 12px rgba(212,168,71,0.6), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.4)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: selected ? 'translateY(-8px)' : 'none',
        transition:
          'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        filter: invalidated ? 'grayscale(0.8) brightness(0.6)' : 'none',
        overflow: 'hidden',
        '&:hover': hoverable
          ? {
              transform: 'translateY(-12px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            }
          : undefined,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
          borderRadius: '4px 4px 0 0',
          pointerEvents: 'none',
        },
      }}
    >
      {invalidated && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '120%',
              height: '2px',
              background: '#ff4444',
              transform: 'rotate(-35deg)',
            },
          }}
        />
      )}

      {isFox ? (
        <Box
          sx={{
            width: '70%',
            height: '70%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15 L30 5 L35 30 L20 45 L35 50 L30 70 L40 65 L50 85 L60 65 L70 70 L65 50 L80 45 L65 30 L70 5 Z' fill='%23ffffff'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.9,
          }}
        />
      ) : (
        <>
          <Typography
            sx={{
              fontSize,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Tfont", serif',
              lineHeight: 1,
              zIndex: 1,
            }}
          >
            {card.value}
          </Typography>

          <Typography
            sx={{
              position: 'absolute',
              top: '3px',
              left: '4px',
              fontSize: cornerSize,
              fontWeight: 700,
              color: '#fff',
              opacity: 0.8,
              lineHeight: 1,
              zIndex: 1,
            }}
          >
            {card.value}
          </Typography>

          <Typography
            sx={{
              position: 'absolute',
              bottom: '3px',
              right: '4px',
              fontSize: cornerSize,
              fontWeight: 700,
              color: '#fff',
              opacity: 0.8,
              lineHeight: 1,
              transform: 'rotate(180deg)',
              zIndex: 1,
            }}
          >
            {card.value}
          </Typography>
        </>
      )}

      <Box
        sx={{
          position: 'absolute',
          inset: '3px',
          border: `1px solid ${
            isRed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'
          }`,
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

export default CardComponent;
