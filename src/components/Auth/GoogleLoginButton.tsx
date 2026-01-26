import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box, useTheme } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { loginWithGoogle } from '../../store/slices/auth/authSlice';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await dispatch(loginWithGoogle()).unwrap();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Google login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorString =
        typeof err === 'string' ? err : JSON.stringify(err, null, 2);

      if (errorMessage.includes('popup-closed-by-user')) {
        setError('Login cancelado pelo usuário');
      } else if (errorMessage.includes('popup-blocked')) {
        setError('Popup bloqueado. Permita popups para este site');
      } else if (
        errorString.includes('403') ||
        errorString.includes('EMAIL_NOT_VERIFIED')
      ) {
        setError(
          'Erro na verificação do email. Por favor, tente novamente ou entre em contato com o suporte.'
        );
      } else if (errorString.includes('Network')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente');
      } else {
        setError(
          `Erro ao fazer login com Google: ${errorMessage}. Tente novamente`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        fullWidth={fullWidth}
        size={size}
        variant={variant}
        onClick={handleGoogleLogin}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
        sx={{
          textTransform: 'none',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : '#dadce0',
          color: isDarkMode ? '#fff' : '#3c4043',
          backgroundColor: isDarkMode ? 'transparent' : 'transparent',
          '&:hover': {
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : '#dadce0',
            backgroundColor: isDarkMode
              ? 'rgba(255, 255, 255, 0.08)'
              : '#f8f9fa',
          },
        }}
      >
        {loading ? 'Entrando...' : 'Entrar com Google'}
      </Button>
    </Box>
  );
};

export default GoogleLoginButton;
