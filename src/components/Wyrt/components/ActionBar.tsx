import React from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StyleIcon from '@mui/icons-material/Style';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { WyrtActionType } from '../engine/types';

interface ActionBarProps {
  availableActions: WyrtActionType[];
  onRollDie: () => void;
  onDoubleBet: () => void;
  onDiscardCard: () => void;
  onEliminateDie: () => void;
  onCallMostrem: () => void;
  discardMode: boolean;
  disabled: boolean;
}

interface ActionButtonConfig {
  action: WyrtActionType;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  hoverColor: string;
}

function ActionBar({
  availableActions,
  onRollDie,
  onDoubleBet,
  onDiscardCard,
  onEliminateDie,
  onCallMostrem,
  discardMode,
  disabled,
}: ActionBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buttons: ActionButtonConfig[] = [
    {
      action: 'ROLL_DIE',
      label: 'Rolar Dado',
      shortLabel: 'Dado',
      icon: <CasinoIcon fontSize='small' />,
      onClick: onRollDie,
      color: '#2d6a2d',
      hoverColor: '#3d8a3d',
    },
    {
      action: 'DOUBLE_BET',
      label: 'DOBRO!',
      shortLabel: 'DOBRO!',
      icon: <MonetizationOnIcon fontSize='small' />,
      onClick: onDoubleBet,
      color: '#b8922e',
      hoverColor: '#d4a847',
    },
    {
      action: 'DISCARD_CARD',
      label: discardMode ? 'Cancelar' : 'Descartar',
      shortLabel: discardMode ? 'Cancelar' : 'Descartar',
      icon: <StyleIcon fontSize='small' />,
      onClick: onDiscardCard,
      color: discardMode ? '#8a4444' : '#5a4a8a',
      hoverColor: discardMode ? '#aa5555' : '#7a6aaa',
    },
    {
      action: 'ELIMINATE_DIE',
      label: 'Eliminar Dado',
      shortLabel: 'Eliminar',
      icon: <CloseIcon fontSize='small' />,
      onClick: onEliminateDie,
      color: '#8a3030',
      hoverColor: '#aa4444',
    },
    {
      action: 'CALL_MOSTREM',
      label: 'MOSTREM!',
      shortLabel: 'MOSTREM!',
      icon: <VisibilityIcon fontSize='small' />,
      onClick: onCallMostrem,
      color: '#3a5a8a',
      hoverColor: '#4a7aaa',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.8,
        justifyContent: 'center',
        flexWrap: 'wrap',
        px: 1,
        py: 0.5,
      }}
    >
      {buttons.map((btn) => {
        const isAvailable = availableActions.includes(btn.action);
        const isDisabled = disabled || !isAvailable;

        if (!isAvailable && btn.action !== 'DISCARD_CARD') return null;
        if (btn.action === 'DISCARD_CARD' && !isAvailable && !discardMode)
          return null;

        return (
          <Button
            key={btn.action}
            onClick={btn.onClick}
            disabled={isDisabled}
            startIcon={!isMobile ? btn.icon : undefined}
            sx={{
              background: isDisabled
                ? 'rgba(60,60,60,0.5)'
                : `linear-gradient(180deg, ${btn.hoverColor} 0%, ${btn.color} 100%)`,
              color: isDisabled ? 'rgba(150,150,150,0.5)' : '#fff',
              border: isDisabled
                ? '1px solid rgba(80,80,80,0.3)'
                : `1px solid ${btn.hoverColor}`,
              borderRadius: '6px',
              px: isMobile ? 1.2 : 2,
              py: 0.6,
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: isDisabled
                ? 'none'
                : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              minWidth: isMobile ? 'auto' : 100,
              transition: 'all 0.2s ease',
              textShadow: isDisabled ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
              '&:hover': {
                background: `linear-gradient(180deg, ${btn.hoverColor} 20%, ${btn.color} 100%)`,
                boxShadow:
                  '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(1px)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              },
              '&.Mui-disabled': {
                color: 'rgba(150,150,150,0.5)',
              },
            }}
          >
            {isMobile ? btn.icon : null}
            {isMobile ? ` ${btn.shortLabel}` : btn.label}
          </Button>
        );
      })}
    </Box>
  );
}

export default ActionBar;
