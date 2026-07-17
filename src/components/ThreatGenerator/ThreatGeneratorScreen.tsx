/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Stack,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
} from '@mui/material';
import type { StepIconProps } from '@mui/material/StepIcon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import FolderIcon from '@mui/icons-material/Folder';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SheetsService from '@/services/sheets.service';
import { SEO, getPageSEO } from '../SEO';
import { useAlert } from '../../hooks/useDialog';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSheets } from '../../hooks/useSheets';
import { useSheetLimit } from '../../hooks/useSheetLimit';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionTier } from '../../types/subscription.types';
import {
  ThreatSheet,
  TreasureLevel,
  DEFAULT_RESISTANCE_ASSIGNMENTS,
  normalizeThreatSheet,
} from '../../interfaces/ThreatSheet';
import {
  generateThreatId,
  createDefaultAttributes,
  validateThreat,
  calculateCombatStats,
} from '../../functions/threatGenerator';
import { saveThreat } from '../../store/slices/threatStorage';
import { RootState } from '../../store';
import { FolderInfo } from './ThreatViewCloudWrapper';
import StepGeneral from './steps/StepGeneral';
import StepAttributesSkills from './steps/StepAttributesSkills';
import StepAttacks from './steps/StepAttacks';
import StepAbilities from './steps/StepAbilities';
import StepSpells from './steps/StepSpells';
import StepTreasure from './steps/StepTreasure';
import StepSummary from './steps/StepSummary';
import ThreatResult from './ThreatResult';
import SheetLimitDialog from '../common/SheetLimitDialog';

interface ThreatGeneratorScreenProps {
  isDarkMode: boolean;
}

const STEP_CONFIG = [
  { label: 'Informações Gerais', icon: <BadgeOutlinedIcon /> },
  { label: 'Atributos e Perícias', icon: <BarChartOutlinedIcon /> },
  { label: 'Ataques', icon: <GpsFixedIcon /> },
  { label: 'Habilidades', icon: <AutoAwesomeIcon /> },
  { label: 'Magias', icon: <AutoFixHighIcon /> },
  { label: 'Tesouro e Equipamentos', icon: <DiamondOutlinedIcon /> },
  { label: 'Resumo', icon: <FactCheckOutlinedIcon /> },
];

const ThreatStepIcon: React.FC<StepIconProps> = ({
  active,
  completed,
  icon,
}) => {
  const stepIndex = Number(icon) - 1;
  const highlighted = active || completed;
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s ease',
        bgcolor: (t) =>
          highlighted ? t.palette.primary.main : t.palette.action.selected,
        color: (t) =>
          highlighted
            ? t.palette.primary.contrastText
            : t.palette.text.secondary,
        boxShadow: (t) =>
          active ? `0 0 0 4px ${t.palette.primary.main}33` : 'none',
      }}
    >
      {completed ? (
        <CheckIcon fontSize='small' />
      ) : (
        STEP_CONFIG[stepIndex]?.icon
      )}
    </Box>
  );
};

