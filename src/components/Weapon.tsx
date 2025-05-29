import React from 'react';
import { Box, Typography } from '@mui/material';
import Equipment from '../interfaces/Equipment';

interface WeaponProps {
  equipment: Equipment;
  rangeBonus: number;
  fightBonus: number;
  modDano: number;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const { equipment, rangeBonus, fightBonus, modDano } = props;
  const { nome, dano, critico, alcance, atkBonus } = equipment;

  const isRange = alcance && alcance !== '-';

  const modAtk = isRange ? rangeBonus : fightBonus;
  const atk = atkBonus ? atkBonus + modAtk : modAtk;

  const damage = `${dano}${
    isRange ? '' : `+${modDano >= 0 ? modDano : `-${Math.abs(modDano)}`}`
  }`;

  return (
    <Box sx={{ borderBottom: '1px solid #ccc', padding: '4px 0' }}>
      <Typography fontSize={12}>
        {nome} {`${atk >= 0 ? '+' : ''}${atk}`} • {damage} • ({critico})
      </Typography>
    </Box>
  );
};

export default Weapon;
