import React from 'react';
import { DefenseEquipment } from '../interfaces/Equipment';
import DefenseItem from './DefenseItem';

interface DefenseEquipmentsProps {
  defenseEquipments: DefenseEquipment[];
}

const DefenseEquipments: React.FC<DefenseEquipmentsProps> = (props) => {
  const { defenseEquipments } = props;
  const DefenseEquipmentsDiv = defenseEquipments.map((equip) => (
    <DefenseItem equipment={equip} />
  ));

  return (
    <table>
      <tr>
        <th>Armadura & Escudo</th>
        <th>Bônus de Defesa</th>
        <th>Penalidada de Armadura</th>
        <th>Peso</th>
      </tr>
      <tbody>{DefenseEquipmentsDiv}</tbody>
    </table>
  );
};

export default DefenseEquipments;
