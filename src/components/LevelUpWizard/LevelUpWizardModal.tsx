import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
} from '@mui/material';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { ClassPower } from '@/interfaces/Class';
import { GeneralPower } from '@/interfaces/Poderes';
import { Spell } from '@/interfaces/Spells';
import {
  getAllowedClassPowers,
  getPowersAllowedByRequirements,
  getWeightedInventorClassPowers,
} from '@/functions/powers';
import { getSpellsOfCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { getArcaneSpellsOfCircle } from '@/data/systems/tormenta20/magias/arcane';
import { getDivineSpellsOfCircle } from '@/data/systems/tormenta20/magias/divine';
import {
  getPowerSelectionRequirements,
  getFilteredAvailableOptions,
} from '@/functions/powers/manualPowerSelection';
import { getCurrentPlateau } from '@/functions/powers/general';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { SheetActionHistoryEntry } from '@/interfaces/CharacterSheet';
import PowerSelectionStep from './steps/PowerSelectionStep';
import LevelSpellSelectionStep from './steps/LevelSpellSelectionStep';
import PowerEffectSelectionStep from '../CharacterCreationWizard/steps/PowerEffectSelectionStep';

interface LevelUpWizardModalProps {
  open: boolean;
  initialSheet: CharacterSheet; // Level 1 sheet
  targetLevel: number; // Final level to reach
  onConfirm: (levelUpSelections: LevelUpSelections[]) => void;
  onCancel: () => void;
}

const LevelUpWizardModal: React.FC<LevelUpWizardModalProps> = ({
  open,
  initialSheet,
  targetLevel,
  onConfirm,
  onCancel,
}) => {
  // Current level being processed (starts at 2)
  const [currentLevel, setCurrentLevel] = useState(2);

  // All level up selections (array indexed by level - 2)
  const [allLevelSelections, setAllLevelSelections] = useState<
    LevelUpSelections[]
  >([]);

  // Current level selections
  const [currentLevelSelection, setCurrentLevelSelection] =
    useState<LevelUpSelections>({
      level: 2,
      powerChoice: 'class',
    });

  // Current step within this level
  const [activeStep, setActiveStep] = useState(0);

  // Confirmation dialog state for cancel action
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  // Simulated sheet at current level (for filtering powers/spells)
  const [simulatedSheet, setSimulatedSheet] =
    useState<CharacterSheet>(initialSheet);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentLevel(2);
      setAllLevelSelections([]);
      setCurrentLevelSelection({
        level: 2,
        powerChoice: 'class',
      });
      setActiveStep(0);
      setSimulatedSheet(initialSheet);
      setConfirmCloseOpen(false);
    }
  }, [open, initialSheet]);

  // Get available powers for current simulated sheet
  const getAvailablePowers = (): {
    classPowers: ClassPower[];
    generalPowers: GeneralPower[];
  } => {
    const classPowers =
      simulatedSheet.classe.name === 'Inventor'
        ? getWeightedInventorClassPowers(simulatedSheet)
        : getAllowedClassPowers(simulatedSheet);
    const generalPowers = getPowersAllowedByRequirements(simulatedSheet);

    return { classPowers, generalPowers };
  };

  // Get spell info for current level
  const getSpellInfo = (): {
    shouldLearnSpells: boolean;
    spellCount: number;
    spellCircle: number;
    availableSpells: Spell[];
  } | null => {
    if (!simulatedSheet.classe.spellPath) {
      return null;
    }

    const { spellPath } = simulatedSheet.classe;
    const spellCount = spellPath.qtySpellsLearnAtLevel(currentLevel);

    if (spellCount === 0) {
      return null; // No spells this level
    }

    const spellCircle = spellPath.spellCircleAvailableAtLevel(currentLevel);

    // Get spells based on spell type
    let allSpellsOfCircle: Spell[] = [];
    if (spellPath.spellType === 'Arcane') {
      allSpellsOfCircle = getArcaneSpellsOfCircle(spellCircle);
    } else if (spellPath.spellType === 'Divine') {
      allSpellsOfCircle = getDivineSpellsOfCircle(spellCircle);
    } else if (spellPath.spellType === 'Both') {
      // Combine arcane and divine spells, remove duplicates
      const arcaneSpells = getArcaneSpellsOfCircle(spellCircle);
      const divineSpells = getDivineSpellsOfCircle(spellCircle);
      const combined = [...arcaneSpells, ...divineSpells];
      allSpellsOfCircle = combined.filter(
        (spell, index, self) =>
          index === self.findIndex((s) => s.nome === spell.nome)
      );
    } else {
      // Fallback to general spells
      allSpellsOfCircle = getSpellsOfCircle(spellCircle);
    }

    // Filter out spells already known
    const knownSpellNames = simulatedSheet.spells.map((s) => s.nome);

    // Filter by schools (if applicable)
    let filteredSpells = allSpellsOfCircle;
    if (spellPath.schools && spellPath.schools.length > 0) {
      filteredSpells = allSpellsOfCircle.filter((spell) =>
        spellPath.schools!.includes(spell.school)
      );
    }

    // Filter out already known spells
    const availableSpells = filteredSpells.filter(
      (s) => !knownSpellNames.includes(s.nome)
    );

    return {
      shouldLearnSpells: true,
      spellCount,
      spellCircle,
      availableSpells,
    };
  };

  // Check if selected power needs effect selections
  const needsPowerEffectSelections = (): boolean => {
    const power =
      currentLevelSelection.powerChoice === 'class'
        ? currentLevelSelection.selectedClassPower
        : currentLevelSelection.selectedGeneralPower;

    if (!power) return false;

    const requirements = getPowerSelectionRequirements(power);
    return requirements !== null && requirements.requirements.length > 0;
  };

  // Check if class abilities for this level need effect selections
  const needsAbilityEffectSelections = (): boolean => {
    const originalAbilities =
      simulatedSheet.classe.originalAbilities ||
      simulatedSheet.classe.abilities;
    const newlyAvailableAbilities = originalAbilities.filter(
      (ability) => ability.nivel === currentLevel
    );

    return newlyAvailableAbilities.some((ability) => {
      const requirements = getPowerSelectionRequirements(ability);
      return requirements !== null && requirements.requirements.length > 0;
    });
  };

  // Build steps for current level
  const getSteps = (): string[] => {
    const steps: string[] = [];
    steps.push('Escolha de Poder');

    if (needsPowerEffectSelections()) {
      steps.push('Efeitos do Poder');
    }

    if (needsAbilityEffectSelections()) {
      steps.push('Efeitos de Habilidades');
    }

    const spellInfo = getSpellInfo();
    if (spellInfo && spellInfo.shouldLearnSpells) {
      steps.push('Seleção de Magias');
    }

    return steps;
  };

  const steps = getSteps();

  // Validate current step completion
  const isStepComplete = (stepIndex: number): boolean => {
    const stepName = steps[stepIndex];

    switch (stepName) {
      case 'Escolha de Poder':
        return (
          (currentLevelSelection.powerChoice === 'class' &&
            currentLevelSelection.selectedClassPower !== undefined) ||
          (currentLevelSelection.powerChoice === 'general' &&
            currentLevelSelection.selectedGeneralPower !== undefined)
        );

      case 'Efeitos do Poder': {
        const power =
          currentLevelSelection.powerChoice === 'class'
            ? currentLevelSelection.selectedClassPower
            : currentLevelSelection.selectedGeneralPower;

        if (!power) return false;

        const requirements = getPowerSelectionRequirements(power);
        if (!requirements) return true;

        // Get selections keyed by power name
        const allEffectSelections =
          currentLevelSelection.powerEffectSelections || {};
        const effectSelections = allEffectSelections[power.name] || {};

        // Helper to get selection count
        const getSelectionCount = (powerName: string, type: string): number => {
          const pSelections = allEffectSelections[powerName] || {};
          switch (type) {
            case 'learnSkill':
              return pSelections.skills?.length || 0;
            case 'addProficiency':
              return pSelections.proficiencies?.length || 0;
            case 'getGeneralPower':
              return pSelections.powers?.length || 0;
            case 'learnSpell':
            case 'learnAnySpellFromHighestCircle':
              return pSelections.spells?.length || 0;
            case 'increaseAttribute':
              return pSelections.attributes?.length || 0;
            case 'selectWeaponSpecialization':
              return pSelections.weapons?.length || 0;
            case 'selectFamiliar':
              return pSelections.familiars?.length || 0;
            case 'selectAnimalTotem':
              return pSelections.animalTotems?.length || 0;
            default:
              return 0;
          }
        };

        return requirements.requirements.every((req) => {
          const { type, pick } = req;

          // Check available options - if none available, consider requirement satisfied
          const availableOptions = getFilteredAvailableOptions(
            req,
            simulatedSheet
          );
          if (availableOptions.length === 0) return true;

          // If fewer options than required, adjust the effective pick count
          const effectivePick = Math.min(pick, availableOptions.length);

          const count = getSelectionCount(power.name, type);

          // For getGeneralPower, also check if nested power requirements are met
          if (type === 'getGeneralPower' && count >= effectivePick) {
            const selectedPower = effectSelections.powers?.[0] as
              | { name?: string; sheetActions?: unknown[] }
              | undefined;
            if (selectedPower?.name && selectedPower.sheetActions) {
              const nestedReqs = getPowerSelectionRequirements(
                selectedPower as Parameters<
                  typeof getPowerSelectionRequirements
                >[0]
              );
              if (nestedReqs) {
                return nestedReqs.requirements.every((nestedReq) => {
                  const nestedCount = getSelectionCount(
                    selectedPower.name!,
                    nestedReq.type
                  );
                  return nestedCount >= nestedReq.pick;
                });
              }
            }
          }

          return count >= effectivePick;
        });
      }

      case 'Efeitos de Habilidades': {
        // For now, assume optional (can skip)
        // TODO: Implement validation for required ability selections
        return true;
      }

      case 'Seleção de Magias': {
        const spellInfo = getSpellInfo();
        if (!spellInfo) return true;

        const selectedCount = currentLevelSelection.spellsLearned?.length || 0;
        return selectedCount === spellInfo.spellCount;
      }

      default:
        return false;
    }
  };

  // Get current step content
  const getStepContent = (stepIndex: number): React.ReactNode => {
    const stepName = steps[stepIndex];

    switch (stepName) {
      case 'Escolha de Poder': {
        const { classPowers, generalPowers } = getAvailablePowers();

        // Get known powers from simulated sheet (powers already added to the sheet)
        const knownClassPowers =
          simulatedSheet.classPowers?.map((p) => p.name) || [];
        const knownGeneralPowers =
          simulatedSheet.generalPowers?.map((p) => p.name) || [];

        return (
          <PowerSelectionStep
            classPowers={classPowers}
            generalPowers={generalPowers}
            selectedPowerChoice={currentLevelSelection.powerChoice}
            selectedClassPower={
              currentLevelSelection.selectedClassPower || null
            }
            selectedGeneralPower={
              currentLevelSelection.selectedGeneralPower || null
            }
            onPowerChoiceChange={(choice) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                powerChoice: choice,
                selectedClassPower: undefined,
                selectedGeneralPower: undefined,
              })
            }
            onClassPowerSelect={(power) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                selectedClassPower: power,
              })
            }
            onGeneralPowerSelect={(power) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                selectedGeneralPower: power,
              })
            }
            className={simulatedSheet.classe.name}
            knownClassPowers={knownClassPowers}
            knownGeneralPowers={knownGeneralPowers}
          />
        );
      }

      case 'Efeitos do Poder': {
        const power =
          currentLevelSelection.powerChoice === 'class'
            ? currentLevelSelection.selectedClassPower
            : currentLevelSelection.selectedGeneralPower;

        if (!power) return null;

        return (
          <PowerEffectSelectionStep
            race={simulatedSheet.raca}
            classe={simulatedSheet.classe}
            origin={undefined}
            selectedPower={power}
            powerSource={currentLevelSelection.powerChoice}
            selections={currentLevelSelection.powerEffectSelections || {}}
            onChange={(selections) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                powerEffectSelections: selections,
              })
            }
            actualSheet={simulatedSheet}
            skipRaceAbilities
          />
        );
      }

      case 'Efeitos de Habilidades': {
        return (
          <Box>
            <Typography variant='h6' gutterBottom>
              Efeitos de Habilidades de Classe
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Sua classe ganhou novas habilidades neste nível que requerem
              seleções.
            </Typography>
            <PowerEffectSelectionStep
              race={simulatedSheet.raca}
              classe={simulatedSheet.classe}
              origin={undefined}
              selections={currentLevelSelection.abilityEffectSelections || {}}
              onChange={(selections) =>
                setCurrentLevelSelection({
                  ...currentLevelSelection,
                  abilityEffectSelections: selections,
                })
              }
              actualSheet={simulatedSheet}
              skipRaceAbilities
              classAbilityLevel={currentLevel}
            />
          </Box>
        );
      }

      case 'Seleção de Magias': {
        const spellInfo = getSpellInfo();
        if (!spellInfo) return null;

        return (
          <LevelSpellSelectionStep
            availableSpells={spellInfo.availableSpells}
            selectedSpells={currentLevelSelection.spellsLearned || []}
            requiredCount={spellInfo.spellCount}
            spellCircle={spellInfo.spellCircle}
            onSpellToggle={(spell) => {
              const current = currentLevelSelection.spellsLearned || [];
              const isSelected = current.some((s) => s.nome === spell.nome);

              if (isSelected) {
                // Remove spell
                setCurrentLevelSelection({
                  ...currentLevelSelection,
                  spellsLearned: current.filter((s) => s.nome !== spell.nome),
                });
              } else {
                // Add spell
                setCurrentLevelSelection({
                  ...currentLevelSelection,
                  spellsLearned: [...current, spell],
                });
              }
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Finished all steps for this level
      const updatedLevelSelections = [
        ...allLevelSelections,
        currentLevelSelection,
      ];

      if (currentLevel < targetLevel) {
        // Move to next level
        setAllLevelSelections(updatedLevelSelections);
        setCurrentLevel(currentLevel + 1);
        setCurrentLevelSelection({
          level: currentLevel + 1,
          powerChoice: 'class',
        });
        setActiveStep(0);

        // Update simulated sheet with current level selections
        // This ensures powers selected in previous levels are tracked
        const nextSheet = { ...simulatedSheet, nivel: currentLevel + 1 };

        // Add selected power to the simulated sheet
        if (
          currentLevelSelection.powerChoice === 'class' &&
          currentLevelSelection.selectedClassPower
        ) {
          nextSheet.classPowers = [
            ...(nextSheet.classPowers || []),
            currentLevelSelection.selectedClassPower,
          ];
        } else if (
          currentLevelSelection.powerChoice === 'general' &&
          currentLevelSelection.selectedGeneralPower
        ) {
          nextSheet.generalPowers = [
            ...(nextSheet.generalPowers || []),
            currentLevelSelection.selectedGeneralPower,
          ];
        }

        // Add selected spells to the simulated sheet
        if (
          currentLevelSelection.spellsLearned &&
          currentLevelSelection.spellsLearned.length > 0
        ) {
          nextSheet.spells = [
            ...(nextSheet.spells || []),
            ...currentLevelSelection.spellsLearned,
          ];
        }

        // Add attribute increases to sheetActionHistory for plateau validation
        const selectedPower =
          currentLevelSelection.powerChoice === 'class'
            ? currentLevelSelection.selectedClassPower
            : currentLevelSelection.selectedGeneralPower;

        if (selectedPower && currentLevelSelection.powerEffectSelections) {
          const powerEffects =
            currentLevelSelection.powerEffectSelections[selectedPower.name];
          if (powerEffects?.attributes && powerEffects.attributes.length > 0) {
            const plateau = getCurrentPlateau({
              nivel: currentLevel,
            } as CharacterSheet);
            const newHistoryEntries: SheetActionHistoryEntry[] =
              powerEffects.attributes.map((attr) => ({
                source: { type: 'power' as const, name: selectedPower.name },
                powerName: selectedPower.name,
                changes: [
                  {
                    type: 'AttributeIncreasedByAumentoDeAtributo' as const,
                    attribute: attr as Atributo,
                    plateau,
                  },
                ],
              }));

            nextSheet.sheetActionHistory = [
              ...(nextSheet.sheetActionHistory || []),
              ...newHistoryEntries,
            ];
          }
        }

        setSimulatedSheet(nextSheet);
      } else {
        // All levels complete - confirm
        onConfirm(updatedLevelSelections);
      }
    } else {
      // Next step within this level
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      // Go back within this level
      setActiveStep((prev) => prev - 1);
    } else if (currentLevel > 2) {
      // Go back to previous level
      const previousLevel = currentLevel - 1;
      const previousLevelSelection = allLevelSelections[previousLevel - 2];

      setCurrentLevel(previousLevel);
      setCurrentLevelSelection(previousLevelSelection);
      setAllLevelSelections(allLevelSelections.slice(0, -1));
      setActiveStep(0);

      // Update simulated sheet - remove powers/spells from the level we're returning to
      // This allows the user to see their previous selection and modify it if desired
      const prevSheet = { ...simulatedSheet, nivel: previousLevel };

      // Remove the power that was selected in the level we're returning to
      if (previousLevelSelection) {
        if (
          previousLevelSelection.powerChoice === 'class' &&
          previousLevelSelection.selectedClassPower
        ) {
          prevSheet.classPowers = (prevSheet.classPowers || []).filter(
            (p) => p.name !== previousLevelSelection.selectedClassPower?.name
          );
        } else if (
          previousLevelSelection.powerChoice === 'general' &&
          previousLevelSelection.selectedGeneralPower
        ) {
          prevSheet.generalPowers = (prevSheet.generalPowers || []).filter(
            (p) => p.name !== previousLevelSelection.selectedGeneralPower?.name
          );
        }

        // Remove spells that were selected in the level we're returning to
        if (
          previousLevelSelection.spellsLearned &&
          previousLevelSelection.spellsLearned.length > 0
        ) {
          const spellNamesToRemove = previousLevelSelection.spellsLearned.map(
            (s) => s.nome
          );
          prevSheet.spells = (prevSheet.spells || []).filter(
            (s) => !spellNamesToRemove.includes(s.nome)
          );
        }

        // Remove sheetActionHistory entries for attribute increases from the level we're returning to
        const previousPower =
          previousLevelSelection.powerChoice === 'class'
            ? previousLevelSelection.selectedClassPower
            : previousLevelSelection.selectedGeneralPower;

        if (previousPower && previousLevelSelection.powerEffectSelections) {
          const effectSelections =
            previousLevelSelection.powerEffectSelections[previousPower.name];
          if (
            effectSelections?.attributes &&
            effectSelections.attributes.length > 0
          ) {
            // Only remove entries that match the specific attributes selected in this level
            prevSheet.sheetActionHistory = (
              prevSheet.sheetActionHistory || []
            ).filter((entry) => {
              if (entry.powerName !== previousPower.name) return true;
              // Check if this entry's attribute matches one we selected at this level
              const hasMatchingAttribute = entry.changes.some(
                (change) =>
                  change.type === 'AttributeIncreasedByAumentoDeAtributo' &&
                  effectSelections.attributes!.includes(
                    change.attribute as Atributo
                  )
              );
              return !hasMatchingAttribute;
            });
          }
        }
      }

      setSimulatedSheet(prevSheet);
    }
  };

  const currentStepComplete = isStepComplete(activeStep);

  // Handle close attempt - show confirmation dialog
  const handleCloseAttempt = () => {
    setConfirmCloseOpen(true);
  };

  // Handle confirmed close
  const handleConfirmClose = () => {
    setConfirmCloseOpen(false);
    onCancel();
  };

  // Handle cancel close (stay in wizard)
  const handleCancelClose = () => {
    setConfirmCloseOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseAttempt}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box>
            <Typography variant='h6'>
              Progressão de Nível - Nível {currentLevel}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Progresso geral: Nível {currentLevel} de {targetLevel}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 300 }}>{getStepContent(activeStep)}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttempt} color='inherit'>
            Cancelar
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 && currentLevel === 2}
          >
            Voltar
          </Button>
          <Button
            variant='contained'
            onClick={handleNext}
            disabled={!currentStepComplete}
          >
            {(() => {
              if (activeStep === steps.length - 1) {
                return currentLevel < targetLevel
                  ? `Próximo Nível (${currentLevel + 1})`
                  : 'Finalizar';
              }
              return 'Próximo';
            })()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmCloseOpen}
        onClose={handleCancelClose}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Cancelar progressão de nível?</DialogTitle>
        <DialogContent>
          <Typography variant='body1'>
            Tem certeza que deseja cancelar? Todas as seleções feitas até agora
            serão perdidas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color='inherit'>
            Continuar editando
          </Button>
          <Button
            onClick={handleConfirmClose}
            variant='contained'
            color='error'
          >
            Sim, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LevelUpWizardModal;
