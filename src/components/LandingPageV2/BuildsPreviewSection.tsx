import React, { useState, useEffect } from 'react';
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
        const response = await BuildsService.getAllPublicBuilds(
          { sortBy: 'createdAt', sortOrder: 'desc' },
          1,
          3
        );
        setBuilds(response.data.slice(0, 3));
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
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant='rectangular'
              height={70}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  if (error || builds.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant='h5' className='section-title' sx={{ mb: 2 }}>
        Builds da Comunidade
      </Typography>

      <Stack spacing={1.5}>
        {builds.map((build, index) => (
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
              p: 1.5,
              cursor: 'pointer',
              border: `1px solid ${
                isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }`,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateX(4px)',
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
            >
              <Typography
                variant='subtitle2'
                sx={{
                  fontFamily: 'Tfont, serif',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  mr: 1,
                }}
              >
                {build.name}
              </Typography>
              {build.ratings && build.ratings.count > 0 && (
                <Stack direction='row' alignItems='center' spacing={0.5}>
                  <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  <Typography variant='caption' color='text.secondary'>
                    {build.ratings.average.toFixed(1)}
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Stack direction='row' spacing={0.5} mt={0.5} flexWrap='wrap'>
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
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  mt: 0.5,
                  fontSize: '0.7rem',
                }}
              >
                {build.description}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>

      <Button
        variant='contained'
        size='small'
        fullWidth
        endIcon={<ArrowForwardIcon />}
        onClick={() => onClickButton('/builds')}
        sx={{ mt: 2 }}
      >
        Explorar Builds
      </Button>
    </Box>
  );
};

export default BuildsPreviewSection;
