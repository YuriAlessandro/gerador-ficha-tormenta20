import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface AnimatedCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactElement;
  disabled?: boolean;
  index?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  selected,
  onClick,
  title,
  icon,
  disabled = false,
  index = 0,
}) => {
  const isMobile = useMediaQuery('(max-width: 720px)');
  const theme = useTheme();

  const cardStyles = {
    position: 'relative',
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '12px',
    padding: isMobile ? '0.8rem' : '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: selected
      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
    color: selected
      ? theme.palette.primary.contrastText
      : theme.palette.primary.main,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    boxShadow: selected ? theme.shadows[4] : theme.shadows[1],
    fontFamily: 'Tfont, serif',
    fontWeight: 500,
    width: isMobile ? 'calc(33% - 8px)' : '150px',
    minWidth: isMobile ? '100px' : '150px',
    height: isMobile ? '80px' : 'auto',
    minHeight: isMobile ? '80px' : '120px',
    opacity: disabled ? 0.6 : 1,
    animation: `scaleIn 0.5s ease-out ${0.1 * (index + 1)}s both`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}1A, transparent)`,
      transition: 'left 0.6s ease-in-out',
    },
    '&:hover': !disabled
      ? {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: selected ? theme.shadows[5] : theme.shadows[4],
          borderColor: theme.palette.primary.dark,
          '&::before': {
            left: '100%',
          },
        }
      : {},
  };

  const iconStyles = {
    fontSize: isMobile ? '1.8rem' : '2.5rem',
    marginBottom: isMobile ? '0.4rem' : '0.8rem',
    transition: 'transform 0.3s ease',
    '&:hover': !disabled
      ? {
          transform: 'scale(1.1) rotate(5deg)',
        }
      : {},
  };

  const titleStyles = {
    fontSize: isMobile ? '0.9rem' : '1.1rem',
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    fontFamily: 'Tfont, serif',
  };

  return (
    <Box
      className='animated-card'
      sx={cardStyles}
      onClick={disabled ? undefined : onClick}
    >
      <Box className='card-icon' sx={iconStyles}>
        {React.cloneElement(icon, {
          fontSize: isMobile ? 'medium' : 'large',
        })}
      </Box>
      <Box className='card-title' sx={titleStyles}>
        {title}
      </Box>
    </Box>
  );
};

export default AnimatedCard;
