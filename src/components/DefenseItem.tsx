import React from 'react';
import { DefenseEquipment } from '../interfaces/Equipment';

interface DefenseEquipmentProps {
  equipment: DefenseEquipment;
}

const DefenseItem: React.FC<DefenseEquipmentProps> = (props) => {
  const { equipment } = props;
  const { nome, defenseBonus, armorPenalty, peso } = equipment;

  return (
    <tr>
      <td>{nome}</td>
      <td>{defenseBonus}</td>
      <td>-{armorPenalty}</td>
      <td>{peso}kg</td>
    </tr>
  );
};

export default DefenseItem;
