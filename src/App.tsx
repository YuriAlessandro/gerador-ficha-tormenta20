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

import { Provider } from 'react-redux';
import Sidebar from './components/Sidebar';
import MainScreen from './components/screens/MainScreen';
import Changelog from './components/screens/Changelog';
import Rewards from './components/screens/Rewards';
import SuperiorItems from './components/screens/SuperiorItems';
import LandingPage from './components/screens/LandingPage';
import Database from './components/screens/Database';
import CavernaDoSaber from './components/screens/CavernaDoSaber';
import SheetBuilderPage from './components/screens/SheetBuilderPage';
import store from './store';
import DiscordInvite from './components/DiscordInvite';
// import CreatureSheet from './components/screens/CreatureSheet';

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
  const [tabValue, setTabValue] = React.useState(-1);

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
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkTheme ? 'rgb(54 54 54)' : '#FFF',
            color: isDarkTheme ? '#FFF' : 'auto',
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkTheme ? 'rgb(54 54 54)' : '#FFF',
            color: isDarkTheme ? '#FFF' : 'auto',
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkTheme ? 'rgb(54 54 54)' : '#FFF',
            color: isDarkTheme ? '#FFF' : 'auto',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkTheme ? 'rgb(54 54 54)' : '#FFF',
            color: isDarkTheme ? '#FFF' : 'auto',
            '&:hover': {
              color: '#d13235',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: isDarkTheme ? '#FFF' : 'auto',
          },
        },
      },
    },
  });

  const handleChangeTabValue = (pathname: string) => {
    const pathnamesTabValues = {
      none: -1,
      'ficha-aleatoria': 0,
      recompensas: 1,
      'itens-superiores': 2,
      'itens-magicos': 3,
      database: 4,
      'caverna-do-saber': 5,
      changelog: 6,
      'sheet-builder': 7,
    } as const;

    const currentPath = (Object.keys(pathnamesTabValues).find((path) =>
      pathname?.includes(path)
    ) || 'none') as string;
    const currentTabValue =
      pathnamesTabValues[currentPath as keyof typeof pathnamesTabValues];
    setTabValue(currentTabValue);
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
      <Provider store={store}>
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
                  <Typography
                    sx={{ cursor: 'pointer', fontFamily: 'Tfont' }}
                    variant='h6'
                    onClick={() => onClickTab(-1, '')}
                  >
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
                    <Tab
                      label='Fichas'
                      onClick={() => onClickTab(0, 'ficha-aleatoria')}
                    />
                    <Tab
                      label='Recompensas'
                      onClick={() => onClickTab(1, 'recompensas')}
                    />
                    <Tab
                      label='Itens Superiores'
                      onClick={() => onClickTab(2, 'itens-superiores')}
                    />
                    <Tab
                      label='Itens Mágicos'
                      disabled
                      onClick={() => onClickTab(3, 'itens-magicos')}
                    />
                    <Tab
                      label='Database'
                      onClick={() => onClickTab(4, 'database/raças')}
                    />
                    <Tab
                      label='Caverna do Saber'
                      onClick={() => onClickTab(5, 'caverna-do-saber')}
                    />
                    <Tab
                      label='Changelog'
                      onClick={() => onClickTab(6, 'changelog')}
                    />
                    {/* <Tab
                      label='Construir ficha manualmente'
                      onClick={() => onClickTab(7, 'sheet-builder')}
                    /> */}
                  </Tabs>
                  <FormGroup sx={{ ml: ['15px', 0, 0] }}>
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
            <DiscordInvite />
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
                <Route path='/ficha-aleatoria'>
                  <MainScreen isDarkMode={isDarkTheme} />
                </Route>
                <Route path='/database'>
                  <Database isDarkMode={isDarkTheme} />
                </Route>
                <Route path='/caverna-do-saber'>
                  <CavernaDoSaber />
                </Route>
                <Route path='/sheet-builder'>
                  <SheetBuilderPage />
                </Route>
                {/* <Route path='/ficha-criatura'>
                <CreatureSheet isDarkMode={isDarkTheme} />
              </Route> */}
                <Route>
                  <LandingPage onClickButton={onClickTab} />
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
      </Provider>
    </ThemeProvider>
  );
}

export default App;
