import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListSubheader,
  Paper,
  Divider,
  FormControlLabel,
  FormGroup,
  Switch,
  Slide,
  styled,
  Link,
  Avatar,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MapIcon from '@mui/icons-material/Map';
import StorageIcon from '@mui/icons-material/Storage';
import BookIcon from '@mui/icons-material/Book';
import ForumIcon from '@mui/icons-material/Forum';
import CodeIcon from '@mui/icons-material/Code';
import NotesIcon from '@mui/icons-material/Notes';
import LinkIcon from '@mui/icons-material/Link';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import LogoutIcon from '@mui/icons-material/Logout';
// import CasinoIcon from '@mui/icons-material/Casino';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import logoFichasDeNimb from '../../assets/images/logoFichasDeNimbSmall.svg';
import '../../assets/css/sidebar.css';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
// import { useDice3D } from '../../contexts/Dice3DContext';

const APP_VERSION = '4.2.4.1';

interface SidebarV2Props {
  visible: boolean;
  onCloseSidebar: () => void;
  isDarkTheme: boolean;
  onChangeTheme: () => void;
}

const StyledPaper = styled(Paper)`
  position: fixed;
  z-index: 3;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for iOS */
  padding-top: 20px;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  transition: visibility 0s, opacity 0.5s linear;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;

const StyledMenuItem = styled(MenuItem)`
  margin-bottom: 4px;
  padding: 8px 16px;
`;

const StyledSubheader = styled(ListSubheader)`
  font-family: 'Tfont', serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 2.5;
  background: transparent;
