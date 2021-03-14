import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Select from 'react-select';
import Fade from '@material-ui/core/Fade';
import RACAS from '../data/racas';
import CLASSES from '../data/classes';
import SelectOptions from '../interfaces/SelectedOptions';
import Result from './Result';

import generateRandomSheet from '../functions/general';
import CharacterSheet from '../interfaces/CharacterSheet';

import '../assets/css/mainScreen.css';

const useStyles = makeStyles(() => ({
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
    marginBottom: '10px',
  },
}));

type SelectedOption = { value: string; label: string };

const MainScreen: React.FC = () => {
  const classes = useStyles();

  const [selectedOptions, setSelectedOptions] = React.useState<SelectOptions>({
    nivel: 1,
    classe: '',
    raca: '',
  });

  const [randomSheet, setRandomSheet] = React.useState<CharacterSheet>();
  const [showPresentation, setShowPresentation] = React.useState(true);

  const onClickGenerate = () => {
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    setShowPresentation(false);
    const anotherRandomSheet = generateRandomSheet(selectedOptions);
    setRandomSheet(anotherRandomSheet);
  };

  const onSelectRaca = (raca: SelectedOption | null) => {
    setSelectedOptions({ ...selectedOptions, raca: raca?.value ?? '' });
  };

  const onSelectClasse = (classe: SelectedOption | null) => {
    setSelectedOptions({ ...selectedOptions, classe: classe?.value ?? '' });
  };

  const racas = RACAS.map((raca) => ({ value: raca.name, label: raca.name }));
  const classesopt = CLASSES.map((classe) => ({
    value: classe.name,
    label: classe.name,
  }));
  const niveis = [{ value: 1, label: 'Nível 1' }];

  return (
    <div id='main-screen'>
      <div className='filterArea'>
        <Select
          className='filterSelect'
          options={[{ value: '', label: 'Todas as raças' }, ...racas]}
          placeholder='Todas as raças'
          onChange={onSelectRaca}
        />

        <Select
          className='filterSelect'
          options={[{ value: '', label: 'Todas as classes' }, ...classesopt]}
          placeholder='Todas as classes'
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

      <Fade in={showPresentation}>
        <div id='presentation'>
          <p className='deskOnly'>
            “Khalmyr tem o tabuleiro, mas quem move as peças é Nimb”. Deixe que
            Nimb toque o seu destino de jogo com o Fichas de Nimb.
          </p>
          <p>
            <strong>Fichas de Nimb</strong> é um gerador de fichas aleátorios
            para o sistema Tormenta 20. Com ele, é possível gerar fichas de
            raças e classes aleatórias, e ter sua ficha montada
            instanteneamente. Todos as características de uma ficha de Tormenta
            20 serão gerados aleatoriamente: atributos, perícias, origem,
            divindades, magias, etc. Tudo respeitando as regras oficiais do
            jogo.
          </p>
          <p className='deskOnly'>
            Fichas de Nimb é uma ótima pedida para jogadores que queiram
            experimentar um pouco de aleatoriedade ou não gastar muito tempo
            criando a ficha, e principalmente para mestres que queriam gerar
            seus NPCs de forma rápida e indolor.
          </p>
          <p className='deskOnly'>
            Para isso, adicionamos também a opção de filtro de raça, classe e
            nivel, para que o mestre possa gerar NPCs conforme a narrativa
            requisite.
          </p>
        </div>
      </Fade>

      {randomSheet && <Result sheet={randomSheet} />}
    </div>
  );
};

export default MainScreen;
