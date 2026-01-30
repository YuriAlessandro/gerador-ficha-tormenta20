import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  setFirebaseUser,
  syncUser,
  clearAuth,
  setLoading,
} from '../store/slices/auth/authSlice';
import { AppDispatch } from '../store';
import AuthModal from '../components/Auth/AuthModal';

interface AuthContextType {
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  loginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <AuthModal open={loginModalOpen} onClose={closeLoginModal} />
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
