import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionTier } from '../../types/subscription.types';
import PricingCard from './PricingCard';

/**
 * Pricing page that displays available subscription plans
 */
const PricingPage: React.FC = () => {
  const history = useHistory();
  const {
    pricingPlans,
    tier: currentTier,
    loading,
    error,
    loadPricingPlans,
    upgradeToTier,
    clearError,
  } = useSubscription();

  // Load pricing plans on mount
  useEffect(() => {
    if (pricingPlans.length === 0 && !loading) {
      loadPricingPlans();
    }
  }, [pricingPlans.length, loading, loadPricingPlans]);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (tier === SubscriptionTier.FREE) {
      return;
    }
    upgradeToTier(tier);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <Container maxWidth='lg' sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ position: 'absolute', left: 16, top: 16 }}
        >
          Voltar
        </Button>

        <Typography
          variant='h3'
          component='h1'
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Tfont',
            mb: 2,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Escolha Seu Plano
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>
          Desbloqueie todo o potencial do Gerador de Fichas
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Sem taxas ocultas. Cancele quando quiser.
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity='error' onClose={clearError} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && pricingPlans.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Pricing cards */}
      {!loading || pricingPlans.length > 0 ? (
        <Grid container spacing={4} justifyContent='center'>
          {pricingPlans.map((plan) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.tier}>
              <PricingCard
                plan={plan}
                currentTier={currentTier}
                onSelect={() => handleSelectPlan(plan.tier)}
                loading={loading}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {/* Footer info */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Todos os planos incluem:
        </Typography>
        <Grid container spacing={2} justifyContent='center'>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='body2' color='text.primary'>
              ✓ Atualizações gratuitas
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='body2' color='text.primary'>
              ✓ Suporte por email
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='body2' color='text.primary'>
              ✓ Cancele quando quiser
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant='caption' color='text.secondary'>
            Os pagamentos são processados de forma segura através do Stripe.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PricingPage;
