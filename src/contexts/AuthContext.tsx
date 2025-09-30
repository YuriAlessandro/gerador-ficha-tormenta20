import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setFirebaseUser, syncUser, clearAuth } from '../store/slices/auth/authSlice';
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
          console.error('Failed to sync user with backend:', error);
        }
      } else {
        // User is signed out
        dispatch(clearAuth());
      }
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