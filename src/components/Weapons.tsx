import React from 'react';
import { Box } from '@mui/material';
import Equipment from '../interfaces/Equipment';
import Weapon from './Weapon';

interface WeaponsProps {
  weapons: Equipment[];
  getKey: (eId: string) => string;
  rangeBonus: number;
  fightBonus: number;
  modFor: number;
}

const Weapons: React.FC<WeaponsProps> = (props) => {
  const { weapons, getKey, rangeBonus, fightBonus, modFor } = props;
  const weaponsDiv = weapons.map((equip) => (
    <Weapon
      key={getKey(equip.nome)}
      equipment={equip}
      fightBonus={fightBonus}
      rangeBonus={rangeBonus}
      modDano={modFor}
    />
  ));

  return <Box>{weaponsDiv}</Box>;
};

export default Weapons;
