import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BlogBlock as BlogBlockType,
  BlockReactions,
  EmojiType,
} from '../../types/blog.types';
import ReactionBar from './ReactionBar';

interface BlogBlockProps {
  block: BlogBlockType;
  postId: string;
  reactions: BlockReactions;
  onReactionToggle: (blockId: string, emoji: EmojiType) => void;
  isLoading?: boolean;
}

const BlogBlockComponent: React.FC<BlogBlockProps> = ({
  block,
  postId: _postId,
  reactions,
  onReactionToggle,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        mb: 4,
        pb: 2,
      }}
    >
      {block.title && (
        <Typography
          variant='h5'
          component='h2'
          sx={{
            fontWeight: 600,
            mb: 2,
            color: 'text.primary',
          }}
        >
          {block.title}
        </Typography>
      )}

      <Box
        className='markdown-content'
        sx={{
          '& p': {
            mb: 2,
            lineHeight: 1.7,
            color: 'text.primary',
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            mt: 3,
            mb: 2,
            fontWeight: 600,
            color: 'text.primary',
          },
          '& ul, & ol': {
            pl: 3,
            mb: 2,
          },
          '& li': {
            mb: 0.5,
            lineHeight: 1.7,
          },
          '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& blockquote': {
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            pl: 2,
            ml: 0,
            fontStyle: 'italic',
            color: 'text.secondary',
          },
          '& code': {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.05)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
          },
          '& pre': {
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            '& code': {
              backgroundColor: 'transparent',
              padding: 0,
            },
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            mb: 2,
          },
          '& th, & td': {
            border: `1px solid ${
              isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
            }`,
            p: 1,
            textAlign: 'left',
          },
          '& th': {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
          },
          '& hr': {
            border: 'none',
            borderTop: `1px solid ${
              isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }`,
            my: 3,
          },
          '& strong': {
            fontWeight: 600,
          },
          '& em': {
            fontStyle: 'italic',
          },
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {block.content}
        </ReactMarkdown>
      </Box>

      {block.imageUrl && (
        <Box sx={{ my: 3 }}>
          <Box
            component='img'
            src={block.imageUrl}
            alt={block.imageCaption || block.title || 'Imagem do post'}
            sx={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 2,
              display: 'block',
            }}
          />
          {block.imageCaption && (
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1,
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              {block.imageCaption}
            </Typography>
          )}
        </Box>
      )}

      <ReactionBar
        blockId={block.id}
        reactions={reactions}
        onReactionToggle={onReactionToggle}
        disabled={isLoading}
      />
    </Box>
  );
};

export default BlogBlockComponent;
