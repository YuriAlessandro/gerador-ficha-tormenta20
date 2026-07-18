import React from 'react';
import { Box, Chip } from '@mui/material';
import { itemTypeStyles } from '@/components/SheetResult/BackpackModal/itemTypeStyles';
import { MARKET_CATEGORIES, MarketCategoryKey } from './marketCategories';

interface CategoryChipsProps {
  active: MarketCategoryKey;
  /** Totais do catálogo. NÃO são sensíveis à busca — ver comentário no index. */
  counts: Record<string, number>;
  onChange: (key: MarketCategoryKey) => void;
}

const SCROLLER_SX = {
  display: 'flex',
  gap: 0.75,
  overflowX: 'auto',
  pb: 0.5,
  // Scrollbar fina, mesmo padrão do stepper do wizard
  '&::-webkit-scrollbar': { height: 4 },
  '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'divider' },
} as const;

const CHIP_SX = { flexShrink: 0 } as const;

const CategoryChips: React.FC<CategoryChipsProps> = ({
  active,
  counts,
  onChange,
}) => (
  <Box sx={SCROLLER_SX}>
    {MARKET_CATEGORIES.map((descriptor) => {
      const count = counts[descriptor.key] ?? 0;
      if (count === 0) return null;
      const Icon = itemTypeStyles[descriptor.group]?.icon;
      const isActive = descriptor.key === active;
      return (
        <Chip
          key={descriptor.key}
          label={`${descriptor.label} (${count})`}
          icon={Icon ? <Icon /> : undefined}
          size='small'
          sx={CHIP_SX}
          color={isActive ? 'primary' : 'default'}
          variant={isActive ? 'filled' : 'outlined'}
          onClick={() => onChange(descriptor.key)}
        />
      );
    })}
  </Box>
);

export default React.memo(CategoryChips);
