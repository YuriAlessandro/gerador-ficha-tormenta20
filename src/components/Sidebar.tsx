import React from 'react';
import Typography from '@material-ui/core/Typography';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import { withRouter, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Paper from '@material-ui/core/Paper';
import HomeIcon from '@material-ui/icons/Home';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import ForumIcon from '@material-ui/icons/Forum';
import CloseIcon from '@material-ui/icons/Close';
import CodeIcon from '@material-ui/icons/Code';
import NotesIcon from '@material-ui/icons/Notes';
import AttachMoney from '@material-ui/icons/AttachMoney';
import Slide from '@material-ui/core/Slide';
import { FormControlLabel, FormGroup, Switch } from '@material-ui/core';

import logo from '../assets/images/tormenta-logo-eye.png';
import '../assets/css/sidebar.css';

type SidebarProps = RouteComponentProps & {
  visible: boolean;
  onCloseSidebar: () => void;
  isDarkTheme: boolean;
  onChangeTheme: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onCloseSidebar,
  isDarkTheme,
  onChangeTheme,
}) => {
  const useStyles = makeStyles(() => ({
    link: {
      cursor: 'pointer',
      color: isDarkTheme ? '#fff' : '#757575',
    },
    paper: {
      position: 'fixed',
      zIndex: 1,
      height: '97.9vh',
      paddingTop: '20px',
      transition: 'visibility 0s, opacity 0.5s linear',
    },
    menuItem: {
      marginBottom: '10px',
    },
  }));

  const history = useHistory();

  const classes = useStyles();

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
      <Paper className={classes.paper}>
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
            <CloseIcon className={classes.link} onClick={onCloseSidebar} />
          </div>
        </div>
        <MenuList>
          <MenuItem onClick={onClickHome} className={classes.menuItem}>
            <ListItemIcon>
              <HomeIcon className={classes.link} />
            </ListItemIcon>
            <Typography variant='inherit'>Inicio</Typography>
          </MenuItem>
          <MenuItem onClick={onClickRewards} className={classes.menuItem}>
            <ListItemIcon>
              <AttachMoney className={classes.link} />
            </ListItemIcon>
            <Typography variant='inherit'>Recompensas</Typography>
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() =>
              onClickLinks(
                'https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              )
            }
          >
            <ListItemIcon>
              <ForumIcon className={classes.link} />
            </ListItemIcon>
            <Typography variant='inherit'>
              Sugestões, Ideias e Feedbacks
            </Typography>
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              onClickLinks(
                'https://github.com/YuriAlessandro/gerador-ficha-tormenta20#gerador-de-fichas-de-tormenta-20'
              );
            }}
          >
            <ListItemIcon>
              <CodeIcon className={classes.link} />
            </ListItemIcon>
            <Typography variant='inherit'>Contribua com o Projeto</Typography>
          </MenuItem>
          <MenuItem className={classes.menuItem} onClick={onClickChangelog}>
            <ListItemIcon>
              <NotesIcon className={classes.link} />
            </ListItemIcon>
            <Typography variant='inherit' className='specialMenu'>
              Changelog
            </Typography>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <Brightness4Icon className={classes.link} />
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
          </MenuItem>
        </MenuList>
      </Paper>
    </Slide>
  );
};

export default withRouter(Sidebar);
