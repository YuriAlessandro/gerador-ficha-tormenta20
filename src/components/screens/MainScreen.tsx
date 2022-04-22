import React from 'react';

// import { makeStyles } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Select from 'react-select';
import Fade from '@mui/material/Fade';
import { Link } from 'react-router-dom';
import { formatGroupLabel } from 'react-select/src/builtins';
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel } from '@mui/material';
import CreatableSelect from 'react-select/creatable';
import RACAS from '../../data/racas';
import CLASSES from '../../data/classes';
import SelectOptions from '../../interfaces/SelectedOptions';
import Result from '../Result';

import generateRandomSheet from '../../functions/general';
import CharacterSheet from '../../interfaces/CharacterSheet';

import '../../assets/css/mainScreen.css';
import getSelectTheme from '../../functions/style';
import roles from '../../data/roles';
import { HistoricI } from '../../interfaces/Historic';
import Historic from './Historic';
import { ORIGINS } from '../../data/origins';
import { allDivindadeNames } from '../../interfaces/Divindade';
import SimpleResult from '../SimpleResult';

// const useStyles = makeStyles(() => ({
//   button: {
//     background: 'rgb(209, 50, 53);',
//     color: '#FAFAFA',
//     marginBottom: '10px',
//   },
// }));

type SelectedOption = { value: string; label: string };

type MainScreenProps = {
  isDarkMode: boolean;
};

const saveSheetOnHistoric = (sheet: CharacterSheet) => {
  const ls = localStorage;
  const lsHistoric = ls.getItem('fdnHistoric');
  const historic: HistoricI[] = lsHistoric ? JSON.parse(lsHistoric) : [];

  if (historic.length === 100) historic.shift();

  historic.push({
    sheet,
    date: new Date().toLocaleDateString('pt-BR'),
    id: sheet.id,
  });

  ls.setItem('fdnHistoric', JSON.stringify(historic));
};

