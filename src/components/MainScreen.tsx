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

type SelectOptions = { nivel: number; raca: string; classe: string };

const MainScreen = () => {
  const classes = useStyles();

  // TODO: Create typing for chara sheet
  const [randomSheet, setRandomSheet] = React.useState<any>();
  const [selectedOptions, setSelectedOptions] = React.useState<SelectOptions>();

  const onClickGenerate = () => {
    const anotherRandomSheet = generateRandomSheet();
    setRandomSheet(anotherRandomSheet);
  };

  const onSelectRaca = (raca: any) => {
    setSelectedOptions({ raca: raca.value } as any);
  };

  const onSelectClasse = (classe: any) => {
    setSelectedOptions({ classe: classe.value } as any);
  };

  const racas = RACAS.map((raca) => ({ value: raca.name, label: raca.name }));
  const classesopt = CLASSES.map((classe) => ({
    value: classe.name,
    label: classe.name,
  }));
  const niveis = [{ value: 1, label: 'Nível 1' }];

  return (
    <div>
      <div className='filterArea'>
        <Select
          className='filterSelect'
          options={[{ value: null, label: 'Todas as raças' }, ...racas]}
          placeholder='Selecione uma raça...'
          onChange={onSelectRaca}
        />

        <Select
          className='filterSelect'
          options={[{ value: null, label: 'Todas as classes' }, ...classesopt]}
          placeholder='Selecione uma classe...'
          onChange={onSelectClasse}
        />

        <Select
          className='filterSelect'
          options={niveis}
          isSearchable={false}
          value={niveis.filter((option) => option.value === 1)}
        />

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
