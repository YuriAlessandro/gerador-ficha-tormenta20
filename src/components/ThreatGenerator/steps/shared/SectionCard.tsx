import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
}

/**
 * Card de seção reutilizável do gerador de ameaças: cabeçalho com ícone
 * destacado + título (+ subtítulo opcional) e uma área de conteúdo. Unifica o
 * padrão visual de todas as etapas do wizard.
 */
const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  subtitle,
  action,
  children,
  sx,
}) => {
  const theme = useTheme();

  return (
    <Paper
      variant='outlined'
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.light,
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? `${theme.palette.primary.main}14`
              : `${theme.palette.primary.main}0A`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.5,
            color: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}1F`,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
    </Paper>
  );
};

export default SectionCard;
