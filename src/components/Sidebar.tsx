import React from 'react';
import Typography from '@mui/material/Typography';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import { withRouter, useHistory } from 'react-router-dom';
// import { makeStyles } from '@mui/material/styles';
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
import Slide from '@mui/material/Slide';
import { FormControlLabel, FormGroup, styled, Switch } from '@mui/material';

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
      <StyledPaper>
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
          <StyledMenuItem onClick={onClickRewards}>
            <ListItemIcon>
              <AttachMoney />
            </ListItemIcon>
            <Typography variant='inherit'>Recompensas</Typography>
          </StyledMenuItem>
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