`;

const SidebarV2: React.FC<SidebarV2Props> = ({
  visible,
  onCloseSidebar,
  isDarkTheme,
  onChangeTheme,
}) => {
  const history = useHistory();
  const { isAuthenticated, user } = useAuth();
  const { requestLogout } = useAuthContext();
  // const { settings, updateSettings } = useDice3D();

  const handleLogout = () => {
    onCloseSidebar();
    requestLogout();
  };

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () =>
    user?.fullName || user?.username || user?.email || 'Usuário';

  useEffect(() => {
    if (visible) {
      // Calculate scrollbar width before hiding it
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      // Add padding to prevent layout shift when scrollbar disappears
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [visible]);

  const navigateTo = (path: string) => {
    history.push(path);
    onCloseSidebar();
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEscKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCloseSidebar();
    }
  };

  // const onToggle3DDice = () => {
  //   updateSettings({ enabled: !settings.enabled });
  // };

  useEffect(() => {
    document.addEventListener('keydown', handleEscKeyPress, false);
    return () => {
      document.removeEventListener('keydown', handleEscKeyPress, false);
    };
  });

  return (
    <>
      {/* Backdrop - clicking outside closes sidebar */}
      {visible && (
        <Box
          onClick={onCloseSidebar}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2,
          }}
        />
      )}
      <Slide
        direction='right'
        in={visible}
        style={{
          background: isDarkTheme ? '#3b3b3b' : 'white',
          color: isDarkTheme ? '#fff' : 'black',
        }}
      >
        <StyledPaper>
          {/* Header */}
          <div className='sidebarHeader'>
            <Link href='/' onClick={onCloseSidebar}>
              <img
                src={logoFichasDeNimb}
                alt='Fichas de Nimb'
                className='logo'
              />
            </Link>
            <div style={{ textAlign: 'right', paddingRight: '15px' }}>
              <CloseIcon
                onClick={onCloseSidebar}
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
              />
            </div>
          </div>

          {/* User Section - shows when authenticated */}
          {isAuthenticated && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                mx: 1,
                mb: 1,
                borderRadius: 2,
                backgroundColor: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
                src={user?.photoURL || undefined}
              >
                {!user?.photoURL && getInitials()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='subtitle2'
                  fontWeight='bold'
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getDisplayName()}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>
              <LogoutIcon
                onClick={handleLogout}
                sx={{
                  cursor: 'pointer',
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main' },
                }}
              />
            </Box>
          )}

          <MenuList>
            {/* Home */}
            <StyledMenuItem onClick={() => navigateTo('/')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Início</Typography>
            </StyledMenuItem>

            <StyledMenuItem
              onClick={() =>
                user?.username && navigateTo(`/perfil/${user.username}`)
              }
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Meu Perfil</Typography>
            </StyledMenuItem>

            <Divider sx={{ my: 1 }} />

            {/* PERSONAGENS */}
            <StyledSubheader>Personagens</StyledSubheader>
            <StyledMenuItem onClick={() => navigateTo('/criar-ficha')}>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Criar nova ficha</Typography>
            </StyledMenuItem>
            <StyledMenuItem
              onClick={() =>
                navigateTo(isAuthenticated ? '/meus-personagens' : '/sheets')
              }
            >
              <ListItemIcon>
                {isAuthenticated ? <GroupIcon /> : <HistoryIcon />}
              </ListItemIcon>
              <Typography variant='inherit'>
                {isAuthenticated ? 'Meus Personagens' : 'Histórico Local'}
              </Typography>
            </StyledMenuItem>
            {isAuthenticated && (
              <>
                <StyledMenuItem onClick={() => navigateTo('/mesas')}>
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <Typography variant='inherit'>Minhas Mesas</Typography>
                </StyledMenuItem>
                <StyledMenuItem onClick={() => navigateTo('/my-builds')}>
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <Typography variant='inherit'>Minhas Builds</Typography>
                </StyledMenuItem>
                <StyledMenuItem onClick={() => navigateTo('/builds')}>
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <Typography variant='inherit'>Explorar Builds</Typography>
                </StyledMenuItem>
              </>
            )}

            <Divider sx={{ my: 1 }} />

            {/* FERRAMENTAS */}
            <StyledSubheader>Ferramentas</StyledSubheader>
            <StyledMenuItem onClick={() => navigateTo('/gerador-ameacas')}>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Gerador de Ameaças</Typography>
            </StyledMenuItem>
            <StyledMenuItem onClick={() => navigateTo('/recompensas')}>
              <ListItemIcon>
                <AttachMoneyIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Rolador de Recompensas</Typography>
            </StyledMenuItem>
            <StyledMenuItem onClick={() => navigateTo('/itens-superiores')}>
              <ListItemIcon>
                <ArchitectureIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Criar Item Superior</Typography>
            </StyledMenuItem>
            <StyledMenuItem onClick={() => navigateTo('/itens-magicos')}>
              <ListItemIcon>
                <AutoFixHighIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Criar Item Mágico</Typography>
            </StyledMenuItem>

            <Divider sx={{ my: 1 }} />

            {/* CONSULTA */}
            <StyledSubheader>Consulta</StyledSubheader>
            <StyledMenuItem
              onClick={() =>
                openExternal('https://mapadearton.fichasdenimb.com.br/')
              }
            >
              <ListItemIcon>
                <MapIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Mapa Interativo</Typography>
            </StyledMenuItem>
            <StyledMenuItem onClick={() => navigateTo('/database')}>
              <ListItemIcon>
                <StorageIcon />
              </ListItemIcon>
              <Typography variant='inherit'>
                Enciclopédia de Tanah-Toh
              </Typography>
            </StyledMenuItem>
            <StyledMenuItem onClick={() => navigateTo('/caverna-do-saber')}>
              <ListItemIcon>
                <BookIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Caverna do Saber</Typography>
            </StyledMenuItem>

            <Divider sx={{ my: 1 }} />

            {/* COMUNIDADE */}
            <StyledSubheader>Comunidade</StyledSubheader>
            <StyledMenuItem onClick={() => navigateTo('/forum')}>
              <ListItemIcon>
                <ForumIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Fórum</Typography>
            </StyledMenuItem>
            <StyledMenuItem
              onClick={() =>
                openExternal(
                  'https://github.com/YuriAlessandro/gerador-ficha-tormenta20#gerador-de-fichas-de-tormenta-20'
                )
              }
            >
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Contribua com o Projeto</Typography>
            </StyledMenuItem>
            <StyledMenuItem onClick={() => navigateTo('/changelog')}>
              <ListItemIcon>
                <NotesIcon />
              </ListItemIcon>
              <Typography variant='inherit' className='specialMenu'>
                Changelog
              </Typography>
            </StyledMenuItem>

            <Divider sx={{ my: 1 }} />

            {/* LINKS EXTERNOS */}
            <StyledSubheader>Links Externos</StyledSubheader>
            <StyledMenuItem
              onClick={() =>
                openExternal('https://eduardomarques.pythonanywhere.com/')
              }
            >
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Grimório T20</Typography>
            </StyledMenuItem>
            <StyledMenuItem
              onClick={() =>
                openExternal('https://mclemente.github.io/Calculadora-ND/')
              }
            >
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <Typography variant='inherit'>Calculadora ND</Typography>
            </StyledMenuItem>

            <Divider sx={{ my: 1 }} />

            {/* CONFIGURAÇÕES */}
            <StyledSubheader>Configurações</StyledSubheader>
            <StyledMenuItem>
              <ListItemIcon>
                <Brightness4Icon />
              </ListItemIcon>
              <FormGroup>
                <FormControlLabel
                  labelPlacement='end'
                  control={
                    <Switch
                      checked={isDarkTheme}
                      onChange={onChangeTheme}
                      color='default'
                      value='dark'
                    />
                  }
                  label='Tema Escuro'
                />
              </FormGroup>
            </StyledMenuItem>
          </MenuList>

          {/* Footer spacing - extra space for iOS safe areas */}
          <Box sx={{ height: 60, pl: 2 }}>
            <span>${APP_VERSION}</span>
          </Box>
        </StyledPaper>
      </Slide>
    </>
  );
};

export default SidebarV2;
