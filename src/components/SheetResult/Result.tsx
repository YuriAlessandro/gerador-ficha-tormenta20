/* eslint-disable no-console */
import React, { useState, useCallback, useMemo } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import EditIcon from '@mui/icons-material/Edit';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Badge,
  Box,
  Card,
  Chip,
  Container,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Link,
  Snackbar,
} from '@mui/material';
import styled from '@emotion/styled';
import {
  MOREAU_HERITAGES,
  MoreauHeritageName,
} from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { isHeavyArmor } from '@/data/systems/tormenta20/equipamentos';
import { recalculateSheet } from '@/functions/recalculateSheet';
import { getSheetProficiencias } from '@/functions/proficiencies';
import {
  applyManualLevelUp,
  calculateCurrencySpaces,
} from '@/functions/general';
import { useContentSupplements } from '@/hooks/useContentSupplements';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import {
  isMulticlass,
  getMulticlassDisplayName,
  getClassLevelsMap,
  getClassLevel,
} from '@/functions/multiclass';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { Spell } from '@/interfaces/Spells';
import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import { CompanionSheet } from '@/interfaces/Companion';
import { CustomPower } from '@/interfaces/CustomPower';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import {
  ConditionsBar,
  ConditionMarker,
  useConditionHighlights,
} from '@/premium/components/Conditions';
import { PartnerSheetPanel } from '@/premium/components/Partners';
import { ParodySpellPickerDialog } from '@/premium/components/ParodySpellPicker';
import { getConditionLabelStyle } from '@/premium/functions/conditionHighlights';
import type { ActiveCondition } from '@/premium/interfaces/ActiveCondition';
import { useOptionalEncounter } from '@/premium/hooks/useOptionalEncounter';
import { v4 as uuidv4 } from 'uuid';
import {
  ActiveEffectMarker,
  PowerEffectOfferModal,
  ActiveEffectsCleanupModal,
  ActiveEffectsManagerModal,
  ActivePowerUseDialog,
} from '@/premium/components/ActiveEffects';
import socketService, {
  type PowerEffectOfferPayload,
  type PowerEffectBonusPayload,
} from '@/premium/services/socket.service';
import {
  getActiveEffectHighlights,
  getActiveEffectLabelStyle,
  ACTIVE_EFFECT_COLOR,
} from '@/premium/functions/activeEffectHighlights';
import { getActiveEffectForSpell } from '@/premium/data/activePowers';
import {
  collectVirtualCustomEffectDefinitions,
  buildVirtualDefinitionFromCustomEffect,
} from '@/premium/data/activePowers/customEffectAdapter';
import type {
  ActivePowerDefinition,
  ActiveEffectUsageOption,
  ActiveEffect,
} from '@/premium/interfaces/ActiveEffect';
import LevelUpWizardModal from '../LevelUpWizard/LevelUpWizardModal';
import CharacterSheet, {
  DamageReduction,
} from '../../interfaces/CharacterSheet';
import Weapons from '../Weapons';
import DefenseEquipments from '../DefenseEquipments';
import Equipment, {
  AmmoType,
  DefenseEquipment,
  equipGroup,
} from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import '../../assets/css/result.css';
import Spells from '../Spells';
import SkillTable from './SkillTable';
import LabelDisplay from './LabelDisplay';
import AttributeDisplay from './AttributeDisplay';
import FancyBox from './common/FancyBox';
import BookTitle from './common/BookTitle';
import PowersDisplay from './PowersDisplay';
import CompanionSheetModal from './CompanionSheetModal';
import CompanionCreationDialog from './CompanionCreationDialog';
import CompanionEditDialog from './CompanionEditDialog';
import RollButton from '../RollButton';
import SheetInfoEditDrawer from './EditDrawers/SheetInfoEditDrawer';
import SkillsEditDrawer from './EditDrawers/SkillsEditDrawer';
import { BackpackModal } from './BackpackModal';
import { applyWielding, WieldingSlot } from './BackpackModal/wielding';
import { getOrderedItemsByGroup } from './BackpackModal/bagOrdering';
import { calcAmmoSpaces, findAmmoStack } from './BackpackModal/ammo';
import PowersEditDrawer from './EditDrawers/PowersEditDrawer';
import SpellsEditDrawer from './EditDrawers/SpellsEditDrawer';
import DefenseEditDrawer from './EditDrawers/DefenseEditDrawer';
import ProficiencyEditDrawer from './EditDrawers/ProficiencyEditDrawer';
import SizeDisplacementEditDrawer from './EditDrawers/SizeDisplacementEditDrawer';
import StatEditDrawer from './EditDrawers/StatEditDrawer';
import NotesDialog from './NotesDialog';
import StatControl from './StatControl';

// Styled components defined outside to prevent recreation on every render
const BackgroundBox = styled(Box)<{ isDarkMode: boolean }>`
  background-color: ${(props) => (props.isDarkMode ? '#212121' : '#f3f2f1')};
`;

interface ThemeProp {
  theme: {
    palette: {
      primary: {
        main: string;
      };
    };
  };
}

const StatTitle = styled.h4`
  font-family: 'Tfont';
  position: relative;
  font-size: 16px;
  text-transform: uppercase;
  margin: 0;
  white-space: nowrap;
`;

const StatLabel = styled.div<ThemeProp>`
  font-family: 'Tfont';
  text-align: center;
  width: 100%;
  font-size: 45px;
  color: ${(props) => props.theme.palette.primary.main};
  line-height: 1;
  margin: 0;
`;

const formatRdLabel = (rd: DamageReduction | undefined): string => {
  if (!rd) return '';
  const entries = Object.entries(rd)
    .filter(([, v]) => v && v > 0)
    .map(([type, v]) => `${v} ${type.toLowerCase()}`);
  if (entries.length === 0) return '';

  const MAX_LENGTH = 40;
  const full = entries.join(' | ');
  if (full.length <= MAX_LENGTH) return full;

  const truncated = entries.reduce((acc, entry) => {
    const next = acc ? `${acc} | ${entry}` : entry;
    if (next.length > MAX_LENGTH - 3) return acc;
    return next;
  }, '');
  return `${truncated}...`;
};

interface ResultProps {
  sheet: CharacterSheet;
  isDarkMode: boolean;
  onSheetUpdate?: (updatedSheet: CharacterSheet) => void;
}

