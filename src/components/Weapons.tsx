import React from 'react';
import { Box, Typography } from '@mui/material';
import Equipment from '../interfaces/Equipment';
import Weapon from './Weapon';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';

interface WeaponsProps {
  weapons: Equipment[];
  getKey: (eId: string) => string;
  rangeBonus: number;
  fightBonus: number;
  modFor: number;
  characterName?: string;
  attackConditions?: ActiveCondition[];
}

const Weapons: React.FC<WeaponsProps> = (props) => {
  const {
    weapons,
    getKey,
    rangeBonus,
    fightBonus,
    modFor,
    characterName,
    attackConditions,
  } = props;

  if (!weapons || weapons.length === 0) {
    return (
      <Box>
        <Typography>Nenhuma arma equipada.</Typography>
      </Box>
    );
  }

  const weaponsDiv = weapons.map((equip) => (
    <Weapon
      key={getKey(equip.nome)}
      equipment={equip}
      fightBonus={fightBonus}
      rangeBonus={rangeBonus}
      modDano={modFor}
      characterName={characterName}
      attackConditions={attackConditions}
    />
  ));

  return <Box>{weaponsDiv}</Box>;
};

export default Weapons;
