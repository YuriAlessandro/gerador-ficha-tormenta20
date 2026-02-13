import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import LoginIcon from '@mui/icons-material/Login';
import { useGameTable } from '../../premium/hooks/useGameTable';
import { GameTableStatus } from '../../premium/services/gameTable.service';
import { useAuthContext } from '../../contexts/AuthContext';

interface GameSessionsSectionProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

const GameSessionsSection: React.FC<GameSessionsSectionProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { openLoginModal } = useAuthContext();

  const gameTableContext = isAuthenticated ? useGameTable() : null;
  const tables = gameTableContext?.tables ?? [];
  const loading = gameTableContext?.loading ?? false;

  const activeSession = useMemo(() => {
    if (!isAuthenticated || !tables.length) return null;
    return tables.find(
      (t) =>
        t.status === GameTableStatus.ACTIVE ||
        t.status === GameTableStatus.PAUSED
    );
  }, [tables, isAuthenticated]);

  const lastTable = useMemo(() => {
    if (!isAuthenticated || !tables.length) return null;
    return tables[0];
  }, [tables, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Box>
        <Typography variant='h5' className='section-title'>
          Sessões Virtuais
        </Typography>
        <Box
          className='session-card'
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            color: isDark ? '#ffffff' : 'inherit',
            marginTop: 2,
          }}
        >
          <Stack spacing={2} alignItems='center' textAlign='center' py={2}>
            <TableRestaurantIcon
              sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }}
            />
            <Box>
              <Typography
                variant='h6'
                sx={{ fontFamily: 'Tfont, serif', mb: 1 }}
              >
                Jogue Tormenta 20 Online
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ maxWidth: 400, mx: 'auto' }}
              >
                Crie mesas virtuais, convide jogadores, gerencie encontros e
                role dados em tempo real com seus amigos.
              </Typography>
            </Box>
            <Button
              variant='outlined'
              startIcon={<LoginIcon />}
              onClick={openLoginModal}
              sx={{ mt: 1 }}
            >
              Faça login para acessar
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Typography variant='h5' className='section-title'>
          Sessões Virtuais
        </Typography>
        <Skeleton variant='rectangular' height={150} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (activeSession) {
    return (
      <Box>
        <Typography variant='h5' className='section-title'>
          Sessões Virtuais
        </Typography>
        <Box
          className='session-card active'
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%)',
            color: isDark ? '#ffffff' : 'inherit',
            marginTop: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent='space-between'
            spacing={2}
          >
            <Box>
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
                sx={{ fontFamily: 'Tfont, serif', mb: 0.5 }}
              >
                {activeSession.name}
              </Typography>
              {activeSession.description && (
                <Typography variant='body2' color='text.secondary'>
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
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  transition: 'transform 0.2s ease',
                }}
              >
                Continuar Sessão
              </Button>
              <Button
                variant='outlined'
                onClick={() => onClickButton('/mesas')}
              >
                Ver Todas
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='h5' className='section-title'>
        Sessões Virtuais
      </Typography>
      <Box
        className='session-card'
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          color: isDark ? '#ffffff' : 'inherit',
          marginTop: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent='space-between'
          spacing={2}
        >
          <Box>
            <Typography
              variant='h6'
              sx={{ fontFamily: 'Tfont, serif', mb: 0.5 }}
            >
              Mesas Virtuais
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {lastTable
                ? `Última mesa: ${lastTable.name}`
                : 'Crie uma mesa e convide seus jogadores para jogar online'}
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<TableRestaurantIcon />}
            onClick={() => onClickButton('/mesas')}
          >
            Ver Minhas Mesas
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default GameSessionsSection;
