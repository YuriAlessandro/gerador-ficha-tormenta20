import React from 'react';
import './App.css';

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
    flexGrow: 1,
  },
  input: {
    color: 'rgb(209, 50, 53)',
  },
  formControl: {
    display: 'flex',
    margin: theme.spacing(1),
  },
  menuButton: {},
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
    <div className='App'>
      <header className='App-header'>
        <HashRouter basename='/gerador-ficha-tormenta20/'>
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
                Gerador de Ficha - Tormenta 20
              </Typography>
            </Toolbar>
          </AppBar>

          <Switch>
            <Route path='/changelog'>
              <Changelog />
            </Route>
            <Route path='/'>
              <MainScreen />
            </Route>
          </Switch>
        </HashRouter>
      </header>
    </div>
  );
}

export default App;
