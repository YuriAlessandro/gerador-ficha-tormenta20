import React, { useState } from 'react';
import {
  Box,
  Stack,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Link,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BookIcon from '@mui/icons-material/Book';
import MapIcon from '@mui/icons-material/Map';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import SecurityIcon from '@mui/icons-material/Security';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GroupIcon from '@mui/icons-material/Group';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '../Auth/UserMenu';

// Helper to check if click should open in new tab
const shouldOpenInNewTab = (event: React.MouseEvent): boolean =>
  event.ctrlKey || event.metaKey || event.button === 1;

interface NavbarV2Props {
  onClickMenu: () => void;
  onClickToLink: (link: string) => void;
}

interface NavMenuItem {
  label: string;
  link: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

interface NavCategory {
  label: string;
  items?: NavMenuItem[];
  link?: string;
  requireAuth?: boolean;
}

const navCategories: NavCategory[] = [
  {
    label: 'Meus Personagens',
    link: '/meus-personagens',
    requireAuth: true,
  },
  {
    label: 'Minhas Ameaças',
    link: '/meus-personagens?tab=ameacas',
    requireAuth: true,
  },
  {
    label: 'Ferramentas',
    items: [
      {
        label: 'Criar Ficha',
        link: '/criar-ficha',
        icon: <PersonAddIcon fontSize='small' />,
      },
      {
        label: 'Gerador de Ameaças',
        link: '/gerador-ameacas',
        icon: <SecurityIcon fontSize='small' />,
      },
      {
        label: 'Item Superior',
        link: '/itens-superiores',
        icon: <ArchitectureIcon fontSize='small' />,
      },
      {
        label: 'Item Mágico',
        link: '/itens-magicos',
        icon: <AutoFixHighIcon fontSize='small' />,
      },
      {
        label: 'Recompensas',
        link: '/recompensas',
        icon: <AttachMoneyIcon fontSize='small' />,
      },
    ],
  },
  {
    label: 'Enciclopédia de Tannah-Toh',
    items: [
      {
        label: 'Raças',
        link: '/database/raças',
        icon: <GroupIcon fontSize='small' />,
      },
      {
        label: 'Classes',
        link: '/database/classes',
        icon: <WhatshotIcon fontSize='small' />,
      },
      {
        label: 'Origens',
        link: '/database/origens',
        icon: <BrowseGalleryIcon fontSize='small' />,
      },
      {
        label: 'Divindades',
        link: '/database/divindades',
        icon: <FilterDramaIcon fontSize='small' />,
      },
      {
        label: 'Poderes',
        link: '/database/poderes',
        icon: <LocalFireDepartmentIcon fontSize='small' />,
      },
      {
        label: 'Magias',
        link: '/database/magias',
        icon: <AutoFixHighIcon fontSize='small' />,
      },
    ],
  },
  {
    label: 'Consulta',
    items: [
      {
        label: 'Caverna do Saber',
        link: '/caverna-do-saber',
        icon: <BookIcon fontSize='small' />,
      },
      {
        label: 'Mapa de Arton',
        link: 'https://mapadearton.fichasdenimb.com.br/',
        icon: <MapIcon fontSize='small' />,
        isExternal: true,
      },
    ],
  },
  {
    label: 'Comunidade',
    items: [
      {
        label: 'Mesas Virtuais',
        link: '/mesas',
        icon: <TableRestaurantIcon fontSize='small' />,
      },
      {
        label: 'Explorar Builds',
        link: '/builds',
        icon: <AccountTreeIcon fontSize='small' />,
      },
    ],
  },
];

const NavbarV2: React.FC<NavbarV2Props> = ({ onClickMenu, onClickToLink }) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEls, setAnchorEls] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    category: string
  ) => {
    setAnchorEls((prev) => ({ ...prev, [category]: event.currentTarget }));
  };

  const handleMenuClose = (category: string) => {
    setAnchorEls((prev) => ({ ...prev, [category]: null }));
  };

  const handleItemClick = (
    event: React.MouseEvent,
    item: NavMenuItem,
    category: string
  ) => {
    // For external links, let browser handle it
    if (item.isExternal) {
      handleMenuClose(category);
      return;
    }

    // For middle-click or Ctrl+click, let browser handle opening in new tab
    if (shouldOpenInNewTab(event)) {
      handleMenuClose(category);
      return;
    }

    // For regular clicks, use SPA navigation
    event.preventDefault();
    handleMenuClose(category);
    onClickToLink(item.link);
  };

  const handleLinkClick = (
    event: React.MouseEvent,
    link: string,
    category?: string
  ) => {
    // For middle-click or Ctrl+click, let browser handle opening in new tab
    if (shouldOpenInNewTab(event)) {
      if (category) handleMenuClose(category);
      return;
    }

    // For regular clicks, use SPA navigation
    event.preventDefault();
    if (category) handleMenuClose(category);
    onClickToLink(link);
  };

  return (
    <Box
      className='navbar-v2'
      sx={{
        width: isMobile ? '90%' : '70%',
        m: 2,
        p: { xs: 1.5, md: 2 },
        backgroundColor: 'primary.main',
        borderRadius: '0.75rem',
        color: 'primary.contrastText',
        zIndex: 2,
        boxShadow: `0 4px 15px ${theme.palette.primary.main}4D`,
      }}
    >
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        spacing={2}
        width='100%'
      >
        <Box flexDirection='row' display='flex'>
          {/* Left side: Menu button */}
          <IconButton
            onClick={onClickMenu}
            sx={{ color: 'inherit' }}
            aria-label='Abrir menu'
          >
            <MenuIcon />
          </IconButton>

          {/* Center: Logo and Dropdowns */}
          <Stack direction='row' alignItems='center' spacing={{ xs: 1, md: 3 }}>
            {/* Logo */}
            <Link
              href='/'
              onClick={(e) => handleLinkClick(e, '')}
              underline='none'
              sx={{
                fontFamily: 'Tfont, serif',
                fontWeight: 600,
                fontSize: '1.25rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: 'inherit',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              Fichas de Nimb
            </Link>

            {/* Dropdown Menus - Desktop only */}
            {!isMobile && (
              <Stack direction='row' spacing={0.5} sx={{ ml: 2 }}>
                {navCategories.map((category) => {
                  if (category.requireAuth && !isAuthenticated) return <span />;
                  if ((category.items?.length || 0) > 0) {
                    return (
                      <React.Fragment key={category.label}>
                        <Button
                          onClick={(e) => handleMenuOpen(e, category.label)}
                          endIcon={<KeyboardArrowDownIcon />}
                          sx={{
                            color: 'inherit',
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 1.5,
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          {category.label}
                        </Button>
                        <Menu
                          anchorEl={anchorEls[category.label]}
                          open={Boolean(anchorEls[category.label])}
                          onClose={() => handleMenuClose(category.label)}
                          MenuListProps={{
                            sx: { py: 0.5 },
                          }}
                          PaperProps={{
                            sx: {
                              borderRadius: 2,
                              mt: 1,
                              minWidth: 180,
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                          transformOrigin={{
                            horizontal: 'left',
                            vertical: 'top',
                          }}
                          anchorOrigin={{
                            horizontal: 'left',
                            vertical: 'bottom',
                          }}
                        >
                          {category.items?.map((item, index) => (
                            <React.Fragment key={item.label}>
                              <MenuItem
                                component='a'
                                href={item.link}
                                target={item.isExternal ? '_blank' : undefined}
                                rel={
                                  item.isExternal
                                    ? 'noopener noreferrer'
                                    : undefined
                                }
                                onClick={(e: React.MouseEvent) =>
                                  handleItemClick(e, item, category.label)
                                }
                                sx={{
                                  py: 1,
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  '&:hover': {
                                    backgroundColor: `${theme.palette.primary.main}14`,
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                                {item.isExternal && (
                                  <OpenInNewIcon
                                    fontSize='small'
                                    sx={{ ml: 1, opacity: 0.5 }}
                                  />
                                )}
                              </MenuItem>
                              {index < (category.items?.length || 0) - 1 && (
                                <Divider sx={{ my: 0.5 }} />
                              )}
                            </React.Fragment>
                          ))}
                        </Menu>
                      </React.Fragment>
                    );
                  }

                  return (
                    <MenuItem
                      key={category.label}
                      component='a'
                      href={category.link || '/'}
                      onClick={(e: React.MouseEvent) =>
                        handleLinkClick(e, category.link || '', category.label)
                      }
                      sx={{
                        py: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemText primary={category.label} />
                    </MenuItem>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Right side: User menu */}
        <Box sx={{ ml: 'auto' }}>
          <UserMenu />
        </Box>
      </Stack>
    </Box>
  );
};

export default NavbarV2;
