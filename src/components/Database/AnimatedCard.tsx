import React from 'react';
import { Box, useMediaQuery } from '@mui/material';

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

  const cardStyles = {
    position: 'relative',
    border: '2px solid #d13235',
    borderRadius: '12px',
    padding: isMobile ? '0.8rem' : '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: selected
      ? 'linear-gradient(135deg, #d13235 0%, #922325 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    color: selected ? 'white' : '#d13235',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    boxShadow: selected
      ? '0 8px 25px rgba(209, 50, 53, 0.4), 0 0 20px rgba(209, 50, 53, 0.2)'
      : '0 2px 8px rgba(209, 50, 53, 0.15)',
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
      background:
        'linear-gradient(90deg, transparent, rgba(209, 50, 53, 0.1), transparent)',
      transition: 'left 0.6s ease-in-out',
    },
    '&:hover': !disabled
      ? {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: selected
            ? '0 12px 35px rgba(209, 50, 53, 0.5), 0 0 30px rgba(209, 50, 53, 0.3)'
            : '0 8px 25px rgba(209, 50, 53, 0.3)',
          borderColor: '#922325',
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
