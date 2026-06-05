/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
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
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as SheetIcon,
  Settings as SettingsIcon,
  Favorite as FavoriteIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import SupporterBadge from '../Premium/SupporterBadge';
import ProfileLevelChip from '../Premium/ProfileLevelChip';
import {
  SupportLevel,
  getSupportLevelName,
  isSupporter,
  SubscriptionStatus,
  Invoice,
  SUPPORT_LIMITS,
} from '../../types/subscription.types';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { AccentColorId, getAccentColorsArray } from '../../theme/accentColors';
import ProfileService, {
  FullProfile,
  ResolvedSection,
  ProfileTheme,
} from '../../services/profile.service';
import ProfileSectionRenderer from '../../premium/components/Profile/ProfileSectionRenderer';
import ProfileEditor from '../../premium/components/Profile/ProfileEditor';
import BadgeShowcase from '../../premium/components/Profile/BadgeShowcase';
import { AppDispatch } from '../../store';
import {
  updateProfile,
  saveSystemSetup,
  saveDice3DSettings,
  saveBestiaryAnonymous,
} from '../../store/slices/auth/authSlice';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
} from '../../types/supplement.types';
import { SystemId } from '../../types/system.types';
import { DiceColorId, getDiceColorsArray } from '../../types/diceColors';
import { SEO, createProfileSchema } from '../SEO';
import { PushNotificationToggle } from '../../premium';

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

const PROFILE_FONT_MAP: Record<string, string> = {
  default: 'inherit',
  serif: 'Georgia, serif',
  mono: 'monospace',
  cinzel: "'Cinzel', serif",
  lato: "'Lato', sans-serif",
  merriweather: "'Merriweather', serif",
};

function resolveProfileFont(fontFamily?: string): string {
  return fontFamily ? PROFILE_FONT_MAP[fontFamily] || 'inherit' : 'inherit';
}

