import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Equipment from '../interfaces/Equipment';
import {
  rollD20,
  rollDamage,
  parseCritical,
  parseDualModeDamage,
} from '../functions/diceRoller';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';
import WeaponModeDialog from './WeaponModeDialog';

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
  rangeBonus: number;
  fightBonus: number;
  modDano: number;
  characterName?: string;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const { equipment, rangeBonus, fightBonus, modDano, characterName } = props;
  const { nome, dano, critico, alcance, atkBonus } = equipment;
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();
  const [modeDialogOpen, setModeDialogOpen] = useState(false);

  const isRange = alcance && alcance !== '-';

  const modAtk = isRange ? rangeBonus : fightBonus;
  const atk = atkBonus ? atkBonus + modAtk : modAtk;

  const damageModifier = isRange ? 0 : modDano;
  const damageModStr =
    damageModifier >= 0 ? `+${damageModifier}` : `${damageModifier}`;

  const dualMode = useMemo(
    () => (dano ? parseDualModeDamage(dano) : null),
    [dano]
  );

  const damage = isRange || dualMode ? dano : `${dano}${damageModStr}`;

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
      const damageRollResult = rollDamage(damageRollString);

      if (!damageRollResult) {
        return;
      }

      const diceTotal = damageRollResult.diceRolls.reduce(
        (sum, r) => sum + r,
        0
      );
      const normalDamage = Math.max(1, diceTotal + damageRollResult.modifier);
      const criticalDamage = Math.max(
        1,
        diceTotal * multiplier + damageRollResult.modifier
      );
      const finalDamage = isCritical ? criticalDamage : normalDamage;

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
        <Typography fontSize={16}>
          {nome} {`${atk >= 0 ? '+' : ''}${atk}`} • {damage} • ({critico})
          {equipment.tipo && equipment.tipo !== '-' && ` • ${equipment.tipo}`}
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
