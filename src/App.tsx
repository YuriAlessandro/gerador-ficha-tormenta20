import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { SnackbarProvider } from 'notistack';

import { PersistGate } from 'redux-persist/integration/react';
import { AttackResult, CharacterAttack } from 't20-sheet-builder';
import { SkillRollResult } from 't20-sheet-builder/build/domain/entities/Skill/SheetSkill';
import { CssVarsProvider } from './theme/CssVarsProvider';
import { createTormentaTheme } from './theme/theme';

import AttackRollResult from './components/SheetBuilder/common/AttackRollResult';
import AttributeRollResult from './components/SheetBuilder/common/AttributeRollResult';
import DiceRollResult from './components/SheetBuilder/common/DiceRollResult';
import SidebarV2 from './components/SidebarV2';
import NavbarV2 from './components/NavbarV2';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SystemSetupDialog from './components/SystemSetupDialog';
import { AuthProvider } from './contexts/AuthContext';
import CavernaDoSaber from './components/screens/CavernaDoSaber';
import Changelog from './components/screens/Changelog';
import Database from './components/screens/Database';
import LandingPageV2 from './components/LandingPageV2';
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
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { useUserPreferences } from './hooks/useUserPreferences';
import { saveSystemSetup } from './store/slices/auth/authSlice';
import store, { persistor, AppDispatch } from './store';
import { SupplementId } from './types/supplement.types';
import tormentaLogo from './assets/images/tormenta-logo-eye.png';
// Support page
import SupportPage from './components/Premium/SupportPage';
import SupportSuccessPage from './components/Premium/SupportSuccessPage';
import JamboFooter from './components/LandingPageV2/JamboFooter';

// Premium features
import {
  BuildsProvider,
  BuildViewPage as PremiumBuildViewPage,
  BuildsListPage,
  MyBuildsPage,
  GameTableProvider,
  GameTablesPage,
  GameTableDetailPage,
  GameSessionPage,
  DiceRollProvider,
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
  }
}

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

// Inner app component that uses the preferences hook
function ThemedApp(): JSX.Element {
  const history = useHistory();
  const { accentColor, darkMode, setDarkMode } = useUserPreferences();

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);

  const theme = React.useMemo(
    () => createTormentaTheme(darkMode ? 'dark' : 'light', accentColor),
    [darkMode, accentColor]
  );

  const lightTheme = {
    backgroundColor: '#f3f2f1',
  };

  const darkThemeStyles = {
    backgroundColor: '#212121',
    color: '#FFF',
  };

  const onClickMenu = () => {
    setSidebarVisibility(!sidebarVisibility);
  };

  const onCloseSidebar = () => {
    setSidebarVisibility(false);
  };

  const onChangeTheme = () => {
    setDarkMode(!darkMode);
  };

  const onClickToLink = (link: string) => {
    // Smooth scroll page to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Handle links that already have leading slash
    const path = link.startsWith('/') ? link : `/${link}`;
    history.push(path);
  };

  return (
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
          }}
        >
          <AuthProvider>
            <BuildsProvider>
              <GameTableProvider>
                <Dice3DProvider>
                  <DiceRollProvider>
                    <AuthLoadingWrapper>
                      <div
                        className='App'
                        data-testid='app-component'
                        style={darkMode ? darkThemeStyles : lightTheme}
                      >
                        <PWAInstallPrompt />
                        <div className='mainApp'>
                          <header className='App-header'>
                            <SidebarV2
                              visible={sidebarVisibility}
                              onCloseSidebar={onCloseSidebar}
                              isDarkTheme={darkMode}
                              onChangeTheme={onChangeTheme}
                            />
                            <Stack
                              alignItems='center'
                              sx={{ width: '100%', position: 'absolute' }}
                            >
                              <NavbarV2
                                onClickMenu={onClickMenu}
                                onClickToLink={onClickToLink}
                              />
                            </Stack>
                          </header>
                          <Box className='mainArea' sx={{ mt: 15 }}>
                            <Switch>
                              <Route path='/changelog'>
                                <Changelog />
                              </Route>
                              <Route path='/recompensas'>
                                <Rewards isDarkMode={darkMode} />
                              </Route>
                              <Route path='/itens-superiores'>
                                <SuperiorItems isDarkMode={darkMode} />
                              </Route>
                              <Route path='/itens-magicos'>
                                <MagicalItems isDarkMode={darkMode} />
                              </Route>
                              <Route path='/criar-ficha'>
                                <MainScreen isDarkMode={darkMode} />
                              </Route>
                              <Route path='/ficha-aleatoria'>
                                <MainScreen isDarkMode={darkMode} />
                              </Route>
                              <Route path='/database'>
                                <Database isDarkMode={darkMode} />
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
                              {/* Game Tables - Auth required, premium check done by backend */}
                              <Route path='/mesas'>
                                <ProtectedRoute requireAuth redirectTo='/'>
                                  <GameTablesPage />
                                </ProtectedRoute>
                              </Route>
                              <Route path='/mesa/:tableId'>
                                <ProtectedRoute requireAuth redirectTo='/'>
                                  <GameTableDetailPage />
                                </ProtectedRoute>
                              </Route>
                              <Route path='/sessao/:tableId'>
                                <ProtectedRoute requireAuth redirectTo='/'>
                                  <GameSessionPage />
                                </ProtectedRoute>
                              </Route>
                              <Route path='/sheets'>
                                <SheetList />
                              </Route>
                              <Route path='/sheet-builder/:id'>
                                <SheetBuilderPage />
                              </Route>
                              <Route path='/gerador-ameacas'>
                                <ThreatGeneratorScreen isDarkMode={darkMode} />
                              </Route>
                              <Route path='/threat-generator'>
                                <ThreatGeneratorScreen isDarkMode={darkMode} />
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
                <CreatureSheet isDarkMode={darkMode} />
              </Route> */}
                              <Route>
                                <LandingPageV2 onClickButton={onClickToLink} />
                              </Route>
                            </Switch>
                          </Box>
                        </div>
                        <JamboFooter />
                      </div>
                    </AuthLoadingWrapper>
                  </DiceRollProvider>
                </Dice3DProvider>
              </GameTableProvider>
            </BuildsProvider>
          </AuthProvider>
        </SnackbarProvider>
      </CssVarsProvider>
    </ThemeProvider>
  );
}

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemedApp />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
