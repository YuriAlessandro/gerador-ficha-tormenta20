import React, { useState, useCallback, useMemo } from 'react';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Equipment from '../interfaces/Equipment';
import type { SheetBonus } from '../interfaces/CharacterSheet';
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
} from '../functions/weaponSkill';
import { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';
import WeaponModeDialog from './WeaponModeDialog';
import { ConditionMarker } from '../premium/components/Conditions';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';
import { getConditionLabelStyle } from '../premium/functions/conditionHighlights';

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
  } = props;
  const { nome, dano, critico, atkBonus, customSkill } = equipment;
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();
  const [modeDialogOpen, setModeDialogOpen] = useState(false);

  const weaponSkill = getWeaponSkill(equipment);
  const modAtk = getSkillAttackBonus(weaponSkill, completeSkills, atributos);
  const atk = atkBonus ? atkBonus + modAtk : modAtk;

  const isMelee = isWeaponMelee(equipment);
  const damageModifier = isMelee ? modDano : 0;
  const damageModStr =
    damageModifier >= 0 ? `+${damageModifier}` : `${damageModifier}`;

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
    (selectedDano: string) => {
      const attackRoll = rollD20();
      const attackTotal = Math.max(1, attackRoll + atk);

      const { threshold, multiplier } = parseCritical(critico || '');
      const isCritical = attackRoll >= threshold;
      const isFumble = attackRoll === 1;

      const damageRollString =
        damageModifier >= 0
          ? `${selectedDano}+${damageModifier}`
          : `${selectedDano}${damageModifier}`;

      // Rola dano normal para referência (criaturas imunes a crítico)
      const normalRoll = rollDamage(damageRollString);
      if (!normalRoll) {
        return;
      }

      const normalDamage = Math.max(1, normalRoll.total);

      // Se crítico, rola dados multiplicados (ex: 1d8 x2 = 2d8)
      const damageRollResult = isCritical
        ? rollCriticalDamage(damageRollString, multiplier)
        : normalRoll;

      if (!damageRollResult) {
        return;
      }

      const finalDamage = Math.max(1, damageRollResult.total);

      const atkModifierStr = atk >= 0 ? `+${atk}` : `${atk}`;
      const attackDiceNotation = `1d20${atkModifierStr}`;

      const damageLabel = isCritical
        ? `Dano x${multiplier} (normal: ${normalDamage})`
        : 'Dano';

      const damageType = abbreviateDamageType(equipment.tipo);

      showDiceResult(
        nome,
        [
          {
            label: 'Ataque',
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
        ],
        characterName
      );
    },
    [
      atk,
      critico,
      damageModifier,
      equipment.tipo,
      nome,
      showDiceResult,
      characterName,
    ]
  );

  const handleWeaponClick = useCallback(() => {
    if (!dano || dano === '-') return;

    if (dualMode) {
      if (dualMode.isSameDamage) {
        performWeaponRoll(dualMode.options[0]);
      } else {
        setModeDialogOpen(true);
      }
    } else {
      performWeaponRoll(dano);
    }
  }, [dano, dualMode, performWeaponRoll]);

  const handleModeSelect = useCallback(
    (selectedDamage: string) => {
      setModeDialogOpen(false);
      performWeaponRoll(selectedDamage);
    },
    [performWeaponRoll]
  );

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
        title={`Rolar ataque com ${nome}`}
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
          {nome}
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
          {customSkill && ` (${customSkill})`} {`${atk >= 0 ? '+' : ''}${atk}`}{' '}
          • {damage} • ({critico})
          {equipment.tipo && equipment.tipo !== '-' && ` • ${equipment.tipo}`}
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
      </Box>
      {dualMode && !dualMode.isSameDamage && (
        <WeaponModeDialog
          open={modeDialogOpen}
          onClose={() => setModeDialogOpen(false)}
          weaponName={nome}
          damageOptions={dualMode.options}
          onSelect={handleModeSelect}
        />
      )}
    </>
  );
};

export default Weapon;
