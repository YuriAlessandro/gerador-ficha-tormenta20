import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useDiceBox, DiceBoxConfig } from '../../hooks/useDiceBox';

interface DiceBox3DProps {
  config: DiceBoxConfig;
  visible: boolean;
}

export const DiceBox3D: React.FC<DiceBox3DProps> = ({ config, visible }) => {
  const { loading, error, isReady } = useDiceBox(config);

  if (!config.enabled) {
    return null;
  }

  return (
    <>
      {/* Container for the 3D canvas */}
      <Box
        id='dice-box-container'
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: visible ? 'auto' : 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 9999,
        }}
      />

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
