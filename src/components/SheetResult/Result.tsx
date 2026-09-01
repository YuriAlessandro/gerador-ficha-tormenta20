/* eslint-disable no-console */
import React, { useState, useCallback, useMemo } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
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
  Tab,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Link,
  Snackbar,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import styled from '@emotion/styled';
import {
  MOREAU_HERITAGES,
  MoreauHeritageName,
} from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { getEffectiveAttributes } from '@/functions/effectiveAttributes';
import { isHeavyArmor } from '@/data/systems/tormenta20/equipamentos';
import {
  recalculateSheet,
  calculateBonusValue,
} from '@/functions/recalculateSheet';
import {
  getActiveArmorPenalty,
  getSheetProficiencias,
} from '@/functions/proficiencies';
import {
  getDerivedSpells,
  getDerivedSpellsNotice,
} from '@/functions/spells/derivedSpells';
import { buildUsurparCastCheck } from '@/functions/spells/usurpar';
import { getPoderCapturadoDefinition } from '@/functions/powers/poderCapturadoEffects';
import { ignoresEncumbrance } from '@/functions/encumbrance';
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
import { CompanionSheet } from '@/interfaces/Companion';
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
  ActiveEffectsCleanupModal,
  ActiveEffectsManagerModal,
  ActivePowerUseDialog,
} from '@/premium/components/ActiveEffects';
import { ComplicationEditDrawer } from '@/premium/components/Complications';
import { AgeEditDrawer } from '@/premium/components/Ages';
import { AttributeModifiersDrawer } from '@/premium/components/Attributes';
import { SupplementId } from '@/types/supplement.types';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import socketService, {
  type PowerEffectBonusPayload,
  type RollAbilityMeta,
} from '@/premium/services/socket.service';
import {
  getActiveEffectHighlights,
  getActiveEffectLabelStyle,
  ACTIVE_EFFECT_COLOR,
} from '@/premium/functions/activeEffectHighlights';
import { getActiveEffectForSpell } from '@/premium/data/activePowers';
import {
  collectVirtualCustomEffectDefinitions,
  collectStandaloneCustomEffectDefinitions,
  buildStandaloneEffectPowerKey,
  isStandaloneEffectPowerKey,
  buildVirtualDefinitionFromCustomEffect,
} from '@/premium/data/activePowers/customEffectAdapter';
import type {
  ActivePowerDefinition,
  ActiveEffectUsageOption,
  ActiveEffect,
} from '@/premium/interfaces/ActiveEffect';
import { WildShapeSkin, WildShapeBanner } from '@/premium/components/WildShape';
import {
  getWildShapeNaturalWeapons,
  isInWildShape,
} from '@/premium/functions/wildShape';
import { WILD_SHAPE_POWER_KEY } from '@/premium/data/wildShapes';
import { AnimalCompanionsPanel } from '@/premium/components/AnimalCompanions';
import {
  getAnimalCompanionActivatedPowers,
  reconcileAnimalCompanionEffects,
} from '@/premium/functions/animalCompanionEffects';
import { reconcileAutoPowerEffects } from '@/premium/functions/autoPowerEffects';
import { getDeitySpellCircleWarning } from '@/functions/powers/general';
import { needsTormentaPenaltyBackfill } from '@/functions/tormentaCharismaPenalty';
import { useDiceRoll } from '@/premium/hooks/useDiceRoll';
import {
  buildEffectOffer,
  buildSpellAbilityMeta,
  truncateAbilityDescription,
} from '@/functions/rollAbilityMeta';
import { SheetPower } from '@/functions/powers/powerOrigins';
import {
  updatePowerAcrossSheet,
  PowerUserPatch,
} from '@/functions/powers/updatePowerAcrossSheet';
import PoderCapturadoEditDrawer from './EditDrawers/PoderCapturadoEditDrawer';
import PoderCapturadoAction from './PoderCapturadoAction';
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
  WeaponOverride,
} from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import { setWeaponOverride } from '../../functions/weaponOverrides';
import '../../assets/css/result.css';
import Spells from './SpellsTab/SpellsDisplay';
import SkillTable from './SkillTable';
import LabelDisplay from './LabelDisplay';
import { getDevotionLabel } from '../../functions/powers/deityNames';
import AttributeDisplay from './AttributeDisplay';
import FancyBox from './common/FancyBox';
import BookTitle from './common/BookTitle';
import PowersDisplay from './PowersDisplay';
import CompanionSheetModal from './CompanionSheetModal';
import CompanionCreationDialog from './CompanionCreationDialog';
import CompanionEditDialog from './CompanionEditDialog';
import EquipmentTable from './EquipmentTable';
import CarryLoadSummary from './CarryLoadSummary';
import {
  SheetTabValue,
  getRememberedSheetTab,
  rememberSheetTab,
} from './sheetTabMemory';
import SheetInfoEditDrawer from './EditDrawers/SheetInfoEditDrawer';
import SkillsEditDrawer from './EditDrawers/SkillsEditDrawer';
import { BackpackModal } from './BackpackModal';
import { commitWielding, WieldingSlot } from './BackpackModal/wielding';
import { getOrderedItemsByGroup } from './BackpackModal/bagOrdering';
import { findAmmoStack } from './BackpackModal/ammo';
import PowersEditorModal from './EditDrawers/PowersEditor';
import SpellsEditDrawer from './EditDrawers/SpellsEditDrawer';
import DefenseEditDrawer from './EditDrawers/DefenseEditDrawer';
import ProficiencyEditDrawer from './EditDrawers/ProficiencyEditDrawer';
import SizeDisplacementEditDrawer from './EditDrawers/SizeDisplacementEditDrawer';
import StatEditDrawer from './EditDrawers/StatEditDrawer';
import NotesDialog from './NotesDialog';
import {
  PlayerJournalCard,
  PlayerJournalFullScreen,
  PLAYER_JOURNAL_AVAILABLE,
} from '../../premium/components/PlayerJournal';
import { PlayerJournal } from '../../interfaces/PlayerJournal';
import { countJournalNodes } from '../../functions/playerJournal';
import RestDialog, { RestConfirmConfig } from './RestDialog';
import {
  calculateRestRecovery,
  isCompanionImmuneToRestConditions,
} from '../../functions/restRecovery';
import StatControl from './StatControl';
import ManualValueMarker from './ManualValueMarker';

// Styled components defined outside to prevent recreation on every render

/**
 * Cor de fundo da tela da ficha. Os mesmos valores de `background.default` do
 * tema (ver `TORMENTA_GREY` em theme.ts), mas dirigidos pela prop `isDarkMode`
 * — o embed do Owlbear a deriva da URL, que pode divergir do tema do app.
 */
const getSheetBackgroundColor = (isDarkMode: boolean): string =>
  isDarkMode ? '#212121' : '#f3f2f1';

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
  /**
   * Modo escuro do FUNDO da ficha. Não é redundante com `theme.palette.mode`:
   * o embed do Owlbear não tem ThemeProvider próprio e deriva isto do
   * parâmetro `?theme=` da URL, que pode divergir da preferência do usuário.
   */
  isDarkMode: boolean;
  onSheetUpdate?: (updatedSheet: CharacterSheet) => void;
}

/** Mesmo corte de sempre (768px), só que consultado ao vivo. */
const MOBILE_MEDIA_QUERY = '(max-width:768px)';

