import React from 'react';
import Equipment from '../interfaces/Equipment';
import Weapon from './Weapon';

interface WeaponsProps {
  weapons: Equipment[];
}

const Weapons: React.FC<WeaponsProps> = (props) => {
  const { weapons } = props;
  const weaponsDiv = weapons.map((equip) => <Weapon equipment={equip} />);

  return (
    <table>
      <tr>
        <th>Ataques</th>
        <th>Dano</th>
        <th>Crítico</th>
        <th>Tipo</th>
        <th>Alcance</th>
        <th>Peso</th>
      </tr>
      <tbody>{weaponsDiv}</tbody>
    </table>
  );
};

export default Weapons;
