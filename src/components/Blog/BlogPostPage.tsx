import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { useHistory, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InstagramIcon from '@mui/icons-material/Instagram';
import { SEO, createArticleSchema } from '../SEO';
import { BlogPost, PostReactions, EmojiType } from '../../types/blog.types';
import { useAuth } from '../../hooks/useAuth';
import BlogService from '../../services/blog.service';
import BlogBlock from './BlogBlock';
import CommentSection from './CommentSection';

const BlogPostPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const history = useHistory();
  const { slug } = useParams<{ slug: string }>();
  const { firebaseUser } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [reactions, setReactions] = useState<PostReactions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reactingBlocks, setReactingBlocks] = useState<Set<string>>(new Set());

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BlogService.getPostBySlug(slug);
      setPost(data);

      // Load reactions
      const reactionsData = await BlogService.getPostReactions(
        data.id,
        firebaseUser?.uid
      );
      setReactions(reactionsData);
    } catch (err) {
      setError('Post não encontrado');
    } finally {
      setLoading(false);
    }
  }, [slug, firebaseUser?.uid]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleReactionToggle = async (blockId: string, emoji: EmojiType) => {
    if (!post) return;

    // Prevent multiple clicks
    if (reactingBlocks.has(blockId)) return;
    setReactingBlocks((prev) => new Set(prev).add(blockId));

    try {
      const action = await BlogService.toggleReaction(post.id, blockId, emoji);

      // Update local state optimistically
      setReactions((prev) => {
        const blockReactions = { ...(prev[blockId] || {}) };
        const currentReaction = blockReactions[emoji] || {
          count: 0,
          hasReacted: false,
        };

        if (action === 'added') {
          blockReactions[emoji] = {
            count: currentReaction.count + 1,
            hasReacted: true,
          };
        } else {
          blockReactions[emoji] = {
            count: Math.max(0, currentReaction.count - 1),
            hasReacted: false,
          };
        }

        return {
          ...prev,
          [blockId]: blockReactions,
        };
      });
    } catch (err) {
      // Error toggling reaction - silently fail
    } finally {
      setReactingBlocks((prev) => {
        const next = new Set(prev);
        next.delete(blockId);
        return next;
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(180deg, #121212 0%, #1a1a1a 100%)'
            : 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
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
        <Container maxWidth='md'>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push('/blog')}
            sx={{ mb: 4 }}
          >
            Voltar para o blog
          </Button>
          <Alert severity='error'>{error || 'Post não encontrado'}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <SEO
        title={`${post.title} | Fichas de Nimb`}
        description={post.description}
        image={post.coverImage}
        url={`/blog/${post.slug}`}
        type='article'
        author={post.authorName}
        publishedAt={post.publishedAt}
        structuredData={createArticleSchema({
          title: post.title,
          description: post.description,
          url: `/blog/${post.slug}`,
          image: post.coverImage,
          authorName: post.authorName,
          publishedAt: post.publishedAt,
        })}
      />
      <Box
        sx={{
          minHeight: '100vh',
          pb: 8,
          background: isDark
            ? 'linear-gradient(180deg, #121212 0%, #1a1a1a 100%)'
            : 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
        }}
      >
        {/* Hero section with cover image - starts behind navbar */}
        {post.coverImage && (
          <Box
            sx={{
              width: '100%',
              // Height includes space for navbar + visible content
              height: { xs: '300px', sm: '400px', md: '500px' },
              // Pull up to start from very top of viewport (behind navbar)
              mt: { xs: '-120px', sm: '-124px', md: '-124px' },
              // Add padding top to compensate for navbar
              pt: { xs: '56px', sm: '64px', md: '64px' },
              backgroundImage: `url(${post.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: isDark
                  ? 'linear-gradient(transparent, #121212)'
                  : 'linear-gradient(transparent, #f5f5f5)',
              },
            }}
          />
        )}

        <Container
          maxWidth='md'
          sx={{ pt: post.coverImage ? 0 : { xs: 10, md: 12 } }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              mt: post.coverImage ? -6 : 0,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => history.push('/blog')}
              sx={{
                mb: 3,
                color: post.coverImage ? 'white' : 'inherit',
                textShadow: post.coverImage
                  ? '0 1px 3px rgba(0,0,0,0.5)'
                  : 'none',
                '&:hover': {
                  backgroundColor: post.coverImage
                    ? 'rgba(255,255,255,0.1)'
                    : undefined,
                },
              }}
            >
              Voltar para o blog
            </Button>

            {/* Post header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant='h3'
                component='h1'
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                }}
              >
                {post.title}
              </Typography>

              <Typography
                variant='h6'
                color='text.secondary'
                sx={{
                  mb: 3,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                {post.description}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  icon={<PersonIcon />}
                  label={post.authorName}
                  sx={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                  }}
                />
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={formatDate(post.publishedAt)}
                  sx={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                  }}
                />
                <Chip
                  component='a'
                  href='https://instagram.com/fichasdenimb'
                  target='_blank'
                  rel='noopener noreferrer'
                  icon={<InstagramIcon />}
                  label='@fichasdenimb'
                  clickable
                  sx={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                    '&:hover': {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(0,0,0,0.1)',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Post content - blocks */}
            <Box sx={{ mb: 6 }}>
              {post.blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <BlogBlock
                    key={block.id}
                    block={block}
                    postId={post.id}
                    reactions={reactions[block.id] || {}}
                    onReactionToggle={handleReactionToggle}
                    isLoading={reactingBlocks.has(block.id)}
                  />
                ))}
            </Box>

            {/* Instagram follow section */}
            <Box
              sx={{
                mb: 6,
                p: 3,
                borderRadius: 2,
                background: isDark
                  ? 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)'
                  : 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
                textAlign: 'center',
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  mb: 1,
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                Gostou do conteudo?
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Siga-nos no Instagram para mais novidades sobre Tormenta 20!
              </Typography>
              <Button
                component='a'
                href='https://instagram.com/fichasdenimb'
                target='_blank'
                rel='noopener noreferrer'
                variant='contained'
                startIcon={<InstagramIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: '#833ab4',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                @fichasdenimb
              </Button>
            </Box>

            {/* Comments section */}
            <CommentSection postId={post.id} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default BlogPostPage;
