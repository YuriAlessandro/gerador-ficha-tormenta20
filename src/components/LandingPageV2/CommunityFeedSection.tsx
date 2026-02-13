import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Skeleton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import ConstructionIcon from '@mui/icons-material/Construction';
import ForumIcon from '@mui/icons-material/Forum';
import StarIcon from '@mui/icons-material/Star';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BlogService from '../../premium/services/blog.service';
import BuildsService, {
  BuildData,
} from '../../premium/services/builds.service';
import ForumService from '../../premium/services/forum.service';
import { BlogPost } from '../../premium/interfaces/blog.types';
import { ForumThread } from '../../premium/interfaces/forum.types';
import { useAuth } from '../../hooks/useAuth';
import {
  SupportLevel,
  getSupporterGlowColor,
} from '../../types/subscription.types';

const ADMIN_EMAIL = 'yuri.alessandro.m@gmail.com';

const TYPE_COLORS = {
  blog: '#29b6f6',
  build: '#7c4dff',
  forum: '#66bb6a',
};

const TYPE_LABELS = {
  blog: 'Blog',
  build: 'Build',
  forum: 'Post',
};

type FeedItemType = 'blog' | 'build' | 'forum';

interface BaseFeedItem {
  type: FeedItemType;
  id: string;
  title: string;
  date: string;
  link: string;
  supportLevel?: SupportLevel;
}

interface BlogFeedItem extends BaseFeedItem {
  type: 'blog';
  description?: string;
  coverImage?: string;
  authorName: string;
}

interface BuildFeedItem extends BaseFeedItem {
  type: 'build';
  description?: string;
  classe: string;
  isMulticlass?: boolean;
  raca?: string;
  rating?: { average: number; count: number };
}

interface ForumFeedItem extends BaseFeedItem {
  type: 'forum';
  bodyPreview: string;
  authorUsername: string;
  commentCount: number;
  categoryName?: string;
  categoryColor?: string;
}

type FeedItem = BlogFeedItem | BuildFeedItem | ForumFeedItem;

