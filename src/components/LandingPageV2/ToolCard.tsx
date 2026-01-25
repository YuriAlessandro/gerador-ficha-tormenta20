import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isExternal?: boolean;
  delay?: number;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon,
  onClick,
  isPrimary = false,
  isSecondary = false,
  isExternal = false,
  delay = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getCardClass = () => {
    if (isPrimary) return 'tool-card primary';
    if (isSecondary) return 'tool-card secondary';
    return 'tool-card';
  };

  const getBackgroundStyle = () => {
    if (isPrimary) {
      return `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
    }
    if (isDark) {
      return 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)';
    }
    return 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
  };

  return (
    <Box
      className={getCardClass()}
      onClick={onClick}
      sx={{
        animation: `scaleIn 0.5s ease-out ${delay}s both`,
        background: getBackgroundStyle(),
        color: isPrimary || isDark ? '#ffffff' : 'inherit',
        position: 'relative',
      }}
    >
      {isExternal && (
        <OpenInNewIcon
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontSize: '1rem',
            opacity: 0.6,
          }}
        />
      )}
      <Box className='tool-card-icon'>{icon}</Box>
      <Typography className='tool-card-title' variant='h6'>
        {title}
      </Typography>
      <Typography
        className='tool-card-description'
        variant='body2'
        sx={{
          color: isPrimary ? 'rgba(255, 255, 255, 0.85)' : 'text.secondary',
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

export default ToolCard;
