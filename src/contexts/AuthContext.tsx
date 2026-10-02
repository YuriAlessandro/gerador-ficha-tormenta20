import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { auth } from '../config/firebase';
import {
  setFirebaseUser,
  syncUser,
  clearAuth,
  setLoading,
  logout,
} from '../store/slices/auth/authSlice';
import {
  fetchSubscription,
  clearSubscription,
} from '../store/slices/subscription/subscriptionSlice';
import { AppDispatch } from '../store';
import AuthModal from '../components/Auth/AuthModal';
import {
  createLogoutCheckRegistry,
  LogoutCheck,
  SHEET_LOGOUT_CHECK_ID,
  SHEET_UNSAVED_MESSAGE,
} from './logoutChecks';

interface AuthContextType {
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  requestLogout: () => void;
  registerUnsavedChangesChecker: (checker: () => boolean) => void;
  unregisterUnsavedChangesChecker: () => void;
  registerLogoutCheck: (id: string, check: LogoutCheck) => void;
  unregisterLogoutCheck: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  loginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  requestLogout: () => {},
  registerUnsavedChangesChecker: () => {},
  unregisterUnsavedChangesChecker: () => {},
  registerLogoutCheck: () => {},
  unregisterLogoutCheck: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const logoutChecksRef = useRef(createLogoutCheckRegistry());
  const [logoutMessages, setLogoutMessages] = useState<string[]>([]);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const registerLogoutCheck = useCallback((id: string, check: LogoutCheck) => {
    logoutChecksRef.current.register(id, check);
  }, []);

  const unregisterLogoutCheck = useCallback((id: string) => {
    logoutChecksRef.current.unregister(id);
  }, []);

  // Atalhos antigos, usados pela ficha e pelo gerador de ameaças.
  const registerUnsavedChangesChecker = useCallback(
    (checker: () => boolean) => {
      logoutChecksRef.current.register(SHEET_LOGOUT_CHECK_ID, {
        check: checker,
        message: SHEET_UNSAVED_MESSAGE,
      });
    },
    []
  );

  const unregisterUnsavedChangesChecker = useCallback(() => {
    logoutChecksRef.current.unregister(SHEET_LOGOUT_CHECK_ID);
  }, []);

  // Perform the actual logout
  const performLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      logoutChecksRef.current.notifyLogout();
      // Clear cached subscription so the next user (or anonymous browse)
      // does not inherit the previous user's tier from persisted state.
      dispatch(clearSubscription());
      history.push('/');
    } finally {
      setLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  }, [dispatch, history]);

  // Cancel logout - close dialog
  const cancelLogout = useCallback(() => {
    setLogoutDialogOpen(false);
  }, []);

  // Confirm logout from dialog
  const confirmLogout = useCallback(() => {
    performLogout();
  }, [performLogout]);

  // Request logout - checks for unsaved changes first
  const requestLogout = useCallback(() => {
    const messages = logoutChecksRef.current.pendingMessages();

    if (messages.length > 0) {
      setLogoutMessages(messages);
      setLogoutDialogOpen(true);
    } else {
      performLogout();
    }
  }, [performLogout]);

  useEffect(() => {
    // Modo embed do Owlbear: o iframe é particionado (sem sessão Firebase) e a
    // auth é gerenciada pela própria página embed (token injetado). Sem este
    // guard, o onAuthStateChanged dispararia com `null` e limparia a auth
    // sintética definida pela embed.
    if (
      typeof window !== 'undefined' &&
      window.parent !== window &&
      window.location.pathname.startsWith('/owlbear/')
    ) {
      dispatch(setLoading(false));
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        dispatch(setFirebaseUser(user));
        // Sync with backend
        try {
          await dispatch(syncUser()).unwrap();
          // Refetch the subscription right after auth resolves so paid features
          // (sheet limits, supporter polls) gate on fresh server state instead
          // of any stale value rehydrated from localStorage. The useSubscription
          // hook also fires this on isAuthenticated flips, but doing it here
          // guarantees it happens once per real auth event.
          dispatch(fetchSubscription());
        } catch (error) {
          // Backend sync failed - logout from Firebase to prevent inconsistent state
          // eslint-disable-next-line no-console
          console.error(
            'Backend sync failed, logging out from Firebase:',
            error
          );
          await signOut(auth);
          dispatch(clearAuth());
          dispatch(clearSubscription());
        }
      } else {
        // User is signed out
        dispatch(clearAuth());
        dispatch(clearSubscription());
      }

      // Set loading to false after Firebase auth state is determined
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  const contextValue = {
    loginModalOpen,
    openLoginModal,
    closeLoginModal,
    requestLogout,
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
    registerLogoutCheck,
    unregisterLogoutCheck,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <AuthModal open={loginModalOpen} onClose={closeLoginModal} />

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={loggingOut ? undefined : cancelLogout}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Sair da Conta</DialogTitle>
        <DialogContent>
          {logoutMessages.map((message) => (
            <DialogContentText key={message} sx={{ mb: 1 }}>
              {message}
            </DialogContentText>
          ))}
          <DialogContentText>Deseja continuar?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={cancelLogout}
            variant='outlined'
            disabled={loggingOut}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmLogout}
            variant='contained'
            color='warning'
            disabled={loggingOut}
            startIcon={
              loggingOut ? <CircularProgress size={16} color='inherit' /> : null
            }
          >
            {loggingOut ? 'Saindo...' : 'Sair Mesmo Assim'}
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
