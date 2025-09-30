import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box } from '@mui/material';
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
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.message?.includes('popup-closed-by-user')) {
        setError('Login cancelado pelo usuário');
      } else if (err.message?.includes('popup-blocked')) {
        setError('Popup bloqueado. Permita popups para este site');
      } else {
        setError('Erro ao fazer login com Google. Tente novamente');
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
          borderColor: '#dadce0',
          color: '#3c4043',
          '&:hover': {
            borderColor: '#dadce0',
            backgroundColor: '#f8f9fa',
          },
        }}
      >
        {loading ? 'Entrando...' : 'Entrar com Google'}
      </Button>
    </Box>
  );
};

export default GoogleLoginButton;
