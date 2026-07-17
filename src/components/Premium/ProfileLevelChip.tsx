import React from 'react';
import { Box, Tooltip } from '@mui/material';

interface ProfileLevelChipProps {
  level: number;
  variant?: 'default' | 'small';
  className?: string;
}

/**
 * Steam-style level ring color bands. Each band spans 10 levels and the color
 * walks the spectrum (grey → red → amber → gold → green → cyan → blue → purple
 * → bronze → slate), cycling every 100 levels. Higher levels keep evolving in
 * color, giving a sense of progression.
 */
const LEVEL_BAND_COLORS = [
  '#8f98a0', // 0-9   grey
  '#c0493c', // 10-19 red
  '#c97f2e', // 20-29 amber
  '#c9b22e', // 30-39 gold
  '#5fa23f', // 40-49 green
  '#3fa9c9', // 50-59 cyan
  '#3f6bc9', // 60-69 blue
  '#9b3fc9', // 70-79 purple
  '#8a6a4f', // 80-89 bronze
  '#6b7280', // 90-99 slate
] as const;

export function getLevelColor(level: number): string {
  const safeLevel = Math.max(0, Math.floor(level));
  const band = Math.floor(safeLevel / 10) % LEVEL_BAND_COLORS.length;
  return LEVEL_BAND_COLORS[band];
}

/**
 * Steam-like circular level badge: the level number centered inside a colored
 * ring whose color evolves with the level. The underlying XP and the formula
 * behind it are intentionally hidden — only the level number is shown.
 */
const ProfileLevelChip: React.FC<ProfileLevelChipProps> = ({
  level,
  variant = 'default',
  className,
}) => {
  const isSmall = variant === 'small';
  const ringColor = getLevelColor(level);
  const size = isSmall ? 26 : 38;
  const borderWidth = isSmall ? 2 : 3;
  const fontSize = isSmall ? '0.72rem' : '0.95rem';

  return (
    <Tooltip title='Nível de perfil — você ganha pontos por ações na comunidade'>
      <Box
        className={className}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${borderWidth}px solid ${ringColor}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: ringColor,
          fontWeight: 700,
          fontSize,
          lineHeight: 1,
          flexShrink: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          boxShadow: `0 0 6px ${ringColor}55`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.max(1, Math.floor(level))}
      </Box>
    </Tooltip>
  );
};

export default ProfileLevelChip;
