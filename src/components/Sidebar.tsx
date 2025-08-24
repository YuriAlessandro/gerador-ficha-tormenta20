import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import { withRouter, useHistory } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/Home';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ForumIcon from '@mui/icons-material/Forum';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import NotesIcon from '@mui/icons-material/Notes';
import AttachMoney from '@mui/icons-material/AttachMoney';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StorageIcon from '@mui/icons-material/Storage';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LinkIcon from '@mui/icons-material/Link';
import MapIcon from '@mui/icons-material/Map';
import SecurityIcon from '@mui/icons-material/Security';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Slide from '@mui/material/Slide';
import {
  Divider,
  FormControlLabel,
  FormGroup,
  styled,
  Switch,
} from '@mui/material';
import { Book } from '@mui/icons-material';

import logo from '../assets/images/tormenta-logo-eye.png';
import '../assets/css/sidebar.css';

type SidebarProps = RouteComponentProps & {
  visible: boolean;
  onCloseSidebar: () => void;
  isDarkTheme: boolean;
  onChangeTheme: () => void;
};

const StyledPaper = styled(Paper)`
  position: fixed;
  z-index: 1;
  height: 97.9vh;
  padding-top: 20px;
  transition: visibility 0s, opacity 0.5s linear;
`;

const StyledMenuItem = styled(MenuItem)`
  margin-bottom: 10px;
`;

const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onCloseSidebar,
  isDarkTheme,
  onChangeTheme,
}) => {
  const history = useHistory();

  // Disable/enable page scroll when sidebar is open/closed
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  const onClickHome = () => {
    history.push('/');
    onCloseSidebar();
  };

  const onClickRewards = () => {
    history.push('/recompensas');
    onCloseSidebar();
  };

  const onClickChangelog = () => {
    history.push('/changelog');
    onCloseSidebar();
  };

  const onClickLinks = (url: string) => {
    window.open(url, '_blank');
  };

  const handleEscKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCloseSidebar();
    }
  };

  const onClickSheets = () => {
    history.push('/ficha-aleatoria');
    onCloseSidebar();
  };

  const onClickItems = () => {
    history.push('/itens-superiores');
    onCloseSidebar();
  };

  const onClickMagicalItems = () => {
    history.push('/itens-magicos');
    onCloseSidebar();
  };

  const onClickDatabase = () => {
    history.push('/database');
    onCloseSidebar();
  };

  const onClickRevista = () => {
    history.push('/caverna-do-saber');
    onCloseSidebar();
  };

  const onClickThreatGenerator = () => {
    history.push('/gerador-ameacas');
    onCloseSidebar();
  };

  const onClickMap = () => {
    window.open('https://mapadearton.fichasdenimb.com.br/', '_blank');
  };

  document.addEventListener('keydown', handleEscKeyPress, false);

  return (
    <Slide
      direction='right'
      in={visible}
      style={{
        background: isDarkTheme ? '#3b3b3b' : 'white',
        color: isDarkTheme ? '#fff' : 'black',
      }}
    >
      <StyledPaper sx={{ overflowY: 'auto', zIndex: 3 }}>
        <div className='sidebarHeader'>
          <Link
            href='https://jamboeditora.com.br/categoria/rpg/tormenta20-rpg/'
            target='blank'
          >
            <img src={String(logo)} alt='Logo' className='logo' />
          </Link>
          <div
            style={{
              textAlign: 'right',
              paddingRight: '15px',
            }}
          >
            <CloseIcon onClick={onCloseSidebar} />
          </div>
        </div>
        <MenuList>
          <StyledMenuItem onClick={onClickHome}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Inicio</Typography>
          </StyledMenuItem>
          <Divider />
          <StyledMenuItem onClick={onClickSheets}>
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Ficha Aleatória</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickMap}>
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Mapa Interativo</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickThreatGenerator}>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Gerador de Ameaças</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickRevista}>
            <ListItemIcon>
              <Book />
            </ListItemIcon>
            <Typography variant='inherit'>Caverna do Saber</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickDatabase}>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Enciclopédia de Tanah-Toh</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickRewards}>
            <ListItemIcon>
              <AttachMoney />
            </ListItemIcon>
            <Typography variant='inherit'>Rolador de Recompensas</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickItems}>
            <ListItemIcon>
              <ArchitectureIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Criar Item Superior</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickMagicalItems}>
            <ListItemIcon>
              <AutoFixHighIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Criar Item Mágico</Typography>
          </StyledMenuItem>
          <Divider />
          <StyledMenuItem
            onClick={() =>
              onClickLinks(
                'https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              )
            }
          >
            <ListItemIcon>
              <ForumIcon />
            </ListItemIcon>
            <Typography variant='inherit'>
              Sugestões, Ideias e Feedbacks
            </Typography>
          </StyledMenuItem>
          <StyledMenuItem
            onClick={() => {
              onClickLinks(
                'https://github.com/YuriAlessandro/gerador-ficha-tormenta20#gerador-de-fichas-de-tormenta-20'
              );
            }}
          >
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Contribua com o Projeto</Typography>
          </StyledMenuItem>
          <StyledMenuItem onClick={onClickChangelog}>
            <ListItemIcon>
              <NotesIcon />
            </ListItemIcon>
            <Typography variant='inherit' className='specialMenu'>
              Changelog
            </Typography>
          </StyledMenuItem>
          <Divider />
          {/* <StyledMenuItem
            onClick={() => {
              onClickLinks('https://ameacas-t20.herokuapp.com/');
            }}
          >
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Gerador de Ameaças</Typography>
          </StyledMenuItem> */}
          <StyledMenuItem
            onClick={() => {
              onClickLinks('https://eduardomarques.pythonanywhere.com/');
            }}
          >
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Grimório T20</Typography>
          </StyledMenuItem>
          <StyledMenuItem
            onClick={() => {
              onClickLinks('https://mclemente.github.io/Calculadora-ND/');
            }}
          >
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <Typography variant='inherit'>Calculadora ND</Typography>
          </StyledMenuItem>
          <Divider />
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
      </StyledPaper>
    </Slide>
  );
};

export default withRouter(Sidebar);
