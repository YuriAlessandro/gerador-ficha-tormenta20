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
import { AppDispatch } from '../store';
import AuthModal from '../components/Auth/AuthModal';

interface AuthContextType {
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  requestLogout: () => void;
  registerUnsavedChangesChecker: (checker: () => boolean) => void;
  unregisterUnsavedChangesChecker: () => void;
}

const AuthContext = createContext<AuthContextType>({
  loginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  requestLogout: () => {},
  registerUnsavedChangesChecker: () => {},
  unregisterUnsavedChangesChecker: () => {},
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
  const unsavedChangesCheckerRef = useRef<(() => boolean) | null>(null);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  // Registration functions for unsaved changes checker
  const registerUnsavedChangesChecker = useCallback(
    (checker: () => boolean) => {
      unsavedChangesCheckerRef.current = checker;
    },
    []
  );

  const unregisterUnsavedChangesChecker = useCallback(() => {
    unsavedChangesCheckerRef.current = null;
  }, []);

  // Perform the actual logout
  const performLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
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
    const hasUnsavedChanges = unsavedChangesCheckerRef.current?.() ?? false;

    if (hasUnsavedChanges) {
      setLogoutDialogOpen(true);
    } else {
      performLogout();
    }
  }, [performLogout]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        dispatch(setFirebaseUser(user));
        // Sync with backend
        try {
          await dispatch(syncUser()).unwrap();
        } catch (error) {
          // Backend sync failed - logout from Firebase to prevent inconsistent state
          // eslint-disable-next-line no-console
          console.error(
            'Backend sync failed, logging out from Firebase:',
            error
          );
          await signOut(auth);
          dispatch(clearAuth());
        }
      } else {
        // User is signed out
        dispatch(clearAuth());
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
        disableEscapeKeyDown={loggingOut}
      >
        <DialogTitle>Sair da Conta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem alterações não salvas na nuvem. Se você sair agora, elas
            ficarão salvas apenas localmente no seu navegador. Deseja continuar?
          </DialogContentText>
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
