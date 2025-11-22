import React, { createContext, useContext, useEffect, ReactNode } from 'react';
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

interface AuthContextType {
  // Context is primarily for Firebase auth state listening
}

const AuthContext = createContext<AuthContextType>({});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

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

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
