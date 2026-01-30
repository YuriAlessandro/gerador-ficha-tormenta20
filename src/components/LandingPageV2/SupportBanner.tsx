import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface SupportBannerProps {
  onClickButton: (link: string) => void;
}

const SupportBanner: React.FC<SupportBannerProps> = ({ onClickButton }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box className='support-banner'>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems='center'
        justifyContent='center'
        spacing={{ xs: 2, sm: 3 }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontFamily: 'Tfont, serif',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Apoie o Fichas de Nimb
          </Typography>
          <Typography
            variant='body2'
            sx={{
              opacity: 0.9,
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
            }}
          >
            Ajude a manter o projeto vivo e desbloqueie recursos exclusivos
          </Typography>
        </Box>
        <Button
          variant='contained'
          size={isMobile ? 'medium' : 'large'}
          startIcon={<FavoriteIcon />}
          onClick={() => onClickButton('/apoiar')}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: theme.palette.primary.main,
            fontWeight: 600,
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: '#ffffff',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Apoiar
        </Button>
      </Stack>
    </Box>
  );
};

export default SupportBanner;
