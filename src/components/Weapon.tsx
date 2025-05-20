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
  const { nome, dano, critico, tipo, alcance, spaces, atkBonus } = equipment;

  const isRange = alcance && alcance !== '-';

  const modAtk = isRange ? rangeBonus : fightBonus;
  const atk = atkBonus ? atkBonus + modAtk : modAtk;

  return (
    <tr>
      <td>
        {nome} {`${atk >= 0 ? '+' : ''}${atk}`}
      </td>
      <td>
        {dano}
        {isRange ? '' : `${modDano >= 0 ? `+${modDano}` : `${modDano}`}`}
        {/* {!isRange && `+${}`} */}
      </td>
      <td>{critico}</td>
      <td>{tipo}</td>
      <td>{alcance || '-'}</td>
      <td>{spaces ? `${spaces} espaço${spaces === 1 ? '' : 's'}` : '-'}</td>
    </tr>
  );
};

export default Weapon;
