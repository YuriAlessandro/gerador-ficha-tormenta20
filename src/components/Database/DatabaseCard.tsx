import React from 'react';
import { Box, Divider, Paper, Typography, useTheme } from '@mui/material';

export interface DatabaseCardProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  highlighted?: boolean;
  accentColor?: string;
}

/**
 * Card padronizado da Enciclopédia (/database/*).
 * Segue estrutura semântica (<article>, <header>, conteúdo, <footer>) com
 * texto integral visível e `content-visibility: auto` para manter o grid leve.
 */
const DatabaseCard: React.FC<DatabaseCardProps> = ({
  title,
  icon,
  badges,
  actions,
  children,
  footer,
  highlighted = false,
  accentColor,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const borderAccent = accentColor || theme.palette.primary.main;

  return (
    <Paper
      component='article'
      variant='outlined'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        p: { xs: 1.75, sm: 2.25 },
        borderRadius: 2,
        borderColor: highlighted ? borderAccent : 'divider',
        borderLeft: `4px solid ${borderAccent}`,
        boxShadow: highlighted
          ? `0 0 0 2px ${borderAccent}40, 0 8px 24px ${borderAccent}26`
          : isDark
          ? '0 2px 10px rgba(0,0,0,0.35)'
          : '0 2px 10px rgba(0,0,0,0.05)',
        bgcolor: highlighted
          ? isDark
            ? `${borderAccent}14`
            : `${borderAccent}08`
          : 'background.paper',
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 260px',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          boxShadow: isDark
            ? `0 6px 20px rgba(0,0,0,0.5), 0 0 0 1px ${borderAccent}55`
            : `0 6px 18px rgba(0,0,0,0.09), 0 0 0 1px ${borderAccent}44`,
        },
      }}
    >
      <Box component='header' sx={{ mb: 1.5, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,
              flex: 1,
            }}
          >
            {icon && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: borderAccent,
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              component='h3'
              variant='h6'
              sx={{
                fontFamily: 'Tfont, serif',
                fontWeight: 700,
                fontSize: { xs: '1.05rem', sm: '1.12rem' },
                lineHeight: 1.25,
                color: 'primary.main',
                wordBreak: 'break-word',
                minWidth: 0,
              }}
            >
              {title}
            </Typography>
          </Box>
          {actions && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                flexShrink: 0,
              }}
            >
              {actions}
            </Box>
          )}
        </Box>

        {badges && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 0.75,
              mt: 1,
              minWidth: 0,
            }}
          >
            {badges}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>

      {footer && (
        <Box component='footer' sx={{ mt: 1.5, minWidth: 0 }}>
          <Divider sx={{ mb: 1.25 }} />
          {footer}
        </Box>
      )}
    </Paper>
  );
};

export default DatabaseCard;