const MainScreen: React.FC<MainScreenProps> = ({ isDarkMode }) => {
  const [selectedOptions, setSelectedOptions] = React.useState<SelectOptions>({
    nivel: 1,
    classe: '',
    raca: '',
    origin: '',
    devocao: { label: 'Aleatória', value: '' },
  });

  const [simpleSheet, setSimpleSheet] = React.useState(false);

  const [randomSheet, setRandomSheet] = React.useState<CharacterSheet>();
  const [showPresentation, setShowPresentation] = React.useState(true);
  const [showHistoric, setShowHistoric] = React.useState(false);

  const onClickGenerate = () => {
    setShowHistoric(false);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    setShowPresentation(false);
    const anotherRandomSheet = generateRandomSheet(selectedOptions);
    saveSheetOnHistoric(anotherRandomSheet);
    setRandomSheet(anotherRandomSheet);
  };

  const onClickSeeSheet = (sheet: CharacterSheet) => {
    setShowHistoric(false);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    setShowPresentation(false);
    setRandomSheet(sheet);
  };

  const onClickShowHistoric = () => {
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    setShowPresentation(false);
    setShowHistoric(true);
  };

  const onSelectRaca = (raca: SelectedOption | null) => {
    setSelectedOptions({ ...selectedOptions, raca: raca?.value ?? '' });
  };

  const onSelectClasse = (classe: SelectedOption | null) => {
    setSelectedOptions({
      ...selectedOptions,
      classe: classe?.value ?? '',
      devocao: { label: 'Padrão', value: '' },
    });
  };

  const onSelectOrigin = (origin: SelectedOption | null) => {
    setSelectedOptions({ ...selectedOptions, origin: origin?.value ?? '' });
  };

  const inSelectDivindade = (divindade: SelectedOption | null) => {
    setSelectedOptions({
      ...selectedOptions,
      devocao: divindade ?? { label: 'Todas as Divindades', value: '**' },
    });
  };

  const onSelectNivel = (nivel: SelectedOption | null) => {
    if (nivel) {
      const selectedNivel = parseInt(nivel.value, 10);
      setSelectedOptions({ ...selectedOptions, nivel: selectedNivel });
    }
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

  const niveis: { value: string; label: string }[] = [];

  for (let index = 1; index < 21; index += 1) {
    niveis.push({
      value: index as unknown as string,
      label: `Nível ${index}`,
    });
  }

  const origens = Object.keys(ORIGINS).map((origin) => ({
    value: origin,
    label: origin,
  }));

  const divindades = allDivindadeNames
    .filter((dv) => {
      if (selectedOptions.classe) {
        const classe = CLASSES.find((c) => c.name === selectedOptions.classe);
        if (classe) return classe?.faithProbability?.[dv] !== 0;
        return true;
      }

      return true;
    })
    .map((sdv) => ({
      value: sdv,
      label: sdv.charAt(0).toUpperCase() + sdv.slice(1).toLowerCase(),
    }));

  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  const fmtGroupLabel: formatGroupLabel = (data) => (
    <div>
      <span>{data.label}</span>
    </div>
  );

  const sheetComponent =
    randomSheet &&
    (simpleSheet ? (
      <SimpleResult isDarkMode={isDarkMode} sheet={randomSheet} />
    ) : (
      <Result sheet={randomSheet} isDarkMode={isDarkMode} />
    ));

  return (
    <div id='main-screen'>
      <div className='filterArea'>
        <div className='filtersRow'>
          <Select
            className='filterSelect'
            options={[{ value: '', label: 'Todas as raças' }, ...racas]}
            placeholder='Todas as raças'
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
            placeholder='Todas as Origens'
            options={[{ value: '', label: 'Todas as Origens' }, ...origens]}
            isSearchable
            onChange={onSelectOrigin}
            isDisabled={selectedOptions.raca === 'Golem'}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...formThemeColors,
              },
            })}
          />

          <Select
            className='filterSelect'
            placeholder='Todas as Divindades'
            options={[
              {
                label: '',
                options: [
                  { value: '', label: 'Padrão' },
                  { value: '**', label: 'Qualquer divindade' },
                  { value: '--', label: 'Não devoto' },
                ],
              },
              {
                label: `Divindades Permitidas (${
                  selectedOptions.classe || 'Todas as Classes'
                })`,
                options: divindades,
              },
            ]}
            isSearchable
            value={selectedOptions.devocao}
            onChange={inSelectDivindade}
            // value={selectedOptions.devocao}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...formThemeColors,
              },
            })}
          />

          <CreatableSelect
            className='filterSelect'
            placeholder='Nível 1'
            options={niveis}
            isSearchable
            formatCreateLabel={(inputValue) => `Nível ${inputValue}`}
            onChange={onSelectNivel}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...formThemeColors,
              },
            })}
          />

          <FormControlLabel
            control={
              <Checkbox
                value={simpleSheet}
                onChange={() => setSimpleSheet(!simpleSheet)}
              />
            }
            label='Ficha simplificada'
          />
        </div>

        <div className='buttonsRow'>
          <Button variant='contained' onClick={onClickGenerate}>
            Gerar Ficha
          </Button>

          <Button
            variant='contained'
            onClick={onClickShowHistoric}
            style={{ marginLeft: '10px' }}
          >
            Ver histórico
          </Button>
        </div>
      </div>

      <Fade in={showPresentation}>
        <div id='presentation'>
          <p>
            <u>“Khalmyr tem o tabuleiro, mas quem move as peças é Nimb”</u>.
            Deixe que Nimb decida o seu personagem.
          </p>
          <p>
            <strong>Fichas de Nimb</strong> é um gerador de fichas aleátorias
            para o sistema Tormenta 20. Com ele, é possível gerar fichas de
            raças e classes aleatórias, e ter sua ficha montada
            instanteneamente. Todos as características de uma ficha de Tormenta
            20 serão gerados: atributos, perícias, origem, divindades, magias,
            etc. Tudo respeitando as regras oficiais do jogo.
          </p>
          <p>
            Esse gerador é uma ótima pedida para jogadores que queiram
            experimentar um pouco de aleatoriedade ou não gastar muito tempo
            criando a ficha, e principalmente para mestres que queriam gerar
            seus NPCs de forma rápida e prática.
          </p>
          <p>
            Para isso, adicionamos também a opção de filtro de raça, classe e
            nivel, para que o mestre possa gerar NPCs conforme a narrativa
            requisite.
          </p>
          <p>
            Você pode ver as últimas alterações e o que planejamos para o futuro
            no <Link to='/changelog'>changelog</Link>.
          </p>

          <p>
            Se você encontrou algum problema, tem alguma sugestão ou quer
            discutir e entender como é o funcionamento do Fichas de Nimb,{' '}
            <a
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              target='blank'
            >
              clique aqui.
            </a>
          </p>

          <p>
            Se você é um desenvolvedor que queira contribuir com o projeto,
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

      {randomSheet && !showHistoric && sheetComponent}

      {showHistoric && (
        <Historic isDarkTheme={isDarkMode} onClickSeeSheet={onClickSeeSheet} />
      )}
    </div>
  );
};

export default MainScreen;
