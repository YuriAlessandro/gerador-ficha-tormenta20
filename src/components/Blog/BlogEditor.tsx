import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import { useHistory, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import DraftsIcon from '@mui/icons-material/Drafts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../hooks/useAuth';
import BlogService from '../../services/blog.service';
import { BlogPost } from '../../types/blog.types';

interface BlockInput {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  imageCaption: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);

const BlogEditor: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const { isAuthenticated } = useAuth();

  const [isAuthor, setIsAuthor] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(id || null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState<BlockInput[]>([
    {
      id: generateId(),
      title: '',
      content: '',
      imageUrl: '',
      imageCaption: '',
    },
  ]);

  // Preview state
  const [previewTab, setPreviewTab] = useState(0);
  const [previewBlockIndex, setPreviewBlockIndex] = useState<number | null>(
    null
  );

  const checkAuthorStatus = async () => {
    if (!isAuthenticated) {
      setCheckingAuth(false);
      return;
    }

    try {
      const status = await BlogService.checkAuthorStatus();
      setIsAuthor(status);
    } catch {
      setIsAuthor(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      const post = await BlogService.getPostById(postId);

      // Populate form with post data
      setTitle(post.title);
      setDescription(post.description);
      setSlug(post.slug);
      setCoverImage(post.coverImage || '');
      setIsPublished(post.isPublished);
      setEditingPostId(post.id);

      // Convert blocks to editor format
      const editorBlocks: BlockInput[] = post.blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => ({
          id: block.id,
          title: block.title || '',
          content: block.content,
          imageUrl: block.imageUrl || '',
          imageCaption: block.imageCaption || '',
        }));

      setBlocks(
        editorBlocks.length > 0
          ? editorBlocks
          : [
              {
                id: generateId(),
                title: '',
                content: '',
                imageUrl: '',
                imageCaption: '',
              },
            ]
      );
    } catch (err) {
      setError('Erro ao carregar post');
    } finally {
      setLoading(false);
    }
  };

  const loadDrafts = async () => {
    try {
      setLoadingDrafts(true);
      const draftsData = await BlogService.getMyDrafts();
      setDrafts(draftsData);
    } catch (err) {
      // Silently fail - drafts are not critical
    } finally {
      setLoadingDrafts(false);
    }
  };

  const handleEditDraft = (draftId: string) => {
    loadPost(draftId);
  };

  const handleNewPost = () => {
    setEditingPostId(null);
    setTitle('');
    setDescription('');
    setSlug('');
    setCoverImage('');
    setIsPublished(false);
    setBlocks([
      {
        id: generateId(),
        title: '',
        content: '',
        imageUrl: '',
        imageCaption: '',
      },
    ]);
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    checkAuthorStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthor) {
      loadDrafts();
      if (id) {
        loadPost(id);
      }
    }
  }, [id, isAuthor]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const addBlock = () => {
    setBlocks([
      ...blocks,
      {
        id: generateId(),
        title: '',
        content: '',
        imageUrl: '',
        imageCaption: '',
      },
    ]);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) return;
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  const updateBlock = (
    index: number,
    field: keyof BlockInput,
    value: string
  ) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setBlocks(newBlocks);
  };

  const handleSave = async (publish = false) => {
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!description.trim()) {
      setError('Descrição é obrigatória');
      return;
    }

    if (blocks.every((b) => !b.content.trim())) {
      setError('Pelo menos um bloco deve ter conteúdo');
      return;
    }

    try {
      setSaving(true);

      const postData = {
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim() || generateSlug(title),
        coverImage: coverImage.trim() || undefined,
        blocks: blocks
          .filter((b) => b.content.trim())
          .map((b) => ({
            title: b.title.trim() || undefined,
            content: b.content.trim(),
            imageUrl: b.imageUrl.trim() || undefined,
            imageCaption: b.imageCaption.trim() || undefined,
          })),
        isPublished: publish,
      };

      let savedPost: BlogPost;
      if (editingPostId) {
        savedPost = await BlogService.updatePost(editingPostId, postData);
      } else {
        savedPost = await BlogService.createPost(postData);
      }

      setSuccess(
        publish ? 'Post publicado com sucesso!' : 'Rascunho salvo com sucesso!'
      );

      // Redirect to the post after a short delay
      setTimeout(() => {
        history.push(`/blog/${savedPost.slug}`);
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao salvar post';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || loading) {
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

  if (!isAuthenticated) {
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
          <Alert severity='warning'>
            Você precisa estar logado para acessar esta página.
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!isAuthor) {
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
          <Alert severity='error'>
            Você não tem permissão para criar posts no blog.
          </Alert>
        </Container>
      </Box>
    );
  }

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
      <Container maxWidth='lg'>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push('/blog')}
            sx={{ mb: 2 }}
          >
            Voltar
          </Button>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant='h4' component='h1' sx={{ fontWeight: 700 }}>
              {editingPostId ? 'Editar Post' : 'Novo Post'}
            </Typography>

            {editingPostId && (
              <Button
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={handleNewPost}
              >
                Criar Novo Post
              </Button>
            )}
          </Box>
        </Box>

        {/* Drafts Section */}
        {!editingPostId && drafts.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              border: `1px solid ${
                isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DraftsIcon />
              <Typography variant='h6'>Seus Rascunhos</Typography>
              {loadingDrafts && <CircularProgress size={20} />}
            </Box>

            <List disablePadding>
              {drafts.map((draft) => (
                <ListItem
                  key={draft.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(0,0,0,0.02)',
                    '&:hover': {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  <ListItemText
                    primary={draft.title}
                    secondary={`Atualizado em ${new Date(
                      draft.updatedAt
                    ).toLocaleDateString('pt-BR')}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label='Rascunho'
                      size='small'
                      color='warning'
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      edge='end'
                      onClick={() => handleEditDraft(draft.id)}
                      color='primary'
                    >
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Post metadata */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
            border: `1px solid ${
              isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }`,
          }}
        >
          <Typography variant='h6' sx={{ mb: 2 }}>
            Informações do Post
          </Typography>

          <TextField
            fullWidth
            label='Título'
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label='Descrição'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
            helperText='Uma breve descrição que aparecerá nas listagens'
          />

          <TextField
            fullWidth
            label='Slug (URL)'
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            sx={{ mb: 2 }}
            helperText={`URL: /blog/${slug || 'seu-slug-aqui'}`}
          />

          <TextField
            fullWidth
            label='Imagem de Capa (URL)'
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            sx={{ mb: 2 }}
            helperText='Cole a URL de uma imagem (ex: Imgur, Cloudinary)'
          />

          <FormControlLabel
            control={
              <Switch
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
            }
            label='Publicar imediatamente'
          />
        </Paper>

        {/* Blocks */}
        <Typography variant='h6' sx={{ mb: 2 }}>
          Blocos de Conteúdo
        </Typography>

        {blocks.map((block, index) => (
          <Paper
            key={block.id}
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              border: `1px solid ${
                isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, flex: 1 }}>
                Bloco {index + 1}
              </Typography>

              <IconButton
                size='small'
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUpwardIcon />
              </IconButton>
              <IconButton
                size='small'
                onClick={() => moveBlock(index, 'down')}
                disabled={index === blocks.length - 1}
              >
                <ArrowDownwardIcon />
              </IconButton>
              <IconButton
                size='small'
                onClick={() => removeBlock(index)}
                disabled={blocks.length <= 1}
                color='error'
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              label='Título do Bloco (opcional)'
              value={block.title}
              onChange={(e) => updateBlock(index, 'title', e.target.value)}
              sx={{ mb: 2 }}
            />

            <Tabs
              value={previewBlockIndex === index ? previewTab : 0}
              onChange={(_, value) => {
                setPreviewBlockIndex(index);
                setPreviewTab(value);
              }}
              sx={{ mb: 2 }}
            >
              <Tab label='Editar' />
              <Tab
                label='Preview'
                icon={<PreviewIcon />}
                iconPosition='start'
              />
            </Tabs>

            {previewBlockIndex === index && previewTab === 1 ? (
              <Box
                sx={{
                  p: 2,
                  minHeight: 200,
                  backgroundColor: isDark
                    ? 'rgba(0,0,0,0.2)'
                    : 'rgba(255,255,255,0.5)',
                  borderRadius: 1,
                  '& p': { mb: 2, lineHeight: 1.7 },
                  '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
                  '& ul, & ol': { pl: 3 },
                  '& code': {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.content || '*Nenhum conteúdo ainda*'}
                </ReactMarkdown>
              </Box>
            ) : (
              <TextField
                fullWidth
                label='Conteúdo (Markdown)'
                value={block.content}
                onChange={(e) => updateBlock(index, 'content', e.target.value)}
                multiline
                rows={8}
                sx={{ mb: 2 }}
                helperText='Suporta Markdown: **negrito**, *itálico*, [links](url), # títulos, etc.'
              />
            )}

            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              label='URL da Imagem (opcional)'
              value={block.imageUrl}
              onChange={(e) => updateBlock(index, 'imageUrl', e.target.value)}
              sx={{ mb: 2 }}
            />

            {block.imageUrl && (
              <TextField
                fullWidth
                label='Legenda da Imagem'
                value={block.imageCaption}
                onChange={(e) =>
                  updateBlock(index, 'imageCaption', e.target.value)
                }
              />
            )}
          </Paper>
        ))}

        <Button
          variant='outlined'
          startIcon={<AddIcon />}
          onClick={addBlock}
          sx={{ mb: 4 }}
        >
          Adicionar Bloco
        </Button>

        {/* Save buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant='outlined'
            onClick={() => handleSave(false)}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Salvar Rascunho
          </Button>
          <Button
            variant='contained'
            onClick={() => handleSave(true)}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Publicar
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default BlogEditor;
