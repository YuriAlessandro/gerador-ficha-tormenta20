import React, { Suspense } from 'react';
import {
  Route,
  Switch,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { SnackbarProvider } from 'notistack';

import { PersistGate } from 'redux-persist/integration/react';
import { AttackResult, CharacterAttack } from 't20-sheet-builder';
import { SkillRollResult } from 't20-sheet-builder/build/domain/entities/Skill/SheetSkill';
import { CssVarsProvider } from './theme/CssVarsProvider';
import { createTormentaTheme } from './theme/theme';
import retryImport from './utils/retryImport';

import AttackRollResult from './components/SheetBuilder/common/AttackRollResult';
import AttributeRollResult from './components/SheetBuilder/common/AttributeRollResult';
import DiceRollResult from './components/SheetBuilder/common/DiceRollResult';
import SidebarV2 from './components/SidebarV2';
import NavbarV2 from './components/NavbarV2';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SystemSetupDialog from './components/SystemSetupDialog';
import TermsAcceptanceModal from './components/Terms/TermsAcceptanceModal';
import { AuthProvider } from './contexts/AuthContext';
import { CURRENT_TERMS_VERSION } from './constants/terms';
import LandingPageV2 from './components/LandingPageV2';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ScrollToTop from './components/ScrollToTop';
import NotificationDeepLinkHandler from './components/Notifications/NotificationDeepLinkHandler';
import ErrorBoundary from './components/ErrorBoundary';
import { SEOProvider } from './components/SEO';
import { useAuth } from './hooks/useAuth';
import {
  useUserPreferences,
  useEnforceAccentColorAccess,
} from './hooks/useUserPreferences';
import { saveSystemSetup } from './store/slices/auth/authSlice';
import store, { persistor, AppDispatch } from './store';
import { setFeatureFlags } from './store/slices/system/systemSlice';
import { DEFAULT_FEATURE_FLAGS } from './types/featureFlags.types';
import { useFeatureAccess } from './hooks/useFeatureAccess';
import { SupplementId } from './types/supplement.types';
import logoFichasDeNimb from './assets/images/logoFichasDeNimb.svg';
// Support page
import JamboFooter from './components/LandingPageV2/JamboFooter';

// Premium features (including Blog components)
import {
  BuildsProvider,
  BuildViewPage as PremiumBuildViewPage,
  BuildsListPage,
  MyBuildsPage,
  BestiaryListPage,
  MyBestiaryPage,
  BestiaryViewPage as PremiumBestiaryViewPage,
  GameTableProvider,
  GameTablesPage,
  GameTableDetailPage,
  GameSessionPage,
  PlayerScreenPage,
  JoinTableByLinkPage,
  PartnersProvider,
  HomebrewProvider,
  HomebrewsListPage,
  MyHomebrewsPage,
  HomebrewViewPage,
  HomebrewTestSheetPage,
  RaceHomebrewEditorPage,
  ClassHomebrewEditorPage,
  SpellPackEditorPage,
  ItemPackEditorPage,
  VariantClassEditorPage,
  PowerPackEditorPage,
  CollectionEditorPage,
  OriginHomebrewEditorPage,
  DeityHomebrewEditorPage,
  HomebrewEditEntryPage,
  DiceRollProvider,
  BlogList,
  BlogPostPage,
  BlogEditor,
  ForumProvider,
  ForumPage,
  ThreadPage,
  CreateThreadPage,
  EditThreadPage,
  AdminPage,
  PushNotificationPrompt,
  CosmeticsNudgeDialog,
  getFeatureFlags,
  MapaDeArtonPage,
} from './premium';
import { Dice3DProvider } from './contexts/Dice3DContext';
import { safeTop } from './theme/safeArea';
import SafeAreaScrim from './components/SafeAreaScrim';
// import CreatureSheet from './components/screens/CreatureSheet';

// Telas de rota carregadas sob demanda. Cada uma vira um chunk próprio, então
// a carga inicial não arrasta mais o app inteiro — o Changelog sozinho tem
// 460 KB de fonte, e quem só quer gerar uma ficha não precisa dele. Em dev
// isso também encolhe o grafo de módulos que o Vite transforma e mantém em
// memória a cada page load.
//
// LandingPageV2 fica de fora de propósito: é a rota catch-all (a home), então
// adiar seu chunk só trocaria conteúdo por um spinner no primeiro paint.
// Toda tela lazy passa por `retryImport`: um GET de chunk que falha por rede
// (ou por o documento em memória ser de antes do último deploy) vira tela de
// erro sem isso — o módulo está íntegro no servidor, só faltou tentar de novo.
const lazyScreen: typeof React.lazy = (factory) =>
  React.lazy(retryImport(factory));

const CavernaDoSaber = lazyScreen(
  () => import('./components/screens/CavernaDoSaber')
);
const Changelog = lazyScreen(() => import('./components/screens/Changelog'));
const Database = lazyScreen(() => import('./components/screens/Database'));
const TermsOfUse = lazyScreen(() => import('./components/screens/TermsOfUse'));
const MainScreen = lazyScreen(() => import('./components/screens/MainScreen'));
const MyCharactersPage = lazyScreen(
  () => import('./components/screens/MyCharactersPage')
);
const Rewards = lazyScreen(() => import('./components/screens/Rewards'));
const SheetBuilderPage = lazyScreen(
  () => import('./components/screens/SheetBuilderPage')
);
const SheetList = lazyScreen(() => import('./components/screens/SheetList'));
const SuperiorItems = lazyScreen(
  () => import('./components/screens/SuperiorItems')
);
const MagicalItems = lazyScreen(
  () => import('./components/screens/MagicalItems')
);
const ProfilePage = lazyScreen(
  () => import('./components/screens/ProfilePage')
);
const SheetViewPage = lazyScreen(
  () => import('./components/screens/SheetViewPage')
);
const OwlbearSheetEmbedPage = lazyScreen(
  () => import('./components/screens/OwlbearSheetEmbedPage')
);
const InstallPage = lazyScreen(
  () => import('./components/screens/InstallPage')
);
const ThreatGeneratorScreen = lazyScreen(
  () => import('./components/ThreatGenerator/ThreatGeneratorScreen')
);
const ThreatHistory = lazyScreen(
  () => import('./components/ThreatGenerator/ThreatHistory')
);
const ThreatViewWrapper = lazyScreen(
  () => import('./components/ThreatGenerator/ThreatViewWrapper')
);
const ThreatViewCloudWrapper = lazyScreen(
  () => import('./components/ThreatGenerator/ThreatViewCloudWrapper')
);
const SupportPage = lazyScreen(
  () => import('./components/Premium/SupportPage')
);
const SupportSuccessPage = lazyScreen(
  () => import('./components/Premium/SupportSuccessPage')
);
const WyrtScreen = lazyScreen(() =>
  import('./premium/components/Wyrt').then((m) => ({ default: m.WyrtScreen }))
);

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
  const location = useLocation();
  const [showSetupDialog, setShowSetupDialog] = React.useState(false);

  // Check if user is on the terms page (allow reading terms without modal blocking)
  const isOnTermsPage = location.pathname === '/termos-de-uso';

  // Check if user needs to accept terms
  const needsTermsAcceptance = React.useMemo(() => {
    if (!isAuthenticated || !user) return false;
    const userTermsVersion = user.termsAcceptedVersion ?? 0;
    return userTermsVersion < CURRENT_TERMS_VERSION;
  }, [isAuthenticated, user]);

  // Check if this is an update to existing terms (user had accepted before)
  const isNewTerms = React.useMemo(() => {
    if (!user) return false;
    const userTermsVersion = user.termsAcceptedVersion ?? 0;
    return userTermsVersion > 0 && userTermsVersion < CURRENT_TERMS_VERSION;
  }, [user]);

  // Check if user needs initial setup (only after terms are accepted)
  React.useEffect(() => {
    if (!loading && isAuthenticated && user && !needsTermsAcceptance) {
      // Se o usuário não completou o setup inicial, mostra o diálogo
      if (!user.hasCompletedInitialSetup) {
        setShowSetupDialog(true);
      }
    }
  }, [loading, isAuthenticated, user, needsTermsAcceptance]);

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
          // `right: 0` em vez de `100vw`: evita rolagem horizontal pela calha da
          // scrollbar enquanto a tela de loading está montada.
          right: 0,
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
          src={logoFichasDeNimb}
          alt='Fichas de Nimb'
          sx={{
            width: 120,
            height: 120,
            mb: 3,
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
      <TermsAcceptanceModal
        open={needsTermsAcceptance && !isOnTermsPage}
        isNewTerms={isNewTerms}
      />
      <SystemSetupDialog
        open={showSetupDialog && !needsTermsAcceptance}
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
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { accentColor, darkMode, setDarkMode } = useUserPreferences();
  // Volta quem não é apoiador para a cor padrão quando a cor salva virou
  // exclusiva de apoiadores (ex.: fim dos temas comemorativos da Copa 2026).
  useEnforceAccentColorAccess();

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);
  const bestiaryEnabled = useFeatureAccess('bestiary').isEnabled;

  // Fetch feature flags on mount (public endpoint, no auth required)
  React.useEffect(() => {
    getFeatureFlags()
      .then((flags) =>
        dispatch(setFeatureFlags({ ...DEFAULT_FEATURE_FLAGS, ...flags }))
      )
      .catch(() => {
        // Silently fail - redux-persist cache will be used as fallback
      });
  }, [dispatch]);

  // Detectar se estamos na página de sessão (mesa virtual)
  const isGameSession =
    location.pathname.startsWith('/sessao/') || location.pathname === '/wyrt';

  // O subdomínio mapadearton.fichasdenimb.com.br funciona como máscara da
  // página /mapadearton: na raiz, redirecionamos para ela.
  const isMapSubdomain =
    typeof window !== 'undefined' &&
    window.location.hostname.startsWith('mapadearton.');

  // A página do Mapa de Arton tem chrome próprio (header minimalista), então
  // escondemos navbar/footer da plataforma, como na sessão de mesa.
  const isMapPage = location.pathname.startsWith('/mapadearton');

  // Ficha embutida na extensão do Owlbear Rodeo: renderização sem chrome.
  const isOwlbearEmbed = location.pathname.startsWith('/owlbear/ficha/');

  // Tela do Jogador: superfície de projeção, sem navbar/footer da plataforma.
  const isPlayerScreen = location.pathname.startsWith('/tela/');

  const hideChrome =
    isGameSession || isMapPage || isOwlbearEmbed || isPlayerScreen;

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
    // Handle links that already have leading slash
    const path = link.startsWith('/') ? link : `/${link}`;
    history.push(path);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssVarsProvider>
        {/* Fora do AuthLoadingWrapper de propósito: a faixa da status bar
            precisa estar pintada já na tela de carregamento. */}
        <SafeAreaScrim />
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
                <PartnersProvider>
                  <ForumProvider>
                    <HomebrewProvider>
                      <Dice3DProvider>
                        <DiceRollProvider>
                          <AuthLoadingWrapper>
                            <div
                              className='App'
                              data-testid='app-component'
                              style={darkMode ? darkThemeStyles : lightTheme}
                            >
                              <ScrollToTop />
                              <PWAInstallPrompt />
                              <PushNotificationPrompt />
                              <NotificationDeepLinkHandler />
                              <CosmeticsNudgeDialog />
                              <div className='mainApp'>
                                <header className='App-header'>
                                  <SidebarV2
                                    visible={sidebarVisibility}
                                    onCloseSidebar={onCloseSidebar}
                                    isDarkTheme={darkMode}
                                    onChangeTheme={onChangeTheme}
                                  />
                                  {!hideChrome && (
                                    <Stack
                                      sx={{
                                        alignItems: 'center',
                                        width: '100%',
                                        position: 'absolute',
                                        // O containing block deste Stack é o
                                        // initial containing block (nenhum
                                        // ancestral é posicionado), então o
                                        // padding do .App não o move — o inset
                                        // da status bar tem que vir no `top`.
                                        top: safeTop(),
                                      }}
                                    >
                                      <NavbarV2
                                        onClickMenu={onClickMenu}
                                        onClickToLink={onClickToLink}
                                      />
                                    </Stack>
                                  )}
                                </header>
                                <Box
                                  className='mainArea'
                                  sx={{ mt: hideChrome ? 0 : safeTop(120) }}
                                >
                                  {/* As telas de rota são lazy: este fallback cobre o intervalo entre
                                      a navegação e o chunk chegar. O chrome (navbar/sidebar) fica
                                      montado em volta, então basta um spinner na área de conteúdo. */}
                                  <Suspense
                                    fallback={
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          minHeight: '50vh',
                                        }}
                                      >
                                        <CircularProgress
                                          size={50}
                                          color='primary'
                                        />
                                      </Box>
                                    }
                                  >
                                    <Switch>
                                      {isMapSubdomain && (
                                        <Route exact path='/'>
                                          <Redirect to='/mapadearton' />
                                        </Route>
                                      )}
                                      <Route path='/mapadearton'>
                                        <MapaDeArtonPage />
                                      </Route>
                                      <Route path='/changelog'>
                                        <Changelog />
                                      </Route>
                                      <Route path='/termos-de-uso'>
                                        <TermsOfUse />
                                      </Route>
                                      <Route path='/recompensas'>
                                        <Rewards />
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
                                        <Database />
                                      </Route>
                                      <Route path='/caverna-do-saber'>
                                        <CavernaDoSaber />
                                      </Route>
                                      <Route path='/meus-personagens'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <MyCharactersPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/ficha/:id'>
                                        <SheetViewPage />
                                      </Route>
                                      <Route path='/owlbear/ficha/:id'>
                                        <OwlbearSheetEmbedPage />
                                      </Route>
                                      <Route path='/builds'>
                                        <BuildsListPage />
                                      </Route>
                                      <Route path='/my-builds'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <MyBuildsPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/build/:id'>
                                        <PremiumBuildViewPage />
                                      </Route>
                                      <Route path='/homebrews'>
                                        <HomebrewsListPage />
                                      </Route>
                                      <Route path='/meus-homebrews/criar/raca'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <RaceHomebrewEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/classe'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <ClassHomebrewEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/origem'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <OriginHomebrewEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/divindade'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <DeityHomebrewEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/magias'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <SpellPackEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/poderes'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <PowerPackEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/classe-variante'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <VariantClassEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/itens'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <ItemPackEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/criar/colecao'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <CollectionEditorPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews/editar/:id'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <HomebrewEditEntryPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/meus-homebrews'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <MyHomebrewsPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/homebrew/:id/testar'>
                                        <HomebrewTestSheetPage />
                                      </Route>
                                      <Route path='/homebrew/:id'>
                                        <HomebrewViewPage />
                                      </Route>
                                      <Route path='/bestiario/:id'>
                                        {bestiaryEnabled ? (
                                          <PremiumBestiaryViewPage />
                                        ) : (
                                          <Redirect to='/' />
                                        )}
                                      </Route>
                                      <Route path='/meu-bestiario'>
                                        {bestiaryEnabled ? (
                                          <ProtectedRoute
                                            requireAuth
                                            redirectTo='/'
                                          >
                                            <MyBestiaryPage />
                                          </ProtectedRoute>
                                        ) : (
                                          <Redirect to='/' />
                                        )}
                                      </Route>
                                      <Route path='/bestiario'>
                                        {bestiaryEnabled ? (
                                          <BestiaryListPage />
                                        ) : (
                                          <Redirect to='/' />
                                        )}
                                      </Route>
                                      {/* Game Tables - Auth required, premium check done by backend */}
                                      <Route path='/mesas'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <GameTablesPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/mesa/entrar/:code'>
                                        <JoinTableByLinkPage />
                                      </Route>
                                      <Route path='/mesa/:tableId'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <GameTableDetailPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/sessao/:tableId'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <GameSessionPage />
                                        </ProtectedRoute>
                                      </Route>
                                      {/* Tela do Jogador — segunda tela pública
                                          que o mestre abre num monitor/projetor
                                          virado para a mesa. */}
                                      <Route path='/tela/:tableId'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <PlayerScreenPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/sheets'>
                                        <SheetList />
                                      </Route>
                                      <Route path='/sheet-builder/:id'>
                                        <SheetBuilderPage />
                                      </Route>
                                      <Route path='/gerador-ameacas'>
                                        <ThreatGeneratorScreen
                                          isDarkMode={darkMode}
                                        />
                                      </Route>
                                      <Route path='/threat-generator'>
                                        <ThreatGeneratorScreen
                                          isDarkMode={darkMode}
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
                                      {/* Blog routes */}
                                      <Route path='/blog/novo'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/blog'
                                        >
                                          <BlogEditor />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/blog/:id/edit'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/blog'
                                        >
                                          <BlogEditor />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/blog/:slug'>
                                        <BlogPostPage />
                                      </Route>
                                      <Route path='/blog'>
                                        <BlogList />
                                      </Route>
                                      {/* Forum routes */}
                                      <Route path='/forum/novo'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/forum'
                                        >
                                          <CreateThreadPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/forum/:slug/editar'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/forum'
                                        >
                                          <EditThreadPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/forum/:slug'>
                                        <ThreadPage />
                                      </Route>
                                      <Route path='/forum'>
                                        <ForumPage />
                                      </Route>
                                      {/* Admin page - hidden, no links, only accessible by admin email */}
                                      <Route path='/admin'>
                                        <ProtectedRoute
                                          requireAuth
                                          redirectTo='/'
                                        >
                                          <AdminPage />
                                        </ProtectedRoute>
                                      </Route>
                                      <Route path='/wyrt'>
                                        <WyrtScreen />
                                      </Route>
                                      <Route path='/instalar'>
                                        <InstallPage />
                                      </Route>
                                      {/* <Route path='/ficha-criatura'>
                  <CreatureSheet isDarkMode={darkMode} />
                </Route> */}
                                      <Route>
                                        <LandingPageV2 />
                                      </Route>
                                    </Switch>
                                  </Suspense>
                                </Box>
                              </div>
                              {!hideChrome && <JamboFooter />}
                            </div>
                          </AuthLoadingWrapper>
                        </DiceRollProvider>
                      </Dice3DProvider>
                    </HomebrewProvider>
                  </ForumProvider>
                </PartnersProvider>
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
    <SEOProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemedApp />
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </SEOProvider>
  );
}

export default App;
