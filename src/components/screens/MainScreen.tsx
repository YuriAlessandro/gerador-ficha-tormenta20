/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
} from '@mui/material';
import {
  History as HistoryIcon,
  PictureAsPdf as PdfIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Casino as CasinoIcon,
  Warning as WarningIcon,
  Cloud as CloudIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import React from 'react';
import { useHistory, useLocation, Prompt } from 'react-router-dom';
import Select, { StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { formatGroupLabel } from 'react-select/src/builtins';
import { convertToFoundry, FoundryJSON } from '@/2foundry';
import Bag from '@/interfaces/Bag';
import preparePDF from '@/functions/downloadSheetPdf';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  dataRegistry,
  RaceWithSupplement,
  ClassWithSupplement,
  OriginWithSupplement,
} from '../../data/registry';
import SelectOptions from '../../interfaces/SelectedOptions';
import Race from '../../interfaces/Race';
import Result from '../SheetResult/Result';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
} from '../../types/supplement.types';

import generateRandomSheet, {
  generateEmptySheet,
  applyPower,
  applyManualLevelUp,
} from '../../functions/general';
import { migrateSheet, needsMigration } from '../../functions/migrateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';

import '../../assets/css/mainScreen.css';
import roles from '../../data/systems/tormenta20/roles';
import { raceHasOrigin } from '../../data/systems/tormenta20/origins';
import getSelectTheme from '../../functions/style';
import {
  allDivindadeNames,
  divindadeDisplayNames,
} from '../../interfaces/Divindade';
import { HistoricI } from '../../interfaces/Historic';
import { MAX_CHARACTERS_LIMIT } from '../../store/slices/sheetStorage/sheetStorage';
import { useAuth } from '../../hooks/useAuth';
import { useSheets } from '../../hooks/useSheets';
import { useAlert } from '../../hooks/useDialog';
import { useSheetLimit } from '../../hooks/useSheetLimit';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionTier } from '../../types/subscription.types';
import SheetsService, {
  CreateSheetRequest,
} from '../../services/sheets.service';
import SimpleResult from '../SimpleResult';
import Historic from './Historic';
import GolemDespertoCustomizationModal from '../GolemDespertoCustomizationModal';
import DuendeCustomizationModal from '../DuendeCustomizationModal';
import MoreauCustomizationModal from '../MoreauCustomizationModal';
import CharacterCreationWizardModal from '../CharacterCreationWizard/CharacterCreationWizardModal';
import LevelUpWizardModal from '../LevelUpWizard/LevelUpWizardModal';
import { applyGolemDespertoCustomization } from '../../data/systems/tormenta20/ameacas-de-arton/races/golem-desperto';
import { applyDuendeCustomization } from '../../data/systems/tormenta20/herois-de-arton/races/duende';
import { applyMoreauCustomization } from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau';
import Skill from '../../interfaces/Skills';
import SheetLimitDialog from '../common/SheetLimitDialog';

type SelectedOption = {
  value: string;
  label: string;
  supplementId?: SupplementId;
  supplementName?: string;
};

type MainScreenProps = {
  isDarkMode: boolean;
};

/**
 * Componente customizado para renderizar opções do select com badge de suplemento
 */
