/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Container, FormControlLabel, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import React from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { formatGroupLabel } from 'react-select/src/builtins';
import { convertToFoundry, FoundryJSON } from '@/2foundry';
import Bag from '@/interfaces/Bag';
import preparePDF from '@/functions/downloadSheetPdf';
import CLASSES from '../../data/classes';
import RACAS from '../../data/racas';
import SelectOptions from '../../interfaces/SelectedOptions';
import Result from '../SheetResult/Result';

import generateRandomSheet from '../../functions/general';
import CharacterSheet from '../../interfaces/CharacterSheet';

import '../../assets/css/mainScreen.css';
import { ORIGINS } from '../../data/origins';
import roles from '../../data/roles';
import getSelectTheme from '../../functions/style';
import { allDivindadeNames } from '../../interfaces/Divindade';
import { HistoricI } from '../../interfaces/Historic';
import SimpleResult from '../SimpleResult';
import Historic from './Historic';

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

    sheet.bag = new Bag(sheet.bag.equipments);

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
      <SimpleResult sheet={randomSheet} />
    ) : (
      <Result sheet={randomSheet} isDarkMode={isDarkMode} />
    ));

  function encodeFoundryJSON(json: FoundryJSON | undefined) {
    if (json) {
      return `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(json)
      )}`;
    }

    return '';
  }

  const foundryJSON = randomSheet ? convertToFoundry(randomSheet) : undefined;

  const encodedJSON = foundryJSON ? encodeFoundryJSON(foundryJSON) : '';

  const preparePrint = async () => {
    if (!randomSheet) return;
    const pdfBytes = await preparePDF(randomSheet);

    // Allow user to download the modified PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modified_sheet.pdf';
    link.click();
  };

  return (
    <div id='main-screen'>
      <Container className='filterArea' maxWidth='xl'>
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

        <Stack spacing={2} direction='row' mt={2} mb={2}>
          <Button variant='contained' onClick={onClickGenerate}>
            Gerar Ficha
          </Button>

          <Button variant='contained' onClick={onClickShowHistoric}>
            Ver histórico
          </Button>
        </Stack>

        {randomSheet && (
          <div className='exportButtonsContainer'>
            <div className='export-to-foundry'>
              <a
                className='exportBtn'
                onClick={preparePrint}
                role='link'
                tabIndex={0}
              >
                Gerar PDF da Ficha
              </a>
            </div>
            <div className='export-to-foundry'>
              <a
                href={encodedJSON}
                className='exportBtn'
                download={`${randomSheet.nome}.json`}
              >
                Exportar para o Foundry
              </a>
            </div>
          </div>
        )}
      </Container>

      {randomSheet && !showHistoric && sheetComponent}

      {showHistoric && (
        <Historic isDarkTheme={isDarkMode} onClickSeeSheet={onClickSeeSheet} />
      )}
    </div>
  );
};

export default MainScreen;
