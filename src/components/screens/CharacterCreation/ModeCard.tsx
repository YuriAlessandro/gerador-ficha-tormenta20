import React from 'react';
import { Box, Typography, Chip, useTheme, alpha } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import './characterCreation.css';

export type ModeAccent = 'edit' | 'random';

interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  shortTitle: string;
  description?: string;
  /** Small chips giving a real basis to choose (speed / audience). */
  speedLabel?: string;
  audienceLabel?: string;
  isMinimized?: boolean;
  onClick: () => void;
  onBack?: () => void;
  accent?: ModeAccent;
}

const ModeCard: React.FC<ModeCardProps> = ({
  icon,
  title,
  shortTitle,
  description,
  speedLabel,
  audienceLabel,
  isMinimized = false,
  onClick,
  onBack,
  accent = 'edit',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Each mode gets a distinct identity color so the two cards never read as twins.
  const accentColor =
    accent === 'random' ? theme.palette.info.main : theme.palette.primary.main;

  const handleActivate = () => {
    if (isMinimized) {
      onBack?.();
    } else {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivate();
    }
  };

  const cardBackground = isDark
    ? `linear-gradient(160deg, ${alpha(accentColor, 0.1)} 0%, ${
        theme.palette.background.paper
      } 55%)`
    : `linear-gradient(160deg, ${alpha(accentColor, 0.06)} 0%, ${
        theme.palette.background.paper
      } 55%)`;

  const iconChip = (
    <Box
      className='mode-card-icon'
      sx={{
        backgroundColor: alpha(accentColor, isDark ? 0.22 : 0.12),
        color: accentColor,
      }}
    >
      {icon}
    </Box>
  );

  const ariaLabel = isMinimized
    ? `Trocar modo de criação (atual: ${title})`
    : `Selecionar: ${title}`;

  return (
    <Box
      className={`mode-card ${isMinimized ? 'minimized' : ''}`}
      role='button'
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      sx={{
        background: cardBackground,
        border: `1px solid ${
          isDark ? theme.palette.divider : alpha(accentColor, 0.25)
        }`,
        borderLeft: `3px solid ${accentColor}`,
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            borderColor: alpha(accentColor, 0.6),
          },
        },
      }}
    >
      {iconChip}

      <Typography className='mode-card-title' component='h3'>
        {isMinimized ? shortTitle : title}
      </Typography>

      {!isMinimized && (speedLabel || audienceLabel) && (
        <Box className='mode-card-meta'>
          {speedLabel && (
            <Chip
              label={speedLabel}
              size='small'
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: alpha(accentColor, isDark ? 0.22 : 0.12),
                color: accentColor,
              }}
            />
          )}
          {audienceLabel && (
            <Chip
              label={audienceLabel}
              size='small'
              variant='outlined'
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      )}

      {!isMinimized && description && (
        <Typography
          className='mode-card-description'
          variant='body2'
          color='text.secondary'
        >
          {description}
        </Typography>
      )}

      {!isMinimized && (
        <Box className='mode-card-arrow' sx={{ color: accentColor }}>
          <ArrowForwardIcon fontSize='small' />
        </Box>
      )}

      {isMinimized && (
        <Box
          className='mode-card-swap'
          sx={{ color: 'text.secondary' }}
          aria-hidden
        >
          <SwapHorizIcon sx={{ fontSize: '1rem' }} />
          <span>Trocar</span>
        </Box>
      )}
    </Box>
  );
};

export default ModeCard;
