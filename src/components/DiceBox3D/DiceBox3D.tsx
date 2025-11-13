import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useDiceBox, DiceBoxConfig } from '../../hooks/useDiceBox';

interface DiceBox3DProps {
  config: DiceBoxConfig;
}

export const DiceBox3D: React.FC<DiceBox3DProps> = ({ config }) => {
  const { loading, error, isReady } = useDiceBox(config);

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
