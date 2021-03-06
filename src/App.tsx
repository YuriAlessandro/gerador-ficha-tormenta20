import React, { useEffect } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { BrowserRouter as HashRouter, Switch, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Sidebar from './components/Sidebar';
import MainScreen from './components/MainScreen';
import Changelog from './components/Changelog';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0 30px',
  },
  appbar: {
    background: 'rgb(209, 50, 53)',
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

const lightTheme = {
  backgroundColor: '#f3f2f1',
};

const darkTheme = {
  backgroundColor: '#212121',
  color: '#FFF',
};

function App(): JSX.Element {
  const classes = useStyles();

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [cookies, setCookie, removeCookie] = useCookies();

  const onClickMenu = () => {
    setSidebarVisibility(true);
  };

  const onCloseSidebar = () => {
    setSidebarVisibility(false);
  };

  const onChangeTheme = () => {
    if (isDarkTheme) {
      removeCookie('dkmFdn');
    } else {
      setCookie('dkmFdn', !isDarkTheme);
    }

    setIsDarkTheme(!isDarkTheme);
  };

  useEffect(() => {
    const darkMod = cookies.dkmFdn;
    setIsDarkTheme(darkMod);
  }, []);

  return (
    <div
      className='App'
      data-testid='app-component'
      style={isDarkTheme ? darkTheme : lightTheme}
    >
      <HashRouter basename='/gerador-ficha-tormenta20/#'>
        <div className='mainApp'>
          <header className='App-header'>
            <Sidebar
              visible={sidebarVisibility}
              onCloseSidebar={onCloseSidebar}
              isDarkTheme={isDarkTheme}
              onChangeTheme={onChangeTheme}
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
                <MainScreen isDarkMode={isDarkTheme} />
              </Route>
            </Switch>
          </div>
        </div>
      </HashRouter>
      <footer id='bottom'>
        <div>
          <p>
            Tormenta 20 ?? um produto da Jamb?? Editora e seus respectivos
            criadores, todos os direitos reservados.
          </p>
          <p>
            <a href='https://jamboeditora.com.br/' target='blank'>
              https://jamboeditora.com.br/
            </a>
          </p>
          <p>Este ?? um projeto de f??s e n??o possui fins lucrativos</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
