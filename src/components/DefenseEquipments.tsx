import React from 'react';
import { DefenseEquipment } from '../interfaces/Equipment';
import DefenseItem from './DefenseItem';

interface DefenseEquipmentsProps {
  defenseEquipments: DefenseEquipment[];
  getKey: (eId: string) => string;
}

const DefenseEquipments: React.FC<DefenseEquipmentsProps> = (props) => {
  const { defenseEquipments, getKey } = props;
  const DefenseEquipmentsDiv = defenseEquipments.map((equip) => (
    <DefenseItem key={getKey(equip.nome)} equipment={equip} />
  ));

  return (
    <table>
      <thead>
        <tr>
          <th>Armadura & Escudo</th>
          <th>Bônus de Defesa</th>
          <th>Penalidada de Armadura</th>
          <th>Peso</th>
        </tr>
      </thead>
      <tbody>{DefenseEquipmentsDiv}</tbody>
    </table>
  );
};

export default DefenseEquipments;
