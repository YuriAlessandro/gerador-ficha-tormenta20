import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { BrowserRouter as HashRouter, Switch, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainScreen from './components/MainScreen';
import Changelog from './components/Changelog';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0 30px',
  },
  appbar: {
    background: 'rgb(209, 50, 53);',
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    color: 'rgb(209, 50, 53)',
  },
  formControl: {
    display: 'flex',
    margin: theme.spacing(1),
  },
  menuButton: {},
  bottom: {
    bottom: 0,
  },
}));

function App(): JSX.Element {
  const classes = useStyles();

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);

  const onClickMenu = () => {
    setSidebarVisibility(true);
  };

  const onCloseSidebar = () => {
    setSidebarVisibility(false);
  };

  return (
    <div className='App' data-testid='app-component'>
      <HashRouter basename='/gerador-ficha-tormenta20/#'>
        <div className='mainApp'>
          <header className='App-header'>
            <Sidebar
              visible={sidebarVisibility}
              onCloseSidebar={onCloseSidebar}
            />
            <AppBar position='static' className={classes.appbar}>
              <Toolbar>
                <IconButton
                  onClick={onClickMenu}
                  edge='start'
                  className={classes.menuButton}
                  color='inherit'
                  aria-label='menu'
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant='h6' className={classes.title}>
                  Fichas de Nimb
                </Typography>
              </Toolbar>
            </AppBar>
          </header>
          <div className='mainArea'>
            <Switch>
              <Route path='/changelog'>
                <Changelog />
              </Route>
              <Route>
                <MainScreen />
              </Route>
            </Switch>
          </div>
        </div>
      </HashRouter>
      <footer id='bottom'>
        <div>
          <p>
            Tormenta 20 é um produto da Jambô Editora e seus respectivos
            criadores, todos os direitos reservados.
          </p>
          <p>
            <a href='https://jamboeditora.com.br/' target='blank'>
              https://jamboeditora.com.br/
            </a>
          </p>
          <p>Este é um projeto de fãs e não possui fins lucrativos</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
