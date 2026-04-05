import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DefenseEquipment } from '../interfaces/Equipment';

interface DefenseEquipmentProps {
  equipment: DefenseEquipment;
}

const DefenseItem: React.FC<DefenseEquipmentProps> = (props) => {
  const { equipment } = props;
  const { nome, defenseBonus, armorPenalty } = equipment;

  return (
    <Box sx={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
      <Typography fontSize={14} sx={{ display: 'flex', alignItems: 'center' }}>
        {nome} +{defenseBonus} (-{armorPenalty} PA)
        {equipment.descricao && (
          <Tooltip title={equipment.descricao} arrow>
            <InfoOutlinedIcon
              sx={{
                fontSize: 14,
                ml: 0.5,
                color: 'text.secondary',
                cursor: 'help',
              }}
            />
          </Tooltip>
        )}
      </Typography>
    </Box>
  );
};

export default DefenseItem;
