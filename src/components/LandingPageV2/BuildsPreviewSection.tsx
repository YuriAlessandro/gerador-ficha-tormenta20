import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
  Skeleton,
  Chip,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import BuildsService, {
  BuildData,
} from '../../premium/services/builds.service';

interface BuildsPreviewSectionProps {
  onClickButton: (link: string) => void;
}

const BuildsPreviewSection: React.FC<BuildsPreviewSectionProps> = ({
  onClickButton,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [builds, setBuilds] = useState<BuildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        setLoading(true);
        // Fetch 5 most recent public builds from all users
        const response = await BuildsService.getAllPublicBuilds(
          { sortBy: 'createdAt', sortOrder: 'desc' },
          1,
          5
        );
        setBuilds(response.data);
        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant='h5' className='section-title'>
          Builds da Comunidade
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton
                variant='rectangular'
                height={120}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || builds.length === 0) {
    return null;
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={2}
        spacing={1}
      >
        <Typography variant='h5' className='section-title' sx={{ mb: 0 }}>
          Builds da Comunidade
        </Typography>
        <Button
          variant='outlined'
          size='small'
          endIcon={<ArrowForwardIcon />}
          onClick={() => onClickButton('/builds')}
        >
          Explorar Builds
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {builds.map((build, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={build.id}>
            <Box
              className='build-card'
              onClick={() => onClickButton(`/build/${build.id}`)}
              sx={{
                animation: `scaleIn 0.4s ease-out ${0.1 * (index + 1)}s both`,
                background: isDark
                  ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: isDark ? '#ffffff' : 'inherit',
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='flex-start'
                >
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontFamily: 'Tfont, serif',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '70%',
                    }}
                  >
                    {build.name}
                  </Typography>
                  {build.ratings && build.ratings.count > 0 && (
                    <Stack direction='row' alignItems='center' spacing={0.5}>
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant='caption' color='text.secondary'>
                        {build.ratings.average.toFixed(1)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                <Stack direction='row' spacing={1} flexWrap='wrap' gap={0.5}>
                  <Chip
                    label={build.classe}
                    size='small'
                    color='primary'
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                  {build.raca && (
                    <Chip
                      label={build.raca}
                      size='small'
                      variant='outlined'
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  )}
                </Stack>
                {build.description && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {build.description}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BuildsPreviewSection;