const Result: React.FC<ResultProps> = (props) => {
  const { sheet, isDarkMode, onSheetUpdate } = props;
  const [currentSheet, setCurrentSheet] = useState(sheet);
  const [sheetInfoDrawerOpen, setSheetInfoDrawerOpen] = useState(false);
  const [attributeModifiersDrawerOpen, setAttributeModifiersDrawerOpen] =
    useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [backpackInitialFilter, setBackpackInitialFilter] = useState<
    equipGroup[] | undefined
  >(undefined);
  const [powersDrawerOpen, setPowersDrawerOpen] = useState(false);
  const [complicationDrawerOpen, setComplicationDrawerOpen] = useState(false);
  const [ageDrawerOpen, setAgeDrawerOpen] = useState(false);
  const [spellsDrawerOpen, setSpellsDrawerOpen] = useState(false);
  const [defenseDrawerOpen, setDefenseDrawerOpen] = useState(false);
  const [proficiencyDrawerOpen, setProficiencyDrawerOpen] = useState(false);
  const [sizeDisplacementDrawerOpen, setSizeDisplacementDrawerOpen] =
    useState(false);
  const [statDrawerOpen, setStatDrawerOpen] = useState(false);
  const [restDialogOpen, setRestDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [companionCreationOpen, setCompanionCreationOpen] = useState(false);
  const [companionEditOpen, setCompanionEditOpen] = useState(false);
  const [selectedCompanionIndex, setSelectedCompanionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<SheetTabValue>(
    () =>
      getRememberedSheetTab(sheet.id) ??
      (window.innerWidth <= 768 ? 'pericias' : 'ataques')
  );

  const onChangeTab = (_e: React.SyntheticEvent, newValue: SheetTabValue) => {
    setActiveTab(newValue);
  };
  const [parodyDialogOpen, setParodyDialogOpen] = useState(false);
  const [poderCapturadoDrawerOpen, setPoderCapturadoDrawerOpen] =
    useState(false);
  const [spellEffectDef, setSpellEffectDef] =
    useState<ActivePowerDefinition | null>(null);
  // Metadados da magia recém-lançada, guardados enquanto o diálogo de efeito
  // ativo está aberto — o card do histórico só é publicado ao confirmar (ou
  // ao fechar sem confirmar), já com a opção de uso escolhida.
  const [pendingSpellAbility, setPendingSpellAbility] =
    useState<RollAbilityMeta | null>(null);
  const [pendingSpellCastLogged, setPendingSpellCastLogged] = useState(false);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [effectsModalOpen, setEffectsModalOpen] = useState(false);
  const [levelUpWizardOpen, setLevelUpWizardOpen] = useState(false);
  const [levelUpError, setLevelUpError] = useState<string | null>(null);
  const prevEncounterPhaseRef = React.useRef<string | null>(null);

  const theme = useTheme();
  const userSupplements = useContentSupplements();
  const { logExternalRoll } = useDiceRoll();
  const { isSupporter } = useSubscription();
  const conditionsFeature = useFeatureAccess('conditions');
  const activeEffectsFeature = useFeatureAccess('activeEffects');
  const complicationsFeature = useFeatureAccess('complications');
  const optionalRulesFeature = useFeatureAccess('optionalRules');
  const canUseActiveEffects = activeEffectsFeature.hasAccess;
  // Em forma selvagem o fundo é pintado pelo WildShapeSkin (que sabe a cor da
  // forma); este componente precisa ficar transparente para não cobri-lo.
  const skinPaintsBackground = isInWildShape(currentSheet);
  const encounterCtx = useOptionalEncounter();
  const conditionHighlights = useConditionHighlights(currentSheet);
  const markersEnabled = conditionsFeature.isEnabled;
  // "Devagar e Sempre"/Golem: a sobrecarga não reduz o deslocamento, então os
  // avisos não podem prometer um -3m que o cálculo não aplica.
  const sheetIgnoresEncumbrance = ignoresEncumbrance(currentSheet);
  const activeEffectHighlights = useMemo(
    () => getActiveEffectHighlights(currentSheet),
    [currentSheet]
  );
  // O painel de companheiros só aparece para quem tem a ver com ele: druidas
  // com o poder Companheiro Animal, ou qualquer ficha que já tenha um
  // companheiro salvo (não esconder dados existentes se o poder for removido).
  const showAnimalCompanions = useMemo(() => {
    if ((currentSheet.animalCompanions?.length ?? 0) > 0) return true;
    if (getClassLevel(currentSheet, 'Druida') <= 0) return false;
    return (currentSheet.classPowers ?? []).some(
      (power) => power.name === 'Companheiro Animal'
    );
  }, [currentSheet.animalCompanions, currentSheet.classPowers, currentSheet]);

  // Definições injetadas em runtime no gerenciador de efeitos: efeitos custom
  // do jogador (presos a um poder ou avulsos) + benefícios ativados dos
  // companheiros animais + o Poder Capturado do Usurpador (montado a partir de
  // `sheet.poderesCapturados`).
  const poderCapturadoDefinition = useMemo(
    () => getPoderCapturadoDefinition(currentSheet, userSupplements),
    [currentSheet, userSupplements]
  );
  const virtualCustomEffectDefinitions = useMemo(
    () => [
      ...collectVirtualCustomEffectDefinitions(currentSheet),
      ...collectStandaloneCustomEffectDefinitions(currentSheet),
      ...getAnimalCompanionActivatedPowers(currentSheet),
      ...(poderCapturadoDefinition ? [poderCapturadoDefinition] : []),
    ],
    [currentSheet, poderCapturadoDefinition]
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
      opts?: {
        skipPmCost?: boolean;
        skipBroadcast?: boolean;
        // Metadados prontos da habilidade (usado pelas magias, que já têm
        // círculo/escola/PM apurados no lançamento). Sem isso, os dados saem
        // da própria definição do poder.
        abilityBase?: RollAbilityMeta;
      }
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

      // Card no histórico da mesa. É a segunda chance de quem perdeu o
      // alerta: quem estava na aba do encontro, com a tela apagada ou longe
      // do celular consegue ativar o efeito depois. Sem dados envolvidos, daí
      // `logExternalRoll` (sem overlay 3D nem dialog de resultado).
      // `skipPmCost` = adição manual pelo gerenciador de efeitos e
      // `skipBroadcast` = recepção; nenhum dos dois é "uso" na mesa.
      if (!opts?.skipPmCost && !opts?.skipBroadcast) {
        logExternalRoll(definition.name, [], currentSheet.nome, {
          ...(opts?.abilityBase ?? {
            kind: 'power',
            name: definition.name,
            sourceLabel: definition.sourceLabel,
            ...truncateAbilityDescription(definition.description),
          }),
          pmCost: option.pmCost > 0 ? option.pmCost : opts?.abilityBase?.pmCost,
          effectOffer: buildEffectOffer(definition, option),
        });
      }
    },
    [currentSheet, applyRecalculatedSheet, logExternalRoll]
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

  // Efeitos customizados AVULSOS (aba "Meus Efeitos" do gerenciador). Só a
  // definição muda aqui — mas se o efeito editado/apagado estiver ativo, a
  // instância em `activeEffects` carrega uma CÓPIA dos bônus e precisa
  // acompanhar, senão o bônus fica grudado na ficha sem definição por trás
  // (apagar) ou a edição só valeria na próxima ativação (editar).
  const handleStandaloneCustomEffectsChange = useCallback(
    (next: CustomEffect[]) => {
      const active = currentSheet.activeEffects ?? [];
      const survivingKeys = new Set(
        next.map((effect) => buildStandaloneEffectPowerKey(effect.id))
      );

      const removed = active.filter(
        (eff) =>
          isStandaloneEffectPowerKey(eff.powerKey) &&
          !survivingKeys.has(eff.powerKey)
      );

      let touchedActive = removed.length > 0;
      const nextActive = active
        .filter((eff) => !removed.includes(eff))
        .map((eff) => {
          if (!isStandaloneEffectPowerKey(eff.powerKey)) return eff;
          const definition = next.find(
            (effect) =>
              buildStandaloneEffectPowerKey(effect.id) === eff.powerKey
          );
          const tier = definition?.tiers.find((t) => t.id === eff.optionId);
          // Tier removido na edição: a instância vira órfã, mas manter os
          // bônus antigos é melhor que apagá-los sem o jogador pedir — ele
          // ainda vê e remove o chip pela aba "Ativos".
          if (!tier) return eff;
          if (
            tier.label === eff.optionLabel &&
            JSON.stringify(tier.bonuses) === JSON.stringify(eff.bonuses)
          ) {
            return eff;
          }
          touchedActive = true;
          return { ...eff, optionLabel: tier.label, bonuses: tier.bonuses };
        });

      // `next` é sempre um array (nunca `undefined`): apagar o último efeito
      // grava `[]`, e a AUSÊNCIA da chave é o que o guard de integridade trata
      // como corrupção.
      const nextSheet: CharacterSheet = {
        ...currentSheet,
        customEffects: next,
        activeEffects: nextActive,
      };

      // Sem instância ativa afetada, mexer na definição é cosmético: grava
      // direto, sem pagar um `recalculateSheet` inteiro.
      if (!touchedActive) {
        setCurrentSheet(nextSheet);
        if (onSheetUpdate) onSheetUpdate(nextSheet);
        return;
      }

      applyRecalculatedSheet({
        ...nextSheet,
        tempPM: Math.max(
          0,
          (currentSheet.tempPM ?? 0) -
            removed.reduce((sum, eff) => sum + (eff.grantsTempPM ?? 0), 0)
        ),
        tempPV: Math.max(
          0,
          (currentSheet.tempPV ?? 0) -
            removed.reduce((sum, eff) => sum + (eff.grantsTempPV ?? 0), 0)
        ),
      });
    },
    [currentSheet, onSheetUpdate, applyRecalculatedSheet]
  );

  // O painel de companheiros fica fora da aba Poderes; o ícone de patinha no
  // poder rola até ele em vez de abrir um modal.
  const animalCompanionsRef = React.useRef<HTMLDivElement>(null);
  const scrollToAnimalCompanions = useCallback(() => {
    animalCompanionsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  // Reverter a Forma Selvagem é só remover o efeito ativo dela: o recálculo
  // zera `sheetBonuses`, o Step 11.5 restaura o tamanho e as armas naturais
  // (que são virtuais) desaparecem junto.
  const handleRevertWildShape = useCallback(() => {
    const effect = (currentSheet.activeEffects ?? []).find(
      (e) => e.powerKey === WILD_SHAPE_POWER_KEY
    );
    if (effect) handleActiveEffectRemove(effect.instanceId);
  }, [currentSheet.activeEffects, handleActiveEffectRemove]);

  // As ofertas de efeito ativo recebidas da mesa NÃO são tratadas aqui: o
  // listener e o modal vivem em `PowerEffectOfferAlerts`, montado uma única
  // vez pelo `GameSessionPage`. Dentro da ficha eles morriam junto com ela
  // quando o jogador ia pra aba "Encontro" no mobile.

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

  // Efeitos DERIVADOS da ficha (não escolhidos pelo jogador):
  //  - Companheiro Animal: mantém os `ActiveEffect`s passivos em dia com
  //    `sheet.animalCompanions` (subir de nível troca o grau do parceiro, e
  //    com ele os bônus).
  //  - Poderes automáticos (Coragem Aguerrida): ligam/desligam conforme o
  //    estado vivo da ficha — a dependência é o `currentSheet` inteiro, então
  //    o efeito já re-roda a cada mudança de PV.
  // Os dois reconciliadores devolvem `null` quando já estão sincronizados, o
  // que é o que impede o laço de re-render. Ficam no MESMO `useEffect` de
  // propósito: dois efeitos separados chamando `applyRecalculatedSheet` sobre
  // o mesmo `currentSheet` fariam o segundo sobrescrever a escrita do
  // primeiro (cada um espalha do closure já obsoleto).
  React.useEffect(() => {
    if (!onSheetUpdate) return;
    const companions = reconcileAnimalCompanionEffects(currentSheet);
    const base = companions
      ? { ...currentSheet, activeEffects: companions }
      : currentSheet;
    const auto = reconcileAutoPowerEffects(base);
    const nextEffects = auto ?? companions;
    // Terceiro reconciliador, mesma forma: ficha criada antes de a perda de
    // Carisma por poderes da Tormenta existir no motor do assistente (v4.30)
    // nunca recebeu o desconto, porque ABRIR uma ficha não dispara recálculo.
    // Um recálculo aqui aplica a regra; `applyTormentaAttributePenalty` grava o
    // ledger (mesmo vazio), então a condição não dispara de novo — não há como
    // descontar duas vezes.
    const needsTormentaBackfill = needsTormentaPenaltyBackfill(currentSheet);
    if (!nextEffects && !needsTormentaBackfill) return;
    applyRecalculatedSheet(
      nextEffects
        ? { ...currentSheet, activeEffects: nextEffects }
        : currentSheet
    );
  }, [currentSheet, onSheetUpdate, applyRecalculatedSheet]);

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

  // A aba visível é gravada aqui, e não no onChange, para cobrir também a troca
  // de ficha NO LUGAR (o mestre alternando entre jogadores): o valor que está
  // na tela passa a valer para a ficha nova, então um giro depois disso
  // restaura o que o usuário estava vendo, não uma entrada antiga.
  React.useEffect(() => {
    rememberSheetTab(currentSheet.id, activeTab);
  }, [currentSheet.id, activeTab]);

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

  // Diário: merge parcial de UMA chave, sem recálculo — igual às anotações. O
  // debounce fica do lado do diário, que grava com o diálogo aberto.
  const handleJournalSave = useCallback(
    (journal: PlayerJournal) => {
      handleSheetInfoUpdate({ journal });
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

  /**
   * Magia derivada (Usurpar) não vive em `sheet.spells` — sem este guard, o
   * `map` abaixo devolveria um array novo e idêntico e dispararia um save
   * inútil a cada interação.
   */
  const ownsSpell = useCallback(
    (spell: Spell) => !!currentSheet.spells?.some((s) => s.nome === spell.nome),
    [currentSheet.spells]
  );

  const handleSpellRollsUpdate = useCallback(
    (spell: Spell, newRolls: DiceRoll[]) => {
      if (!ownsSpell(spell)) return;
      const updatedSpells = currentSheet.spells?.map((s) =>
        s.nome === spell.nome ? { ...s, rolls: newRolls } : s
      );
      const updatedSheet = { ...currentSheet, spells: updatedSpells };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate, ownsSpell]
  );

  const handleToggleMemorized = useCallback(
    (spell: Spell) => {
      if (!ownsSpell(spell)) return;
      const updatedSpells = currentSheet.spells?.map((s) =>
        s.nome === spell.nome ? { ...s, memorized: !s.memorized } : s
      );
      const updatedSheet = { ...currentSheet, spells: updatedSpells };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate, ownsSpell]
  );

  const handleToggleAlwaysPrepared = useCallback(
    (spell: Spell) => {
      if (!ownsSpell(spell)) return;
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
    [currentSheet, onSheetUpdate, ownsSpell]
  );

  // Campos por-instância do poder (rolagens, efeitos, nome/texto customizados)
  // são cosméticos: gravam direto na ficha, sem `recalculateSheet`.
  const applyPowerPatch = useCallback(
    (power: SheetPower, patch: PowerUserPatch) => {
      const updatedSheet = updatePowerAcrossSheet(currentSheet, power, patch);
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePowerRollsUpdate = useCallback(
    (power: SheetPower, newRolls: DiceRoll[]) => {
      applyPowerPatch(power, { rolls: newRolls });
    },
    [applyPowerPatch]
  );

  const handlePowerCustomEffectsUpdate = useCallback(
    (power: SheetPower, newEffects: CustomEffect[]) => {
      applyPowerPatch(power, { customEffects: newEffects });
    },
    [applyPowerPatch]
  );

  const handlePowerDisplayUpdate = useCallback(
    (power: SheetPower, customName?: string, customDescription?: string) => {
      applyPowerPatch(power, { customName, customDescription });
    },
    [applyPowerPatch]
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

  /**
   * Aplica uma noite de descanso (Tormenta20, p. 106).
   *
   * A ordem importa: limpar efeitos ativos mexe nos máximos de PV/PM (os
   * efeitos injetam bônus no recálculo), então a recuperação só pode ser
   * calculada DEPOIS do `recalculateSheet` — do contrário o teto usaria um
   * máximo velho e a ficha estouraria. Por isso o recálculo é feito inline aqui
   * em vez de via `applyRecalculatedSheet`, que já despacharia a atualização.
   */
  const handleRest = useCallback(
    (config: RestConfirmConfig) => {
      const {
        clearActiveEffects,
        clearConditions,
        clearTemp,
        restingCompanionIndexes,
        condition,
        outdoors,
        selectedOptions,
      } = config;

      // 1. Limpeza. Efeitos removidos devolvem o PV/PM temporário que
      // concederam, mesma conta de `handleCleanupRemove`.
      const removedEffects = clearActiveEffects
        ? currentSheet.activeEffects ?? []
        : [];
      const removedTempPV = removedEffects.reduce(
        (sum, effect) => sum + (effect.grantsTempPV ?? 0),
        0
      );
      const removedTempPM = removedEffects.reduce(
        (sum, effect) => sum + (effect.grantsTempPM ?? 0),
        0
      );

      const cleaned: CharacterSheet = {
        ...currentSheet,
        activeEffects: clearActiveEffects
          ? []
          : currentSheet.activeEffects ?? [],
        activeConditions: clearConditions
          ? []
          : currentSheet.activeConditions ?? [],
        tempPV: clearTemp
          ? 0
          : Math.max(0, (currentSheet.tempPV ?? 0) - removedTempPV),
        tempPM: clearTemp
          ? 0
          : Math.max(0, (currentSheet.tempPM ?? 0) - removedTempPM),
      };

      // 2. Recálculo — máximos novos depois da limpeza.
      const recalculated = recalculateSheet(cleaned, currentSheet);
      if (recalculated.bag && !recalculated.bag.getEquipments) {
        recalculated.bag = Bag.fromStored(recalculated.bag);
      }

      // 3. Recuperação contra os máximos novos e o estado pós-limpeza.
      const maxPV = recalculated.pv ?? 0;
      const maxPM = recalculated.pm ?? 0;
      const recovery = calculateRestRecovery({
        level: recalculated.nivel,
        condition,
        outdoors,
        options: selectedOptions,
        currentPV: recalculated.currentPV ?? maxPV,
        maxPV,
        currentPM: recalculated.currentPM ?? maxPM,
        maxPM,
      });

      // 4. Aplicação, incluindo o Melhor Amigo do Treinador (só PV, nível do
      // treinador, construtos e mortos-vivos ignoram condições).
      //
      // O companheiro NÃO herda os modificadores pessoais do treinador — o
      // Rato das Ruas de um goblin é do goblin, não do bicho. Ele recebe só a
      // condição do descanso e os efeitos situacionais (`manual`), que são os
      // que descrevem o ambiente e os cuidados que o grupo recebeu.
      const situationalOptions = selectedOptions.filter(
        (option) => option.source === 'manual'
      );
      const companions = recalculated.companions
        ? recalculated.companions.map((companion, index) => {
            if (!restingCompanionIndexes.includes(index)) return companion;
            const companionMax = companion.pv ?? 0;
            const companionCurrent = companion.currentPV ?? companionMax;
            const companionRecovery = calculateRestRecovery({
              level: recalculated.nivel,
              condition,
              outdoors,
              options: isCompanionImmuneToRestConditions(
                companion.companionType
              )
                ? [
                    ...situationalOptions,
                    {
                      id: 'companion-immune',
                      label: '',
                      description: '',
                      effect: { type: 'ignoreConditions' },
                      source: 'auto',
                      defaultChecked: true,
                    },
                  ]
                : situationalOptions,
              currentPV: companionCurrent,
              maxPV: companionMax,
              currentPM: 0,
              maxPM: 0,
            });
            return {
              ...companion,
              currentPV: companionCurrent + companionRecovery.pv,
              tempPV: clearTemp ? 0 : companion.tempPV,
            };
          })
        : undefined;

      const finalSheet: CharacterSheet = {
        ...recalculated,
        currentPV: (recalculated.currentPV ?? maxPV) + recovery.pv,
        currentPM: (recalculated.currentPM ?? maxPM) + recovery.pm,
        ...(companions ? { companions } : {}),
      };

      setCurrentSheet(finalSheet);
      if (onSheetUpdate) {
        onSheetUpdate(finalSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSpellCast = useCallback(
    (pmSpent: number, spell: Spell, castLogged?: boolean) => {
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
          // Guardado para enriquecer o card da ativação (círculo, escola, PM).
          // `castLogged` diz se o diálogo de lançamento já publicou um card —
          // se publicou, descartar o efeito não deve publicar outro igual.
          setPendingSpellAbility(buildSpellAbilityMeta(spell, pmSpent));
          setPendingSpellCastLogged(Boolean(castLogged));
        }
      }
    },
    [currentSheet, onSheetUpdate, canUseActiveEffects]
  );

  // Fechar o diálogo de efeito sem confirmar não pode engolir o lançamento:
  // publica o card da magia sem a oferta de efeito — a menos que o diálogo de
  // lançamento já tenha publicado um (magia com dano).
  const handleSpellEffectDismiss = useCallback(() => {
    if (pendingSpellAbility && !pendingSpellCastLogged) {
      logExternalRoll(
        pendingSpellAbility.name,
        [],
        currentSheet.nome,
        pendingSpellAbility
      );
    }
    setSpellEffectDef(null);
    setPendingSpellAbility(null);
  }, [
    pendingSpellAbility,
    pendingSpellCastLogged,
    currentSheet.nome,
    logExternalRoll,
  ]);

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

  /**
   * Atributos com o modificador temporário já somado — a leitura canônica de
   * toda derivação (ver `functions/effectiveAttributes.ts`). É o que alimenta a
   * aba de Ataques inteira, a tabela de perícias e a CD de magia.
   *
   * `atributos` cru continua indo só para o `AttributeDisplay`, que mostra o
   * base e o delta separados, e para o drawer que edita o base.
   *
   * Memoizado porque `getEffectiveAttributes` devolve objeto novo a cada
   * chamada, e vários memos abaixo dependem da identidade dele.
   */
  const atributosEfetivos = useMemo(
    () => getEffectiveAttributes(currentSheet),
    [currentSheet]
  );

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

  // Note: weapons, armors and shields are already included in
  // `equipamentosOrdered` via the displayOrder traversal — no extra pushes
  // needed.

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
      // Mesmo ponto de escrita usado pelo reducer da Mochila: garante que os
      // guards de escudo, o split de pilha e a refusão valham nos dois
      // caminhos (antes daqui saía um `applyWielding` sem `lookup`).
      const next = commitWielding({
        equipments: bagEquipments,
        displayOrder: bag.displayOrder ?? [],
        state: {
          mainHandItemId: currentSheet.mainHandItemId,
          offHandItemId: currentSheet.offHandItemId,
        },
        itemId,
        slot,
        newId: uuidv4(),
      });
      const updatedSheet: CharacterSheet = {
        ...currentSheet,
        mainHandItemId: next.mainHandItemId,
        offHandItemId: next.offHandItemId,
      };
      // Só reconstrói a Bag quando a pilha foi dividida/refundida — trocar de
      // mão não deve invalidar a referência da mochila à toa.
      if (next.bagChanged) {
        updatedSheet.bag = new Bag(next.equipments, true, next.displayOrder);
      }
      // Run the full recalc (skipping PV/PM since wielding doesn't touch them).
      // Calling `calcDefense` directly here would compound bonuses: that
      // function sums equipment bonuses on top of `sheet.defesa`, which
      // already contains the previously-applied bonuses. Only the full
      // recalculate path resets defesa to its base before re-applying.
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

  /**
   * Grava a edição de perícia/atributos de uma arma feita direto na aba
   * Ataques. Dois destinos, porque há dois tipos de arma na lista:
   *
   * - arma VIRTUAL (Forma Selvagem): não está na mochila, então o override vai
   *   para o mapa da ficha, endereçado pela `overrideKey` estável;
   * - arma da mochila (incluindo as naturais de raça/poder): grava no próprio
   *   item.
   *
   * Sem `recalculateSheet`: nenhum desses campos alimenta `sheetBonuses`, e
   * eles são de propósito invisíveis para `hasManualEdits` — o baking
   * automático de bônus na arma continua valendo.
   */
  const handleWeaponSemanticsChange = useCallback(
    (weapon: Equipment, next: WeaponOverride) => {
      let updatedSheet: CharacterSheet;

      if (weapon.overrideKey) {
        updatedSheet = setWeaponOverride(
          currentSheet,
          weapon.overrideKey,
          next
        );
      } else if (weapon.id) {
        const nextArma = bagEquipments.Arma.map((item) =>
          item.id === weapon.id
            ? {
                ...item,
                customSkill: next.customSkill,
                attackAttribute: next.attackAttribute,
                damageAttribute: next.damageAttribute,
              }
            : item
        );
        updatedSheet = {
          ...currentSheet,
          bag: new Bag(
            { ...bagEquipments, Arma: nextArma },
            true,
            bag.displayOrder
          ),
        };
      } else {
        return;
      }

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) onSheetUpdate(updatedSheet);
    },
    [bag, bagEquipments, currentSheet, onSheetUpdate]
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

  // Níveis por classe — resolvem `{classLevel}` nos bônus de arma `LevelCalc`
  // (ex.: Instinto Selvagem escala com o nível de Bárbaro, não com o total).
  const classLevels = useMemo(
    () => getClassLevelsMap(currentSheet),
    [currentSheet]
  );

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
        // Armas naturais da Forma Selvagem vêm primeiro e são virtuais: não
        // estão na mochila, então somem sozinhas quando o druida reverte.
        weapons={[
          ...getWildShapeNaturalWeapons(currentSheet),
          ...getOrderedItemsByGroup(
            bag,
            (it) => it.group === 'Arma' && !it.isAmmo
          ),
        ]}
        completeSkills={completeSkills}
        atributos={atributosEfetivos}
        nivel={currentSheet.nivel}
        classLevels={classLevels}
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
        onWeaponSemanticsChange={
          onSheetUpdate ? handleWeaponSemanticsChange : undefined
        }
      />
    );
  }, [
    bag,
    bagEquipments,
    completeSkills,
    atributosEfetivos,
    nome,
    markersEnabled,
    conditionHighlights.attack,
    currentSheet.nivel,
    classLevels,
    currentSheet.sheetBonuses,
    currentSheet.mainHandItemId,
    currentSheet.offHandItemId,
    currentSheet.raca,
    currentSheet.activeEffects,
    currentSheet.weaponOverrides,
    onSheetUpdate,
    handleQuickWieldChange,
    handleWeaponSemanticsChange,
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
      // Efetivo, para o detalhamento casar com a Defesa que o motor calculou.
      const attrValue = atributosEfetivos[attrToUse]?.value || 0;
      if (attrValue !== 0) {
        const attrName = attrToUse.substring(0, 3).toUpperCase();
        components.push(`${attrValue} (${attrName})`);
      }
    }

    // Manual bonus
    if (currentSheet.bonusDefense && currentSheet.bonusDefense !== 0) {
      components.push(`${currentSheet.bonusDefense} (bônus manual)`);
    }

    // SheetBonuses targeting Defense (mods de equipamento como Guarda, poderes
    // de classe, condições, efeitos ativos...). O valor é resolvido pelo mesmo
    // `calculateBonusValue` que o recálculo usa, para que a fórmula exibida
    // feche com o total — modifiers de atributo/nível também entram.
    // Bônus com `condition` insatisfeita já foram removidos do array pelo
    // recálculo, então não é preciso reavaliá-los aqui.
    // Aggregate by source label so multiple bonuses from the same source
    // render as a single entry.
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
      if (s.type === 'activeEffect') return s.name;
      if (s.type === 'complication') return s.complicationName;
      return null;
    };
    const defenseBonusBySource = new Map<string, number>();
    currentSheet.sheetBonuses.forEach((b) => {
      if (b.target.type !== 'Defense') return;
      const label = labelForSource(b.source);
      if (!label) return;
      const value = calculateBonusValue(currentSheet, b.modifier, b.source);
      defenseBonusBySource.set(
        label,
        (defenseBonusBySource.get(label) ?? 0) + value
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
    atributosEfetivos,
    defesa,
  ]);

  // const uniqueGeneralPowers = filterUnique(generalPowers);
  // const uniqueClassPowers = filterUnique(classPowers);

  const effectiveKeyAttribute =
    classe.spellPath?.keyAttribute ??
    currentSheet.overrideKeyAttribute ??
    Atributo.SABEDORIA;
  // EFETIVO: a CD de magia é `10 + ½ nível + mod do atributo-chave`, e em RAW um
  // bônus temporário no atributo-chave (Mente Divina) SOBE a CD. Este era o
  // buraco principal do modelo antigo, que só cascateava nas perícias.
  const keyAttr = atributosEfetivos[effectiveKeyAttribute];

  /**
   * Usurpar (Usurpador): a classe não aprende magias, mas pode lançar qualquer
   * magia divina dos círculos acessíveis. A lista é DERIVADA aqui e nunca
   * gravada em `sheet.spells` — ver `derivedSpells.ts`.
   *
   * As deps são estreitas de propósito: `currentSheet` muda a cada tique de
   * PV/PM e recalcularia ~140 magias à toa. O que importa é o círculo e o tipo.
   */
  // O useMemo aqui é só para evitar a chamada; a estabilidade de referência (o
  // que realmente importa, porque o SpellsDisplay memoiza em cima da lista) vem
  // do cache por (tipo, círculo, suplementos) dentro de `getDerivedSpells`.
  // Por isso `currentSheet` pode entrar nas deps sem custo: a cada tique de
  // PV/PM o memo reexecuta, mas devolve exatamente a mesma referência.
  const derivedSpells = useMemo(
    () => getDerivedSpells(currentSheet, userSupplements),
    [currentSheet, userSupplements]
  );
  const isDerivedSpells = derivedSpells.length > 0;
  const displayedSpells = isDerivedSpells ? derivedSpells : spells;
  const derivedSpellsNotice = getDerivedSpellsNotice(currentSheet);
  // Teste de Enganação do Usurpar. `undefined` para todo mundo que não tem a
  // habilidade — aí o diálogo de conjuração se comporta como sempre.
  const usurparCastCheck = useMemo(
    () => buildUsurparCastCheck(currentSheet),
    [currentSheet]
  );

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

  // Ao vivo, não congelado no mount: a mesa virtual só parecia responsiva
  // porque o pai remontava o Result ao girar o tablet. Onde não há remount
  // (SheetViewPage, MainScreen) a ficha ficava presa no layout antigo.
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY, { noSsr: true });

  // Diário do Jogador. Enquanto a flag estiver desligada (ou faltar o
  // submódulo premium), a ficha mantém exatamente o botão e o diálogo de
  // anotações de sempre — o rollout é reversível sem redeploy, e o texto
  // original nunca sai de `sheet.notes`.
  const journalAccess = useFeatureAccess('playerJournal');
  const journalEnabled = journalAccess.hasAccess && PLAYER_JOURNAL_AVAILABLE;
  const journalNodeCount = countJournalNodes(currentSheet.journal);

  // No desktop Perícias e Diário vivem na coluna da direita, não nas abas.
  // Sem esta coerção, girar o tablet estando numa dessas abas deixaria o
  // desktop sem painel nenhum selecionado.
  const activeSheetTab: SheetTabValue =
    !isMobile && (activeTab === 'pericias' || activeTab === 'diario')
      ? 'ataques'
      : activeTab;

  const hasAnyRd =
    currentSheet.reducaoDeDano &&
    Object.values(currentSheet.reducaoDeDano).some((v) => v && v > 0);

  // `computedMovementTypes` é o manual mesclado com os bônus (ex.: voo da Forma
  // Sorrateira Superior); só existe quando há algum bônus ativo.
  const displayedMovementTypes =
    currentSheet.computedMovementTypes ?? currentSheet.movementTypes;

  const defenseInfoWidth = isMobile ? '100%' : '80%';

  return (
    <WildShapeSkin sheet={currentSheet}>
      {/*
       * Este fundo é opaco e cobre tudo que estiver abaixo — era ele que
       * apagava a superfície e a textura pintadas pelo WildShapeSkin, deixando
       * o re-skin praticamente invisível. Em forma selvagem ele sai da frente e
       * quem pinta o fundo é o skin, que é o único que sabe a cor da forma.
       */}
      <Box
        sx={{
          bgcolor: skinPaintsBackground
            ? 'transparent'
            : getSheetBackgroundColor(isDarkMode),
          p: isMobile ? 0 : 2,
        }}
      >
        <Container maxWidth='xl' sx={{ p: isMobile ? 0 : 2 }}>
          <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
            {/* LADO ESQUERDO, 60% */}
            <Box
              sx={{
                width: isMobile ? '100%' : '60%',
                // Item de flex tem `min-width: auto`: sem isto a coluna se
                // recusa a encolher abaixo do min-content e conteúdo largo
                // (a tabela de equipamentos) estoura por cima da coluna ao
                // lado em vez de se conter.
                minWidth: 0,
              }}
            >
              {/* PARTE DE CIMA: Informações da ficha */}
              <Card
                sx={{
                  p: isMobile ? 2 : 3,
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
                    <Tooltip title='Descansar'>
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
                        onClick={() => setRestDialogOpen(true)}
                      >
                        <BedtimeIcon />
                      </IconButton>
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
                <WildShapeBanner
                  sheet={currentSheet}
                  onRevert={onSheetUpdate ? handleRevertWildShape : undefined}
                />
                {/*
                 * `useFlexGap` é obrigatório aqui: sem ele o `spacing` do MUI
                 * compila para `margin-left: 16px` E o `gap` continua valendo,
                 * somando duas goteiras (no mobile eram 40px + 16px de sobra
                 * comidos da largura útil). Com ele, `spacing` vira `gap`.
                 * `justifyContent: center` só era perigoso enquanto o conteúdo
                 * transbordava (o começo do texto saía pela esquerda, fora do
                 * alcance do scroll); com os `minWidth: 0` abaixo ele volta a
                 * ser apenas o alinhamento pretendido.
                 */}
                <Stack
                  direction='row'
                  spacing={2}
                  useFlexGap
                  sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    rowGap: isMobile ? 3 : 0,
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
                  {/*
                   * `minWidth: 0` em toda a cadeia de itens de flex daqui até o
                   * texto: item de flex tem `min-width: auto`, então sem isto a
                   * coluna se recusa a encolher abaixo do min-content do nome e
                   * estoura o card. Mesmo mecanismo já corrigido nos controles
                   * de PV/PM logo abaixo.
                   */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      minWidth: 0,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Stack
                      direction='row'
                      spacing={0.5}
                      useFlexGap
                      sx={{
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        minWidth: 0,
                      }}
                    >
                      {markersEnabled && (
                        <ConditionMarker
                          conditions={conditionHighlights.name}
                          fontSize='medium'
                        />
                      )}
                      <Box
                        sx={{
                          minWidth: 0,
                          ...(markersEnabled
                            ? getConditionLabelStyle(conditionHighlights.name)
                            : {}),
                        }}
                      >
                        <LabelDisplay text={nome} size='large' />
                      </Box>
                      <Tooltip
                        title={
                          journalEnabled ? 'Diário do Jogador' : 'Anotações'
                        }
                      >
                        <IconButton
                          size='small'
                          onClick={() =>
                            journalEnabled
                              ? setJournalOpen(true)
                              : setNotesDialogOpen(true)
                          }
                          sx={{
                            color: (
                              journalEnabled
                                ? journalNodeCount > 0
                                : currentSheet.notes
                            )
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
                    <LabelDisplay
                      title='Nível'
                      text={`${nivel}`}
                      size='small'
                    />
                    {origin && (
                      <LabelDisplay
                        title='Origem'
                        text={origin.name || 'Não possui'}
                        size='small'
                      />
                    )}
                    {devoto && (
                      <LabelDisplay
                        title={
                          devoto.divindadeSecundaria
                            ? 'Devoção dupla'
                            : 'Divindade'
                        }
                        text={
                          getDevotionLabel(currentSheet) ||
                          devoto.divindade.name
                        }
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
                  {/*
                   * useFlexGap + flexWrap: em larguras intermediárias (a coluna
                   * estreita do jogador na mesa virtual, por exemplo) os dois
                   * stats quebram para linhas separadas em vez de transbordar.
                   * Sem useFlexGap a Stack espaça por margin e a quebra sai
                   * torta.
                   */}
                  <Stack
                    direction='row'
                    spacing={isMobile ? 1.5 : 3}
                    useFlexGap
                    sx={{
                      justifyContent: 'space-around',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      minWidth: 0,
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
                      compact={isMobile}
                      isManualMax={(currentSheet.manualMaxPV ?? 0) > 0}
                    />
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
                      compact={isMobile}
                      isManualMax={(currentSheet.manualMaxPM ?? 0) > 0}
                    />
                  </Stack>
                </Stack>
              </Card>

              <ActivePowerUseDialog
                open={spellEffectDef !== null && canUseActiveEffects}
                definition={spellEffectDef}
                sheet={currentSheet}
                onClose={handleSpellEffectDismiss}
                onConfirm={(option) => {
                  if (spellEffectDef) {
                    handleActiveEffectActivate(spellEffectDef, option, {
                      abilityBase: pendingSpellAbility ?? undefined,
                    });
                  }
                  setSpellEffectDef(null);
                  setPendingSpellAbility(null);
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
                standaloneEffects={currentSheet.customEffects ?? []}
                onStandaloneEffectsChange={handleStandaloneCustomEffectsChange}
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
                {onSheetUpdate && (
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      zIndex: 1,
                    }}
                  >
                    <Tooltip title='Modificadores temporários de atributo'>
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
                        onClick={() => setAttributeModifiersDrawerOpen(true)}
                      >
                        <TuneIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
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

              {/* Companheiros Animais do Druida (persistentes na ficha) */}
              {showAnimalCompanions && (
                <Box sx={{ mb: 4 }} ref={animalCompanionsRef}>
                  <AnimalCompanionsPanel
                    sheet={currentSheet}
                    onSheetUpdate={
                      onSheetUpdate ? applyRecalculatedSheet : undefined
                    }
                  />
                </Box>
              )}

              {/* Card com abas: Ataques / Defesa / Poderes / Magias / Equip. (+ Perícias no mobile) */}
              <Card
                sx={{
                  p: 3,
                  mb: 4,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <Stack
                  direction='row'
                  spacing={1}
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    zIndex: 1,
                  }}
                >
                  {/* Magias também acendem efeito ativo, então o gerenciador
                      precisa estar ao alcance nas duas abas. */}
                  {(activeSheetTab === 'poderes' ||
                    activeSheetTab === 'magias') &&
                    canUseActiveEffects &&
                    (() => {
                      const activeCount =
                        currentSheet.activeEffects?.length ?? 0;
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
                  {onSheetUpdate &&
                    // Já tem complicação → sempre gerenciável (inclusive para
                    // remover). Sem complicação → exige a feature liberada.
                    (!!currentSheet.complication ||
                      (complicationsFeature.hasAccess &&
                        userSupplements.includes(
                          SupplementId.TORMENTA20_HEROIS_ARTON
                        ))) && (
                      <Tooltip title='Complicação (Heróis de Arton)'>
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
                          onClick={() => setComplicationDrawerOpen(true)}
                        >
                          <TheaterComedyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  {onSheetUpdate &&
                    // Mesma regra da complicação: quem já tem idade na ficha
                    // continua podendo editá-la (e voltar para Jovem) mesmo sem
                    // acesso à feature.
                    (!!currentSheet.age ||
                      (optionalRulesFeature.hasAccess &&
                        userSupplements.includes(
                          SupplementId.TORMENTA20_HEROIS_ARTON
                        ))) && (
                      <Tooltip title='Idade (Heróis de Arton)'>
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
                          onClick={() => setAgeDrawerOpen(true)}
                        >
                          <HourglassBottomIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  {activeSheetTab === 'defesa' && onSheetUpdate && (
                    <Tooltip title='Configurações de defesa' arrow>
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
                        onClick={() => setDefenseDrawerOpen(true)}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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
                      onClick={() => {
                        if (activeSheetTab === 'pericias') {
                          setSkillsDrawerOpen(true);
                        } else if (activeSheetTab === 'ataques') {
                          setBackpackInitialFilter(['Arma']);
                          setBackpackOpen(true);
                        } else if (activeSheetTab === 'defesa') {
                          setBackpackInitialFilter(['Armadura', 'Escudo']);
                          setBackpackOpen(true);
                        } else if (activeSheetTab === 'poderes') {
                          setPowersDrawerOpen(true);
                        } else if (activeSheetTab === 'magias') {
                          setSpellsDrawerOpen(true);
                        } else if (activeSheetTab === 'diario') {
                          setJournalOpen(true);
                        } else {
                          setBackpackInitialFilter(undefined);
                          setBackpackOpen(true);
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Stack>
                <TabContext value={activeSheetTab}>
                  <TabList
                    onChange={onChangeTab}
                    variant='scrollable'
                    scrollButtons='auto'
                    allowScrollButtonsMobile
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    {isMobile && <Tab label='Perícias' value='pericias' />}
                    <Tab label='Ataques' value='ataques' />
                    <Tab label='Defesa' value='defesa' />
                    <Tab label='Poderes' value='poderes' />
                    <Tab label='Magias' value='magias' />
                    <Tab label='Equip.' value='equipamentos' />
                    {isMobile && journalEnabled && (
                      <Tab label='Diário' value='diario' />
                    )}
                  </TabList>
                  {isMobile && (
                    <TabPanel value='pericias' sx={{ p: 0 }}>
                      {periciasDiv}
                    </TabPanel>
                  )}
                  {isMobile && journalEnabled && (
                    <TabPanel value='diario' sx={{ p: 2 }}>
                      <PlayerJournalCard
                        journal={currentSheet.journal}
                        onOpen={() => setJournalOpen(true)}
                      />
                    </TabPanel>
                  )}
                  <TabPanel value='ataques' sx={{ p: 2 }}>
                    <BookTitle>Ataques</BookTitle>
                    {weaponsDiv}
                  </TabPanel>
                  <TabPanel value='defesa' sx={{ p: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                      {((markersEnabled &&
                        conditionHighlights.defense.length > 0) ||
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
                                color: hasAnyRd
                                  ? 'text.secondary'
                                  : 'text.disabled',
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
                                ? `RD: ${formatRdLabel(
                                    currentSheet.reducaoDeDano
                                  )}`
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
                            {(getActiveArmorPenalty(currentSheet) +
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
                  </TabPanel>
                  <TabPanel value='poderes' sx={{ p: 2 }}>
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
                        customGrantedPowers={
                          currentSheet.customGrantedPowers || []
                        }
                        className={classe.name}
                        raceName={raca.name}
                        deityName={devoto?.divindade?.name}
                        onUpdateRolls={
                          onSheetUpdate ? handlePowerRollsUpdate : undefined
                        }
                        onUpdateCustomEffects={
                          onSheetUpdate
                            ? handlePowerCustomEffectsUpdate
                            : undefined
                        }
                        onUpdateDisplay={
                          onSheetUpdate ? handlePowerDisplayUpdate : undefined
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
                        onAnimalCompanionClick={
                          showAnimalCompanions
                            ? scrollToAnimalCompanions
                            : undefined
                        }
                        powerActionSlots={{
                          Paródia: (
                            <Tooltip title='Buscar magia para parodiar' arrow>
                              <IconButton
                                size='small'
                                onClick={() => setParodyDialogOpen(true)}
                              >
                                <SearchIcon fontSize='small' color='primary' />
                              </IconButton>
                            </Tooltip>
                          ),
                          'Poder Capturado': (
                            <PoderCapturadoAction
                              sheet={currentSheet}
                              onConfigure={() =>
                                setPoderCapturadoDrawerOpen(true)
                              }
                              onActivate={
                                onSheetUpdate && canUseActiveEffects
                                  ? handleActiveEffectActivate
                                  : undefined
                              }
                              onSheetUpdate={onSheetUpdate}
                              characterName={nome}
                            />
                          ),
                        }}
                      />
                    </Box>
                  </TabPanel>
                  <TabPanel value='magias' sx={{ p: 2 }}>
                    <Box>
                      <BookTitle>Magias</BookTitle>
                      <Spells
                        spells={displayedSpells}
                        keyAttr={keyAttr}
                        selectedKeyAttribute={effectiveKeyAttribute}
                        nivel={nivel}
                        // Magia derivada não é da ficha: sem `onUpdateRolls` o
                        // diálogo esconde o editor persistente de rolagens e
                        // mantém só o override efêmero da conjuração.
                        onUpdateRolls={
                          onSheetUpdate && !isDerivedSpells
                            ? handleSpellRollsUpdate
                            : undefined
                        }
                        characterName={nome}
                        currentPM={currentSheet.currentPM ?? pm}
                        maxPM={pm}
                        tempPM={currentSheet.tempPM ?? 0}
                        onSpellCast={
                          onSheetUpdate ? handleSpellCast : undefined
                        }
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
                        getCircleWarning={(circle) =>
                          getDeitySpellCircleWarning(currentSheet, circle)
                        }
                        derived={isDerivedSpells}
                        derivedNotice={derivedSpellsNotice}
                        castCheck={usurparCastCheck}
                        sheet={currentSheet}
                        onActivateEffect={
                          onSheetUpdate && canUseActiveEffects
                            ? handleActiveEffectActivate
                            : undefined
                        }
                      />
                    </Box>
                  </TabPanel>
                  <TabPanel value='equipamentos' sx={{ p: 2 }}>
                    <Box>
                      <BookTitle>Equipamentos</BookTitle>
                      <EquipmentTable
                        items={equipamentosOrdered}
                        characterName={nome}
                      />
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
                      <CarryLoadSummary
                        usedSpaces={
                          bag.getSpaces() +
                          calculateCurrencySpaces(
                            dinheiro,
                            dinheiroTC,
                            dinheiroTO
                          )
                        }
                        currencySpaces={calculateCurrencySpaces(
                          dinheiro,
                          dinheiroTC,
                          dinheiroTO
                        )}
                        maxSpaces={customMaxSpaces ?? maxSpaces}
                        ignoresEncumbrance={sheetIgnoresEncumbrance}
                      />
                    </Box>
                  </TabPanel>
                </TabContext>
              </Card>

              {/* Card de Proficiências */}
              <Card
                sx={{ p: 2, mb: 4, position: 'relative', overflow: 'visible' }}
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

              {/* Card de Tamanho/Deslocamento */}
              <Card
                sx={{ p: 2, mb: 4, position: 'relative', overflow: 'visible' }}
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
                          {currentSheet.customDisplacement !== undefined && (
                            <ManualValueMarker title='Deslocamento definido manualmente' />
                          )}
                        </Stack>
                      </Box>
                    </FancyBox>
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
                        // Anão/Golem: a sobrecarga ainda é informação útil, mas
                        // o deslocamento não cai — não anunciar o -3m.
                        const tooltip = sheetIgnoresEncumbrance
                          ? `Sobrecarga: ${totalUsedSpaces.toFixed(
                              1
                            )}/${effectiveMaxSpaces} espaços (sua raça ignora a redução de deslocamento)`
                          : `Sobrecarga: ${totalUsedSpaces.toFixed(
                              1
                            )}/${effectiveMaxSpaces} espaços (-3m)`;
                        return (
                          <Tooltip title={tooltip}>
                            <Chip
                              size='small'
                              label='Sobrecarga'
                              color={
                                sheetIgnoresEncumbrance ? 'warning' : 'error'
                              }
                              sx={{ mt: 1, fontSize: '0.7rem' }}
                            />
                          </Tooltip>
                        );
                      }
                      return null;
                    })()}
                    {displayedMovementTypes && (
                      <Stack spacing={0} sx={{ mt: 0.5 }}>
                        {displayedMovementTypes.escalada &&
                          displayedMovementTypes.escalada > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Escalada: {displayedMovementTypes.escalada}m (
                              {Math.floor(
                                displayedMovementTypes.escalada / 1.5
                              )}
                              q)
                            </Typography>
                          )}
                        {displayedMovementTypes.escavar &&
                          displayedMovementTypes.escavar > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Escavar: {displayedMovementTypes.escavar}m (
                              {Math.floor(displayedMovementTypes.escavar / 1.5)}
                              q)
                            </Typography>
                          )}
                        {displayedMovementTypes.natacao &&
                          displayedMovementTypes.natacao > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Natação: {displayedMovementTypes.natacao}m (
                              {Math.floor(displayedMovementTypes.natacao / 1.5)}
                              q)
                            </Typography>
                          )}
                        {displayedMovementTypes.voo &&
                          displayedMovementTypes.voo > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              Voo: {displayedMovementTypes.voo}m (
                              {Math.floor(displayedMovementTypes.voo / 1.5)}
                              q)
                              {displayedMovementTypes.pairar ? ' (Pairar)' : ''}
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
                        <Stack
                          direction='row'
                          spacing={0.5}
                          sx={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <StatTitle>Tamanho</StatTitle>
                          {currentSheet.customSize !== undefined && (
                            <ManualValueMarker title='Tamanho definido manualmente' />
                          )}
                        </Stack>
                      </Box>
                    </FancyBox>
                  </Box>
                </Stack>
              </Card>
            </Box>
            {/* LADO DIREITO, 40% — apenas Perícias (no mobile vira aba) */}
            {!isMobile && (
              <Box
                sx={{
                  width: '40%',
                  minWidth: 0,
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
                  {journalEnabled && (
                    <PlayerJournalCard
                      journal={currentSheet.journal}
                      onOpen={() => setJournalOpen(true)}
                    />
                  )}
                </Stack>
              </Box>
            )}
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

          {/* Modificador temporário por atributo. Salva via
              `applyRecalculatedSheet` (e não `handleSheetInfoUpdate`) porque o
              campo muda derivados: perícias, Defesa, carga, CD de magia. */}
          <AttributeModifiersDrawer
            open={attributeModifiersDrawerOpen}
            onClose={() => setAttributeModifiersDrawerOpen(false)}
            sheet={currentSheet}
            onSave={applyRecalculatedSheet}
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

          <PowersEditorModal
            open={powersDrawerOpen}
            onClose={() => setPowersDrawerOpen(false)}
            sheet={currentSheet}
            onSave={handlePowersUpdate}
          />

          {onSheetUpdate && (
            <ComplicationEditDrawer
              open={complicationDrawerOpen}
              onClose={() => setComplicationDrawerOpen(false)}
              sheet={currentSheet}
              supplements={userSupplements}
              onSave={handlePowersUpdate}
            />
          )}

          {onSheetUpdate && (
            <AgeEditDrawer
              open={ageDrawerOpen}
              onClose={() => setAgeDrawerOpen(false)}
              sheet={currentSheet}
              onSave={handlePowersUpdate}
            />
          )}

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

          {onSheetUpdate && (
            <PoderCapturadoEditDrawer
              open={poderCapturadoDrawerOpen}
              onClose={() => setPoderCapturadoDrawerOpen(false)}
              sheet={currentSheet}
              onSave={(poderesCapturados) =>
                handleSheetInfoUpdate({ poderesCapturados })
              }
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
          <RestDialog
            open={restDialogOpen}
            onClose={() => setRestDialogOpen(false)}
            sheet={currentSheet}
            onConfirm={handleRest}
          />
          <NotesDialog
            open={notesDialogOpen}
            onClose={() => setNotesDialogOpen(false)}
            notes={currentSheet.notes || ''}
            onSave={handleNotesSave}
          />
          {journalEnabled && (
            <PlayerJournalFullScreen
              open={journalOpen}
              onClose={() => setJournalOpen(false)}
              characterName={currentSheet.nome}
              journal={currentSheet.journal}
              // Sem `onSheetUpdate` o diário abre em leitura, em vez de sumir:
              // ele é feito para ser LIDO durante a sessão, e fechá-lo na cara
              // de quem está consultando as anotações seria pior do que
              // desabilitar a edição. É por isso que ele NÃO entra no efeito
              // que fecha os drawers quando a edição cai.
              onSave={onSheetUpdate ? handleJournalSave : undefined}
            />
          )}
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
                  onSheetUpdate
                    ? () => setCompanionCreationOpen(true)
                    : undefined
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
      </Box>
    </WildShapeSkin>
  );
};

export default Result;
