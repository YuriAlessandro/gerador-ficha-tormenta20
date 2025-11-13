import React, { useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useDiceBox, DiceBoxConfig } from '../../hooks/useDiceBox';
import { createPortal } from 'react-dom';

interface DiceBox3DProps {
  config: DiceBoxConfig;
  visible: boolean;
}

export const DiceBox3D: React.FC<DiceBox3DProps> = ({ config, visible }) => {
  const { loading, error, isReady } = useDiceBox(config);

  useEffect(() => {
    // Create the dice-box-container div if it doesn't exist
    let container = document.getElementById('dice-box-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dice-box-container';
      document.body.appendChild(container);
    }

    // Apply visibility styles
    if (visible) {
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }

    // Cleanup on unmount
    return () => {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, [visible]);

  if (!config.enabled) {
    return null;
  }

  return (
    <>
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
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
            position: 'fixed',
            bottom: 16,
            right: 16,
            maxWidth: '300px',
            zIndex: 10000,
          }}
        >
          <Alert severity='error' onClose={() => {}}>
            Erro ao carregar dados 3D: {error.message}
          </Alert>
        </Box>
      )}

      {/* Ready indicator (debug - remover em produção) */}
      {isReady && process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            padding: 1,
            bgcolor: 'success.main',
            color: 'white',
            borderRadius: 1,
            fontSize: 12,
            zIndex: 10000,
          }}
        >
          Dados 3D prontos
        </Box>
      )}
    </>
  );
};

export default DiceBox3D;
