import React from 'react';
import { Box, Typography } from '@mui/material';
import Equipment from '../interfaces/Equipment';
import Weapon from './Weapon';

interface WeaponsProps {
  weapons: Equipment[];
  getKey: (eId: string) => string;
  rangeBonus: number;
  fightBonus: number;
  modFor: number;
  characterName?: string;
}

const Weapons: React.FC<WeaponsProps> = (props) => {
  const { weapons, getKey, rangeBonus, fightBonus, modFor, characterName } =
    props;

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
    />
  ));

  return <Box>{weaponsDiv}</Box>;
};

export default Weapons;
