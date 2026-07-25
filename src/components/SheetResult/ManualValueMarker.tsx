import React from 'react';
import { Box, Tooltip } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';

interface ManualValueMarkerProps {
  title?: string;
}

/**
 * Marca discreta de "valor definido manualmente". Substitui o Chip laranja
 * "Manual", que roubava atenção do próprio valor e ainda somava altura ao card.
 * Fica colado no número que foi sobrescrito, com a explicação no tooltip.
 */
const ManualValueMarker: React.FC<ManualValueMarkerProps> = ({
  title = 'Valor definido manualmente',
}) => (
  <Tooltip title={title}>
    <Box
      component='span'
      aria-label={title}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        ml: 0.25,
        cursor: 'help',
      }}
    >
      <TuneIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
    </Box>
  </Tooltip>
);

export default ManualValueMarker;
