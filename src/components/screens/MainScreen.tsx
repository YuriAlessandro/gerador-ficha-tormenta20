/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Box,
  Card,
  Container,
  FormControlLabel,
  Stack,
  Grid,
  useMediaQuery,
  useTheme,
  Typography,
} from '@mui/material';
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

import generateRandomSheet, {
  generateEmptySheet,
} from '../../functions/general';
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

const updateSheetInHistoric = (updatedSheet: CharacterSheet) => {
  const ls = localStorage;
  const lsHistoric = ls.getItem('fdnHistoric');
  const historic: HistoricI[] = lsHistoric ? JSON.parse(lsHistoric) : [];

  // Find and update the existing sheet in historic
  const sheetIndex = historic.findIndex(
    (entry) => entry.id === updatedSheet.id
  );
  if (sheetIndex !== -1) {
    historic[sheetIndex] = {
      sheet: updatedSheet,
      date: historic[sheetIndex].date, // Keep original date
      id: updatedSheet.id,
    };
    ls.setItem('fdnHistoric', JSON.stringify(historic));
  }
};

const MainScreen: React.FC<MainScreenProps> = ({ isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [isHistoricSheet, setIsHistoricSheet] = React.useState(false);

  const canGenerateEmptySheet =
    selectedOptions.classe &&
    selectedOptions.classe !== 'Golem' &&
    selectedOptions.raca &&
    selectedOptions.origin &&
    selectedOptions.nivel &&
    (selectedOptions.devocao.label !== 'Padrão' ||
      selectedOptions.devocao.value === '**');

  const onClickGenerate = () => {
    setShowHistoric(false);
    setIsHistoricSheet(false);
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

  const onClickGenerateEmptySheet = () => {
    setShowHistoric(false);
    setIsHistoricSheet(false);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    const emptySheet = generateEmptySheet(selectedOptions);
    emptySheet.bag = new Bag(emptySheet.bag.equipments);
    saveSheetOnHistoric(emptySheet);
    setRandomSheet(emptySheet);
  };

  const onClickSeeSheet = (sheet: CharacterSheet) => {
    setShowHistoric(false);
    setIsHistoricSheet(true);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }

    // Restore Bag class methods
    sheet.bag = new Bag(sheet.bag.equipments);

    // Restore spellPath functions if the class has spellcasting
    if (sheet.classe.spellPath) {
      const originalClass = CLASSES.find(
        (c) =>
          c.name === sheet.classe.name && c.subname === sheet.classe.subname
      );
      if (originalClass?.spellPath) {
        sheet.classe.spellPath = originalClass.spellPath;
      }
    }

    setRandomSheet(sheet);
  };

  const handleSheetUpdate = (updatedSheet: CharacterSheet) => {
    // Ensure the updated sheet has proper class methods restored
    if (updatedSheet.classe.spellPath) {
      const originalClass = CLASSES.find(
        (c) =>
          c.name === updatedSheet.classe.name &&
          c.subname === updatedSheet.classe.subname
      );
      if (originalClass?.spellPath) {
        updatedSheet.classe.spellPath = originalClass.spellPath;
      }
    }

    setRandomSheet(updatedSheet);
    updateSheetInHistoric(updatedSheet);
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

  // Shared styles for react-select to fix z-index issues
  const selectStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    container: (provided: any) => ({
      ...provided,
      width: '100%',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: (provided: any) => ({
      ...provided,
      minHeight: isMobile ? '44px' : '38px',
      fontSize: isMobile ? '16px' : '14px',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: (provided: any) => ({
      ...provided,
      fontSize: isMobile ? '16px' : '14px',
      padding: isMobile ? '12px' : '8px 12px',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

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
      <Result
        sheet={randomSheet}
        isDarkMode={isDarkMode}
        onSheetUpdate={handleSheetUpdate}
        isHistoricSheet={isHistoricSheet}
      />
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
    try {
      const pdfBytes = await preparePDF(randomSheet);

      // Allow user to download the modified PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: 'application/pdf',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Ficha de ${randomSheet.nome}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`Erro ao gerar PDF.`);
    }
  };

  return (
    <div id='main-screen'>
      <Container
        maxWidth='xl'
        sx={{
          px: { xs: 1, sm: 2 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Card sx={{ p: { xs: 2, sm: 3 }, mb: 2, overflow: 'visible' }}>
          <Typography
            variant={isSmall ? 'h6' : 'h5'}
            component='h1'
            gutterBottom
            sx={{ mb: 3, fontWeight: 'bold' }}
          >
            Gerador de Fichas
          </Typography>

          <Grid container spacing={2}>
            {/* Race Selection */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                Raça
              </Typography>
              <Select
                options={[{ value: '', label: 'Todas as raças' }, ...racas]}
                placeholder='Todas as raças'
                onChange={onSelectRaca}
                isSearchable
                styles={selectStyles}
                menuPortalTarget={document.body}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: {
                    ...formThemeColors,
                  },
                })}
              />
            </Grid>

            {/* Class Selection */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                Classe / Role
              </Typography>
              <Select
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
                    options: [
                      { value: '', label: 'Todas as Roles' },
                      ...rolesopt,
                    ],
                  },
                ]}
                placeholder='Classes e Roles'
                formatGroupLabel={fmtGroupLabel}
                onChange={onSelectClasse}
                isSearchable
                styles={selectStyles}
                menuPortalTarget={document.body}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: {
                    ...formThemeColors,
                  },
                })}
              />
            </Grid>

            {/* Origin Selection */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                Origem
              </Typography>
              <Select
                placeholder='Todas as Origens'
                options={[{ value: '', label: 'Todas as Origens' }, ...origens]}
                isSearchable
                onChange={onSelectOrigin}
                isDisabled={selectedOptions.raca === 'Golem'}
                styles={selectStyles}
                menuPortalTarget={document.body}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: {
                    ...formThemeColors,
                  },
                })}
              />
            </Grid>

            {/* Divinity Selection */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                Divindade
              </Typography>
              <Select
                placeholder='Divindades'
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
                    label: `Permitidas (${selectedOptions.classe || 'Todas'})`,
                    options: divindades,
                  },
                ]}
                isSearchable
                value={selectedOptions.devocao}
                onChange={inSelectDivindade}
                styles={selectStyles}
                menuPortalTarget={document.body}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: {
                    ...formThemeColors,
                  },
                })}
              />
            </Grid>

            {/* Level Selection */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                Nível
              </Typography>
              <CreatableSelect
                placeholder='Nível 1'
                options={niveis}
                isSearchable
                formatCreateLabel={(inputValue) => `Nível ${inputValue}`}
                onChange={onSelectNivel}
                styles={selectStyles}
                menuPortalTarget={document.body}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: {
                    ...formThemeColors,
                  },
                })}
              />
            </Grid>

            {/* Simple Sheet Checkbox */}
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{ display: 'flex', alignItems: 'flex-end' }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    value={simpleSheet}
                    onChange={() => setSimpleSheet(!simpleSheet)}
                    size={isMobile ? 'medium' : 'small'}
                  />
                }
                label='Ficha simplificada'
                sx={{ fontSize: isMobile ? '16px' : '14px' }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 3 }}>
            <Stack
              spacing={2}
              direction={isMobile ? 'column' : 'row'}
              sx={{ mb: 2 }}
            >
              <Button
                variant='contained'
                onClick={onClickGenerate}
                size={isMobile ? 'large' : 'medium'}
                fullWidth={isMobile}
                sx={{
                  minHeight: isMobile ? '48px' : 'auto',
                  fontSize: isMobile ? '16px' : '14px',
                }}
              >
                Gerar Ficha Aleatória
              </Button>

              <Button
                variant='contained'
                onClick={onClickGenerateEmptySheet}
                disabled={!canGenerateEmptySheet}
                size={isMobile ? 'large' : 'medium'}
                fullWidth={isMobile}
                sx={{
                  minHeight: isMobile ? '48px' : 'auto',
                  fontSize: isMobile ? '16px' : '14px',
                }}
              >
                Gerar Ficha Vazia
              </Button>

              <Button
                variant='contained'
                onClick={onClickShowHistoric}
                size={isMobile ? 'large' : 'medium'}
                fullWidth={isMobile}
                sx={{
                  minHeight: isMobile ? '48px' : 'auto',
                  fontSize: isMobile ? '16px' : '14px',
                }}
              >
                Ver Histórico
              </Button>
            </Stack>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                fontSize: { xs: '14px', sm: '13px' },
                lineHeight: 1.4,
              }}
            >
              Para gerar uma ficha vazia, sem poderes, magias e atributos, você
              deve selecionar todas as informações no formulário acima.
            </Typography>
          </Box>
        </Card>

        {randomSheet && (
          <Card sx={{ p: 2, mb: 2 }}>
            <Typography
              variant='h6'
              sx={{ mb: 2, fontSize: { xs: '16px', sm: '18px' } }}
            >
              Exportar Ficha
            </Typography>
            <Stack
              spacing={1}
              direction={isMobile ? 'column' : 'row'}
              sx={{
                '& button': {
                  minHeight: isMobile ? '44px' : 'auto',
                  fontSize: isMobile ? '16px' : '14px',
                },
              }}
            >
              <Button
                variant='outlined'
                onClick={preparePrint}
                fullWidth={isMobile}
                sx={{ justifyContent: 'flex-start' }}
              >
                📄 Gerar PDF da Ficha
              </Button>
              <Button
                variant='outlined'
                href={encodedJSON}
                download={`${randomSheet.nome}.json`}
                component='a'
                fullWidth={isMobile}
                sx={{ justifyContent: 'flex-start' }}
              >
                🎲 Exportar para Foundry
              </Button>
            </Stack>
          </Card>
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
