import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';

import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch as SwitchMUI,
  useMediaQuery,
  IconButton,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

import { SnackbarProvider } from 'notistack';

import { PersistGate } from 'redux-persist/integration/react';
import { AttackResult, CharacterAttack } from 't20-sheet-builder';
import { SkillRollResult } from 't20-sheet-builder/build/domain/entities/Skill/SheetSkill';
import { CssVarsProvider } from './theme/CssVarsProvider';
import { createTormentaTheme } from './theme/theme';

import AttackRollResult from './components/SheetBuilder/common/AttackRollResult';
import AttributeRollResult from './components/SheetBuilder/common/AttributeRollResult';
import DiceRollResult from './components/SheetBuilder/common/DiceRollResult';
import SkillRollNotification, {
  SkillRollData,
} from './components/SheetResult/notifications/SkillRollNotification';
import AttributeRollNotification, {
  AttributeRollData,
} from './components/SheetResult/notifications/AttributeRollNotification';
import AttackRollNotification, {
  AttackRollData,
} from './components/SheetResult/notifications/AttackRollNotification';
import Sidebar from './components/Sidebar';
import UserMenu from './components/Auth/UserMenu';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SystemSetupDialog from './components/SystemSetupDialog';
import { AuthProvider } from './contexts/AuthContext';
import CavernaDoSaber from './components/screens/CavernaDoSaber';
import Changelog from './components/screens/Changelog';
import Database from './components/screens/Database';
import LandingPage from './components/screens/LandingPage';
import MainScreen from './components/screens/MainScreen';
import MyCharactersPage from './components/screens/MyCharactersPage';
import Rewards from './components/screens/Rewards';
import SheetBuilderPage from './components/screens/SheetBuilderPage';
import SheetList from './components/screens/SheetList';
import SuperiorItems from './components/screens/SuperiorItems';
import MagicalItems from './components/screens/MagicalItems';
import ProfilePage from './components/screens/ProfilePage';
import ThreatGeneratorScreen from './components/ThreatGenerator/ThreatGeneratorScreen';
import ThreatHistory from './components/ThreatGenerator/ThreatHistory';
import ThreatViewWrapper from './components/ThreatGenerator/ThreatViewWrapper';
import ThreatViewCloudWrapper from './components/ThreatGenerator/ThreatViewCloudWrapper';
import SheetViewPage from './components/screens/SheetViewPage';
import SystemUpdate from './components/SystemUpdate';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { saveSystemSetup } from './store/slices/auth/authSlice';
import store, { persistor, AppDispatch } from './store';
import { SupplementId } from './types/supplement.types';
import tormentaLogo from './assets/images/tormenta-logo-eye.png';
// Support page
import SupportPage from './components/Premium/SupportPage';
import SupportSuccessPage from './components/Premium/SupportSuccessPage';

// Premium features
import {
  BuildsProvider,
  BuildViewPage as PremiumBuildViewPage,
  BuildsListPage,
  MyBuildsPage,
} from './premium';
import { Dice3DProvider } from './contexts/Dice3DContext';
// import CreatureSheet from './components/screens/CreatureSheet';

declare module 'notistack' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface VariantOverrides {
    diceRoll: {
      roll: SkillRollResult;
    };
    attackRoll: {
      attackResult: AttackResult;
      attack: CharacterAttack;
    };
    attributeRoll: {
      rollResult: number;
      bonus: number;
    };
    skillRoll: {
      roll: SkillRollData;
    };
    attributeCheck: {
      roll: AttributeRollData;
    };
    weaponAttack: {
      roll: AttackRollData;
    };
  }
}

const lightTheme = {
  backgroundColor: '#f3f2f1',
};

const darkTheme = {
  backgroundColor: '#212121',
  color: '#FFF',
};

