import React from 'react';

import Typography from '@material-ui/core/Typography';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import { withRouter, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router';

import logo from '../assets/images/tormenta-logo-eye.png';

const useStyles = makeStyles(() => ({
  link: {
    color: '#FAFAFA',
  },
}));

type SidebarProps = RouteComponentProps & {
  visible: boolean;
  onCloseSidebar: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ visible, onCloseSidebar }) => {
  const history = useHistory();

  const classes = useStyles();

  const onClickHome = () => {
    history.push('/');
    onCloseSidebar();
  };

  const onClickChangelog = () => {
    history.push('/changelog');
    onCloseSidebar();
  };

  return (
    <div
      className='sidebar'
      style={{
        display: visible ? 'block' : 'none',
      }}
    >
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
          <Typography
            style={{ cursor: 'pointer' }}
            onClick={onCloseSidebar}
            variant='inherit'
          >
            X
          </Typography>
        </div>
      </div>
      <MenuList>
        <MenuItem>
          <Typography
            variant='inherit'
            onClick={onClickHome}
            className='specialMenu'
          >
            Inicio
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant='inherit'>
            <Link
              className={classes.link}
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/new'
              target='blank'
            >
              Sugestões, Ideias e Feedbacks
            </Link>
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant='inherit'>
            <Link
              className={classes.link}
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20'
              target='blank'
            >
              Contribua com o Projeto
            </Link>
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography
            variant='inherit'
            onClick={onClickChangelog}
            className='specialMenu'
          >
            Changelog
          </Typography>
        </MenuItem>
      </MenuList>
    </div>
  );
};

export default withRouter(Sidebar);
