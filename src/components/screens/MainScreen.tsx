/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Alert,
  Box,
  Card,
  Container,
  FormControlLabel,
  Stack,
  Grid,
  useMediaQuery,
  useTheme,
  Typography,
  CircularProgress,
} from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import React from 'react';
import Select, { StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { formatGroupLabel } from 'react-select/src/builtins';
import { convertToFoundry, FoundryJSON } from '@/2foundry';
import Bag from '@/interfaces/Bag';
import preparePDF from '@/functions/downloadSheetPdf';
import CLASSES from '../../data/classes';
import { Atributo } from '../../data/atributos';
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
import { MAX_CHARACTERS_LIMIT } from '../../store/slices/sheetStorage/sheetStorage';
import { useAuth } from '../../hooks/useAuth';
import { useSheets } from '../../hooks/useSheets';
import { useAlert } from '../../hooks/useDialog';
import { CreateSheetRequest } from '../../services/sheets.service';
import SimpleResult from '../SimpleResult';
import Historic from './Historic';

type SelectedOption = { value: string; label: string };

type MainScreenProps = {
  isDarkMode: boolean;
};

const saveSheetOnHistoric = (
  sheet: CharacterSheet,
  isAuthenticated: boolean,
  cloudSheetsCount: number,
  onLimitReached?: () => void
) => {
  const ls = localStorage;
  const lsHistoric = ls.getItem('fdnHistoric');
  const historic: HistoricI[] = lsHistoric ? JSON.parse(lsHistoric) : [];

  // Verifica se já existe no histórico (atualização)
  const existingIndex = historic.findIndex((item) => item.id === sheet.id);

  if (existingIndex !== -1) {
    // Atualiza ficha existente
    historic[existingIndex] = {
      sheet,
      date: new Date().toLocaleDateString('pt-BR'),
      id: sheet.id,
    };
  } else {
    // Se usuário autenticado, verifica limite na nuvem; caso contrário, verifica localStorage
    const currentCount = isAuthenticated ? cloudSheetsCount : historic.length;

    // Se usuário autenticado, a verificação de limite será feita no backend
    // Apenas verifica no frontend se não estiver autenticado
    if (!isAuthenticated && currentCount >= MAX_CHARACTERS_LIMIT) {
      if (onLimitReached) {
        onLimitReached();
      }
      return;
    }

    historic.push({
      sheet,
      date: new Date().toLocaleDateString('pt-BR'),
      id: sheet.id,
    });
  }

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

// Save sheet to database if user is authenticated
const saveSheetToDatabase = async (
  sheet: CharacterSheet,
  isAuthenticated: boolean,
  createSheetAction: (request: CreateSheetRequest) => Promise<unknown>
) => {
  if (!isAuthenticated) return;

  try {
    // Convert CharacterSheet to the format expected by the backend
    // Note: Using type assertion as CharacterSheet has similar structure to SerializedSheetInterface
    const sheetRequest: CreateSheetRequest = {
      name: sheet.nome || 'Personagem Gerado',
      sheetData: {
        ...sheet,
        isThreat: false, // Generated characters are players, not threats
      } as unknown as CreateSheetRequest['sheetData'],
      description: `Personagem gerado automaticamente (Nível ${sheet.nivel})`,
    };

    // Use Redux action instead of direct service call
    await createSheetAction(sheetRequest);
  } catch {
    // Silently fail - historic save still works
  }
};

const MainScreen: React.FC<MainScreenProps> = ({ isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();
  const {
    sheets,
    createSheet: createSheetAction,
    initialized: sheetsInitialized,
  } = useSheets();
  const { showAlert, AlertDialog } = useAlert();
  const [selectedOptions, setSelectedOptions] = React.useState<SelectOptions>({
    nivel: 1,
    classe: '',
    raca: '',
    origin: '',
    devocao: { label: 'Aleatória', value: '' },
    gerarItens: 'nao-gerar',
  });

  const [simpleSheet, setSimpleSheet] = React.useState(false);

  const [randomSheet, setRandomSheet] = React.useState<CharacterSheet>();
  const [showHistoric, setShowHistoric] = React.useState(false);
  const [loadingPDF, setLoadingPDF] = React.useState(false);
  const [loadingFoundry, setLoadingFoundry] = React.useState(false);

  // Get local storage count for non-authenticated users
  const getLocalStorageCount = () => {
    const ls = localStorage;
    const lsHistoric = ls.getItem('fdnHistoric');
    const historic: HistoricI[] = lsHistoric ? JSON.parse(lsHistoric) : [];
    return historic.length;
  };

  // Verifica se o usuário pode criar novas fichas
  // Para autenticados: verifica sheets do banco (ilimitado se premium, senão limite de 10)
  // Para não autenticados: verifica histórico local
  // IMPORTANTE: Se está carregando sheets do backend, assume que não pode criar até confirmar
  const canCreateNewSheet = isAuthenticated
    ? sheetsInitialized && sheets.length < MAX_CHARACTERS_LIMIT // Backend sheets (should check premium status eventually)
    : getLocalStorageCount() < MAX_CHARACTERS_LIMIT; // Local storage sheets

  const canGenerateEmptySheet =
    selectedOptions.classe &&
    selectedOptions.classe !== 'Golem' &&
    selectedOptions.raca &&
    selectedOptions.origin &&
    selectedOptions.nivel &&
    (selectedOptions.devocao.label !== 'Padrão' ||
      selectedOptions.devocao.value === '**');

  const onClickGenerate = async () => {
    // Verifica o limite ANTES de gerar a ficha
    if (!canCreateNewSheet) {
      const message = isAuthenticated
        ? `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens salvos na nuvem. Remova algumas fichas da sua lista para criar novas.`
        : `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens salvos localmente. Remova uma ficha do histórico para criar uma nova ou faça login para ter armazenamento ilimitado na nuvem.`;
      showAlert(message, 'Limite Atingido');
      return;
    }

    setShowHistoric(false);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    const anotherRandomSheet = generateRandomSheet(selectedOptions);
    saveSheetOnHistoric(
      anotherRandomSheet,
      isAuthenticated,
      sheets.length,
      () =>
        showAlert(
          `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens salvos. Remova uma ficha do histórico para salvar uma nova.`,
          'Limite Atingido'
        )
    );

    // Also save to database if user is authenticated
    await saveSheetToDatabase(
      anotherRandomSheet,
      isAuthenticated,
      createSheetAction
    );

    setRandomSheet(anotherRandomSheet);
  };

  const onClickGenerateEmptySheet = async () => {
    // Verifica o limite ANTES de gerar a ficha
    if (!canCreateNewSheet) {
      const message = isAuthenticated
        ? `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens salvos na nuvem. Remova algumas fichas da sua lista para criar novas.`
        : `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens salvos localmente. Remova uma ficha do histórico para criar uma nova ou faça login para ter armazenamento ilimitado na nuvem.`;
      showAlert(message, 'Limite Atingido');
      return;
    }

    setShowHistoric(false);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    const emptySheet = generateEmptySheet(selectedOptions);
    emptySheet.bag = new Bag(emptySheet.bag.equipments);
    saveSheetOnHistoric(emptySheet, isAuthenticated, sheets.length, () =>
      showAlert(
        `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens salvos. Remova uma ficha do histórico para salvar uma nova.`,
        'Limite Atingido'
      )
    );

    // Also save to database if user is authenticated
    await saveSheetToDatabase(emptySheet, isAuthenticated, createSheetAction);

    setRandomSheet(emptySheet);
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

    // Restore Bag class methods
    sheet.bag = new Bag(sheet.bag.equipments);

    // Restore spellPath functions if the class has spellcasting
    if (sheet.classe.spellPath) {
      const baseClass = CLASSES.find((c) => c.name === sheet.classe.name);

      if (baseClass?.setup) {
        // For classes with setup functions, recreate spellPath based on class
        if (sheet.classe.name === 'Arcanista' && sheet.classe.subname) {
          // Arcanista has subtypes that determine spellPath
          const spellPaths = {
            Bruxo: {
              initialSpells: 3,
              spellType: 'Arcane' as const,
              qtySpellsLearnAtLevel: (level: number) => (level === 1 ? 0 : 1),
              spellCircleAvailableAtLevel: (level: number) => {
                if (level < 5) return 1;
                if (level < 9) return 2;
                if (level < 13) return 3;
                if (level < 17) return 4;
                return 5;
              },
              keyAttribute: Atributo.INTELIGENCIA,
            },
            Mago: {
              initialSpells: 4,
              spellType: 'Arcane' as const,
              qtySpellsLearnAtLevel: (level: number) =>
                [5, 9, 13, 17].includes(level) ? 2 : 1,
              spellCircleAvailableAtLevel: (level: number) => {
                if (level < 5) return 1;
                if (level < 9) return 2;
                if (level < 13) return 3;
                if (level < 17) return 4;
                return 5;
              },
              keyAttribute: Atributo.INTELIGENCIA,
            },
            Feiticeiro: {
              initialSpells: 3,
              spellType: 'Arcane' as const,
              qtySpellsLearnAtLevel: (level: number) =>
                level % 2 === 1 ? 1 : 0,
              spellCircleAvailableAtLevel: (level: number) => {
                if (level < 5) return 1;
                if (level < 9) return 2;
                if (level < 13) return 3;
                if (level < 17) return 4;
                return 5;
              },
              keyAttribute: Atributo.CARISMA,
            },
          };

          const subtype = sheet.classe.subname as keyof typeof spellPaths;
          if (spellPaths[subtype]) {
            sheet.classe.spellPath = spellPaths[subtype];
          }
        } else if (sheet.classe.name === 'Bardo') {
          // Bard spellPath configuration
          sheet.classe.spellPath = {
            initialSpells: 2,
            spellType: 'Arcane',
            qtySpellsLearnAtLevel: (level: number) => (level % 2 === 0 ? 1 : 0),
            spellCircleAvailableAtLevel: (level: number) => {
              if (level < 6) return 1;
              if (level < 10) return 2;
              if (level < 14) return 3;
              return 4;
            },
            keyAttribute: Atributo.CARISMA,
          };
        } else if (sheet.classe.name === 'Clérigo') {
          // Cleric spellPath configuration
          sheet.classe.spellPath = {
            initialSpells: 3,
            spellType: 'Divine',
            qtySpellsLearnAtLevel: () => 1,
            spellCircleAvailableAtLevel: (level: number) => {
              if (level < 5) return 1;
              if (level < 9) return 2;
              if (level < 13) return 3;
              if (level < 17) return 4;
              return 5;
            },
            keyAttribute: Atributo.SABEDORIA,
          };
        } else if (sheet.classe.name === 'Druida') {
          // Druid spellPath configuration
          sheet.classe.spellPath = {
            initialSpells: 2,
            spellType: 'Divine',
            qtySpellsLearnAtLevel: (level: number) => (level % 2 === 0 ? 1 : 0),
            spellCircleAvailableAtLevel: (level: number) => {
              if (level < 6) return 1;
              if (level < 10) return 2;
              if (level < 14) return 3;
              return 4;
            },
            keyAttribute: Atributo.SABEDORIA,
          };
        }
      } else {
        // For classes without setup, try direct matching
        const originalClass = CLASSES.find((c) => {
          if (c.name !== sheet.classe.name) return false;
          const cSubname = c.subname || '';
          const sheetSubname = sheet.classe.subname || '';
          return cSubname === sheetSubname;
        });

        if (originalClass?.spellPath) {
          sheet.classe.spellPath = originalClass.spellPath;
        }
      }
    }

    // Also restore originalAbilities for proper level-based filtering
    if (!sheet.classe.originalAbilities && sheet.classe.abilities) {
      const originalClass = CLASSES.find((c) => {
        if (c.name !== sheet.classe.name) return false;
        const cSubname = c.subname || '';
        const sheetSubname = sheet.classe.subname || '';
        return cSubname === sheetSubname;
      });

      if (originalClass) {
        sheet.classe.originalAbilities = originalClass.abilities;
      }
    }

    setRandomSheet(sheet);
  };

  const handleSheetUpdate = (updatedSheet: CharacterSheet) => {
    // Ensure the updated sheet has proper class methods restored
    if (updatedSheet.classe.spellPath) {
      const baseClass = CLASSES.find(
        (c) => c.name === updatedSheet.classe.name
      );

      if (baseClass?.setup) {
        // Use the same restoration logic as onClickSeeSheet
        if (
          updatedSheet.classe.name === 'Arcanista' &&
          updatedSheet.classe.subname
        ) {
          const spellPaths = {
            Bruxo: {
              initialSpells: 3,
              spellType: 'Arcane' as const,
              qtySpellsLearnAtLevel: (level: number) => (level === 1 ? 0 : 1),
              spellCircleAvailableAtLevel: (level: number) => {
                if (level < 5) return 1;
                if (level < 9) return 2;
                if (level < 13) return 3;
                if (level < 17) return 4;
                return 5;
              },
              keyAttribute: Atributo.INTELIGENCIA,
            },
            Mago: {
              initialSpells: 4,
              spellType: 'Arcane' as const,
              qtySpellsLearnAtLevel: (level: number) =>
                [5, 9, 13, 17].includes(level) ? 2 : 1,
              spellCircleAvailableAtLevel: (level: number) => {
                if (level < 5) return 1;
                if (level < 9) return 2;
                if (level < 13) return 3;
                if (level < 17) return 4;
                return 5;
              },
              keyAttribute: Atributo.INTELIGENCIA,
            },
            Feiticeiro: {
              initialSpells: 3,
              spellType: 'Arcane' as const,
              qtySpellsLearnAtLevel: (level: number) =>
                level % 2 === 1 ? 1 : 0,
              spellCircleAvailableAtLevel: (level: number) => {
                if (level < 5) return 1;
                if (level < 9) return 2;
                if (level < 13) return 3;
                if (level < 17) return 4;
                return 5;
              },
              keyAttribute: Atributo.CARISMA,
            },
          };

          const subtype = updatedSheet.classe
            .subname as keyof typeof spellPaths;
          if (spellPaths[subtype]) {
            updatedSheet.classe.spellPath = spellPaths[subtype];
          }
        } else if (updatedSheet.classe.name === 'Bardo') {
          updatedSheet.classe.spellPath = {
            initialSpells: 2,
            spellType: 'Arcane',
            qtySpellsLearnAtLevel: (level: number) => (level % 2 === 0 ? 1 : 0),
            spellCircleAvailableAtLevel: (level: number) => {
              if (level < 6) return 1;
              if (level < 10) return 2;
              if (level < 14) return 3;
              return 4;
            },
            keyAttribute: Atributo.CARISMA,
          };
        } else if (updatedSheet.classe.name === 'Clérigo') {
          updatedSheet.classe.spellPath = {
            initialSpells: 3,
            spellType: 'Divine',
            qtySpellsLearnAtLevel: () => 1,
            spellCircleAvailableAtLevel: (level: number) => {
              if (level < 5) return 1;
              if (level < 9) return 2;
              if (level < 13) return 3;
              if (level < 17) return 4;
              return 5;
            },
            keyAttribute: Atributo.SABEDORIA,
          };
        } else if (updatedSheet.classe.name === 'Druida') {
          updatedSheet.classe.spellPath = {
            initialSpells: 2,
            spellType: 'Divine',
            qtySpellsLearnAtLevel: (level: number) => (level % 2 === 0 ? 1 : 0),
            spellCircleAvailableAtLevel: (level: number) => {
              if (level < 6) return 1;
              if (level < 10) return 2;
              if (level < 14) return 3;
              return 4;
            },
            keyAttribute: Atributo.SABEDORIA,
          };
        }
      } else {
        const originalClass = CLASSES.find(
          (c) =>
            c.name === updatedSheet.classe.name &&
            c.subname === updatedSheet.classe.subname
        );
        if (originalClass?.spellPath) {
          updatedSheet.classe.spellPath = originalClass.spellPath;
        }
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

  const onSelectGerarItens = (opcao: SelectedOption | null) => {
    if (opcao) {
      setSelectedOptions({
        ...selectedOptions,
        gerarItens: opcao.value as
          | 'nao-gerar'
          | 'consumir-dinheiro'
          | 'sem-gastar-dinheiro',
      });
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

  const opcoesGerarItens = [
    { value: 'nao-gerar', label: 'Não gerar' },
    { value: 'consumir-dinheiro', label: 'Gerar consumindo dinheiro inicial' },
    { value: 'sem-gastar-dinheiro', label: 'Gerar sem gastar dinheiro' },
  ];

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
  const selectStyles: Partial<StylesConfig<SelectedOption, false>> = {
    container: (provided) => ({
      ...provided,
      width: '100%',
    }),
    control: (provided) => ({
      ...provided,
      minHeight: isMobile ? '44px' : '38px',
      fontSize: isMobile ? '16px' : '14px',
    }),
    option: (provided) => ({
      ...provided,
      fontSize: isMobile ? '16px' : '14px',
      padding: isMobile ? '12px' : '8px 12px',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
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
    setLoadingPDF(true);
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
      showAlert('Erro ao gerar PDF.', 'Erro');
    } finally {
      setLoadingPDF(false);
    }
  };

  const exportFoundry = () => {
    if (!randomSheet || !encodedJSON) return;
    setLoadingFoundry(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = encodedJSON;
      link.download = `${randomSheet.nome}.json`;
      link.click();
      setLoadingFoundry(false);
    }, 300);
  };

  return (
    <>
      <AlertDialog />
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
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
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
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
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
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  Origem
                </Typography>
                <Select
                  placeholder='Todas as Origens'
                  options={[
                    { value: '', label: 'Todas as Origens' },
                    ...origens,
                  ]}
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
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
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
                      label: `Permitidas (${
                        selectedOptions.classe || 'Todas'
                      })`,
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
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
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

              {/* Generate Items Selection */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  Gerar Itens
                </Typography>
                <Select
                  placeholder='Não gerar'
                  options={opcoesGerarItens}
                  value={opcoesGerarItens.find(
                    (opt) => opt.value === selectedOptions.gerarItens
                  )}
                  onChange={onSelectGerarItens}
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

            {/* Limit Warning */}
            {!canCreateNewSheet && (
              <Alert severity='warning' sx={{ mt: 3 }}>
                <Typography variant='body2'>
                  <strong>Limite atingido!</strong> Você chegou ao limite de{' '}
                  {MAX_CHARACTERS_LIMIT} personagens salvos{' '}
                  {isAuthenticated ? 'na nuvem' : 'localmente'}.{' '}
                  {!isAuthenticated ? (
                    <>
                      <strong>Faça login</strong> para ter armazenamento
                      ilimitado na nuvem ou remova fichas do histórico para
                      criar novas.
                    </>
                  ) : (
                    <>Remova algumas fichas da sua lista para criar novas.</>
                  )}
                </Typography>
              </Alert>
            )}

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
                  disabled={!canCreateNewSheet}
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
                  disabled={!canGenerateEmptySheet || !canCreateNewSheet}
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
                Para gerar uma ficha vazia, sem poderes, magias e atributos,
                você deve selecionar todas as informações no formulário acima.
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
                  disabled={loadingPDF}
                  sx={{ justifyContent: 'flex-start' }}
                  startIcon={loadingPDF ? <CircularProgress size={20} /> : '📄'}
                >
                  {loadingPDF ? 'Gerando PDF...' : 'Gerar PDF da Ficha'}
                </Button>
                <Button
                  variant='outlined'
                  onClick={exportFoundry}
                  fullWidth={isMobile}
                  disabled={loadingFoundry}
                  sx={{ justifyContent: 'flex-start' }}
                  startIcon={
                    loadingFoundry ? <CircularProgress size={20} /> : '🎲'
                  }
                >
                  {loadingFoundry ? 'Exportando...' : 'Exportar para Foundry'}
                </Button>
              </Stack>
            </Card>
          )}

          {showHistoric && (
            <Historic
              isDarkTheme={isDarkMode}
              onClickSeeSheet={onClickSeeSheet}
            />
          )}
        </Container>

        {randomSheet && !showHistoric && sheetComponent}
      </div>
    </>
  );
};

export default MainScreen;
