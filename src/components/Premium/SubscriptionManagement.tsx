import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CancelIcon from '@mui/icons-material/Cancel';
import RestoreIcon from '@mui/icons-material/Restore';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { useSubscription } from '../../hooks/useSubscription';
import {
  SubscriptionStatus,
  SubscriptionTier,
} from '../../types/subscription.types';
import PremiumBadge from './PremiumBadge';

/**
 * Subscription management page for active subscribers
 */
const SubscriptionManagement: React.FC = () => {
  const history = useHistory();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const {
    subscription,
    tier,
    status,
    isPremium,
    limits,
    invoices,
    loading,
    error,
    loadSubscription,
    loadInvoices,
    cancel,
    reactivate,
    manageSubscription,
    clearError,
  } = useSubscription();

  // Load subscription and invoices on mount
  useEffect(() => {
    if (!subscription && !loading) {
      loadSubscription();
    }
    if (invoices.length === 0 && !loading) {
      loadInvoices(5);
    }
  }, [subscription, invoices.length, loading, loadSubscription, loadInvoices]);

  const handleGoBack = () => {
    history.goBack();
  };

  const handleUpgrade = () => {
    history.push('/pricing');
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    cancel();
    setCancelDialogOpen(false);
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
  };

  const handleReactivate = () => {
    reactivate();
  };

  const handleManageBilling = () => {
    manageSubscription();
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string =>
    `R$ ${(amount / 100).toFixed(2)}`;

  const getTierName = (subscriptionTier: SubscriptionTier): string => {
    if (subscriptionTier === SubscriptionTier.FREE) return 'Gratuito';
    if (subscriptionTier === SubscriptionTier.SIMPLE) return 'Simples';
    return subscriptionTier;
  };

  const getStatusColor = (
    subscriptionStatus: SubscriptionStatus
  ): 'success' | 'warning' | 'error' | 'default' => {
    if (subscriptionStatus === SubscriptionStatus.ACTIVE) return 'success';
    if (subscriptionStatus === SubscriptionStatus.PAST_DUE) return 'warning';
    if (subscriptionStatus === SubscriptionStatus.CANCELLED) return 'error';
    return 'default';
  };

  const getStatusLabel = (subscriptionStatus: SubscriptionStatus): string => {
    if (subscriptionStatus === SubscriptionStatus.ACTIVE) return 'Ativa';
    if (subscriptionStatus === SubscriptionStatus.PAST_DUE)
      return 'Pagamento Pendente';
    if (subscriptionStatus === SubscriptionStatus.CANCELLED) return 'Cancelada';
    if (subscriptionStatus === SubscriptionStatus.INCOMPLETE)
      return 'Incompleta';
    return subscriptionStatus;
  };

  if (loading && !subscription) {
    return (
      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!isPremium) {
    return (
      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Nenhuma assinatura ativa
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
            Você não possui uma assinatura premium ativa no momento.
          </Typography>
          <Button variant='contained' onClick={handleUpgrade}>
            Ver Planos
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography
            variant='h3'
            component='h1'
            sx={{ fontWeight: 'bold', fontFamily: 'Tfont' }}
          >
            Minha Assinatura
          </Typography>
          <PremiumBadge variant='default' />
        </Box>
        <Typography variant='body1' color='text.secondary'>
          Gerencie sua assinatura e histórico de pagamentos
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity='error' onClose={clearError} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Subscription Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold' }}>
                Detalhes da Assinatura
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Plano
                  </Typography>
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    {getTierName(tier)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Status
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={getStatusLabel(status)}
                      color={getStatusColor(status)}
                      size='small'
                    />
                  </Box>
                </Grid>

                {subscription?.currentPeriodStart && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Início do Período
                    </Typography>
                    <Typography variant='body1'>
                      {formatDate(subscription.currentPeriodStart)}
                    </Typography>
                  </Grid>
                )}

                {subscription?.currentPeriodEnd && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Renovação
                    </Typography>
                    <Typography variant='body1'>
                      {formatDate(subscription.currentPeriodEnd)}
                    </Typography>
                  </Grid>
                )}

                {subscription?.cancelAtPeriodEnd && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity='warning'>
                      Sua assinatura será cancelada em{' '}
                      {subscription.currentPeriodEnd &&
                        formatDate(subscription.currentPeriodEnd)}
                    </Alert>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant='outlined'
                  startIcon={<CreditCardIcon />}
                  onClick={handleManageBilling}
                >
                  Gerenciar Forma de Pagamento
                </Button>

                {!subscription?.cancelAtPeriodEnd ? (
                  <Button
                    variant='outlined'
                    color='error'
                    startIcon={<CancelIcon />}
                    onClick={handleCancelClick}
                  >
                    Cancelar Assinatura
                  </Button>
                ) : (
                  <Button
                    variant='outlined'
                    color='success'
                    startIcon={<RestoreIcon />}
                    onClick={handleReactivate}
                  >
                    Reativar Assinatura
                  </Button>
                )}

                <Button
                  variant='outlined'
                  startIcon={<UpgradeIcon />}
                  onClick={handleUpgrade}
                >
                  Mudar Plano
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardContent>
              <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold' }}>
                Histórico de Pagamentos
              </Typography>

              {invoices.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  Nenhum pagamento registrado ainda.
                </Typography>
              ) : (
                <List>
                  {invoices.map((invoice) => {
                    const {
                      _id,
                      createdAt,
                      amount,
                      status: paymentStatus,
                      invoicePdfUrl,
                    } = invoice;
                    return (
                      <ListItem
                        key={_id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ReceiptIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        <ListItemText
                          primary={formatDate(createdAt)}
                          secondary={`${formatCurrency(amount)} - ${
                            paymentStatus === 'paid' ? 'Pago' : 'Pendente'
                          }`}
                        />
                        {invoicePdfUrl && (
                          <Button
                            size='small'
                            href={invoicePdfUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            Ver Recibo
                          </Button>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Limits */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 'bold' }}>
                Seus Limites
              </Typography>

              <List>
                <ListItem disableGutters>
                  <ListItemText
                    primary='Fichas'
                    secondary={
                      limits?.maxSheets === -1
                        ? 'Ilimitadas'
                        : `Até ${limits?.maxSheets}`
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary='Diários'
                    secondary={
                      limits?.maxDiaries === -1
                        ? 'Ilimitados'
                        : `Até ${limits?.maxDiaries}`
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary='Cadernos'
                    secondary={
                      limits?.maxNotebooks === -1
                        ? 'Ilimitados'
                        : `Até ${limits?.maxNotebooks}`
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem disableGutters>
                  <ListItemText
                    primary='Comentar'
                    secondary={
                      limits?.canComment ? 'Habilitado' : 'Desabilitado'
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary='Usar Builds'
                    secondary={
                      limits?.canUseBuilds ? 'Habilitado' : 'Desabilitado'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCancelClose}>
        <DialogTitle>Cancelar Assinatura?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar sua assinatura? Você continuará
            tendo acesso aos recursos premium até o final do período atual (
            {subscription?.currentPeriodEnd &&
              formatDate(subscription.currentPeriodEnd)}
            ).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose}>Voltar</Button>
          <Button
            onClick={handleCancelConfirm}
            color='error'
            variant='contained'
          >
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionManagement;
