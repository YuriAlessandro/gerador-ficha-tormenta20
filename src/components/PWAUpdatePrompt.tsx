import React, { useState, useEffect, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

interface PWAUpdatePromptProps {
  /**
   * Function to trigger the service worker update
   * This should be the updateSW function from vite-plugin-pwa
   */
  onUpdate: (reloadPage?: boolean) => void;
}

/**
 * Component to show a visible notification when a new PWA version is available.
 * This replaces the native confirm() dialog with a more visible Material-UI snackbar.
 */
const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({ onUpdate }) => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Listen for the custom event dispatched when update is available
  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = useCallback(() => {
    setIsUpdating(true);
    // Small delay for visual feedback before reload
    setTimeout(() => {
      onUpdate(true);
    }, 300);
  }, [onUpdate]);

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    // Store dismissal time - will show again after 30 minutes
    sessionStorage.setItem('pwa-update-dismissed', Date.now().toString());
  };

  // Auto-show again after 30 minutes if dismissed
  useEffect(() => {
    if (!showUpdatePrompt) {
      const dismissedAt = sessionStorage.getItem('pwa-update-dismissed');
      if (dismissedAt) {
        const thirtyMinutes = 30 * 60 * 1000;
        const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
        if (timeSinceDismiss > thirtyMinutes) {
          // Check if there's still a pending update
          const hasPendingUpdate =
            sessionStorage.getItem('pwa-has-pending-update') === 'true';
          if (hasPendingUpdate) {
            setShowUpdatePrompt(true);
          }
        }
      }
    }
  }, [showUpdatePrompt]);

  return (
    <Snackbar
      open={showUpdatePrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        bottom: { xs: 80, sm: 24 },
        '& .MuiSnackbarContent-root': {
          minWidth: { xs: '90vw', sm: 'auto' },
        },
      }}
    >
      <Alert
        severity='info'
        icon={<NewReleasesIcon />}
        sx={{
          alignItems: 'center',
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          },
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
            <Button
              color='primary'
              variant='contained'
              size='small'
              onClick={handleUpdate}
              disabled={isUpdating}
              startIcon={
                isUpdating ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  <RefreshIcon />
                )
              }
            >
              {isUpdating ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button
              color='inherit'
              size='small'
              onClick={handleDismiss}
              disabled={isUpdating}
            >
              Depois
            </Button>
          </Box>
        }
      >
        <Typography variant='body2'>
          <strong>Nova versão disponível!</strong>
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default PWAUpdatePrompt;
