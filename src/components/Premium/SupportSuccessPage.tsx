import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import SupporterBadge from './SupporterBadge';
import { getSupportLevelName } from '../../types/subscription.types';

const SupportSuccessPage: React.FC = () => {
  const history = useHistory();
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useAuthContext();
  const { loadSubscription, supportLevel, isSupporter, loading } =
    useSubscription();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    // Load subscription immediately
    loadSubscription();
  }, [isAuthenticated, openLoginModal, loadSubscription]);

  // Retry loading subscription if not yet a supporter (webhook may be processing)
  useEffect(() => {
    if (!loading && !isSupporter && loadAttempts < maxAttempts) {
      const timer = setTimeout(() => {
        setLoadAttempts((prev) => prev + 1);
        loadSubscription();
      }, 2000); // Wait 2 seconds between attempts

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, isSupporter, loadAttempts, loadSubscription]);

  const handleGoToProfile = () => {
    if (user?.username) {
      history.push(`/u/${user.username}`);
    } else {
      history.push('/');
    }
  };

  const handleGoToSupport = () => {
    history.push('/apoiar');
  };

  // Show loading while checking subscription
  if (loading || (!isSupporter && loadAttempts < maxAttempts)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant='body1' color='text.secondary'>
          Processando seu pagamento...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 2,
      }}
    >
      <Card
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        {isSupporter ? (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
            />
            <Typography variant='h4' gutterBottom fontWeight='bold'>
              Obrigado pelo apoio!
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              Seu apoio foi processado com sucesso. Agora voce e um{' '}
              {getSupportLevelName(supportLevel)}!
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <SupporterBadge level={supportLevel} size='medium' />
            </Box>
            <Stack spacing={2}>
              <Button
                variant='contained'
                color='primary'
                size='large'
                onClick={handleGoToProfile}
              >
                Ver Meu Perfil
              </Button>
              <Button variant='text' onClick={() => history.push('/')}>
                Voltar para a Pagina Inicial
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant='h5' gutterBottom>
              Pagamento em Processamento
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              Seu pagamento esta sendo processado. Isso pode levar alguns
              instantes. Se o problema persistir, entre em contato conosco.
            </Typography>
            <Stack spacing={2}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleGoToSupport}
              >
                Voltar para Pagina de Apoio
              </Button>
              <Button variant='text' onClick={handleGoToProfile}>
                Ver Meu Perfil
              </Button>
            </Stack>
          </>
        )}
      </Card>
    </Box>
  );
};

export default SupportSuccessPage;
