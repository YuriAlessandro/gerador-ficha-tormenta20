import React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AppleIcon from '@mui/icons-material/Apple';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import ComputerIcon from '@mui/icons-material/Computer';
import GetAppIcon from '@mui/icons-material/GetApp';
import { PlatformInfo, Platform } from '../../../hooks/usePlatformDetection';
import IOSInstructions from './IOSInstructions';

interface PlatformInstallCardProps {
  platformInfo: PlatformInfo;
  canPromptInstall: boolean;
  onInstallClick: () => void;
}

function getPlatformIcon(platform: Platform): React.ReactNode {
  const iconSx = { fontSize: 48 };
  switch (platform) {
    case 'android':
      return <PhoneAndroidIcon sx={iconSx} />;
    case 'ios':
      return <AppleIcon sx={iconSx} />;
    case 'windows':
      return <DesktopWindowsIcon sx={iconSx} />;
    case 'mac':
      return <LaptopMacIcon sx={iconSx} />;
    case 'linux':
      return <ComputerIcon sx={iconSx} />;
    default:
      return <GetAppIcon sx={iconSx} />;
  }
}

function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'android':
      return 'Android';
    case 'ios':
      return 'iPhone / iPad';
    case 'windows':
      return 'Windows';
    case 'mac':
      return 'Mac';
    case 'linux':
      return 'Linux';
    default:
      return 'seu dispositivo';
  }
}

function getInstallButtonText(platform: Platform): string {
  switch (platform) {
    case 'android':
      return 'Instalar App';
    case 'windows':
      return 'Instalar no PC';
    case 'mac':
      return 'Instalar no Mac';
    case 'linux':
      return 'Instalar no Computador';
    default:
      return 'Instalar App';
  }
}

function getManualInstructions(platformInfo: PlatformInfo): string {
  const { platform, browser } = platformInfo;

  if (platform === 'android') {
    return 'Abra este site no Google Chrome, toque no menu (três pontos) e selecione "Adicionar à tela inicial".';
  }

  if (platform === 'mac' && browser === 'safari') {
    return 'No Safari, acesse o menu Arquivo > Adicionar ao Dock para instalar o app.';
  }

  if (browser === 'firefox') {
    return 'O Firefox ainda não suporta instalação de apps. Abra este site no Google Chrome ou Microsoft Edge para instalar.';
  }

  return 'Abra este site no Google Chrome ou Microsoft Edge e procure a opção "Instalar" no menu do navegador.';
}

const PlatformInstallCard: React.FC<PlatformInstallCardProps> = ({
  platformInfo,
  canPromptInstall,
  onInstallClick,
}) => {
  const showInstallButton =
    canPromptInstall && platformInfo.supportsNativeInstall;
  const showIOSInstructions = platformInfo.platform === 'ios';
  const showManualInstructions = !showInstallButton && !showIOSInstructions;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 3,
      }}
    >
      <Box sx={{ color: 'primary.main', mb: 2 }}>
        {getPlatformIcon(platformInfo.platform)}
      </Box>

      <Typography
        variant='h6'
        sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 1 }}
      >
        {`Detectamos que você está no ${getPlatformLabel(
          platformInfo.platform
        )}`}
      </Typography>

      {showInstallButton && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant='contained'
            size='large'
            startIcon={<GetAppIcon />}
            onClick={onInstallClick}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {getInstallButtonText(platformInfo.platform)}
          </Button>
        </Box>
      )}

      {showIOSInstructions && (
        <Box sx={{ mt: 3 }}>
          <IOSInstructions />
        </Box>
      )}

      {showManualInstructions && (
        <Box sx={{ mt: 3 }}>
          <Typography variant='body1' color='text.secondary'>
            {getManualInstructions(platformInfo)}
          </Typography>
        </Box>
      )}

      {platformInfo.supportsNativeInstall && !canPromptInstall && (
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', mt: 2 }}
        >
          Se o botão de instalar não aparecer, tente recarregar a página.
        </Typography>
      )}
    </Paper>
  );
};

export default PlatformInstallCard;
