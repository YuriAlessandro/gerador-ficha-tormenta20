import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import Origin from '@/interfaces/Origin';

interface OriginPowerStepProps {
  origin: Origin;
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const OriginPowerStep: React.FC<OriginPowerStepProps> = ({
  origin,
  selections: _selections,
  onChange: _onChange,
}) => (
  // Check if origin powers need manual selection
  // This is similar to class powers - we'll check if any origin powers
  // have sheetActions that require user input

  // For now, most origin powers don't require manual selection at level 1
  // This is a placeholder for future implementation
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant='body1' color='text.secondary'>
      Os poderes da origem {origin.name} não requerem seleção manual no nível 1.
    </Typography>
    <Alert severity='info'>Você pode continuar para o próximo passo.</Alert>

    {/* TODO: Implement origin power selection if needed */}
    {/* Similar to ClassPowerStep, check for powers with "pick" actions */}
  </Box>
);
export default OriginPowerStep;