const Result: React.FC<ResultProps> = (props) => {
  const { sheet, isDarkMode, onSheetUpdate } = props;
  const [currentSheet, setCurrentSheet] = useState(sheet);
  const [sheetInfoDrawerOpen, setSheetInfoDrawerOpen] = useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [backpackInitialFilter, setBackpackInitialFilter] = useState<
    equipGroup[] | undefined
  >(undefined);
  const [powersDrawerOpen, setPowersDrawerOpen] = useState(false);
  const [spellsDrawerOpen, setSpellsDrawerOpen] = useState(false);
  const [defenseDrawerOpen, setDefenseDrawerOpen] = useState(false);
  const [proficiencyDrawerOpen, setProficiencyDrawerOpen] = useState(false);
  const [sizeDisplacementDrawerOpen, setSizeDisplacementDrawerOpen] =
    useState(false);
  const [statDrawerOpen, setStatDrawerOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [companionCreationOpen, setCompanionCreationOpen] = useState(false);
  const [companionEditOpen, setCompanionEditOpen] = useState(false);
  const [selectedCompanionIndex, setSelectedCompanionIndex] = useState(0);
  const [parodyDialogOpen, setParodyDialogOpen] = useState(false);
  const [pendingOffer, setPendingOffer] =
    useState<PowerEffectOfferPayload | null>(null);
  const [spellEffectDef, setSpellEffectDef] =
    useState<ActivePowerDefinition | null>(null);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [effectsModalOpen, setEffectsModalOpen] = useState(false);
  const [levelUpWizardOpen, setLevelUpWizardOpen] = useState(false);
  const [levelUpError, setLevelUpError] = useState<string | null>(null);
  const prevEncounterPhaseRef = React.useRef<string | null>(null);

  const theme = useTheme();
  const userSupplements = useContentSupplements();
  const { isSupporter } = useSubscription();
  const conditionsFeature = useFeatureAccess('conditions');
  const activeEffectsFeature = useFeatureAccess('activeEffects');
  const canUseActiveEffects = activeEffectsFeature.hasAccess;
  const encounterCtx = useOptionalEncounter();
  const conditionHighlights = useConditionHighlights(currentSheet);
  const markersEnabled = conditionsFeature.isEnabled;
  const activeEffectHighlights = useMemo(
    () => getActiveEffectHighlights(currentSheet),
    [currentSheet]
  );
  const virtualCustomEffectDefinitions = useMemo(
    () => collectVirtualCustomEffectDefinitions(currentSheet),
    [currentSheet]
  );

  const applyRecalculatedSheet = useCallback(
    (nextSheet: CharacterSheet) => {
      const updatedSheet = recalculateSheet(nextSheet);
      // Rehydrate Bag (recalculateSheet cloneDeep strips methods)
      if (updatedSheet.bag && !updatedSheet.bag.getEquipments) {
        updatedSheet.bag = Bag.fromStored(updatedSheet.bag);
      }
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) onSheetUpdate(updatedSheet);
    },
    [onSheetUpdate]
  );

  const handleActiveEffectActivate = useCallback(
    (
      definition: ActivePowerDefinition,
      option: ActiveEffectUsageOption,
      opts?: { skipPmCost?: boolean; skipBroadcast?: boolean }
    ) => {
      const effect: ActiveEffect = {
        instanceId: uuidv4(),
        powerKey: definition.key,
        name: definition.name,
        sourceLabel: definition.sourceLabel,
        optionId: option.id,
        optionLabel: option.label,
        bonuses: option.bonuses,
        grantsTempPM: option.grantsTempPM,
        grantsTempPV: option.grantsTempPV,
        appliedAt: new Date().toISOString(),
        appliedBy: { playerName: currentSheet.nome },
        appliedManually: opts?.skipPmCost ? true : undefined,
      };
      // Substitui qualquer instância anterior do mesmo poder
      const previous = (currentSheet.activeEffects ?? []).filter(
        (e) => e.powerKey !== definition.key
      );
      const removedTempPM = (currentSheet.activeEffects ?? [])
        .filter((e) => e.powerKey === definition.key)
        .reduce((sum, e) => sum + (e.grantsTempPM ?? 0), 0);
      const removedTempPV = (currentSheet.activeEffects ?? [])
        .filter((e) => e.powerKey === definition.key)
        .reduce((sum, e) => sum + (e.grantsTempPV ?? 0), 0);

      const basePM = currentSheet.currentPM ?? currentSheet.pm ?? 0;
      applyRecalculatedSheet({
        ...currentSheet,
        activeEffects: [...previous, effect],
        currentPM: opts?.skipPmCost ? basePM : basePM - option.pmCost,
        tempPM: Math.max(
          0,
          (currentSheet.tempPM ?? 0) -
            removedTempPM +
            (option.grantsTempPM ?? 0)
        ),
        tempPV: Math.max(
          0,
          (currentSheet.tempPV ?? 0) -
            removedTempPV +
            (option.grantsTempPV ?? 0)
        ),
      });

      // Oferta aos aliados da mesa (no-op fora de mesa)
      if (definition.affectsAllies && !opts?.skipBroadcast) {
        socketService.emitPowerEffectUse({
          instanceId: effect.instanceId,
          powerKey: effect.powerKey,
          name: effect.name,
          sourceLabel: effect.sourceLabel,
          optionId: effect.optionId,
          optionLabel: effect.optionLabel,
          bonuses: effect.bonuses as unknown as PowerEffectBonusPayload[],
          grantsTempPM: effect.grantsTempPM,
          grantsTempPV: effect.grantsTempPV,
          characterName: currentSheet.nome,
        });
      }
    },
    [currentSheet, applyRecalculatedSheet]
  );

  const handleActiveEffectRemove = useCallback(
    (instanceId: string) => {
      const removed = (currentSheet.activeEffects ?? []).find(
        (e) => e.instanceId === instanceId
      );
      const next = (currentSheet.activeEffects ?? []).filter(
        (e) => e.instanceId !== instanceId
      );
      applyRecalculatedSheet({
        ...currentSheet,
        activeEffects: next,
        tempPM: Math.max(
          0,
          (currentSheet.tempPM ?? 0) - (removed?.grantsTempPM ?? 0)
        ),
        tempPV: Math.max(
          0,
          (currentSheet.tempPV ?? 0) - (removed?.grantsTempPV ?? 0)
        ),
      });
    },
    [currentSheet, applyRecalculatedSheet]
  );

  const handleAcceptOffer = useCallback(() => {
    if (!pendingOffer || !canUseActiveEffects) return;
    const p = pendingOffer;
    const effect: ActiveEffect = {
      instanceId: uuidv4(),
      powerKey: p.powerKey,
      name: p.name,
      sourceLabel: p.sourceLabel,
      optionId: p.optionId,
      optionLabel: p.optionLabel,
      bonuses: p.bonuses as unknown as ActiveEffect['bonuses'],
      grantsTempPM: p.grantsTempPM,
      grantsTempPV: p.grantsTempPV,
      appliedAt: new Date().toISOString(),
      appliedBy: {
        playerName: p.sourcePlayerName,
        characterName: p.characterName,
      },
      fromTable: true,
    };
    const previous = (currentSheet.activeEffects ?? []).filter(
      (e) => e.powerKey !== p.powerKey
    );
    const removedTempPM = (currentSheet.activeEffects ?? [])
      .filter((e) => e.powerKey === p.powerKey)
      .reduce((sum, e) => sum + (e.grantsTempPM ?? 0), 0);
    const removedTempPV = (currentSheet.activeEffects ?? [])
      .filter((e) => e.powerKey === p.powerKey)
      .reduce((sum, e) => sum + (e.grantsTempPV ?? 0), 0);
    // Aliado que aceita não paga PM
    applyRecalculatedSheet({
      ...currentSheet,
      activeEffects: [...previous, effect],
      tempPM: Math.max(
        0,
        (currentSheet.tempPM ?? 0) - removedTempPM + (p.grantsTempPM ?? 0)
      ),
      tempPV: Math.max(
        0,
        (currentSheet.tempPV ?? 0) - removedTempPV + (p.grantsTempPV ?? 0)
      ),
    });
    setPendingOffer(null);
  }, [pendingOffer, currentSheet, applyRecalculatedSheet, canUseActiveEffects]);

  React.useEffect(() => {
    const unsub = socketService.onPowerEffectOffered((payload) => {
      setPendingOffer(payload);
    });
    return unsub;
  }, []);

  const handleCleanupRemove = useCallback(
    (ids: string[]) => {
      const removedList = (currentSheet.activeEffects ?? []).filter((e) =>
        ids.includes(e.instanceId)
      );
      const next = (currentSheet.activeEffects ?? []).filter(
        (e) => !ids.includes(e.instanceId)
      );
      const remPM = removedList.reduce((s, e) => s + (e.grantsTempPM ?? 0), 0);
      const remPV = removedList.reduce((s, e) => s + (e.grantsTempPV ?? 0), 0);
      applyRecalculatedSheet({
        ...currentSheet,
        activeEffects: next,
        tempPM: Math.max(0, (currentSheet.tempPM ?? 0) - remPM),
        tempPV: Math.max(0, (currentSheet.tempPV ?? 0) - remPV),
      });
      setCleanupOpen(false);
    },
    [currentSheet, applyRecalculatedSheet]
  );

  // Detecta fim de combate (encontro encerrado/finalizado) e abre o
  // relatório de limpeza quando há efeitos ativos na ficha.
  React.useEffect(() => {
    const enc = encounterCtx?.activeEncounter ?? null;
    const prevPhase = prevEncounterPhaseRef.current;
    const currentPhase = enc ? enc.phase : null;
    const wasActive = prevPhase !== null && prevPhase !== 'finished';
    const nowEnded = currentPhase === null || currentPhase === 'finished';
    if (
      wasActive &&
      nowEnded &&
      (currentSheet.activeEffects?.length ?? 0) > 0
    ) {
      setCleanupOpen(true);
    }
    prevEncounterPhaseRef.current = currentPhase;
  }, [encounterCtx?.activeEncounter, currentSheet.activeEffects]);

  React.useEffect(() => {
    const unsub = socketService.onCombatEffectsReview(() => {
      if ((currentSheet.activeEffects?.length ?? 0) > 0) {
        setCleanupOpen(true);
      }
    });
    return unsub;
  }, [currentSheet.activeEffects]);

  const handleConditionsChange = useCallback(
    (next: ActiveCondition[]) => {
      // Run recalculateSheet so condition bonuses (penalties in skills,
      // defense, attributes, displacement, attacks) are actually applied
      // to the visible sheet values — not just stored in activeConditions.
      const updatedSheet = recalculateSheet({
        ...currentSheet,
        activeConditions: next,
      });

      // Rehydrate Bag (recalculateSheet goes through cloneDeep and strips methods)
      if (updatedSheet.bag && !updatedSheet.bag.getEquipments) {
        updatedSheet.bag = Bag.fromStored(updatedSheet.bag);
      }

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
      if (encounterCtx?.activeEncounter) {
        const participant = encounterCtx.activeEncounter.participants.find(
          (p) => p.sheetId === currentSheet.id
        );
        if (participant) {
          encounterCtx.updateParticipantConditions(participant.id, next);
        }
      }
    },
    [currentSheet, onSheetUpdate, encounterCtx]
  );

  // Update currentSheet when sheet prop changes
  React.useEffect(() => {
    setCurrentSheet(sheet);
  }, [sheet]);

  // Close all edit drawers when editing capability is lost (e.g. socket disconnect)
  React.useEffect(() => {
    if (!onSheetUpdate) {
      setSheetInfoDrawerOpen(false);
      setSkillsDrawerOpen(false);
      setBackpackOpen(false);
      setPowersDrawerOpen(false);
      setSpellsDrawerOpen(false);
      setDefenseDrawerOpen(false);
      setProficiencyDrawerOpen(false);
      setSizeDisplacementDrawerOpen(false);
      setStatDrawerOpen(false);
    }
  }, [onSheetUpdate]);

  const handleSheetInfoUpdate = useCallback(
    (updates: Partial<CharacterSheet> | CharacterSheet) => {
      // Check if it's a full sheet (has required properties) or partial updates
      const isFullSheet =
        'id' in updates && 'nome' in updates && 'atributos' in updates;

      const updatedSheet = isFullSheet
        ? (updates as CharacterSheet)
        : { ...currentSheet, ...updates };

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleNotesSave = useCallback(
    (notes: string) => {
      handleSheetInfoUpdate({ notes });
    },
    [handleSheetInfoUpdate]
  );

  // Proficiency edits must trigger a full recalculation: the non-proficiency
  // armor penalty lives in completeSkills.others, which a plain merge would
  // leave stale.
  const handleProficiencyUpdate = useCallback(
    (updates: Partial<CharacterSheet>) => {
      applyRecalculatedSheet({ ...currentSheet, ...updates });
    },
    [currentSheet, applyRecalculatedSheet]
  );

  const handleLevelUpConfirm = useCallback(
    (levelUpSelections: LevelUpSelections[]) => {
      try {
        // Aplica todas as seleções numa cópia local; só comita a ficha se tudo
        // der certo. Assim uma exceção (ex.: poder de classe não encontrado)
        // não deixa a ficha num estado parcial nem some o nível sem aviso.
        let updatedSheet = currentSheet;
        levelUpSelections.forEach((sel) => {
          updatedSheet = applyManualLevelUp(updatedSheet, sel);
        });
        updatedSheet = recalculateSheet(updatedSheet);
        if (updatedSheet.bag && !updatedSheet.bag.getEquipments) {
          updatedSheet.bag = Bag.fromStored(updatedSheet.bag);
        }
        setLevelUpWizardOpen(false);
        setCurrentSheet(updatedSheet);
        if (onSheetUpdate) {
          onSheetUpdate(updatedSheet);
        }
      } catch (error) {
        // Falha ao subir de nível: mantém a ficha original e avisa o usuário,
        // em vez de fechar o modal silenciosamente sem contabilizar o nível.
        const message =
          error instanceof Error ? error.message : 'Erro desconhecido';
        setLevelUpError(`Não foi possível subir de nível: ${message}`);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSkillsUpdate = useCallback(
    (updates: Partial<CharacterSheet>) => {
      const updatedSheet = { ...currentSheet, ...updates };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleEquipmentUpdate = useCallback(
    (updates: Partial<CharacterSheet>) => {
      const updatedSheet = { ...currentSheet, ...updates };

      // Rehydrate Bag instance after recalculateSheet strips class methods via cloneDeep
      if (updatedSheet.bag && !updatedSheet.bag.getEquipments) {
        updatedSheet.bag = Bag.fromStored(updatedSheet.bag);
      }

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePowersUpdate = useCallback(
    (updates: Partial<CharacterSheet> | CharacterSheet) => {
      // Check if it's a full sheet (has required properties) or partial updates
      const isFullSheet =
        'id' in updates && 'nome' in updates && 'atributos' in updates;

      const updatedSheet = isFullSheet
        ? (updates as CharacterSheet)
        : { ...currentSheet, ...updates };

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSpellsUpdate = useCallback(
    (updates: Partial<CharacterSheet>) => {
      const updatedSheet = { ...currentSheet, ...updates };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSpellRollsUpdate = useCallback(
    (spell: Spell, newRolls: DiceRoll[]) => {
      const updatedSpells = currentSheet.spells?.map((s) =>
        s.nome === spell.nome ? { ...s, rolls: newRolls } : s
      );
      const updatedSheet = { ...currentSheet, spells: updatedSpells };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleToggleMemorized = useCallback(
    (spell: Spell) => {
      const updatedSpells = currentSheet.spells?.map((s) =>
        s.nome === spell.nome ? { ...s, memorized: !s.memorized } : s
      );
      const updatedSheet = { ...currentSheet, spells: updatedSpells };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleToggleAlwaysPrepared = useCallback(
    (spell: Spell) => {
      const updatedSpells = currentSheet.spells?.map((s) =>
        s.nome === spell.nome
          ? {
              ...s,
              alwaysPrepared: !s.alwaysPrepared,
              memorized: !s.alwaysPrepared ? true : s.memorized,
            }
          : s
      );
      const updatedSheet = { ...currentSheet, spells: updatedSpells };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePowerRollsUpdate = useCallback(
    (
      power:
        | ClassPower
        | RaceAbility
        | ClassAbility
        | OriginPower
        | GeneralPower
        | CustomPower,
      newRolls: DiceRoll[]
    ) => {
      // Update in all possible power arrays
      const updatedGeneralPowers = currentSheet.generalPowers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedClassPowers = currentSheet.classPowers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedOriginPowers = currentSheet.origin?.powers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedRaceAbilities = currentSheet.raca?.abilities?.map((a) =>
        a.name === power.name ? { ...a, rolls: newRolls } : a
      );
      const updatedClassAbilities = currentSheet.classe?.abilities?.map((a) =>
        a.name === power.name ? { ...a, rolls: newRolls } : a
      );
      const updatedDeityPowers = currentSheet.devoto?.poderes?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedCustomPowers = currentSheet.customPowers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );

      const updatedSheet = {
        ...currentSheet,
        generalPowers: updatedGeneralPowers,
        classPowers: updatedClassPowers,
        customPowers: updatedCustomPowers,
        origin:
          currentSheet.origin && updatedOriginPowers
            ? { ...currentSheet.origin, powers: updatedOriginPowers }
            : currentSheet.origin,
        raca:
          currentSheet.raca && updatedRaceAbilities
            ? { ...currentSheet.raca, abilities: updatedRaceAbilities }
            : currentSheet.raca,
        classe:
          currentSheet.classe && updatedClassAbilities
            ? { ...currentSheet.classe, abilities: updatedClassAbilities }
            : currentSheet.classe,
        devoto:
          currentSheet.devoto && updatedDeityPowers
            ? { ...currentSheet.devoto, poderes: updatedDeityPowers }
            : currentSheet.devoto,
      };

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePowerCustomEffectsUpdate = useCallback(
    (
      power:
        | ClassPower
        | RaceAbility
        | ClassAbility
        | OriginPower
        | GeneralPower
        | CustomPower,
      newEffects: CustomEffect[]
    ) => {
      const updatedGeneralPowers = currentSheet.generalPowers?.map((p) =>
        p.name === power.name ? { ...p, customEffects: newEffects } : p
      );
      const updatedClassPowers = currentSheet.classPowers?.map((p) =>
        p.name === power.name ? { ...p, customEffects: newEffects } : p
      );
      const updatedOriginPowers = currentSheet.origin?.powers?.map((p) =>
        p.name === power.name ? { ...p, customEffects: newEffects } : p
      );
      const updatedRaceAbilities = currentSheet.raca?.abilities?.map((a) =>
        a.name === power.name ? { ...a, customEffects: newEffects } : a
      );
      const updatedClassAbilities = currentSheet.classe?.abilities?.map((a) =>
        a.name === power.name ? { ...a, customEffects: newEffects } : a
      );
      const updatedDeityPowers = currentSheet.devoto?.poderes?.map((p) =>
        p.name === power.name ? { ...p, customEffects: newEffects } : p
      );
      const updatedCustomPowers = currentSheet.customPowers?.map((p) =>
        p.name === power.name ? { ...p, customEffects: newEffects } : p
      );
      const updatedCustomGrantedPowers = currentSheet.customGrantedPowers?.map(
        (p) => (p.name === power.name ? { ...p, customEffects: newEffects } : p)
      );

      const updatedSheet = {
        ...currentSheet,
        generalPowers: updatedGeneralPowers,
        classPowers: updatedClassPowers,
        customPowers: updatedCustomPowers,
        customGrantedPowers: updatedCustomGrantedPowers,
        origin:
          currentSheet.origin && updatedOriginPowers
            ? { ...currentSheet.origin, powers: updatedOriginPowers }
            : currentSheet.origin,
        raca:
          currentSheet.raca && updatedRaceAbilities
            ? { ...currentSheet.raca, abilities: updatedRaceAbilities }
            : currentSheet.raca,
        classe:
          currentSheet.classe && updatedClassAbilities
            ? { ...currentSheet.classe, abilities: updatedClassAbilities }
            : currentSheet.classe,
        devoto:
          currentSheet.devoto && updatedDeityPowers
            ? { ...currentSheet.devoto, poderes: updatedDeityPowers }
            : currentSheet.devoto,
      };

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePVDecrement = useCallback(
    (amount: number) => {
      const currentTemp = currentSheet.tempPV ?? 0;
      const currentPVVal = currentSheet.currentPV ?? currentSheet.pv;
      const tempConsumed = Math.min(currentTemp, amount);
      const remaining = amount - tempConsumed;
      const pvMinimo = Math.min(-10, -Math.floor(currentSheet.pv / 2));
      const updatedSheet = {
        ...currentSheet,
        tempPV: currentTemp - tempConsumed,
        currentPV: Math.max(pvMinimo, currentPVVal - remaining),
      };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePMDecrement = useCallback(
    (amount: number) => {
      const currentTemp = currentSheet.tempPM ?? 0;
      const currentPMVal = currentSheet.currentPM ?? currentSheet.pm;
      const tempConsumed = Math.min(currentTemp, amount);
      const remaining = amount - tempConsumed;
      const updatedSheet = {
        ...currentSheet,
        tempPM: currentTemp - tempConsumed,
        currentPM: Math.max(0, currentPMVal - remaining),
      };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePVHeal = useCallback(
    (amount: number) => {
      const currentPVVal = currentSheet.currentPV ?? currentSheet.pv;
      const newCurrent = Math.min(currentSheet.pv, currentPVVal + amount);
      const updatedSheet = { ...currentSheet, currentPV: newCurrent };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePMHeal = useCallback(
    (amount: number) => {
      const currentPMVal = currentSheet.currentPM ?? currentSheet.pm;
      const newCurrent = Math.min(currentSheet.pm, currentPMVal + amount);
      const updatedSheet = { ...currentSheet, currentPM: newCurrent };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSpellCast = useCallback(
    (pmSpent: number, spell: Spell) => {
      const currentTemp = currentSheet.tempPM ?? 0;
      const currentPMValue = currentSheet.currentPM ?? currentSheet.pm;
      const tempConsumed = Math.min(currentTemp, pmSpent);
      const remaining = pmSpent - tempConsumed;
      const updatedSheet = {
        ...currentSheet,
        tempPM: currentTemp - tempConsumed,
        currentPM: Math.max(0, currentPMValue - remaining),
      };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }

      // Se a magia lançada tem efeito ativo, oferece a ativação (mesmo fluxo
      // dos poderes — o PM já foi pago no lançamento, então o efeito não
      // cobra de novo). A oferta aos aliados da mesa é feita ao confirmar.
      if (canUseActiveEffects) {
        // Magias core: registry estático. Magias homebrew: efeito em
        // `spell.customEffects` — constrói um virtual def (affectsAllies=true
        // para também ofertar aos aliados da mesa, como as magias core). Caso
        // de múltiplos efeitos numa magia homebrew, usa o primeiro (o diálogo
        // de uso representa uma única definição).
        const def =
          getActiveEffectForSpell(spell.nome) ??
          (spell.customEffects?.length
            ? buildVirtualDefinitionFromCustomEffect(
                spell.nome,
                spell.customEffects[0],
                currentSheet.nivel,
                true
              )
            : undefined);
        if (def) {
          setSpellEffectDef(def);
        }
      }
    },
    [currentSheet, onSheetUpdate, canUseActiveEffects]
  );

  const handleKeyAttributeChange = useCallback(
    (newAttr: Atributo) => {
      let updatedSheet;
      if (currentSheet.classe.spellPath) {
        updatedSheet = {
          ...currentSheet,
          classe: {
            ...currentSheet.classe,
            spellPath: {
              ...currentSheet.classe.spellPath,
              keyAttribute: newAttr,
            },
          },
        };
      } else {
        updatedSheet = {
          ...currentSheet,
          overrideKeyAttribute: newAttr,
        };
      }
      const recalculated = recalculateSheet(updatedSheet);
      setCurrentSheet(recalculated);
      if (onSheetUpdate) {
        onSheetUpdate(recalculated);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleCompanionUpdate = useCallback(
    (updatedCompanion: CompanionSheet) => {
      const companions = currentSheet.companions
        ? [...currentSheet.companions]
        : [];
      companions[selectedCompanionIndex] = updatedCompanion;
      const updatedSheet = { ...currentSheet, companions };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate, selectedCompanionIndex]
  );

  const handleCompanionAdd = useCallback(
    (newCompanion: CompanionSheet) => {
      const companions = [...(currentSheet.companions || []), newCompanion];
      const updatedSheet = { ...currentSheet, companions };
      setCurrentSheet(updatedSheet);
      setSelectedCompanionIndex(companions.length - 1);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleCompanionRemove = useCallback(
    (index: number) => {
      const companions = (currentSheet.companions || []).filter(
        (_, i) => i !== index
      );
      const updatedSheet = { ...currentSheet, companions };
      setCurrentSheet(updatedSheet);
      setSelectedCompanionIndex(
        Math.max(0, Math.min(index, companions.length - 1))
      );
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
      if (companions.length === 0) {
        setCompanionModalOpen(false);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const {
    nome,
    sexo,
    nivel,
    atributos,
    raca,
    raceHeritage,
    classe,
    pv,
    pm,
    defesa,
    bag,
    id,
    devoto,
    origin,
    spells,
    displacement,
    size,
    maxSpaces,
    customMaxSpaces,
    generalPowers = [],
    classPowers = [],
    steps,
    extraArmorPenalty = 0,
    completeSkills,
    dinheiro = 0,
    dinheiroTC = 0,
    dinheiroTO = 0,
  } = currentSheet;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  let className: string;
  if (isMulticlass(currentSheet)) {
    className = getMulticlassDisplayName(currentSheet);
  } else {
    className = `${classe.name}`;
    if (classe.subname) className = `${className} (${classe.subname})`;
  }

  const multiclassDisplay = isMulticlass(currentSheet)
    ? (() => {
        const classLevelsMap = getClassLevelsMap(currentSheet);
        const parts: React.ReactNode[] = [];
        const entries = Array.from(classLevelsMap.entries());
        entries.forEach(([clsName, level], idx) => {
          if (idx > 0) {
            parts.push(
              <span
                key={`sep-${clsName}`}
                style={{ margin: '0 6px', opacity: 0.5 }}
              >
                ·
              </span>
            );
          }
          parts.push(
            <span key={`cls-${clsName}`}>
              {clsName}{' '}
              <strong style={{ color: theme.palette.primary.main }}>
                {level}
              </strong>
            </span>
          );
        });
        return <>{parts}</>;
      })()
    : null;

  const periciasSorted = completeSkills
    ? [...completeSkills].sort((skillA, skillB) =>
        skillA.name < skillB.name ? -1 : 1
      )
    : undefined;

  const periciasDiv = useMemo(
    () => (
      <SkillTable
        sheet={currentSheet}
        skills={periciasSorted}
        skillHighlights={
          markersEnabled ? conditionHighlights.skills : undefined
        }
        skillEffectHighlights={activeEffectHighlights.skills}
      />
    ),
    [
      currentSheet,
      periciasSorted,
      markersEnabled,
      conditionHighlights.skills,
      activeEffectHighlights.skills,
    ]
  );

  const effectiveProficiencias = useMemo(
    () => getSheetProficiencias(currentSheet),
    [
      classe.proficiencias,
      currentSheet.removedProficiencias,
      currentSheet.customProficiencias,
    ]
  );

  const proficienciasDiv = useMemo(
    () =>
      effectiveProficiencias.map((proe) => (
        <Chip sx={{ m: 0.5 }} label={proe} key={getKey(proe)} />
      )),
    [effectiveProficiencias]
  );

  const bagEquipments = useMemo(() => {
    if (bag.getEquipments) {
      return bag.getEquipments();
    }
    return bag.equipments;
  }, [bag]);

  // All bag items in user-defined display order. The Equipamentos chip list
  // mirrors the manual ordering set in the Mochila so reorder gestures
  // performed there propagate to the sheet view.
  const equipamentosOrdered: Equipment[] = useMemo(
    () => getOrderedItemsByGroup(bag, () => true),
    [bag]
  );

  const equipamentosDiv = equipamentosOrdered.map((equip) => {
    let chipLabel: string;
    if (equip.isAmmo) {
      const units = equip.unitsRemaining ?? 0;
      const ammoSpaces = calcAmmoSpaces(equip);
      chipLabel = `${equip.nome}: ${units}${
        ammoSpaces > 0 ? ` [${ammoSpaces} espaço(s)]` : ''
      }`;
    } else {
      const qty =
        equip.quantity && equip.quantity > 1 ? `${equip.quantity}x ` : '';
      const spaceText =
        equip.spaces && equip.spaces > 0
          ? `[${equip.spaces * (equip.quantity || 1)} espaço(s)]`
          : '';
      chipLabel = `${qty}${equip.nome} ${spaceText}`;
    }
    return (
      <Box
        key={equip.nome}
        sx={{ display: 'inline-flex', alignItems: 'center', margin: 0.5 }}
      >
        <Chip
          sx={{ marginRight: equip.rolls && equip.rolls.length > 0 ? 0 : 0 }}
          label={chipLabel}
        />
        {equip.descricao && (
          <Tooltip title={equip.descricao} arrow>
            <InfoOutlinedIcon
              sx={{
                fontSize: 16,
                ml: 0.5,
                color: 'text.secondary',
                cursor: 'help',
              }}
            />
          </Tooltip>
        )}
        {equip.rolls && equip.rolls.length > 0 && (
          <RollButton
            rolls={equip.rolls}
            iconOnly
            size='small'
            characterName={nome}
          />
        )}
      </Box>
    );
  });

  // Note: weapons, armors and shields are already included in
  // `equipamentosOrdered` via the displayOrder traversal — no extra pushes
  // needed.

  const modFor = atributos.Força.value;

  const handleConsumeAmmo = useCallback(
    (ammoType: AmmoType) => {
      const stack = findAmmoStack(bagEquipments, ammoType);
      if (!stack || !stack.id || (stack.unitsRemaining ?? 0) <= 0) return;

      const nextEquipments: typeof bagEquipments = { ...bagEquipments };
      (Object.keys(nextEquipments) as (keyof typeof nextEquipments)[]).forEach(
        (cat) => {
          const list = nextEquipments[cat];
          if (!Array.isArray(list)) return;
          const idx = list.findIndex((it) => it.id === stack.id);
          if (idx >= 0) {
            const updated: Equipment = {
              ...list[idx],
              unitsRemaining: Math.max(0, (list[idx].unitsRemaining ?? 0) - 1),
            };
            nextEquipments[cat] = [
              ...list.slice(0, idx),
              updated,
              ...list.slice(idx + 1),
            ] as never;
          }
        }
      );
      const nextBag = new Bag(nextEquipments, true, bag.displayOrder);
      const updatedSheet: CharacterSheet = { ...currentSheet, bag: nextBag };
      const recomputed = recalculateSheet(updatedSheet, undefined, undefined, {
        skipPMRecalc: true,
        skipPVRecalc: true,
      });
      // Rehydrate Bag class methods after recalculateSheet's cloneDeep strips them.
      if (recomputed.bag && !recomputed.bag.getEquipments) {
        const plainBag = recomputed.bag as unknown as {
          equipments: typeof bagEquipments;
          displayOrder?: string[];
        };
        recomputed.bag = new Bag(
          plainBag.equipments,
          true,
          plainBag.displayOrder
        );
      }
      setCurrentSheet(recomputed);
      if (onSheetUpdate) onSheetUpdate(recomputed);
    },
    [bag, bagEquipments, currentSheet, onSheetUpdate]
  );

  const handleQuickWieldChange = useCallback(
    (itemId: string, slot: WieldingSlot) => {
      const next = applyWielding(
        {
          mainHandItemId: currentSheet.mainHandItemId,
          offHandItemId: currentSheet.offHandItemId,
        },
        itemId,
        slot
      );
      const updatedSheet: CharacterSheet = {
        ...currentSheet,
        mainHandItemId: next.mainHandItemId,
        offHandItemId: next.offHandItemId,
      };
      // Run the full recalc (skipping PV/PM since wielding doesn't touch them).
      // Calling `calcDefense` directly here would compound bonuses: that
      // function sums equipment bonuses on top of `sheet.defesa`, which
      // already contains the previously-applied bonuses. Only the full
      // recalculate path resets defesa to its base before re-applying.
      const recomputed = recalculateSheet(updatedSheet, undefined, undefined, {
        skipPMRecalc: true,
        skipPVRecalc: true,
      });
      setCurrentSheet(recomputed);
      if (onSheetUpdate) onSheetUpdate(recomputed);
    },
    [currentSheet, onSheetUpdate]
  );

  // Shared by Ataques and Defesa: blocks slots when a hand is already
  // occupied by a 2H weapon or a shield. The wielded item itself is exempt.
  const computeWieldingDisabled = useMemo(() => {
    const wieldingTwoHanded =
      currentSheet.mainHandItemId !== undefined &&
      currentSheet.mainHandItemId === currentSheet.offHandItemId;
    const handCandidates: Equipment[] = [
      ...bagEquipments.Arma,
      ...bagEquipments.Escudo,
      ...bagEquipments.Alquimía,
      ...bagEquipments['Item Geral'],
    ];
    const twoHandedItem = wieldingTwoHanded
      ? handCandidates.find((it) => it.id === currentSheet.mainHandItemId)
      : undefined;
    const mainHandItemForDisable = currentSheet.mainHandItemId
      ? handCandidates.find((it) => it.id === currentSheet.mainHandItemId)
      : undefined;
    const offHandItemForDisable = currentSheet.offHandItemId
      ? handCandidates.find((it) => it.id === currentSheet.offHandItemId)
      : undefined;
    return (
      itemId: string | undefined
    ): Partial<Record<'main' | 'off', { reason: string }>> | undefined => {
      if (wieldingTwoHanded && twoHandedItem && itemId !== twoHandedItem.id) {
        const reason = `Mão ocupada por ${
          twoHandedItem.customDisplayName || twoHandedItem.nome
        } (duas mãos). Solte primeiro.`;
        return { main: { reason }, off: { reason } };
      }
      const disabled: Partial<Record<'main' | 'off', { reason: string }>> = {};
      if (
        mainHandItemForDisable &&
        mainHandItemForDisable.group === 'Escudo' &&
        itemId !== mainHandItemForDisable.id
      ) {
        disabled.main = {
          reason: `Mão ocupada por ${
            mainHandItemForDisable.customDisplayName ||
            mainHandItemForDisable.nome
          } (escudo). Solte primeiro.`,
        };
      }
      if (
        offHandItemForDisable &&
        offHandItemForDisable.group === 'Escudo' &&
        itemId !== offHandItemForDisable.id
      ) {
        disabled.off = {
          reason: `Mão ocupada por ${
            offHandItemForDisable.customDisplayName ||
            offHandItemForDisable.nome
          } (escudo). Solte primeiro.`,
        };
      }
      return Object.keys(disabled).length > 0 ? disabled : undefined;
    };
  }, [
    currentSheet.mainHandItemId,
    currentSheet.offHandItemId,
    bagEquipments.Arma,
    bagEquipments.Escudo,
    bagEquipments.Alquimía,
    bagEquipments['Item Geral'],
  ]);

  const weaponsDiv = useMemo(() => {
    const wieldingTrackingActive =
      currentSheet.mainHandItemId !== undefined ||
      currentSheet.offHandItemId !== undefined;
    const hasArremessador = (currentSheet.raca?.abilities ?? []).some(
      (ability) => ability.name === 'Arremessador'
    );
    return (
      <Weapons
        getKey={getKey}
        weapons={getOrderedItemsByGroup(
          bag,
          (it) => it.group === 'Arma' && !it.isAmmo
        )}
        completeSkills={completeSkills}
        atributos={atributos}
        modFor={modFor}
        nivel={currentSheet.nivel}
        characterName={nome}
        attackConditions={
          markersEnabled ? conditionHighlights.attack : undefined
        }
        sheetBonuses={currentSheet.sheetBonuses}
        mainHandItemId={currentSheet.mainHandItemId}
        offHandItemId={currentSheet.offHandItemId}
        onWieldingChange={onSheetUpdate ? handleQuickWieldChange : undefined}
        getWieldingDisabledSlots={computeWieldingDisabled}
        wieldingTrackingActive={wieldingTrackingActive}
        bagEquipments={bagEquipments}
        onConsumeAmmo={onSheetUpdate ? handleConsumeAmmo : undefined}
        hasArremessador={hasArremessador}
        proficiencias={effectiveProficiencias}
      />
    );
  }, [
    bag,
    bagEquipments,
    completeSkills,
    atributos,
    modFor,
    nome,
    markersEnabled,
    conditionHighlights.attack,
    currentSheet.sheetBonuses,
    currentSheet.mainHandItemId,
    currentSheet.offHandItemId,
    currentSheet.raca,
    onSheetUpdate,
    handleQuickWieldChange,
    handleConsumeAmmo,
    computeWieldingDisabled,
    effectiveProficiencias,
  ]);

  const defenseEquipments = useMemo(
    () =>
      getOrderedItemsByGroup(
        bag,
        (it) => it.group === 'Armadura' || it.group === 'Escudo'
      ) as unknown as DefenseEquipment[],
    [bag]
  );

  const defenseFormula = useMemo(() => {
    const base = currentSheet.customDefenseBase ?? 10;
    const components: string[] = [];
    components.push(`${base} (base)`);

    // Resolve which armor counts (worn) and which shields count (wielded).
    // Mirrors the rules used by `calcDefense` so the printed formula matches
    // the computed defesa value.
    const armors = bagEquipments.Armadura ?? [];
    let activeArmor = currentSheet.wornArmorId
      ? armors.find((a) => a.id === currentSheet.wornArmorId)
      : undefined;
    if (!activeArmor && !currentSheet.wornArmorId && armors.length === 1) {
      [activeArmor] = armors; // legacy compat
    }
    if (activeArmor && activeArmor.defenseBonus > 0) {
      components.push(`${activeArmor.defenseBonus} (${activeArmor.nome})`);
    }
    (bagEquipments.Escudo ?? []).forEach((shield) => {
      const inHand =
        shield.id !== undefined &&
        (shield.id === currentSheet.mainHandItemId ||
          shield.id === currentSheet.offHandItemId);
      if (inHand && shield.defenseBonus > 0) {
        components.push(`${shield.defenseBonus} (${shield.nome})`);
      }
    });

    // Heavy armor is determined by the worn armor only.
    const hasHeavyArmor = activeArmor ? isHeavyArmor(activeArmor) : false;

    // Attribute modifier
    const useAttr = currentSheet.useDefenseAttribute ?? true;
    if (useAttr && !hasHeavyArmor) {
      const defaultAttr =
        classe.name === 'Nobre' ? Atributo.CARISMA : Atributo.DESTREZA;
      const attrToUse = currentSheet.customDefenseAttribute || defaultAttr;
      const attrValue = atributos[attrToUse]?.value || 0;
      if (attrValue !== 0) {
        const attrName = attrToUse.substring(0, 3).toUpperCase();
        components.push(`${attrValue} (${attrName})`);
      }
    }

    // Manual bonus
    if (currentSheet.bonusDefense && currentSheet.bonusDefense !== 0) {
      components.push(`${currentSheet.bonusDefense} (bônus manual)`);
    }

    // SheetBonuses targeting Defense (Fixed modifiers — equipment mods like
    // Guarda, condition bonuses, etc.). Aggregate by source label so multiple
    // bonuses from the same source render as a single entry.
    const labelForSource = (
      s: (typeof currentSheet.sheetBonuses)[0]['source']
    ) => {
      if (s.type === 'equipment') return s.equipmentName;
      if (s.type === 'power') return s.name;
      if (s.type === 'condition') return s.conditionId;
      if (s.type === 'levelUp') return `Nível ${s.level}`;
      if (s.type === 'origin') return s.originName;
      if (s.type === 'race') return s.raceName;
      if (s.type === 'class') return s.className;
      if (s.type === 'divinity') return s.divinityName;
      return null;
    };
    const defenseBonusBySource = new Map<string, number>();
    currentSheet.sheetBonuses.forEach((b) => {
      if (b.target.type !== 'Defense') return;
      if (b.modifier.type !== 'Fixed') return;
      const label = labelForSource(b.source);
      if (!label) return;
      defenseBonusBySource.set(
        label,
        (defenseBonusBySource.get(label) ?? 0) + b.modifier.value
      );
    });
    defenseBonusBySource.forEach((value, label) => {
      if (value !== 0) components.push(`${value} (${label})`);
    });

    return `${components.join(' + ')} = ${defesa}`;
  }, [
    currentSheet,
    defenseEquipments,
    bagEquipments.Armadura,
    classe.name,
    atributos,
    defesa,
  ]);

  // const uniqueGeneralPowers = filterUnique(generalPowers);
  // const uniqueClassPowers = filterUnique(classPowers);

  const effectiveKeyAttribute =
    classe.spellPath?.keyAttribute ??
    currentSheet.overrideKeyAttribute ??
    Atributo.SABEDORIA;
  const keyAttr = atributos[effectiveKeyAttribute];

  const spellDCBonus = useMemo(() => {
    let total = currentSheet.bonusSpellDC ?? 0;
    currentSheet.sheetBonuses
      .filter((b) => b.target.type === 'SpellDC')
      .forEach((b) => {
        if (b.modifier.type === 'Fixed') {
          total += b.modifier.value;
        }
      });
    return total;
  }, [currentSheet.bonusSpellDC, currentSheet.sheetBonuses]);

  // Helper function to format attribute modifiers correctly
  const formatAttributeModifier = useCallback(
    (value: number | string): string => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (Number.isNaN(numValue)) return String(value);
      if (numValue === 0) return '0';
      if (numValue > 0) return `+${numValue}`;
      return String(numValue); // Negative values already have '-'
    },
    []
  );

  const changesDiv = steps.map((step) => {
    if (step.type === 'Atributos') {
      return (
        <li key={getKey(`${step.label}-${step.value}`)}>
          <strong>{step.label}:</strong>
          <ul className='stepAttrList'>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{`${
                attr.name
              }: ${formatAttributeModifier(attr.value as number)}`}</li>
            ))}
          </ul>
        </li>
      );
    }
    if (
      step.type === 'Perícias' ||
      step.type === 'Magias' ||
      step.type === 'Equipamentos' ||
      step.type === 'Atributos Extras' ||
      step.type === 'Edição Manual'
    ) {
      return (
        <li key={getKey(step.label)}>
          <strong>{step.label}:</strong>
          <ul className='stepAttrList'>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{attr.value}</li>
            ))}
          </ul>
        </li>
      );
    }
    if (step.type === 'Poderes' || step.type === 'Nível') {
      return (
        <li key={getKey(step.label)}>
          <strong>{step.label}:</strong>
          <ul>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{`${attr.name}${
                attr.value ? ': ' : ''
              }${attr.value}`}</li>
            ))}
          </ul>
        </li>
      );
    }
    return (
      <li
        key={getKey(
          `${step.label}-${step.value[0] ? `: ${step.value[0].value}` : ''}`
        )}
      >
        <strong>{step.label}</strong>
        {`${step.value[0] ? `: ${step.value[0].value}` : ''}`}
      </li>
    );
  });

  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  const hasAnyRd =
    currentSheet.reducaoDeDano &&
    Object.values(currentSheet.reducaoDeDano).some((v) => v && v > 0);

  const defenseInfoWidth = isMobile ? '100%' : '80%';

  return (
    <BackgroundBox isDarkMode={isDarkMode} sx={{ p: isMobile ? 0 : 2 }}>
      <Container maxWidth='xl' sx={{ p: isMobile ? 0 : 2 }}>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
          {/* LADO ESQUERDO, 60% */}
          <Box
            sx={{
              width: isMobile ? '100%' : '60%',
            }}
          >
            {/* PARTE DE CIMA: Informações da ficha */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                minHeight: isMobile ? 'inherit' : '180px',
                position: 'relative',
                overflow: 'visible', // Allow the button to show outside the card
              }}
            >
              {onSheetUpdate && (
                <Stack
                  direction='row'
                  spacing={1}
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                  }}
                >
                  <Tooltip
                    title={
                      currentSheet.nivel >= 20
                        ? 'Nível máximo atingido'
                        : 'Subir nível'
                    }
                  >
                    <span>
                      <IconButton
                        size='small'
                        disabled={currentSheet.nivel >= 20}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          },
                          '&.Mui-disabled': {
                            backgroundColor:
                              theme.palette.action.disabledBackground,
                            color: theme.palette.action.disabled,
                          },
                        }}
                        onClick={() => setLevelUpWizardOpen(true)}
                      >
                        <UpgradeIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title='Editar ficha'>
                    <IconButton
                      size='small'
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                      onClick={() => setSheetInfoDrawerOpen(true)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              <Stack
                direction='row'
                spacing={2}
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: isMobile ? 5 : 0,
                }}
              >
                {currentSheet.imageUrl && (
                  <Box
                    component='img'
                    src={currentSheet.imageUrl}
                    alt={nome}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    sx={{
                      width: isMobile ? 80 : 100,
                      height: isMobile ? 80 : 100,
                      objectFit: 'cover',
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
                  <Stack
                    direction='row'
                    spacing={0.5}
                    sx={{
                      alignItems: 'center',
                    }}
                  >
                    {markersEnabled && (
                      <ConditionMarker
                        conditions={conditionHighlights.name}
                        fontSize='medium'
                      />
                    )}
                    <Box
                      sx={
                        markersEnabled
                          ? getConditionLabelStyle(conditionHighlights.name)
                          : undefined
                      }
                    >
                      <LabelDisplay text={nome} size='large' />
                    </Box>
                    <Tooltip title='Anotações'>
                      <IconButton
                        size='small'
                        onClick={() => setNotesDialogOpen(true)}
                        sx={{
                          color: currentSheet.notes
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        }}
                      >
                        <NoteAltIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <LabelDisplay
                    text={
                      multiclassDisplay ? (
                        <>
                          {`${raca.name}${
                            raca.name === 'Moreau' && raceHeritage
                              ? ` (${
                                  MOREAU_HERITAGES[
                                    raceHeritage as MoreauHeritageName
                                  ]?.name || raceHeritage
                                })`
                              : ''
                          }`}
                          <span style={{ margin: '0 6px', opacity: 0.5 }}>
                            ·
                          </span>
                          {multiclassDisplay}
                          {sexo ? ` (${sexo})` : ''}
                        </>
                      ) : (
                        `${raca.name}${
                          raca.name === 'Moreau' && raceHeritage
                            ? ` (${
                                MOREAU_HERITAGES[
                                  raceHeritage as MoreauHeritageName
                                ]?.name || raceHeritage
                              })`
                            : ''
                        } ${className}${sexo ? ` (${sexo})` : ''}`
                      )
                    }
                    size='medium'
                  />
                  <LabelDisplay title='Nível' text={`${nivel}`} size='small' />
                  {origin && (
                    <LabelDisplay
                      title='Origem'
                      text={origin.name || 'Não possui'}
                      size='small'
                    />
                  )}
                  {devoto && (
                    <LabelDisplay
                      title='Divindade'
                      text={devoto.divindade.name}
                      size='small'
                    />
                  )}
                  {conditionsFeature.isEnabled && (
                    <ConditionsBar
                      activeConditions={currentSheet.activeConditions}
                      onChange={handleConditionsChange}
                      readonly={!onSheetUpdate}
                      lockReason={
                        !conditionsFeature.hasAccess &&
                        conditionsFeature.supporterOnly
                          ? 'supporter'
                          : undefined
                      }
                      dense
                    />
                  )}
                </Box>
                <Stack
                  direction='row'
                  spacing={3}
                  sx={{
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <StatControl
                      type='PV'
                      current={currentSheet.currentPV ?? pv}
                      max={pv}
                      calculatedMax={pv}
                      temp={currentSheet.tempPV ?? 0}
                      onDecrement={handlePVDecrement}
                      onHeal={handlePVHeal}
                      onOpenDrawer={() => setStatDrawerOpen(true)}
                      disabled={!onSheetUpdate}
                    />
                    {currentSheet.manualMaxPV !== undefined &&
                      currentSheet.manualMaxPV > 0 && (
                        <Tooltip title='Cálculo automático desativado. Edite nas configurações para alterar.'>
                          <Chip
                            size='small'
                            label='Manual'
                            color='warning'
                            sx={{ mt: 1, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <StatControl
                      type='PM'
                      current={currentSheet.currentPM ?? pm}
                      max={pm}
                      calculatedMax={pm}
                      temp={currentSheet.tempPM ?? 0}
                      onDecrement={handlePMDecrement}
                      onHeal={handlePMHeal}
                      onOpenDrawer={() => setStatDrawerOpen(true)}
                      disabled={!onSheetUpdate}
                    />
                    {currentSheet.manualMaxPM !== undefined &&
                      currentSheet.manualMaxPM > 0 && (
                        <Tooltip title='Cálculo automático desativado. Edite nas configurações para alterar.'>
                          <Chip
                            size='small'
                            label='Manual'
                            color='warning'
                            sx={{ mt: 1, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                  </Box>
                </Stack>
              </Stack>
            </Card>

            <PowerEffectOfferModal
              open={pendingOffer !== null && canUseActiveEffects}
              payload={pendingOffer}
              onAccept={handleAcceptOffer}
              onDecline={() => setPendingOffer(null)}
            />

            <ActivePowerUseDialog
              open={spellEffectDef !== null && canUseActiveEffects}
              definition={spellEffectDef}
              sheet={currentSheet}
              onClose={() => setSpellEffectDef(null)}
              onConfirm={(option) => {
                if (spellEffectDef) {
                  handleActiveEffectActivate(spellEffectDef, option);
                }
                setSpellEffectDef(null);
              }}
            />

            <ActiveEffectsCleanupModal
              open={cleanupOpen}
              effects={currentSheet.activeEffects ?? []}
              onConfirm={handleCleanupRemove}
              onClose={() => setCleanupOpen(false)}
            />

            <ActiveEffectsManagerModal
              open={effectsModalOpen}
              effects={currentSheet.activeEffects ?? []}
              sheet={currentSheet}
              readonly={!onSheetUpdate || !canUseActiveEffects}
              customDefinitions={virtualCustomEffectDefinitions}
              onRemove={handleActiveEffectRemove}
              onActivate={handleActiveEffectActivate}
              onClose={() => setEffectsModalOpen(false)}
            />

            {/* PARTE DO MEIO: Atributos */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <BookTitle>Atributos</BookTitle>
              <AttributeDisplay
                attributes={atributos}
                characterName={nome}
                sheet={currentSheet}
                attributeHighlights={
                  markersEnabled ? conditionHighlights.attributes : undefined
                }
              />
            </Card>

            {/* Card de Parceiros (apenas durante encontro com partners anexados) */}
            <Box sx={{ mb: 4 }}>
              <PartnerSheetPanel />
            </Box>

            {/* Card de Ataques */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {onSheetUpdate && (
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => {
                    setBackpackInitialFilter(['Arma']);
                    setBackpackOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
              <BookTitle>Ataques</BookTitle>
              {weaponsDiv}
            </Card>

            {/* Card de Defesa */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {onSheetUpdate && (
                <>
                  <Tooltip title='Configurações de defesa' arrow>
                    <IconButton
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: -16,
                        right: 60,
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                      onClick={() => setDefenseDrawerOpen(true)}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => {
                      setBackpackInitialFilter(['Armadura', 'Escudo']);
                      setBackpackOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </>
              )}
              <Box sx={{ position: 'relative' }}>
                {((markersEnabled && conditionHighlights.defense.length > 0) ||
                  activeEffectHighlights.defense.length > 0) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {markersEnabled && (
                      <ConditionMarker
                        conditions={conditionHighlights.defense}
                        fontSize='medium'
                      />
                    )}
                    <ActiveEffectMarker
                      effects={activeEffectHighlights.defense}
                      fontSize='medium'
                    />
                  </Box>
                )}
                <Box
                  sx={
                    activeEffectHighlights.defense.length > 0
                      ? getActiveEffectLabelStyle(
                          activeEffectHighlights.defense
                        )
                      : (markersEnabled &&
                          getConditionLabelStyle(
                            conditionHighlights.defense
                          )) ||
                        undefined
                  }
                >
                  <BookTitle>Defesa</BookTitle>
                </Box>
              </Box>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: isMobile ? '100%' : '20%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    order: isMobile ? 1 : 0,
                  }}
                >
                  <FancyBox>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        fontSize: '68px',
                      }}
                    >
                      <StatLabel
                        theme={theme}
                        style={
                          markersEnabled
                            ? getConditionLabelStyle(
                                conditionHighlights.defense
                              )
                            : undefined
                        }
                      >
                        {defesa}
                      </StatLabel>
                      <StatTitle
                        style={
                          markersEnabled
                            ? getConditionLabelStyle(
                                conditionHighlights.defense
                              )
                            : undefined
                        }
                      >
                        Defesa
                      </StatTitle>
                    </Box>
                  </FancyBox>
                  {(hasAnyRd || onSheetUpdate) && (
                    <Tooltip
                      title={
                        onSheetUpdate
                          ? 'Clique para editar Defesa e Redução de Dano'
                          : formatRdLabel(currentSheet.reducaoDeDano)
                      }
                      arrow
                    >
                      <Typography
                        onClick={() =>
                          onSheetUpdate && setDefenseDrawerOpen(true)
                        }
                        sx={{
                          mt: 0.5,
                          fontSize: '11px',
                          color: hasAnyRd ? 'text.secondary' : 'text.disabled',
                          cursor: onSheetUpdate ? 'pointer' : 'default',
                          textAlign: 'center',
                          maxWidth: '140px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          ...(onSheetUpdate
                            ? {
                                '&:hover': {
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                },
                              }
                            : {}),
                        }}
                      >
                        {hasAnyRd
                          ? `RD: ${formatRdLabel(currentSheet.reducaoDeDano)}`
                          : 'RD: —'}
                      </Typography>
                    </Tooltip>
                  )}
                </Box>
                <Box
                  sx={{
                    width: defenseInfoWidth,
                    order: isMobile ? 0 : 1,
                  }}
                >
                  <DefenseEquipments
                    getKey={getKey}
                    defenseEquipments={defenseEquipments}
                    wornArmorId={currentSheet.wornArmorId}
                    mainHandItemId={currentSheet.mainHandItemId}
                    offHandItemId={currentSheet.offHandItemId}
                    onWieldingChange={
                      onSheetUpdate ? handleQuickWieldChange : undefined
                    }
                    getWieldingDisabledSlots={computeWieldingDisabled}
                    proficiencias={effectiveProficiencias}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      mt: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: 'text.secondary',
                      }}
                    >
                      <strong>Penalidade de Armadura: </strong>
                      {((() => {
                        if (bag.getActiveArmorPenalty) {
                          return bag.getActiveArmorPenalty(
                            currentSheet.wornArmorId,
                            currentSheet.mainHandItemId,
                            currentSheet.offHandItemId
                          );
                        }
                        if (bag.getArmorPenalty) return bag.getArmorPenalty();
                        return bag.armorPenalty;
                      })() +
                        extraArmorPenalty) *
                        -1}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: 'text.secondary',
                      mt: 1,
                      fontFamily: 'monospace',
                    }}
                  >
                    {defenseFormula}
                  </Typography>
                </Box>
              </Stack>
            </Card>
            <Card
              sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}
            >
              <Stack
                direction='row'
                spacing={1}
                sx={{ position: 'absolute', top: -16, right: 16 }}
              >
                {canUseActiveEffects &&
                  (() => {
                    const activeCount = currentSheet.activeEffects?.length ?? 0;
                    const hasActive = activeCount > 0;
                    return (
                      <Tooltip
                        title={
                          hasActive
                            ? `Efeitos ativos (${activeCount})`
                            : 'Efeitos ativos'
                        }
                      >
                        <Badge
                          badgeContent={activeCount}
                          color='error'
                          overlap='circular'
                          invisible={!hasActive}
                        >
                          <IconButton
                            size='small'
                            sx={{
                              backgroundColor: hasActive
                                ? ACTIVE_EFFECT_COLOR
                                : theme.palette.primary.main,
                              color: 'white',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: hasActive
                                  ? ACTIVE_EFFECT_COLOR
                                  : theme.palette.primary.dark,
                                filter: hasActive
                                  ? 'brightness(0.92)'
                                  : undefined,
                              },
                            }}
                            onClick={() => setEffectsModalOpen(true)}
                          >
                            <AutoAwesomeIcon />
                          </IconButton>
                        </Badge>
                      </Tooltip>
                    );
                  })()}
                {onSheetUpdate && (
                  <IconButton
                    size='small'
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => setPowersDrawerOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Stack>
              <Box>
                <BookTitle>Poderes</BookTitle>
                <PowersDisplay
                  sheetHistory={currentSheet.sheetActionHistory || []}
                  classAbilities={classe.abilities}
                  classPowers={classPowers}
                  raceAbilities={raca.abilities}
                  originPowers={origin?.powers || []}
                  deityPowers={devoto?.poderes || []}
                  generalPowers={generalPowers}
                  customPowers={currentSheet.customPowers || []}
                  customGrantedPowers={currentSheet.customGrantedPowers || []}
                  className={classe.name}
                  raceName={raca.name}
                  deityName={devoto?.divindade?.name}
                  onUpdateRolls={
                    onSheetUpdate ? handlePowerRollsUpdate : undefined
                  }
                  onUpdateCustomEffects={
                    onSheetUpdate ? handlePowerCustomEffectsUpdate : undefined
                  }
                  characterName={nome}
                  sheet={currentSheet}
                  onActivateEffect={
                    onSheetUpdate && canUseActiveEffects
                      ? handleActiveEffectActivate
                      : undefined
                  }
                  onSheetUpdate={
                    onSheetUpdate
                      ? (updated) => {
                          setCurrentSheet(updated);
                          onSheetUpdate(updated);
                        }
                      : undefined
                  }
                  onCompanionClick={(() => {
                    const hasCompanion =
                      (currentSheet.companions?.length || 0) > 0;
                    const isTreinador =
                      getClassLevel(currentSheet, 'Treinador') > 0;
                    if (hasCompanion) {
                      return () => {
                        setSelectedCompanionIndex(0);
                        setCompanionModalOpen(true);
                      };
                    }
                    if (isTreinador && onSheetUpdate) {
                      return () => setCompanionCreationOpen(true);
                    }
                    return undefined;
                  })()}
                  parodyButtonSlot={
                    <Tooltip title='Buscar magia para parodiar' arrow>
                      <IconButton
                        size='small'
                        onClick={() => setParodyDialogOpen(true)}
                      >
                        <SearchIcon fontSize='small' color='primary' />
                      </IconButton>
                    </Tooltip>
                  }
                />
              </Box>
            </Card>
            <Card
              sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}
            >
              {onSheetUpdate && (
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => setSpellsDrawerOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
              <Box>
                <BookTitle>Magias</BookTitle>
                <Spells
                  spells={spells}
                  keyAttr={keyAttr}
                  selectedKeyAttribute={effectiveKeyAttribute}
                  nivel={nivel}
                  onUpdateRolls={
                    onSheetUpdate ? handleSpellRollsUpdate : undefined
                  }
                  characterName={nome}
                  currentPM={currentSheet.currentPM ?? pm}
                  maxPM={pm}
                  tempPM={currentSheet.tempPM ?? 0}
                  onSpellCast={onSheetUpdate ? handleSpellCast : undefined}
                  isMago={classe.subname === 'Mago'}
                  onToggleMemorized={
                    onSheetUpdate ? handleToggleMemorized : undefined
                  }
                  onToggleAlwaysPrepared={
                    onSheetUpdate ? handleToggleAlwaysPrepared : undefined
                  }
                  bonusSpellDC={spellDCBonus}
                  onKeyAttributeChange={
                    onSheetUpdate ? handleKeyAttributeChange : undefined
                  }
                />
              </Box>
            </Card>
          </Box>
          {/* LADO DIREITO, 40% */}
          <Box
            sx={{
              width: isMobile ? '100%' : '40%',
            }}
          >
            <Stack spacing={4}>
              <Card sx={{ position: 'relative', overflow: 'visible' }}>
                {onSheetUpdate && (
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => setSkillsDrawerOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {periciasDiv}
              </Card>
              <Card sx={{ position: 'relative', overflow: 'visible' }}>
                {onSheetUpdate && (
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => {
                      setBackpackInitialFilter(undefined);
                      setBackpackOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <Box
                  sx={{
                    p: 2,
                  }}
                >
                  <BookTitle>Equipamentos</BookTitle>
                  <Stack
                    // spacing={2}
                    direction='row'
                    sx={{
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                    }}
                  >
                    {equipamentosDiv}
                  </Stack>
                  <Box
                    sx={{
                      mt: 2,
                    }}
                  >
                    <strong>Dinheiro: </strong>
                    T$ {dinheiro}
                    {dinheiroTC > 0 && <> | TC {dinheiroTC}</>}
                    {dinheiroTO > 0 && <> | TO {dinheiroTO}</>}
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                    }}
                  >
                    <strong>Espaços (atual/limite-máximo): </strong>
                    {bag.getSpaces() +
                      calculateCurrencySpaces(dinheiro, dinheiroTC, dinheiroTO)}
                    /{customMaxSpaces ?? maxSpaces}-
                    {(customMaxSpaces ?? maxSpaces) * 2}
                    {calculateCurrencySpaces(dinheiro, dinheiroTC, dinheiroTO) >
                      0 && (
                      <Typography
                        variant='caption'
                        component='span'
                        sx={{ ml: 0.5 }}
                      >
                        (
                        {calculateCurrencySpaces(
                          dinheiro,
                          dinheiroTC,
                          dinheiroTO
                        )}{' '}
                        de moedas)
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Card>
              <Card sx={{ p: 2, position: 'relative', overflow: 'visible' }}>
                {onSheetUpdate && (
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => setProficiencyDrawerOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <BookTitle>Proficiências</BookTitle>
                <Stack
                  direction='row'
                  sx={{
                    flexWrap: 'wrap',
                  }}
                >
                  {proficienciasDiv}
                </Stack>
              </Card>
              <Card sx={{ p: 2, position: 'relative', overflow: 'visible' }}>
                {onSheetUpdate && (
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => setSizeDisplacementDrawerOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <Stack
                  spacing={2}
                  direction='row'
                  sx={{
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <FancyBox>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.3,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Tfont',
                            fontSize: '35px',
                            color: theme.palette.primary.main,
                            textAlign: 'center',
                            lineHeight: 1,
                            margin: 0,
                            ...(markersEnabled
                              ? getConditionLabelStyle(
                                  conditionHighlights.displacement
                                )
                              : {}),
                          }}
                        >
                          {displacement}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Tfont',
                            fontSize: '16px',
                            color: theme.palette.text.secondary,
                            textAlign: 'center',
                            margin: 0,
                          }}
                        >
                          ({Math.floor(displacement / 1.5)}q)
                        </Typography>
                        <Stack
                          direction='row'
                          spacing={0.5}
                          sx={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {markersEnabled && (
                            <ConditionMarker
                              conditions={conditionHighlights.displacement}
                              fontSize='small'
                            />
                          )}
                          <StatTitle
                            style={
                              markersEnabled
                                ? getConditionLabelStyle(
                                    conditionHighlights.displacement
                                  )
                                : undefined
                            }
                          >
                            Desl.
                          </StatTitle>
                        </Stack>
                      </Box>
                    </FancyBox>
                    {currentSheet.customDisplacement !== undefined && (
                      <Tooltip title='Valor definido manualmente'>
                        <Chip
                          size='small'
                          label='Manual'
                          color='warning'
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        />
                      </Tooltip>
                    )}
                    {(() => {
                      const effectiveMaxSpaces = customMaxSpaces ?? maxSpaces;
                      const totalUsedSpaces =
                        bag.getSpaces() +
                        calculateCurrencySpaces(
                          dinheiro,
                          dinheiroTC,
                          dinheiroTO
                        );
                      if (totalUsedSpaces > effectiveMaxSpaces) {
                        return (
                          <Tooltip
                            title={`Sobrecarga: ${totalUsedSpaces.toFixed(
                              1
                            )}/${effectiveMaxSpaces} espaços (-3m)`}
                          >
                            <Chip
                              size='small'
                              label='Sobrecarga'
                              color='error'
                              sx={{ mt: 1, fontSize: '0.7rem' }}
                            />
                          </Tooltip>
                        );
                      }
                      return null;
                    })()}
                    {currentSheet.movementTypes && (
                      <Stack spacing={0} sx={{ mt: 0.5 }}>
                        {currentSheet.movementTypes.escalada &&
                          currentSheet.movementTypes.escalada > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Escalada: {currentSheet.movementTypes.escalada}m (
                              {Math.floor(
                                currentSheet.movementTypes.escalada / 1.5
                              )}
                              q)
                            </Typography>
                          )}
                        {currentSheet.movementTypes.escavar &&
                          currentSheet.movementTypes.escavar > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Escavar: {currentSheet.movementTypes.escavar}m (
                              {Math.floor(
                                currentSheet.movementTypes.escavar / 1.5
                              )}
                              q)
                            </Typography>
                          )}
                        {currentSheet.movementTypes.natacao &&
                          currentSheet.movementTypes.natacao > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Natação: {currentSheet.movementTypes.natacao}m (
                              {Math.floor(
                                currentSheet.movementTypes.natacao / 1.5
                              )}
                              q)
                            </Typography>
                          )}
                        {currentSheet.movementTypes.voo &&
                          currentSheet.movementTypes.voo > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Voo: {currentSheet.movementTypes.voo}m (
                              {Math.floor(currentSheet.movementTypes.voo / 1.5)}
                              q)
                              {currentSheet.movementTypes.pairar
                                ? ' (Pairar)'
                                : ''}
                            </Typography>
                          )}
                      </Stack>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <FancyBox>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Tfont',
                            fontSize: '58px',
                            color: theme.palette.primary.main,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            lineHeight: 1,
                            margin: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {size.name.charAt(0)}
                        </Typography>
                        <StatTitle>Tamanho</StatTitle>
                      </Box>
                    </FancyBox>
                    {currentSheet.customSize !== undefined && (
                      <Tooltip title='Tamanho definido manualmente'>
                        <Chip
                          size='small'
                          label='Manual'
                          color='warning'
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ mt: 2, width: '100%' }}>
          {/* Bug Report Alert */}
          <Alert severity='info' icon={<BugReportIcon />} sx={{ mb: 2 }}>
            Encontrou algum problema nessa ficha?{' '}
            <Link
              href='https://fichasdenimb.com.br/forum'
              target=''
              rel='noopener noreferrer'
              sx={{ fontWeight: 'bold' }}
            >
              Nos avise!
            </Link>
          </Alert>

          {/* Support CTA - only for non-supporters */}
          {!isSupporter && (
            <Alert
              severity='success'
              icon={<FavoriteIcon />}
              sx={{
                mb: 2,
                background: `linear-gradient(135deg, ${
                  theme.palette.mode === 'dark' ? '#3d3200' : '#fff8e1'
                } 0%, ${
                  theme.palette.mode === 'dark' ? '#2d2400' : '#fff3cd'
                } 100%)`,
                border: '1px solid',
                borderColor:
                  theme.palette.mode === 'dark' ? '#5a4a00' : '#ffe082',
                '& .MuiAlert-icon': {
                  color: '#FFA500',
                },
              }}
            >
              Gostou da ficha? Apoie o Fichas de Nimb e desbloqueie recursos
              exclusivos!{' '}
              <Link
                href='/apoiar'
                sx={{ fontWeight: 'bold', color: '#FFA500' }}
              >
                Apoiar o projeto
              </Link>
            </Alert>
          )}

          {/* Passo-a-passo Accordion */}
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='steps-content'
              id='steps-header'
            >
              <Typography variant='h6' sx={{ fontFamily: 'Tfont' }}>
                Passo-a-passo da criação
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component='ul' sx={{ pl: 2 }}>
                {changesDiv}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
      <>
        <SheetInfoEditDrawer
          open={sheetInfoDrawerOpen}
          onClose={() => setSheetInfoDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSheetInfoUpdate}
        />

        <LevelUpWizardModal
          open={levelUpWizardOpen}
          initialSheet={currentSheet}
          targetLevel={currentSheet.nivel + 1}
          supplements={userSupplements}
          onConfirm={handleLevelUpConfirm}
          onCancel={() => setLevelUpWizardOpen(false)}
        />

        <Snackbar
          open={levelUpError !== null}
          autoHideDuration={8000}
          onClose={() => setLevelUpError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity='error'
            onClose={() => setLevelUpError(null)}
            sx={{ width: '100%' }}
          >
            {levelUpError}
          </Alert>
        </Snackbar>

        <SkillsEditDrawer
          open={skillsDrawerOpen}
          onClose={() => setSkillsDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSkillsUpdate}
        />

        <BackpackModal
          open={backpackOpen}
          onClose={() => setBackpackOpen(false)}
          sheet={currentSheet}
          onSave={handleEquipmentUpdate}
          initialCategoryFilters={backpackInitialFilter}
        />

        <PowersEditDrawer
          open={powersDrawerOpen}
          onClose={() => setPowersDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handlePowersUpdate}
        />

        <SpellsEditDrawer
          open={spellsDrawerOpen}
          onClose={() => setSpellsDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSpellsUpdate}
        />

        {onSheetUpdate && (
          <ParodySpellPickerDialog
            open={parodyDialogOpen}
            onClose={() => setParodyDialogOpen(false)}
            currentPM={currentSheet.currentPM ?? currentSheet.pm}
            maxPM={currentSheet.pm}
            tempPM={currentSheet.tempPM ?? 0}
            onCast={handleSpellCast}
            characterName={nome}
          />
        )}

        <DefenseEditDrawer
          open={defenseDrawerOpen}
          onClose={() => setDefenseDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSheetInfoUpdate}
          onOpenEquipmentDrawer={() => {
            setBackpackInitialFilter(['Armadura', 'Escudo']);
            setBackpackOpen(true);
          }}
        />

        <ProficiencyEditDrawer
          open={proficiencyDrawerOpen}
          onClose={() => setProficiencyDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleProficiencyUpdate}
        />

        <SizeDisplacementEditDrawer
          open={sizeDisplacementDrawerOpen}
          onClose={() => setSizeDisplacementDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSheetInfoUpdate}
        />

        <StatEditDrawer
          open={statDrawerOpen}
          onClose={() => setStatDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSheetInfoUpdate}
        />
        <NotesDialog
          open={notesDialogOpen}
          onClose={() => setNotesDialogOpen(false)}
          notes={currentSheet.notes || ''}
          onSave={handleNotesSave}
        />
        {(() => {
          const companions = currentSheet.companions || [];
          const safeIndex = Math.min(
            selectedCompanionIndex,
            Math.max(0, companions.length - 1)
          );
          const currentCompanion = companions[safeIndex];
          if (!currentCompanion) return null;
          return (
            <CompanionSheetModal
              open={companionModalOpen}
              onClose={() => setCompanionModalOpen(false)}
              companion={currentCompanion}
              trainerLevel={currentSheet.nivel}
              trainerName={currentSheet.nome}
              trainerCharismaMod={
                currentSheet.atributos[Atributo.CARISMA]?.value ?? 0
              }
              pendingEnsinarTruqueCount={(() => {
                const ensinarCount =
                  currentSheet.classPowers?.filter(
                    (p) => p.name === 'Ensinar Truque'
                  ).length ?? 0;
                if (ensinarCount === 0) return 0;
                const appliedCount =
                  currentSheet.sheetActionHistory?.filter(
                    (entry) =>
                      entry.powerName === 'Ensinar Truque' &&
                      entry.changes.some(
                        (c) => c.type === 'CompanionTrickLearned'
                      )
                  ).length ?? 0;
                return Math.max(0, ensinarCount - appliedCount);
              })()}
              onCompanionUpdate={
                onSheetUpdate ? handleCompanionUpdate : undefined
              }
              totalCompanions={companions.length}
              currentIndex={safeIndex}
              onIndexChange={setSelectedCompanionIndex}
              onAdd={
                onSheetUpdate ? () => setCompanionCreationOpen(true) : undefined
              }
              onRemove={onSheetUpdate ? handleCompanionRemove : undefined}
              onEdit={
                onSheetUpdate
                  ? () => {
                      setCompanionModalOpen(false);
                      setCompanionEditOpen(true);
                    }
                  : undefined
              }
            />
          );
        })()}
        {onSheetUpdate &&
          (() => {
            const companions = currentSheet.companions || [];
            const safeIndex = Math.min(
              selectedCompanionIndex,
              Math.max(0, companions.length - 1)
            );
            const currentCompanion = companions[safeIndex];
            if (!currentCompanion) return null;
            return (
              <CompanionEditDialog
                open={companionEditOpen}
                onClose={() => {
                  setCompanionEditOpen(false);
                  setCompanionModalOpen(true);
                }}
                companion={currentCompanion}
                trainerLevel={currentSheet.nivel}
                trainerCharisma={
                  currentSheet.atributos[Atributo.CARISMA]?.value ?? 0
                }
                onSave={(updated) => {
                  handleCompanionUpdate(updated);
                  setCompanionEditOpen(false);
                  setCompanionModalOpen(true);
                }}
              />
            );
          })()}
        {onSheetUpdate && (
          <CompanionCreationDialog
            open={companionCreationOpen}
            onClose={() => setCompanionCreationOpen(false)}
            onConfirm={(newCompanion) => {
              handleCompanionAdd(newCompanion);
              setCompanionCreationOpen(false);
              setCompanionModalOpen(true);
            }}
            trainerLevel={currentSheet.nivel}
            trainerCharisma={
              currentSheet.atributos[Atributo.CARISMA]?.value ?? 0
            }
          />
        )}
      </>
    </BackgroundBox>
  );
};

export default Result;
