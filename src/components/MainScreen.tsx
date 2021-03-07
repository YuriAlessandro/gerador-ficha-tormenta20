import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Result from './Result';

import generateRandomSheet from '../functions/general';

const useStyles = makeStyles(() => ({
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
    marginBottom: '10px',
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
    },
  };

  // TODO: Create typing for chara sheet
  const [randomSheet, setRandomSheet] = React.useState<any>();

  const onClickGenerate = () => {
    const anotherRandomSheet = generateRandomSheet();
    setRandomSheet(anotherRandomSheet);
  };

  return (
    <div>
      <div style={{ margin: '20px', display: 'flex', flexWrap: 'wrap' }}>
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
