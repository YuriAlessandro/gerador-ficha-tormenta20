import React, { useState, useEffect, useMemo } from 'react';
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
import { useIsMobile } from '@/hooks/useIsMobile';
import CompactStepProgress from '@/components/common/CompactStepProgress';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { ClassAbility } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';

import { CompanionSheet } from '@/interfaces/Companion';
import { getOwnedGeneralPowers, isPowerAvailable } from '@/functions/powers';
import { SupplementId } from '@/types/supplement.types';

import { getCurrentPlateau } from '@/functions/powers/general';
import { applyPower } from '@/functions/general';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import Skill from '@/interfaces/Skills';

import {
  getClassLevel,
  initializeClassLevels,
  buildSpellPathFromSetup,
  serializeSpellPath,
} from '@/functions/multiclass';

import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { createCompanion } from '@/data/systems/tormenta20/herois-de-arton/companion';
import {
  getEngenhocaTraditionNames,
  getOficioEngenhoqueiroBonus,
} from '@/functions/spells/engenhoca';
import {
  buildLevelUpWizardContext,
  classGrantsPowerAtLevel,
  CONQUISTAR_PELOS_NUMEROS,
  findPowerGrant,
  getLevelUpAbilitiesForLevel,
  getLevelUpEngenhocaInfo,
  getLevelUpMergedAbilities,
  getLevelUpPowerOptions,
  getLevelUpSheetWithAbilities,
  LevelUpPowerOptions,
  getLevelUpRacePicks,
  getLevelUpScalingPowers,
  getLevelUpSpellInfo,
  getLevelUpSteps,
  getLevelUpSwappableOriginPowers,
  getProjectedCompanion as projectCompanion,
  getSelectedLevelUpPower,
  getTreinoEspecializadoChoice,
  isLevelUpStepComplete,
  RaceLevelUpPick,
  TREINO_ESPECIALIZADO,
  TREINO_INTENSIVO,
} from '@/functions/wizardRules/levelUpWizardRules';
import OriginPowerSwapStep from './steps/OriginPowerSwapStep';
import PowerSelectionStep from './steps/PowerSelectionStep';
import LevelSpellSelectionStep from './steps/LevelSpellSelectionStep';
import EngenhocaFabricationStep, {
  getTotalFabricationCost,
} from './steps/EngenhocaFabricationStep';
import PowerEffectSelectionStep from '../CharacterCreationWizard/steps/PowerEffectSelectionStep';
import LevelBenefitsStep from './steps/LevelBenefitsStep';
import ClassSelectionStep from './steps/ClassSelectionStep';
import ClassSetupStep from './steps/ClassSetupStep';
import CompanionTrickSelectionStep from './steps/CompanionTrickSelectionStep';
import {
  applyCompanionTrickPatch,
  CompanionTrickPatch,
} from './companionTrickSelection';
import CompanionCreationStep from '../CharacterCreationWizard/steps/CompanionCreationStep';
import RaceLevelUpPickStep from './steps/RaceLevelUpPickStep';

// Movidas para as regras puras; reexportadas para quem já importava daqui.
export { findPowerGrant, classGrantsPowerAtLevel };

interface LevelUpWizardModalProps {
  open: boolean;
  initialSheet: CharacterSheet; // Sheet at current level (level-up starts at nivel+1)
  targetLevel: number; // Final level to reach
  supplements: SupplementId[]; // Active supplements for power filtering
  onConfirm: (levelUpSelections: LevelUpSelections[]) => void;
  onCancel: () => void;
}

