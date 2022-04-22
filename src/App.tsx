import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';

import {
  FormControlLabel,
  FormGroup,
  Switch as SwitchMUI,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuIcon from '@mui/icons-material/Menu';

import Sidebar from './components/Sidebar';
import MainScreen from './components/MainScreen';
import Changelog from './components/Changelog';
import Rewards from './components/Rewards';

const lightTheme = {
  backgroundColor: '#f3f2f1',
};

const darkTheme = {
  backgroundColor: '#212121',
  color: '#FFF',
};

function App(): JSX.Element {
  const ls = localStorage;
  const history = useHistory();

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#d13235',
        dark: '#922325',
        light: '#da5b5d',
      },
    },
    components: {
      MuiRadio: {
        styleOverrides: {
          root: {
            color: isDarkTheme ? '#d13235' : '#616160',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: '#FAFAFA',
            },
            '&.Mui-focusVisible': {
              background: '#FAFAFA',
            },
          },
        },
      },
    },
  });

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
    <ThemeProvider theme={theme}>
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
            <AppBar position='static'>
              <Toolbar>
                <IconButton
                  onClick={onClickMenu}
                  edge='start'
                  color='inherit'
                  aria-label='menu'
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant='h6'>
                  <p>Fichas de Nimb</p>
                </Typography>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label='Menu superior'
                  sx={{ display: 'flex', flexGrow: 1 }}
                  variant='scrollable'
                  scrollButtons
                  className='topTabs'
                >
                  <Tab label='Fichas' onClick={() => onClickTab(0, '')} />
                  <Tab
                    label='Recompensas'
                    onClick={() => onClickTab(1, 'recompensas')}
                  />
                  <Tab
                    label='Itens Superiores'
                    // onClick={() => onClickTab(2, 'itens-superiores')}
                    disabled
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
    </ThemeProvider>
  );
}

export default App;
