import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BlogPost } from '../../types/blog.types';
import BlogService from '../../services/blog.service';
import BlogCard from './BlogCard';

interface BlogPreviewSectionProps {
  onClickButton: (link: string) => void;
}

const BlogPreviewSection: React.FC<BlogPreviewSectionProps> = ({
  onClickButton,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentPosts = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getRecentPosts(3);
      setPosts(data);
    } catch (err) {
      // Error loading posts - silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentPosts();
  }, []);

  const handlePostClick = (slug: string) => {
    onClickButton(`/blog/${slug}`);
  };

  // Don't render if no posts and not loading
  if (!loading && posts.length === 0) {
    return null;
  }

  const renderSkeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <Box
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${
                isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }`,
            }}
          >
            <Skeleton variant='rectangular' height={180} />
            <Box sx={{ p: 2 }}>
              <Skeleton variant='text' height={32} />
              <Skeleton variant='text' height={20} />
              <Skeleton variant='text' height={20} width='60%' />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant='rounded' width={80} height={24} />
                <Skeleton variant='rounded' width={100} height={24} />
              </Box>
            </Box>
          </Box>
        </Grid>
      ))}
    </>
  );

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant='h4'
            component='h2'
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            Novidades do Blog
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Acompanhe as últimas atualizações e novidades do projeto
          </Typography>
        </Box>

        <Button
          variant='text'
          endIcon={<ArrowForwardIcon />}
          onClick={() => onClickButton('/blog')}
          sx={{
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          Ver mais posts
        </Button>
      </Box>

      <Grid container spacing={3}>
        {loading
          ? renderSkeletons()
          : posts.map((post) => (
              <Grid key={post.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <BlogCard
                  post={post}
                  onClick={() => handlePostClick(post.slug)}
                />
              </Grid>
            ))}
      </Grid>

      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
          mt: 3,
        }}
      >
        <Button
          variant='outlined'
          endIcon={<ArrowForwardIcon />}
          onClick={() => onClickButton('/blog')}
        >
          Ver mais posts
        </Button>
      </Box>
    </Box>
  );
};

export default BlogPreviewSection;
