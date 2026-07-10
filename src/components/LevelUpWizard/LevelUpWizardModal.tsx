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
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { ClassPower } from '@/interfaces/Class';
import { GeneralPower } from '@/interfaces/Poderes';
import { allSpellSchools, Spell } from '@/interfaces/Spells';
import { CompanionSheet, CompanionTrick } from '@/interfaces/Companion';
import { getAllowedClassPowers, isPowerAvailable } from '@/functions/powers';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import {
  getPowerSelectionRequirements,
  getFilteredAvailableOptions,
} from '@/functions/powers/manualPowerSelection';
import { getCurrentPlateau } from '@/functions/powers/general';
import { isClassOrVariantOf } from '@/functions/general';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import {
  getClassLevel,
  initializeClassLevels,
  findClassDescription,
  buildSpellPathFromSetup,
  serializeSpellPath,
  getClassSetupAbilities,
} from '@/functions/multiclass';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import {
  countNaturalWeapons,
  createCompanion,
  getCompanionTrickDefinition,
  getTrickAvailability,
} from '@/data/systems/tormenta20/herois-de-arton/companion';
import PowerSelectionStep from './steps/PowerSelectionStep';
import LevelSpellSelectionStep from './steps/LevelSpellSelectionStep';
import PowerEffectSelectionStep from '../CharacterCreationWizard/steps/PowerEffectSelectionStep';
import LevelBenefitsStep from './steps/LevelBenefitsStep';
import ClassSelectionStep from './steps/ClassSelectionStep';
import ClassSetupStep from './steps/ClassSetupStep';
import CompanionTrickSelectionStep from './steps/CompanionTrickSelectionStep';
import CompanionCreationStep from '../CharacterCreationWizard/steps/CompanionCreationStep';
import RaceLevelUpPickStep, {
  RaceLevelUpPick,
} from './steps/RaceLevelUpPickStep';

interface LevelUpWizardModalProps {
  open: boolean;
  initialSheet: CharacterSheet; // Sheet at current level (level-up starts at nivel+1)
  targetLevel: number; // Final level to reach
  supplements: SupplementId[]; // Active supplements for power filtering
  onConfirm: (levelUpSelections: LevelUpSelections[]) => void;
  onCancel: () => void;
}

// Treinador nível 5: escolha de Treino Especializado
const TREINO_ESPECIALIZADO = 'Treino Especializado';
const CONQUISTAR_PELOS_NUMEROS = 'Conquistar pelos Números';
const TREINO_INTENSIVO = 'Treino Intensivo';

