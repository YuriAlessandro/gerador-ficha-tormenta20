import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { BlogPost } from '../../types/blog.types';

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isDark
          ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: `1px solid ${
          isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }`,
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? '0 8px 30px rgba(0,0,0,0.4)'
            : '0 8px 30px rgba(0,0,0,0.15)',
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      {post.coverImage ? (
        <CardMedia
          component='img'
          height='180'
          image={post.coverImage}
          alt={post.title}
          sx={{
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            height: 180,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant='h3'
            sx={{
              color: 'white',
              fontWeight: 700,
              opacity: 0.3,
              textTransform: 'uppercase',
            }}
          >
            Blog
          </Typography>
        </Box>
      )}

      <CardContent
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Typography
          variant='h6'
          component='h3'
          sx={{
            fontWeight: 600,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </Typography>

        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            mb: 2,
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
          <Chip
            icon={<PersonIcon sx={{ fontSize: '0.9rem' }} />}
            label={post.authorName}
            size='small'
            sx={{
              fontSize: '0.75rem',
              height: 24,
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.05)',
            }}
          />
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />}
            label={formatDate(post.publishedAt)}
            size='small'
            sx={{
              fontSize: '0.75rem',
              height: 24,
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.05)',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
