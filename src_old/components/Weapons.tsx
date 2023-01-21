import React from 'react';
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

  return (
    <table>
      <thead>
        <tr>
          <th>
            Ataques <span id='bnsAtk'>(+Bônus de Ataque)</span>
          </th>
          <th>Dano</th>
          <th>Crítico</th>
          <th>Tipo</th>
          <th>Alcance</th>
          <th>Peso</th>
        </tr>
      </thead>
      <tbody>{weaponsDiv}</tbody>
    </table>
  );
};

export default Weapons;
