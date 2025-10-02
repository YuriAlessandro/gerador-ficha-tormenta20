import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  Avatar,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Star as StarIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as SheetIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import ProfileService, { PublicProfile } from '../../services/profile.service';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/auth/authSlice';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isOwnProfile =
    isAuthenticated && currentUser?.username === username?.toLowerCase();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError('Nome de usuário inválido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profileData = await ProfileService.getProfileByUsername(username);
        setProfile(profileData);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 404) {
          setError('Usuário não encontrado');
        } else {
          setError('Erro ao carregar perfil');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleEditClick = () => {
    if (currentUser) {
      setEditForm({
        username: currentUser.username || '',
        fullName: currentUser.fullName || '',
      });
      setEditDialogOpen(true);
      setEditError(null);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditError(null);
  };

  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      setEditError(null);

      const updates: { username?: string; fullName?: string } = {};

      if (editForm.username !== currentUser?.username) {
        updates.username = editForm.username.toLowerCase();
      }

      if (editForm.fullName !== currentUser?.fullName) {
        updates.fullName = editForm.fullName;
      }

      if (Object.keys(updates).length === 0) {
        handleEditClose();
        return;
      }

      await dispatch(updateProfile(updates)).unwrap();

      // If username changed, redirect to new profile URL
      if (updates.username) {
        history.push(`/perfil/${updates.username}`);
      } else {
        // Refresh profile data
        const profileData = await ProfileService.getProfileByUsername(
          currentUser?.username || ''
        );
        setProfile(profileData);
      }

      handleEditClose();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.message?.includes('Username already in use')) {
        setEditError('Este nome de usuário já está em uso');
      } else {
        setEditError('Erro ao atualizar perfil');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='60vh'
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mt: 2 }}>
          {error || 'Erro ao carregar perfil'}
        </Alert>
        <Button
          variant='outlined'
          onClick={() => history.push('/')}
          sx={{ mt: 2 }}
        >
          Voltar para o Início
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          pt: { xs: 3, md: 4 },
          pb: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth='md'>
          <Stack
            direction='column'
            alignItems='center'
            spacing={2}
            sx={{ color: 'white' }}
          >
            <Avatar
              src={profile.photoURL}
              alt={profile.fullName || profile.username}
              sx={{
                width: { xs: 120, md: 160 },
                height: { xs: 120, md: 160 },
                border: '4px solid white',
                boxShadow: 3,
              }}
            >
              <PersonIcon sx={{ fontSize: { xs: 60, md: 80 } }} />
            </Avatar>

            <Box textAlign='center'>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                fontWeight='bold'
                gutterBottom
              >
                {profile.fullName || profile.username}
              </Typography>
              <Typography
                variant={isMobile ? 'body1' : 'h6'}
                sx={{ opacity: 0.9 }}
              >
                @{profile.username}
              </Typography>

              {profile.isPremium && (
                <Chip
                  icon={<StarIcon />}
                  label='Premium'
                  sx={{
                    mt: 1.5,
                    bgcolor: 'gold',
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                  }}
                />
              )}
            </Box>

            {isOwnProfile && isAuthenticated && currentUser?.email && (
              <Typography
                variant='body2'
                sx={{ opacity: 0.8, fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                {currentUser.email}
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='md' sx={{ mt: -6, pb: 4 }}>
        <Stack spacing={3}>
          {/* Edit Button */}
          {isOwnProfile && (
            <Card sx={{ p: 2 }}>
              <Button
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                fullWidth={isMobile}
              >
                Editar Perfil
              </Button>
            </Card>
          )}

          {/* Stats Card */}
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Estatísticas
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <SheetIcon color='primary' />
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Fichas Criadas
                    </Typography>
                    <Typography variant='h6' fontWeight='bold'>
                      {profile.totalSheets}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <CalendarIcon color='primary' />
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Membro Desde
                    </Typography>
                    <Typography variant='h6' fontWeight='bold'>
                      {formatDate(profile.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Stack>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome de Usuário'
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
              fullWidth
              helperText='Somente letras minúsculas, números e underscores'
              disabled={editLoading}
            />
            <TextField
              label='Nome Completo'
              value={editForm.fullName}
              onChange={(e) =>
                setEditForm({ ...editForm, fullName: e.target.value })
              }
              fullWidth
              disabled={editLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={editLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleEditSave}
            variant='contained'
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfilePage;
