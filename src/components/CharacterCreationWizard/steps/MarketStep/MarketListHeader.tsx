import React from 'react';
import { Box, Typography } from '@mui/material';
import { MarketCategoryDescriptor } from './marketCategories';

interface MarketListHeaderProps {
  descriptor: MarketCategoryDescriptor;
  gridTemplate: string;
}

const HEADER_CELL_SX = {
  fontWeight: 600,
  color: 'text.secondary',
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  letterSpacing: '0.04em',
} as const;

/**
 * Cabeçalho de colunas do desktop. Consome os MESMOS `descriptor.stats` e o
 * mesmo `gridTemplate` das linhas, então cabeçalho e células não têm como
 * divergir.
 */
const MarketListHeader: React.FC<MarketListHeaderProps> = ({
  descriptor,
  gridTemplate,
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: gridTemplate,
      alignItems: 'center',
      gap: 1,
      px: 1,
      py: 0.75,
      borderBottom: '2px solid',
      borderColor: 'divider',
      position: 'sticky',
      top: 0,
      zIndex: 1,
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant='caption' sx={HEADER_CELL_SX}>
      Item
    </Typography>
    {descriptor.stats.map((stat) => (
      <Typography
        key={stat.key}
        variant='caption'
        sx={{ ...HEADER_CELL_SX, textAlign: stat.align ?? 'left' }}
      >
        {stat.label}
      </Typography>
    ))}
    <Typography
      variant='caption'
      sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}
    >
      Preço
    </Typography>
    <Typography
      variant='caption'
      sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}
    >
      Ações
    </Typography>
  </Box>
);

export default React.memo(MarketListHeader);
