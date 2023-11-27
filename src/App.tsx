import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import {
  Box,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch as SwitchMUI,
  useMediaQuery,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AttackResult, CharacterAttack } from 't20-sheet-builder';
import { SkillRollResult } from 't20-sheet-builder/build/domain/entities/Skill/SheetSkill';
import AttackRollResult from './components/SheetBuilder/common/AttackRollResult';
import DiceRollResult from './components/SheetBuilder/common/DiceRollResult';
import Sidebar from './components/Sidebar';
import CavernaDoSaber from './components/screens/CavernaDoSaber';
import Changelog from './components/screens/Changelog';
import Database from './components/screens/Database';
import LandingPage from './components/screens/LandingPage';
import MainScreen from './components/screens/MainScreen';
import Rewards from './components/screens/Rewards';
import SheetBuilderPage from './components/screens/SheetBuilderPage';
import SheetList from './components/screens/SheetList';
import SuperiorItems from './components/screens/SuperiorItems';
import store, { persistor } from './store';
import AttributeRollResult from './components/SheetBuilder/common/AttributeRollResult';
import DiscordInvite from './components/DiscordInvite';
// import CreatureSheet from './components/screens/CreatureSheet';

declare module 'notistack' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface VariantOverrides {
    diceRoll: {
      roll: SkillRollResult;
    };
    attackRoll: {
      attackResult: AttackResult;
      attack: CharacterAttack;
    };
    attributeRoll: {
      rollResult: number;
      bonus: number;
    };
  }
}

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

  const isMb = useMediaQuery('(max-width:600px)');

  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : 'light',
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

  const onClickMenu = () => {
    setSidebarVisibility(!sidebarVisibility);
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

  const onClickToLink = (link: string) => {
    // Smooth scroll page to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.push(`/${link}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        autoHideDuration={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        Components={{
          diceRoll: DiceRollResult,
          attackRoll: AttackRollResult,
          attributeRoll: AttributeRollResult,
        }}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <div
              className='App'
              data-testid='app-component'
              style={isDarkTheme ? darkTheme : lightTheme}
            >
              <DiscordInvite />
              <div className='mainApp'>
                <header className='App-header'>
                  <Sidebar
                    visible={sidebarVisibility}
                    onCloseSidebar={onCloseSidebar}
                    isDarkTheme={isDarkTheme}
                    onChangeTheme={onChangeTheme}
                  />
                  <Stack
                    alignItems='center'
                    sx={{ width: '100%', position: 'absolute' }}
                  >
                    <Box
                      sx={{
                        width: isMb ? '90%' : '50%',
                        m: 2,
                        p: 2,
                        backgroundColor: '#d13235',
                        borderRadius: '0.75rem',
                        color: '#FFFFFF',
                        zIndex: 2,
                      }}
                    >
                      <Stack
                        width='100%'
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                      >
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
                          onClick={() => onClickToLink('')}
                        >
                          Fichas de Nimb
                        </Typography>

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
                      </Stack>
                    </Box>
                  </Stack>
                </header>
                <Box className='mainArea' sx={{ mt: 15 }}>
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
                    <Route path='/sheets'>
                      <SheetList />
                    </Route>
                    <Route path='/sheet-builder/:id'>
                      <SheetBuilderPage />
                    </Route>
                    {/* <Route path='/ficha-criatura'>
                <CreatureSheet isDarkMode={isDarkTheme} />
              </Route> */}
                    <Route>
                      <LandingPage onClickButton={onClickToLink} />
                    </Route>
                  </Switch>
                </Box>
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
          </PersistGate>
        </Provider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