const ThreatGeneratorScreen: React.FC<ThreatGeneratorScreenProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showAlert, AlertDialog } = useAlert();
  const { isAuthenticated } = useAuth();
  const { createSheet: createSheetAction, updateSheet: updateSheetAction } =
    useSheets();
  const { tier } = useSubscription();
  const { menaceCount, maxMenaceSheets, canCreateMenace } = useSheetLimit();
  const { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } =
    useAuthContext();

  // Get threats from store for editing
  const threats = useSelector(
    (state: RootState) => state.threatStorage.threats
  );

  const [activeStep, setActiveStep] = useState(0);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedToCloud, setIsSavedToCloud] = useState(false);
  const [cloudThreatId, setCloudThreatId] = useState<string | null>(null);
  // Folder context from MyCharactersPage — new threats are created inside it
  const [targetFolder, setTargetFolder] = useState<FolderInfo | null>(null);
  const [threat, setThreat] = useState<Partial<ThreatSheet>>({
    id: generateThreatId(),
    attributes: createDefaultAttributes(),
    attacks: [],
    abilities: [],
    spells: [],
    skills: [],
    specialQualities: '',
    equipment: '',
    treasureLevel: TreasureLevel.STANDARD,
    hasManaPoints: false,
    resistanceAssignments: DEFAULT_RESISTANCE_ASSIGNMENTS,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Warn before leaving if threat is not saved to cloud (refresh/close tab)
  // Note: Browser security forces native alert for beforeunload
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there's significant progress (has a name) and not saved
      const hasProgress = threat?.name && threat.name.trim() !== '';
      if (hasProgress && !isSavedToCloud && !showResult) {
        e.preventDefault();
        e.returnValue =
          'Você tem uma ameaça não salva. Deseja sair mesmo assim?';
        return e.returnValue;
      }
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [threat?.name, isSavedToCloud, showResult]);

  // Register unsaved changes checker for logout flow
  React.useEffect(() => {
    registerUnsavedChangesChecker(() => {
      const hasProgress = threat?.name && threat.name.trim() !== '';
      return Boolean(hasProgress && !isSavedToCloud && !showResult);
    });
    return () => unregisterUnsavedChangesChecker();
  }, [
    threat?.name,
    isSavedToCloud,
    showResult,
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
  ]);

  // Check for edit mode on component mount
  React.useEffect(() => {
    const locationState = location.state as any;

    // Capture folder context before the edit flows clear location.state
    if (locationState?.folderInfo) {
      setTargetFolder(locationState.folderInfo as FolderInfo);
    }

    // Cloud threat edit with full data (from ThreatViewCloudWrapper)
    if (locationState?.cloudThreat?.sheetData) {
      const { cloudThreat } = locationState;
      const threatData = normalizeThreatSheet(
        cloudThreat.sheetData as ThreatSheet
      );

      setThreat(threatData);
      setIsEditing(true);
      setIsSavedToCloud(true);
      setCloudThreatId(cloudThreat.id);
      history.replace('/gerador-ameacas', {});
      return;
    }

    // Cloud threat edit with only id (from MyCharactersPage)
    if (locationState?.cloudThreatId) {
      const id = locationState.cloudThreatId as string;
      setCloudThreatId(id);
      history.replace('/gerador-ameacas', {});

      const loadCloudThreat = async () => {
        try {
          const fullSheet = await SheetsService.getSheetById(id);
          const threatData = normalizeThreatSheet(
            fullSheet.sheetData as unknown as ThreatSheet
          );
          if (fullSheet.image) {
            threatData.imageUrl = fullSheet.image;
          }
          setThreat(threatData);
          setIsEditing(true);
          setIsSavedToCloud(true);
        } catch (err) {
          console.error('Failed to load cloud threat for editing:', err);
          showAlert(
            'Não foi possível carregar a ameaça para edição.',
            'Erro ao Carregar'
          );
        }
      };

      loadCloudThreat();
      return;
    }

    // Check for local threat edit via query param
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');

    if (editId) {
      const threatToEdit = threats.find((t) => t.id === editId);
      if (threatToEdit) {
        setThreat(normalizeThreatSheet(threatToEdit));
        setIsEditing(true);
        history.replace('/threat-generator');
      }
    }
  }, [location.search, location.state, threats, history, showAlert]);

  const steps = STEP_CONFIG.map((s) => s.label);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);

    // Sempre rola para o topo ao avançar de etapa
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const handleFinish = async () => {
    const errors = validateThreat(threat);
    if (errors.length > 0) {
      showAlert(
        `Erro na validação:\n${errors.join('\n')}`,
        'Erro de Validação'
      );
      return;
    }

    // Check sheet limit for authenticated users creating new threats
    // Don't check if editing existing threat
    if (isAuthenticated && !isEditing && !canCreateMenace) {
      setShowLimitDialog(true);
      return;
    }

    // Save threat to localStorage automatically (discreto)
    const completeThreat = {
      ...threat,
      updatedAt: new Date(),
    } as ThreatSheet;

    dispatch(saveThreat(completeThreat));

    // If editing a cloud threat, update it in the cloud
    if (cloudThreatId && isSavedToCloud) {
      try {
        await updateSheetAction(cloudThreatId, {
          name: completeThreat.name,
          sheetData: {
            ...completeThreat,
            isThreat: true,
          } as any,
          image: completeThreat.imageUrl,
        });
      } catch (error) {
        console.error('Failed to update cloud threat:', error);
        showAlert(
          'Não foi possível atualizar a ameaça na nuvem.',
          'Erro ao Atualizar'
        );
      }
    }

    setShowResult(true);
  };

  const handleSaveToCloud = async () => {
    if (!isAuthenticated || !threat || isSavedToCloud) return;

    // Check sheet limit for new threats (not updates)
    if (!cloudThreatId && !canCreateMenace) {
      setShowLimitDialog(true);
      return;
    }

    try {
      const completeThreat = threat as ThreatSheet;

      // Create sheet in cloud with isThreat flag
      const result = await createSheetAction({
        name: completeThreat.name,
        sheetData: {
          ...completeThreat,
          isThreat: true,
        } as any,
        image: completeThreat.imageUrl,
        folderId: targetFolder?.folderId ?? undefined,
      });

      if (result.type.endsWith('/fulfilled')) {
        const cloudSheet = result.payload as any;
        setCloudThreatId(cloudSheet.id);
        setIsSavedToCloud(true);
        showAlert('Ameaça salva na nuvem com sucesso!', 'Sucesso');
      }
    } catch (error) {
      console.error('Failed to save threat to cloud:', error);
      showAlert(
        'Não foi possível salvar a ameaça na nuvem. Ela permanece salva localmente.',
        'Erro ao Salvar'
      );
    }
  };

  const handleEdit = () => {
    setShowResult(false);
    setActiveStep(0);
  };

  const handleViewHistory = () => {
    history.push('/threat-history');
  };

  const updateThreat = (updates: Partial<ThreatSheet>) => {
    setThreat((prev) => {
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date(),
      };

      // Auto-calculate combat stats when role/challenge level/hasManaPoints
      // changes — EXCETO quando o chamador já forneceu combatStats explícito
      // (ex.: edição manual de Defesa/PV/CD ou toggle de mana aditivo na etapa
      // de combate). Isso evita que recálculos apaguem ajustes feitos à mão.
      if (
        updates.combatStats === undefined &&
        (updates.role ||
          updates.challengeLevel ||
          updates.hasManaPoints !== undefined) &&
        updated.role &&
        updated.challengeLevel
      ) {
        try {
          updated.combatStats = calculateCombatStats(
            updated.role,
            updated.challengeLevel,
            updated.hasManaPoints || false
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error calculating combat stats:', error);
        }
      }

      return updated;
    });
  };

  const isLastStep = activeStep === steps.length - 1;
  const canProceed = true; // TODO: Implementar validação por etapa

  // Renderizar componente da etapa atual
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <StepGeneral threat={threat} onUpdate={updateThreat} />;
      case 1:
        return <StepAttributesSkills threat={threat} onUpdate={updateThreat} />;
      case 2:
        return <StepAttacks threat={threat} onUpdate={updateThreat} />;
      case 3:
        return <StepAbilities threat={threat} onUpdate={updateThreat} />;
      case 4:
        return <StepSpells threat={threat} onUpdate={updateThreat} />;
      case 5:
        return <StepTreasure threat={threat} onUpdate={updateThreat} />;
      case 6:
        return <StepSummary threat={threat} onUpdate={updateThreat} />;
      default:
        return <div>Etapa desconhecida</div>;
    }
  };

  const threatGeneratorSEO = getPageSEO('threatGenerator');

  return (
    <>
      <AlertDialog />
      {/* Sheet Limit Dialog */}
      <SheetLimitDialog
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        currentCount={menaceCount}
        maxCount={maxMenaceSheets}
        tierName={tier === SubscriptionTier.FREE ? 'Gratuito' : tier}
      />
      {showResult && threat ? (
        <ThreatResult
          threat={threat as ThreatSheet}
          onEdit={handleEdit}
          isSavedToCloud={isSavedToCloud}
          onSaveToCloud={handleSaveToCloud}
          onThreatUpdate={(updated) => setThreat(updated)}
        />
      ) : (
        <>
          <SEO
            title={threatGeneratorSEO.title}
            description={threatGeneratorSEO.description}
            url='/gerador-ameacas'
          />

          <Container maxWidth='lg' sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
              {/* Header */}
              <Box
                sx={{
                  background: (muiTheme) =>
                    `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
                  color: 'white',
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant={isMobile ? 'h5' : 'h4'}
                      component='h1'
                      gutterBottom
                    >
                      {isEditing ? 'Editando Ameaça' : 'Gerador de Ameaças'}
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{
                        opacity: 0.9,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {threat.name?.trim()
                        ? `${threat.name}${
                            threat.challengeLevel
                              ? ` · ND ${threat.challengeLevel}`
                              : ''
                          }`
                        : 'Crie inimigos e NPCs seguindo as regras do Tormenta 20'}
                    </Typography>
                    {targetFolder && !cloudThreatId && (
                      <Chip
                        icon={<FolderIcon />}
                        label={`Salvando em: ${targetFolder.folderName}`}
                        size='small'
                        sx={{
                          mt: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' },
                        }}
                      />
                    )}
                  </Box>
                  <IconButton
                    onClick={handleViewHistory}
                    sx={{ color: 'white', flexShrink: 0 }}
                    title='Ver Histórico'
                  >
                    <HistoryIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Stepper */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stepper
                  activeStep={activeStep}
                  orientation={isMobile ? 'vertical' : 'horizontal'}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: isMobile ? '0.875rem' : '1rem',
                    },
                  }}
                >
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        slots={{ stepIcon: ThreatStepIcon }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            '& .MuiStepLabel-label': {
                              color: theme.palette.primary.main,
                            },
                          },
                        }}
                        onClick={() => handleStepClick(index)}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Step Content */}
              <Fade in key={activeStep} timeout={350}>
                <Box sx={{ minHeight: 400 }}>
                  {renderStepContent(activeStep)}
                </Box>
              </Fade>

              {/* Navigation */}
              <Box
                sx={{
                  p: 3,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <Stack
                  direction='row'
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant='outlined'
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    startIcon={<ArrowBackIcon />}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    Anterior
                  </Button>

                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    Etapa {activeStep + 1} de {steps.length}
                  </Typography>

                  {isLastStep ? (
                    <Button
                      variant='contained'
                      onClick={handleFinish}
                      disabled={!canProceed}
                      startIcon={<CheckIcon />}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      {isEditing ? 'Salvar Alterações' : 'Finalizar'}
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      onClick={handleNext}
                      disabled={!canProceed}
                      endIcon={<ArrowForwardIcon />}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Próximo
                    </Button>
                  )}
                </Stack>
              </Box>
            </Paper>
          </Container>
        </>
      )}
    </>
  );
};

export default ThreatGeneratorScreen;
