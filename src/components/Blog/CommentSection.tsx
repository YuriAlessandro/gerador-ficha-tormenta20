import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import { BlogComment } from '../../types/blog.types';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import BlogService from '../../services/blog.service';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isAuthenticated, firebaseUser } = useAuth();
  const { canAccess } = useSubscription();
  const { openLoginModal } = useAuthContext();

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canComment = canAccess('canComment');

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getComments(postId);
      setComments(data);
    } catch (err) {
      // Error loading comments - silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const comment = await BlogService.createComment(
        postId,
        newComment.trim()
      );
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao enviar comentário';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await BlogService.deleteComment(postId, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      // Error deleting comment - silently fail
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography
        variant='h5'
        sx={{
          fontWeight: 600,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        Comentários ({comments.length})
      </Typography>

      {/* Comment form */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.02)',
          borderRadius: 2,
          border: `1px solid ${
            isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }`,
        }}
      >
        {!isAuthenticated && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
              Faça login para comentar
            </Typography>
            <Button variant='contained' onClick={() => openLoginModal()}>
              Entrar
            </Button>
          </Box>
        )}
        {isAuthenticated && !canComment && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <StarIcon sx={{ color: theme.palette.warning.main }} />
              <Typography variant='body1' color='text.secondary'>
                Comentários são exclusivos para apoiadores
              </Typography>
            </Box>
            <Button
              variant='contained'
              color='primary'
              href='https://yurialessandro.github.io/gerador-ficha-tormenta20/#/perfil'
            >
              Apoiar o projeto
            </Button>
          </Box>
        )}
        {isAuthenticated && canComment && (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder='Escreva seu comentário...'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.8)',
                },
              }}
            />
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant='contained'
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim()}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : (
                    <SendIcon />
                  )
                }
              >
                Enviar
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Comments list */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && comments.length === 0 && (
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'center', py: 4 }}
        >
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </Typography>
      )}
      {!loading && comments.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.01)',
                borderRadius: 2,
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Avatar
                  src={comment.authorPhotoURL}
                  alt={comment.authorName}
                  sx={{ width: 40, height: 40 }}
                >
                  {comment.authorName.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant='subtitle2'
                        component='span'
                        sx={{ fontWeight: 600 }}
                      >
                        {comment.authorName}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ ml: 1 }}
                      >
                        @{comment.authorUsername}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {formatDate(comment.createdAt)}
                      </Typography>
                      {isAuthenticated &&
                        firebaseUser?.uid === comment.authorFirebaseUid && (
                          <IconButton
                            size='small'
                            onClick={() => handleDelete(comment.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        )}
                    </Box>
                  </Box>

                  <Typography
                    variant='body2'
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentSection;
