import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DiamondIcon from '@mui/icons-material/Diamond';
import {
  SupportLevel,
  SUPPORT_LEVEL_CONFIG,
  getSupportLevelName,
} from '../../types/subscription.types';

interface SupporterBadgeProps {
  level: SupportLevel;
  variant?: 'default' | 'small' | 'icon-only';
  showIcon?: boolean;
  size?: 'small' | 'medium';
  className?: string;
  showTooltip?: boolean;
}

/**
 * Supporter badge component to display support level
 * - Nível 1: Silver badge with heart icon
 * - Nível 2: Gold badge with star icon
 * - Nível 3: Diamond badge with diamond icon
 * - FREE: Returns null (no badge)
 */
const SupporterBadge: React.FC<SupporterBadgeProps> = ({
  level,
  variant = 'default',
  showIcon = true,
  size,
  className,
  showTooltip = true,
}) => {
  // Don't render badge for free users
  if (level === SupportLevel.FREE) {
    return null;
  }

  const config = SUPPORT_LEVEL_CONFIG[level];
  const isLevel2 =
    level === SupportLevel.NIVEL_2 || level === SupportLevel.NIVEL_2_ANUAL;
  const isLevel3 =
    level === SupportLevel.NIVEL_3 || level === SupportLevel.NIVEL_3_ANUAL;
  const isHighLevel = isLevel2 || isLevel3;
  const levelName = getSupportLevelName(level);

  // Level 3 gets diamond, Level 2 gets gold star, Level 1 gets silver heart
  const getIcon = () => {
    if (isLevel3) {
      return <DiamondIcon sx={{ fontSize: variant === 'small' ? 14 : 16 }} />;
    }
    if (isLevel2) {
      return <StarIcon sx={{ fontSize: variant === 'small' ? 14 : 16 }} />;
    }
    return <FavoriteIcon sx={{ fontSize: variant === 'small' ? 14 : 16 }} />;
  };
  const icon = getIcon();

  const label = 'Apoiador';

  // Styles based on variant and level
  const gradient = config.badgeGradient;
  const borderColor = config.badgeColor;

  // Text color based on level (dark text for light backgrounds)
  const textColor = isHighLevel ? '#000' : '#333';

  const renderBadge = () => {
    if (variant === 'icon-only') {
      const getIconComponent = () => {
        if (isLevel3) return DiamondIcon;
        if (isLevel2) return StarIcon;
        return FavoriteIcon;
      };
      const IconComponent = getIconComponent();
      return (
        <IconComponent
          className={className}
          sx={{
            color: config.badgeColor,
            filter: `drop-shadow(0 2px 4px ${config.badgeColor}60)`,
            fontSize: size === 'small' ? 16 : 20,
          }}
        />
      );
    }

    if (variant === 'small') {
      return (
        <Chip
          size='small'
          icon={showIcon ? icon : undefined}
          label={label}
          className={className}
          sx={{
            background: gradient,
            color: textColor,
            fontWeight: 'bold',
            fontSize: '0.7rem',
            border: `1px solid ${borderColor}`,
            boxShadow: `0 2px 6px ${borderColor}30`,
            '& .MuiChip-icon': {
              color: textColor,
            },
          }}
        />
      );
    }

    return (
      <Chip
        icon={showIcon ? icon : undefined}
        label={label}
        size={size}
        className={className}
        sx={{
          background: gradient,
          color: textColor,
          fontWeight: 'bold',
          fontSize: '0.875rem',
          border: `2px solid ${borderColor}`,
          boxShadow: `0 4px 12px ${borderColor}40`,
          animation: isHighLevel ? 'pulse 2s ease-in-out infinite' : 'none',
          '& .MuiChip-icon': {
            color: textColor,
          },
          '@keyframes pulse': {
            '0%, 100%': {
              boxShadow: `0 4px 12px ${borderColor}40`,
            },
            '50%': {
              boxShadow: `0 4px 20px ${borderColor}60`,
            },
          },
        }}
      />
    );
  };

  if (showTooltip) {
    return <Tooltip title={levelName}>{renderBadge()}</Tooltip>;
  }

  return renderBadge();
};

export default SupporterBadge;