const formatOptionLabel = (option: SelectedOption) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span>{option.label}</span>
    {option.supplementId &&
      option.supplementId !== SupplementId.TORMENTA20_CORE && (
        <Chip
          label={option.supplementName}
          size='small'
          sx={{
            height: '20px',
            fontSize: '0.7rem',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }}
        />
      )}
  </div>
);

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

    // Se há mais de 100 fichas, remove a mais antiga para evitar QuotaExceededError
    if (historic.length >= 100) {
      historic.shift(); // Remove o primeiro (mais antigo)
    }

    historic.push({
      sheet,
      date: new Date().toLocaleDateString('pt-BR'),
      id: sheet.id,
    });
  }

  try {
    ls.setItem('fdnHistoric', JSON.stringify(historic));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Se ainda assim exceder a quota, remove mais fichas antigas até conseguir salvar
      while (historic.length > 0) {
        historic.shift();
        try {
          ls.setItem('fdnHistoric', JSON.stringify(historic));
          break;
        } catch {
          // Continua removendo
        }
      }
    }
  }
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
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, user } = useAuth();
  const { openLoginModal } = useAuthContext();
  const {
    sheets,
    createSheet: createSheetAction,
    updateSheet: updateSheetAction,
  } = useSheets();
  const { showAlert, AlertDialog } = useAlert();
  const { tier } = useSubscription();
  const { totalSheets, maxSheets, canCreate } = useSheetLimit();
  const [showLimitDialog, setShowLimitDialog] = React.useState(false);
  const [showCloudSaveNotice, setShowCloudSaveNotice] = React.useState(false);
  const [pendingGenerateAction, setPendingGenerateAction] = React.useState<
    'random' | 'empty' | null
  >(null);
  const [selectedOptions, setSelectedOptions] = React.useState<SelectOptions>({
    nivel: 1,
    classe: '',
    raca: '',
    origin: '',
    devocao: { label: 'Não devoto', value: '--' },
    gerarItens: 'nao-gerar',
    supplements: user?.enabledSupplements || [SupplementId.TORMENTA20_CORE],
  });

  const [simpleSheet, setSimpleSheet] = React.useState(false);

  const [randomSheet, setRandomSheet] = React.useState<CharacterSheet>();
  const [showHistoric, setShowHistoric] = React.useState(false);
  const [loadingPDF, setLoadingPDF] = React.useState(false);
  const [loadingFoundry, setLoadingFoundry] = React.useState(false);
  const [loadingSaveToCloud, setLoadingSaveToCloud] = React.useState(false);
  const [sheetSavedToCloud, setSheetSavedToCloud] = React.useState(false);
  const [cloudSheetId, setCloudSheetId] = React.useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState<
    string | null
  >(null);
  const [showGolemDespertoModal, setShowGolemDespertoModal] =
    React.useState(false);
  const [pendingGolemDespertoSheet, setPendingGolemDespertoSheet] =
    React.useState<CharacterSheet | null>(null);
  const [showDuendeModal, setShowDuendeModal] = React.useState(false);
  const [pendingDuendeSheet, setPendingDuendeSheet] =
    React.useState<CharacterSheet | null>(null);
  const [showMoreauModal, setShowMoreauModal] = React.useState(false);
  const [pendingMoreauSheet, setPendingMoreauSheet] =
    React.useState<CharacterSheet | null>(null);
  // Track if customization modal is shown before wizard (manual creation flow)
  const [pendingWizardAfterCustomization, setPendingWizardAfterCustomization] =
    React.useState(false);
  // Store race customization choices for use in wizard/sheet generation
  const [raceCustomization, setRaceCustomization] = React.useState<{
    // Golem Desperto
    golemChassis?: string;
    golemEnergySource?: string;
    golemSize?: string;
    // Duende
    duendeNature?: string;
    duendeSize?: string;
    duendeBonusAttributes?: Atributo[];
    duendePresentes?: string[];
    duendeTabuSkill?: Skill;
    // Moreau
    moreauHeritage?: string;
    moreauBonusAttributes?: Atributo[];
  }>({});
  const [wizardModalOpen, setWizardModalOpen] = React.useState(false);
  const [levelUpWizardModalOpen, setLevelUpWizardModalOpen] =
    React.useState(false);
  const [pendingLevel1Sheet, setPendingLevel1Sheet] =
    React.useState<CharacterSheet | null>(null);

  // Use ref to bypass navigation blocking immediately without waiting for state updates
  const allowNavigationRef = React.useRef(false);

  const location = useLocation<{ cloudSheet?: any }>();

  // Get races and classes based on user's enabled supplements
  // Default to TORMENTA20_CORE for non-authenticated users
  const userSupplements = user?.enabledSupplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  const RACAS = dataRegistry.getRacesWithSupplementInfo(userSupplements);
  const CLASSES = dataRegistry.getClassesWithSupplementInfo(userSupplements);

  // Sync selectedOptions.supplements when user's enabledSupplements change
  React.useEffect(() => {
    const newSupplements = user?.enabledSupplements || [
      SupplementId.TORMENTA20_CORE,
    ];
    setSelectedOptions((prev) => ({
      ...prev,
      supplements: newSupplements,
    }));
  }, [user?.enabledSupplements]);

  // Load cloud sheet on mount if passed via navigation state
  React.useEffect(() => {
    if (location.state?.cloudSheet) {
      const { cloudSheet } = location.state;
      // Create a deep copy to avoid read-only object issues
      const sheet = JSON.parse(
        JSON.stringify(cloudSheet.sheetData)
      ) as CharacterSheet;

      // Restore Bag class methods
      sheet.bag = new Bag(sheet.bag.equipments);

      // Restore spellPath functions if the class has spellcasting
      if (sheet.classe.spellPath) {
        const baseClass = CLASSES.find((c) => c.name === sheet.classe.name);

        if (baseClass?.setup) {
          // For classes with setup functions, recreate spellPath based on class
          const setupClass = baseClass.setup(sheet.classe);
          sheet.classe.spellPath = setupClass.spellPath;
        }
      }

      setRandomSheet(sheet);
      setSheetSavedToCloud(true); // It came from cloud, so it's already saved
      setCloudSheetId(cloudSheet.id); // Store the cloud sheet ID for updates
      // Clear the state to prevent reloading on subsequent renders
      history.replace('/criar-ficha', {});
    }
  }, [location.state]);

  // Warn before leaving if sheet is not saved to cloud (refresh/close tab)
  // Note: Browser security forces native alert for beforeunload
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (randomSheet && !sheetSavedToCloud && !showHistoric) {
        e.preventDefault();
        e.returnValue =
          'Você tem uma ficha não salva na nuvem. Deseja sair mesmo assim?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [randomSheet, sheetSavedToCloud, showHistoric]);

  // For empty sheets, user must select a specific deity option (not "Aleatório")
  // Valid options: specific deity, "Não devoto" (--), or "Qualquer divindade" (**)
  const canGenerateEmptySheet =
    selectedOptions.classe &&
    selectedOptions.raca &&
    (raceHasOrigin(selectedOptions.raca) ? selectedOptions.origin : true) &&
    selectedOptions.nivel &&
    selectedOptions.devocao.value !== ''; // Empty value means "Aleatório" mode

  // Check if cloud save notice should be shown (once per 24h for non-authenticated users)
  const CLOUD_NOTICE_KEY = 'fdnCloudNoticeLastShown';
  const shouldShowCloudNotice = React.useCallback(() => {
    if (isAuthenticated) return false;

    const lastShown = localStorage.getItem(CLOUD_NOTICE_KEY);
    if (!lastShown) return true;

    const lastShownDate = new Date(lastShown);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60);

    return hoursDiff >= 24;
  }, [isAuthenticated]);

  const markCloudNoticeShown = () => {
    localStorage.setItem(CLOUD_NOTICE_KEY, new Date().toISOString());
  };

  const executeRandomGeneration = () => {
    setShowHistoric(false);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }
    const anotherRandomSheet = generateRandomSheet(selectedOptions);

    // Check if it's a Golem Desperto and show customization modal
    if (anotherRandomSheet.raca.name === 'Golem Desperto') {
      setPendingGolemDespertoSheet(anotherRandomSheet);
      setShowGolemDespertoModal(true);
      return; // Don't set the sheet yet - wait for modal confirmation
    }

    // Check if it's a Duende and show customization modal
    if (anotherRandomSheet.raca.name === 'Duende') {
      setPendingDuendeSheet(anotherRandomSheet);
      setShowDuendeModal(true);
      return; // Don't set the sheet yet - wait for modal confirmation
    }

    // Check if it's a Moreau and show customization modal
    if (anotherRandomSheet.raca.name === 'Moreau') {
      setPendingMoreauSheet(anotherRandomSheet);
      setShowMoreauModal(true);
      return; // Don't set the sheet yet - wait for modal confirmation
    }

    // Always save to local storage (historic)
    saveSheetOnHistoric(
      anotherRandomSheet,
      isAuthenticated,
      sheets.length,
      () =>
        showAlert(
          `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens no histórico local. Remova uma ficha para salvar uma nova.`,
          'Limite Atingido'
        )
    );

    // Don't save to cloud automatically - user will decide
    setRandomSheet(anotherRandomSheet);
    setSheetSavedToCloud(false); // Mark as not saved to cloud yet
  };

  const onClickGenerate = async () => {
    // Check sheet limit for authenticated users
    if (isAuthenticated && !canCreate) {
      setShowLimitDialog(true);
      return;
    }

    // Show cloud save notice for non-authenticated users (once per 24h)
    if (shouldShowCloudNotice()) {
      setPendingGenerateAction('random');
      setShowCloudSaveNotice(true);
      return;
    }

    executeRandomGeneration();
  };

  const executeEmptyGeneration = () => {
    // Check if race needs customization BEFORE opening wizard
    // This allows customization choices to affect wizard steps (like attribute bonuses)

    // Check for Golem Desperto
    if (selectedOptions.raca === 'Golem Desperto') {
      setPendingWizardAfterCustomization(true);
      setShowGolemDespertoModal(true);
      return;
    }

    // Check for Duende
    if (selectedOptions.raca === 'Duende') {
      setPendingWizardAfterCustomization(true);
      setShowDuendeModal(true);
      return;
    }

    // Check for Moreau
    if (selectedOptions.raca === 'Moreau') {
      setPendingWizardAfterCustomization(true);
      setShowMoreauModal(true);
      return;
    }

    // No customization needed - open wizard directly
    setWizardModalOpen(true);
  };

  const handleCloudNoticeContinue = () => {
    markCloudNoticeShown();
    setShowCloudSaveNotice(false);

    // Execute the pending action
    if (pendingGenerateAction === 'random') {
      executeRandomGeneration();
    } else if (pendingGenerateAction === 'empty') {
      executeEmptyGeneration();
    }
    setPendingGenerateAction(null);
  };

  const handleCloudNoticeCreateAccount = () => {
    markCloudNoticeShown();
    setShowCloudSaveNotice(false);
    setPendingGenerateAction(null);
    openLoginModal();
  };

  const onClickGenerateEmptySheet = async () => {
    // Check sheet limit for authenticated users
    if (isAuthenticated && !canCreate) {
      setShowLimitDialog(true);
      return;
    }

    // Show cloud save notice for non-authenticated users (once per 24h)
    if (shouldShowCloudNotice()) {
      setPendingGenerateAction('empty');
      setShowCloudSaveNotice(true);
      return;
    }

    executeEmptyGeneration();
  };

  const finalizeSheet = (sheet: CharacterSheet) => {
    // Always save to local storage (historic)
    saveSheetOnHistoric(sheet, isAuthenticated, sheets.length, () =>
      showAlert(
        `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens no histórico local. Remova uma ficha para salvar uma nova.`,
        'Limite Atingido'
      )
    );

    // Don't save to cloud automatically - user will decide
    setRandomSheet(sheet);
    setSheetSavedToCloud(false); // Mark as not saved to cloud yet
  };

  const handleWizardConfirm = (
    wizardSelections: import('@/interfaces/WizardSelections').WizardSelections
  ) => {
    setWizardModalOpen(false);
    setShowHistoric(false);
    const presentation = document.getElementById('presentation');
    if (presentation) {
      setInterval(() => {
        presentation.style.opacity = '0';
        presentation.style.display = 'none';
      }, 200);
    }

    // Generate level 1 sheet with wizard selections and race customization
    const level1Sheet = generateEmptySheet(
      selectedOptions,
      wizardSelections,
      raceCustomization
    );
    level1Sheet.bag = new Bag(level1Sheet.bag.equipments);

    // Clear race customization after use
    setRaceCustomization({});

    // If level > 1, open level up wizard modal
    if (selectedOptions.nivel > 1) {
      setPendingLevel1Sheet(level1Sheet);
      setLevelUpWizardModalOpen(true);
      return;
    }

    // Level 1 character - finalize immediately
    finalizeSheet(level1Sheet);
  };

  const handleLevelUpWizardConfirm = (
    levelUpSelections: import('@/interfaces/WizardSelections').LevelUpSelections[]
  ) => {
    setLevelUpWizardModalOpen(false);

    if (!pendingLevel1Sheet) return;

    // Apply all level ups sequentially
    let finalSheet = pendingLevel1Sheet;
    levelUpSelections.forEach((levelSelection) => {
      finalSheet = applyManualLevelUp(finalSheet, levelSelection);
    });

    // Finalize the sheet
    finalizeSheet(finalSheet);
    setPendingLevel1Sheet(null);
  };

  const handleLevelUpWizardCancel = () => {
    setLevelUpWizardModalOpen(false);
    setPendingLevel1Sheet(null);
  };

  // Handle save to cloud (explicit user action)
  const handleSaveToCloud = async () => {
    if (!randomSheet) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      history.push('/');
      showAlert(
        'Faça login para salvar suas fichas na nuvem e acessá-las de qualquer dispositivo.',
        'Login Necessário'
      );
      return;
    }

    // Check if this is a new sheet (not updating existing) and limit reached
    const isNewSheet = !cloudSheetId; // If no cloudSheetId, it's a new sheet
    if (isNewSheet && !canCreate) {
      setShowLimitDialog(true);
      return;
    }

    setLoadingSaveToCloud(true);
    try {
      await saveSheetToDatabase(
        randomSheet,
        isAuthenticated,
        createSheetAction
      );
      setSheetSavedToCloud(true);
      showAlert(
        'Ficha salva na nuvem com sucesso! Você pode acessá-la em "Meus Personagens".\n\n⚠️ Antes de utilizar em jogo, confirme que todos os valores de sua ficha estão corretos. Nosso sistema pode cometer erros. Você pode alterar sua ficha à vontade.',
        'Sucesso'
      );
    } catch (error) {
      showAlert('Erro ao salvar ficha na nuvem. Tente novamente.', 'Erro');
    } finally {
      setLoadingSaveToCloud(false);
    }
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

    // If this is a cloud sheet, update it in the database
    if (cloudSheetId) {
      // Create a serializable version of the sheet (remove Bag methods)
      const serializableSheet = {
        ...updatedSheet,
        bag: {
          equipments: updatedSheet.bag.equipments,
          spaces: updatedSheet.bag.spaces,
          armorPenalty: updatedSheet.bag.armorPenalty,
        },
      };

      // Update in Redux state (for immediate UI update)
      updateSheetAction(cloudSheetId, {
        name: updatedSheet.nome,
        sheetData: serializableSheet as any,
      });
    }
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
      devocao: { label: 'Não devoto', value: '--' },
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

  // Memoize options arrays to prevent re-creation on every render
  // This fixes performance issues with react-select keyboard navigation
  const racas = React.useMemo<SelectedOption[]>(
    () =>
      RACAS.map((raca: RaceWithSupplement) => ({
        value: raca.name,
        label: raca.name,
        supplementId: raca.supplementId,
        supplementName: raca.supplementName,
      })),
    [RACAS]
  );

  const rolesopt = React.useMemo<SelectedOption[]>(
    () =>
      Object.keys(roles).map((role) => ({
        value: role,
        label: role,
      })),
    []
  );

  const classesopt = React.useMemo<SelectedOption[]>(
    () =>
      CLASSES.map((classe: ClassWithSupplement) => ({
        value: classe.name,
        label: classe.name,
        supplementId: classe.supplementId,
        supplementName: classe.supplementName,
      })),
    [CLASSES]
  );

  const niveis = React.useMemo<{ value: string; label: string }[]>(() => {
    const result: { value: string; label: string }[] = [];
    for (let index = 1; index < 21; index += 1) {
      result.push({
        value: index as unknown as string,
        label: `Nível ${index}`,
      });
    }
    return result;
  }, []);

  const opcoesGerarItens = React.useMemo(
    () => [
      { value: 'nao-gerar', label: 'Não gerar' },
      {
        value: 'consumir-dinheiro',
        label: 'Gerar consumindo dinheiro inicial',
      },
      { value: 'sem-gastar-dinheiro', label: 'Gerar sem gastar dinheiro' },
    ],
    []
  );

  // Combina origens do core com origens dos suplementos ativos
  const origens = React.useMemo<SelectedOption[]>(
    () =>
      dataRegistry
        .getOriginsBySupplements(userSupplements)
        .map((origin: OriginWithSupplement) => ({
          value: origin.name,
          label: origin.name,
          supplementId: origin.supplementId,
          supplementName: origin.supplementName,
        })),
    [userSupplements]
  );

  const divindades = React.useMemo(
    () =>
      allDivindadeNames
        .filter((dv) => {
          if (selectedOptions.classe) {
            const classe = CLASSES.find(
              (c) => c.name === selectedOptions.classe
            );
            if (classe) return classe?.faithProbability?.[dv] !== 0;
            return true;
          }
          return true;
        })
        .map((sdv) => ({
          value: sdv,
          label: divindadeDisplayNames[sdv],
        })),
    [selectedOptions.classe, CLASSES]
  );

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
    option: (provided, state) => ({
      ...provided,
      fontSize: isMobile ? '16px' : '14px',
      padding: isMobile ? '12px' : '8px 12px',
      color: isDarkMode ? '#FAFAFA' : '#333333',
      backgroundColor: state.isSelected
        ? isDarkMode
          ? '#d13235'
          : '#deebff'
        : state.isFocused
        ? isDarkMode
          ? '#363636'
          : '#f2f2f2'
        : isDarkMode
        ? '#3D3D3D'
        : '#ffffff',
      ':active': {
        backgroundColor: isDarkMode ? '#d13235' : '#b2d4ff',
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: isDarkMode ? '#3D3D3D' : '#ffffff',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? '#FAFAFA' : '#333333',
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode ? '#FAFAFA' : '#333333',
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

  // Handle navigation blocking with custom dialog
  const handleNavigationAttempt = React.useCallback(
    (location: any) => {
      // Check ref first for immediate bypass
      if (allowNavigationRef.current) {
        return true;
      }

      if (randomSheet && !sheetSavedToCloud && !showHistoric) {
        setShowUnsavedDialog(true);
        setPendingNavigation(location.pathname);
        return false; // Block navigation
      }
      return true; // Allow navigation
    },
    [randomSheet, sheetSavedToCloud, showHistoric]
  );

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      // Set ref to true for immediate bypass of navigation blocking
      allowNavigationRef.current = true;
      // Navigate immediately
      history.push(pendingNavigation);
      setPendingNavigation(null);
      // Reset ref after navigation
      setTimeout(() => {
        allowNavigationRef.current = false;
      }, 100);
    }
  };

  // Golem Desperto modal handlers
  const handleGolemDespertoConfirm = (
    chassisId: string,
    energySourceId: string,
    sizeId: string
  ) => {
    // Pre-wizard flow: store customization and open wizard
    if (pendingWizardAfterCustomization) {
      setRaceCustomization((prev) => ({
        ...prev,
        golemChassis: chassisId,
        golemEnergySource: energySourceId,
        golemSize: sizeId,
      }));
      setShowGolemDespertoModal(false);
      setPendingWizardAfterCustomization(false);
      setWizardModalOpen(true);
      return;
    }

    // Post-random flow: apply customization to pending sheet
    if (!pendingGolemDespertoSheet) return;

    // Get base race and apply customization
    const baseRace = RACAS.find((r) => r.name === 'Golem Desperto');
    if (!baseRace) return;

    // Check if customization changed from what was originally generated
    const customizationChanged =
      chassisId !== pendingGolemDespertoSheet.raca.chassis ||
      energySourceId !== pendingGolemDespertoSheet.raca.energySource ||
      sizeId !== pendingGolemDespertoSheet.raca.sizeCategory;

    const customizedRace = applyGolemDespertoCustomization(
      baseRace,
      chassisId,
      energySourceId,
      sizeId
    );

    let finalSheet: CharacterSheet = {
      ...pendingGolemDespertoSheet,
      raca: customizedRace,
      raceChassis: chassisId,
      raceEnergySource: energySourceId,
      raceSizeCategory: sizeId,
      displacement: customizedRace.getDisplacement
        ? customizedRace.getDisplacement(customizedRace)
        : pendingGolemDespertoSheet.displacement,
      size: customizedRace.size || pendingGolemDespertoSheet.size,
    };

    // If customization changed, we need to reprocess the abilities
    // to execute their sheetActions (like adding spells for Fonte Sagrada)
    if (customizationChanged) {
      // Get the new chassis and energy source abilities
      const newAbilities = customizedRace.abilities.filter(
        (a) =>
          a.name.startsWith('Chassi') || a.name.startsWith('Fonte de Energia')
      );

      // Process each new ability's sheetActions
      newAbilities.forEach((ability) => {
        if (ability.sheetActions) {
          const [updatedSheet] = applyPower(finalSheet, ability);
          finalSheet = {
            ...updatedSheet,
            raceChassis: chassisId,
            raceEnergySource: energySourceId,
            raceSizeCategory: sizeId,
          };
        }
      });
    }

    // Save to historic
    saveSheetOnHistoric(finalSheet, isAuthenticated, sheets.length, () =>
      showAlert(
        `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens no histórico local. Remova uma ficha para salvar uma nova.`,
        'Limite Atingido'
      )
    );

    setRandomSheet(finalSheet);
    setSheetSavedToCloud(false);
    setShowGolemDespertoModal(false);
    setPendingGolemDespertoSheet(null);
  };

  const handleGolemDespertoCancel = () => {
    setShowGolemDespertoModal(false);
    setPendingGolemDespertoSheet(null);
    setPendingWizardAfterCustomization(false);
  };

  // Duende modal handlers
  const handleDuendeConfirm = (
    natureId: string,
    sizeId: string,
    bonusAttributes: Atributo[],
    presenteIds: string[],
    tabuSkill: Skill
  ) => {
    // Pre-wizard flow: store customization and open wizard
    if (pendingWizardAfterCustomization) {
      setRaceCustomization((prev) => ({
        ...prev,
        duendeNature: natureId,
        duendeSize: sizeId,
        duendeBonusAttributes: bonusAttributes,
        duendePresentes: presenteIds,
        duendeTabuSkill: tabuSkill,
      }));
      setShowDuendeModal(false);
      setPendingWizardAfterCustomization(false);
      setWizardModalOpen(true);
      return;
    }

    // Post-random flow: apply customization to pending sheet
    if (!pendingDuendeSheet) return;

    // Get base race and apply customization
    const baseRace = RACAS.find((r) => r.name === 'Duende');
    if (!baseRace) return;

    const customizedRace = applyDuendeCustomization(
      baseRace,
      natureId,
      sizeId,
      bonusAttributes,
      presenteIds,
      tabuSkill
    );

    let finalSheet: CharacterSheet = {
      ...pendingDuendeSheet,
      raca: customizedRace,
      raceSizeCategory: sizeId,
      displacement: customizedRace.getDisplacement
        ? customizedRace.getDisplacement(customizedRace)
        : pendingDuendeSheet.displacement,
      size: customizedRace.size || pendingDuendeSheet.size,
    };

    // Process each ability's sheetActions
    customizedRace.abilities.forEach((ability) => {
      if (ability.sheetActions || ability.sheetBonuses) {
        const [updatedSheet] = applyPower(finalSheet, ability);
        finalSheet = {
          ...updatedSheet,
          raceSizeCategory: sizeId,
        };
      }
    });

    // Save to historic
    saveSheetOnHistoric(finalSheet, isAuthenticated, sheets.length, () =>
      showAlert(
        `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens no histórico local. Remova uma ficha para salvar uma nova.`,
        'Limite Atingido'
      )
    );

    setRandomSheet(finalSheet);
    setSheetSavedToCloud(false);
    setShowDuendeModal(false);
    setPendingDuendeSheet(null);
  };

  const handleDuendeCancel = () => {
    setShowDuendeModal(false);
    setPendingDuendeSheet(null);
    setPendingWizardAfterCustomization(false);
  };

  // Moreau modal handlers
  const handleMoreauConfirm = (
    heritageName: string,
    bonusAttributes: Atributo[]
  ) => {
    // Pre-wizard flow: store customization and open wizard
    if (pendingWizardAfterCustomization) {
      setRaceCustomization((prev) => ({
        ...prev,
        moreauHeritage: heritageName,
        moreauBonusAttributes: bonusAttributes,
      }));
      setShowMoreauModal(false);
      setPendingWizardAfterCustomization(false);
      setWizardModalOpen(true);
      return;
    }

    // Post-random flow: apply customization to pending sheet
    if (!pendingMoreauSheet) return;

    // Get base race and apply customization
    const baseRace = RACAS.find((r) => r.name === 'Moreau');
    if (!baseRace) return;

    const customizedRace = applyMoreauCustomization(
      baseRace,
      heritageName as import('../../data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages').MoreauHeritageName,
      bonusAttributes
    );

    let finalSheet: CharacterSheet = {
      ...pendingMoreauSheet,
      raca: customizedRace,
      raceHeritage: heritageName,
      raceAttributeChoices: bonusAttributes,
      displacement: customizedRace.getDisplacement
        ? customizedRace.getDisplacement(customizedRace)
        : pendingMoreauSheet.displacement,
    };

    // Process each ability's sheetActions and sheetBonuses
    customizedRace.abilities.forEach((ability) => {
      if (ability.sheetActions || ability.sheetBonuses) {
        const [updatedSheet] = applyPower(finalSheet, ability);
        finalSheet = {
          ...updatedSheet,
          raceHeritage: heritageName,
          raceAttributeChoices: bonusAttributes,
        };
      }
    });

    // Save to historic
    saveSheetOnHistoric(finalSheet, isAuthenticated, sheets.length, () =>
      showAlert(
        `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens no histórico local. Remova uma ficha para salvar uma nova.`,
        'Limite Atingido'
      )
    );

    setRandomSheet(finalSheet);
    setSheetSavedToCloud(false);
    setShowMoreauModal(false);
    setPendingMoreauSheet(null);
  };

  const handleMoreauCancel = () => {
    setShowMoreauModal(false);
    setPendingMoreauSheet(null);
    setPendingWizardAfterCustomization(false);
  };

  return (
    <>
      <AlertDialog />
      <Prompt
        when={randomSheet !== undefined && !sheetSavedToCloud && !showHistoric}
        message={handleNavigationAttempt as any}
      />

      {/* Unsaved Changes Dialog */}
      <Dialog
        open={showUnsavedDialog}
        maxWidth='sm'
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>Ficha Não Salva</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem uma ficha não salva na nuvem. Se você sair agora, ela
            ficará salva apenas localmente no seu navegador. Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNavigation} variant='outlined'>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmNavigation}
            variant='contained'
            color='warning'
          >
            Sair Sem Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cloud Save Notice Dialog (for non-authenticated users) */}
      <Dialog open={showCloudSaveNotice} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudIcon color='primary' />
          Salve suas fichas na nuvem!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Criando uma conta gratuita, você pode salvar suas fichas na nuvem e
            acessá-las de qualquer dispositivo. Suas fichas ficam sincronizadas
            e seguras!
          </DialogContentText>
          <DialogContentText>
            Sem uma conta, suas fichas serão salvas apenas localmente no
            navegador e podem ser perdidas se você limpar os dados do navegador.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloudNoticeContinue} variant='outlined'>
            Continuar sem conta
          </Button>
          <Button
            onClick={handleCloudNoticeCreateAccount}
            variant='contained'
            color='primary'
          >
            Criar conta gratuita
          </Button>
        </DialogActions>
      </Dialog>

      {/* Golem Desperto Customization Modal */}
      {/* Show when: 1) Post-random flow with pending sheet, or 2) Pre-wizard flow */}
      {(pendingGolemDespertoSheet ||
        (pendingWizardAfterCustomization &&
          selectedOptions.raca === 'Golem Desperto')) && (
        <GolemDespertoCustomizationModal
          open={showGolemDespertoModal}
          initialChassis={pendingGolemDespertoSheet?.raca.chassis || 'ferro'}
          initialEnergySource={
            pendingGolemDespertoSheet?.raca.energySource || 'alquimica'
          }
          initialSize={pendingGolemDespertoSheet?.raca.sizeCategory || 'medio'}
          onConfirm={handleGolemDespertoConfirm}
          onCancel={handleGolemDespertoCancel}
        />
      )}

      {/* Duende Customization Modal */}
      {/* Show when: 1) Post-random flow with pending sheet, or 2) Pre-wizard flow */}
      {(pendingDuendeSheet ||
        (pendingWizardAfterCustomization &&
          selectedOptions.raca === 'Duende')) && (
        <DuendeCustomizationModal
          open={showDuendeModal}
          initialNature={pendingDuendeSheet?.raca.nature || 'animal'}
          initialSize={pendingDuendeSheet?.raca.sizeCategory || 'pequeno'}
          initialBonusAttributes={
            (pendingDuendeSheet?.raceAttributeChoices as Atributo[]) || [
              Atributo.FORCA,
              Atributo.DESTREZA,
            ]
          }
          initialPresentes={pendingDuendeSheet?.raca.presentPowers || []}
          initialTabuSkill={
            pendingDuendeSheet?.raca.tabuSkill || Skill.DIPLOMACIA
          }
          onConfirm={handleDuendeConfirm}
          onCancel={handleDuendeCancel}
        />
      )}

      {/* Moreau Customization Modal */}
      {/* Show when: 1) Post-random flow with pending sheet, or 2) Pre-wizard flow */}
      {(pendingMoreauSheet ||
        (pendingWizardAfterCustomization &&
          selectedOptions.raca === 'Moreau')) && (
        <MoreauCustomizationModal
          open={showMoreauModal}
          initialHeritage={pendingMoreauSheet?.raca.heritage || 'Coruja'}
          initialBonusAttributes={
            (pendingMoreauSheet?.raceAttributeChoices as Atributo[]) || []
          }
          onConfirm={handleMoreauConfirm}
          onCancel={handleMoreauCancel}
        />
      )}

      {/* Character Creation Wizard Modal */}
      <CharacterCreationWizardModal
        open={wizardModalOpen}
        onClose={() => setWizardModalOpen(false)}
        onConfirm={handleWizardConfirm}
        selectedOptions={selectedOptions}
        raceCustomization={raceCustomization}
      />

      {/* Level Up Wizard Modal */}
      {pendingLevel1Sheet && (
        <LevelUpWizardModal
          open={levelUpWizardModalOpen}
          initialSheet={pendingLevel1Sheet}
          targetLevel={selectedOptions.nivel}
          onConfirm={handleLevelUpWizardConfirm}
          onCancel={handleLevelUpWizardCancel}
        />
      )}

      {/* Sheet Limit Dialog */}
      <SheetLimitDialog
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        currentCount={totalSheets}
        maxCount={maxSheets}
        tierName={tier === SubscriptionTier.FREE ? 'Gratuito' : tier}
      />

      <div id='main-screen'>
        <Container
          maxWidth='xl'
          sx={{
            px: { xs: 1, sm: 2 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Card
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 2,
              overflow: 'visible',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3,
              }}
            >
              <Typography
                variant={isSmall ? 'h6' : 'h5'}
                component='h1'
                sx={{ fontWeight: 'bold' }}
              >
                Criar Nova Ficha
              </Typography>
              <Tooltip title='Ver Histórico Local'>
                <IconButton
                  onClick={onClickShowHistoric}
                  size='small'
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={2}>
              {/* Race Selection */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  Raça
                </Typography>
                <Select
                  options={[{ value: '', label: 'Aleatória' }, ...racas]}
                  placeholder='Selecione uma raça'
                  onChange={onSelectRaca}
                  isSearchable
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  formatOptionLabel={formatOptionLabel}
                  theme={(selectTheme) => ({
                    ...selectTheme,
                    colors: {
                      ...formThemeColors,
                    },
                  })}
                />
              </Grid>

              {/* Class Selection */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                        { value: '', label: 'Aleatória' },
                        ...classesopt,
                      ],
                    },
                    {
                      label: 'Roles',
                      options: [{ value: '', label: 'Aleatória' }, ...rolesopt],
                    },
                  ]}
                  placeholder='Selecione uma classe ou role'
                  formatGroupLabel={fmtGroupLabel}
                  formatOptionLabel={formatOptionLabel}
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography
                  variant='body2'
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  Origem
                </Typography>
                <Select
                  placeholder='Selecione uma origem'
                  options={[{ value: '', label: 'Aleatória' }, ...origens]}
                  isSearchable
                  onChange={onSelectOrigin}
                  isDisabled={selectedOptions.raca === 'Golem'}
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  formatOptionLabel={formatOptionLabel}
                  theme={(selectTheme) => ({
                    ...selectTheme,
                    colors: {
                      ...formThemeColors,
                    },
                  })}
                />
              </Grid>

              {/* Divinity Selection */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={0.5}
                  sx={{ mb: 1 }}
                >
                  <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                    Divindade
                  </Typography>
                  <Tooltip
                    title={
                      <span>
                        As opções em &quot;Fichas aleatórias&quot; só funcionam
                        para geração automática:
                        <br />
                        <br />
                        <strong>🎯 Qualquer divindade:</strong> sempre escolhe
                        uma divindade permitida pela classe.
                        <br />
                        <br />
                        <strong>🎲 Aleatório:</strong> pode gerar um personagem
                        devoto ou não devoto aleatoriamente.
                      </span>
                    }
                    arrow
                    placement='top'
                  >
                    <HelpIcon
                      sx={{
                        fontSize: 16,
                        color: 'text.secondary',
                        cursor: 'help',
                      }}
                    />
                  </Tooltip>
                </Stack>
                <Select
                  placeholder='Divindades'
                  options={[
                    {
                      label: '',
                      options: [{ value: '--', label: 'Não devoto' }],
                    },
                    {
                      label: 'Fichas aleatórias automáticas',
                      options: [
                        { value: '**', label: '🎯 Qualquer divindade' },
                        { value: '', label: '🎲 Aleatório' },
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                size={{ xs: 12, sm: 6, md: 4 }}
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

            {/* System & Supplements Indicator */}
            {user?.enabledSupplements && user.enabledSupplements.length > 0 && (
              <Box
                sx={{
                  mt: 3,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontWeight: 'medium' }}
                  >
                    Sistema e Suplementos Ativos:
                  </Typography>
                  <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                    {user.enabledSupplements.map((suppId) => {
                      const supplement = SUPPLEMENT_METADATA[suppId];
                      return supplement ? (
                        <Chip
                          key={suppId}
                          label={supplement.name}
                          size='small'
                          color='primary'
                          variant='outlined'
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ) : null;
                    })}
                  </Stack>
                </Stack>
              </Box>
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
                  onClick={onClickGenerateEmptySheet}
                  disabled={!canGenerateEmptySheet}
                  size={isMobile ? 'large' : 'medium'}
                  fullWidth={isMobile}
                  sx={{
                    minHeight: isMobile ? '48px' : 'auto',
                    fontSize: isMobile ? '16px' : '14px',
                  }}
                >
                  Criar Nova Ficha
                </Button>

                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={onClickGenerate}
                  size={isMobile ? 'large' : 'medium'}
                  fullWidth={isMobile}
                  sx={{
                    minHeight: isMobile ? '48px' : 'auto',
                    fontSize: isMobile ? '16px' : '14px',
                  }}
                  startIcon={<CasinoIcon />}
                >
                  Preencher Automaticamente
                </Button>
              </Stack>

              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '14px', sm: '13px' },
                  lineHeight: 1.4,
                  mb: 1,
                }}
              >
                Preencha os campos acima para criar sua ficha personalizada.
                Todos os campos são obrigatórios.
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '13px', sm: '12px' },
                  lineHeight: 1.4,
                  fontStyle: 'italic',
                }}
              >
                💡 Dica: Use &ldquo;Preencher Automaticamente&rdquo; para
                agilizar o processo com escolhas aleatórias que você pode editar
                depois.
              </Typography>
            </Box>
          </Card>

          {randomSheet && (
            <Card sx={{ p: 2, mb: 2 }}>
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
                {/* Save to Cloud Button */}
                <Button
                  variant={sheetSavedToCloud ? 'contained' : 'outlined'}
                  color={sheetSavedToCloud ? 'success' : 'warning'}
                  onClick={handleSaveToCloud}
                  fullWidth={isMobile}
                  disabled={loadingSaveToCloud || sheetSavedToCloud}
                  sx={{
                    justifyContent: 'flex-start',
                    borderWidth: sheetSavedToCloud ? 1 : 2,
                    fontWeight: sheetSavedToCloud ? 'normal' : 'bold',
                  }}
                  startIcon={
                    loadingSaveToCloud ? (
                      <CircularProgress size={20} />
                    ) : sheetSavedToCloud ? (
                      <CheckCircleIcon />
                    ) : (
                      <WarningIcon />
                    )
                  }
                >
                  {loadingSaveToCloud
                    ? 'Salvando...'
                    : sheetSavedToCloud
                    ? 'Salvo na Nuvem'
                    : 'Não Salvo - Clique para Salvar'}
                </Button>

                {/* PDF Export Button */}
                <Button
                  variant='outlined'
                  onClick={preparePrint}
                  fullWidth={isMobile}
                  disabled={loadingPDF}
                  sx={{ justifyContent: 'flex-start' }}
                  startIcon={
                    loadingPDF ? <CircularProgress size={20} /> : <PdfIcon />
                  }
                >
                  {loadingPDF ? 'Gerando PDF...' : 'Gerar PDF da Ficha'}
                </Button>

                {/* Foundry Export Button */}
                <Button
                  variant='outlined'
                  onClick={exportFoundry}
                  fullWidth={isMobile}
                  disabled={loadingFoundry}
                  sx={{ justifyContent: 'flex-start' }}
                  startIcon={
                    loadingFoundry ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CasinoIcon />
                    )
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
