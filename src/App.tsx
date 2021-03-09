import React, { useEffect } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { BrowserRouter as HashRouter, Switch, Route } from 'react-router-dom';
import ReactGA from 'react-ga';
import Sidebar from './components/Sidebar';
import MainScreen from './components/MainScreen';
import Changelog from './components/Changelog';
import Keys from './.config/keys';

ReactGA.initialize(Keys.TRACKING_ID);

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

  // Should trigger Google Analytics on page change
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  });

  return (
    <div className='App'>
      <header className='App-header'>
        <HashRouter basename='/gerador-ficha-tormenta20'>
          <div className='mainApp'>
            <Sidebar
              visible={sidebarVisibility}
              onCloseSidebar={onCloseSidebar}
            />
            <div className='mainArea'>
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
            </div>
          </div>
        </HashRouter>
      </header>
    </div>
  );
}

export default App;
