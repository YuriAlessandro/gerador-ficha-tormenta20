import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Equipment from '../interfaces/Equipment';
import { rollD20, rollDamage } from '../functions/diceRoller';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';

interface WeaponProps {
  equipment: Equipment;
  rangeBonus: number;
  fightBonus: number;
  modDano: number;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const { equipment, rangeBonus, fightBonus, modDano } = props;
  const { nome, dano, critico, alcance, atkBonus } = equipment;
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();

  const isRange = alcance && alcance !== '-';

  const modAtk = isRange ? rangeBonus : fightBonus;
  const atk = atkBonus ? atkBonus + modAtk : modAtk;

  const damageModifier = isRange ? 0 : modDano;
  const damage = `${dano}${
    isRange ? '' : `+${modDano >= 0 ? modDano : `-${Math.abs(modDano)}`}`
  }`;

  const handleWeaponClick = () => {
    const attackRoll = rollD20();
    const attackTotal = Math.max(1, attackRoll + atk);
    const isCritical = attackRoll === 20;
    const isFumble = attackRoll === 1;

    // Parsear e rolar dano
    const damageString = `${dano}+${damageModifier}`;
    const damageRollResult = rollDamage(damageString);

    if (!damageRollResult) {
      // Fallback se o parse falhar - não rola dano
      return;
    }

    // Format attack dice notation
    const atkModifierStr = atk >= 0 ? `+${atk}` : `${atk}`;
    const attackDiceNotation = `1d20${atkModifierStr}`;

    showDiceResult(nome, [
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
        label: 'Dano',
        diceNotation: damageRollResult.diceString,
        rolls: damageRollResult.diceRolls,
        modifier: damageRollResult.modifier,
        total: Math.max(1, damageRollResult.total),
      },
    ]);
  };

  return (
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
      <Typography fontSize={12}>
        {nome} {`${atk >= 0 ? '+' : ''}${atk}`} • {damage} • ({critico})
      </Typography>
    </Box>
  );
};

export default Weapon;
