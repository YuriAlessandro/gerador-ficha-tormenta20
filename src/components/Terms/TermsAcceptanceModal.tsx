import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Box,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { acceptTerms } from '../../store/slices/auth/authSlice';
import {
  CURRENT_TERMS_VERSION,
  TERMS_LAST_UPDATED,
} from '../../constants/terms';

interface TermsAcceptanceModalProps {
  open: boolean;
  isNewTerms?: boolean;
}

const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({
  open,
  isNewTerms = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!accepted) return;

    setLoading(true);
    setError(null);

    try {
      await dispatch(acceptTerms(CURRENT_TERMS_VERSION)).unwrap();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao aceitar os termos. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      fullWidth
      disableEscapeKeyDown
      onClose={(_event, reason) => {
        // Prevent closing on backdrop click or escape key
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          // Only close if not triggered by backdrop or escape
        }
      }}
    >
      <DialogTitle>
        <Typography variant='h5' component='div' sx={{ fontFamily: 'Tfont' }}>
          {isNewTerms ? 'Novos Termos de Uso' : 'Termos de Uso'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {isNewTerms ? (
            <Typography variant='body1' paragraph>
              Atualizamos nossos Termos de Uso. Por favor, leia e aceite os
              novos termos para continuar utilizando a plataforma.
            </Typography>
          ) : (
            <Typography variant='body1' paragraph>
              Para utilizar o Fichas de Nimb, você precisa aceitar nossos Termos
              de Uso.
            </Typography>
          )}

          <Typography variant='body2' color='text.secondary' paragraph>
            Atualizado em {TERMS_LAST_UPDATED}
          </Typography>

          <Typography variant='body2' paragraph>
            Leia os termos completos em:{' '}
            <Link
              component={RouterLink}
              to='/termos-de-uso'
              target='_blank'
              rel='noopener noreferrer'
            >
              Termos de Uso
            </Link>
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                color='primary'
              />
            }
            label={
              <Typography variant='body2'>
                Li e aceito os{' '}
                <Link
                  component={RouterLink}
                  to='/termos-de-uso'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Termos de Uso
                </Link>
              </Typography>
            }
          />

          {error && (
            <Typography variant='body2' color='error' sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleAccept}
          disabled={!accepted || loading}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} color='inherit' />
          ) : (
            'Aceitar e Continuar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAcceptanceModal;
