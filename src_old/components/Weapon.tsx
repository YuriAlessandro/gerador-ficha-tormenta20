import React from 'react';
import Equipment from '../interfaces/Equipment';

interface WeaponProps {
  equipment: Equipment;
  rangeBonus: number;
  fightBonus: number;
  modDano: number;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const { equipment, rangeBonus, fightBonus, modDano } = props;
  const { nome, dano, critico, tipo, alcance, peso } = equipment;

  const isRange = alcance && alcance !== '-';

  const modAtk = isRange ? rangeBonus : fightBonus;

  return (
    <tr>
      <td>
        {nome} {`${modAtk > 0 ? '+' : ''}${modAtk}`}
      </td>
      <td>
        {dano}
        {isRange ? '' : `${modDano > 0 ? `+${modDano}` : ''}`}
      </td>
      <td>{critico}</td>
      <td>{tipo}</td>
      <td>{alcance || '-'}</td>
      <td>{peso ? `${peso}kg` : '-'}</td>
    </tr>
  );
};

export default Weapon;