const getBodyPreview = (body: string, maxLength = 100): string => {
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
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

const mapBlogToFeed = (post: BlogPost): BlogFeedItem => ({
  type: 'blog',
  id: post.id,
  title: post.title,
  date: post.publishedAt || post.createdAt,
  link: `/blog/${post.slug}`,
  description: post.description,
  coverImage: post.coverImage,
  authorName: post.authorName,
});

const mapBuildToFeed = (build: BuildData): BuildFeedItem => ({
  type: 'build',
  id: build.id,
  title: build.name,
  date: build.createdAt,
  link: `/build/${build.id}`,
  description: build.description,
  classe: build.isMulticlass ? 'Multiclasse' : build.classe,
  isMulticlass: build.isMulticlass,
  raca: build.raca,
  rating:
    build.ratings && build.ratings.count > 0
      ? { average: build.ratings.average, count: build.ratings.count }
      : undefined,
  supportLevel: build.ownerSupportLevel,
});

const mapForumToFeed = (thread: ForumThread): ForumFeedItem => ({
  type: 'forum',
  id: thread.id,
  title: thread.title,
  date: thread.createdAt,
  link: `/forum/${thread.slug}`,
  bodyPreview: getBodyPreview(thread.body),
  authorUsername: thread.authorUsername,
  commentCount: thread.commentCount,
  categoryName: thread.category?.name,
  categoryColor: thread.category?.color,
  supportLevel: thread.authorSupportLevel,
});

interface CommunityFeedSectionProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

const CommunityFeedSection: React.FC<CommunityFeedSectionProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);

        const [blogResult, buildsResult, forumResult] =
          await Promise.allSettled([
            BlogService.getRecentPosts(3),
            BuildsService.getAllPublicBuilds(
              { sortBy: 'createdAt', sortOrder: 'desc' },
              1,
              3
            ),
            ForumService.getThreads({ page: 1, limit: 3, sortBy: 'newest' }),
          ]);

        const items: FeedItem[] = [];

        if (blogResult.status === 'fulfilled') {
          items.push(...blogResult.value.map(mapBlogToFeed));
        }
        if (buildsResult.status === 'fulfilled') {
          items.push(
            ...buildsResult.value.data.slice(0, 3).map(mapBuildToFeed)
          );
        }
        if (forumResult.status === 'fulfilled') {
          items.push(...forumResult.value.data.slice(0, 3).map(mapForumToFeed));
        }

        // Separate supporter items (builds + forum only) from regular items
        const byDateDesc = (a: FeedItem, b: FeedItem) =>
          new Date(b.date).getTime() - new Date(a.date).getTime();

        const isSupporter = (item: FeedItem) =>
          item.supportLevel && item.supportLevel !== SupportLevel.FREE;

        const supporterItems = items
          .filter(isSupporter)
          .sort(byDateDesc)
          .slice(0, 3);

        const supporterIdSet = new Set(
          supporterItems.map((i) => `${i.type}-${i.id}`)
        );

        const regularItems = items
          .filter((i) => !supporterIdSet.has(`${i.type}-${i.id}`))
          .sort(byDateDesc);

        setFeedItems([...supporterItems, ...regularItems].slice(0, 9));
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuClick = (link: string) => {
    handleMenuClose();
    onClickButton(link);
  };

  const renderTypeIcon = (type: FeedItemType) => {
    const iconSx = { fontSize: 12 };
    if (type === 'blog') return <ArticleIcon sx={iconSx} />;
    if (type === 'build') return <ConstructionIcon sx={iconSx} />;
    return <ForumIcon sx={iconSx} />;
  };

  const renderBlogContent = (item: BlogFeedItem) => (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {item.coverImage && (
        <Box
          component='img'
          src={item.coverImage}
          alt={item.title}
          sx={{
            width: 60,
            height: 45,
            objectFit: 'cover',
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {item.description && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              fontSize: '0.7rem',
              mb: 0.5,
            }}
          >
            {item.description}
          </Typography>
        )}
        <Stack direction='row' spacing={1} alignItems='center'>
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <PersonIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.6rem' }}
            >
              {item.authorName}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <CalendarTodayIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.6rem' }}
            >
              {formatDate(item.date)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );

  const renderBuildContent = (item: BuildFeedItem) => (
    <Box>
      <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5}>
        <Chip
          label={item.classe}
          size='small'
          color='primary'
          sx={{ fontSize: '0.6rem', height: 18 }}
        />
        {item.raca && (
          <Chip
            label={item.raca}
            size='small'
            variant='outlined'
            sx={{ fontSize: '0.6rem', height: 18 }}
          />
        )}
        {item.rating && (
          <Stack direction='row' alignItems='center' spacing={0.3}>
            <StarIcon sx={{ fontSize: 12, color: 'warning.main' }} />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.6rem' }}
            >
              {item.rating.average.toFixed(1)}
            </Typography>
          </Stack>
        )}
      </Stack>
      {item.description && (
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            mt: 0.5,
            fontSize: '0.65rem',
          }}
        >
          {item.description}
        </Typography>
      )}
    </Box>
  );

  const renderForumContent = (item: ForumFeedItem) => (
    <Box>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
          fontSize: '0.65rem',
          mb: 0.5,
        }}
      >
        {item.bodyPreview}
      </Typography>
      <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
        {item.categoryName && (
          <Chip
            label={item.categoryName}
            size='small'
            variant='outlined'
            sx={{
              fontSize: '0.55rem',
              height: 16,
              borderColor: item.categoryColor || undefined,
              color: item.categoryColor || undefined,
            }}
          />
        )}
        <Stack direction='row' spacing={0.5} alignItems='center'>
          <PersonIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.6rem' }}
          >
            {item.authorUsername}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={0.5} alignItems='center'>
          <ChatBubbleOutlineIcon
            sx={{ fontSize: 11, color: 'text.secondary' }}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.6rem' }}
          >
            {item.commentCount}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );

  const renderItemContent = (item: FeedItem) => {
    if (item.type === 'blog') return renderBlogContent(item);
    if (item.type === 'build') return renderBuildContent(item);
    return renderForumContent(item);
  };

  if (loading) {
    return (
      <Box>
        <Stack spacing={1.5}>
          {[1, 2, 3, 4, 5].map((i) => (
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

  if (feedItems.length === 0) {
    return null;
  }

  return (
    <Box>
      {isAuthenticated && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Button
            size='small'
            startIcon={<AddIcon />}
            onClick={handleMenuOpen}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            Criar
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleMenuClick('/forum/novo')}>
          <ListItemIcon>
            <ForumIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Novo Post</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('/my-builds')}>
          <ListItemIcon>
            <ConstructionIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Nova Build</ListItemText>
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={() => handleMenuClick('/blog/novo')}>
            <ListItemIcon>
              <ArticleIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Novo Blog</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Stack spacing={1.5}>
        {feedItems.map((item, index) => {
          const shadowColor = getSupporterGlowColor(item.supportLevel);
          return (
            <Box
              key={`${item.type}-${item.id}`}
              onClick={() => onClickButton(item.link)}
              sx={{
                animation: `scaleIn 0.4s ease-out ${0.1 * (index + 1)}s both`,
                background: isDark
                  ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: isDark ? '#ffffff' : 'inherit',
                borderRadius: 2,
                p: 1.5,
                cursor: 'pointer',
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }`,
                borderLeft: `4px solid ${TYPE_COLORS[item.type]}`,
                borderBottom: shadowColor ? `3px solid ${shadowColor}` : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  borderColor: theme.palette.primary.main,
                  borderLeftColor: TYPE_COLORS[item.type],
                },
              }}
            >
              {/* Header: Title + Type chip */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </Typography>
                <Chip
                  icon={renderTypeIcon(item.type)}
                  label={TYPE_LABELS[item.type]}
                  size='small'
                  sx={{
                    fontSize: '0.55rem',
                    height: 18,
                    flexShrink: 0,
                    backgroundColor: `${TYPE_COLORS[item.type]}20`,
                    color: TYPE_COLORS[item.type],
                    borderColor: TYPE_COLORS[item.type],
                    '& .MuiChip-icon': {
                      color: TYPE_COLORS[item.type],
                      marginLeft: '4px',
                    },
                  }}
                  variant='outlined'
                />
              </Box>

              {/* Type-specific content */}
              {renderItemContent(item)}
            </Box>
          );
        })}
      </Stack>

      {/* Links to full listing pages */}
      <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
        <Button
          size='small'
          fullWidth
          startIcon={<ForumIcon sx={{ fontSize: 14 }} />}
          onClick={() => onClickButton('/forum')}
          sx={{
            textTransform: 'none',
            fontSize: '0.7rem',
            borderColor: TYPE_COLORS.forum,
            color: TYPE_COLORS.forum,
            '&:hover': {
              borderColor: TYPE_COLORS.forum,
              backgroundColor: `${TYPE_COLORS.forum}15`,
            },
          }}
          variant='outlined'
        >
          Fórum
        </Button>
        <Button
          size='small'
          fullWidth
          startIcon={<ArticleIcon sx={{ fontSize: 14 }} />}
          onClick={() => onClickButton('/blog')}
          sx={{
            textTransform: 'none',
            fontSize: '0.7rem',
            borderColor: TYPE_COLORS.blog,
            color: TYPE_COLORS.blog,
            '&:hover': {
              borderColor: TYPE_COLORS.blog,
              backgroundColor: `${TYPE_COLORS.blog}15`,
            },
          }}
          variant='outlined'
        >
          Blog
        </Button>
        <Button
          size='small'
          fullWidth
          startIcon={<ConstructionIcon sx={{ fontSize: 14 }} />}
          onClick={() => onClickButton('/builds')}
          sx={{
            textTransform: 'none',
            fontSize: '0.7rem',
            borderColor: TYPE_COLORS.build,
            color: TYPE_COLORS.build,
            '&:hover': {
              borderColor: TYPE_COLORS.build,
              backgroundColor: `${TYPE_COLORS.build}15`,
            },
          }}
          variant='outlined'
        >
          Builds
        </Button>
      </Stack>
    </Box>
  );
};

export default CommunityFeedSection;
