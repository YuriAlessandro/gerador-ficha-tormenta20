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
import { register } from '../../store/slices/auth/authSlice';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  open,
  onClose,
  onSwitchToLogin,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await dispatch(register({ email, password, fullName })).unwrap();
      onClose();
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
    } catch (err: any) {
      if (err.message?.includes('auth/email-already-in-use')) {
        setError('Este email já está em uso');
      } else if (err.message?.includes('auth/invalid-email')) {
        setError('Email inválido');
      } else if (err.message?.includes('auth/weak-password')) {
        setError('Senha muito fraca');
      } else {
        setError('Erro ao criar conta. Tente novamente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Criar Conta</Typography>
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
            label="Nome Completo (opcional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            margin="normal"
            autoComplete="name"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
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
            autoComplete="new-password"
            helperText="Mínimo de 6 caracteres"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="new-password"
            disabled={loading}
            error={confirmPassword !== '' && password !== confirmPassword}
            helperText={
              confirmPassword !== '' && password !== confirmPassword
                ? 'As senhas não coincidem'
                : ''
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={
              loading || !email || !password || !confirmPassword || password !== confirmPassword
            }
          >
            {loading ? <CircularProgress size={24} /> : 'Criar Conta'}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2">
              Já tem uma conta?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToLogin();
                }}
                sx={{ cursor: 'pointer' }}
              >
                Entre aqui
              </Link>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;