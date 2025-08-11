import React from 'react';
import { Typography, TypographyProps, SxProps, Theme } from '@mui/material';

interface TormentaTitleProps extends Omit<TypographyProps, 'children'> {
  children: React.ReactNode;
  gradient?: boolean;
  glow?: boolean;
  centered?: boolean;
}

const TormentaTitle: React.FC<TormentaTitleProps> = ({
  children,
  gradient = false,
  glow = false,
  centered = false,
  sx,
  variant = 'h4',
  ..._props
}) => {
  const baseStyles = {
    fontFamily: 'Tfont, serif',
    color: '#d13235',
    fontWeight: 600,
    textAlign: centered ? 'center' : 'inherit',
    textShadow: glow
      ? '2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(209, 50, 53, 0.3)'
      : '2px 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '1rem',
    letterSpacing: '0.5px',
  };

  const gradientStyles = gradient
    ? {
        background:
          'linear-gradient(135deg, #d13235 0%, #922325 70%, #7a1d1f 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : {};

  const combinedStyles = {
    ...baseStyles,
    ...gradientStyles,
    ...(sx || {}),
  } as SxProps<Theme>;

  return (
    <Typography
      sx={combinedStyles}
      className='database-title'
      variant={variant}
    >
      {children}
    </Typography>
  );
};

export default TormentaTitle;