// Escolha (pendente) de Treino Especializado feita no step 'Efeitos de
// Habilidades' do nível atual
const getTreinoEspecializadoChoice = (
  sel: LevelUpSelections
): string | undefined =>
  sel.abilityEffectSelections?.[TREINO_ESPECIALIZADO]?.chosenOption?.[0];

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

  // Confirmation dialog state for cancel action
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

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

  // Helper to resolve the selected power based on power choice type
  const getSelectedPower = (
    sel: LevelUpSelections
  ): ClassPower | GeneralPower | undefined => {
    if (sel.powerChoice === 'class') return sel.selectedClassPower;
    if (sel.powerChoice === 'almaLivre') return sel.selectedAlmaLivrePower;
    return sel.selectedGeneralPower;
  };

  // Get the selected class name and compute class level for the current level-up
  const selectedClassName =
    currentLevelSelection.selectedClassName || simulatedSheet.classe.name;
  const { selectedClassSubname } = currentLevelSelection;
  const selectedClassLevel =
    getClassLevel(simulatedSheet, selectedClassName) + 1; // +1 because we're adding this level
  const selectedClassDesc = findClassDescription(
    selectedClassName,
    selectedClassSubname,
    supplements
  );

  // Sheet with nivel reflecting the current level being processed
  // (simulatedSheet.nivel lags behind on the first level-up of each session)
  const sheetForCurrentLevel: CharacterSheet = {
    ...simulatedSheet,
    nivel: currentLevel,
  };

  // Companheiro com os truques pendentes da OUTRA razão (auto/power) deste
  // nível projetados sobre os truques já refletidos no simulatedSheet — evita
  // escolher o mesmo truque não-repetível nos dois steps do mesmo nível
  const getProjectedCompanion = (
    reason: 'auto' | 'power',
    companionIndex: number
  ): CompanionSheet | undefined => {
    const base = simulatedSheet.companions?.[companionIndex];
    if (!base) return undefined;
    const pendingFromOtherStep = (
      currentLevelSelection.companionTrickSelections || []
    )
      .filter((e) => e.reason !== reason && e.companionIndex === companionIndex)
      .map((e) => e.trick);
    if (pendingFromOtherStep.length === 0) return base;
    return { ...base, tricks: [...base.tricks, ...pendingFromOtherStep] };
  };

  // Multiclass: first level in a new class grants no power
  const isFirstLevelInNewClass =
    selectedClassLevel === 1 &&
    selectedClassName !== simulatedSheet.classe.name;

  // Classes that require user choices during first-level setup (variant-aware:
  // ex. Magimarcialista, variante de Bardo, herda o setup de escolas)
  const classNeedsUserSetup =
    isFirstLevelInNewClass &&
    !!selectedClassDesc &&
    (isClassOrVariantOf(selectedClassDesc, 'Arcanista') ||
      isClassOrVariantOf(selectedClassDesc, 'Bardo') ||
      isClassOrVariantOf(selectedClassDesc, 'Druida') ||
      // Classes homebrew com escolha de escolas (estilo Bardo)
      !!selectedClassDesc.spellPath?.schoolChoice);

  // Get available powers for current simulated sheet
  const getAvailablePowers = (): {
    classPowers: ClassPower[];
    generalPowers: GeneralPower[];
    unavailableGeneralPowers: string[];
  } => {
    // Get class with merged supplement powers from registry
    // Use the SELECTED class for power filtering (multiclass support)
    const classNameForPowers = selectedClassName;
    const classWithSupplementPowers = dataRegistry.getClassByName(
      classNameForPowers,
      supplements
    );

    // Create a sheet with the selected class powers for filtering
    const classForFiltering = classWithSupplementPowers || selectedClassDesc;
    const sheetForFiltering: CharacterSheet = classForFiltering
      ? {
          ...sheetForCurrentLevel,
          classe: {
            ...sheetForCurrentLevel.classe,
            name: classNameForPowers,
            powers: classForFiltering.powers,
            proficiencias:
              sheetForCurrentLevel.classe.proficiencias ||
              classForFiltering.proficiencias ||
              [],
          },
        }
      : sheetForCurrentLevel;

    // Get class powers using the selected class's powers.
    // Sempre usar getAllowedClassPowers na lista manual: a ponderação do
    // Inventor (getWeightedInventorClassPowers) expande a lista com entradas
    // duplicadas, o que só faz sentido em sorteio aleatório — numa seleção
    // manual geraria poderes repetidos. Cobre Inventor e suas variantes
    // (ex.: Alquimista) via sheetForFiltering.classe.powers.
    const classPowers = getAllowedClassPowers(sheetForFiltering, {
      classLevel: selectedClassLevel,
    });

    // Use dataRegistry to get powers from all active supplements.
    // Inclui os 5 tipos de poderes gerais, mais os poderes de raça (ex.: Glamour)
    // que o personagem qualifica — poderes de raça só aparecem para quem atende
    // ao requisito de raça, evitando poluir a lista com poderes de outras raças.
    const allPowers = dataRegistry.getPowersBySupplements(supplements);
    const allGeneralPowers = [
      ...allPowers.COMBATE,
      ...allPowers.CONCEDIDOS,
      ...allPowers.DESTINO,
      ...allPowers.MAGIA,
      ...allPowers.TORMENTA,
      ...allPowers.RACA.filter((power) =>
        isPowerAvailable(sheetForCurrentLevel, power)
      ),
    ];

    // Track which powers are unavailable (requirements not met)
    const existingGeneralPowers = sheetForCurrentLevel.generalPowers;
    const unavailableGeneralPowers: string[] = [];
    const generalPowers = allGeneralPowers.filter((power) => {
      const isRepeatedPower = existingGeneralPowers.find(
        (existingPower) => existingPower.name === power.name
      );

      if (isRepeatedPower && !power.allowSeveralPicks) {
        return true; // Keep in list; isPowerKnown handles disable in UI
      }

      if (!isPowerAvailable(sheetForCurrentLevel, power)) {
        unavailableGeneralPowers.push(power.name);
      }
      return true; // Always include
    });

    // Sort powers alphabetically
    const sortedClassPowers = [...classPowers].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR')
    );
    const sortedGeneralPowers = [...generalPowers].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR')
    );

    return {
      classPowers: sortedClassPowers,
      generalPowers: sortedGeneralPowers,
      unavailableGeneralPowers,
    };
  };

  // Get spell info for current level (uses selected class's spellPath and class level)
  const getSpellInfo = (): {
    shouldLearnSpells: boolean;
    spellCount: number;
    spellCircle: number;
    availableSpells: Spell[];
    crossTraditionSpellNames: Set<string>;
    crossTraditionLimit?: number;
  } | null => {
    // Use the selected class's spellPath (for multiclass support)
    // For first level in new class, build spellPath from setup choices
    let spellPath;
    if (isFirstLevelInNewClass) {
      spellPath = buildSpellPathFromSetup(
        selectedClassName,
        selectedClassSubname,
        currentLevelSelection.classSetup,
        supplements
      );
    } else {
      const activeClassDesc = selectedClassDesc || simulatedSheet.classe;
      // Check multiclassSpellPaths for secondary caster classes (spellPath stored from setup)
      const storedPath =
        simulatedSheet.multiclassSpellPaths?.[selectedClassName];
      if (storedPath && activeClassDesc.name !== simulatedSheet.classe.name) {
        // Rebuild full SpellPath with functions from the stored serializable data
        spellPath = buildSpellPathFromSetup(
          storedPath.className,
          storedPath.classSubname,
          { spellSchools: storedPath.schools },
          supplements
        );
      } else {
        // simulatedSheet.classe.spellPath has setup() applied (at creation and
        // rehydrated on load); selectedClassDesc from dataRegistry does not.
        const isLevelingMainClass =
          activeClassDesc.name === simulatedSheet.classe.name;
        spellPath = isLevelingMainClass
          ? simulatedSheet.classe.spellPath || activeClassDesc.spellPath || null
          : activeClassDesc.spellPath || null;
      }
    }
    if (!spellPath) {
      return null;
    }

    // Use CLASS level for spell progression, not character level
    // For first level in new class via multiclass, use initialSpells
    let spellCount;
    if (isFirstLevelInNewClass && spellPath.initialSpells > 0) {
      spellCount = spellPath.initialSpells;
    } else {
      spellCount = spellPath.qtySpellsLearnAtLevel(selectedClassLevel);
    }

    if (spellCount === 0) {
      return null; // No spells this level
    }

    const spellCircle =
      spellPath.spellCircleAvailableAtLevel(selectedClassLevel);
    const crossNames = new Set<string>();

    // Get spells from all available circles (1 through spellCircle)
    let allSpellsOfCircle: Spell[] = [];
    if (spellPath.spellType === 'Arcane') {
      for (let circle = 1; circle <= spellCircle; circle += 1) {
        const circleSpells = dataRegistry.getArcaneSpellsByCircleAndSupplements(
          circle,
          supplements
        );
        allSpellsOfCircle = [...allSpellsOfCircle, ...circleSpells];
      }

      // Include divine spells from specified schools (e.g., Necromante gets divine Necro)
      if (
        spellPath.includeDivineSchools &&
        spellPath.includeDivineSchools.length > 0
      ) {
        for (let circle = 1; circle <= spellCircle; circle += 1) {
          const divineSpells =
            dataRegistry.getDivineSpellsByCircleAndSupplements(
              circle,
              supplements
            );
          const extraDivineSpells = divineSpells.filter((spell) =>
            spellPath.includeDivineSchools!.includes(spell.school)
          );
          if (spellPath.crossTraditionLimit) {
            extraDivineSpells.forEach((s) => crossNames.add(s.nome));
          }
          allSpellsOfCircle = [...allSpellsOfCircle, ...extraDivineSpells];
        }
      }
    } else if (spellPath.spellType === 'Divine') {
      for (let circle = 1; circle <= spellCircle; circle += 1) {
        const circleSpells = dataRegistry.getDivineSpellsByCircleAndSupplements(
          circle,
          supplements
        );
        allSpellsOfCircle = [...allSpellsOfCircle, ...circleSpells];
      }

      // Include arcane spells from specified schools (e.g., Teurgista Místico)
      if (
        spellPath.includeArcaneSchools &&
        spellPath.includeArcaneSchools.length > 0
      ) {
        for (let circle = 1; circle <= spellCircle; circle += 1) {
          const arcaneSpells =
            dataRegistry.getArcaneSpellsByCircleAndSupplements(
              circle,
              supplements
            );
          const extraArcaneSpells = arcaneSpells.filter((spell) =>
            spellPath.includeArcaneSchools!.includes(spell.school)
          );
          if (spellPath.crossTraditionLimit) {
            extraArcaneSpells.forEach((s) => crossNames.add(s.nome));
          }
          allSpellsOfCircle = [...allSpellsOfCircle, ...extraArcaneSpells];
        }
      }
    } else if (spellPath.spellType === 'Both') {
      // Combine arcane and divine spells from all circles
      for (let circle = 1; circle <= spellCircle; circle += 1) {
        const arcaneSpells = dataRegistry.getArcaneSpellsByCircleAndSupplements(
          circle,
          supplements
        );
        const divineSpells = dataRegistry.getDivineSpellsByCircleAndSupplements(
          circle,
          supplements
        );
        allSpellsOfCircle = [
          ...allSpellsOfCircle,
          ...arcaneSpells,
          ...divineSpells,
        ];
      }
      allSpellsOfCircle = allSpellsOfCircle.filter(
        (spell, index, self) =>
          index === self.findIndex((s) => s.nome === spell.nome)
      );
    } else {
      // Fallback: combine arcane + divine from all circles
      for (let circle = 1; circle <= spellCircle; circle += 1) {
        const arcaneSpells = dataRegistry.getArcaneSpellsByCircleAndSupplements(
          circle,
          supplements
        );
        const divineSpells = dataRegistry.getDivineSpellsByCircleAndSupplements(
          circle,
          supplements
        );
        allSpellsOfCircle = [
          ...allSpellsOfCircle,
          ...arcaneSpells,
          ...divineSpells,
        ];
      }
      allSpellsOfCircle = allSpellsOfCircle.filter(
        (spell, index, self) =>
          index === self.findIndex((s) => s.nome === spell.nome)
      );
    }

    // Check if character already has a cross-tradition spell for this circle
    if (spellPath.crossTraditionLimit && crossNames.size > 0) {
      const existingCrossTraditionCount = simulatedSheet.spells.filter((s) =>
        crossNames.has(s.nome)
      ).length;
      if (existingCrossTraditionCount >= spellPath.crossTraditionLimit) {
        // Already at limit: remove cross-tradition spells from pool
        allSpellsOfCircle = allSpellsOfCircle.filter(
          (s) => !crossNames.has(s.nome)
        );
        crossNames.clear();
      }
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

    // Apply excludeSchools blacklist
    if (spellPath.excludeSchools && spellPath.excludeSchools.length > 0) {
      filteredSpells = filteredSpells.filter(
        (spell) => !spellPath.excludeSchools!.includes(spell.school)
      );
    }

    // Remove duplicates by name
    filteredSpells = filteredSpells.filter(
      (spell, index, self) =>
        index === self.findIndex((s) => s.nome === spell.nome)
    );

    // Filter out already known spells
    const availableSpells = filteredSpells.filter(
      (s) => !knownSpellNames.includes(s.nome)
    );

    return {
      shouldLearnSpells: true,
      spellCount,
      spellCircle,
      availableSpells,
      crossTraditionSpellNames: crossNames,
      crossTraditionLimit: spellPath.crossTraditionLimit,
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
  // For multiclass: use selected class's abilities filtered by CLASS level
  const needsAbilityEffectSelections = (): boolean => {
    const activeClassDesc = selectedClassDesc || simulatedSheet.classe;
    const baseAbilities =
      activeClassDesc.originalAbilities || activeClassDesc.abilities;
    const setupAbilities = getClassSetupAbilities(
      selectedClassName,
      currentLevelSelection.classSetup
    );
    const allAbilities = [...baseAbilities, ...setupAbilities];
    const newlyAvailableAbilities = allAbilities.filter(
      (ability) => ability.nivel === selectedClassLevel
    );

    return newlyAvailableAbilities.some((ability) => {
      const requirements = getPowerSelectionRequirements(ability);
      return requirements !== null && requirements.requirements.length > 0;
    });
  };

  // Habilidades de raça que concedem novas escolhas ("picks") ao subir de nível
  // (config `levelUp` na ação `chooseFromOptions`). Apenas o caso ADITIVO
  // (`substitutes === 'none'`) é tratado aqui; a substituição por poder de
  // classe/geral é tratada no fluxo de escolha de poder.
  const getRaceLevelUpPicks = (): RaceLevelUpPick[] => {
    const abilities = simulatedSheet.raca?.abilities || [];
    const result: RaceLevelUpPick[] = [];
    abilities.forEach((ability) => {
      (ability.sheetActions || []).forEach((sheetAction) => {
        const { action } = sheetAction;
        if (
          action.type === 'chooseFromOptions' &&
          action.levelUp &&
          action.levelUp.substitutes === 'none' &&
          action.levelUp.pickPerLevelUp > 0 &&
          action.options.length > 0
        ) {
          result.push({
            optionKey: action.optionKey,
            abilityName: ability.name,
            pickPerLevelUp: action.levelUp.pickPerLevelUp,
            options: action.options.map((o) => ({
              name: o.name,
              text: o.text,
              repeatable: o.repeatable,
            })),
          });
        }
      });
    });
    return result;
  };

  // Build steps for current level
  const getSteps = (): string[] => {
    const steps: string[] = [];
    // Multiclass: add class selection step if feature is enabled (even for non-supporters)
    if (isMulticlassEnabled) {
      steps.push('Escolha de Classe');
    }
    // Multiclass: class setup step for classes needing user choices (Arcanista, Bardo, Druida)
    if (classNeedsUserSetup) {
      steps.push('Configuração da Classe');
    }
    steps.push('Ganhos do Nível');

    // Multiclasse: primeiro nível de Treinador exige criação do Melhor Amigo
    if (
      isFirstLevelInNewClass &&
      selectedClassName === 'Treinador' &&
      !simulatedSheet.companions?.length
    ) {
      steps.push('Melhor Amigo');
    }

    // First level in a new class (multiclass) grants no power
    if (!isFirstLevelInNewClass) {
      steps.push('Escolha de Poder');

      if (needsPowerEffectSelections()) {
        steps.push('Efeitos do Poder');
      }
    }

    if (needsAbilityEffectSelections()) {
      steps.push('Efeitos de Habilidades');
    }

    // Treinador 5: Conquistar pelos Números concede um segundo melhor amigo,
    // que o jogador personaliza como o primeiro
    const treinoChoice = getTreinoEspecializadoChoice(currentLevelSelection);
    if (
      selectedClassName === 'Treinador' &&
      selectedClassLevel === 5 &&
      simulatedSheet.companions?.length &&
      treinoChoice === CONQUISTAR_PELOS_NUMEROS
    ) {
      steps.push('Segundo Melhor Amigo');
    }

    if (getRaceLevelUpPicks().length > 0) {
      steps.push('Escolhas de Raça');
    }

    const spellInfo = getSpellInfo();
    if (spellInfo && spellInfo.shouldLearnSpells) {
      steps.push('Seleção de Magias');
    }

    // Treinador: truque do parceiro nos níveis 4, 7, 10, 13, 16, 19
    // Treino Intensivo: truque extra nos níveis 5 e 11 (a escolha pendente do
    // próprio nível 5 também conta, antes de ser refletida no sheet simulado)
    const COMPANION_TRICK_LEVELS = [4, 7, 10, 13, 16, 19];
    const hasTreinoIntensivo =
      simulatedSheet.companions?.[0]?.treinoIntensivo ||
      (selectedClassName === 'Treinador' &&
        selectedClassLevel === 5 &&
        treinoChoice === TREINO_INTENSIVO);
    const allTrickLevels = hasTreinoIntensivo
      ? [...COMPANION_TRICK_LEVELS, 5, 11]
      : COMPANION_TRICK_LEVELS;
    if (
      selectedClassName === 'Treinador' &&
      allTrickLevels.includes(selectedClassLevel) &&
      simulatedSheet.companions?.length
    ) {
      steps.push('Truque do Melhor Amigo');
    }

    // Treinador: poder "Ensinar Truque" concede um truque adicional ao melhor amigo
    if (
      currentLevelSelection.powerChoice === 'class' &&
      currentLevelSelection.selectedClassPower?.name === 'Ensinar Truque' &&
      simulatedSheet.companions?.length
    ) {
      steps.push('Truque do Melhor Amigo (Ensinar Truque)');
    }

    return steps;
  };

  const steps = getSteps();

  // Validate current step completion
  const isStepComplete = (stepIndex: number): boolean => {
    const stepName = steps[stepIndex];

    switch (stepName) {
      case 'Escolha de Classe':
        return !!currentLevelSelection.selectedClassName;

      case 'Configuração da Classe': {
        const setup = currentLevelSelection.classSetup;
        if (!setup) return false;
        if (selectedClassName === 'Arcanista') {
          if (!setup.arcanistaSubtype) return false;
          if (setup.arcanistaSubtype === 'Feiticeiro') {
            if (!setup.feiticeiroLinhagem) return false;
            if (
              setup.feiticeiroLinhagem === 'Linhagem Dracônica' &&
              !setup.draconicaDamageType
            )
              return false;
            if (
              setup.feiticeiroLinhagem === 'Linhagem Abençoada' &&
              !setup.linhagemAbencoadaDeus
            )
              return false;
          }
          return true;
        }
        if (selectedClassDesc?.spellPath?.schoolChoice) {
          // Classes homebrew: quantidade declarada no spellPath (nunca maior
          // que o pool de escolas disponíveis)
          const { count, available } = selectedClassDesc.spellPath.schoolChoice;
          const poolSize = available?.length ?? allSpellSchools.length;
          return setup.spellSchools?.length === Math.min(count, poolSize);
        }
        if (
          selectedClassDesc &&
          (isClassOrVariantOf(selectedClassDesc, 'Bardo') ||
            isClassOrVariantOf(selectedClassDesc, 'Druida'))
        ) {
          return setup.spellSchools?.length === 3;
        }
        return true;
      }

      case 'Ganhos do Nível':
        return true;

      case 'Escolha de Poder':
        return (
          (currentLevelSelection.powerChoice === 'class' &&
            currentLevelSelection.selectedClassPower !== undefined) ||
          (currentLevelSelection.powerChoice === 'general' &&
            currentLevelSelection.selectedGeneralPower !== undefined) ||
          (currentLevelSelection.powerChoice === 'almaLivre' &&
            currentLevelSelection.selectedAlmaLivrePower !== undefined)
        );

      case 'Efeitos do Poder': {
        const power = getSelectedPower(currentLevelSelection);

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
            case 'almaLivreSelectClass':
              return pSelections.almaLivreClass && pSelections.almaLivrePower
                ? 1
                : 0;
            case 'buildGolpePessoal':
              return pSelections.golpePessoalBuild ? 1 : 0;
            default:
              return 0;
          }
        };

        return requirements.requirements.every((req) => {
          const { type, pick } = req;

          // Golpe Pessoal usa um construtor próprio e tem availableOptions vazio
          // por design — exige que um build tenha sido montado pelo usuário.
          if (type === 'buildGolpePessoal') {
            return getSelectionCount(power.name, type) >= 1;
          }

          // Check available options - if none available, consider requirement satisfied
          const availableOptions = getFilteredAvailableOptions(
            req,
            sheetForCurrentLevel
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
        // Treinador 5: a escolha de Treino Especializado é obrigatória — sem
        // ela, o chooseFromOptions sorteia uma opção aleatória no apply
        if (selectedClassName === 'Treinador' && selectedClassLevel === 5) {
          return !!getTreinoEspecializadoChoice(currentLevelSelection);
        }
        // Demais habilidades: opcional (pode pular)
        // TODO: Implement validation for required ability selections
        return true;
      }

      case 'Escolhas de Raça': {
        const picks = getRaceLevelUpPicks();
        const chosen = currentLevelSelection.levelUpOptionPicks || {};
        return picks.every(
          (pick) =>
            (chosen[pick.optionKey] || []).length === pick.pickPerLevelUp
        );
      }

      case 'Seleção de Magias': {
        const spellInfo = getSpellInfo();
        if (!spellInfo) return true;

        const selectedCount = currentLevelSelection.spellsLearned?.length || 0;
        return selectedCount === spellInfo.spellCount;
      }

      case 'Truque do Melhor Amigo':
      case 'Truque do Melhor Amigo (Ensinar Truque)': {
        const reason: 'auto' | 'power' =
          stepName === 'Truque do Melhor Amigo (Ensinar Truque)'
            ? 'power'
            : 'auto';
        const entry = currentLevelSelection.companionTrickSelections?.find(
          (e) => e.reason === reason
        );
        if (!entry) return false;
        const companion = getProjectedCompanion(reason, entry.companionIndex);
        if (!companion) return false;
        const trickDef = getCompanionTrickDefinition(entry.trick.name);
        if (!trickDef) return false;
        const { available } = getTrickAvailability(
          trickDef,
          selectedClassLevel,
          companion.companionType,
          companion.size,
          companion.tricks,
          countNaturalWeapons(companion.companionType, companion.tricks),
          false
        );
        if (!available) return false;
        if (trickDef.hasSubChoice) {
          if (trickDef.subChoiceType === 'attribute')
            return (
              !!entry.trick.choices?.primary && !!entry.trick.choices?.secondary
            );
          if (trickDef.subChoiceType === 'movement')
            return !!entry.trick.choices?.type;
          if (trickDef.subChoiceType === 'spell') return !!entry.spell;
        }
        return true;
      }

      case 'Melhor Amigo':
      case 'Segundo Melhor Amigo': {
        const {
          companionType,
          companionSize,
          companionWeaponDamageType,
          companionSpiritEnergyType,
          companionSkills,
          companionTricks,
        } = currentLevelSelection;
        if (!companionType || !companionSize || !companionWeaponDamageType)
          return false;
        if (companionType === 'Espírito' && !companionSpiritEnergyType)
          return false;
        if (!companionSkills || companionSkills.length !== 3) return false;
        if (!companionTricks || companionTricks.length !== 2) return false;
        return companionTricks.every((t) => {
          const def = getCompanionTrickDefinition(t.name);
          if (!def?.hasSubChoice) return true;
          if (def.subChoiceType === 'attribute')
            return !!t.choices?.primary && !!t.choices?.secondary;
          if (def.subChoiceType === 'movement') return !!t.choices?.type;
          return true;
        });
      }

      default:
        return false;
    }
  };

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
            classSetup={currentLevelSelection.classSetup || {}}
            onChange={(setup) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                classSetup: setup,
              })
            }
            activeSupplements={supplements}
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
        const { classPowers, generalPowers, unavailableGeneralPowers } =
          getAvailablePowers();

        // Get known powers from simulated sheet (powers already added to the sheet)
        const knownClassPowers =
          simulatedSheet.classPowers?.map((p) => p.name) || [];
        const knownGeneralPowers = [
          ...(simulatedSheet.generalPowers?.map((p) => p.name) || []),
          ...(simulatedSheet.raca.abilities?.map((a) => a.name) || []),
        ];

        // Alma Livre detection: check if the character has a pre-selected power
        // that hasn't been acquired yet
        const almaLivrePower = simulatedSheet.almaLivrePower || null;
        const almaLivreClassName = simulatedSheet.almaLivreClass;
        const almaLivrePowerAcquired = simulatedSheet.classPowers?.some(
          (p) => p.name === almaLivrePower?.name
        );
        const showAlmaLivre =
          almaLivrePower && almaLivreClassName && !almaLivrePowerAcquired;

        // Check if Alma Livre power requirements are met (using nivel - 4)
        let almaLivrePowerAvailable = false;
        if (showAlmaLivre && almaLivrePower) {
          const almaLivreSheet = {
            ...simulatedSheet,
            nivel: Math.max(1, currentLevel - 4),
          };
          almaLivrePowerAvailable = isPowerAvailable(
            almaLivreSheet,
            almaLivrePower
          );
        }

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
                selectedAlmaLivrePower: undefined,
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
            onAlmaLivrePowerSelect={(power) =>
              setCurrentLevelSelection({
                ...currentLevelSelection,
                selectedAlmaLivrePower: power,
              })
            }
            className={selectedClassName}
            knownClassPowers={knownClassPowers}
            knownGeneralPowers={knownGeneralPowers}
            unavailableGeneralPowers={unavailableGeneralPowers}
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

      case 'Efeitos de Habilidades': {
        // For multiclass: use the selected class for ability effects,
        // injecting setup abilities (e.g. Feiticeiro linhagem)
        const activeClass = selectedClassDesc || simulatedSheet.classe;
        const setupAbilitiesForStep = getClassSetupAbilities(
          selectedClassName,
          currentLevelSelection.classSetup
        );
        const expandedClass =
          setupAbilitiesForStep.length > 0
            ? {
                ...activeClass,
                abilities: [...activeClass.abilities, ...setupAbilitiesForStep],
              }
            : activeClass;
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
            crossTraditionLimit={spellInfo.crossTraditionLimit}
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

        const upsert = (
          patch: Partial<{
            companionIndex: number;
            trick: CompanionTrick | undefined;
            spell: Spell | undefined;
          }>
        ) => {
          const others = selections.filter((e) => e.reason !== reason);
          // Se "patch.trick" for explicitamente undefined (clear), remove a entry
          if ('trick' in patch && patch.trick === undefined) {
            setCurrentLevelSelection({
              ...currentLevelSelection,
              companionTrickSelections: others.length ? others : undefined,
            });
            return;
          }
          const baseTrick = patch.trick ?? existing?.trick;
          if (!baseTrick) return;
          const updated = {
            companionIndex: patch.companionIndex ?? selectedCompanionIndex,
            trick: baseTrick,
            spell: 'spell' in patch ? patch.spell : existing?.spell,
            reason,
          };
          setCurrentLevelSelection({
            ...currentLevelSelection,
            companionTrickSelections: [...others, updated],
          });
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

          // Apply Alma Livre class/power selections to the simulated sheet
          // so the next level can detect and offer the pre-selected power
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
        slotProps={{
          paper: {
            sx: {
              maxHeight: '90vh',
            },
          },
        }}
      >
        <DialogTitle>
          <Box>
            <Typography variant='h6'>
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
