import React from 'react';
import { DefenseEquipment } from '../interfaces/Equipment';

interface DefenseEquipmentProps {
  equipment: DefenseEquipment;
}

const DefenseItem: React.FC<DefenseEquipmentProps> = (props) => {
  const { equipment } = props;
  const { nome, defenseBonus, armorPenalty, spaces } = equipment;

  return (
    <tr>
      <td>{nome}</td>
      <td>{defenseBonus}</td>
      <td>{armorPenalty > 0 ? `-${armorPenalty}` : '-'}</td>
      <td>
        {spaces || ''} {spaces && spaces > 1 ? 'espaços' : 'espaço'}
      </td>
    </tr>
  );
};

export default DefenseItem;
