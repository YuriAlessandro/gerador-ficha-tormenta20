import React from 'react';
import { Box, Typography } from '@mui/material';
import { DefenseEquipment } from '../interfaces/Equipment';

interface DefenseEquipmentProps {
  equipment: DefenseEquipment;
}

const DefenseItem: React.FC<DefenseEquipmentProps> = (props) => {
  const { equipment } = props;
  const { nome, defenseBonus, armorPenalty } = equipment;

  return (
    <Box sx={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
      <Typography fontSize={12}>
        {nome} +{defenseBonus} (-{armorPenalty} PA)
      </Typography>
    </Box>
  );
};

export default DefenseItem;
