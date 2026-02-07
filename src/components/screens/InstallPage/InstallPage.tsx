import React from 'react';
import { Container, Box, Typography, Stack } from '@mui/material';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import SpeedIcon from '@mui/icons-material/Speed';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { SEO, getPageSEO } from '../../SEO';
import { usePWAInstall } from '../../../hooks/usePWAInstall';
import { usePlatformDetection } from '../../../hooks/usePlatformDetection';
import logoFichasDeNimb from '../../../assets/images/logoFichasDeNimb.svg';
import PlatformInstallCard from './PlatformInstallCard';
import AlreadyInstalledCard from './AlreadyInstalledCard';

interface BenefitItemProps {
  icon: React.ReactNode;
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => (
  <Stack direction='row' alignItems='center' spacing={1.5}>
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
    <Typography variant='body1'>{text}</Typography>
  </Stack>
);

const InstallPage: React.FC = () => {
  const pageSEO = getPageSEO('install');
  const platformInfo = usePlatformDetection();
  const { isStandalone, canPromptInstall, wasJustInstalled, promptInstall } =
    usePWAInstall();

  const handleInstallClick = async () => {
    await promptInstall();
  };

  const subtitle = platformInfo.isMobile
    ? 'Acesse suas fichas a qualquer momento, direto do seu celular'
    : 'Acesse suas fichas a qualquer momento, direto do seu computador';

  return (
    <>
      <SEO
        title={pageSEO.title}
        description={pageSEO.description}
        url='/instalar'
      />
      <Container maxWidth='sm' sx={{ py: { xs: 3, sm: 5 } }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component='img'
            src={logoFichasDeNimb}
            alt='Fichas de Nimb'
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              mb: 2,
            }}
          />
          <Typography
            variant='h4'
            sx={{
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            Instale o Fichas de Nimb
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          {isStandalone || wasJustInstalled ? (
            <AlreadyInstalledCard wasJustInstalled={wasJustInstalled} />
          ) : (
            <PlatformInstallCard
              platformInfo={platformInfo}
              canPromptInstall={canPromptInstall}
              onInstallClick={handleInstallClick}
            />
          )}
        </Box>

        <Box
          sx={{
            px: { xs: 1, sm: 3 },
          }}
        >
          <Typography
            variant='subtitle1'
            sx={{
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
            }}
          >
            Por que instalar?
          </Typography>
          <Stack spacing={2}>
            <BenefitItem
              icon={<SpeedIcon />}
              text='Acesso rápido pela tela inicial do seu dispositivo'
            />
            <BenefitItem
              icon={<OfflineBoltIcon />}
              text='Funciona mesmo sem internet (fichas locais, sem login)'
            />
            <BenefitItem
              icon={<SystemUpdateIcon />}
              text='Receba atualizações automaticamente'
            />
            <BenefitItem
              icon={<TouchAppIcon />}
              text='Experiência completa de app nativo'
            />
          </Stack>
        </Box>
      </Container>
    </>
  );
};

export default InstallPage;
