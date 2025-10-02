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
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAlert } from '../../hooks/useDialog';
import { useAuth } from '../../hooks/useAuth';
import { useSheets } from '../../hooks/useSheets';
import {
  ThreatSheet,
  TreasureLevel,
  ResistanceType,
  ResistanceAssignments,
} from '../../interfaces/ThreatSheet';
import {
  generateThreatId,
  createDefaultAttributes,
  validateThreat,
  calculateCombatStats,
} from '../../functions/threatGenerator';
import { saveThreat } from '../../store/slices/threatStorage';
import { RootState } from '../../store';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import StepFive from './steps/StepFive';
import StepSix from './steps/StepSix';
import StepSeven from './steps/StepSeven';
import StepEight from './steps/StepEight';
import ThreatResult from './ThreatResult';

interface ThreatGeneratorScreenProps {
  isDarkMode: boolean;
}

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

  // Get threats from store for editing
  const threats = useSelector(
    (state: RootState) => state.threatStorage.threats
  );

  const [activeStep, setActiveStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedToCloud, setIsSavedToCloud] = useState(false);
  const [cloudThreatId, setCloudThreatId] = useState<string | null>(null);
  const [threat, setThreat] = useState<Partial<ThreatSheet>>({
    id: generateThreatId(),
    attributes: createDefaultAttributes(),
    attacks: [],
    abilities: [],
    skills: [],
    equipment: '',
    treasureLevel: TreasureLevel.STANDARD,
    hasManaPoints: false,
    resistanceAssignments: {
      Fortitude: ResistanceType.STRONG,
      Reflexos: ResistanceType.MEDIUM,
      Vontade: ResistanceType.WEAK,
    } as ResistanceAssignments,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Check for edit mode on component mount
  React.useEffect(() => {
    // Check for cloud threat passed via location.state
    const locationState = location.state as any;
    if (locationState?.cloudThreat) {
      const cloudThreat = locationState.cloudThreat;
      const threatData = cloudThreat.sheetData as ThreatSheet;

      setThreat(threatData);
      setIsEditing(true);
      setIsSavedToCloud(true);
      setCloudThreatId(cloudThreat.id);

      // Clear the state to prevent reloading
      history.replace('/gerador-ameacas', {});
      return;
    }

    // Check for local threat edit via query param
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');

    if (editId) {
      const threatToEdit = threats.find((t) => t.id === editId);
      if (threatToEdit) {
        setThreat(threatToEdit);
        setIsEditing(true);
        // Clear the URL parameter
        history.replace('/threat-generator');
      }
    }
  }, [location.search, location.state, threats, history]);

  const steps = [
    'Tipo, Tamanho e Papel',
    'Nível de Desafio',
    'Estatísticas de Combate',
    'Ataques',
    'Habilidades',
    'Atributos e Perícias',
    'Equipamentos',
    'Nome e Finalizar',
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);

    // Scroll to top on mobile when going to next step
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

    try {
      const completeThreat = threat as ThreatSheet;

      // Create sheet in cloud with isThreat flag
      const result = await createSheetAction({
        name: completeThreat.name,
        sheetData: {
          ...completeThreat,
          isThreat: true,
        } as any,
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

      // Auto-calculate combat stats when role/challenge level changes
      if (
        (updates.role || updates.challengeLevel) &&
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

  // Show result if threat is complete
  if (showResult && threat) {
    return (
      <ThreatResult
        threat={threat as ThreatSheet}
        onEdit={handleEdit}
        isSavedToCloud={isSavedToCloud}
        onSaveToCloud={handleSaveToCloud}
      />
    );
  }

  // Renderizar componente da etapa atual
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <StepOne threat={threat} onUpdate={updateThreat} />;
      case 1:
        return <StepTwo threat={threat} onUpdate={updateThreat} />;
      case 2:
        return <StepThree threat={threat} onUpdate={updateThreat} />;
      case 3:
        return <StepFour threat={threat} onUpdate={updateThreat} />;
      case 4:
        return <StepFive threat={threat} onUpdate={updateThreat} />;
      case 5:
        return <StepSix threat={threat} onUpdate={updateThreat} />;
      case 6:
        return <StepSeven threat={threat} onUpdate={updateThreat} />;
      case 7:
        return <StepEight threat={threat} onUpdate={updateThreat} />;
      default:
        return <div>Etapa desconhecida</div>;
    }
  };

  return (
    <>
      <AlertDialog />
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
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Box>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component='h1'
                  gutterBottom
                >
                  {isEditing ? 'Editando Ameaça' : 'Gerador de Ameaças'}
                </Typography>
                <Typography variant='body1' sx={{ opacity: 0.9 }}>
                  Crie inimigos e NPCs seguindo as regras do Tormenta 20
                </Typography>
              </Box>
              <IconButton
                onClick={handleViewHistory}
                sx={{ color: 'white' }}
                title='Ver Histórico'
              >
                <HistoryIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Stepper */}
          <Box
            sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
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
          <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

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
              justifyContent='space-between'
              alignItems='center'
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
                color='text.secondary'
                sx={{ display: { xs: 'none', sm: 'block' } }}
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
  );
};

export default ThreatGeneratorScreen;
