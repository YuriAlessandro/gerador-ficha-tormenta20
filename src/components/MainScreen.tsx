import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Select from 'react-select';
import Fade from '@material-ui/core/Fade';
import { Link } from 'react-router-dom';
import { formatGroupLabel } from 'react-select/src/builtins';
import RACAS from '../data/racas';
import CLASSES from '../data/classes';
import SelectOptions from '../interfaces/SelectedOptions';
import Result from './Result';

import generateRandomSheet from '../functions/general';
import CharacterSheet from '../interfaces/CharacterSheet';

import '../assets/css/mainScreen.css';
import getSelectTheme from '../functions/style';
import roles from '../data/roles';

const useStyles = makeStyles(() => ({
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
    marginBottom: '10px',
  },
}));

type SelectedOption = { value: string; label: string };

type MainScreenProps = {
  isDarkMode: boolean;
};

const MainScreen: React.FC<MainScreenProps> = ({ isDarkMode }) => {
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
  const rolesopt = Object.keys(roles).map((role) => ({
    value: role,
    label: role,
  }));

  const classesopt = CLASSES.map((classe) => ({
    value: classe.name,
    label: classe.name,
  }));
  const niveis = [{ value: 1, label: 'N??vel 1' }];

  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  const fmtGroupLabel: formatGroupLabel = (data) => (
    <div>
      <span>{data.label}</span>
    </div>
  );

  return (
    <div id='main-screen'>
      <div className='filterArea'>
        <Select
          className='filterSelect'
          options={[{ value: '', label: 'Todas as ra??as' }, ...racas]}
          placeholder='Todas as ra??as'
          onChange={onSelectRaca}
          style={{ background: 'blue' }}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        <Select
          className='filterSelect'
          options={[
            {
              label: 'Classes',
              options: [
                { value: '', label: 'Todas as Classes' },
                ...classesopt,
              ],
            },
            {
              label: 'Roles',
              options: [{ value: '', label: 'Todas as Roles' }, ...rolesopt],
            },
          ]}
          placeholder='Todas as Classes e Roles'
          formatGroupLabel={fmtGroupLabel}
          onChange={onSelectClasse}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        <Select
          className='filterSelect'
          options={niveis}
          isSearchable={false}
          value={niveis.filter((option) => option.value === 1)}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
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
          <p>
            <u>???Khalmyr tem o tabuleiro, mas quem move as pe??as ?? Nimb???</u>.
            Deixe que Nimb decida o seu personagem.
          </p>
          <p>
            <strong>Fichas de Nimb</strong> ?? um gerador de fichas ale??torias
            para o sistema Tormenta 20. Com ele, ?? poss??vel gerar fichas de
            ra??as e classes aleat??rias, e ter sua ficha montada
            instanteneamente. Todos as caracter??sticas de uma ficha de Tormenta
            20 ser??o gerados: atributos, per??cias, origem, divindades, magias,
            etc. Tudo respeitando as regras oficiais do jogo.
          </p>
          <p>
            Esse gerador ?? uma ??tima pedida para jogadores que queiram
            experimentar um pouco de aleatoriedade ou n??o gastar muito tempo
            criando a ficha, e principalmente para mestres que queriam gerar
            seus NPCs de forma r??pida e pr??tica.
          </p>
          <p>
            Para isso, adicionamos tamb??m a op????o de filtro de ra??a, classe e
            nivel, para que o mestre possa gerar NPCs conforme a narrativa
            requisite.
          </p>
          <p>
            Voc?? pode ver as ??ltimas altera????es e o que planejamos para o futuro
            no <Link to='/changelog'>changelog</Link>.
          </p>

          <p>
            Se voc?? encontrou algum problema, tem alguma sugest??o ou quer
            discutir e entender como ?? o funcionamento do Fichas de Nimb,{' '}
            <a
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              target='blank'
            >
              clique aqui.
            </a>
          </p>

          <p>
            Se voc?? ?? um desenvolvedor que queira contribuir com o projeto,
            utilize o nosso{' '}
            <a
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              target='blank'
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </Fade>

      {randomSheet && <Result sheet={randomSheet} isDarkMode={isDarkMode} />}
    </div>
  );
};

export default MainScreen;
