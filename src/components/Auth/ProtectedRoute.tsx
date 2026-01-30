import React from 'react';
import { Redirect } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = need to be logged in, false = need to be logged out
  requirePremium?: boolean; // true = need to have premium subscription (NIVEL_2+)
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requirePremium = false,
  redirectTo = '/',
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { canAccessGameTables, loading: subscriptionLoading } =
    useSubscription();

  // Show loading while auth or subscription is being determined
  if (loading || (requirePremium && subscriptionLoading)) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='50vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect based on auth requirements
  if (requireAuth && !isAuthenticated) {
    // User needs to be authenticated but isn't
    return <Redirect to={redirectTo} />;
  }

  if (!requireAuth && isAuthenticated) {
    // User needs to be unauthenticated but is authenticated
    return <Redirect to={redirectTo} />;
  }

  // Check premium requirement (requires NIVEL_2 or higher for game tables)
  if (requirePremium && !canAccessGameTables) {
    // User needs to be NIVEL_2+ to access this feature
    return <Redirect to={redirectTo} />;
  }

  // User meets the requirements, render children
  return <>{children}</>;
};

export default ProtectedRoute;
