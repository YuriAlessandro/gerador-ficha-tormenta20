import React, { useEffect } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route, useHistory } from 'react-router-dom';
import {
  FormControlLabel,
  FormGroup,
  Switch as SwitchMUI,
} from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Sidebar from './components/Sidebar';
import MainScreen from './components/screens/MainScreen';
import Changelog from './components/screens/Changelog';
import Rewards from './components/screens/Rewards';
import SuperiorItems from './components/screens/SuperiorItems';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0 30px',
  },
  appbar: {
    background: 'rgb(209, 50, 53)',
  },
  title: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
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

  const ls = localStorage;
  const history = useHistory();

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  const handleChangeTabValue = (pathname: string) => {
    if (pathname === '/') setTabValue(0);
    if (pathname === '/recompensas') setTabValue(1);
    if (pathname === '/itens-superiores') setTabValue(2);
    if (pathname === '/changelog') setTabValue(4);
  };

  history.listen((location) => {
    const { pathname } = location;
    handleChangeTabValue(pathname);
  });

  useEffect(() => {
    const pathname = window.location.href.split('#')[1];
    handleChangeTabValue(pathname);
  }, []);

  const onClickMenu = () => {
    setSidebarVisibility(true);
  };

  const onCloseSidebar = () => {
    setSidebarVisibility(false);
  };

  const onChangeTheme = () => {
    if (isDarkTheme) {
      ls.removeItem('dkmFdn');
    } else {
      ls.setItem('dkmFdn', `${!isDarkTheme}`);
    }

    setIsDarkTheme(!isDarkTheme);
  };

  useEffect(() => {
    const darkMod = ls.getItem('dkmFdn') === 'true';
    setIsDarkTheme(darkMod);
  }, []);

  const handleTabChange = (_event: unknown, newValue: number) => {
    setTabValue(newValue);
  };

  const onClickTab = (tab: number, link: string) => {
    setTabValue(tab);
    history.push(`/${link}`);
  };

  return (
    <div
      className='App'
      data-testid='app-component'
      style={isDarkTheme ? darkTheme : lightTheme}
    >
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
                <p>Fichas de Nimb</p>
              </Typography>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label='Menu superior'
                style={{ flexGrow: 1 }}
                variant='scrollable'
                className='topTabs'
              >
                <Tab label='Fichas' onClick={() => onClickTab(0, '')} />
                <Tab
                  label='Recompensas'
                  onClick={() => onClickTab(1, 'recompensas')}
                />
                <Tab
                  label='Itens Superiores'
                  onClick={() => onClickTab(2, 'itens-superiores')}
                />
                <Tab label='Itens Mágicos' disabled />
                <Tab
                  label='Changelog'
                  onClick={() => onClickTab(4, 'changelog')}
                />
              </Tabs>
              <FormGroup>
                <FormControlLabel
                  labelPlacement='end'
                  control={
                    <SwitchMUI
                      checked={isDarkTheme}
                      onChange={onChangeTheme}
                      color='default'
                      value='dark'
                    />
                  }
                  label='Tema Escuro'
                />
              </FormGroup>
            </Toolbar>
          </AppBar>
        </header>
        <div className='mainArea'>
          <Switch>
            <Route path='/changelog'>
              <Changelog />
            </Route>
            <Route path='/recompensas'>
              <Rewards isDarkMode={isDarkTheme} />
            </Route>
            <Route path='/itens-superiores'>
              <SuperiorItems isDarkMode={isDarkTheme} />
            </Route>
            <Route>
              <MainScreen isDarkMode={isDarkTheme} />
            </Route>
          </Switch>
        </div>
      </div>
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
