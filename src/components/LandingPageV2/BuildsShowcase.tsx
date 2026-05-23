import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Skeleton,
  Chip,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ConstructionIcon from '@mui/icons-material/Construction';
import StarIcon from '@mui/icons-material/Star';
import { BuildData } from '../../premium/services/builds.service';
import { getSupporterGlowColor } from '../../types/subscription.types';

interface BuildsShowcaseProps {
  onClickButton: (link: string) => void;
  builds: BuildData[];
  loading: boolean;
}

const BuildsShowcase: React.FC<BuildsShowcaseProps> = ({
  onClickButton,
  builds,
  loading,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const renderHeader = () => (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      sx={{ mb: 2 }}
    >
      <Typography variant='h5' className='section-title' sx={{ mb: 0 }}>
        Builds em destaque
      </Typography>
      <Button
        size='small'
        endIcon={<ArrowForwardIcon />}
        onClick={() => onClickButton('/builds')}
        sx={{ textTransform: 'none' }}
      >
        Explorar builds
      </Button>
    </Stack>
  );

  if (loading) {
    return (
      <Box>
        {renderHeader()}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant='rectangular'
              height={160}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (builds.length === 0) {
    return null;
  }

  return (
    <Box>
      {renderHeader()}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {builds.slice(0, 4).map((build, index) => {
          const shadowColor = getSupporterGlowColor(build.ownerSupportLevel);
          return (
            <Box
              key={build.id}
              onClick={() => onClickButton(`/build/${build.id}`)}
              sx={{
                animation: `scaleIn 0.4s ease-out ${0.1 * (index + 1)}s both`,
                background: isDark
                  ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: isDark ? '#ffffff' : 'inherit',
                borderRadius: 2,
                p: 2,
                cursor: 'pointer',
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }`,
                borderTop: '4px solid #7c4dff',
                borderBottom: shadowColor ? `3px solid ${shadowColor}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 160,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: theme.palette.primary.main,
                  borderTopColor: '#7c4dff',
                  boxShadow: `0 8px 20px ${
                    isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'
                  }`,
                },
              }}
            >
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='flex-start'
                spacing={1}
                sx={{ mb: 1 }}
              >
                <ConstructionIcon
                  sx={{ fontSize: 20, color: '#7c4dff', flexShrink: 0 }}
                />
                {build.ratings && build.ratings.count > 0 && (
                  <Stack direction='row' alignItems='center' spacing={0.3}>
                    <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {build.ratings.average.toFixed(1)}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              <Typography
                variant='subtitle2'
                sx={{
                  fontFamily: 'Tfont, serif',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.6em',
                }}
              >
                {build.name}
              </Typography>

              <Stack
                direction='row'
                spacing={0.5}
                flexWrap='wrap'
                gap={0.5}
                sx={{ mb: 1 }}
              >
                <Chip
                  label={build.isMulticlass ? 'Multiclasse' : build.classe}
                  size='small'
                  color='primary'
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
                {build.raca && (
                  <Chip
                    label={build.raca}
                    size='small'
                    variant='outlined'
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                )}
              </Stack>

              {build.description && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{
                    fontSize: '0.7rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mt: 'auto',
                  }}
                >
                  {build.description}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default BuildsShowcase;
