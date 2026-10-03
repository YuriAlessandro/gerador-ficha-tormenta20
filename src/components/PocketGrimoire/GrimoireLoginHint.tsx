import React from 'react';
import { Link as MuiLink, SxProps, Theme, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';

interface GrimoireLoginHintProps {
  sx?: SxProps<Theme>;
}

/** Convite discreto para salvar os grimórios na conta. Só deslogado. */
const GrimoireLoginHint: React.FC<GrimoireLoginHintProps> = ({ sx }) => {
  const { isAuthenticated, loading } = useAuth();
  const { openLoginModal } = useAuthContext();
  if (isAuthenticated || loading) return null;

  return (
    <Typography
      variant='body2'
      sx={[{ color: 'text.secondary' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <MuiLink
        component='button'
        type='button'
        variant='body2'
        onClick={openLoginModal}
        sx={{ verticalAlign: 'baseline' }}
      >
        Entre na sua conta
      </MuiLink>{' '}
      para guardar seus grimórios em todos os dispositivos.
    </Typography>
  );
};

export default GrimoireLoginHint;
