import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Divider,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import GoogleLoginButton from './GoogleLoginButton';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>Entrar na sua conta</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography
            variant='body2'
            color='text.secondary'
            textAlign='center'
            sx={{ mb: 3 }}
          >
            Entre com sua conta Google para salvar e sincronizar suas fichas
          </Typography>

          <GoogleLoginButton
            onSuccess={handleSuccess}
            fullWidth
            size='large'
            variant='outlined'
          />

          <Divider sx={{ my: 3 }} />

          <Typography
            variant='caption'
            color='text.secondary'
            textAlign='center'
            display='block'
          >
            Ao entrar, você concorda com nossos{' '}
            <Link component={RouterLink} to='/termos-de-uso' onClick={onClose}>
              Termos de Uso
            </Link>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
