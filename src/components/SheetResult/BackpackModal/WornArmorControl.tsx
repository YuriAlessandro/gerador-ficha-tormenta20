import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Checkroom as ArmorIcon } from '@mui/icons-material';

import Equipment from '../../../interfaces/Equipment';

export interface WornArmorControlProps {
  item: Equipment;
  isWorn: boolean;
  onChange: (worn: boolean) => void;
  size?: 'small' | 'medium';
}

const WornArmorControl: React.FC<WornArmorControlProps> = ({
  item,
  isWorn,
  onChange,
  size = 'small',
}) => {
  if (item.group !== 'Armadura') return null;

  return (
    <Tooltip
      title={
        isWorn
          ? 'Vestindo. Clique para tirar.'
          : 'Não vestida. Clique para vestir.'
      }
    >
      <IconButton
        size={size}
        color={isWorn ? 'primary' : 'inherit'}
        onClick={() => onChange(!isWorn)}
        aria-label={isWorn ? 'Tirar armadura' : 'Vestir armadura'}
      >
        <ArmorIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
};

export default WornArmorControl;
