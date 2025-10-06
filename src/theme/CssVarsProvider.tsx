import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

/**
 * Component that injects MUI theme colors as CSS variables
 * This allows CSS files to use theme colors via var(--primary-main), etc.
 */
export const CssVarsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();

  useEffect(() => {
    // Inject CSS variables into :root
    const root = document.documentElement;

    // Primary colors
    root.style.setProperty('--primary-main', theme.palette.primary.main);
    root.style.setProperty('--primary-dark', theme.palette.primary.dark);
    root.style.setProperty('--primary-light', theme.palette.primary.light);
    root.style.setProperty(
      '--primary-contrast',
      theme.palette.primary.contrastText
    );

    // Secondary colors
    root.style.setProperty('--secondary-main', theme.palette.secondary.main);
    root.style.setProperty('--secondary-dark', theme.palette.secondary.dark);
    root.style.setProperty('--secondary-light', theme.palette.secondary.light);

    // Background colors
    root.style.setProperty(
      '--background-default',
      theme.palette.background.default
    );
    root.style.setProperty(
      '--background-paper',
      theme.palette.background.paper
    );

    // Text colors
    root.style.setProperty('--text-primary', theme.palette.text.primary);
    root.style.setProperty('--text-secondary', theme.palette.text.secondary);

    // Grey scale
    root.style.setProperty('--grey-50', theme.palette.grey[50]);
    root.style.setProperty('--grey-100', theme.palette.grey[100]);
    root.style.setProperty('--grey-200', theme.palette.grey[200]);
    root.style.setProperty('--grey-300', theme.palette.grey[300]);
    root.style.setProperty('--grey-400', theme.palette.grey[400]);
    root.style.setProperty('--grey-500', theme.palette.grey[500]);
    root.style.setProperty('--grey-600', theme.palette.grey[600]);
    root.style.setProperty('--grey-700', theme.palette.grey[700]);
    root.style.setProperty('--grey-800', theme.palette.grey[800]);
    root.style.setProperty('--grey-900', theme.palette.grey[900]);

    // Mode-aware colors for easy transitions
    root.style.setProperty(
      '--mode-aware-text',
      theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)'
    );
    root.style.setProperty(
      '--mode-aware-bg',
      theme.palette.mode === 'dark' ? '#212121' : '#f3f2f1'
    );
  }, [theme]);

  return <>{children}</>;
};
