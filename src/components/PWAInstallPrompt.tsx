import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { usePWAInstall } from '../hooks/usePWAInstall';

const PWAInstallPrompt: React.FC = () => {
  const { isStandalone, canPromptInstall, promptInstall } = usePWAInstall();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (!canPromptInstall || isStandalone) return;

    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    const daysSinceLastDismiss = lastDismissed
      ? Math.floor(
          (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24)
        )
      : 999;

    if (daysSinceLastDismiss > 7) {
      setShowInstallPrompt(true);
    }
  }, [canPromptInstall, isStandalone]);

  const handleInstallClick = async () => {
    await promptInstall();
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || !canPromptInstall) {
    return null;
  }

  return (
    <>
      <Snackbar
        open={showInstallPrompt}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: 16, sm: 24 } }}
      >
        <Alert
          severity='info'
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color='inherit'
                size='small'
                onClick={handleInstallClick}
                startIcon={<GetAppIcon />}
              >
                Instalar
              </Button>
              <Button color='inherit' size='small' onClick={handleDismiss}>
                Dispensar
              </Button>
            </Box>
          }
          onClose={handleDismiss}
          sx={{ alignItems: 'center' }}
        >
          Instale Fichas de Nimb no seu dispositivo.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAInstallPrompt;
