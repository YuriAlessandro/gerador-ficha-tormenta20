import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Link,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { login } from '../../store/slices/auth/authSlice';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  open,
  onClose,
  onSwitchToRegister,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await dispatch(login({ email, password })).unwrap();
      onClose();
      // Clear form
      setEmail('');
      setPassword('');
    } catch (err: any) {
      if (err.message?.includes('auth/user-not-found')) {
        setError('Usuário não encontrado');
      } else if (err.message?.includes('auth/wrong-password')) {
        setError('Senha incorreta');
      } else if (err.message?.includes('auth/invalid-email')) {
        setError('Email inválido');
      } else if (err.message?.includes('auth/too-many-requests')) {
        setError('Muitas tentativas. Tente novamente mais tarde');
      } else {
        setError('Erro ao fazer login. Tente novamente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Entrar</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !email || !password}
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2">
              Não tem uma conta?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToRegister();
                }}
                sx={{ cursor: 'pointer' }}
              >
                Cadastre-se
              </Link>
            </Typography>
          </Box>

          {/* <Box textAlign="center" sx={{ mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement password reset
              }}
              sx={{ cursor: 'pointer' }}
            >
              Esqueceu a senha?
            </Link>
          </Box> */}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;