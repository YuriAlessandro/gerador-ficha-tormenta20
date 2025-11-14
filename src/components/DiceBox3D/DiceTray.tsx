import React, { useEffect, useRef } from 'react';
import { Box, IconButton, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDiceBox, DiceBoxConfig } from '../../hooks/useDiceBox';

interface DiceTrayProps {
  config: DiceBoxConfig;
  visible: boolean;
  onClose: () => void;
}

export const DiceTray: React.FC<DiceTrayProps> = ({
  config,
  visible,
  onClose,
}) => {
  const trayRef = useRef<HTMLDivElement>(null);

  // Create container as soon as component mounts (not waiting for visible)
  useEffect(() => {
    if (config.enabled && trayRef.current) {
      // Remove any existing container first
      const existing = document.getElementById('dice-box-container');
      if (existing) {
        existing.remove();
      }

      // Create new container inside tray
      const diceContainer = document.createElement('div');
      diceContainer.id = 'dice-box-container';
      diceContainer.style.width = '100%';
      diceContainer.style.height = '100%';
      diceContainer.style.position = 'absolute';
      diceContainer.style.top = '0';
      diceContainer.style.left = '0';
      trayRef.current.appendChild(diceContainer);
    }

    return () => {
      const diceContainer = document.getElementById('dice-box-container');
      if (diceContainer) {
        diceContainer.remove();
      }
    };
  }, [config.enabled]);

  const { loading, error, isReady } = useDiceBox(config);

  if (!config.enabled) {
    return null;
  }

  return (
    <>
      {/* Overlay escuro */}
      {visible && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onClose}
        />
      )}

      {/* Dice Tray */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90vw', sm: '600px' },
          height: { xs: '60vh', sm: '400px' },
          backgroundColor: '#2d1810',
          backgroundImage:
            'linear-gradient(135deg, #3d2817 0%, #2d1810 50%, #3d2817 100%)',
          borderRadius: '16px',
          border: '4px solid #8b6914',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          overflow: 'hidden',
          display: visible ? 'block' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bot\u00e3o fechar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10001,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Container para o canvas 3D */}
        <Box
          ref={trayRef}
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        />

        {/* Loading overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10000,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Error display */}
        {error && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '90%',
              zIndex: 10000,
            }}
          >
            <Alert severity='error'>
              Erro ao carregar dados 3D: {error.message}
            </Alert>
          </Box>
        )}

        {/* Ready indicator (debug) */}
        {isReady && process.env.NODE_ENV === 'development' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              padding: 0.5,
              bgcolor: 'success.main',
              color: 'white',
              borderRadius: 1,
              fontSize: 10,
              zIndex: 10000,
            }}
          >
            3D Ready
          </Box>
        )}
      </Box>
    </>
  );
};

export default DiceTray;
