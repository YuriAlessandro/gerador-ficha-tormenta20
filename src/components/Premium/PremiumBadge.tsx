import React from 'react';
import { Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface PremiumBadgeProps {
  variant?: 'default' | 'small' | 'icon-only';
  showIcon?: boolean;
  size?: 'small' | 'medium';
  className?: string;
}

/**
 * Premium badge component to display premium status
 */
const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  variant = 'default',
  showIcon = true,
  size,
  className,
}) => {
  const goldenGradient = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
  const goldenBorder = '2px solid #FFD700';
  const goldenShadow = '0 4px 12px rgba(255, 215, 0, 0.4)';

  if (variant === 'icon-only') {
    return (
      <StarIcon
        className={className}
        sx={{
          color: '#FFD700',
          filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.6))',
          fontSize: size === 'small' ? 16 : 20,
        }}
      />
    );
  }

  if (variant === 'small') {
    return (
      <Chip
        size='small'
        icon={showIcon ? <StarIcon sx={{ fontSize: 14 }} /> : undefined}
        label='Premium'
        className={className}
        sx={{
          background: goldenGradient,
          color: '#000',
          fontWeight: 'bold',
          fontSize: '0.7rem',
          border: '1px solid #FFD700',
          boxShadow: '0 2px 6px rgba(255, 215, 0, 0.3)',
          '& .MuiChip-icon': {
            color: '#000',
          },
        }}
      />
    );
  }

  return (
    <Chip
      icon={showIcon ? <StarIcon /> : undefined}
      label='Premium'
      size={size}
      className={className}
      sx={{
        background: goldenGradient,
        color: '#000',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        border: goldenBorder,
        boxShadow: goldenShadow,
        animation: 'pulse 2s ease-in-out infinite',
        '& .MuiChip-icon': {
          color: '#000',
        },
        '@keyframes pulse': {
          '0%, 100%': {
            boxShadow: goldenShadow,
          },
          '50%': {
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.6)',
          },
        },
      }}
    />
  );
};

export default PremiumBadge;
