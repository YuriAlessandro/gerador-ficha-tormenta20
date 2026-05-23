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
import { useAuthContext } from '../../contexts/AuthContext';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_EMAIL = 'yuri.alessandro.m@gmail.com';

interface ToolsSidebarProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

interface ToolItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  isExternal?: boolean;
  isPrimary?: boolean;
}

interface ToolGroup {
  title: string;
  items: ToolItem[];
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { openLoginModal } = useAuthContext();
  const { user, isEditor } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const canCreateBlogPost = isAdmin || isEditor;

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const requireAuth = (action: () => void) => () => {
    if (isAuthenticated) {
      action();
    } else {
      openLoginModal();
    }
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
                onClick: () => onClickButton('/blog/novo'),
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
          onClick: () =>
            onClickButton(
              isAuthenticated ? '/meus-personagens' : '/criar-ficha'
            ),
          isPrimary: true,
        },
        {
          key: 'my-threats',
          title: 'Minhas Ameaças',
          icon: <PetsIcon />,
          onClick: requireAuth(() =>
            onClickButton('/meus-personagens?tab=ameacas')
          ),
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
          onClick: requireAuth(() => onClickButton('/mesas')),
        },
        {
          key: 'builds',
          title: 'Builds',
          icon: <ConstructionIcon />,
          onClick: () => onClickButton('/builds'),
        },
        {
          key: 'bestiary',
          title: 'Bestiário',
          icon: <AutoStoriesIcon />,
          onClick: () => onClickButton('/bestiario'),
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
          onClick: () => onClickButton('/database'),
        },
        {
          key: 'map',
          title: 'Mapa de Arton',
          icon: <MapIcon />,
          onClick: () =>
            openExternal('https://mapadearton.fichasdenimb.com.br/'),
          isExternal: true,
        },
        {
          key: 'cave',
          title: 'Caverna do Saber',
          icon: <BookIcon />,
          onClick: () => onClickButton('/caverna-do-saber'),
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
          onClick: () => onClickButton('/recompensas'),
        },
        {
          key: 'superior-items',
          title: 'Itens Superiores',
          icon: <ArchitectureIcon />,
          onClick: () => onClickButton('/itens-superiores'),
        },
        {
          key: 'magic-items',
          title: 'Itens Mágicos',
          icon: <AutoFixHighIcon />,
          onClick: () => onClickButton('/itens-magicos'),
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
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
              }}
            >
              {group.items.map((item) => (
                <Box
                  key={item.key}
                  onClick={item.onClick}
                  sx={{
                    background: getItemBackground(item.isPrimary),
                    color: getItemColor(item.isPrimary),
                    border: `1px solid ${getItemBorderColor(item.isPrimary)}`,
                    borderRadius: 1.5,
                    p: 1.25,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.5,
                    minHeight: 72,
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
                      fontSize: 20,
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
                      fontSize: '0.75rem',
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
