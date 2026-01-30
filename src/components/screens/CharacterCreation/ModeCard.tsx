import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import './characterCreation.css';

export type ModePosition = 'left' | 'right';

interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  shortTitle: string;
  description: string;
  isMinimized: boolean;
  position: ModePosition;
  onClick: () => void;
  onBack?: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

const ModeCard: React.FC<ModeCardProps> = ({
  icon,
  title,
  shortTitle,
  description,
  isMinimized,
  position: _position,
  onClick,
  onBack,
  variant = 'default',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const handleClick = () => {
    if (isMinimized && onBack) {
      onBack();
    } else if (!isMinimized) {
      onClick();
    }
  };

  const getVariantClass = () => {
    if (variant === 'primary') return 'primary';
    if (variant === 'secondary') return 'secondary';
    return isDark ? 'dark' : 'light';
  };

  const getBackgroundStyle = () => {
    if (variant === 'primary') {
      return `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
    }
    if (variant === 'secondary') {
      return `linear-gradient(135deg, #424242 0%, #212121 100%)`;
    }
    if (isDark) {
      return 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)';
    }
    return 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
  };

  const getBorderColor = () => {
    if (variant === 'primary') return theme.palette.primary.dark;
    if (isDark) return '#404040';
    return '#e0e0e0';
  };

  const getHoverBorderColor = () => {
    if (variant === 'primary') return theme.palette.primary.main;
    if (isDark) return '#505050';
    return '#bdbdbd';
  };

  const getDescriptionColor = () => {
    if (variant === 'primary' || variant === 'secondary') {
      return 'rgba(255, 255, 255, 0.85)';
    }
    if (isDark) return '#b0b0b0';
    return '#666666';
  };

  const getButtonColor = () => {
    if (variant === 'primary') return '#ffffff';
    if (variant === 'secondary' || isDark) return '#ffffff';
    return 'inherit';
  };

  const getButtonHoverBg = () => {
    if (variant === 'primary' || variant === 'secondary' || isDark) {
      return 'rgba(255, 255, 255, 0.1)';
    }
    return undefined;
  };

  return (
    <Box
      className={`mode-card ${
        isMinimized ? 'minimized' : ''
      } ${getVariantClass()}`}
      onClick={handleClick}
      sx={{
        background: getBackgroundStyle(),
        color:
          variant === 'primary' || variant === 'secondary' || isDark
            ? '#ffffff'
            : 'inherit',
        border: `1px solid ${getBorderColor()}`,
        '&:hover': {
          borderColor: getHoverBorderColor(),
        },
      }}
    >
      <Box className='mode-card-icon'>{icon}</Box>

      <Typography
        className='mode-card-title'
        variant='h6'
        component='h3'
        sx={{
          fontSize: isMinimized ? '0.75rem' : { xs: '1rem', sm: '1.25rem' },
        }}
      >
        {isMinimized ? shortTitle : title}
      </Typography>

      <Typography
        className='mode-card-description'
        variant='body2'
        sx={{
          color: getDescriptionColor(),
        }}
      >
        {description}
      </Typography>

      {!isMinimized && (
        <Button
          className='mode-card-button'
          variant={variant === 'primary' ? 'contained' : 'outlined'}
          size={isMobile ? 'medium' : 'small'}
          endIcon={<ArrowForwardIcon />}
          sx={{
            mt: 2,
            color: getButtonColor(),
            borderColor:
              variant === 'primary' || variant === 'secondary' || isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : undefined,
            '&:hover': {
              borderColor:
                variant === 'primary' || variant === 'secondary' || isDark
                  ? 'rgba(255, 255, 255, 0.8)'
                  : undefined,
              backgroundColor: getButtonHoverBg(),
            },
          }}
        >
          Começar
        </Button>
      )}

      {isMinimized && (
        <Button
          variant='text'
          size='small'
          sx={{
            mt: 1,
            color: getButtonColor(),
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: getButtonHoverBg(),
            },
          }}
        >
          Alterar modo
        </Button>
      )}
    </Box>
  );
};

export default ModeCard;
