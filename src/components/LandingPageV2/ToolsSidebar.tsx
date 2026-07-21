import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MapIcon from '@mui/icons-material/Map';
import StorageIcon from '@mui/icons-material/Storage';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PetsIcon from '@mui/icons-material/Pets';
import BookIcon from '@mui/icons-material/Book';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ConstructionIcon from '@mui/icons-material/Construction';
import EditNoteIcon from '@mui/icons-material/EditNote';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_EMAIL = 'yuri.alessandro.m@gmail.com';

interface ToolsSidebarProps {
  isAuthenticated: boolean;
}

interface ToolItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  /** Rota interna do item — vira href real, permitindo abrir em nova aba. */
  link: string;
  /** Exige login: no clique simples abre o modal em vez de navegar. */
  requiresAuth?: boolean;
  isExternal?: boolean;
  isPrimary?: boolean;
}

interface ToolGroup {
  title: string;
  items: ToolItem[];
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ isAuthenticated }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { openLoginModal } = useAuthContext();
  const { user, isEditor } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const canCreateBlogPost = isAdmin || isEditor;

  // O item continua sendo uma âncora de verdade (Ctrl/Cmd/clique do meio abrem
  // a rota em nova aba); só o clique simples de quem não está logado é
  // interceptado para abrir o modal de login.
  const handleItemClick =
    (requiresAuth?: boolean) => (event: React.MouseEvent) => {
      if (!requiresAuth || isAuthenticated) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      openLoginModal();
    };

  const getItemBackground = (isPrimary?: boolean): string => {
    if (isPrimary) {
      return `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
    }
    return isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  };

  const getItemColor = (isPrimary?: boolean): string => {
    if (isPrimary || isDark) return '#ffffff';
    return 'inherit';
  };

  const getItemBorderColor = (isPrimary?: boolean): string => {
    if (isPrimary) return theme.palette.primary.dark;
    return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  };

  const groups: ToolGroup[] = [
    ...(canCreateBlogPost
      ? [
          {
            title: 'Editor',
            items: [
              {
                key: 'new-blog-post',
                title: 'Novo Post',
                icon: <EditNoteIcon />,
                link: '/blog/novo',
              },
            ],
          },
        ]
      : []),
    {
      title: 'Personagens',
      items: [
        {
          key: 'characters',
          title: isAuthenticated ? 'Meus Personagens' : 'Criar Personagem',
          icon: isAuthenticated ? <GroupIcon /> : <PersonAddIcon />,
          link: isAuthenticated ? '/meus-personagens' : '/criar-ficha',
          isPrimary: true,
        },
        {
          key: 'my-threats',
          title: 'Minhas Ameaças',
          icon: <PetsIcon />,
          link: '/meus-personagens?tab=ameacas',
          requiresAuth: true,
        },
      ],
    },
    {
      title: 'Comunidade',
      items: [
        {
          key: 'tables',
          title: 'Mesa Virtual',
          icon: <TableRestaurantIcon />,
          link: '/mesas',
          requiresAuth: true,
        },
        {
          key: 'builds',
          title: 'Builds',
          icon: <ConstructionIcon />,
          link: '/builds',
        },
        {
          key: 'bestiary',
          title: 'Bestiário',
          icon: <AutoStoriesIcon />,
          link: '/bestiario',
        },
      ],
    },
    {
      title: 'Consulta',
      items: [
        {
          key: 'encyclopedia',
          title: 'Enciclopédia',
          icon: <StorageIcon />,
          link: '/database',
        },
        {
          key: 'map',
          title: 'Mapa de Arton',
          icon: <MapIcon />,
          link: '/mapadearton',
        },
        {
          key: 'cave',
          title: 'Caverna do Saber',
          icon: <BookIcon />,
          link: '/caverna-do-saber',
        },
      ],
    },
    {
      title: 'Gerar',
      items: [
        {
          key: 'rewards',
          title: 'Recompensas',
          icon: <AttachMoneyIcon />,
          link: '/recompensas',
        },
        {
          key: 'superior-items',
          title: 'Itens Superiores',
          icon: <ArchitectureIcon />,
          link: '/itens-superiores',
        },
        {
          key: 'magic-items',
          title: 'Itens Mágicos',
          icon: <AutoFixHighIcon />,
          link: '/itens-magicos',
        },
      ],
    },
  ];

  return (
    <Box
      sx={{
        background: isDark
          ? 'rgba(33, 33, 33, 0.92)'
          : 'rgba(243, 242, 241, 0.92)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        p: 2,
        border: `1px solid ${
          isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }`,
      }}
    >
      <Typography
        variant='h6'
        sx={{
          fontFamily: 'Tfont, serif',
          fontWeight: 700,
          mb: 2,
          color: theme.palette.primary.main,
        }}
      >
        Ferramentas
      </Typography>

      <Stack spacing={2.5}>
        {groups.map((group) => (
          <Box key={group.title}>
            <Typography
              variant='caption'
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: 1,
                fontWeight: 700,
                color: 'text.secondary',
                display: 'block',
                mb: 1,
              }}
            >
              {group.title}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: { xs: 1.25, md: 0.75 },
              }}
            >
              {group.items.map((item) => (
                <Box
                  key={item.key}
                  component={RouterLink}
                  to={item.link}
                  onClick={handleItemClick(item.requiresAuth)}
                  sx={{
                    background: getItemBackground(item.isPrimary),
                    color: getItemColor(item.isPrimary),
                    textDecoration: 'none',
                    border: `1px solid ${getItemBorderColor(item.isPrimary)}`,
                    borderRadius: 1.5,
                    p: { xs: 1.5, md: 1 },
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: { xs: 0.75, md: 0.5 },
                    minHeight: { xs: 96, md: 76 },
                    position: 'relative',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 4px 12px ${
                        item.isPrimary ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.12)'
                      }`,
                    },
                  }}
                >
                  {item.isExternal && (
                    <OpenInNewIcon
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        fontSize: 12,
                        opacity: 0.5,
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      fontSize: { xs: 26, md: 20 },
                      color: item.isPrimary
                        ? 'rgba(255,255,255,0.95)'
                        : theme.palette.primary.main,
                      display: 'flex',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: { xs: '0.85rem', md: '0.7rem' },
                      fontWeight: 600,
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ToolsSidebar;
