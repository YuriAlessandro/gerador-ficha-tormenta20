import React from 'react';
import { Box, Typography } from '@mui/material';
import { DefenseEquipment } from '../interfaces/Equipment';
import DefenseItem from './DefenseItem';

interface DefenseEquipmentsProps {
  defenseEquipments: DefenseEquipment[];
  getKey: (eId: string) => string;
}

const DefenseEquipments: React.FC<DefenseEquipmentsProps> = (props) => {
  const { defenseEquipments, getKey } = props;
  const DefenseEquipmentsDiv =
    defenseEquipments.length > 0 ? (
      defenseEquipments.map((equip) => (
        <DefenseItem key={getKey(equip.nome)} equipment={equip} />
      ))
    ) : (
      <Typography>Nenhum equipamento defensivo.</Typography>
    );

  return <Box>{DefenseEquipmentsDiv}</Box>;
};

export default DefenseEquipments;
