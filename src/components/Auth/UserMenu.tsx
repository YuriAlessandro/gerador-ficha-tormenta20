import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  CircularProgress,
  Stack,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { AppDispatch } from '../../store';
import { logout } from '../../store/slices/auth/authSlice';
import AuthModal from './AuthModal';
import SupporterBadge from '../Premium/SupporterBadge';
import { SupportLevel } from '../../types/subscription.types';

const UserMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const { user, isAuthenticated, loading } = useAuth();
  const { subscription } = useSubscription();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const supportLevel = subscription?.tier || SupportLevel.FREE;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    if (user?.username) {
      history.push(`/perfil/${user.username}`);
    }
  };

  const handleLogout = async () => {
    handleMenuClose();
    setLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () =>
    user?.fullName || user?.username || user?.email || 'Usuário';

  if (loading || loggingOut) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={24} color='inherit' />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant='outlined'
          color='inherit'
          onClick={() => setAuthOpen(true)}
          sx={{ borderColor: 'white', color: 'white' }}
        >
          Entrar
        </Button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Stack direction='row' alignItems='center' spacing={1}>
        {/* Supporter Badge - only shows for supporters */}
        <SupporterBadge level={supportLevel} variant='small' showTooltip />

        <IconButton
          onClick={handleMenuOpen}
          size='small'
          sx={{ p: 0.5 }}
          aria-controls={anchorEl ? 'account-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={anchorEl ? 'true' : undefined}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              border: '2px solid rgba(255, 255, 255, 0.4)',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: '2px solid rgba(255, 255, 255, 0.8)',
              },
            }}
            src={user?.photoURL || undefined}
          >
            {!user?.photoURL && getInitials()}
          </Avatar>
        </IconButton>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        disableScrollLock
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant='subtitle2' fontWeight='bold'>
            {getDisplayName()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleProfileClick}>
          <PersonIcon fontSize='small' sx={{ mr: 1 }} />
          Perfil
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize='small' sx={{ mr: 1 }} />
          Sair
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
