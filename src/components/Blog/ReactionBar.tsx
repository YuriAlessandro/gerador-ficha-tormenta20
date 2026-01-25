import React from 'react';
import {
  Box,
  Button,
  Typography,
  Tooltip,
  useTheme,
  Theme,
} from '@mui/material';
import {
  EmojiType,
  EMOJI_CONFIG,
  VALID_EMOJIS,
  BlockReactions,
} from '../../types/blog.types';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';

const getBorderColor = (
  hasReacted: boolean,
  isDark: boolean,
  theme: Theme
): string => {
  if (hasReacted) return theme.palette.primary.main;
  return isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
};

const getBackgroundColor = (hasReacted: boolean, isDark: boolean): string => {
  if (!hasReacted) return 'transparent';
  return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
};

interface ReactionBarProps {
  blockId: string;
  reactions: BlockReactions;
  onReactionToggle: (blockId: string, emoji: EmojiType) => void;
  disabled?: boolean;
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  blockId,
  reactions,
  onReactionToggle,
  disabled = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useAuthContext();

  const handleClick = (emoji: EmojiType) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    onReactionToggle(blockId, emoji);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        mt: 2,
        pt: 2,
        borderTop: `1px solid ${
          isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }`,
      }}
    >
      {VALID_EMOJIS.map((emojiKey) => {
        const config = EMOJI_CONFIG[emojiKey];
        const reactionData = reactions[emojiKey];
        const count = reactionData?.count || 0;
        const hasReacted = reactionData?.hasReacted || false;

        return (
          <Tooltip key={emojiKey} title={config.label} arrow>
            <Button
              onClick={() => handleClick(emojiKey)}
              disabled={disabled}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                border: `1px solid ${getBorderColor(
                  hasReacted,
                  isDark,
                  theme
                )}`,
                backgroundColor: getBackgroundColor(hasReacted, isDark),
                '&:hover': {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(0,0,0,0.08)',
                  borderColor: theme.palette.primary.main,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Typography
                component='span'
                sx={{ fontSize: '1.1rem', mr: count > 0 ? 0.5 : 0 }}
              >
                {config.emoji}
              </Typography>
              {count > 0 && (
                <Typography
                  component='span'
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: hasReacted ? 600 : 400,
                    color: hasReacted
                      ? theme.palette.primary.main
                      : 'text.secondary',
                  }}
                >
                  {count}
                </Typography>
              )}
            </Button>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ReactionBar;
