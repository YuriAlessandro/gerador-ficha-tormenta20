import React, { useState } from 'react';
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
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import { SupportLevel } from '../../types/subscription.types';
import SupporterBadge from '../Premium/SupporterBadge';

export interface CommentData {
  id: string;
  authorFirebaseUid: string;
  authorUsername: string;
  authorName: string;
  authorPhotoURL?: string;
  authorSupportLevel?: SupportLevel;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  comments: CommentData[];
  loading: boolean;
  error?: string | null;
  onSubmit: (content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  canDelete?: (comment: CommentData) => boolean;
  maxLength?: number;
  title?: string;
  canCommentOverride?: boolean;
}

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

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  loading,
  error: externalError,
  onSubmit,
  onDelete,
  canDelete,
  maxLength = 2000,
  title = 'Comentários',
  canCommentOverride = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isAuthenticated, firebaseUser } = useAuth();
  const { canAccess } = useSubscription();
  const { openLoginModal } = useAuthContext();

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canComment = canAccess('canComment') || canCommentOverride;

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(newComment.trim());
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
      setDeletingId(commentId);
      setError(null);
      await onDelete(commentId);
    } catch (err) {
      setError('Erro ao deletar comentário');
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const defaultCanDelete = (comment: CommentData): boolean => {
    if (!isAuthenticated || !firebaseUser) return false;
    return firebaseUser.uid === comment.authorFirebaseUid;
  };

  const checkCanDelete = canDelete || defaultCanDelete;

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
        {title} ({comments.length})
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
              component={RouterLink}
              to='/perfil'
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
              onKeyDown={handleKeyDown}
              disabled={submitting}
              inputProps={{ maxLength }}
              helperText={`${newComment.length}/${maxLength} caracteres (Ctrl+Enter para enviar)`}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.8)',
                },
              }}
            />
            {(error || externalError) && (
              <Alert
                severity='error'
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error || externalError}
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
                {/* Clickable Avatar */}
                <Link
                  component={RouterLink}
                  to={`/u/${comment.authorUsername}`}
                  sx={{ textDecoration: 'none' }}
                >
                  <Avatar
                    src={comment.authorPhotoURL}
                    alt={comment.authorName}
                    sx={{
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  >
                    {comment.authorName.charAt(0).toUpperCase()}
                  </Avatar>
                </Link>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {/* Clickable Author Name */}
                      <Link
                        component={RouterLink}
                        to={`/u/${comment.authorUsername}`}
                        underline='hover'
                        color='inherit'
                        sx={{
                          fontWeight: 600,
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        <Typography
                          variant='subtitle2'
                          component='span'
                          sx={{ fontWeight: 600 }}
                        >
                          {comment.authorName}
                        </Typography>
                      </Link>

                      {/* Clickable Username */}
                      <Link
                        component={RouterLink}
                        to={`/u/${comment.authorUsername}`}
                        underline='hover'
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        <Typography variant='caption' component='span'>
                          @{comment.authorUsername}
                        </Typography>
                      </Link>

                      {/* Support Badge */}
                      {comment.authorSupportLevel &&
                        comment.authorSupportLevel !== SupportLevel.FREE && (
                          <SupporterBadge
                            level={comment.authorSupportLevel}
                            variant='icon-only'
                            size='small'
                          />
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {formatDate(comment.createdAt)}
                      </Typography>
                      {checkCanDelete(comment) && (
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          sx={{ color: 'error.main' }}
                        >
                          {deletingId === comment.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeleteIcon fontSize='small' />
                          )}
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
