import React from 'react';
import Equipment from '../interfaces/Equipment';
import Weapon from './Weapon';

interface WeaponsProps {
  weapons: Equipment[];
  getKey: (eId: string) => string;
}

const Weapons: React.FC<WeaponsProps> = (props) => {
  const { weapons, getKey } = props;
  const weaponsDiv = weapons.map((equip) => (
    <Weapon key={getKey(equip.nome)} equipment={equip} />
  ));

  return (
    <table>
      <thead>
        <tr>
          <th>Ataques</th>
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
