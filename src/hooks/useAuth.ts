import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DbUser } from '../types/auth.types';

// Helper to get user ID from DbUser (handles MongoDB _id field)
const getUserId = (dbUser: DbUser | null): string => {
  if (!dbUser) return '';
  // Access _id through object destructuring to avoid ESLint no-underscore-dangle
  const idKey = '_id' as keyof DbUser;
  return (dbUser[idKey] as string) || '';
};

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.dbUser,
    userId: getUserId(auth.dbUser),
    firebaseUser: auth.firebaseUser,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    isPremium: auth.dbUser?.isPremium || false,
  };
};