function getInitialTabFromHash(hash: string): number {
  if (hash === '#sistema' || hash === '#suplementos') return 1;
  if (hash === '#apoio') return 2;
  return 0;
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const {
    subscription,
    supportLevel,
    isSupporter: isUserSupporter,
    invoices,
    loading: subscriptionLoading,
    error: subscriptionError,
    loadSubscription,
    loadInvoices,
    cancel: cancelSub,
    reactivate: reactivateSub,
    manageSubscription,
  } = useSubscription();
  const {
    accentColor,
    darkMode,
    setAccentColor,
    setDarkMode,
    loading: preferencesLoading,
  } = useUserPreferences();

  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(() =>
    getInitialTabFromHash(location.hash)
  );
  const supplementsSectionRef = useRef<HTMLDivElement>(null);
  const [selectedSupplements, setSelectedSupplements] = useState<
    SupplementId[]
  >(() => currentUser?.enabledSupplements || [SupplementId.TORMENTA20_CORE]);
  const [supplementsLoading, setSupplementsLoading] = useState(false);
  const [supplementsError, setSupplementsError] = useState<string | null>(null);
  const [supplementsSuccess, setSupplementsSuccess] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [subscriptionActionSuccess, setSubscriptionActionSuccess] = useState<
    string | null
  >(null);
  const [dice3DEnabled, setDice3DEnabled] = useState(
    currentUser?.dice3DEnabled || false
  );
  const [diceColor, setDiceColor] = useState<DiceColorId>(
    currentUser?.diceColor || 'red'
  );
  const [dice3DLoading, setDice3DLoading] = useState(false);
  const [dice3DError, setDice3DError] = useState<string | null>(null);
  const [dice3DSuccess, setDice3DSuccess] = useState(false);
  const [bestiaryAnonymous, setBestiaryAnonymousState] = useState(
    currentUser?.bestiaryAnonymous !== false
  );
  const [bestiaryAnonymousLoading, setBestiaryAnonymousLoading] =
    useState(false);
  const [bestiaryAnonymousError, setBestiaryAnonymousError] = useState<
    string | null
  >(null);
  const [bestiaryAnonymousSuccess, setBestiaryAnonymousSuccess] =
    useState(false);

  const isOwnProfile =
    isAuthenticated && currentUser?.username === username?.toLowerCase();

  // Sync dice3D state with user data
  useEffect(() => {
    if (currentUser?.dice3DEnabled !== undefined) {
      setDice3DEnabled(currentUser.dice3DEnabled);
    }
    if (currentUser?.diceColor !== undefined) {
      setDiceColor(currentUser.diceColor);
    }
  }, [currentUser?.dice3DEnabled, currentUser?.diceColor]);

  // Sync bestiaryAnonymous state with user data (default: true)
  useEffect(() => {
    setBestiaryAnonymousState(currentUser?.bestiaryAnonymous !== false);
  }, [currentUser?.bestiaryAnonymous]);

  // Scroll to the supplements section when navigated to with #suplementos hash
  useEffect(() => {
    if (location.hash === '#suplementos') {
      const timeoutId = setTimeout(() => {
        supplementsSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 150);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [location.hash]);

  // Load subscription when support tab is selected (tab index 2)
  useEffect(() => {
    if (currentTab === 2 && isOwnProfile) {
      // Always reload subscription to ensure fresh data
      loadSubscription();
    }
  }, [currentTab, isOwnProfile, loadSubscription]);

  // Load invoices only for Stripe subscriptions (not manual)
  useEffect(() => {
    if (currentTab === 2 && isOwnProfile && subscription) {
      const isManual =
        subscription.stripeCustomerId?.startsWith('manual_') ||
        subscription.stripePriceId?.startsWith('manual_');
      if (!isManual) {
        loadInvoices(10);
      }
    }
  }, [currentTab, isOwnProfile, subscription, loadInvoices]);

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
        const profileData = await ProfileService.getFullProfile(username);
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

  // Account info (username/displayName) is now saved from inside ProfileEditor.
  // Throws a friendly message so the editor can surface it; redirects on a
  // username change.
  const handleSaveAccount = async (updates: {
    username?: string;
    fullName?: string;
  }): Promise<void> => {
    if (Object.keys(updates).length === 0) return;
    try {
      await dispatch(updateProfile(updates)).unwrap();

      if (updates.username) {
        history.push(`/perfil/${updates.username}`);
      } else {
        const profileData = await ProfileService.getFullProfile(
          currentUser?.username || ''
        );
        setProfile(profileData);
      }
    } catch (err) {
      const updateError = err as { message?: string };
      if (updateError.message?.includes('Username already in use')) {
        throw new Error('Este nome de usuário já está em uso');
      }
      throw new Error('Erro ao atualizar perfil');
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

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      await cancelSub();
      setCancelDialogOpen(false);
      setSubscriptionActionSuccess(
        'Apoio cancelado. Ele continuará ativo até o final do período de cobrança.'
      );
      loadSubscription();
      setTimeout(() => setSubscriptionActionSuccess(null), 5000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setReactivateLoading(true);
      await reactivateSub();
      setSubscriptionActionSuccess('Apoio reativado com sucesso!');
      loadSubscription();
      setTimeout(() => setSubscriptionActionSuccess(null), 5000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setReactivateLoading(false);
    }
  };

  const formatInvoiceDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check if subscription was created manually (not through Stripe)
  const isManualSubscription =
    subscription?.stripeCustomerId?.startsWith('manual_') ||
    subscription?.stripePriceId?.startsWith('manual_');

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(amount);

  const getSubscriptionStatusLabel = () => {
    if (isManualSubscription) return 'Ativo';
    if (subscription?.cancelAtPeriodEnd) return 'Cancelamento Agendado';
    if (subscription?.status === SubscriptionStatus.ACTIVE) return 'Ativo';
    if (subscription?.status === SubscriptionStatus.PAST_DUE)
      return 'Pagamento Pendente';
    return 'Inativo';
  };

  const getSubscriptionStatusColor = (): 'warning' | 'success' | 'error' => {
    if (isManualSubscription) return 'success';
    if (subscription?.cancelAtPeriodEnd) return 'warning';
    if (subscription?.status === SubscriptionStatus.ACTIVE) return 'success';
    return 'error';
  };

  const handleToggleDice3D = async (checked: boolean) => {
    try {
      setDice3DLoading(true);
      setDice3DError(null);
      setDice3DSuccess(false);
      setDice3DEnabled(checked);
      await dispatch(saveDice3DSettings({ enabled: checked })).unwrap();
      setDice3DSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setDice3DSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao salvar configuração';
      setDice3DError(errorMessage);
      // Revert on error
      setDice3DEnabled(!checked);
    } finally {
      setDice3DLoading(false);
    }
  };

  const handleToggleBestiaryAnonymous = async (checked: boolean) => {
    const previous = bestiaryAnonymous;
    try {
      setBestiaryAnonymousLoading(true);
      setBestiaryAnonymousError(null);
      setBestiaryAnonymousSuccess(false);
      setBestiaryAnonymousState(checked);
      await dispatch(saveBestiaryAnonymous(checked)).unwrap();
      setBestiaryAnonymousSuccess(true);
      setTimeout(() => setBestiaryAnonymousSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao salvar configuração';
      setBestiaryAnonymousError(errorMessage);
      setBestiaryAnonymousState(previous);
    } finally {
      setBestiaryAnonymousLoading(false);
    }
  };

  const handleChangeDiceColor = async (color: DiceColorId) => {
    const previousColor = diceColor;
    try {
      setDice3DLoading(true);
      setDice3DError(null);
      setDice3DSuccess(false);
      setDiceColor(color);
      await dispatch(saveDice3DSettings({ color })).unwrap();
      setDice3DSuccess(true);
      setTimeout(() => setDice3DSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao salvar configuração';
      setDice3DError(errorMessage);
      // Revert on error
      setDiceColor(previousColor);
    } finally {
      setDice3DLoading(false);
    }
  };

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
      <SEO
        title={`${
          profile.fullName || profile.username
        } - Perfil | Fichas de Nimb`}
        description={`Perfil de ${
          profile.fullName || profile.username
        } no Fichas de Nimb. ${profile.totalSheets} fichas criadas.`}
        image={profile.photoURL}
        url={`/perfil/${profile.username}`}
        type='profile'
        structuredData={createProfileSchema({
          name: profile.fullName || profile.username,
          username: profile.username,
          description: `Perfil de ${
            profile.fullName || profile.username
          } no Fichas de Nimb. ${profile.totalSheets} fichas criadas.`,
          image: profile.photoURL,
          url: `/perfil/${profile.username}`,
        })}
      />
      <Box
        sx={{
          background: profile.theme?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${profile.theme.backgroundImageUrl})`
            : profile.theme?.backgroundColor ||
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: resolveProfileFont(profile.theme?.fontFamily),
          pt: { xs: 3, md: 4 },
          pb: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth='md'>
          <Stack
            direction='column'
            alignItems='center'
            spacing={2}
            sx={{ color: profile.theme?.textColor || 'white' }}
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
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='center'
                spacing={1}
              >
                <Typography
                  variant={isMobile ? 'body1' : 'h6'}
                  sx={{ opacity: 0.9 }}
                >
                  @{profile.username}
                </Typography>
                {profile.supportLevel && isSupporter(profile.supportLevel) && (
                  <SupporterBadge
                    level={profile.supportLevel}
                    variant='small'
                    showTooltip={false}
                  />
                )}
                <ProfileLevelChip level={profile.level ?? 1} variant='small' />
              </Stack>
            </Box>

            {profile.badges && profile.badges.length > 0 && (
              <BadgeShowcase badges={profile.badges} />
            )}

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
          {/* Customizable profile sections (Steam-like) - visible to everyone */}
          {(profile.sections.length > 0 || isOwnProfile) && (
            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{ mb: profile.sections.length ? 2 : 0 }}
              >
                <Typography variant='h6' fontWeight='bold'>
                  Perfil
                </Typography>
                {isOwnProfile && (
                  <Button
                    size='small'
                    startIcon={<EditIcon />}
                    onClick={() => setProfileEditorOpen(true)}
                  >
                    Editar perfil
                  </Button>
                )}
              </Stack>
              <Stack spacing={3}>
                {profile.sections.map((section) => (
                  <ProfileSectionRenderer key={section.id} section={section} />
                ))}
              </Stack>
              {isOwnProfile && profile.sections.length === 0 && (
                <Typography variant='body2' color='text.secondary'>
                  Seu perfil ainda não tem seções. Clique em Editar perfil para
                  começar.
                </Typography>
              )}
            </Card>
          )}

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
                  <Tab
                    icon={<FavoriteIcon />}
                    label='Apoio'
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
                      helperText={
                        isUserSupporter
                          ? 'Edite seu perfil para alterar'
                          : 'Apenas apoiadores podem alterar'
                      }
                    />
                    <TextField
                      label='Nome de Exibição'
                      value={currentUser?.fullName || ''}
                      disabled
                      fullWidth
                      helperText='Edite seu perfil para alterar'
                    />
                    <Button
                      variant='contained'
                      startIcon={<EditIcon />}
                      onClick={() => setProfileEditorOpen(true)}
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

                    {/* Appearance Settings */}
                    <Box>
                      <Typography variant='h6' fontWeight='bold' gutterBottom>
                        Aparência
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ mb: 2, display: 'block' }}
                      >
                        Personalize a aparência do site
                      </Typography>

                      {/* Dark Mode Toggle */}
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Stack direction='row' spacing={2} alignItems='center'>
                          {darkMode ? (
                            <DarkModeIcon color='primary' />
                          ) : (
                            <LightModeIcon color='primary' />
                          )}
                          <Box>
                            <Typography variant='body1' fontWeight='medium'>
                              Tema Escuro
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {darkMode
                                ? 'Ativado - cores escuras'
                                : 'Desativado - cores claras'}
                            </Typography>
                          </Box>
                        </Stack>
                        <Switch
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                          disabled={preferencesLoading}
                        />
                      </Box>

                      {/* Accent Color Selector */}
                      <Box>
                        <Typography
                          variant='body1'
                          fontWeight='medium'
                          gutterBottom
                        >
                          Cor de Destaque
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ mb: 2, display: 'block' }}
                        >
                          Escolha a cor principal da interface
                        </Typography>

                        {/* Block for non-supporters */}
                        {!isUserSupporter ? (
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px dashed',
                              borderColor: 'divider',
                              bgcolor: 'action.hover',
                              textAlign: 'center',
                            }}
                          >
                            <Stack spacing={2} alignItems='center'>
                              <Stack
                                direction='row'
                                spacing={1}
                                sx={{ opacity: 0.5 }}
                              >
                                {getAccentColorsArray().map((color) => (
                                  <Box
                                    key={color.id}
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: '50%',
                                      backgroundColor: color.main,
                                      border:
                                        accentColor === color.id
                                          ? '2px solid'
                                          : '1px solid transparent',
                                      borderColor:
                                        accentColor === color.id
                                          ? 'text.primary'
                                          : 'transparent',
                                    }}
                                  />
                                ))}
                              </Stack>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                Personalize as cores do site tornando-se um
                                apoiador
                              </Typography>
                              <Button
                                variant='outlined'
                                size='small'
                                startIcon={<FavoriteIcon />}
                                onClick={() => history.push('/apoiar')}
                              >
                                Apoiar
                              </Button>
                            </Stack>
                          </Box>
                        ) : (
                          <Stack
                            direction='row'
                            spacing={2}
                            flexWrap='wrap'
                            useFlexGap
                          >
                            {getAccentColorsArray().map((color) => (
                              <Tooltip key={color.id} title={color.name} arrow>
                                <Box
                                  onClick={() =>
                                    !preferencesLoading &&
                                    setAccentColor(color.id as AccentColorId)
                                  }
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: color.main,
                                    cursor: preferencesLoading
                                      ? 'not-allowed'
                                      : 'pointer',
                                    border:
                                      accentColor === color.id
                                        ? '3px solid'
                                        : '2px solid transparent',
                                    borderColor:
                                      accentColor === color.id
                                        ? 'text.primary'
                                        : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow:
                                      accentColor === color.id
                                        ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${color.main}`
                                        : 'none',
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                      boxShadow: `0 4px 12px ${color.main}50`,
                                    },
                                  }}
                                >
                                  {accentColor === color.id && (
                                    <CheckIcon
                                      sx={{
                                        color: color.contrastText,
                                        fontSize: 24,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Tooltip>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </Box>

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

                      {isUserSupporter ? (
                        <>
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
                                  <Typography
                                    variant='body1'
                                    fontWeight='medium'
                                  >
                                    Dados 3D
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                  >
                                    Ativa animações 3D ao rolar dados nas mesas
                                    de jogo
                                  </Typography>
                                </Stack>
                              }
                            />
                          </Box>

                          {/* Dice Color Picker - Only visible when 3D dice is enabled */}
                          {dice3DEnabled && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant='body2'
                                fontWeight='medium'
                                gutterBottom
                              >
                                Cor dos Dados
                              </Typography>
                              <Stack
                                direction='row'
                                spacing={1.5}
                                flexWrap='wrap'
                                useFlexGap
                              >
                                {getDiceColorsArray().map((color) => (
                                  <Tooltip
                                    key={color.id}
                                    title={color.name}
                                    arrow
                                  >
                                    <Box
                                      onClick={() =>
                                        !dice3DLoading &&
                                        handleChangeDiceColor(color.id)
                                      }
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        backgroundColor: color.hex,
                                        cursor: dice3DLoading
                                          ? 'not-allowed'
                                          : 'pointer',
                                        border:
                                          diceColor === color.id
                                            ? '3px solid'
                                            : '2px solid transparent',
                                        borderColor:
                                          diceColor === color.id
                                            ? 'text.primary'
                                            : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        boxShadow:
                                          diceColor === color.id
                                            ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${color.hex}`
                                            : 'none',
                                        '&:hover': {
                                          transform: 'scale(1.1)',
                                          boxShadow: `0 4px 12px ${color.hex}50`,
                                        },
                                      }}
                                    >
                                      {diceColor === color.id && (
                                        <CheckIcon
                                          sx={{
                                            color: color.textColor,
                                            fontSize: 18,
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Tooltip>
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </>
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'action.disabledBackground',
                            opacity: 0.7,
                          }}
                        >
                          <Stack
                            direction='row'
                            spacing={1}
                            alignItems='center'
                          >
                            <Checkbox disabled checked={false} />
                            <Stack spacing={0.5}>
                              <Stack
                                direction='row'
                                spacing={1}
                                alignItems='center'
                              >
                                <Typography variant='body1' fontWeight='medium'>
                                  Dados 3D
                                </Typography>
                                <Chip
                                  label='Apoiadores'
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                  icon={<FavoriteIcon />}
                                />
                              </Stack>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                Recurso exclusivo para apoiadores. Ativa
                                animações 3D ao rolar dados nas mesas de jogo.
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography variant='h6' fontWeight='bold' gutterBottom>
                        Notificações
                      </Typography>
                      <PushNotificationToggle variant='full' />
                    </Box>

                    <Box>
                      <Typography variant='h6' fontWeight='bold' gutterBottom>
                        Privacidade
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ mb: 2, display: 'block' }}
                      >
                        Controle como você aparece para outros usuários
                      </Typography>

                      {bestiaryAnonymousError && (
                        <Alert severity='error' sx={{ mb: 2 }}>
                          {bestiaryAnonymousError}
                        </Alert>
                      )}

                      {bestiaryAnonymousSuccess && (
                        <Alert severity='success' sx={{ mb: 2 }}>
                          Configuração salva com sucesso!
                        </Alert>
                      )}

                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: bestiaryAnonymous
                            ? 'primary.main'
                            : 'divider',
                          backgroundColor: bestiaryAnonymous
                            ? 'action.selected'
                            : 'transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={bestiaryAnonymous}
                              onChange={(e) =>
                                handleToggleBestiaryAnonymous(e.target.checked)
                              }
                              disabled={bestiaryAnonymousLoading}
                            />
                          }
                          label={
                            <Stack spacing={0.5}>
                              <Typography variant='body1' fontWeight='medium'>
                                Publicar no Bestiário anonimamente
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                Quando ativado, seu nome de usuário não será
                                exibido nas ameaças que você publica no
                                Bestiário da Comunidade. Útil para mestres que
                                não querem dar spoilers para seus jogadores.
                              </Typography>
                            </Stack>
                          }
                        />
                      </Box>
                    </Box>

                    <Box ref={supplementsSectionRef}>
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

              {/* Aba de Apoio */}
              <TabPanel value={currentTab} index={2}>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={3}>
                    {/* Success/Error Messages */}
                    {subscriptionActionSuccess && (
                      <Alert severity='success'>
                        {subscriptionActionSuccess}
                      </Alert>
                    )}
                    {subscriptionError && (
                      <Alert severity='error'>{subscriptionError}</Alert>
                    )}

                    {/* Current Support Level */}
                    <Box>
                      <Typography variant='h6' fontWeight='bold' gutterBottom>
                        Seu Nível de Apoio
                      </Typography>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isUserSupporter
                            ? 'primary.main'
                            : 'divider',
                          bgcolor: isUserSupporter
                            ? 'action.selected'
                            : 'background.paper',
                        }}
                      >
                        <Stack
                          direction='row'
                          alignItems='center'
                          justifyContent='space-between'
                          flexWrap='wrap'
                          gap={2}
                        >
                          <Stack
                            direction='row'
                            alignItems='center'
                            spacing={2}
                          >
                            {isUserSupporter ? (
                              <SupporterBadge level={supportLevel} />
                            ) : (
                              <Chip label='Grátis' variant='outlined' />
                            )}
                            <Box>
                              <Typography variant='body1' fontWeight='medium'>
                                {getSupportLevelName(supportLevel)}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {isUserSupporter
                                  ? `Até ${SUPPORT_LIMITS[supportLevel].maxSheets} fichas salvas`
                                  : 'Até 5 fichas salvas'}
                              </Typography>
                            </Box>
                          </Stack>
                          {!isUserSupporter && (
                            <Button
                              variant='contained'
                              color='primary'
                              onClick={() => history.push('/apoiar')}
                            >
                              Tornar-se Apoiador
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Box>

                    {/* Subscription Details - Only for supporters */}
                    {isUserSupporter && subscription && (
                      <>
                        <Box>
                          <Typography
                            variant='h6'
                            fontWeight='bold'
                            gutterBottom
                          >
                            Detalhes da Assinatura
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Stack
                                direction='row'
                                spacing={1.5}
                                alignItems='center'
                              >
                                <CalendarIcon color='primary' />
                                <Box>
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                  >
                                    {isManualSubscription
                                      ? 'Expira em'
                                      : 'Próxima Cobrança'}
                                  </Typography>
                                  <Typography
                                    variant='body1'
                                    fontWeight='medium'
                                  >
                                    {isManualSubscription
                                      ? formatInvoiceDate(
                                          subscription.currentPeriodEnd
                                        )
                                      : subscription.cancelAtPeriodEnd
                                      ? 'Não haverá renovação'
                                      : formatInvoiceDate(
                                          subscription.currentPeriodEnd
                                        )}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Stack
                                direction='row'
                                spacing={1.5}
                                alignItems='center'
                              >
                                <CreditCardIcon color='primary' />
                                <Box>
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                  >
                                    Status
                                  </Typography>
                                  <Chip
                                    label={getSubscriptionStatusLabel()}
                                    size='small'
                                    color={getSubscriptionStatusColor()}
                                  />
                                </Box>
                              </Stack>
                            </Grid>
                          </Grid>

                          {/* Cancel at period end warning */}
                          {subscription.cancelAtPeriodEnd &&
                            !isManualSubscription && (
                              <Alert severity='warning' sx={{ mt: 2 }}>
                                Seu apoio será encerrado em{' '}
                                {formatInvoiceDate(
                                  subscription.currentPeriodEnd
                                )}
                                . Você ainda pode reativar antes dessa data.
                              </Alert>
                            )}

                          {/* Manual subscription info */}
                          {isManualSubscription && (
                            <Alert severity='info' sx={{ mt: 2 }}>
                              Seu apoio expira automaticamente em{' '}
                              {formatInvoiceDate(subscription.currentPeriodEnd)}
                              .
                            </Alert>
                          )}
                        </Box>

                        {/* Billing History - Only for Stripe subscriptions */}
                        {!isManualSubscription && (
                          <Box>
                            <Typography
                              variant='h6'
                              fontWeight='bold'
                              gutterBottom
                            >
                              <Stack
                                direction='row'
                                alignItems='center'
                                spacing={1}
                              >
                                <ReceiptIcon />
                                <span>Histórico de Cobranças</span>
                              </Stack>
                            </Typography>
                            {subscriptionLoading && (
                              <Box
                                display='flex'
                                justifyContent='center'
                                py={3}
                              >
                                <CircularProgress size={24} />
                              </Box>
                            )}
                            {!subscriptionLoading &&
                              invoices &&
                              invoices.length > 0 && (
                                <Stack spacing={1}>
                                  {invoices.map((invoice: Invoice) => (
                                    <Box
                                      key={invoice.id}
                                      sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                      }}
                                    >
                                      <Box>
                                        <Typography
                                          variant='body2'
                                          fontWeight='medium'
                                        >
                                          {formatInvoiceDate(invoice.paidAt)}
                                        </Typography>
                                        <Typography
                                          variant='caption'
                                          color='text.secondary'
                                        >
                                          Período:{' '}
                                          {formatInvoiceDate(
                                            invoice.periodStart
                                          )}{' '}
                                          -{' '}
                                          {formatInvoiceDate(invoice.periodEnd)}
                                        </Typography>
                                      </Box>
                                      <Stack
                                        direction='row'
                                        alignItems='center'
                                        spacing={2}
                                      >
                                        <Typography
                                          variant='body1'
                                          fontWeight='bold'
                                          color='primary'
                                        >
                                          {formatCurrency(
                                            invoice.amount,
                                            invoice.currency
                                          )}
                                        </Typography>
                                        <Chip
                                          label={
                                            invoice.status === 'paid'
                                              ? 'Pago'
                                              : 'Pendente'
                                          }
                                          size='small'
                                          color={
                                            invoice.status === 'paid'
                                              ? 'success'
                                              : 'warning'
                                          }
                                        />
                                        {invoice.invoiceUrl && (
                                          <Button
                                            size='small'
                                            href={invoice.invoiceUrl}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            endIcon={<OpenInNewIcon />}
                                          >
                                            Ver
                                          </Button>
                                        )}
                                      </Stack>
                                    </Box>
                                  ))}
                                </Stack>
                              )}
                            {!subscriptionLoading &&
                              (!invoices || invoices.length === 0) && (
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                  sx={{ py: 2 }}
                                >
                                  Nenhuma cobrança encontrada.
                                </Typography>
                              )}
                          </Box>
                        )}

                        {/* Actions - Only for Stripe subscriptions */}
                        {!isManualSubscription && (
                          <Box>
                            <Typography
                              variant='h6'
                              fontWeight='bold'
                              gutterBottom
                            >
                              Gerenciar Apoio
                            </Typography>
                            <Stack
                              direction={isMobile ? 'column' : 'row'}
                              spacing={2}
                            >
                              <Button
                                variant='outlined'
                                onClick={manageSubscription}
                                startIcon={<CreditCardIcon />}
                              >
                                Gerenciar Pagamento
                              </Button>
                              {subscription.cancelAtPeriodEnd ? (
                                <Button
                                  variant='contained'
                                  color='success'
                                  onClick={handleReactivateSubscription}
                                  disabled={reactivateLoading}
                                  startIcon={
                                    reactivateLoading ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <RefreshIcon />
                                    )
                                  }
                                >
                                  Reativar Apoio
                                </Button>
                              ) : (
                                <Button
                                  variant='outlined'
                                  color='error'
                                  onClick={() => setCancelDialogOpen(true)}
                                  startIcon={<CancelIcon />}
                                >
                                  Cancelar Apoio
                                </Button>
                              )}
                            </Stack>
                          </Box>
                        )}
                      </>
                    )}

                    {/* CTA for non-supporters */}
                    {!isUserSupporter && (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          textAlign: 'center',
                        }}
                      >
                        <FavoriteIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant='h6' gutterBottom>
                          Apoie o Fichas de Nimb!
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ mb: 2, opacity: 0.9 }}
                        >
                          Ajude a manter o projeto e desbloqueie funcionalidades
                          exclusivas como mais fichas salvas e badges especiais.
                        </Typography>
                        <Button
                          variant='contained'
                          color='secondary'
                          size='large'
                          onClick={() => history.push('/apoiar')}
                        >
                          Ver Planos de Apoio
                        </Button>
                      </Box>
                    )}
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <FavoriteIcon
                    sx={{
                      color: isSupporter(
                        profile.supportLevel || SupportLevel.FREE
                      )
                        ? 'error.main'
                        : 'text.secondary',
                    }}
                  />
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Status
                    </Typography>
                    <Typography variant='h6' fontWeight='bold'>
                      {getSupportLevelName(
                        profile.supportLevel || SupportLevel.FREE
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Stack>
      </Container>

      {/* Cancel Subscription Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Cancelar Apoio</DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 2 }}>
            Tem certeza que deseja cancelar seu apoio?
          </Alert>
          <Typography variant='body2' color='text.secondary'>
            Seu apoio continuará ativo até o final do período de cobrança atual
            {subscription?.currentPeriodEnd && (
              <> ({formatInvoiceDate(subscription.currentPeriodEnd)})</>
            )}
            . Após essa data, você perderá acesso aos benefícios de apoiador.
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Você pode reativar seu apoio a qualquer momento antes do término do
            período.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelLoading}
          >
            Manter Apoio
          </Button>
          <Button
            onClick={handleCancelSubscription}
            variant='contained'
            color='error'
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Confirmar Cancelamento'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {isOwnProfile && (
        <ProfileEditor
          open={profileEditorOpen}
          onClose={() => setProfileEditorOpen(false)}
          supportLevel={supportLevel}
          currentPhotoURL={profile.photoURL}
          initialSections={profile.sections}
          initialTheme={profile.theme}
          initialUsername={currentUser?.username || ''}
          initialFullName={currentUser?.fullName || ''}
          canEditUsername={isUserSupporter}
          onSaveAccount={handleSaveAccount}
          onSaved={(sections: ResolvedSection[]) =>
            setProfile((prev) => (prev ? { ...prev, sections } : prev))
          }
          onThemeSaved={(newTheme: ProfileTheme) =>
            setProfile((prev) => (prev ? { ...prev, theme: newTheme } : prev))
          }
          onPhotoSaved={(photoURL?: string) =>
            setProfile((prev) => (prev ? { ...prev, photoURL } : prev))
          }
        />
      )}
    </>
  );
};

export default ProfilePage;
