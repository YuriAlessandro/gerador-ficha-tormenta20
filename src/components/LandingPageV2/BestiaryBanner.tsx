import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Rating,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StarIcon from '@mui/icons-material/Star';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { BestiaryService, type BestiaryPublicationData } from '../../premium';
import { getCategoryMeta } from '../../premium/data/bestiaryCategoryMeta';

interface BestiaryBannerProps {
  onClickButton: (link: string) => void;
}

const BestiaryBanner: React.FC<BestiaryBannerProps> = ({ onClickButton }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [topToday, setTopToday] = useState<BestiaryPublicationData[]>([]);

  useEffect(() => {
    if (!isDesktop) return undefined;
    let active = true;
    BestiaryService.getPublicBestiary(
      { ratingWindow: '24h', sortBy: 'rating', sortOrder: 'desc' },
      1,
      3
    )
      .then((res) => {
        if (active) setTopToday(res.data);
      })
      .catch(() => {
        if (active) setTopToday([]);
      });
    return () => {
      active = false;
    };
  }, [isDesktop]);

  const showTray = isDesktop && topToday.length > 0;

  return (
    <Box>
      <Box
        className={`bestiary-banner${
          showTray ? ' bestiary-banner--attached' : ''
        }`}
      >
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
                Ameaças criadas e avaliadas por outros mestres, prontas para
                suas mesas
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

      {showTray && (
        <Box className='bestiary-highlight-tray'>
          {topToday.map((pub) => {
            const meta = getCategoryMeta(pub.category);
            const CatIcon = meta.icon;
            return (
              <Box
                key={pub.id}
                className='bestiary-highlight-card'
                onClick={() => onClickButton(`/bestiario/${pub.id}`)}
                sx={{ borderLeft: `4px solid ${meta.color}` }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mb: 0.5,
                  }}
                >
                  <CatIcon sx={{ fontSize: 16, color: meta.color }} />
                  <Typography
                    variant='caption'
                    sx={{ color: meta.color, fontWeight: 700 }}
                  >
                    {pub.category}
                  </Typography>
                </Box>
                <Typography
                  variant='subtitle2'
                  noWrap
                  sx={{ fontWeight: 700, mb: 0.5 }}
                  title={pub.name}
                >
                  {pub.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating
                    value={pub.ratings?.average || 0}
                    precision={0.1}
                    size='small'
                    readOnly
                    emptyIcon={
                      <StarIcon style={{ opacity: 0.3 }} fontSize='inherit' />
                    }
                  />
                  <Typography variant='caption' color='text.secondary'>
                    ({pub.ratings?.count || 0})
                  </Typography>
                  <ChatBubbleOutlineIcon
                    sx={{
                      fontSize: 14,
                      color: 'text.secondary',
                      ml: 0.5,
                    }}
                  />
                  <Typography variant='caption' color='text.secondary'>
                    {pub.commentCount || 0}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default BestiaryBanner;