const LevelUpWizardModal: React.FC<LevelUpWizardModalProps> = ({
  open,
  initialSheet,
  targetLevel,
  supplements,
  onConfirm,
  onCancel,
}) => {
  // Multiclass feature access
  const {
    hasAccess: hasMulticlassAccess,
    isEnabled: isMulticlassEnabled,
    supporterOnly: multiclassSupporterOnly,
  } = useFeatureAccess('multiclass');

  // Dynamic start level based on initial sheet
  const startLevel = initialSheet.nivel + 1;

  // Current level being processed (starts at initialSheet.nivel + 1)
  const [currentLevel, setCurrentLevel] = useState(startLevel);

  // All level up selections (array indexed by level - startLevel)
  const [allLevelSelections, setAllLevelSelections] = useState<
    LevelUpSelections[]
  >([]);

  // Current level selections
  const [currentLevelSelection, setCurrentLevelSelection] =
    useState<LevelUpSelections>({
      level: startLevel,
      selectedClassName: initialSheet.classe.name,
      selectedClassSubname: initialSheet.classe.subname,
      powerChoice: 'class',
    });

  // Current step within this level
  const [activeStep, setActiveStep] = useState(0);

  // "Quebre a regra": é o filtro "Só os que posso pegar" DESLIGADO na escolha
  // de poder — mostra e libera poderes fora dos pré-requisitos. Mora aqui, e
  // não no PowerSelectionStep, porque o switch de renderStepContent DESMONTA o
  // passo a cada navegação (é por isso que a busca também se perde) — em
  // estado local, voltar de "Efeitos do Poder" re-travaria um poder já
  // escolhido. Persiste entre os níveis do mesmo level-up e volta a false
  // (filtro ligado) quando o assistente reabre.
  const [allowOutOfRequirements, setAllowOutOfRequirements] = useState(false);

  // Confirmation dialog state for cancel action
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const isMobile = useIsMobile();

  // Índice do companheiro exibido em cada step de truque (auto/power) enquanto
  // ainda não há truque selecionado (a entry em companionTrickSelections só
  // existe com um truque escolhido)
  const [trickStepCompanionIndex, setTrickStepCompanionIndex] = useState<{
    auto: number;
    power: number;
  }>({ auto: 0, power: 0 });

  // Simulated sheet at current level (for filtering powers/spells)
  const [simulatedSheet, setSimulatedSheet] =
    useState<CharacterSheet>(initialSheet);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentLevel(startLevel);
      setAllLevelSelections([]);
      setCurrentLevelSelection({
        level: startLevel,
        selectedClassName: initialSheet.classe.name,
        selectedClassSubname: initialSheet.classe.subname,
        powerChoice: 'class',
      });
      setActiveStep(0);
      setAllowOutOfRequirements(false);
      setTrickStepCompanionIndex({ auto: 0, power: 0 });
      // Initialize classLevels if not present
      const sheetWithClassLevels = initialSheet.classLevels
        ? initialSheet
        : {
            ...initialSheet,
            classLevels: initializeClassLevels(initialSheet),
          };
      setSimulatedSheet(sheetWithClassLevels);
      setConfirmCloseOpen(false);
    }
  }, [open, initialSheet]);

  /**
   * Derivados do nível corrente, das regras puras do assistente
   * (`levelUpWizardRules`), as mesmas que o motor sem sorteio usa.
   */
  const levelCtx = buildLevelUpWizardContext({
    sheet: simulatedSheet,
    initialSheet,
    level: currentLevel,
    selection: currentLevelSelection,
    supplements,
    multiclassEnabled: isMulticlassEnabled,
  });
  const {
    selectedClassName,
    selectedClassSubname,
    selectedClassLevel,
    selectedClassDesc,
    sheetForCurrentLevel,
    resolvedClassSetup,
    isFirstLevelInNewClass,
    recoveringLinhagemDeus,
  } = levelCtx;

  const getSelectedPower = getSelectedLevelUpPower;

  // Fonte única do passo "Efeitos de Habilidades": detecção, render e validação.
  const getMergedClassAbilities = (): ClassAbility[] =>
    getLevelUpMergedAbilities(levelCtx);

  // Só as que estreiam neste nível de CLASSE (importa na multiclasse).
  const getAbilitiesForCurrentLevel = (): ClassAbility[] =>
    getLevelUpAbilitiesForLevel(levelCtx);

  const getSheetWithCurrentLevelAbilities = (
    baseSheet: CharacterSheet
  ): CharacterSheet => getLevelUpSheetWithAbilities(levelCtx, baseSheet);

  // O cálculo acima faz um `cloneDeep` da ficha por habilidade (via
  // `applyPower`); memoizado para não rodar duas vezes no mesmo render
  // (aqui e em `getAvailablePowers`) nem a cada re-render sem mudança real.
  const sheetWithCurrentLevelAbilities = useMemo(
    () => getSheetWithCurrentLevelAbilities(sheetForCurrentLevel),
    [sheetForCurrentLevel, selectedClassName, selectedClassLevel]
  );

  const getProjectedCompanion = (
    reason: 'auto' | 'power',
    companionIndex: number
  ): CompanionSheet | undefined =>
    projectCompanion(levelCtx, reason, companionIndex);

  // Get available powers for current simulated sheet
  const getAvailablePowers = (
    sheetForPowerSelection: CharacterSheet,
    { allowAll = false }: { allowAll?: boolean } = {}
  ): LevelUpPowerOptions =>
    getLevelUpPowerOptions(levelCtx, sheetForPowerSelection, { allowAll });

  // Get spell info for current level (uses selected class's spellPath and class level)
  const getSpellInfo = () => getLevelUpSpellInfo(levelCtx);

  const getRaceLevelUpPicks = (): RaceLevelUpPick[] =>
    getLevelUpRacePicks(levelCtx);

  const getScalingPowersForLevelUp = (): GeneralPower[] =>
    getLevelUpScalingPowers(levelCtx);

  const getSwappableOriginPowers = (): OriginPower[] =>
    getLevelUpSwappableOriginPowers(levelCtx);

  const getEngenhocaInfo = () => getLevelUpEngenhocaInfo(levelCtx);

  const steps = getLevelUpSteps(levelCtx);

  // Validate current step completion
  const isStepComplete = (stepIndex: number): boolean =>
    isLevelUpStepComplete(levelCtx, steps[stepIndex]);

  // Get current step content
  const getStepContent = (stepIndex: number): React.ReactNode => {
    const stepName = steps[stepIndex];

    switch (stepName) {
      case 'Escolha de Classe': {
        return (
          <ClassSelectionStep
            simulatedSheet={simulatedSheet}
            supplements={supplements}
            selectedClassName={selectedClassName}
            selectedClassSubname={selectedClassSubname}
            onClassSelect={(className, subname) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                selectedClassName: className,
                selectedClassSubname: subname,
                classSetup: undefined,
              })
            }
            hasAccess={hasMulticlassAccess}
            supporterOnly={multiclassSupporterOnly}
          />
        );
      }

      case 'Configuração da Classe': {
        return (
          <ClassSetupStep
            selectedClassName={selectedClassName}
            classSetup={resolvedClassSetup || {}}
            onChange={(setup) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                classSetup: setup,
              })
            }
            activeSupplements={supplements}
            recoveringDeus={recoveringLinhagemDeus}
          />
        );
      }

      case 'Ganhos do Nível': {
        return (
          <LevelBenefitsStep
            simulatedSheet={simulatedSheet}
            currentLevel={currentLevel}
            selectedClassName={selectedClassName}
            selectedClassSubname={selectedClassSubname}
            selectedClassLevel={selectedClassLevel}
            supplements={supplements}
          />
        );
      }

      case 'Escolha de Poder': {
        const sheetForPowerSelection = sheetWithCurrentLevelAbilities;
        const {
          classPowers,
          generalPowers,
          unavailableClassPowers,
          unavailableGeneralPowers,
          sheetForFiltering,
        } = getAvailablePowers(sheetForPowerSelection, {
          allowAll: allowOutOfRequirements,
        });

        // Religar o filtro com um poder fora dos requisitos já escolhido
        // deixaria a seleção inválida sobreviver até o apply. Zera só nesse caso.
        const handleAllowOutOfRequirementsChange = (allow: boolean) => {
          setAllowOutOfRequirements(allow);
          if (allow) return;
          const general = currentLevelSelection.selectedGeneralPower;
          const classPower = currentLevelSelection.selectedClassPower;
          const dropGeneral =
            !!general && unavailableGeneralPowers.includes(general.name);
          const dropClass =
            !!classPower && unavailableClassPowers.includes(classPower.name);
          if (dropGeneral || dropClass) {
            setCurrentLevelSelection({
              ...currentLevelSelection,
              selectedGeneralPower: dropGeneral ? undefined : general,
              selectedClassPower: dropClass ? undefined : classPower,
            });
          }
        };

        // Get known powers from simulated sheet (powers already added to the sheet)
        const knownClassPowers =
          sheetForPowerSelection.classPowers?.map((p) => p.name) || [];
        const knownGeneralPowers = [
          ...getOwnedGeneralPowers(sheetForPowerSelection).map((p) => p.name),
          ...(sheetForPowerSelection.raca.abilities?.map((a) => a.name) || []),
        ];

        // Alma Livre detection: check if the character has a pre-selected power
        // that hasn't been acquired yet
        const almaLivrePower = sheetForPowerSelection.almaLivrePower || null;
        const almaLivreClassName = sheetForPowerSelection.almaLivreClass;
        const almaLivrePowerAcquired = sheetForPowerSelection.classPowers?.some(
          (p) => p.name === almaLivrePower?.name
        );
        const showAlmaLivre =
          almaLivrePower && almaLivreClassName && !almaLivrePowerAcquired;

        // Check if Alma Livre power requirements are met (using nivel - 4)
        let almaLivrePowerAvailable = false;
        if (showAlmaLivre && almaLivrePower) {
          const almaLivreSheet = {
            ...sheetForPowerSelection,
            nivel: Math.max(1, currentLevel - 4),
          };
          almaLivrePowerAvailable = isPowerAvailable(
            almaLivreSheet,
            almaLivrePower
          );
        }

        return (
          <PowerSelectionStep
            sheet={sheetForFiltering}
            classPowers={classPowers}
            generalPowers={generalPowers}
            selectedPowerChoice={currentLevelSelection.powerChoice}
            selectedClassPower={
              currentLevelSelection.selectedClassPower || null
            }
            selectedGeneralPower={
              currentLevelSelection.selectedGeneralPower || null
            }
            // Atualização FUNCIONAL: o passo dispara `onPowerChoiceChange` e o
            // select do poder no MESMO clique (o tipo da escolha é derivado do
            // item). Espalhando `currentLevelSelection` da closure, o segundo
            // setState apagava o `powerChoice` gravado pelo primeiro — e como
            // ele começa em 'class', nenhum poder geral ficava selecionado.
            onPowerChoiceChange={(choice) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                powerChoice: choice,
                selectedClassPower: undefined,
                selectedGeneralPower: undefined,
                selectedAlmaLivrePower: undefined,
              }))
            }
            onClassPowerSelect={(power) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                selectedClassPower: power,
              }))
            }
            onGeneralPowerSelect={(power) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                selectedGeneralPower: power,
              }))
            }
            onAlmaLivrePowerSelect={(power) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                selectedAlmaLivrePower: power,
              }))
            }
            className={selectedClassName}
            classLevel={selectedClassLevel}
            knownClassPowers={knownClassPowers}
            knownGeneralPowers={knownGeneralPowers}
            unavailableClassPowers={unavailableClassPowers}
            unavailableGeneralPowers={unavailableGeneralPowers}
            allowOutOfRequirements={allowOutOfRequirements}
            onAllowOutOfRequirementsChange={handleAllowOutOfRequirementsChange}
            almaLivrePower={showAlmaLivre ? almaLivrePower : null}
            almaLivreClassName={showAlmaLivre ? almaLivreClassName : undefined}
            almaLivrePowerAvailable={almaLivrePowerAvailable}
          />
        );
      }

      case 'Efeitos do Poder': {
        const power = getSelectedPower(currentLevelSelection);

        if (!power) return null;

        return (
          <PowerEffectSelectionStep
            race={simulatedSheet.raca}
            classe={simulatedSheet.classe}
            origin={undefined}
            selectedPower={power}
            powerSource={
              currentLevelSelection.powerChoice === 'almaLivre'
                ? 'class'
                : currentLevelSelection.powerChoice
            }
            selections={currentLevelSelection.powerEffectSelections || {}}
            onChange={(selections) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                powerEffectSelections: selections,
              })
            }
            actualSheet={sheetForCurrentLevel}
            skipRaceAbilities
            supplements={supplements}
          />
        );
      }

      case 'Benefício da Origem':
        return (
          <OriginPowerSwapStep
            sheet={sheetForCurrentLevel}
            powers={getSwappableOriginPowers()}
            selections={currentLevelSelection.originPowerSwaps || {}}
            onChange={(originPowerSwaps) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                originPowerSwaps,
              })
            }
          />
        );

      case 'Perícias por Patamar': {
        const scalingPowers = getScalingPowersForLevelUp();
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant='h6' gutterBottom>
              Perícias por Patamar
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
              Você cruzou um patamar e ganhou mais perícias de um poder já
              concedido.
            </Typography>
            {scalingPowers.map((power) => (
              <PowerEffectSelectionStep
                key={power.name}
                race={simulatedSheet.raca}
                classe={simulatedSheet.classe}
                origin={undefined}
                selectedPower={power}
                powerSource='general'
                selections={currentLevelSelection.powerEffectSelections || {}}
                onChange={(selections) =>
                  setCurrentLevelSelection({
                    ...currentLevelSelection,
                    powerEffectSelections: selections,
                  })
                }
                actualSheet={sheetForCurrentLevel}
                skipRaceAbilities
                supplements={supplements}
              />
            ))}
          </Box>
        );
      }

      case 'Efeitos de Habilidades': {
        // Mesma mescla de `needsAbilityEffectSelections` e da validação: as
        // habilidades injetadas no setup (linhagens do Feiticeiro) vivem na
        // FICHA, não na entrada do registry. O passo filtra por
        // `classAbilityLevel`, então a lista vai completa.
        const activeClass = selectedClassDesc || simulatedSheet.classe;
        const expandedClass = {
          ...activeClass,
          abilities: getMergedClassAbilities(),
          // `PowerEffectSelectionStep` prefere `originalAbilities` a
          // `abilities`; mantê-lo faria a lista mesclada ser ignorada.
          originalAbilities: undefined,
        };
        return (
          <Box>
            <Typography variant='h6' gutterBottom>
              Efeitos de Habilidades de Classe
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Sua classe ganhou novas habilidades neste nível que requerem
              seleções.
            </Typography>
            <PowerEffectSelectionStep
              race={simulatedSheet.raca}
              classe={expandedClass}
              origin={undefined}
              selections={currentLevelSelection.abilityEffectSelections || {}}
              onChange={(selections) => {
                const next: LevelUpSelections = {
                  ...currentLevelSelection,
                  abilityEffectSelections: selections,
                };
                // Treinador 5: o step de truque deste nível só existe com
                // Treino Intensivo — trocar a escolha invalida o truque bônus
                // já selecionado (a entry 'power' do Ensinar Truque fica)
                if (
                  selectedClassName === 'Treinador' &&
                  selectedClassLevel === 5 &&
                  selections[TREINO_ESPECIALIZADO]?.chosenOption?.[0] !==
                    TREINO_INTENSIVO
                ) {
                  const remaining = (
                    next.companionTrickSelections || []
                  ).filter((e) => e.reason !== 'auto');
                  next.companionTrickSelections = remaining.length
                    ? remaining
                    : undefined;
                }
                setCurrentLevelSelection(next);
              }}
              actualSheet={sheetForCurrentLevel}
              skipRaceAbilities
              classAbilityLevel={selectedClassLevel}
              supplements={supplements}
            />
          </Box>
        );
      }

      case 'Escolhas de Raça': {
        return (
          <RaceLevelUpPickStep
            picks={getRaceLevelUpPicks()}
            value={currentLevelSelection.levelUpOptionPicks || {}}
            onChange={(levelUpOptionPicks) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                levelUpOptionPicks,
              })
            }
          />
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
            crossTraditionSpellNames={spellInfo.crossTraditionSpellNames}
            sharedTraditionSpellNames={spellInfo.sharedTraditionSpellNames}
            crossTraditionLabel={spellInfo.crossTraditionLabel}
            crossTraditionLimit={spellInfo.crossTraditionLimit}
            minCrossTraditionSpells={spellInfo.minCrossTraditionSpells}
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

      case 'Engenhocas': {
        const info = getEngenhocaInfo();
        if (!info) return null;

        return (
          <EngenhocaFabricationStep
            availableSpells={info.availableSpells}
            selectedSpells={currentLevelSelection.engenhocasFabricadas ?? []}
            slots={info.slots}
            maxCircle={info.maxCircle}
            money={info.money}
            deductMoney={currentLevelSelection.engenhocasDeductMoney !== false}
            oficioBonus={getOficioEngenhoqueiroBonus(sheetForCurrentLevel)}
            maxAprimoramentoPm={info.maxAprimoramentoPm}
            traditionNames={getEngenhocaTraditionNames(
              info.maxCircle,
              supplements
            )}
            onChange={(engenhocas, deductMoney) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                engenhocasFabricadas: engenhocas,
                engenhocasDeductMoney: deductMoney,
                engenhocasCost: deductMoney
                  ? getTotalFabricationCost(engenhocas)
                  : 0,
              }))
            }
          />
        );
      }

      case 'Truque do Melhor Amigo':
      case 'Truque do Melhor Amigo (Ensinar Truque)': {
        const companions = simulatedSheet.companions || [];
        if (!companions.length) return null;
        const reason: 'auto' | 'power' =
          stepName === 'Truque do Melhor Amigo (Ensinar Truque)'
            ? 'power'
            : 'auto';
        const selections = currentLevelSelection.companionTrickSelections || [];
        const existing = selections.find((e) => e.reason === reason);
        const selectedCompanionIndex =
          existing?.companionIndex ?? trickStepCompanionIndex[reason];
        const companion =
          getProjectedCompanion(reason, selectedCompanionIndex) ||
          companions[0];

        // Atualização funcional e atômica: o passo dispara DOIS callbacks no
        // mesmo evento (magia + truque, ou truque + limpeza da magia), então
        // cada patch precisa partir do estado mais recente — não do render.
        const upsert = (patch: CompanionTrickPatch) => {
          setCurrentLevelSelection((prev) =>
            applyCompanionTrickPatch(
              prev,
              reason,
              patch,
              selectedCompanionIndex
            )
          );
        };

        return (
          <CompanionTrickSelectionStep
            companion={companion}
            trainerLevel={selectedClassLevel}
            companions={companions}
            selectedCompanionIndex={selectedCompanionIndex}
            onSelectCompanion={(idx) => {
              setTrickStepCompanionIndex((prev) => ({
                ...prev,
                [reason]: idx,
              }));
              upsert({ companionIndex: idx });
            }}
            selectedTrick={existing?.trick}
            onSelectTrick={(trick) => upsert({ trick })}
            selectedSpell={existing?.spell}
            onSelectSpell={(spell) => upsert({ spell })}
          />
        );
      }

      case 'Melhor Amigo':
      case 'Segundo Melhor Amigo':
        return (
          <CompanionCreationStep
            trainerLevel={selectedClassLevel}
            companionName={currentLevelSelection.companionName}
            companionType={currentLevelSelection.companionType}
            companionSize={currentLevelSelection.companionSize}
            companionWeaponDamageType={
              currentLevelSelection.companionWeaponDamageType
            }
            companionSpiritEnergyType={
              currentLevelSelection.companionSpiritEnergyType
            }
            companionSkills={currentLevelSelection.companionSkills || []}
            companionTricks={currentLevelSelection.companionTricks || []}
            onNameChange={(name) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                companionName: name,
              }))
            }
            onTypeChange={(type) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                companionType: type,
                companionTricks: [],
              }))
            }
            onSizeChange={(size) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                companionSize: size,
                companionTricks: [],
              }))
            }
            onWeaponDamageTypeChange={(damageType) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                companionWeaponDamageType: damageType,
              }))
            }
            onSpiritEnergyTypeChange={(energyType) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                companionSpiritEnergyType: energyType,
              }))
            }
            onSkillsChange={(skills) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                companionSkills: skills,
              }))
            }
            onTricksChange={(tricks) =>
              setCurrentLevelSelection((prev) => ({
                ...prev,
                companionTricks: tricks,
              }))
            }
          />
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Finished all steps for this level
      // Engenhocas escolhidas e depois invalidadas (o jogador voltou e trocou
      // o poder Engenhoqueiro) não podem seguir junto com o nível.
      const levelSelection: LevelUpSelections = steps.includes('Engenhocas')
        ? currentLevelSelection
        : {
            ...currentLevelSelection,
            engenhocasFabricadas: undefined,
            engenhocasCost: undefined,
          };
      const updatedLevelSelections = [...allLevelSelections, levelSelection];

      if (currentLevel < targetLevel) {
        // Move to next level
        setAllLevelSelections(updatedLevelSelections);
        setCurrentLevel(currentLevel + 1);
        setCurrentLevelSelection({
          level: currentLevel + 1,
          selectedClassName: simulatedSheet.classe.name,
          selectedClassSubname: simulatedSheet.classe.subname,
          powerChoice: 'class',
        });
        setActiveStep(0);
        setTrickStepCompanionIndex({ auto: 0, power: 0 });

        // Update simulated sheet with current level selections
        // This ensures powers selected in previous levels are tracked
        const nextSheet = { ...simulatedSheet, nivel: currentLevel + 1 };

        // Update classLevels with the class chosen for this level
        const newClassLevelEntry = {
          level: currentLevel,
          className: selectedClassName,
          classSubname: selectedClassSubname,
        };
        nextSheet.classLevels = [
          ...(nextSheet.classLevels || []),
          newClassLevelEntry,
        ];

        if (
          resolvedClassSetup &&
          selectedClassName !== simulatedSheet.classe.name
        ) {
          nextSheet.multiclassSetups = {
            ...(nextSheet.multiclassSetups || {}),
            [selectedClassName]: resolvedClassSetup,
          };
        }

        // Store spellPath for new multiclass caster class
        if (isFirstLevelInNewClass) {
          const newSpellPath = buildSpellPathFromSetup(
            selectedClassName,
            selectedClassSubname,
            currentLevelSelection.classSetup,
            supplements
          );
          if (newSpellPath) {
            nextSheet.multiclassSpellPaths = {
              ...(nextSheet.multiclassSpellPaths || {}),
              [selectedClassName]: serializeSpellPath(
                newSpellPath,
                selectedClassName,
                selectedClassSubname
              ),
            };
          }
        }

        // Multiclasse: criar Melhor Amigo no simulatedSheet ao pegar 1º nível de Treinador
        if (
          isFirstLevelInNewClass &&
          selectedClassName === 'Treinador' &&
          currentLevelSelection.companionType &&
          currentLevelSelection.companionSize &&
          currentLevelSelection.companionWeaponDamageType &&
          currentLevelSelection.companionSkills &&
          currentLevelSelection.companionTricks &&
          !nextSheet.companions?.length
        ) {
          const trainerCharisma =
            nextSheet.atributos[Atributo.CARISMA]?.value ?? 0;
          nextSheet.companions = [
            createCompanion({
              name: currentLevelSelection.companionName,
              type: currentLevelSelection.companionType,
              size: currentLevelSelection.companionSize,
              weaponDamageType: currentLevelSelection.companionWeaponDamageType,
              spiritEnergyType: currentLevelSelection.companionSpiritEnergyType,
              skills: currentLevelSelection.companionSkills,
              tricks: currentLevelSelection.companionTricks,
              trainerLevel: 1,
              trainerCharisma,
            }),
          ];
        }

        // Treinador 5: refletir a escolha de Treino Especializado no sheet
        // simulado, para que os próximos níveis da sessão enxerguem o 2º
        // companheiro / o truque bônus de Treino Intensivo (níveis 5 e 11)
        const treinoChoice = getTreinoEspecializadoChoice(
          currentLevelSelection
        );
        if (
          selectedClassName === 'Treinador' &&
          selectedClassLevel === 5 &&
          treinoChoice &&
          nextSheet.companions?.length
        ) {
          if (
            treinoChoice === CONQUISTAR_PELOS_NUMEROS &&
            nextSheet.companions.length === 1 &&
            currentLevelSelection.companionType &&
            currentLevelSelection.companionSize &&
            currentLevelSelection.companionWeaponDamageType &&
            currentLevelSelection.companionSkills &&
            currentLevelSelection.companionTricks
          ) {
            const trainerCharisma =
              nextSheet.atributos[Atributo.CARISMA]?.value ?? 0;
            nextSheet.companions = [
              ...nextSheet.companions,
              createCompanion({
                name: currentLevelSelection.companionName,
                type: currentLevelSelection.companionType,
                size: currentLevelSelection.companionSize,
                weaponDamageType:
                  currentLevelSelection.companionWeaponDamageType,
                spiritEnergyType:
                  currentLevelSelection.companionSpiritEnergyType,
                skills: currentLevelSelection.companionSkills,
                tricks: currentLevelSelection.companionTricks,
                trainerLevel: selectedClassLevel,
                trainerCharisma,
              }),
            ];
          } else if (treinoChoice === TREINO_INTENSIVO) {
            nextSheet.companions = nextSheet.companions.map((companion, idx) =>
              idx === 0 ? { ...companion, treinoIntensivo: true } : companion
            );
          }
        }

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
          currentLevelSelection.powerChoice === 'almaLivre' &&
          currentLevelSelection.selectedAlmaLivrePower
        ) {
          nextSheet.classPowers = [
            ...(nextSheet.classPowers || []),
            currentLevelSelection.selectedAlmaLivrePower,
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

        // Aplica as habilidades de classe que estreiam neste nível ao sheet
        // simulado. Sem isto, poderes concedidos por habilidade (ex.:
        // "Alquimista Iniciado" via grantSpecificClassPower) e pré-requisitos
        // de HABILIDADE (ex.: "Duelo" p/ "Cavaleiro Bandido") nunca aparecem
        // satisfeitos durante uma criação de múltiplos níveis — só depois que
        // a ficha já está instanciada, quando `applyManualLevelUp` reaplica
        // tudo de verdade a partir do zero.
        const abilitiesThisLevel = getAbilitiesForCurrentLevel();
        abilitiesThisLevel.forEach((ability) => {
          const [abilitySheet] = applyPower(
            nextSheet,
            { ...ability, sourceClassName: selectedClassName },
            currentLevelSelection.abilityEffectSelections?.[ability.name]
          );
          if (abilitySheet) {
            nextSheet.classPowers = abilitySheet.classPowers;
            nextSheet.generalPowers = abilitySheet.generalPowers;
            nextSheet.spells = abilitySheet.spells;
            nextSheet.sheetActionHistory = abilitySheet.sheetActionHistory;
            nextSheet.skills = abilitySheet.skills;
            nextSheet.completeSkills = abilitySheet.completeSkills;
            nextSheet.sheetBonuses = abilitySheet.sheetBonuses;
            nextSheet.atributos = abilitySheet.atributos;
            nextSheet.classe = {
              ...nextSheet.classe,
              proficiencias: abilitySheet.classe.proficiencias,
            };
          }
        });

        if (abilitiesThisLevel.length > 0) {
          const originalAbilities =
            nextSheet.classe.originalAbilities || nextSheet.classe.abilities;
          const newPrimaryClassLevel = getClassLevel(
            nextSheet,
            nextSheet.classe.name
          );
          const allAvailableAbilities = originalAbilities.filter(
            (ability) => ability.nivel <= newPrimaryClassLevel
          );
          // Multiclasse: habilidades de classe secundária não estão em
          // `originalAbilities` (que é só da classe primária) — anexa direto.
          if (selectedClassName !== nextSheet.classe.name) {
            allAvailableAbilities.push(...abilitiesThisLevel);
          }
          nextSheet.classe.abilities = allAvailableAbilities;
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

        // Engenhocas fabricadas: entram como magias e o custo sai do dinheiro,
        // para os próximos níveis da sessão verem o limite e o T$ certos.
        if (levelSelection.engenhocasFabricadas?.length) {
          nextSheet.spells = [
            ...(nextSheet.spells || []),
            ...levelSelection.engenhocasFabricadas,
          ];
          nextSheet.dinheiro = Math.max(
            0,
            (nextSheet.dinheiro ?? 0) - (levelSelection.engenhocasCost ?? 0)
          );
        }

        // Treinador: refletir truques escolhidos neste nível no sheet simulado,
        // para que os steps de truque dos próximos níveis da sessão os enxerguem
        // (dedup de não-repetíveis, cadeias de requiredTricks e Magia Inata)
        if (
          currentLevelSelection.companionTrickSelections?.length &&
          nextSheet.companions?.length
        ) {
          currentLevelSelection.companionTrickSelections.forEach((entry) => {
            const targetIdx = Math.min(
              entry.companionIndex,
              (nextSheet.companions?.length || 1) - 1
            );
            nextSheet.companions = (nextSheet.companions || []).map(
              (companion, idx) => {
                if (idx !== targetIdx) return companion;
                const next = {
                  ...companion,
                  tricks: [...companion.tricks, entry.trick],
                };
                if (entry.spell) {
                  next.spells = [
                    ...(companion.spells || []),
                    { ...entry.spell, customKeyAttr: Atributo.CARISMA },
                  ];
                }
                return next;
              }
            );
          });
        }

        // Add attribute increases to sheetActionHistory for plateau validation
        const selectedPower = getSelectedPower(currentLevelSelection);

        if (selectedPower && currentLevelSelection.powerEffectSelections) {
          const powerEffects =
            currentLevelSelection.powerEffectSelections[selectedPower.name];
          if (powerEffects?.attributes && powerEffects.attributes.length > 0) {
            const plateau = getCurrentPlateau({
              nivel: currentLevel,
            } as CharacterSheet);
            // Aumentos de fontes sem a restrição de 1×/patamar não podem
            // bloquear o atributo para o poder Aumento de Atributo.
            const oncePerTier = !selectedPower.sheetActions?.some(
              (sheetAction) =>
                sheetAction.action.type === 'increaseAttribute' &&
                sheetAction.action.oncePerTier === false
            );
            // O aumento e as perícias que ele treina (Inteligência) entram na
            // ficha simulada: os próximos níveis precisam do valor novo para
            // calcular outro aumento de Inteligência e não podem oferecer de
            // novo uma perícia já escolhida.
            nextSheet.atributos = { ...nextSheet.atributos };
            const intelligenceSkills = (powerEffects.intelligenceSkills ??
              []) as Skill[];
            const newHistoryEntries: SheetActionHistoryEntry[] =
              powerEffects.attributes.map((attr) => {
                const attribute = attr as Atributo;
                nextSheet.atributos[attribute] = {
                  ...nextSheet.atributos[attribute],
                  value: nextSheet.atributos[attribute].value + 1,
                };
                const skills =
                  attribute === Atributo.INTELIGENCIA ? intelligenceSkills : [];
                if (skills.length > 0) {
                  nextSheet.skills = [...nextSheet.skills, ...skills];
                }
                return {
                  source: { type: 'power' as const, name: selectedPower.name },
                  powerName: selectedPower.name,
                  changes: [
                    {
                      type: 'AttributeIncreasedByAumentoDeAtributo' as const,
                      attribute,
                      plateau,
                      oncePerTier,
                    },
                    ...(skills.length > 0
                      ? [{ type: 'SkillsAdded' as const, skills }]
                      : []),
                  ],
                };
              });

            nextSheet.sheetActionHistory = [
              ...(nextSheet.sheetActionHistory || []),
              ...newHistoryEntries,
            ];
          }

          // Apply class/power selections to the simulated sheet so the next
          // level can detect and offer the pre-selected power.
          if (selectedPower && currentLevelSelection.powerEffectSelections) {
            const almaLivreEffects =
              currentLevelSelection.powerEffectSelections[selectedPower.name];
            if (
              almaLivreEffects?.almaLivreClass &&
              almaLivreEffects?.almaLivrePower
            ) {
              nextSheet.almaLivreClass = almaLivreEffects.almaLivreClass;
              nextSheet.almaLivrePower = almaLivreEffects.almaLivrePower;
            }
            if (
              almaLivreEffects?.diferentaoClass &&
              almaLivreEffects?.diferentaoPower
            ) {
              nextSheet.diferentaoClass = almaLivreEffects.diferentaoClass;
              nextSheet.diferentaoPower = almaLivreEffects.diferentaoPower;
            }
          }
        }

        setSimulatedSheet(nextSheet);
      } else {
        // All levels complete - confirm
        // Make sure each selection has its selectedClassName set
        const finalSelections = updatedLevelSelections.map((sel) => ({
          ...sel,
          selectedClassName:
            sel.selectedClassName || simulatedSheet.classe.name,
          selectedClassSubname:
            sel.selectedClassSubname || simulatedSheet.classe.subname,
        }));
        onConfirm(finalSelections);
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
    } else if (currentLevel > startLevel) {
      // Go back to previous level
      const previousLevel = currentLevel - 1;
      const previousLevelSelection =
        allLevelSelections[previousLevel - startLevel];

      setCurrentLevel(previousLevel);
      setCurrentLevelSelection(previousLevelSelection);
      setAllLevelSelections(allLevelSelections.slice(0, -1));
      setActiveStep(0);
      setTrickStepCompanionIndex({ auto: 0, power: 0 });

      // Update simulated sheet - remove powers/spells from the level we're returning to
      // This allows the user to see their previous selection and modify it if desired
      const prevSheet = { ...simulatedSheet, nivel: previousLevel };

      // Remove the classLevels entry for the level we're returning to
      if (prevSheet.classLevels) {
        prevSheet.classLevels = prevSheet.classLevels.filter(
          (entry) => entry.level !== previousLevel
        );
      }

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
          previousLevelSelection.powerChoice === 'almaLivre' &&
          previousLevelSelection.selectedAlmaLivrePower
        ) {
          prevSheet.classPowers = (prevSheet.classPowers || []).filter(
            (p) =>
              p.name !== previousLevelSelection.selectedAlmaLivrePower?.name
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

        // Engenhocas do nível ao qual estamos voltando: saem e o T$ retorna.
        if (previousLevelSelection.engenhocasFabricadas?.length) {
          const engenhocaNames =
            previousLevelSelection.engenhocasFabricadas.map((s) => s.nome);
          prevSheet.spells = (prevSheet.spells || []).filter(
            (s) => !engenhocaNames.includes(s.nome)
          );
          prevSheet.dinheiro =
            (prevSheet.dinheiro ?? 0) +
            (previousLevelSelection.engenhocasCost ?? 0);
        }

        // Treinador: reverter truques aplicados ao sheet simulado no nível ao
        // qual estamos retornando (remove UMA ocorrência de cada — truques
        // repetíveis podem existir legitimamente mais de uma vez)
        if (
          previousLevelSelection.companionTrickSelections?.length &&
          prevSheet.companions?.length
        ) {
          previousLevelSelection.companionTrickSelections.forEach((entry) => {
            const targetIdx = Math.min(
              entry.companionIndex,
              (prevSheet.companions?.length || 1) - 1
            );
            prevSheet.companions = (prevSheet.companions || []).map(
              (companion, idx) => {
                if (idx !== targetIdx) return companion;
                const lastTrickIdx = companion.tricks
                  .map((t) => t.name)
                  .lastIndexOf(entry.trick.name);
                const next = {
                  ...companion,
                  tricks:
                    lastTrickIdx >= 0
                      ? companion.tricks.filter((_, i) => i !== lastTrickIdx)
                      : companion.tricks,
                };
                if (entry.spell && companion.spells?.length) {
                  const lastSpellIdx = companion.spells
                    .map((s) => s.nome)
                    .lastIndexOf(entry.spell.nome);
                  next.spells =
                    lastSpellIdx >= 0
                      ? companion.spells.filter((_, i) => i !== lastSpellIdx)
                      : companion.spells;
                }
                return next;
              }
            );
          });
        }

        // Treinador 5: reverter a escolha de Treino Especializado aplicada em
        // handleNext (depois do revert de truques, para o clamp de índice dos
        // truques ainda enxergar o 2º companheiro)
        const prevTreinoChoice = getTreinoEspecializadoChoice(
          previousLevelSelection
        );
        if (prevTreinoChoice && prevSheet.companions?.length) {
          if (
            prevTreinoChoice === CONQUISTAR_PELOS_NUMEROS &&
            prevSheet.companions.length > 1
          ) {
            prevSheet.companions = prevSheet.companions.slice(0, -1);
          } else if (prevTreinoChoice === TREINO_INTENSIVO) {
            prevSheet.companions = prevSheet.companions.map((companion, idx) =>
              idx === 0
                ? { ...companion, treinoIntensivo: undefined }
                : companion
            );
          }
        }

        // Remove sheetActionHistory entries for attribute increases from the level we're returning to
        const previousPower = getSelectedPower(previousLevelSelection);

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

          // Remove Alma Livre class/power if they were set in this level
          if (previousPower && previousLevelSelection.powerEffectSelections) {
            const almaLivreEffects =
              previousLevelSelection.powerEffectSelections[previousPower.name];
            if (
              almaLivreEffects?.almaLivreClass &&
              almaLivreEffects?.almaLivrePower
            ) {
              prevSheet.almaLivreClass = undefined;
              prevSheet.almaLivrePower = undefined;
            }
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
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: isMobile ? undefined : { maxHeight: '90vh' },
          },
        }}
      >
        <DialogTitle>
          <Box>
            <Typography
              variant='h6'
              sx={(theme) => ({
                [theme.breakpoints.down('md')]: { fontSize: '1.1rem' },
              })}
            >
              Progressão de Nível - Nível {currentLevel}
            </Typography>
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
              }}
            >
              Progresso geral: Nível {currentLevel} de {targetLevel}
            </Typography>
          </Box>
        </DialogTitle>
        {isMobile && (
          <Box sx={{ px: 3, pb: 2 }}>
            <CompactStepProgress activeStep={activeStep} steps={steps} />
          </Box>
        )}
        <DialogContent dividers>
          {!isMobile && (
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <Box sx={{ minHeight: 300 }}>{getStepContent(activeStep)}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttempt} color='inherit'>
            Cancelar
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 && currentLevel === startLevel}
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
