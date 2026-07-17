import React from 'react';
import { Box, Typography, Button, Stack, Chip, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { GameTable } from '../../premium/services/gameTable.service';

interface ActiveSessionBannerProps {
  onClickButton: (link: string) => void;
  table: GameTable;
}

const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  onClickButton,
  table,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      className='session-card active'
      sx={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.22) 100%)'
          : 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.18) 100%)',
        color: isDark ? '#ffffff' : 'inherit',
        border: '2px solid rgba(76, 175, 80, 0.45)',
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction='row'
            spacing={1}
            sx={{
              alignItems: 'center',
              mb: 1,
              flexWrap: 'wrap',
              rowGap: 0.5,
            }}
          >
            <Chip label='Sessão Ativa' color='success' size='small' />
            <Stack
              direction='row'
              spacing={0.5}
              sx={{
                alignItems: 'center',
              }}
            >
              <PeopleAltIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                {table.members.length}{' '}
                {table.members.length === 1 ? 'jogador' : 'jogadores'}
              </Typography>
            </Stack>
          </Stack>
          <Typography
            variant='h5'
            sx={{
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {table.name}
          </Typography>
          {table.description && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {table.description}
            </Typography>
          )}
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ flexShrink: 0 }}
        >
          <Button
            variant='contained'
            color='success'
            size='large'
            startIcon={<PlayArrowIcon />}
            onClick={() => onClickButton(`/sessao/${table.id}`)}
            sx={{
              whiteSpace: 'nowrap',
              fontWeight: 700,
              '&:hover': { transform: 'scale(1.05)' },
              transition: 'transform 0.2s ease',
            }}
          >
            Entrar na sessão
          </Button>
          <Button
            variant='outlined'
            onClick={() => onClickButton(`/mesa/${table.id}`)}
          >
            Gerenciar mesa
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ActiveSessionBanner;
