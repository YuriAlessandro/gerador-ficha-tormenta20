import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
  Tabs,
  Tab,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as SheetIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import ProfileService, { PublicProfile } from '../../services/profile.service';
import { AppDispatch } from '../../store';
import {
  updateProfile,
  saveSystemSetup,
  // saveDice3DSettings, // DISABLED: 3D Dice feature temporarily disabled
} from '../../store/slices/auth/authSlice';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
} from '../../types/supplement.types';
import { SystemId } from '../../types/system.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

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
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedSupplements, setSelectedSupplements] = useState<
    SupplementId[]
  >(() => currentUser?.enabledSupplements || [SupplementId.TORMENTA20_CORE]);
  const [supplementsLoading, setSupplementsLoading] = useState(false);
  const [supplementsError, setSupplementsError] = useState<string | null>(null);
  const [supplementsSuccess, setSupplementsSuccess] = useState(false);
  // DISABLED: 3D Dice feature temporarily disabled
  // const [dice3DEnabled, setDice3DEnabled] = useState(
  //   currentUser?.dice3DEnabled || false
  // );
  // const [dice3DLoading, setDice3DLoading] = useState(false);
  // const [dice3DError, setDice3DError] = useState<string | null>(null);
  // const [dice3DSuccess, setDice3DSuccess] = useState(false);

  const isOwnProfile =
    isAuthenticated && currentUser?.username === username?.toLowerCase();

  // DISABLED: 3D Dice feature temporarily disabled
  // Sync dice3D state with user data
  // useEffect(() => {
  //   if (currentUser?.dice3DEnabled !== undefined) {
  //     setDice3DEnabled(currentUser.dice3DEnabled);
  //   }
  // }, [currentUser?.dice3DEnabled]);

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
      } catch (err) {
        const fetchError = err as { response?: { status?: number } };
        if (fetchError.response?.status === 404) {
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
    } catch (err) {
      const updateError = err as { message?: string };
      if (updateError.message?.includes('Username already in use')) {
        setEditError('Este nome de usuário já está em uso');
      } else {
        setEditError('Erro ao atualizar perfil');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleSupplement = (supplementId: SupplementId) => {
    // Não permite desativar o CORE
    if (supplementId === SupplementId.TORMENTA20_CORE) {
      return;
    }

    setSelectedSupplements((prev) => {
      if (prev.includes(supplementId)) {
        return prev.filter((id) => id !== supplementId);
      }
      return [...prev, supplementId];
    });
  };

  const handleSaveSupplements = async () => {
    try {
      setSupplementsLoading(true);
      setSupplementsError(null);
      setSupplementsSuccess(false);
      await dispatch(saveSystemSetup(selectedSupplements)).unwrap();
      setSupplementsSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSupplementsSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao salvar suplementos';
      setSupplementsError(errorMessage);
    } finally {
      setSupplementsLoading(false);
    }
  };

  // DISABLED: 3D Dice feature temporarily disabled
  // const handleToggleDice3D = async (checked: boolean) => {
  //   try {
  //     setDice3DLoading(true);
  //     setDice3DError(null);
  //     setDice3DSuccess(false);
  //     setDice3DEnabled(checked);
  //     await dispatch(saveDice3DSettings(checked)).unwrap();
  //     setDice3DSuccess(true);
  //     // Auto-hide success message after 3 seconds
  //     setTimeout(() => setDice3DSuccess(false), 3000);
  //   } catch (err) {
  //     const errorMessage =
  //       err instanceof Error ? err.message : 'Erro ao salvar configuração';
  //     setDice3DError(errorMessage);
  //     // Revert on error
  //     setDice3DEnabled(!checked);
  //   } finally {
  //     setDice3DLoading(false);
  //   }
  // };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Filtra apenas suplementos do Tormenta 20
  const tormenta20Supplements = Object.values(SUPPLEMENT_METADATA).filter(
    (s) => s.systemId === SystemId.TORMENTA20
  );

  // Verifica se há mudanças nos suplementos
  const hasSupplementChanges =
    JSON.stringify([...selectedSupplements].sort()) !==
    JSON.stringify([...(currentUser?.enabledSupplements || [])].sort());

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
          {/* Settings Card - Only for own profile */}
          {isOwnProfile && (
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={currentTab}
                  onChange={(_, newValue) => setCurrentTab(newValue)}
                  variant={isMobile ? 'fullWidth' : 'standard'}
                >
                  <Tab
                    icon={<PersonIcon />}
                    label='Perfil'
                    iconPosition='start'
                  />
                  <Tab
                    icon={<SettingsIcon />}
                    label='Sistema'
                    iconPosition='start'
                  />
                </Tabs>
              </Box>

              {/* Aba de Perfil */}
              <TabPanel value={currentTab} index={0}>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Typography variant='h6' fontWeight='bold'>
                      Informações do Perfil
                    </Typography>
                    <TextField
                      label='Nome de Usuário'
                      value={currentUser?.username || ''}
                      disabled
                      fullWidth
                      helperText='Edite seu perfil para alterar'
                    />
                    <TextField
                      label='Nome Completo'
                      value={currentUser?.fullName || ''}
                      disabled
                      fullWidth
                      helperText='Edite seu perfil para alterar'
                    />
                    <Button
                      variant='contained'
                      startIcon={<EditIcon />}
                      onClick={handleEditClick}
                      fullWidth={isMobile}
                    >
                      Editar Perfil
                    </Button>
                  </Stack>
                </Box>
              </TabPanel>

              {/* Aba de Sistema e Suplementos */}
              <TabPanel value={currentTab} index={1}>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant='h6' fontWeight='bold' gutterBottom>
                        Sistema Atual
                      </Typography>
                      <Chip
                        label='Tormenta 20'
                        color='primary'
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    {/* DISABLED: 3D Dice feature temporarily disabled
                    <Box>
                      <Typography variant='h6' fontWeight='bold' gutterBottom>
                        Configurações Visuais
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ mb: 2, display: 'block' }}
                      >
                        Personalize sua experiência visual
                      </Typography>

                      {dice3DError && (
                        <Alert severity='error' sx={{ mb: 2 }}>
                          {dice3DError}
                        </Alert>
                      )}

                      {dice3DSuccess && (
                        <Alert severity='success' sx={{ mb: 2 }}>
                          Configuração salva com sucesso!
                        </Alert>
                      )}

                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: dice3DEnabled
                            ? 'primary.main'
                            : 'divider',
                          backgroundColor: dice3DEnabled
                            ? 'action.selected'
                            : 'transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={dice3DEnabled}
                              onChange={(e) =>
                                handleToggleDice3D(e.target.checked)
                              }
                              disabled={dice3DLoading}
                            />
                          }
                          label={
                            <Stack spacing={0.5}>
                              <Typography variant='body1' fontWeight='medium'>
                                Dados 3D
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                Ativa animações 3D ao rolar dados na ficha de
                                personagem
                              </Typography>
                            </Stack>
                          }
                        />
                      </Box>
                    </Box>
                    */}

                    <Box>
                      <Typography variant='h6' fontWeight='bold' gutterBottom>
                        Suplementos
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ mb: 2, display: 'block' }}
                      >
                        Selecione os suplementos que você possui. Lembre-se que
                        tentar usar regras de suplementos sem possuir os livros
                        e dominar suas regras pode ser desafiador.
                      </Typography>

                      {supplementsError && (
                        <Alert severity='error' sx={{ mb: 2 }}>
                          {supplementsError}
                        </Alert>
                      )}

                      {supplementsSuccess && (
                        <Alert severity='success' sx={{ mb: 2 }}>
                          Suplementos salvos com sucesso!
                        </Alert>
                      )}

                      <FormGroup>
                        {tormenta20Supplements.map((supplement) => {
                          const isCore =
                            supplement.id === SupplementId.TORMENTA20_CORE;
                          const isSelected = selectedSupplements.includes(
                            supplement.id
                          );

                          return (
                            <Box
                              key={supplement.id}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: isSelected
                                  ? 'primary.main'
                                  : 'divider',
                                backgroundColor: isSelected
                                  ? 'action.selected'
                                  : 'transparent',
                                transition: 'all 0.2s',
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() =>
                                      handleToggleSupplement(supplement.id)
                                    }
                                    disabled={isCore || supplementsLoading}
                                  />
                                }
                                label={
                                  <Stack spacing={0.5}>
                                    <Stack
                                      direction='row'
                                      spacing={1}
                                      alignItems='center'
                                    >
                                      <Typography
                                        variant='body1'
                                        fontWeight='medium'
                                      >
                                        {supplement.name}
                                      </Typography>
                                      {isCore && (
                                        <Chip
                                          label='Obrigatório'
                                          size='small'
                                          color='primary'
                                          sx={{ height: 20 }}
                                        />
                                      )}
                                    </Stack>
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      {supplement.description}
                                    </Typography>
                                  </Stack>
                                }
                              />
                            </Box>
                          );
                        })}
                      </FormGroup>

                      <Button
                        variant='contained'
                        onClick={handleSaveSupplements}
                        disabled={supplementsLoading || !hasSupplementChanges}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        {supplementsLoading ? (
                          <CircularProgress size={24} color='inherit' />
                        ) : (
                          'Salvar Alterações'
                        )}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </TabPanel>
            </Card>
          )}

          {/* Stats Card */}
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Estatísticas
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
