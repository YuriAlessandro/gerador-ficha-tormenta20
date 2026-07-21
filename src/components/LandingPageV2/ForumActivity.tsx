import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Skeleton,
  Chip,
  useTheme,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { Link as RouterLink } from 'react-router-dom';
import { ForumThread } from '../../premium/interfaces/forum.types';
import { getSupporterGlowColor } from '../../types/subscription.types';

interface ForumActivityProps {
  threads: ForumThread[];
  loading: boolean;
  isAuthenticated: boolean;
  maxItems?: number;
}

const getBodyPreview = (body: string, maxLength = 160): string => {
  const plainText = body
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/>\s/g, '')
    .replace(/\n/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return `${plainText.substring(0, maxLength)}...`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

const ForumActivity: React.FC<ForumActivityProps> = ({
  threads,
  loading,
  isAuthenticated,
  maxItems = 8,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const ordered = useMemo(
    () => threads.slice(0, maxItems),
    [threads, maxItems]
  );

  const renderHeader = () => (
    <Stack
      direction='row'
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1.5,
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant='h5' className='section-title' sx={{ mb: 0 }}>
        Fórum
      </Typography>
      {isAuthenticated && (
        <Button
          size='small'
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          component={RouterLink}
          to='/forum/novo'
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          Criar post
        </Button>
      )}
    </Stack>
  );

  if (loading) {
    return (
      <Box>
        {renderHeader()}
        <Stack spacing={1}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

  if (ordered.length === 0) {
    return null;
  }

  return (
    <Box>
      {renderHeader()}
      <Stack spacing={1}>
        {ordered.map((thread, index) => {
          const shadowColor = getSupporterGlowColor(thread.authorSupportLevel);
          return (
            <Box
              key={thread.id}
              component={RouterLink}
              to={`/forum/${thread.slug}`}
              sx={{
                display: 'block',
                textDecoration: 'none',
                animation: `scaleIn 0.4s ease-out ${0.04 * (index + 1)}s both`,
                background: isDark
                  ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: isDark ? '#ffffff' : 'inherit',
                borderRadius: 2,
                p: 1.25,
                cursor: 'pointer',
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }`,
                borderLeft: '4px solid #66bb6a',
                borderBottom: shadowColor ? `3px solid ${shadowColor}` : 'none',
                transition: 'all 0.18s ease',
                '&:hover': {
                  transform: 'translateX(3px)',
                  borderColor: theme.palette.primary.main,
                  borderLeftColor: '#66bb6a',
                },
              }}
            >
              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.25,
                  fontSize: '0.85rem',
                  mb: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {thread.title}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 0.5,
                }}
              >
                {getBodyPreview(thread.body)}
              </Typography>
              <Stack
                direction='row'
                spacing={1}
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  rowGap: 0.25,
                }}
              >
                {thread.category?.name && (
                  <Chip
                    label={thread.category.name}
                    size='small'
                    variant='outlined'
                    sx={{
                      fontSize: '0.55rem',
                      height: 16,
                      borderColor: thread.category.color || undefined,
                      color: thread.category.color || undefined,
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                )}
                <Stack
                  direction='row'
                  spacing={0.4}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.65rem',
                    }}
                  >
                    {thread.authorUsername}
                  </Typography>
                </Stack>
                <Stack
                  direction='row'
                  spacing={0.4}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 11, color: 'text.secondary' }}
                  />
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.65rem',
                    }}
                  >
                    {thread.commentCount}
                  </Typography>
                </Stack>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.65rem',
                    ml: 'auto',
                  }}
                >
                  {formatDate(thread.lastActivityAt || thread.createdAt)}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
      <Button
        variant='outlined'
        size='small'
        fullWidth
        startIcon={<ForumIcon sx={{ fontSize: 14 }} />}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        component={RouterLink}
        to='/forum'
        sx={{
          mt: 1.5,
          textTransform: 'none',
          fontSize: '0.75rem',
          borderColor: '#66bb6a',
          color: '#66bb6a',
          '&:hover': {
            borderColor: '#66bb6a',
            backgroundColor: 'rgba(102, 187, 106, 0.08)',
          },
        }}
      >
        Ir ao fórum
      </Button>
    </Box>
  );
};

export default ForumActivity;
