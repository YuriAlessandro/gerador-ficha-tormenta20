import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Result from './Result';
import Sidebar from './Sidebar';

import generateRandomSheet from '../functions/general';

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
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
    marginBottom: '10px',
  },
  input: {
    color: 'rgb(209, 50, 53)',
  },
  formControl: {
    display: 'flex',
    margin: theme.spacing(1),
  },
}));

const MainScreen = () => {
  const classes = useStyles();

  const styles = {
    select: {
      marginRight: '10px',
      minWidth: '150px',
      minHeight: '36px',
      marginBottom: '10px',
    }
  }

  const [randomSheet, setRandomSheet] = React.useState();
  const [sidebarVisibility, setSidebarVisibility] = React.useState();

  React.useEffect(() => {
    setSidebarVisibility(false);
  }, []);

  const onClickGenerate = () => {
    const anotherRandomSheet = generateRandomSheet();
    setRandomSheet(anotherRandomSheet);
  };

  const onClickMenu = () => {
    setSidebarVisibility(true);
  };

  const onCloseSidebar = () => {
    setSidebarVisibility(false);
  }

  return (
    <div>
      <Sidebar visible={sidebarVisibility} onCloseSidebar={onCloseSidebar} />
      <AppBar position='static' className={classes.appbar}>
        <Toolbar>
          <IconButton onClick={onClickMenu} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' className={classes.title}>
            Gerador de Ficha - Tormenta 20
          </Typography>
        </Toolbar>
      </AppBar>

      <div style={{ margin: '20px', display: 'flex', flexWrap: 'wrap'}}>
        <select style={styles.select}>
          <option>Todas as Raças</option>
        </select>

        <select style={styles.select}>
          <option>Todas as Classes</option>
        </select>

        <select style={styles.select}>
          <option>Nível 1</option>
        </select>

        <Button
          variant='contained'
          onClick={onClickGenerate}
          className={classes.button}
        >
          Gerar Ficha
        </Button>
      </div>

      {randomSheet && <Result sheet={randomSheet} />}
    </div>
  );
};

export default MainScreen;
