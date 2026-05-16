import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

interface BestiaryBannerProps {
  onClickButton: (link: string) => void;
}

const BestiaryBanner: React.FC<BestiaryBannerProps> = ({ onClickButton }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box className='bestiary-banner'>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems='center'
        justifyContent='space-between'
        spacing={{ xs: 2, sm: 3 }}
      >
        <Stack
          direction='row'
          alignItems='center'
          spacing={2}
          sx={{ textAlign: { xs: 'center', sm: 'left' } }}
        >
          <AutoStoriesIcon
            sx={{
              fontSize: { xs: 32, sm: 40 },
              opacity: 0.9,
              display: { xs: 'none', sm: 'block' },
            }}
          />
          <Box>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{
                fontFamily: 'Tfont, serif',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Bestiário da Comunidade
            </Typography>
            <Typography
              variant='body2'
              sx={{
                opacity: 0.9,
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
              }}
            >
              Ameaças criadas e avaliadas por outros mestres, prontas para suas
              mesas
            </Typography>
          </Box>
        </Stack>
        <Button
          variant='contained'
          size={isMobile ? 'medium' : 'large'}
          startIcon={<AutoStoriesIcon />}
          onClick={() => onClickButton('/bestiario')}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#4a1d2f',
            fontWeight: 600,
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: '#ffffff',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Explorar Bestiário
        </Button>
      </Stack>
    </Box>
  );
};

export default BestiaryBanner;
