import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Equipment, {
  AmmoType,
  DamageAttribute,
  WeaponAction,
} from '../interfaces/Equipment';
import { Atributo } from '../data/systems/tormenta20/atributos';
import type { SheetBonus } from '../interfaces/CharacterSheet';
import { AMMO_LABELS } from './SheetResult/BackpackModal/ammo';
import {
  rollD20,
  rollDamage,
  rollCriticalDamage,
  parseCritical,
  parseDualModeDamage,
} from '../functions/diceRoller';
import {
  getWeaponSkill,
  getSkillAttackBonus,
  isWeaponMelee,
  resolveDamageAttribute,
} from '../functions/weaponSkill';
import { stepUpDamage } from '../functions/weaponDamageStep';
import Skill, { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';
import WeaponModeDialog from './WeaponModeDialog';
import { ConditionMarker } from '../premium/components/Conditions';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';
import { getConditionLabelStyle } from '../premium/functions/conditionHighlights';
import WieldingControl from './SheetResult/BackpackModal/WieldingControl';
import {
  isTwoHanded as defaultIsTwoHanded,
  WieldingSlot,
} from './SheetResult/BackpackModal/wielding';

// Abbreviate damage type for display
const abbreviateDamageType = (tipo?: string): string | undefined => {
  if (!tipo || tipo === '-') return undefined;
  const abbrevMap: Record<string, string> = {
    Perfuração: 'Perf.',
    Corte: 'Corte',
    Impacto: 'Impacto',
    Contusão: 'Contusão',
    Fogo: 'Fogo',
    Frio: 'Frio',
    Eletricidade: 'Eletr.',
    Ácido: 'Ácido',
    Essência: 'Essência',
    'Energia negativa': 'Negativa',
    'Energia positiva': 'Positiva',
    Psíquico: 'Psíquico',
    Trovão: 'Trovão',
    Luz: 'Luz',
    Trevas: 'Trevas',
  };
  return abbrevMap[tipo] || tipo;
};

interface WeaponProps {
  equipment: Equipment;
  completeSkills: CompleteSkill[] | undefined;
  atributos: CharacterAttributes;
  modDano: number;
  characterName?: string;
  attackConditions?: ActiveCondition[];
  sheetBonuses?: SheetBonus[];
  /** Current hand the weapon occupies, when wielding tracking is enabled. */
  wieldingSlot?: WieldingSlot;
  onWieldingChange?: (slot: WieldingSlot) => void;
  wieldingDisabledSlots?: Partial<Record<'main' | 'off', { reason: string }>>;
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
    modDano,
    characterName,
    attackConditions,
    sheetBonuses,
    wieldingSlot = null,
    onWieldingChange,
    wieldingDisabledSlots,
    wieldingTrackingActive = false,
    availableAmmo,
    onConsumeAmmo,
  } = props;
  const { nome, dano, critico, atkBonus, customSkill } = equipment;
  const displayName = equipment.customDisplayName?.trim() || nome;
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();

  const baseWeaponSkill = getWeaponSkill(equipment);
  const baseModAtk = getSkillAttackBonus(
    baseWeaponSkill,
    completeSkills,
    atributos
  );
  const baseAtk = atkBonus ? atkBonus + baseModAtk : baseModAtk;

  const isMelee = isWeaponMelee(equipment);
  // Resolve the damage modifier given an attribute choice. 'Nenhum' adds 0.
  // Otherwise, returns `atributos[attr].value`. Falls back to `modDano`
  // (Força) when the attribute lookup fails for any reason.
  const damageModForAttribute = useCallback(
    (attr: DamageAttribute): number => {
      if (attr === 'Nenhum') return 0;
      const atributoKey = attr as Atributo;
      const value = atributos[atributoKey]?.value;
      return typeof value === 'number' ? value : modDano;
    },
    [atributos, modDano]
  );

  // Resolve the default-display damage attribute for the main weapon row
  // (without any specific action picked).
  const baseDamageAttribute = resolveDamageAttribute(equipment);
  const damageModifier = damageModForAttribute(baseDamageAttribute);
  const damageModStr =
    damageModifier >= 0 ? `+${damageModifier}` : `${damageModifier}`;

  // Preview helper used by the action picker dialog: computes the resolved
  // attack bonus and damage string for a given action (with all overrides
  // applied) so the player sees exactly what the chosen mode will roll.
  const computeActionPreview = useCallback(
    (action: WeaponAction) => {
      let previewSkill: Skill;
      if (customSkill) {
        previewSkill = customSkill;
      } else if (action.skill === 'Luta') {
        previewSkill = Skill.LUTA;
      } else if (action.skill === 'Pontaria') {
        previewSkill = Skill.PONTARIA;
      } else {
        previewSkill = baseWeaponSkill;
      }
      const skillMod = getSkillAttackBonus(
        previewSkill,
        completeSkills,
        atributos
      );
      const baseFromBonus = atkBonus ? atkBonus + skillMod : skillMod;
      const previewAtk = baseFromBonus + (action.atkBonusDelta ?? 0);

      const resolvedAttr = resolveDamageAttribute(equipment, action);
      const previewDamageMod = damageModForAttribute(resolvedAttr);

      const previewDano =
        action.damageStepDelta && action.damageStepDelta !== 0
          ? stepUpDamage(action.dano ?? dano ?? '', action.damageStepDelta)
          : action.dano ?? dano ?? '';

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
      baseWeaponSkill,
      completeSkills,
      critico,
      customSkill,
      damageModForAttribute,
      dano,
      equipment,
    ]
  );

  const dualMode = useMemo(
    () => (dano ? parseDualModeDamage(dano) : null),
    [dano]
  );

  const powerBonusEffects = useMemo<string[]>(() => {
    if (!sheetBonuses) return [];
    const effects: string[] = [];
    sheetBonuses.forEach((b) => {
      if (b.source.type !== 'power') return;
      const targetType = b.target.type;
      if (
        targetType !== 'WeaponAttack' &&
        targetType !== 'WeaponDamage' &&
        targetType !== 'WeaponDamageStep'
      ) {
        return;
      }
      const matchesName =
        'weaponName' in b.target && b.target.weaponName === nome;
      const matchesTag =
        'weaponTags' in b.target &&
        b.target.weaponTags &&
        b.target.weaponTags.length > 0 &&
        (equipment.weaponTags || []).some((t) =>
          (b.target as { weaponTags?: string[] }).weaponTags?.includes(t)
        );
      if (!matchesName && !matchesTag) return;
      const value =
        b.modifier.type === 'Fixed'
          ? (b.modifier as { value: number }).value
          : 0;
      if (targetType === 'WeaponAttack') {
        effects.push(`${b.source.name}: +${value} no ataque`);
      } else if (targetType === 'WeaponDamage') {
        effects.push(`${b.source.name}: +${value} no dano`);
      } else if (targetType === 'WeaponDamageStep') {
        effects.push(
          `${b.source.name}: +${value} passo${value > 1 ? 's' : ''} de dano`
        );
      }
    });
    return effects;
  }, [sheetBonuses, nome, equipment.weaponTags]);

  const damage = !isMelee || dualMode ? dano : `${dano}${damageModStr}`;

  const performWeaponRoll = useCallback(
    (selectedDano: string, ctx: RollContext) => {
      const { action, useTrigger } = ctx;

      // Skill / atk bonus resolution: action.skill overrides; customSkill still
      // wins; otherwise default rule. The melee Força mod only applies to Luta.
      let resolvedSkill: Skill | undefined;
      if (customSkill) {
        resolvedSkill = customSkill;
      } else if (action?.skill === 'Luta') {
        resolvedSkill = Skill.LUTA;
      } else if (action?.skill === 'Pontaria') {
        resolvedSkill = Skill.PONTARIA;
      } else {
        resolvedSkill = baseWeaponSkill;
      }
      const modAtk = getSkillAttackBonus(
        resolvedSkill,
        completeSkills,
        atributos
      );
      const baseAtkFromBonus = atkBonus ? atkBonus + modAtk : modAtk;
      const atk = baseAtkFromBonus + (action?.atkBonusDelta ?? 0);

      const resolvedAttr = resolveDamageAttribute(equipment, action);
      const localDamageMod = damageModForAttribute(resolvedAttr);

      // Apply step delta to the chosen dano string (if any).
      const adjustedDano =
        action?.damageStepDelta && action.damageStepDelta !== 0
          ? stepUpDamage(selectedDano, action.damageStepDelta)
          : selectedDano;

      const effectiveCritico = action?.critico ?? critico ?? '';

      const attackRoll = rollD20();
      const attackTotal = Math.max(1, attackRoll + atk);

      const { threshold, multiplier } = parseCritical(effectiveCritico);
      const isCritical = attackRoll >= threshold;
      const isFumble = attackRoll === 1;

      const damageRollString =
        localDamageMod >= 0
          ? `${adjustedDano}+${localDamageMod}`
          : `${adjustedDano}${localDamageMod}`;

      const normalRoll = rollDamage(damageRollString);
      if (!normalRoll) return;

      const normalDamage = Math.max(1, normalRoll.total);

      const damageRollResult = isCritical
        ? rollCriticalDamage(damageRollString, multiplier)
        : normalRoll;
      if (!damageRollResult) return;

      const finalDamage = Math.max(1, damageRollResult.total);

      const atkModifierStr = atk >= 0 ? `+${atk}` : `${atk}`;
      const attackDiceNotation = `1d20${atkModifierStr}`;

      const damageLabel = isCritical
        ? `Dano x${multiplier} (normal: ${normalDamage})`
        : 'Dano';

      const damageType = abbreviateDamageType(equipment.tipo);

      // Optional trigger extra damage (Lança de Fogo / Pistola-Punhal mecanismo).
      const triggerExtra =
        useTrigger && action?.trigger
          ? rollDamage(action.trigger.extraDamage)
          : null;

      const rolls = [
        {
          label: action ? `Ataque (${action.label})` : 'Ataque',
          diceNotation: attackDiceNotation,
          rolls: [attackRoll],
          modifier: atk,
          total: attackTotal,
          isCritical,
          isFumble,
        },
        {
          label: damageLabel,
          diceNotation: damageRollResult.diceString,
          rolls: damageRollResult.diceRolls,
          modifier: damageRollResult.modifier,
          total: finalDamage,
          damageType,
        },
      ];

      if (triggerExtra && action?.trigger) {
        const hit = !isFumble && attackTotal > 0;
        const triggerLabel = hit
          ? 'Mecanismo (acertou — somar ao dano)'
          : 'Mecanismo (errou — não soma)';
        rolls.push({
          label: triggerLabel,
          diceNotation: triggerExtra.diceString,
          rolls: triggerExtra.diceRolls,
          modifier: triggerExtra.modifier,
          total: Math.max(1, triggerExtra.total),
          damageType,
        });
      }

      // Extra damage entries (user-added or derived from mods/encantamentos).
      // They roll once on hit and never crit (per Tormenta 20 rules for
      // elemental adds from enchantments).
      (equipment.extraDamage ?? []).forEach((extra) => {
        const extraRoll = rollDamage(extra.dice);
        if (!extraRoll) return;
        const labelSuffix = extra.sourceName ? ` (${extra.sourceName})` : '';
        rolls.push({
          label: `Dano extra${labelSuffix}`,
          diceNotation: extraRoll.diceString,
          rolls: extraRoll.diceRolls,
          modifier: extraRoll.modifier,
          total: Math.max(1, extraRoll.total),
          damageType: abbreviateDamageType(extra.damageType),
        });
      });

      showDiceResult(displayName, rolls, characterName);
    },
    [
      atributos,
      atkBonus,
      baseWeaponSkill,
      characterName,
      completeSkills,
      critico,
      customSkill,
      damageModForAttribute,
      equipment,
      displayName,
      showDiceResult,
    ]
  );

  // ---- State for the chained dialogs ----
  const [unwieldedDialogOpen, setUnwieldedDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [ammoDialogOpen, setAmmoDialogOpen] = useState(false);
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [stagedAction, setStagedAction] = useState<WeaponAction | null>(null);
  const [stagedUseTrigger, setStagedUseTrigger] = useState(false);

  const hasSpecialActions = Boolean(
    equipment.specialActions && equipment.specialActions.length > 0
  );

  const performAttackResolution = useCallback(
    (ctx: RollContext) => {
      const actionDano = ctx.action?.dano ?? dano;
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
    [dano, dualMode, performWeaponRoll]
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
    if (!onWieldingChange) {
      setUnwieldedDialogOpen(false);
      proceedAfterUnwielded();
      return;
    }
    const slot: WieldingSlot = defaultIsTwoHanded(equipment) ? 'both' : 'main';
    onWieldingChange(slot);
    setUnwieldedDialogOpen(false);
    proceedAfterUnwielded();
  }, [equipment, onWieldingChange, proceedAfterUnwielded]);

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
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
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
          fontSize={16}
          sx={{
            display: 'flex',
            alignItems: 'center',
            ...getConditionLabelStyle(attackConditions),
          }}
        >
          <ConditionMarker conditions={attackConditions} fontSize='inherit' />
          {displayName}
          {powerBonusEffects.length > 0 && (
            <Tooltip
              title={
                <Box>
                  {powerBonusEffects.map((effect) => (
                    <Typography key={effect} variant='caption' display='block'>
                      {effect}
                    </Typography>
                  ))}
                </Box>
              }
              arrow
            >
              <AutoAwesomeIcon
                sx={{
                  fontSize: 14,
                  ml: 0.5,
                  color: theme.palette.primary.main,
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
                    <Typography variant='caption' display='block'>
                      <strong>Modificações:</strong>{' '}
                      {equipment.modifications.map((m) => m.mod).join(', ')}
                    </Typography>
                  )}
                  {!!equipment.enchantments?.length && (
                    <Typography variant='caption' display='block'>
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
          {onWieldingChange && (
            <Box
              sx={{ ml: 'auto', display: 'inline-flex' }}
              onClick={(e) => e.stopPropagation()}
            >
              <WieldingControl
                item={equipment}
                currentSlot={wieldingSlot}
                onChange={onWieldingChange}
                disabledSlots={wieldingDisabledSlots}
              />
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
                color='text.secondary'
                sx={{ display: 'block', mt: 1 }}
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
                color='text.secondary'
                sx={{ display: 'block', mt: 1 }}
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
