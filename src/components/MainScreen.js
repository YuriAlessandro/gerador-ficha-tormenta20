import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Select from 'react-select';
import RACAS from '../utils/racas';
import CLASSES from '../utils/classes';

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
      minHeight: '36px',
      marginBottom: '10px',
    },
  };

  const [randomSheet, setRandomSheet] = React.useState();

  const onClickGenerate = () => {
    const anotherRandomSheet = generateRandomSheet();
    setRandomSheet(anotherRandomSheet);
  };

  const racas = RACAS.map((raca) => ({ value: raca.name, label: raca.name }));
  const classesopt = CLASSES.map((classe) => ({
    value: classe.name,
    label: classe.name,
  }));
  const niveis = [{ value: 1, label: 'Nível 1' }];

  return (
    <div>
      <div>
        <Select
          style={styles.select}
          options={[{ value: null, label: 'Todas as raças' }, ...racas]}
          placeholder='Selecione uma raça...'
        >
          <option>Todas as Raças</option>
        </Select>

        <Select
          style={styles.select}
          options={[{ value: null, label: 'Todas as classes' }, ...classesopt]}
          placeholder='Selecione uma classe...'
        >
          <option>Todas as Classes</option>
        </Select>

        <Select
          style={styles.select}
          options={niveis}
          isSearchable={false}
          value={niveis.filter((option) => option.value === 1)}
        >
          <option>Nível 1</option>
        </Select>

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
