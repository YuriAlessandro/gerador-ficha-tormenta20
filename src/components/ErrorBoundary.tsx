/* eslint-disable no-console */
/* eslint-disable react/no-unused-state */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Stack,
  Collapse,
  Alert,
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copySuccess: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copySuccess: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.href = '/';
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    const { showDetails } = this.state;
    this.setState({ showDetails: !showDetails });
  };

  private copyErrorToClipboard = async () => {
    const { error, errorInfo } = this.state;
    const errorText = `
ERRO NA APLICAÇÃO FICHAS DE NIMB
================================

Data/Hora: ${new Date().toLocaleString('pt-BR')}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Mensagem de Erro:
${error?.message || 'Erro desconhecido'}

Stack Trace:
${error?.stack || 'Não disponível'}

Component Stack:
${errorInfo?.componentStack || 'Não disponível'}

================================
Por favor, envie este log para o suporte.
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copySuccess: true });
      setTimeout(() => {
        this.setState({ copySuccess: false });
      }, 3000);
    } catch (err) {
      console.error('Failed to copy error:', err);
    }
  };

  public render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        <ErrorFallbackUI
          state={this.state}
          handlers={{
            handleReload: this.handleReload,
            handleRefresh: this.handleRefresh,
            toggleDetails: this.toggleDetails,
            copyErrorToClipboard: this.copyErrorToClipboard,
          }}
        />
      );
    }

    return children;
  }
}

// Separate component for the error UI to use hooks
const ErrorFallbackUI: React.FC<{
  state: State;
  handlers: {
    handleReload: () => void;
    handleRefresh: () => void;
    toggleDetails: () => void;
    copyErrorToClipboard: () => void;
  };
}> = ({ state, handlers }) => {
  const { error, errorInfo, showDetails, copySuccess } = state;
  const { handleReload, handleRefresh, toggleDetails, copyErrorToClipboard } =
    handlers;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth='md'>
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          {/* Icon and Title */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: { xs: 80, md: 100 },
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography
              variant='h3'
              component='h1'
              sx={{
                fontFamily: 'Tfont',
                fontWeight: 'bold',
                fontSize: { xs: '2rem', md: '3rem' },
                color: 'error.main',
                mb: 1,
              }}
            >
              Ops! Algo deu errado
            </Typography>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Encontramos um erro inesperado
            </Typography>
          </Box>

          {/* Description */}
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Não se preocupe! Este erro foi registrado e você pode tentar uma das
            opções abaixo para continuar usando o sistema.
          </Typography>

          {/* Copy Success Alert */}
          {copySuccess && (
            <Alert severity='success' sx={{ mb: 2 }}>
              Erro copiado! Cole em um email para suporte@fichasdenimb.com
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent='center'
            sx={{ mb: 3 }}
          >
            <Button
              variant='contained'
              size='large'
              startIcon={<HomeIcon />}
              onClick={handleReload}
              sx={{ minWidth: 200 }}
            >
              Voltar ao Início
            </Button>
            <Button
              variant='outlined'
              size='large'
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ minWidth: 200 }}
            >
              Recarregar Página
            </Button>
          </Stack>

          {/* Copy Error Button */}
          <Button
            variant='outlined'
            color='secondary'
            startIcon={<CopyIcon />}
            onClick={copyErrorToClipboard}
            sx={{ mb: 2 }}
          >
            Copiar Detalhes do Erro para Enviar ao Suporte
          </Button>

          {/* Error Details Expandable Section */}
          <Box sx={{ mt: 3 }}>
            <Button
              onClick={toggleDetails}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                />
              }
              color='inherit'
              size='small'
            >
              {showDetails
                ? 'Ocultar Detalhes Técnicos'
                : 'Ver Detalhes Técnicos'}
            </Button>

            <Collapse in={showDetails}>
              <Paper
                variant='outlined'
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'grey.100',
                  textAlign: 'left',
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  Mensagem de Erro:
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    mb: 2,
                    color: 'error.main',
                    wordBreak: 'break-word',
                  }}
                >
                  {error?.message || 'Erro desconhecido'}
                </Typography>

                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  Stack Trace:
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    mb: 2,
                  }}
                >
                  {error?.stack || 'Não disponível'}
                </Typography>

                {errorInfo && (
                  <>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      Component Stack:
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {errorInfo.componentStack}
                    </Typography>
                  </>
                )}
              </Paper>
            </Collapse>
          </Box>

          {/* Support Info */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Problemas persistentes? Entre em contato:
            </Typography>
            <Typography
              variant='body2'
              sx={{ fontWeight: 'bold', mt: 0.5 }}
              color='primary'
            >
              suporte@fichasdenimb.com
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;
