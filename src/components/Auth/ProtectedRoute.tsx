import React from 'react';
import { Redirect } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = need to be logged in, false = need to be logged out
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/',
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while auth is being determined
  if (loading) {
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

  // User meets the requirements, render children
  return <>{children}</>;
};

export default ProtectedRoute;
