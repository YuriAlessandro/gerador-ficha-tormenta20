import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Skeleton,
  useTheme,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BlogPost } from '../../types/blog.types';
import BlogService from '../../services/blog.service';
import BlogCard from './BlogCard';
import { SEO, getPageSEO } from '../SEO';

const BlogList: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const history = useHistory();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await BlogService.getAllPosts(page, 12);
      if (append) {
        setPosts((prev) => [...prev, ...response.data]);
      } else {
        setPosts(response.data);
      }
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (err) {
      // Error loading posts - silently fail
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      loadPosts(currentPage + 1, true);
    }
  };

  const handlePostClick = (slug: string) => {
    history.push(`/blog/${slug}`);
  };

  const renderSkeletons = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
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

  const blogSEO = getPageSEO('blog');

  return (
    <>
      <SEO
        title={blogSEO.title}
        description={blogSEO.description}
        url='/blog'
      />
      <Box
        sx={{
          minHeight: '100vh',
          pt: { xs: 10, md: 12 },
          pb: 8,
          background: isDark
            ? 'linear-gradient(180deg, #121212 0%, #1a1a1a 100%)'
            : 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => history.push('/')}
              sx={{ mb: 2 }}
            >
              Voltar
            </Button>

            <Typography
              variant='h3'
              component='h1'
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Blog
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Novidades, atualizações e conteúdo sobre o projeto
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {loading && renderSkeletons()}
            {!loading && posts.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                  }}
                >
                  <Typography variant='h6' color='text.secondary'>
                    Nenhum post publicado ainda.
                  </Typography>
                </Box>
              </Grid>
            )}
            {!loading &&
              posts.length > 0 &&
              posts.map((post) => (
                <Grid key={post.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <BlogCard
                    post={post}
                    onClick={() => handlePostClick(post.slug)}
                  />
                </Grid>
              ))}
          </Grid>

          {!loading && currentPage < totalPages && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant='outlined'
                onClick={handleLoadMore}
                disabled={loadingMore}
                sx={{ px: 4 }}
              >
                {loadingMore ? (
                  <CircularProgress size={24} color='inherit' />
                ) : (
                  'Carregar mais'
                )}
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default BlogList;
