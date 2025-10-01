import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.dbUser,
    firebaseUser: auth.firebaseUser,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    isPremium: auth.dbUser?.isPremium || false,
  };
};
