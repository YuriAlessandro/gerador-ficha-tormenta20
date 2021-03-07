import React from 'react';

import Typography from '@material-ui/core/Typography';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import { withRouter, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router';

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
      style={{
        position: 'absolute',
        background: 'rgba(0,0,0,0.95)',
        top: '0',
        width: '300px',
        height: '97.9vh',
        zIndex: 1,
        boxShadow: '5px 0px 5px 0px rgba(0,0,0,0.75)',
        color: '#FAFAFA',
        display: visible ? 'block' : 'none',
        paddingTop: '20px',
        transition: 'width 20s',
      }}
    >
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
