import React, { useMemo } from 'react';
import { Box, Typography, Button, Stack, Chip, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useGameTable } from '../../premium/hooks/useGameTable';
import { GameTableStatus } from '../../premium/services/gameTable.service';

interface ActiveSessionBannerProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gameTableContext = isAuthenticated ? useGameTable() : null;
  const tables = gameTableContext?.tables ?? [];

  const activeSession = useMemo(() => {
    if (!isAuthenticated || !tables.length) return null;
    return tables.find(
      (t) =>
        t.status === GameTableStatus.ACTIVE ||
        t.status === GameTableStatus.PAUSED
    );
  }, [tables, isAuthenticated]);

  if (!isAuthenticated || !activeSession) {
    return null;
  }

  return (
    <Box
      className='session-card active'
      sx={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(76, 175, 80, 0.18) 100%)'
          : 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.14) 100%)',
        color: isDark ? '#ffffff' : 'inherit',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
        spacing={2}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction='row' alignItems='center' spacing={1} mb={1}>
            <Chip
              label={
                activeSession.status === GameTableStatus.ACTIVE
                  ? 'Sessão Ativa'
                  : 'Sessão Pausada'
              }
              color={
                activeSession.status === GameTableStatus.ACTIVE
                  ? 'success'
                  : 'warning'
              }
              size='small'
            />
          </Stack>
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'Tfont, serif',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {activeSession.name}
          </Typography>
          {activeSession.description && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {activeSession.description}
            </Typography>
          )}
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant='contained'
            color='success'
            startIcon={<PlayArrowIcon />}
            onClick={() => onClickButton(`/sessao/${activeSession.id}`)}
            sx={{
              whiteSpace: 'nowrap',
              '&:hover': { transform: 'scale(1.05)' },
              transition: 'transform 0.2s ease',
            }}
          >
            Continuar sessão
          </Button>
          <Button variant='outlined' onClick={() => onClickButton('/mesas')}>
            Ver todas
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ActiveSessionBanner;
