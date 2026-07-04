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
import ArticleIcon from '@mui/icons-material/Article';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { BlogPost } from '../../premium/interfaces/blog.types';

interface BlogHighlightsProps {
  onClickButton: (link: string) => void;
  posts: BlogPost[];
  loading: boolean;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

const BlogHighlights: React.FC<BlogHighlightsProps> = ({
  onClickButton,
  posts,
  loading,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardBg = isDark
    ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const renderHeader = () => (
    <Stack
      direction='row'
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1.5,
      }}
    >
      <Typography variant='h5' className='section-title' sx={{ mb: 0 }}>
        Blog
      </Typography>
      <Button
        size='small'
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        onClick={() => onClickButton('/blog')}
        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
      >
        Ver todos
      </Button>
    </Stack>
  );

  if (loading) {
    return (
      <Box>
        {renderHeader()}
        <Stack spacing={1.25}>
          <Skeleton
            variant='rectangular'
            height={260}
            sx={{ borderRadius: 2 }}
          />
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

  if (posts.length === 0) {
    return null;
  }

  const [featured, ...rest] = posts;
  const sidePosts = rest.slice(0, 3);

  return (
    <Box>
      {renderHeader()}
      <Stack spacing={1.25}>
        {/* Featured post — full-width inside column */}
        <Box
          onClick={() => onClickButton(`/blog/${featured.slug}`)}
          sx={{
            background: cardBg,
            color: isDark ? '#ffffff' : 'inherit',
            borderRadius: 2,
            cursor: 'pointer',
            border: `1px solid ${cardBorder}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease',
            animation: 'scaleIn 0.4s ease-out 0.1s both',
            '&:hover': {
              transform: 'translateY(-3px)',
              borderColor: theme.palette.primary.main,
              boxShadow: `0 8px 20px ${
                isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'
              }`,
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {featured.coverImage ? (
              <Box
                component='img'
                src={featured.coverImage}
                alt={featured.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <ArticleIcon
                  sx={{
                    fontSize: 56,
                    color: theme.palette.primary.main,
                    opacity: 0.5,
                  }}
                />
              </Box>
            )}
            <Chip
              label='Destaque'
              size='small'
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 20,
              }}
            />
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography
              variant='subtitle1'
              sx={{
                fontFamily: 'Tfont, serif',
                fontWeight: 700,
                lineHeight: 1.25,
                mb: 0.75,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {featured.title}
            </Typography>
            {featured.description && (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.825rem',
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {featured.description}
              </Typography>
            )}
            <Stack
              direction='row'
              spacing={1.5}
              sx={{
                alignItems: 'center',
              }}
            >
              <Stack
                direction='row'
                spacing={0.5}
                sx={{
                  alignItems: 'center',
                }}
              >
                <PersonIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                  }}
                >
                  {featured.authorName}
                </Typography>
              </Stack>
              <Stack
                direction='row'
                spacing={0.5}
                sx={{
                  alignItems: 'center',
                }}
              >
                <CalendarTodayIcon
                  sx={{ fontSize: 12, color: 'text.secondary' }}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                  }}
                >
                  {formatDate(featured.publishedAt || featured.createdAt)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Smaller posts below featured (compact list) */}
        {sidePosts.map((post, index) => (
          <Box
            key={post.id}
            onClick={() => onClickButton(`/blog/${post.slug}`)}
            sx={{
              animation: `scaleIn 0.4s ease-out ${0.08 * (index + 2)}s both`,
              background: cardBg,
              color: isDark ? '#ffffff' : 'inherit',
              borderRadius: 2,
              cursor: 'pointer',
              border: `1px solid ${cardBorder}`,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              p: 1.25,
              display: 'flex',
              gap: 1.25,
              transition: 'all 0.18s ease',
              '&:hover': {
                transform: 'translateX(3px)',
                borderColor: theme.palette.primary.main,
                borderLeftColor: theme.palette.primary.main,
              },
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 56,
                borderRadius: 1,
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {post.coverImage ? (
                <Box
                  component='img'
                  src={post.coverImage}
                  alt={post.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <ArticleIcon
                  sx={{
                    fontSize: 24,
                    color: theme.palette.primary.main,
                    opacity: 0.4,
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.25,
                  fontSize: '0.825rem',
                  mb: 0.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.title}
              </Typography>
              <Stack
                direction='row'
                spacing={0.75}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.65rem',
                  }}
                >
                  {post.authorName}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.65rem',
                  }}
                >
                  ·
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.65rem',
                  }}
                >
                  {formatDate(post.publishedAt || post.createdAt)}
                </Typography>
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default BlogHighlights;
