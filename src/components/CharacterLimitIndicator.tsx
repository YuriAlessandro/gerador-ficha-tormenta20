import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LimitBoost, NO_BOOST } from '../functions/limitBoost';
import { BoostFlame } from './common/BoostedLimit';

interface CharacterLimitIndicatorProps {
  current: number;
  max: number;
  size?: number;
  /** Boost global de limites — desenha a chama sobre o anel quando ativo. */
  boost?: LimitBoost;
  /** Limite sem boost, para o tooltip "10 → 15". */
  baseMax?: number;
}

const ProgressContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ProgressText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
}));

const CharacterLimitIndicator: React.FC<CharacterLimitIndicatorProps> = ({
  current,
  max,
  size = 60,
  boost = NO_BOOST,
  baseMax,
}) => {
  const percentage = (current / max) * 100;
  const isNearLimit = current >= max * 0.8;
  const isAtLimit = current >= max;

  const getColor = () => {
    if (isAtLimit) return 'error';
    if (isNearLimit) return 'warning';
    return 'primary';
  };

  return (
    <ProgressContainer>
      <CircularProgress
        variant='determinate'
        value={percentage}
        size={size}
        thickness={4}
        color={getColor()}
        sx={{
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <CircularProgress
        variant='determinate'
        value={100}
        size={size}
        thickness={4}
        sx={{
          color: (theme) => theme.palette.grey[200],
          position: 'absolute',
          left: 0,
          zIndex: -1,
        }}
      />
      <ProgressText variant='caption'>
        {current}/{max}
      </ProgressText>
      {boost.active && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            right: -6,
            display: 'inline-flex',
            lineHeight: 0,
          }}
        >
          <BoostFlame boost={boost} baseValue={baseMax} boostedValue={max} />
        </Box>
      )}
    </ProgressContainer>
  );
};

export default CharacterLimitIndicator;
