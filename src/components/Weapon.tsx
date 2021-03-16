import React from 'react';
import Equipment from '../interfaces/Equipment';

interface WeaponProps {
  equipment: Equipment;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const { equipment } = props;
  const { nome, dano, critico, tipo, alcance, peso } = equipment;

  return (
    <tr>
      <td>{nome}</td>
      <td>{dano}</td>
      <td>{critico}</td>
      <td>{tipo}</td>
      <td>{alcance || '-'}</td>
      <td>{peso ? `${peso}kg` : '-'}</td>
    </tr>
  );
};

export default Weapon;
