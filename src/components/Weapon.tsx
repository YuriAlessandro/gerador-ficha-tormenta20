import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import Equipment from '../interfaces/Equipment';
import { rollD20, rollDamage } from '../functions/diceRoller';
import { AttackRollData } from './SheetResult/notifications/AttackRollNotification';

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
  const { enqueueSnackbar } = useSnackbar();

  const isRange = alcance && alcance !== '-';

  const modAtk = isRange ? rangeBonus : fightBonus;
  const atk = atkBonus ? atkBonus + modAtk : modAtk;

  const damageModifier = isRange ? 0 : modDano;
  const damage = `${dano}${
    isRange ? '' : `+${modDano >= 0 ? modDano : `-${Math.abs(modDano)}`}`
  }`;

  const handleWeaponClick = () => {
    const attackRoll = rollD20();
    const attackTotal = attackRoll + atk;

    // Parsear e rolar dano
    const damageString = `${dano}+${damageModifier}`;
    const damageRollResult = rollDamage(damageString);

    if (!damageRollResult) {
      // Fallback se o parse falhar - não rola dano
      return;
    }

    const rollData: AttackRollData = {
      weaponName: nome,
      attackRoll,
      attackBonus: atk,
      attackTotal,
      damageRolls: damageRollResult.diceRolls,
      damageModifier: damageRollResult.modifier,
      damageTotal: damageRollResult.total,
      diceString: damageRollResult.diceString,
    };

    enqueueSnackbar('', {
      variant: 'weaponAttack',
      roll: rollData,
    });
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
