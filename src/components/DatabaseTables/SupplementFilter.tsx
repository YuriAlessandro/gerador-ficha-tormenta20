import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
} from '../../types/supplement.types';

interface SupplementFilterProps {
  selectedSupplements: SupplementId[];
  availableSupplements: SupplementId[];
  onToggleSupplement: (supplementId: SupplementId) => void;
}

const SupplementFilter: React.FC<SupplementFilterProps> = ({
  selectedSupplements,
  availableSupplements,
  onToggleSupplement,
}) => (
  <Box sx={{ mb: 3, textAlign: 'center' }}>
    <Typography
      variant='body2'
      color='text.secondary'
      sx={{ mb: 1, fontFamily: 'Tfont, serif' }}
    >
      Filtrar por Suplemento:
    </Typography>
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {availableSupplements.map((supplementId) => {
        const metadata = SUPPLEMENT_METADATA[supplementId];
        if (!metadata) return null;

        const isSelected = selectedSupplements.includes(supplementId);

        return (
          <Chip
            key={supplementId}
            label={metadata.name}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
            onClick={() => onToggleSupplement(supplementId)}
            sx={{
              fontFamily: 'Tfont, serif',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: isSelected
                  ? 'primary.dark'
                  : 'rgba(209, 50, 53, 0.08)',
              },
            }}
          />
        );
      })}
    </Box>
  </Box>
);

export default SupplementFilter;
