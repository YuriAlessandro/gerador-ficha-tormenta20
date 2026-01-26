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
// import CasinoIcon from '@mui/icons-material/Casino';
import CloseIcon from '@mui/icons-material/Close';

import logo from '../../assets/images/tormenta-logo-eye.png';
import '../../assets/css/sidebar.css';
import { useAuth } from '../../hooks/useAuth';
// import { useDice3D } from '../../contexts/Dice3DContext';

interface SidebarV2Props {
  visible: boolean;
  onCloseSidebar: () => void;
  isDarkTheme: boolean;
  onChangeTheme: () => void;
}

const StyledPaper = styled(Paper)`
  position: fixed;
  z-index: 3;
  height: 97.9vh;
  padding-top: 20px;
  transition: visibility 0s, opacity 0.5s linear;
  overflow-y: auto;
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
  // const { settings, updateSettings } = useDice3D();

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
          <Link
            href='https://jamboeditora.com.br/categoria/rpg/tormenta20-rpg/'
            target='_blank'
          >
            <img src={String(logo)} alt='Logo' className='logo' />
          </Link>
          <div style={{ textAlign: 'right', paddingRight: '15px' }}>
            <CloseIcon
              onClick={onCloseSidebar}
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
            />
          </div>
        </div>

        <MenuList>
          {/* Home */}
          <StyledMenuItem onClick={() => navigateTo('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Início</Typography>
          </StyledMenuItem>

          <Divider sx={{ my: 1 }} />

          {/* PERSONAGENS */}
          <StyledSubheader>Personagens</StyledSubheader>
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
            <Typography variant='inherit'>Enciclopédia de Tanah-Toh</Typography>
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
          <StyledMenuItem
            onClick={() =>
              openExternal(
                'https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              )
            }
          >
            <ListItemIcon>
              <ForumIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Sugestões e Feedbacks</Typography>
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
          {/* <StyledMenuItem>
            <ListItemIcon>
              <CasinoIcon />
            </ListItemIcon>
            <FormGroup>
              <FormControlLabel
                labelPlacement='end'
                control={
                  <Switch
                    checked={settings.enabled}
                    onChange={onToggle3DDice}
                    color='default'
                    value='3d-dice'
                  />
                }
                label='Dados 3D'
              />
            </FormGroup>
          </StyledMenuItem> */}
        </MenuList>

        {/* Footer spacing */}
        <Box sx={{ height: 20 }} />
      </StyledPaper>
    </Slide>
  );
};

export default SidebarV2;
