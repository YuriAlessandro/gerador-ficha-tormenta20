import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    const checkStandalone = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Only show prompt if not already installed and user hasn't dismissed it recently
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      const daysSinceLastDismiss = lastDismissed
        ? Math.floor(
            (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24)
          )
        : 999;

      if (daysSinceLastDismiss > 7) {
        // Show again after 7 days
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // PWA installed successfully
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || !deferredPrompt) {
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
