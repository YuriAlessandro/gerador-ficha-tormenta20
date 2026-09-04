import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Equipment, {
  AmmoType,
  DamageAttribute,
  WeaponAction,
  WeaponOverride,
} from '../interfaces/Equipment';
import type { SheetBonus } from '../interfaces/CharacterSheet';
import { AMMO_LABELS } from './SheetResult/BackpackModal/ammo';
import { parseCritical, parseDualModeDamage } from '../functions/diceRoller';
import { AttackExtraSpec } from '../functions/attackRoll';
import {
  getWeaponAttackSkillBonus,
  resolveDamageAttribute,
  getWeaponDisplayDamage,
  weaponAttributeModifier,
} from '../functions/weaponSkill';
import {
  stepUpDamage,
  addFlatDamageBonus,
} from '../functions/weaponDamageStep';
import {
  evaluateSimpleModifier,
  sumLiveWeaponBonuses,
  weaponMatchesScope,
  WeaponBonusScope,
} from '../functions/weaponBonusScope';
import { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';
import WeaponModeDialog from './WeaponModeDialog';
import WeaponAttributesDialog from './SheetResult/WeaponAttributesDialog';
import { ConditionMarker } from '../premium/components/Conditions';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';
import { getConditionLabelStyle } from '../premium/functions/conditionHighlights';
import { ACTIVE_EFFECT_COLOR } from '../premium/functions/activeEffectHighlights';
import WieldingControl from './SheetResult/BackpackModal/WieldingControl';
import {
  isTwoHanded as defaultIsTwoHanded,
  WieldingSlot,
} from './SheetResult/BackpackModal/wielding';
import { abbreviateDamageType } from '../functions/equipmentDisplay';

// Extracts the trailing flat damage modifier (e.g. "+5"/"-1") from a damage
// string. For dual-mode strings ("1d6+5/1d6+5") only the first mode is read —
// baked bonuses are identical across modes.
const extractFlatDamageBonus = (dano?: string): number => {
  if (!dano) return 0;
  const [firstMode] = dano.split('/');
  const match = firstMode.trim().match(/([+-]\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
};

interface WeaponProps {
  equipment: Equipment;
  completeSkills: CompleteSkill[] | undefined;
  atributos: CharacterAttributes;
  /** Nível total do personagem — usado pelos bônus de dano por modo baseados
   * em atributo limitado pelo nível (Arqueiro, Esgrimista). */
  nivel?: number;
  /** Map<className, classLevel> — resolve `{classLevel}` nos bônus `LevelCalc`
   * de fichas multiclasse (ex.: Instinto Selvagem usa o nível de Bárbaro, não o
   * total). Ausente = mono-classe, cai no nível total. */
  classLevels?: Map<string, number>;
  characterName?: string;
  attackConditions?: ActiveCondition[];
  sheetBonuses?: SheetBonus[];
  /** Current hand the weapon occupies, when wielding tracking is enabled. */
  wieldingSlot?: WieldingSlot;
  onWieldingChange?: (slot: WieldingSlot) => void;
  wieldingDisabledSlots?: Partial<Record<'main' | 'off', { reason: string }>>;
  /**
   * Mão escolhida pelo atalho "Empunhar e atacar". Calculada pelo pai, que é
   * quem conhece as duas mãos: sem isso este componente só sabia chutar
   * `'main'` e evictava a arma que já estava lá (Machado + Machadinha).
   * `null` = item não empunhável (armas naturais da Forma Selvagem).
   */
  defaultWieldSlot?: WieldingSlot;
  /**
   * True when at least one hand slot is currently occupied somewhere on the
   * sheet — used to decide whether to warn the player about attacking with an
   * unwielded weapon. Sheets with no hand assigned (legacy mode) skip the warn.
   */
  wieldingTrackingActive?: boolean;
  /** Current ammo units on the bag for this weapon's ammoType. */
  availableAmmo?: number;
  /**
   * Handler that decrements the bag's ammo stack by 1. When provided AND the
   * weapon has `ammoType`, an ammo prompt is opened before the attack roll.
   */
  onConsumeAmmo?: (ammoType: AmmoType) => void;
  /**
   * True when the character has the Hynne "Arremessador" racial ability. Adds
   * +1 damage step to ranged/thrown attacks (skill Pontaria) made with a sling
   * (Funda) or a thrown weapon. Melee modes and bows/crossbows are unaffected.
   */
  hasArremessador?: boolean;
  /**
   * Non-proficiency attack penalty (0 or -5). Applied to the displayed attack
   * bonus, action previews and attack rolls; the row gets a subtle warning
   * background (the explanatory legend is rendered once by Weapons.tsx).
   */
  proficiencyPenalty?: number;
  /**
   * Persiste a edição de perícia/atributos desta arma. Ausente = ícone de ajuste
   * escondido (ficha em modo leitura). É o único caminho de edição das armas
   * naturais da Forma Selvagem, que não aparecem na Mochila.
   */
  onSemanticsChange?: (next: WeaponOverride) => void;
}

interface RollContext {
  action?: WeaponAction;
  useTrigger: boolean;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const {
    equipment,
    completeSkills,
    atributos,
    nivel,
    classLevels,
    characterName,
    attackConditions,
    sheetBonuses,
    wieldingSlot = null,
    onWieldingChange,
    wieldingDisabledSlots,
    defaultWieldSlot = null,
    wieldingTrackingActive = false,
    availableAmmo,
    onConsumeAmmo,
    hasArremessador = false,
    proficiencyPenalty = 0,
    onSemanticsChange,
  } = props;
  const { nome, dano, critico, atkBonus, customSkill } = equipment;
  const displayName = equipment.customDisplayName?.trim() || nome;
  const theme = useTheme();
  const { showAttackRoll } = useDiceRoll();

  const baseModAtk = getWeaponAttackSkillBonus(
    equipment,
    completeSkills,
    atributos
  );

  // Sem proficiência: a row inteira ganha um fundo âmbar sutil; a legenda
  // explicativa é renderizada uma única vez pela lista (Weapons.tsx).
  const isNonProficient = proficiencyPenalty !== 0;

  // Modificador de dano de um atributo. Delega ao leitor único do motor para
  // que ficha, PDF e rolagem nunca divirjam.
  const damageModForAttribute = useCallback(
    (attr: DamageAttribute): number => weaponAttributeModifier(attr, atributos),
    [atributos]
  );

  // Hynne "Arremessador": +1 damage step on ranged/thrown attacks (skill
  // Pontaria) with a sling (Funda) or a thrown weapon. Melee modes (skill Luta)
  // and non-thrown ranged weapons (bows/crossbows) are excluded.
  const arremessadorStepBonus = useCallback(
    (action?: WeaponAction): number =>
      hasArremessador &&
      (equipment.arremesso || equipment.nome === 'Funda') &&
      action?.skill === 'Pontaria'
        ? 1
        : 0,
    [hasArremessador, equipment.arremesso, equipment.nome]
  );

  // Indica se o modo de ataque é o de arremesso de uma arma de arremesso
  // (perícia Pontaria numa arma `arremesso`). Bônus específicos de arremesso
  // (Estilo de Arremesso, Arremesso Potente) só valem nesse modo — nunca no
  // corpo a corpo das armas híbridas.
  const isThrownAction = useCallback(
    (action?: WeaponAction): boolean =>
      !!equipment.arremesso && action?.skill === 'Pontaria',
    [equipment.arremesso]
  );

  // Bônus de arma que NÃO foram bakeados em `dano`/`atkBonus` pelo
  // recalculateSheet e precisam ser somados ao vivo — bônus com escopo por modo
  // (arma híbrida de arremesso) e efeitos ativos sobre arma editada
  // manualmente. Ver `isLiveWeaponBonus`, que é o complemento exato do baking.
  const liveWeaponBonus = useCallback(
    (targetType: 'WeaponDamage' | 'WeaponAttack', action?: WeaponAction) =>
      sumLiveWeaponBonuses(equipment, sheetBonuses, targetType, {
        atributos,
        nivel: nivel ?? 1,
        classLevels,
        thrownMode: isThrownAction(action),
        isProficient: !isNonProficient,
      }),
    [
      sheetBonuses,
      equipment,
      isThrownAction,
      atributos,
      nivel,
      classLevels,
      isNonProficient,
    ]
  );

  const liveDamageBonus = useCallback(
    (action?: WeaponAction) => liveWeaponBonus('WeaponDamage', action),
    [liveWeaponBonus]
  );

  const liveAttackBonus = useCallback(
    (action?: WeaponAction) => liveWeaponBonus('WeaponAttack', action),
    [liveWeaponBonus]
  );

  // Ataque e dano da linha principal da arma. O modo de referência é o corpo a
  // corpo (mesma escolha de `getWeaponSkill`, que devolve Luta para arma de
  // arremesso), então os bônus vivos entram com `action` indefinida. Sem isso a
  // Fúria/Ataque Poderoso somem da ficha em toda arma de arremesso do catálogo.
  const baseAtk =
    (atkBonus ? atkBonus + baseModAtk : baseModAtk) +
    proficiencyPenalty +
    liveAttackBonus();

  // Arremesso Potente: pode usar Força em vez de Destreza no teste de ataque de
  // arremesso. O poder diz "você pode", então aplicamos só quando é vantajoso
  // (Força > Destreza).
  const strengthThrowDelta = useMemo(() => {
    const enabled = (sheetBonuses ?? []).some(
      (b) => b.target.type === 'ThrownAttackUseStrength'
    );
    if (!enabled) return 0;
    const forca = atributos['Força']?.value ?? 0;
    const destreza = atributos.Destreza?.value ?? 0;
    return Math.max(0, forca - destreza);
  }, [sheetBonuses, atributos]);

  // Flat damage bonus already baked into the weapon's main `dano` (from powers
  // and/or enchantments), derived as the delta over the clean base. Attack-mode
  // actions that override `dano` start from the raw dice and would otherwise
  // drop this bonus — we re-apply it so both the preview and the roll match what
  // the sheet shows for the main damage.
  const bakedFlatDamageBonus = useMemo(
    () =>
      extractFlatDamageBonus(dano) -
      extractFlatDamageBonus(equipment.baseDano ?? dano),
    [dano, equipment.baseDano]
  );

  // Preview helper used by the action picker dialog: computes the resolved
  // attack bonus and damage string for a given action (with all overrides
  // applied) so the player sees exactly what the chosen mode will roll.
  const computeActionPreview = useCallback(
    (action: WeaponAction) => {
      const skillMod = getWeaponAttackSkillBonus(
        equipment,
        completeSkills,
        atributos,
        action
      );
      const baseFromBonus = atkBonus ? atkBonus + skillMod : skillMod;
      const thrown = isThrownAction(action);
      const previewAtk =
        baseFromBonus +
        proficiencyPenalty +
        (action.atkBonusDelta ?? 0) +
        liveAttackBonus(action) +
        (thrown ? strengthThrowDelta : 0);

      const resolvedAttr = resolveDamageAttribute(equipment, action);
      const previewDamageMod =
        damageModForAttribute(resolvedAttr) + liveDamageBonus(action);

      const previewStepDelta =
        (action.damageStepDelta ?? 0) + arremessadorStepBonus(action);
      // Action `dano` overrides carry only raw dice; re-apply the weapon's baked
      // flat bonus so the preview matches the actual roll.
      const baseActionDano = action.dano
        ? addFlatDamageBonus(action.dano, bakedFlatDamageBonus)
        : dano ?? '';
      const previewDano =
        previewStepDelta !== 0
          ? stepUpDamage(baseActionDano, previewStepDelta)
          : baseActionDano;

      return {
        atk: previewAtk,
        damageMod: previewDamageMod,
        dano: previewDano,
        critico: action.critico ?? critico ?? '',
        attribute: resolvedAttr,
      };
    },
    [
      atkBonus,
      atributos,
      completeSkills,
      critico,
      damageModForAttribute,
      dano,
      equipment,
      arremessadorStepBonus,
      bakedFlatDamageBonus,
      isThrownAction,
      proficiencyPenalty,
      liveAttackBonus,
      liveDamageBonus,
      strengthThrowDelta,
    ]
  );

  const dualMode = useMemo(
    () => (dano ? parseDualModeDamage(dano) : null),
    [dano]
  );

  // Lista do tooltip ✨ da arma. Inclui poderes permanentes E efeitos ativos —
  // sem os efeitos ativos o jogador ativava a Fúria e não via nada na arma
  // mudar de origem, mesmo quando o bônus estava sendo aplicado.
  const bonusEffects = useMemo<{
    lines: string[];
    hasActiveEffect: boolean;
  }>(() => {
    const lines: string[] = [];
    // Bônus que casam com a arma mas estão desligados por falta de
    // proficiência: vão para o fim da lista, marcados, em vez de sumirem — o
    // jogador precisa saber por que o número não mudou.
    const inactiveLines: string[] = [];
    let hasActiveEffect = false;
    if (!sheetBonuses) return { lines, hasActiveEffect };

    sheetBonuses.forEach((b) => {
      if (b.source.type !== 'power' && b.source.type !== 'activeEffect') return;
      const sourceName = b.source.name;
      const isActiveEffect = b.source.type === 'activeEffect';
      const targetType = b.target.type;
      // Arremesso Potente: pode usar Força no ataque de arremesso.
      if (targetType === 'ThrownAttackUseStrength') {
        if (equipment.arremesso) {
          lines.push(`${sourceName}: pode usar Força no ataque (arremesso)`);
          hasActiveEffect = hasActiveEffect || isActiveEffect;
        }
        return;
      }
      if (
        targetType !== 'WeaponAttack' &&
        targetType !== 'WeaponDamage' &&
        targetType !== 'WeaponDamageStep' &&
        targetType !== 'WeaponThreatMargin' &&
        targetType !== 'WeaponCriticalMultiplier'
      ) {
        return;
      }
      // Casamento estático arma × escopo pela fonte única (weaponMatchesScope) —
      // cobre name/tags/categorias/melee/ranged/thrown/firing/leve-ágil/2-mãos.
      const scope = b.target as WeaponBonusScope & {
        proficiencyRequired?: boolean;
      };
      if (!weaponMatchesScope(equipment, scope)) {
        return;
      }
      // Bônus que exigem proficiência (Armas da Ambição, Armas da Destruição)
      // não são aplicados pelo recálculo numa arma em que o personagem não é
      // proficiente — o caso clássico é a pistola, que é arma de fogo.
      const requiresMissingProficiency = !!(
        scope.proficiencyRequired && isNonProficient
      );
      const value = evaluateSimpleModifier(b.modifier, atributos, nivel ?? 1, {
        classLevels,
        source: b.source,
      });
      // Penalidades existem (Ataque Poderoso: −2 no ataque), então o sinal sai
      // do valor — `+${value}` imprimia "+-2".
      const signed = value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
      // Sufixo de modo para armas híbridas de arremesso (o bônus vale só num dos
      // modos). Armas puras não recebem sufixo (o modo é único).
      let suffix = '';
      if (scope.thrownOnly) {
        suffix = ' (arremesso)';
      } else if (equipment.arremesso && scope.rangedOnly) {
        suffix = ' (arremesso)';
      } else if (equipment.arremesso && scope.meleeOnly) {
        suffix = ' (corpo a corpo)';
      }
      let line: string | null = null;
      if (targetType === 'WeaponAttack') {
        line = `${sourceName}: ${signed} no ataque${suffix}`;
      } else if (targetType === 'WeaponDamage') {
        line = `${sourceName}: ${signed} no dano${suffix}`;
      } else if (targetType === 'WeaponDamageStep') {
        line = `${sourceName}: ${signed} passo${
          Math.abs(value) > 1 ? 's' : ''
        } de dano`;
      } else if (targetType === 'WeaponThreatMargin') {
        line =
          b.target.mode === 'set'
            ? `${sourceName}: margem de ameaça ${value}`
            : `${sourceName}: ${signed} na margem de ameaça`;
      } else if (targetType === 'WeaponCriticalMultiplier') {
        line =
          b.target.mode === 'set'
            ? `${sourceName}: multiplicador de crítico x${value}`
            : `${sourceName}: ${signed} no multiplicador de crítico`;
      }
      if (!line) return;
      if (requiresMissingProficiency) {
        inactiveLines.push(`${line} (inativo: sem proficiência)`);
        return;
      }
      lines.push(line);
      hasActiveEffect = hasActiveEffect || isActiveEffect;
    });

    return { lines: [...lines, ...inactiveLines], hasActiveEffect };
  }, [sheetBonuses, equipment, atributos, nivel, classLevels, isNonProficient]);

  const damage = getWeaponDisplayDamage(
    equipment,
    atributos,
    liveDamageBonus()
  );

  const performWeaponRoll = useCallback(
    (selectedDano: string, ctx: RollContext) => {
      const { action, useTrigger } = ctx;

      // Perícia rolada e atributo do teste saem do mesmo ponto que a linha
      // exibida na ficha (`customSkill` > perícia do modo > regra de alcance,
      // com `attackAttribute` trocando só a parcela de atributo).
      const modAtk = getWeaponAttackSkillBonus(
        equipment,
        completeSkills,
        atributos,
        action
      );
      const baseAtkFromBonus = atkBonus ? atkBonus + modAtk : modAtk;
      const thrown = isThrownAction(action);
      const atk =
        baseAtkFromBonus +
        proficiencyPenalty +
        (action?.atkBonusDelta ?? 0) +
        liveAttackBonus(action) +
        (thrown ? strengthThrowDelta : 0);

      const resolvedAttr = resolveDamageAttribute(equipment, action);
      const localDamageMod =
        damageModForAttribute(resolvedAttr) + liveDamageBonus(action);

      // Apply step delta to the chosen dano string (if any), including the
      // Hynne "Arremessador" +1 step on ranged/thrown attacks.
      const stepDelta =
        (action?.damageStepDelta ?? 0) + arremessadorStepBonus(action);
      const adjustedDano =
        stepDelta !== 0 ? stepUpDamage(selectedDano, stepDelta) : selectedDano;

      const effectiveCritico = action?.critico ?? critico ?? '';

      const damageRollString =
        localDamageMod >= 0
          ? `${adjustedDano}+${localDamageMod}`
          : `${adjustedDano}${localDamageMod}`;

      const damageType = abbreviateDamageType(equipment.tipo);

      const extras: AttackExtraSpec[] = [];

      // Optional trigger extra damage (Lança de Fogo / Pistola-Punhal mecanismo).
      if (useTrigger && action?.trigger) {
        extras.push({
          kind: 'trigger',
          label: 'Mecanismo',
          dice: action.trigger.extraDamage,
          damageType,
        });
      }

      // Extra damage entries (user-added or derived from mods/encantamentos).
      // They roll once on hit and never crit (per Tormenta 20 rules for
      // elemental adds from enchantments).
      (equipment.extraDamage ?? []).forEach((extra) => {
        const labelSuffix = extra.sourceName ? ` (${extra.sourceName})` : '';
        extras.push({
          kind: 'extra',
          label: `Dano extra${labelSuffix}`,
          dice: extra.dice,
          damageType: abbreviateDamageType(extra.damageType),
        });
      });

      // A resolução (d20 vs margem, multiplicação dos dados em crítico e
      // rótulos) é do pipeline central — ver src/functions/attackRoll.ts.
      showAttackRoll({
        rollLabel: displayName,
        characterName,
        attackLabel: action ? `Ataque (${action.label})` : 'Ataque',
        attackBonus: atk,
        crit: parseCritical(effectiveCritico),
        damage: { dice: damageRollString, damageType },
        extras,
      });
    },
    [
      atributos,
      atkBonus,
      characterName,
      completeSkills,
      critico,
      damageModForAttribute,
      equipment,
      displayName,
      showAttackRoll,
      arremessadorStepBonus,
      isThrownAction,
      proficiencyPenalty,
      liveAttackBonus,
      liveDamageBonus,
      strengthThrowDelta,
    ]
  );

  // ---- State for the chained dialogs ----
  const [unwieldedDialogOpen, setUnwieldedDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [ammoDialogOpen, setAmmoDialogOpen] = useState(false);
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [attributesDialogOpen, setAttributesDialogOpen] = useState(false);
  const [stagedAction, setStagedAction] = useState<WeaponAction | null>(null);
  const [stagedUseTrigger, setStagedUseTrigger] = useState(false);

  const hasSpecialActions = Boolean(
    equipment.specialActions && equipment.specialActions.length > 0
  );

  const performAttackResolution = useCallback(
    (ctx: RollContext) => {
      // An action's `dano` override carries only the raw dice, so re-apply the
      // weapon's baked flat bonus; the main weapon `dano` already includes it.
      const actionDano = ctx.action?.dano
        ? addFlatDamageBonus(ctx.action.dano, bakedFlatDamageBonus)
        : dano;
      if (!actionDano || actionDano === '-') return;

      // Dual-mode (e.g. weapons with "1d8/1d10" in dano) still works inside an
      // action when the action doesn't override dano.
      if (!ctx.action?.dano && dualMode) {
        if (dualMode.isSameDamage) {
          performWeaponRoll(dualMode.options[0], ctx);
        } else {
          // Stash ctx so the dual-mode picker can use it.
          setStagedAction(ctx.action ?? null);
          setStagedUseTrigger(ctx.useTrigger);
          setModeDialogOpen(true);
        }
        return;
      }
      performWeaponRoll(actionDano, ctx);
    },
    [dano, dualMode, performWeaponRoll, bakedFlatDamageBonus]
  );

  // Should warn about unwielded weapon.
  const shouldWarnUnwielded =
    wieldingTrackingActive &&
    wieldingSlot === null &&
    Boolean(onWieldingChange);

  // Whether the resolved (post-action-pick) flow needs ammo prompt.
  const needsAmmoPromptForAction = useCallback(
    (action: WeaponAction | null) => {
      if (!equipment.ammoType || !onConsumeAmmo) return false;
      if (action?.skipAmmo) return false;
      return true;
    },
    [equipment.ammoType, onConsumeAmmo]
  );

  // Step 4: actually perform the attack now that all decisions are made.
  const finalizeAttack = useCallback(
    (action: WeaponAction | null, useTrigger: boolean) => {
      performAttackResolution({ action: action ?? undefined, useTrigger });
    },
    [performAttackResolution]
  );

  // Step 3: ammo decision — open dialog or skip.
  const proceedToAmmo = useCallback(
    (action: WeaponAction | null, useTrigger: boolean) => {
      if (needsAmmoPromptForAction(action)) {
        setStagedAction(action);
        setStagedUseTrigger(useTrigger);
        setAmmoDialogOpen(true);
        return;
      }
      finalizeAttack(action, useTrigger);
    },
    [finalizeAttack, needsAmmoPromptForAction]
  );

  // Step 2: trigger decision — only if the chosen action has a trigger.
  const proceedAfterActionPick = useCallback(
    (action: WeaponAction | null) => {
      if (action?.trigger) {
        setStagedAction(action);
        setTriggerDialogOpen(true);
        return;
      }
      proceedToAmmo(action, false);
    },
    [proceedToAmmo]
  );

  // Step 1: action picker — only if specialActions exist.
  const proceedAfterUnwielded = useCallback(() => {
    if (hasSpecialActions) {
      setActionDialogOpen(true);
      return;
    }
    proceedAfterActionPick(null);
  }, [hasSpecialActions, proceedAfterActionPick]);

  const handleWeaponClick = useCallback(() => {
    if (!dano || dano === '-') return;
    if (shouldWarnUnwielded) {
      setUnwieldedDialogOpen(true);
      return;
    }
    proceedAfterUnwielded();
  }, [dano, shouldWarnUnwielded, proceedAfterUnwielded]);

  const handleWieldAndAttack = useCallback(() => {
    // `defaultWieldSlot === null` = item não empunhável (arma natural da Forma
    // Selvagem): ataca sem gravar um id fantasma no slot da mão.
    if (onWieldingChange && defaultWieldSlot !== null) {
      onWieldingChange(defaultWieldSlot);
    }
    setUnwieldedDialogOpen(false);
    proceedAfterUnwielded();
  }, [defaultWieldSlot, onWieldingChange, proceedAfterUnwielded]);

  const handleAttackAnyway = useCallback(() => {
    setUnwieldedDialogOpen(false);
    proceedAfterUnwielded();
  }, [proceedAfterUnwielded]);

  const handleActionPick = useCallback(
    (action: WeaponAction) => {
      setActionDialogOpen(false);
      proceedAfterActionPick(action);
    },
    [proceedAfterActionPick]
  );

  const handleTriggerYes = useCallback(() => {
    setTriggerDialogOpen(false);
    const action = stagedAction;
    // Consume ammo for the trigger if specified.
    if (action?.trigger?.consumesAmmo && onConsumeAmmo) {
      onConsumeAmmo(action.trigger.consumesAmmo);
    }
    proceedToAmmo(action, true);
  }, [stagedAction, onConsumeAmmo, proceedToAmmo]);

  const handleTriggerNo = useCallback(() => {
    setTriggerDialogOpen(false);
    proceedToAmmo(stagedAction, false);
  }, [stagedAction, proceedToAmmo]);

  const handleRollWithoutAmmo = useCallback(() => {
    setAmmoDialogOpen(false);
    finalizeAttack(stagedAction, stagedUseTrigger);
  }, [finalizeAttack, stagedAction, stagedUseTrigger]);

  const handleConsumeAndRoll = useCallback(() => {
    setAmmoDialogOpen(false);
    if (equipment.ammoType && onConsumeAmmo) {
      onConsumeAmmo(equipment.ammoType);
    }
    finalizeAttack(stagedAction, stagedUseTrigger);
  }, [
    equipment.ammoType,
    onConsumeAmmo,
    finalizeAttack,
    stagedAction,
    stagedUseTrigger,
  ]);

  const handleModeSelect = useCallback(
    (selectedDamage: string) => {
      setModeDialogOpen(false);
      performWeaponRoll(selectedDamage, {
        action: stagedAction ?? undefined,
        useTrigger: stagedUseTrigger,
      });
    },
    [performWeaponRoll, stagedAction, stagedUseTrigger]
  );

  // Trigger ammo availability info for the trigger dialog message.
  const triggerAmmoLabel =
    stagedAction?.trigger?.consumesAmmo &&
    AMMO_LABELS[stagedAction.trigger.consumesAmmo];

  return (
    <>
      <Box
        sx={{
          borderBottom: '1px solid #ccc',
          padding: '4px 0',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          backgroundColor: isNonProficient
            ? alpha(theme.palette.warning.main, 0.12)
            : undefined,
          '&:hover': {
            backgroundColor: isNonProficient
              ? alpha(theme.palette.warning.main, 0.2)
              : theme.palette.action.hover,
            borderBottom: `1px solid ${theme.palette.primary.main}`,
          },
          '&:active': {
            transform: 'scale(0.99)',
          },
        }}
        onClick={handleWeaponClick}
        title={`Rolar ataque com ${displayName}`}
      >
        <Typography
          sx={{
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            ...getConditionLabelStyle(attackConditions),
          }}
        >
          <ConditionMarker conditions={attackConditions} fontSize='inherit' />
          {displayName}
          {bonusEffects.lines.length > 0 && (
            <Tooltip
              title={
                <Box>
                  {bonusEffects.lines.map((effect) => (
                    <Typography
                      key={effect}
                      variant='caption'
                      sx={{
                        display: 'block',
                      }}
                    >
                      {effect}
                    </Typography>
                  ))}
                </Box>
              }
              arrow
            >
              {/* Âmbar quando há efeito ativo em jogo — mesma cor usada em
                  Defesa e perícias sob efeito. */}
              <AutoAwesomeIcon
                sx={{
                  fontSize: 14,
                  ml: 0.5,
                  color: bonusEffects.hasActiveEffect
                    ? ACTIVE_EFFECT_COLOR
                    : theme.palette.primary.main,
                  cursor: 'help',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          )}
          {(equipment.modifications?.length ||
            equipment.enchantments?.length) && (
            <Tooltip
              title={
                <Box>
                  {!!equipment.modifications?.length && (
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                      }}
                    >
                      <strong>Modificações:</strong>{' '}
                      {equipment.modifications.map((m) => m.mod).join(', ')}
                    </Typography>
                  )}
                  {!!equipment.enchantments?.length && (
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                      }}
                    >
                      <strong>Encantamentos:</strong>{' '}
                      {equipment.enchantments
                        .map((e) => e.enchantment)
                        .join(', ')}
                    </Typography>
                  )}
                </Box>
              }
              arrow
            >
              <AutoFixHighIcon
                sx={{
                  fontSize: 14,
                  ml: 0.5,
                  color: theme.palette.secondary.main,
                  cursor: 'help',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          )}
          {customSkill && ` (${customSkill})`}{' '}
          {`${baseAtk >= 0 ? '+' : ''}${baseAtk}`} • {damage} • ({critico})
          {equipment.tipo && equipment.tipo !== '-' && ` • ${equipment.tipo}`}
          {(equipment.extraDamage ?? []).map((extra) => (
            <Box
              key={extra.id ?? `${extra.dice}-${extra.damageType}`}
              component='span'
              sx={{ color: 'text.secondary', fontSize: '0.85em', ml: 0.5 }}
            >
              {' '}
              + {extra.dice} {extra.damageType}
            </Box>
          ))}
          {wieldingSlot === 'main' && ' · 🤚 Principal'}
          {wieldingSlot === 'off' && ' · ✋ Secundária'}
          {wieldingSlot === 'both' && ' · 🤝 Duas mãos'}
          {(onWieldingChange || onSemanticsChange) && (
            <Box
              sx={{
                ml: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {onWieldingChange && (
                <WieldingControl
                  item={equipment}
                  currentSlot={wieldingSlot}
                  onChange={onWieldingChange}
                  disabledSlots={wieldingDisabledSlots}
                />
              )}
              {onSemanticsChange && (
                <Tooltip title='Ajustar perícia e atributos de ataque/dano'>
                  <IconButton
                    size='small'
                    aria-label='Ajustar perícia e atributos de ataque e dano'
                    onClick={() => setAttributesDialogOpen(true)}
                    sx={{
                      // No desktop o ícone fica discreto até o hover da linha;
                      // no mobile não há hover, então ele é sempre visível e
                      // com alvo de toque cheio.
                      opacity: { xs: 1, md: 0.35 },
                      minWidth: 40,
                      minHeight: 40,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <TuneIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
          {equipment.descricao && (
            <Tooltip title={equipment.descricao} arrow>
              <InfoOutlinedIcon
                sx={{
                  fontSize: 14,
                  ml: 0.5,
                  color: 'text.secondary',
                  cursor: 'help',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          )}
        </Typography>
        {equipment.ammoType && (
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              ml: 2,
              color:
                (availableAmmo ?? 0) === 0 ? 'error.main' : 'text.secondary',
            }}
          >
            🎯 {AMMO_LABELS[equipment.ammoType]}: {availableAmmo ?? 0}
            {(availableAmmo ?? 0) === 0 && ' (sem munição)'}
          </Typography>
        )}
      </Box>
      {onSemanticsChange && (
        <WeaponAttributesDialog
          open={attributesDialogOpen}
          onClose={() => setAttributesDialogOpen(false)}
          weapon={equipment}
          onSave={onSemanticsChange}
        />
      )}
      {dualMode && !dualMode.isSameDamage && (
        <WeaponModeDialog
          open={modeDialogOpen}
          onClose={() => setModeDialogOpen(false)}
          weaponName={displayName}
          damageOptions={dualMode.options}
          onSelect={handleModeSelect}
        />
      )}
      {/* 1) Unwielded warning */}
      <Dialog
        open={unwieldedDialogOpen}
        onClose={() => setUnwieldedDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Arma não empunhada</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{displayName}</strong> não está empunhada. O que deseja
            fazer?
            {defaultIsTwoHanded(equipment) && (
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mt: 1,
                }}
              >
                Empunhar esta arma vai ocupar as duas mãos.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Button onClick={() => setUnwieldedDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAttackAnyway} color='warning'>
            Atacar mesmo assim
          </Button>
          <Button
            onClick={handleWieldAndAttack}
            variant='contained'
            color='primary'
          >
            Empunhar e atacar
          </Button>
        </DialogActions>
      </Dialog>
      {/* 2) Action picker (specialActions) */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Como atacar com {displayName}?</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {(equipment.specialActions ?? []).map((action) => {
              const preview = computeActionPreview(action);
              const atkStr =
                preview.atk >= 0 ? `+${preview.atk}` : `${preview.atk}`;
              let damageModStrPreview = '';
              if (preview.damageMod > 0) {
                damageModStrPreview = `+${preview.damageMod}`;
              } else if (preview.damageMod < 0) {
                damageModStrPreview = `${preview.damageMod}`;
              }
              const damageStr = `${preview.dano}${damageModStrPreview}`;
              return (
                <Button
                  key={action.id}
                  variant='contained'
                  color='primary'
                  onClick={() => handleActionPick(action)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.25,
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant='button' sx={{ display: 'block' }}>
                      {action.label}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        textTransform: 'none',
                        opacity: 0.95,
                        mt: 0.25,
                      }}
                    >
                      Atk {atkStr} • Dano {damageStr} • ({preview.critico})
                      {preview.attribute !== 'Nenhum' &&
                        preview.damageMod !== 0 &&
                        ` • ${preview.attribute}`}
                    </Typography>
                    {action.description && (
                      <Typography
                        variant='caption'
                        sx={{
                          display: 'block',
                          textTransform: 'none',
                          opacity: 0.75,
                          mt: 0.25,
                        }}
                      >
                        {action.description}
                      </Typography>
                    )}
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
      {/* 3) Trigger (mecanismo) confirmation */}
      <Dialog
        open={triggerDialogOpen}
        onClose={() => setTriggerDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Acionar mecanismo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {stagedAction?.trigger?.label}
            {triggerAmmoLabel && (
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mt: 1,
                }}
              >
                Você tem {availableAmmo ?? 0} {triggerAmmoLabel} disponível.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Button onClick={() => setTriggerDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleTriggerNo}>Não acionar</Button>
          <Button
            onClick={handleTriggerYes}
            variant='contained'
            color='primary'
            disabled={Boolean(
              stagedAction?.trigger?.consumesAmmo && (availableAmmo ?? 0) <= 0
            )}
          >
            Acionar
          </Button>
        </DialogActions>
      </Dialog>
      {/* 4) Ammo prompt */}
      <Dialog
        open={ammoDialogOpen}
        onClose={() => setAmmoDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Munição</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {equipment.ammoType && (
              <>
                Você tem <strong>{availableAmmo ?? 0}</strong>{' '}
                {AMMO_LABELS[equipment.ammoType]} disponível. Como deseja
                resolver o ataque?
              </>
            )}
            {(availableAmmo ?? 0) === 0 && (
              <Typography
                variant='caption'
                color='error'
                sx={{ display: 'block', mt: 1, fontWeight: 600 }}
              >
                Sem munição. Você só pode atacar sem consumir (improvisado).
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Button onClick={() => setAmmoDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleRollWithoutAmmo} color='warning'>
            Rolar sem consumir
          </Button>
          <Button
            onClick={handleConsumeAndRoll}
            variant='contained'
            color='primary'
            disabled={(availableAmmo ?? 0) <= 0}
          >
            Rolar consumindo munição
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Weapon;