// Component to show loading overlay while checking auth
function AuthLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { loading, user, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [showSetupDialog, setShowSetupDialog] = React.useState(false);

  // Check if user needs initial setup
  React.useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Se o usuário não completou o setup inicial, mostra o diálogo
      if (!user.hasCompletedInitialSetup) {
        setShowSetupDialog(true);
      }
    }
  }, [loading, isAuthenticated, user]);

  const handleSetupComplete = async (supplements: SupplementId[]) => {
    await dispatch(saveSystemSetup(supplements)).unwrap();
    setShowSetupDialog(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
          zIndex: 9999,
        }}
      >
        <Box
          component='img'
          src={tormentaLogo}
          alt='Fichas de Nimb'
          sx={{
            width: 120,
            height: 120,
            mb: 3,
            opacity: 0.9,
          }}
        />
        <CircularProgress size={50} color='primary' />
        <Typography variant='body1' sx={{ mt: 2, color: 'text.secondary' }}>
          Carregando...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <SystemSetupDialog
        open={showSetupDialog}
        onComplete={handleSetupComplete}
        currentSupplements={
          user?.enabledSupplements || [SupplementId.TORMENTA20_CORE]
        }
      />
      {children}
    </>
  );
}

function App(): JSX.Element {
  const ls = localStorage;
  const history = useHistory();

  const isMb = useMediaQuery('(max-width:600px)');

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  const theme = React.useMemo(
    () => createTormentaTheme(isDarkTheme ? 'dark' : 'light'),
    [isDarkTheme]
  );

  const onClickMenu = () => {
    setSidebarVisibility(!sidebarVisibility);
  };

  const onCloseSidebar = () => {
    setSidebarVisibility(false);
  };

  const onChangeTheme = () => {
    if (isDarkTheme) {
      ls.removeItem('dkmFdn');
    } else {
      ls.setItem('dkmFdn', `${!isDarkTheme}`);
    }

    setIsDarkTheme(!isDarkTheme);
  };

  useEffect(() => {
    const darkMod = ls.getItem('dkmFdn') === 'true';
    setIsDarkTheme(darkMod);
  }, []);

  const onClickToLink = (link: string) => {
    // Smooth scroll page to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.push(`/${link}`);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssVarsProvider>
          <SnackbarProvider
            autoHideDuration={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            Components={{
              diceRoll: DiceRollResult,
              attackRoll: AttackRollResult,
              attributeRoll: AttributeRollResult,
              skillRoll: SkillRollNotification,
              attributeCheck: AttributeRollNotification,
              weaponAttack: AttackRollNotification,
            }}
          >
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <AuthProvider>
                  <BuildsProvider>
                    <Dice3DProvider>
                      <AuthLoadingWrapper>
                        <div
                          className='App'
                          data-testid='app-component'
                          style={isDarkTheme ? darkTheme : lightTheme}
                        >
                          <SystemUpdate />
                          <PWAInstallPrompt />
                          <div className='mainApp'>
                            <header className='App-header'>
                              <Sidebar
                                visible={sidebarVisibility}
                                onCloseSidebar={onCloseSidebar}
                                isDarkTheme={isDarkTheme}
                                onChangeTheme={onChangeTheme}
                              />
                              <Stack
                                alignItems='center'
                                sx={{ width: '100%', position: 'absolute' }}
                              >
                                <Box
                                  sx={{
                                    width: isMb ? '90%' : '50%',
                                    m: 2,
                                    p: 2,
                                    backgroundColor: 'primary.main',
                                    borderRadius: '0.75rem',
                                    color: 'primary.contrastText',
                                    zIndex: 2,
                                  }}
                                >
                                  <Stack
                                    width='100%'
                                    direction='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                  >
                                    <IconButton
                                      onClick={onClickMenu}
                                      edge='start'
                                      color='inherit'
                                      aria-label='menu'
                                    >
                                      <MenuIcon />
                                    </IconButton>
                                    <Typography
                                      sx={{
                                        cursor: 'pointer',
                                        fontFamily: 'Tfont',
                                      }}
                                      variant='h6'
                                      onClick={() => onClickToLink('')}
                                    >
                                      Fichas de Nimb
                                    </Typography>

                                    <Stack
                                      direction='row'
                                      spacing={2}
                                      alignItems='center'
                                    >
                                      <FormGroup>
                                        <FormControlLabel
                                          labelPlacement='end'
                                          control={
                                            <SwitchMUI
                                              checked={isDarkTheme}
                                              onChange={onChangeTheme}
                                              color='default'
                                              value='dark'
                                            />
                                          }
                                          label='Tema Escuro'
                                        />
                                      </FormGroup>
                                      <UserMenu />
                                    </Stack>
                                  </Stack>
                                </Box>
                              </Stack>
                            </header>
                            <Box className='mainArea' sx={{ mt: 15 }}>
                              <Switch>
                                <Route path='/changelog'>
                                  <Changelog />
                                </Route>
                                <Route path='/recompensas'>
                                  <Rewards isDarkMode={isDarkTheme} />
                                </Route>
                                <Route path='/itens-superiores'>
                                  <SuperiorItems isDarkMode={isDarkTheme} />
                                </Route>
                                <Route path='/itens-magicos'>
                                  <MagicalItems isDarkMode={isDarkTheme} />
                                </Route>
                                <Route path='/criar-ficha'>
                                  <MainScreen isDarkMode={isDarkTheme} />
                                </Route>
                                <Route path='/ficha-aleatoria'>
                                  <MainScreen isDarkMode={isDarkTheme} />
                                </Route>
                                <Route path='/database'>
                                  <Database isDarkMode={isDarkTheme} />
                                </Route>
                                <Route path='/caverna-do-saber'>
                                  <CavernaDoSaber />
                                </Route>
                                <Route path='/meus-personagens'>
                                  <ProtectedRoute requireAuth redirectTo='/'>
                                    <MyCharactersPage />
                                  </ProtectedRoute>
                                </Route>
                                <Route path='/ficha/:id'>
                                  <SheetViewPage />
                                </Route>
                                <Route path='/builds'>
                                  <ProtectedRoute requireAuth redirectTo='/'>
                                    <BuildsListPage />
                                  </ProtectedRoute>
                                </Route>
                                <Route path='/my-builds'>
                                  <ProtectedRoute requireAuth redirectTo='/'>
                                    <MyBuildsPage />
                                  </ProtectedRoute>
                                </Route>
                                <Route path='/build/:id'>
                                  <PremiumBuildViewPage />
                                </Route>
                                <Route path='/sheets'>
                                  <SheetList />
                                </Route>
                                <Route path='/sheet-builder/:id'>
                                  <SheetBuilderPage />
                                </Route>
                                <Route path='/gerador-ameacas'>
                                  <ThreatGeneratorScreen
                                    isDarkMode={isDarkTheme}
                                  />
                                </Route>
                                <Route path='/threat-generator'>
                                  <ThreatGeneratorScreen
                                    isDarkMode={isDarkTheme}
                                  />
                                </Route>
                                <Route path='/threat-history'>
                                  <ThreatHistory />
                                </Route>
                                <Route path='/threat-view'>
                                  <ThreatViewCloudWrapper />
                                </Route>
                                <Route path='/threat/:id'>
                                  <ThreatViewWrapper />
                                </Route>
                                <Route path='/perfil/:username'>
                                  <ProfilePage />
                                </Route>
                                <Route path='/u/:username'>
                                  <ProfilePage />
                                </Route>
                                {/* Support pages */}
                                <Route path='/apoiar/sucesso'>
                                  <SupportSuccessPage />
                                </Route>
                                <Route path='/apoiar'>
                                  <SupportPage />
                                </Route>
                                {/* <Route path='/ficha-criatura'>
                <CreatureSheet isDarkMode={isDarkTheme} />
              </Route> */}
                                <Route>
                                  <LandingPage onClickButton={onClickToLink} />
                                </Route>
                              </Switch>
                            </Box>
                          </div>
                          <footer id='bottom'>
                            <div>
                              <p>
                                Tormenta 20 é um produto da Jambô Editora e seus
                                respectivos criadores, todos os direitos
                                reservados.
                              </p>
                              <p>
                                <a
                                  href='https://jamboeditora.com.br/'
                                  target='blank'
                                >
                                  https://jamboeditora.com.br/
                                </a>
                              </p>
                              <p>
                                Este é um projeto de fãs e não possui fins
                                lucrativos
                              </p>
                            </div>
                          </footer>
                        </div>
                      </AuthLoadingWrapper>
                    </Dice3DProvider>
                  </BuildsProvider>
                </AuthProvider>
              </PersistGate>
            </Provider>
          </SnackbarProvider>
        </CssVarsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
